import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, afterTwist, canDepart, hintLink, pointsFor, served, solved, stuck, validateLevels } from '../data/levels'
import { hasEdge, hops, key, pathOf, strandedPath } from '../data/graph'
import { BENCH, DEPTH, GO, H, HUD, MAP, STATION, TRAY, W } from '../data/layout'
import { C } from '../data/theme'
import type { Edge, LevelDef, Mode, PhaseDef, Station } from '../types'
import { createCity, type City } from './city'
import { createNetwork, type Network } from './network'
import { createStation, type StationView } from './station'
import { createRider, type RiderView } from './rider'
import { createTray, type Tray } from './tray'
import { createRunner, type Runner, type Trip } from './run'
import { createTalk, type Talk } from './talk'
import { createCoach, type Coach } from './coach'
import { createDiagram, type Diagram } from './diagram'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'metro-mirim'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS TRÊS ATOS
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   1. CONVERSA    os passageiros chegam, falam e mostram o destino (`talk`)
 *   2. CONSTRUÇÃO  o mapa, maior que a tela: arrasta para andar, arrasta a
 *                  peça da bandeja para pôr trilho
 *   3. PARTIDA     a interface some, a câmera vai atrás do trem, e cada
 *                  passageiro embarca e desce (`run`)
 *
 * Os três acontecem na MESMA cena do Phaser de propósito: vidas, tutorial,
 * ponte com a plataforma e fim de nível são um estado só, e espalhá-los por
 * três cenas transformaria cada troca de ato numa passagem de bagagem.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  O QUE CUSTA VIDA, E O QUE NÃO CUSTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   arrastar o mapa, escolher estação  →  de graça.
 *   pôr trilho, tirar trilho           →  de graça, sem limite: a peça volta.
 *   tocar num par sem ligação          →  de graça. Isso é pergunta.
 *   PARTIR com peça na bandeja         →  de graça: o botão nem acende.
 *   PARTIR e alguém não chegar         →  TRAVA. Uma vida por FASE, no 1º erro.
 */
export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'entrando'
    private gen = 0

    private edges: Edge[] = []
    private trayLeft = 0
    private selected: string | null = null

    private locked = false
    private errorsInPhase = 0
    private score = 0
    private hits = 0
    private errors = 0
    private tutorialOpen = false

    private city!: City
    private network!: Network
    private tray!: Tray
    private runner!: Runner
    private talk!: Talk
    private coach!: Coach
    private lesson: 'pan' | 'track' | 'go' | 'off' = 'off'
    private diagram!: Diagram
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics
    private panZone!: Phaser.GameObjects.Zone

    private stations = new Map<string, StationView>()
    private riders: RiderView[] = []

    private grab: { x: number; y: number; sx: number; sy: number; moved: boolean } | null = null
    private unsubPlatform?: () => void

    /**
     * A FASE VIVA — a que está na tela agora.
     *
     * A partir do nível 2 a fase muda no meio: uma estação abre, ou uma obra
     * fecha um trilho. O objeto dos dados continua sendo o ponto de partida
     * (`this.start`), e tudo o que a cena pergunta — quem chegou, qual a
     * dica, o que dá para ligar — pergunta para a fase viva.
     */
    private live!: PhaseDef

    /** A fase como ela nasce, direto do arquivo de dados. */
    private get start(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get phase(): PhaseDef {
        return this.live ?? this.start
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.mode = 'entrando'
        this.edges = []
        this.selected = null
        this.locked = false
        this.errorsInPhase = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.tutorialOpen = false
        this.grab = null
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.panZone = this.add.zone(0, 0, 10, 10).setOrigin(0).setDepth(DEPTH.city - 1).setInteractive()
        this.city = createCity(this)
        this.network = createNetwork(this, { onKnob: edge => this.toggleTrack(edge.a, edge.b) })
        this.audio = createAudio(this)
        this.tray = createTray(this, {
            onGo: () => void this.depart(),
            onDragStart: () => this.audio.pick(),
            onDragMove: (x, y) => this.aimPiece(x, y),
            onDragEnd: (x, y) => this.dropPiece(x, y),
        })
        this.runner = createRunner(this, {
            where: id => this.pointOf(id),
            onLit: (a, b, on) => this.network.setLit(a, b, on),
            onStep: () => this.audio.chug(),
        })
        this.talk = createTalk(this)
        this.coach = createCoach(this)
        this.diagram = createDiagram(this)
        this.hud = createHud(this, {
            level: this.level.level,
            goal: this.level.goal,
            phases: this.level.phases.length,
            onHelp: () => this.replayTutorial(),
        })

        this.frame = this.add.graphics().setDepth(DEPTH.frame).setScrollFactor(0).setAlpha(0)

        this.bindPan()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 28,
            tint: C.amber,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.lives.container.setScrollFactor(0)
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.talk?.cancel()
        this.clearPhase()
        this.hud?.destroy()
        this.coach?.destroy()
        this.talk?.destroy()
        this.diagram?.destroy()
        this.runner?.destroy()
        this.tray?.destroy()
        this.network?.destroy()
        this.city?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ─────────────────────────── a câmera, o mapa ─────────────────────── */

    /**
     * Arrastar o fundo anda com o mapa.
     *
     * O `panZone` fica embaixo de tudo, então estação, dormente e bancada
     * roubam o toque antes dele (`input.topOnly`): só arrasta quem pegou o
     * mapa vazio. Um arraste que não andou 8 px conta como toque no vazio, e
     * toque no vazio larga a estação selecionada.
     */
    private bindPan() {
        this.panZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.canPlay()) return
            const camera = this.cameras.main
            this.grab = { x: pointer.x, y: pointer.y, sx: camera.scrollX, sy: camera.scrollY, moved: false }
        })

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.grab) return
            const dx = pointer.x - this.grab.x
            const dy = pointer.y - this.grab.y
            if (Math.hypot(dx, dy) > 8) {
                this.grab.moved = true
                if (this.lesson === 'pan') this.teach('track')
            }
            this.cameras.main.setScroll(this.grab.sx - dx, this.grab.sy - dy)
            this.onCameraMoved()
        })

        this.input.on('pointerup', () => {
            if (!this.grab) return
            const moved = this.grab.moved
            this.grab = null
            if (!moved) this.select(null)
        })
    }

    private applyWorld(phase: PhaseDef) {
        const camera = this.cameras.main
        camera.setZoom(1)
        camera.setBounds(0, -MAP.y, phase.world.w, phase.world.h + (H - MAP.h))
        camera.setScroll(0, 0)
        this.city.setWorld(phase.world.w, phase.world.h)
        this.panZone.setPosition(-400, -400).setSize(phase.world.w + 800, phase.world.h + 800)
        this.panZone.input!.hitArea.setTo(0, 0, phase.world.w + 800, phase.world.h + 800)
        this.onCameraMoved()
    }

    /** A vista de abertura: o meio do que importa, não o canto do mundo. */
    private centerOnPhase() {
        const xs = this.phase.stations.map(s => s.x)
        const ys = this.phase.stations.map(s => s.y)
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2

        this.lookAt(cx, cy)
    }

    private lookAt(x: number, y: number) {
        const camera = this.cameras.main
        camera.setScroll(x - W / 2, y - (MAP.y + MAP.h / 2))
        this.onCameraMoved()
    }

    /** A câmera andou: o guia precisa reapontar, porque o alvo dele anda junto. */
    private onCameraMoved() {
        this.refreshLesson()
    }

    private toScreen(point: { x: number; y: number }) {
        const camera = this.cameras.main
        return { x: point.x - camera.scrollX, y: point.y - camera.scrollY }
    }

    private toWorld(x: number, y: number) {
        const camera = this.cameras.main
        return { x: x + camera.scrollX, y: y + camera.scrollY }
    }

    /* ────────────────────────────────── a fase ────────────────────────── */

    private clearPhase() {
        this.stations.forEach(s => s.destroy())
        this.stations.clear()
        this.riders.forEach(r => r.destroy())
        this.riders = []
    }

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'entrando'
        this.edges = []
        this.selected = null
        this.live = this.start
        this.trayLeft = this.phase.tray
        this.locked = false
        this.errorsInPhase = 0

        this.talk.cancel()
        this.teach('off')
        this.clearPhase()
        this.applyWorld(this.phase)
        this.network.setPhase(this.phase.stations, this.phase.links)
        this.tray.setPieces(this.trayLeft)
        this.tray.setGoReady(false)
        this.tray.setLocked(false)

        this.phase.stations.forEach(station => {
            const view = createStation(this, station, { onTap: id => this.tapStation(id) })
            this.stations.set(station.id, view)
        })
        this.phase.riders.forEach(rider => {
            this.riders.push(createRider(this, rider, this.stationOf(rider.from), this.stationOf(rider.to)))
        })

        this.applyInput()

        // ATO 1 — a conversa
        this.mode = 'conversa'
        await this.talk.play(this.phase.riders, id => this.stationOf(id))
        if (gen !== this.gen) return

        // ATO 2 — a construção
        this.mode = 'montando'
        this.centerOnPhase()
        this.applyInput()

        if (index === 0) this.teach('pan')
    }

    /* ────────────────────────────── o guia ────────────────────────────── */

    /**
     * O tutorial é uma dica por vez, no lugar onde a ação acontece, e ele
     * troca sozinho quando a criança faz. Ele não bloqueia nada: quem já sabe
     * jogar simplesmente joga, e a dica desaparece.
     */
    private teach(step: 'pan' | 'track' | 'go' | 'off') {
        this.lesson = step
        if (step === 'off') {
            void this.coach.hide()
            return
        }
        if (step === 'pan') {
            // e se ela não arrastar, o guia segue para o trilho em 5 segundos:
            // a fase 1.1 é resolvível sem andar no mapa, então isto é convite,
            // não tarefa
            this.time.delayedCall(5000, () => {
                if (this.lesson === 'pan') this.teach('track')
            })
        }
        this.refreshLesson()
    }

    private refreshLesson() {
        if (this.lesson === 'off') return

        if (this.lesson === 'pan') {
            this.coach.show(
                'Arraste o mapa para ver a cidade',
                { kind: 'drag', from: { x: 860, y: 400 }, to: { x: 480, y: 400 } },
                null,
            )
            return
        }

        if (this.lesson === 'go') {
            this.coach.show(
                'Bandeja vazia? Toque em PARTIR',
                { kind: 'tap', at: { x: GO.cx, y: GO.cy } },
                { x: GO.cx, y: GO.cy },
            )
            return
        }

        const link = this.phase.links.find(l => !hasEdge(this.edges, l.a, l.b))
        if (!link) return
        const aim = this.toScreen(this.network.midpoint(link.a, link.b))
        this.coach.show(
            this.edges.length === 0 ? 'Arraste um trilho até o tracejado' : 'Falta ligar mais uma',
            { kind: 'drag', from: { x: TRAY.x0, y: TRAY.cy }, to: aim },
            aim,
        )
    }

    private stationOf(id: string): Station {
        return this.phase.stations.find(s => s.id === id)!
    }

    private pointOf(id: string) {
        const station = this.stationOf(id)
        return { x: station.x, y: station.y }
    }

    /**
     * Onde cabe um painel largo sem tapar nada — em coordenadas de TELA.
     *
     * Com o mapa andando, "longe da estação" muda a cada arraste: o que conta é
     * onde a estação está AGORA na tela. Estação fora da janela nem entra na
     * conta.
     */
    private freeSpot(target?: { x: number; y: number }) {
        const spots = [
            { x: 400, y: 190 },
            { x: 640, y: 190 },
            { x: 900, y: 190 },
            { x: 400, y: 340 },
            { x: 640, y: 340 },
            { x: 400, y: 480 },
            { x: 640, y: 480 },
            { x: 900, y: 480 },
        ]
        const marks = [
            ...this.phase.stations.map(s => this.toScreen(s)).filter(p => p.x > -200 && p.x < W + 200),
            ...(target ? [target] : []),
        ]
        if (!marks.length) return spots[4]

        const room = (spot: { x: number; y: number }) =>
            Math.min(...marks.map(p => Math.max(Math.abs(p.x - spot.x) / 360, Math.abs(p.y - spot.y) / 150)))

        return spots.reduce((best, spot) => (room(spot) > room(best) ? spot : best), spots[0])
    }

    /* ───────────────────────────── montar a rede ──────────────────────── */

    private canPlay() {
        return !this.tutorialOpen && (this.mode === 'montando' || this.mode === 'travado')
    }

    private tapStation(id: string) {
        if (!this.canPlay()) return

        if (this.selected === null) {
            this.select(id)
            return
        }
        if (this.selected === id) {
            this.select(null)
            return
        }

        const possible = this.phase.links.some(
            l => (l.a === this.selected && l.b === id) || (l.b === this.selected && l.a === id),
        )
        if (!possible) {
            this.audio.blocked()
            void this.stations.get(id)?.nope()
            this.select(id)
            return
        }

        const from = this.selected
        this.select(null)
        this.toggleTrack(from, id)
    }

    private select(id: string | null) {
        if (this.selected === id) return
        this.selected = id
        this.stations.forEach(view => view.setSelected(view.id === id))
        if (id) {
            this.audio.pick()
            this.phase.links.forEach(link => {
                const other = link.a === id ? link.b : link.b === id ? link.a : null
                if (other) this.stations.get(other)?.setCandidate(true)
            })
        } else {
            this.stations.forEach(view => view.setCandidate(false))
        }
        this.network.setSelected(id)
    }

    /** O arraste da peça: a ligação mais perto do dedo acende. */
    private aimPiece(x: number, y: number) {
        if (!this.canPlay() || y > BENCH.y) {
            this.network.setHover(null)
            return
        }
        const world = this.toWorld(x, y)
        this.network.setHover(this.network.nearestLink(world.x, world.y, 240))
    }

    private dropPiece(x: number, y: number) {
        this.network.setHover(null)
        if (!this.canPlay() || y > BENCH.y) return

        const world = this.toWorld(x, y)
        const link = this.network.nearestLink(world.x, world.y, 240)
        if (!link) {
            this.audio.blocked()
            return
        }
        this.toggleTrack(link.a, link.b)
    }

    /** Um toque põe, um toque tira — e o arraste também põe. */
    private toggleTrack(a: string, b: string) {
        if (!this.canPlay()) return

        const mid = this.toScreen(this.network.midpoint(a, b))

        if (hasEdge(this.edges, a, b)) {
            void this.tray.back(mid)
            this.edges = this.edges.filter(e => key(e.a, e.b) !== key(a, b))
            this.trayLeft += 1
            this.audio.undo()
        } else {
            if (this.trayLeft === 0) {
                this.audio.blocked()
                void this.tray.nudge()
                return
            }
            void this.tray.fly(mid)
            this.edges = [...this.edges, { a, b }]
            this.trayLeft -= 1
            this.audio.lay()
        }

        this.network.setEdges(this.edges)
        this.tray.setPieces(this.trayLeft)
        this.tray.setGoReady(canDepart(this.trayLeft))
        if (this.lesson !== 'off') this.teach(canDepart(this.trayLeft) ? 'go' : 'track')
        this.unlockGo()
    }

    /** O cadeado da TRAVA só sai quando a REDE muda — apertar de novo, não. */
    private unlockGo() {
        if (this.mode !== 'travado') return
        this.mode = 'montando'
        this.tray.setLocked(false)
        this.riders.forEach(rider => {
            rider.hush()
            rider.reset()
            rider.setDim(false)
        })
        this.network.clearLit()
        this.applyInput()
    }

    /* ──────────────────────────── ATO 3: a partida ────────────────────── */

    private async setCinema(on: boolean) {
        const camera = this.cameras.main
        if (on) {
            camera.setBounds(0, 0, this.phase.world.w, this.phase.world.h)
        } else {
            camera.setBounds(0, -MAP.y, this.phase.world.w, this.phase.world.h + (H - MAP.h))
        }
        await FX.all(this.hud.setShown(!on), this.tray.setShown(!on))
        void FX.to(this, this.lives.container, { alpha: on ? 0 : 1 }, { duration: 260 })
    }

    private async depart() {
        if (this.tutorialOpen) return
        if (this.mode === 'travado') {
            void this.tray.nudge()
            return
        }
        if (this.mode !== 'montando') return

        if (!canDepart(this.trayLeft)) {
            this.audio.blocked()
            void this.tray.nudge()
            return
        }

        const gen = this.gen
        this.mode = 'correndo'
        this.teach('off')
        this.select(null)
        this.applyInput()

        void this.tray.press()
        this.audio.whistle()
        this.network.clearLit()
        this.riders.forEach(rider => rider.reset())

        const trips: Trip[] = this.riders.map(view => {
            const rider = this.phase.riders.find(r => r.id === view.id)!
            const path = pathOf(this.edges, rider.from, rider.to) ?? strandedPath(this.edges, rider.from)
            return { rider: view, path, ok: served(rider, this.edges) }
        })

        await this.setCinema(true)
        if (gen !== this.gen) return

        const landed = new Map<string, number>()
        for (const trip of trips) {
            this.lookAt(this.pointOf(trip.path[0]).x, this.pointOf(trip.path[0]).y)
            await trip.rider.board(this.runner.boardingPoint(trip))
            if (gen !== this.gen) return

            await this.runner.drive(trip)
            if (gen !== this.gen) return

            if (trip.ok) {
                const slot = landed.get(trip.rider.to) ?? 0
                landed.set(trip.rider.to, slot + 1)
                this.audio.arrive()
                await trip.rider.arriveAt(this.pointOf(trip.rider.to), slot)
            } else {
                trip.rider.strand()
            }
            await FX.wait(this, 320)
            if (gen !== this.gen) return
        }

        await this.setCinema(false)
        if (gen !== this.gen) return

        if (solved(this.phase, this.edges)) void this.win()
        else void this.fail()
    }

    private async win() {
        const gen = this.gen

        const points = pointsFor(this.locked)
        this.score += points
        this.hits += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        void this.flashFrame(C.green)

        // O segundo ato vem ANTES da comemoração da fase: a fase não acabou,
        // a cidade só mudou de assunto.
        if (this.phase.twist) {
            await FX.wait(this, 520)
            if (gen !== this.gen) return
            await this.playTwist()
            return
        }

        await this.hud.celebrate(this.phaseIndex)
        if (gen !== this.gen) return

        await FX.wait(this, 420)
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) {
            void this.startPhase(next)
            return
        }
        void this.finishLevel()
    }

    /* ──────────────────────── o segundo ato da fase ─────────────────────── */

    /**
     * A CIDADE MUDA, E A REDE CONTINUA A MESMA.
     *
     * Os trilhos que a criança montou ficam onde estão — esse é o ponto. Ela
     * não recomeça: ela mexe numa rede que já existe e que ela já entendeu.
     *
     * `afterTwist` faz a conta (qual estação chega, qual trilho fecha) e esta
     * função só mostra o que aconteceu e devolve a construção para ela.
     */
    private async playTwist() {
        const gen = this.gen
        const twist = this.phase.twist
        if (!twist) return

        const next = afterTwist(this.phase, this.edges)
        this.live = next.phase
        this.edges = next.edges
        this.trayLeft = next.phase.tray

        this.mode = 'entrando'
        this.applyInput()
        this.teach('off')

        if (twist.kind === 'chegada') {
            // a estação nova nasce grande e pousa: ela é a novidade da tela
            const view = createStation(this, twist.station, { onTap: id => this.tapStation(id) })
            this.stations.set(twist.station.id, view)
            this.audio.arrive()
            this.lookAt(twist.station.x, twist.station.y)
            void view.ping(C.green)
            await FX.wait(this, 700)
            if (gen !== this.gen) return

            twist.riders.forEach(r => {
                this.riders.push(createRider(this, r, this.stationOf(r.from), this.stationOf(r.to)))
            })
        } else {
            const gone = next.phase.closed?.[0]
            if (gone) {
                this.audio.hmm()
                const a = this.stationOf(gone.a)
                const b = this.stationOf(gone.b)
                this.lookAt((a.x + b.x) / 2, (a.y + b.y) / 2)
                void this.flashFrame(C.amber)
                FX.shakeCam(this, 'leve')
            }
            await FX.wait(this, 620)
            if (gen !== this.gen) return
        }

        this.network.setPhase(next.phase.stations, next.phase.links, next.phase.closed)
        this.network.setEdges(this.edges)
        this.tray.setPieces(this.trayLeft)
        this.tray.setGoReady(canDepart(this.trayLeft))
        this.tray.setLocked(false)

        // ATO 1 DE NOVO — quem chegou fala; na obra, quem ficou sem caminho
        this.mode = 'conversa'
        const speaking = twist.kind === 'chegada' ? twist.riders : stuck(next.phase, this.edges)
        if (speaking.length) {
            await this.talk.play(speaking, id => this.stationOf(id))
            if (gen !== this.gen) return
        }

        this.mode = 'montando'
        this.applyInput()
    }

    private async fail() {
        this.mode = 'travado'
        this.tray.setLocked(true)
        this.applyInput()

        this.audio.hmm()
        void this.flashFrame(C.amber)

        const waiting = stuck(this.phase, this.edges)[0]
        const view = this.riders.find(r => r.id === waiting.id)!

        this.riders.forEach(r => r.setDim(r.id !== waiting.id))
        this.lookAt(view.x + 200, view.y)
        view.say(this.noteFor(waiting.id), this.freeSpot(this.toScreen({ x: view.x, y: view.y })))

        this.audio.lock()
        this.loseOnce()
        this.errorsInPhase += 1

        void this.stations.get(waiting.from)?.alert()
        void this.stations.get(waiting.to)?.alert()

        if (this.errorsInPhase >= 2) {
            const hint = hintLink(this.phase, this.edges)
            if (hint) void this.network.flashHint(hint)
        }
    }

    /** A frase diz QUAL e POR QUÊ — nunca "tente de novo", nunca a resposta. */
    private noteFor(riderId: string) {
        const rider = this.phase.riders.find(r => r.id === riderId)!
        const to = this.stationOf(rider.to)
        const distance = hops(this.edges, rider.from, rider.to)

        if (distance === null) return `${rider.name} quer chegar ${to.dative}, e não existe trilho que leve até lá.`
        return `${rider.name} tinha pressa, e o caminho ${to.dative} ficou comprido demais.`
    }

    /** Uma vida por FASE, no primeiro erro dela. Os seguintes, não. */
    private loseOnce() {
        if (this.locked) return
        this.locked = true
        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    private async flashFrame(color: number) {
        this.frame.clear()
        this.frame.lineStyle(16, color, 1)
        this.frame.strokeRect(8, 8, W - 16, H - 16)
        this.frame.setAlpha(0)
        await FX.to(this, this.frame, { alpha: 1 }, { duration: 80 })
        await FX.to(this, this.frame, { alpha: 0 }, { duration: 380 })
    }

    /* ───────────────────────────── fim do nível ───────────────────────── */

    private async finishLevel() {
        const gen = ++this.gen
        this.mode = 'fim'
        this.applyInput()

        const last = this.level.level >= LEVELS.length

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        void this.hud.setShown(false)
        void this.tray.setShown(false)

        await this.diagram.show(
            this.phase.world,
            this.phase.stations,
            this.edges,
            'Estações são pontos, trilhos são ligações — juntos, são uma REDE.',
        )
        if (gen !== this.gen) return

        await this.diagram.hide()
        if (gen !== this.gen) return

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.amber, C.green, C.disc, C.blue] })

        showLevelComplete(this, {
            accent: C.blue,
            panelColor: C.disc,
            overlayColor: C.ink,
            depth: 5000,
            title: this.level.title,
            message: this.level.closing,
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.green,
                              onClick: () =>
                                  this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                          },
                          {
                              label: 'Escolher jogo',
                              color: C.amber,
                              onClick: () => EventBus.emit('exit-game'),
                          },
                      ],
                  }
                : {
                      autoAdvance: {
                          delay: 2200,
                          onComplete: () =>
                              this.scene.restart({
                                  lives: this.livesLeft,
                                  level: this.level.level + 1,
                                  points: this.score,
                              }),
                      },
                  }),
        })
    }

    /* ──────────────────────────────── resto ───────────────────────────── */

    private applyInput() {
        const free = this.canPlay()
        this.stations.forEach(view => view.setEnabled(free))
        this.network.setEnabled(free)
        this.tray.setEnabled(free)
        this.hud.setEnabled(!this.tutorialOpen && this.mode !== 'fim')
        if (!free) this.grab = null
    }

    /**
     * O tutorial desenha em coordenada de tela, e a câmera deste jogo anda —
     * então ele só roda com o mapa no canto (scroll 0,0), onde mundo e tela
     * coincidem. É também a vista em que a fase 1.1 começa.
     */
    private runTutorial(once = true) {
        this.tutorialOpen = true
        this.cameras.main.setScroll(0, 0)
        this.onCameraMoved()
        this.applyInput()

        createTutorial(this, {
            key: `ef05co02mm-l${this.level.level}`,
            once,
            accent: C.blue,
            safeTop: HUD.h + 10,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.applyInput()
                this.centerOnPhase()
            },
        })
    }

    private tutorialSteps(): TutorialStep[] {
        const rider = this.phase.riders[0]
        const start = this.stationOf(rider.from)
        const reachable = this.phase.links.find(l => l.a === start.id || l.b === start.id)!
        const neighbour = this.stationOf(reachable.a === start.id ? reachable.b : reachable.a)

        const spot = (at: { x: number; y: number }) => {
            const free = this.freeSpot(at)
            return { balloonX: free.x, balloonY: free.y }
        }
        const bench = { x: TRAY.x + TRAY.w / 2, y: TRAY.cy }

        return [
            {
                text: `${rider.name} quer chegar ${this.stationOf(rider.to).dative}. Ligue as estações até todo mundo chegar.`,
                shape: 'circle',
                x: start.x,
                y: start.y,
                w: STATION.r * 2 + 80,
                h: STATION.r * 2 + 80,
                ...spot(start),
            },
            {
                text: 'Arraste uma peça de trilho da bandeja até uma ligação tracejada.',
                shape: 'rect',
                x: bench.x,
                y: bench.y,
                w: TRAY.w + 20,
                h: TRAY.h + 20,
                ...spot(bench),
                pointer: { fromX: TRAY.x0, fromY: TRAY.cy, toX: neighbour.x, toY: neighbour.y },
            },
            {
                text: 'Tocar numa estação e depois na outra faz o mesmo. Tocar no meio do trilho devolve a peça.',
                shape: 'circle',
                x: start.x,
                y: start.y,
                w: STATION.r * 2 + 40,
                h: STATION.r * 2 + 40,
                ...spot(start),
                pointer: { fromX: start.x, fromY: start.y, toX: neighbour.x, toY: neighbour.y },
            },
            {
                text: 'O mapa é maior que a tela: arraste o mapa para ver o resto.',
                shape: 'none',
                ...spot({ x: W / 2, y: MAP.y + MAP.h / 2 }),
                pointer: { fromX: 900, fromY: 420, toX: 460, toY: 420 },
            },
            {
                text: 'Bandeja vazia? Toque em PARTIR.',
                shape: 'rect',
                x: GO.cx,
                y: GO.cy,
                w: GO.w + 30,
                h: GO.h + 30,
                ...spot({ x: GO.cx, y: GO.cy }),
                pointer: { fromX: GO.cx, fromY: GO.cy, toX: GO.cx, toY: GO.cy, tap: true },
            },
        ]
    }

    private replayTutorial() {
        if (this.tutorialOpen) return
        if (this.mode !== 'montando' && this.mode !== 'travado') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.phases.length
        const done = complete ? total : this.hits
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(done, total) / total) * 100),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.level.level) {
                    this.scene.restart({ lives: this.livesLeft, level: command.stage, points: this.score })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.scene.pause()
            if (command.type === 'RESUME_GAME') this.scene.resume()
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
