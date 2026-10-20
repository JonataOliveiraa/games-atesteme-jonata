import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { DEVICES, MISSING } from '../data/devices'
import { DEPTH, PC, SOCKET, VIEW, ZOOM } from '../data/layout'
import { BASICS_KEY, LEVELS, POINTS, devicesOf, onTable, teachKey } from '../data/levels'
import { Net, type Hop, type Route } from '../data/route'
import { C, CSS, KIND_COLOR } from '../data/theme'
import { TIMING } from '../data/timing'
import { CAPTION, LABEL, SAY, TEACH } from '../data/words'
import type { DeviceId, Kind, LevelDef, MissionDef, State, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBoard, type Board } from './board'
import { createBubble, type Bubble } from './bubble'
import { createCaption, type Caption } from './caption'
import { createFlow, type Flow } from './flow'
import { createGear, type Gear } from './gear'
import { createHand, type Hand } from './hand'
import { createHeader, type Header } from './header'
import { createMarkers, type Markers } from './markers'
import { createView, type View } from './view'

const GAME_ID = 'cabo-certo'

/** Quanto o dedo anda antes de um toque virar arraste. */
const DRAG_START = 14

/** Margem da tela dentro da qual a bolinha pode andar sem a câmera ir atrás. */
const FOLLOW_PAD = 150

const KINDS: Kind[] = ['entrada', 'saida', 'armazenamento', 'memoria']

const HOME: Vec = { x: PC.x, y: PC.y - 10 }

type Press =
    | { kind: 'pan'; last: Vec }
    | { kind: 'device'; id: DeviceId; start: Vec; last: Vec }
    | { kind: 'cable'; id: DeviceId; last: Vec }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private mission = 0
    private press: Press | null = null
    private hooked = new Set<DeviceId>()
    private hinted: DeviceId | null = null
    private demoing = false
    private skip = false
    private idleSince = 0

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private net!: Net
    private board!: Board
    private gear!: Gear
    private flow!: Flow
    private markers!: Markers
    private header!: Header
    private bubble!: Bubble
    private banner!: Banner
    private caption!: Caption
    private hand!: Hand
    private keys?: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.state = 'intro'
        this.introduce = false
        this.mission = 0
        this.press = null
        this.hooked = new Set()
        this.hinted = null
        this.demoing = false
        this.skip = false
        this.idleSince = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        // Tomada própria de aparelho (o monitor que leva o alto-falante) é coisa dos níveis altos.
        const defs = devicesOf(this.level).map(id => (this.level.nested ? DEVICES[id] : { ...DEVICES[id], sockets: undefined }))
        this.view = createView(this, HOME)
        this.audio = createAudio()
        this.net = new Net(this.level.pc, defs)
        this.board = createBoard(this, this.view, this.net, this.level.plates)
        this.gear = createGear(this, this.view, defs)
        this.flow = createFlow(this, this.view)
        this.markers = createMarkers(this, this.view)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.missions.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.caption = createCaption(this)
        this.hand = createHand(this, this.view)
        this.header.setHelpEnabled(false)

        const kb = this.input.keyboard
        if (kb)
            this.keys = kb.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                w: Phaser.Input.Keyboard.KeyCodes.W,
                a: Phaser.Input.Keyboard.KeyCodes.A,
                s: Phaser.Input.Keyboard.KeyCodes.S,
                d: Phaser.Input.Keyboard.KeyCodes.D,
            }) as GameScene['keys']

        this.input.on('pointerdown', this.onDown, this)
        this.input.on('pointermove', this.onMove, this)
        this.input.on('pointerup', this.onUp, this)
        this.input.on('pointerupoutside', this.onUp, this)

        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.introduce = !this.registry.get(BASICS_KEY)
        this.registry.set(BASICS_KEY, true)
        void this.openLevel()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.press = null
        this.input.off('pointerdown', this.onDown, this)
        this.input.off('pointermove', this.onMove, this)
        this.input.off('pointerup', this.onUp, this)
        this.input.off('pointerupoutside', this.onUp, this)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.hand?.destroy()
        this.caption?.destroy()
        this.banner?.destroy()
        this.bubble?.destroy()
        this.header?.destroy()
        this.markers?.destroy()
        this.flow?.destroy()
        this.gear?.destroy()
        this.board?.destroy()
        this.audio?.destroy()
        this.view?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o quadro a quadro

    update(time: number, deltaMs: number) {
        if (!this.gear) return
        const delta = Math.min(deltaMs, 50)
        if (this.state === 'play' && this.keys) {
            const k = this.keys
            const step = VIEW.keySpeed * delta
            const dx = (k.left.isDown || k.a.isDown ? 1 : 0) - (k.right.isDown || k.d.isDown ? 1 : 0)
            const dy = (k.up.isDown || k.w.isDown ? 1 : 0) - (k.down.isDown || k.s.isDown ? 1 : 0)
            if (dx || dy) this.view.pan(dx * step, dy * step)
        }
        if (this.state === 'drag' && this.press?.kind === 'cable') this.edgePan(delta)
        if (this.state === 'flow') this.follow(delta)
        if (this.state === 'play' && !this.hinted && !this.press && time - this.idleSince > TIMING.idle) {
            this.idleSince = time
            void this.nudge()
        }
        const loose = this.gear
            .ids()
            .filter(id => this.gear.visible(id) && this.current().needs.includes(id))
            .filter(id => id === this.hinted || (!this.net.socketOf(id) && this.press?.kind !== 'cable'))
            .map(id => ({ id, at: this.gear.at(id) }))
        this.markers.update(this.state === 'intro' ? [] : loose)
    }

    /** A bolinha saiu da vista: a câmera vai atrás, devagar. */
    private follow(delta: number) {
        const lead = this.flow.lead()
        if (!lead || this.view.inView(lead, FOLLOW_PAD)) return
        const center = this.view.center()
        const k = 1 - Math.exp(-delta / 260)
        this.view.pan((center.x - lead.x) * k, (center.y - lead.y) * k)
    }

    /** Arrastando o cabo perto da borda, o mapa anda sozinho. */
    private edgePan(delta: number) {
        if (this.press?.kind !== 'cable') return
        const p = this.press.last
        const speed = VIEW.edgeSpeed * delta
        const push = (v: number, lo: number, hi: number) =>
            v < lo + VIEW.edge ? ((lo + VIEW.edge - v) / VIEW.edge) * speed : v > hi - VIEW.edge ? -((v - (hi - VIEW.edge)) / VIEW.edge) * speed : 0
        const dx = push(p.x, VIEW.x, VIEW.x + VIEW.w)
        const dy = push(p.y, VIEW.y, VIEW.y + VIEW.h)
        if (!dx && !dy) return
        this.view.pan(dx, dy)
        this.holdCable(this.press.id, p)
    }

    // ───────────────────────────────────────────── o dedo

    private onDown(pointer: Phaser.Input.Pointer) {
        // Só um toque no mapa pula: o toque no "?" que abriu a demonstração
        // chega aqui logo depois dela começar, e não pode encerrá-la.
        if (this.demoing) {
            if (this.view.onMap(pointer.x, pointer.y)) this.skip = true
            return
        }
        this.idleSince = this.time.now
        if (!this.hinted) this.hand.stop()
        if (this.state !== 'play' || this.press) return
        if (!this.view.onMap(pointer.x, pointer.y)) return
        const here = { x: pointer.x, y: pointer.y }
        const at = this.view.toWorld(here.x, here.y)
        const plug = this.gear.plugUnder(at)
        if (plug) {
            this.startCable(plug, here)
            return
        }
        const device = this.gear.deviceUnder(at)
        if (device) {
            this.press = { kind: 'device', id: device, start: here, last: here }
            return
        }
        this.press = { kind: 'pan', last: here }
    }

    private onMove(pointer: Phaser.Input.Pointer) {
        const press = this.press
        if (!press || !pointer.isDown) return
        const here = { x: pointer.x, y: pointer.y }
        if (press.kind === 'pan') {
            this.view.pan(here.x - press.last.x, here.y - press.last.y)
            press.last = here
            return
        }
        if (press.kind === 'device') {
            if (Phaser.Math.Distance.BetweenPoints(here, press.start) < DRAG_START) return
            if (!this.net.socketOf(press.id)) this.startCable(press.id, here)
            else this.press = { kind: 'pan', last: press.last }
            return
        }
        press.last = here
        this.holdCable(press.id, here)
    }

    private onUp() {
        const press = this.press
        this.press = null
        if (!press) return
        if (press.kind === 'device') void this.tap(press.id)
        if (press.kind === 'cable') void this.drop(press.id)
    }

    // ───────────────────────────────────────────── o cabo

    private startCable(id: DeviceId, here: Vec) {
        if (this.net.socketOf(id)) {
            this.net.unplug(id)
            this.updatePower()
            this.audio.pop()
            this.checkReady()
        }
        this.state = 'drag'
        this.press = { kind: 'cable', id, last: here }
        this.bubble.hide()
        this.board.dragging(this.net)
        this.audio.grab()
        this.holdCable(id, here)
    }

    private holdCable(id: DeviceId, screen: Vec) {
        const at = this.view.toWorld(screen.x, screen.y)
        this.gear.hold(id, at)
        this.board.hover(this.nearest(id, at)?.socket ?? null)
    }

    /** A tomada mais perto do plugue: livre primeiro, ocupada só se não houver livre. */
    private nearest(id: DeviceId, at: Vec): { socket: string; busy: boolean } | null {
        let free: { socket: string; d: number } | null = null
        let busy: { socket: string; d: number } | null = null
        this.net.sockets.forEach(info => {
            if (info.owner === id || !this.net.open(info.id)) return
            if (info.owner !== 'pc' && !this.nestOn()) return
            const d = Phaser.Math.Distance.BetweenPoints(at, this.board.socketAt(info.id))
            if (d > SOCKET.snap) return
            const taken = this.net.occupant(info.id)
            if (taken && taken !== id) {
                if (!busy || d < busy.d) busy = { socket: info.id, d }
            } else if (!free || d < free.d) free = { socket: info.id, d }
        })
        const pick = (free ?? busy) as { socket: string; d: number } | null
        return pick ? { socket: pick.socket, busy: !free } : null
    }

    private async drop(id: DeviceId) {
        const gen = this.gen
        this.board.dragging(null)
        this.board.hover(null)
        const hit = this.nearest(id, this.gear.plugAt(id))
        if (!hit) {
            this.state = 'play'
            await this.gear.retract(id)
            return
        }
        if (hit.busy) {
            this.state = 'play'
            this.audio.blip()
            void this.gear.retract(id)
            this.sayBusy(id, hit.socket)
            return
        }
        if (!this.net.fits(DEVICES[id], hit.socket)) {
            await this.wrong(gen, id, hit.socket)
            return
        }
        await this.connect(gen, id, hit.socket)
    }

    private sayBusy(id: DeviceId, socket: string) {
        const kind = DEVICES[id].kind
        const other = this.ownSocket(kind, id)
        if (other && other.owner !== 'pc' && this.net.kindOf(socket) === kind) {
            this.board.point(other.id)
            void this.board.ping(other.id)
            this.think(TEACH.nest(DEVICES[other.owner]), this.board.socketAt(socket), 2600)
            return
        }
        this.think(SAY.busy, this.board.socketAt(socket), TIMING.hint)
    }

    private async connect(gen: number, id: DeviceId, socket: string) {
        this.state = 'flow'
        const at = this.board.socketAt(socket)
        await this.gear.snap(id, at)
        if (gen !== this.gen) return
        this.net.plug(id, socket)
        this.audio.click()
        const s = this.view.toScreen(at)
        const kind = this.net.kindOf(socket) ?? 'entrada'
        void FX.sparks(this, s.x, s.y, { color: KIND_COLOR[kind], count: 14, spread: 90, depth: DEPTH.bubble - 1 })
        this.updatePower()
        if (!this.hooked.has(id)) {
            this.hooked.add(id)
            this.score += POINTS
            this.hits += 1
            runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        }
        if (await this.reveal(gen)) return
        this.state = 'play'
        this.checkReady()
    }

    private updatePower() {
        this.gear.ids().forEach(id => {
            this.gear.setPowered(id, this.net.powered(id))
            this.gear.invite(id, !this.net.socketOf(id))
        })
        this.board.refresh(this.net, this.nestOn())
        this.board.point(null)
    }

    // ───────────────────────────────────────────── o aparelho funcionando

    private async tap(id: DeviceId) {
        if (this.state !== 'play') return
        const def = DEVICES[id]
        const at = this.gear.at(id)
        const above = { x: at.x, y: at.y - (def.size ?? 170) * 0.42 }
        if (!this.net.socketOf(id)) {
            this.gear.nope(id)
            this.audio.blip()
            this.think(SAY.noCable, above, TIMING.hint)
            return
        }
        if (!this.net.powered(id)) {
            const owner = this.net.sockets.get(this.net.socketOf(id) ?? '')?.owner
            this.gear.nope(id)
            this.think(SAY.noPower(owner && owner !== 'pc' ? DEVICES[owner] : null), above, TIMING.hint)
            return
        }
        const full = this.net.route(id)
        const route = full && { ...full, down: full.down.filter(d => this.current().needs.includes(d.to)) }
        if (!route) {
            this.gear.press(id)
            this.audio.blip()
            return
        }
        await this.run(id, route)
    }

    private async run(id: DeviceId, route: Route) {
        const gen = this.gen
        const mission = this.current()
        this.state = 'flow'
        this.header.setHelpEnabled(false)
        this.bubble.hide()
        this.hand.stop()
        this.hinted = null
        this.gear.hint(null)
        this.gear.send(id)
        this.sendSound(id)

        await this.flow.travel(this.upPath(id, route.up), route.payload)
        if (gen !== this.gen) return
        this.board.think(true)
        this.board.blink()
        this.audio.think()
        await FX.wait(this, TIMING.think)
        if (gen !== this.gen) return
        this.board.think(false)

        const goal = mission.goal
        const reached = route.down.some(d => d.to === goal.at)
        if (!route.down.length || (route.payload === goal.payload && !reached)) {
            this.think(MISSING[goal.at] ?? MISSING.monitor ?? '', this.board.chip(), 2600)
        }
        await Promise.all(
            route.down.map(async d => {
                await this.flow.travel(this.downPath(d.hops, d.to), route.payload)
                if (gen !== this.gen) return
                this.takeSound(d.to)
                await this.gear.take(d.to, route.payload)
            }),
        )
        if (gen !== this.gen) return
        if (route.payload === goal.payload && reached) {
            await this.finishMission(gen)
            return
        }
        this.play()
    }

    private center(id: DeviceId): Vec {
        return this.gear.at(id)
    }

    /** Do aparelho até o processador, cabo por cabo. */
    private upPath(source: DeviceId, hops: Hop[]): Vec[] {
        const pts: Vec[] = [this.center(source)]
        hops.forEach((hop, i) => {
            pts.push(...this.gear.cable(hop.device))
            const owner = this.net.sockets.get(hop.socket)?.owner
            if (i < hops.length - 1 && owner && owner !== 'pc') pts.push(this.center(owner))
        })
        pts.push(this.board.chip())
        return pts
    }

    /** Do processador até o destino: sai pela tomada e desce cada cabo ao contrário. */
    private downPath(hops: Hop[], to: DeviceId): Vec[] {
        const pts: Vec[] = [this.board.chip()]
        hops.forEach(hop => {
            pts.push(...[...this.gear.cable(hop.device)].reverse())
            pts.push(this.center(hop.device))
        })
        if (!hops.length) pts.push(this.center(to))
        return pts
    }

    private sendSound(id: DeviceId) {
        if (id === 'teclado') this.audio.type()
        else if (id === 'camera') this.audio.shutter()
        else if (id === 'microfone') this.audio.voice()
        else this.audio.blip()
    }

    private takeSound(id: DeviceId) {
        if (id === 'pendrive') this.audio.gulp()
        else if (id === 'altofalante') this.audio.melody()
        else this.audio.pop()
    }

    // ───────────────────────────────────────────── os pedidos

    private current(): MissionDef {
        return this.level.missions[Math.min(this.mission, this.level.missions.length - 1)]
    }

    private ready(m: MissionDef) {
        return m.needs.every(id => this.net.powered(id))
    }

    private checkReady() {
        if (this.state !== 'play') return
        const m = this.current()
        this.hinted = this.ready(m) ? m.use : null
        this.gear.hint(this.hinted)
        if (this.hinted) {
            this.header.ask(LABEL.tapNow(DEVICES[m.use]), true)
            this.hand.tapLoop(this.gear.at(m.use))
        } else {
            this.header.ask(m.ask)
            this.hand.stop()
        }
    }

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.gear.ids().forEach(id => void this.gear.hide(id))
        await this.setTable(gen, 0)
        if (gen !== this.gen) return
        if (this.introduce) {
            await this.demo(gen)
            if (gen !== this.gen) return
        }
        await this.teachMemory(gen)
        if (gen !== this.gen) return
        this.play()
    }

    /** A novidade aparece com demonstração só na primeira vez da sessão. */
    private firstTime(topic: string): boolean {
        const key = teachKey(topic)
        if (this.registry.get(key)) return false
        this.registry.set(key, true)
        return true
    }

    /**
     * A estreia da MEMÓRIA, ao lado do ARMAZENAMENTO: a bolinha entra na
     * tomada da memória e some ("só agora"); entra no baú e fica ("para sempre").
     */
    private async teachMemory(gen: number) {
        const m = this.current()
        if (m.teach !== 'memoria' || !this.firstTime(m.teach)) return
        this.demoing = true
        this.skip = false
        this.markers.visible(false)
        this.header.setHelpEnabled(false)
        this.hand.stop()
        const on = () => gen === this.gen && !this.skip
        const chip = this.board.chip()
        try {
            for (const kind of ['memoria', 'armazenamento'] as Kind[]) {
                const id = this.board.pcSocket(kind)
                if (!id) continue
                const s = this.board.socketAt(id)
                const away = this.awayFrom(kind, s)
                await this.view.zoomTo({ x: Phaser.Math.Linear(s.x, chip.x, 0.35), y: Phaser.Math.Linear(s.y, chip.y, 0.35) }, ZOOM.bottom, TIMING.zoom)
                if (!on()) return
                this.caption.say(CAPTION[kind], KIND_COLOR[kind])
                void this.board.ping(id)
                this.audio.blip()
                await this.flow.travel([chip, s, away], 'texto', KIND_COLOR[kind])
                if (!on()) return
                const dot = this.view.world(this.add.circle(away.x, away.y, 18, KIND_COLOR[kind], 1).setDepth(DEPTH.fx))
                dot.setStrokeStyle(5, C.white, 1)
                if (kind === 'memoria') {
                    this.caption.say(CAPTION.forget, KIND_COLOR[kind])
                    await FX.wait(this, 500)
                    await FX.to(this, dot, { alpha: 0, scale: 0.2 }, { duration: 700 })
                } else {
                    this.audio.gulp()
                    this.caption.say(CAPTION.keep, KIND_COLOR[kind])
                    await FX.to(this, dot, { scale: 1.3 }, { duration: 260, yoyo: true })
                    await FX.wait(this, 900)
                }
                dot.destroy()
                if (!on()) return
                await FX.wait(this, 350)
                if (!on()) return
            }
            await this.view.zoomTo(HOME, 1, TIMING.zoom)
            if (!on()) return
            this.audio.wake()
            this.caption.say(CAPTION.yourTurn, C.yes)
            await FX.wait(this, TIMING.caption)
        } finally {
            if (gen === this.gen) await this.endDemo()
        }
    }

    /**
     * A estreia de um aparelho que dá tomada (o HUB) ou de uma cadeia de dois
     * cabos (o cartão na câmera, que está no hub): a bolinha percorre o caminho
     * entre o processador e a tomada nova.
     */
    private async teachNest(gen: number, owner: DeviceId, socket: string, kind: Kind) {
        const down = [...this.downPath(this.net.chain(owner).reverse(), owner), this.board.socketAt(socket)]
        const path = kind === 'entrada' ? [...down].reverse() : down
        const xs = path.map(p => p.x)
        const ys = path.map(p => p.y)
        const focus = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
        const zoom = Phaser.Math.Clamp(Math.min(VIEW.w / (Math.max(...xs) - Math.min(...xs) + 360), VIEW.h / (Math.max(...ys) - Math.min(...ys) + 300)), 0.8, ZOOM.socket)
        await this.view.zoomTo(focus, zoom, TIMING.zoom)
        if (gen !== this.gen) return
        this.caption.say(owner === 'hub' ? CAPTION.hub : CAPTION.chain, KIND_COLOR[kind])
        this.audio.blip()
        if (owner === 'hub') {
            for (const s of DEVICES.hub.sockets ?? []) {
                void this.board.ping(s.id)
                await FX.wait(this, 180)
            }
        }
        await this.flow.travel(path, 'texto', KIND_COLOR[kind])
        if (gen !== this.gen) return
        await FX.wait(this, 500)
    }

    /**
     * A demonstração, quase sem texto: zoom no processador, zoom em cada tomada
     * com a informação de luz entrando, saindo e indo para o baú, e a mãozinha
     * puxando um cabo até a frente do computador ("qual tomada?"). Ela não
     * encaixa o plugue: a escolha fica para a criança. Um toque pula tudo.
     */
    private async demo(gen: number) {
        this.demoing = true
        this.skip = false
        this.markers.visible(false)
        this.header.setHelpEnabled(false)
        this.bubble.hide()
        this.hand.stop()
        this.gear.hint(null)
        const on = () => gen === this.gen && !this.skip
        const chip = this.board.chip()
        try {
            await this.view.zoomTo(chip, ZOOM.chip, TIMING.zoom)
            if (!on()) return
            this.caption.say(CAPTION.chip)
            this.board.think(true)
            this.audio.think()
            await FX.wait(this, TIMING.caption)
            this.board.think(false)
            if (!on()) return

            for (const kind of KINDS) {
                const id = this.board.pcSocket(kind)
                if (!id) continue
                const s = this.board.socketAt(id)
                const away = this.awayFrom(kind, s)
                // O enquadramento fica perto da tomada, mas ainda pega o processador.
                const focus = { x: Phaser.Math.Linear(s.x, chip.x, 0.35), y: Phaser.Math.Linear(s.y, chip.y, 0.35) }
                await this.view.zoomTo(focus, kind === 'entrada' || kind === 'saida' ? ZOOM.socket : ZOOM.bottom, TIMING.zoom)
                if (!on()) return
                this.caption.say(CAPTION[kind], KIND_COLOR[kind])
                this.audio.blip()
                void this.board.ping(id)
                await this.flow.travel(kind === 'entrada' ? [away, s, chip] : [chip, s, away], 'texto', KIND_COLOR[kind])
                if (kind === 'armazenamento') this.audio.gulp()
                await FX.wait(this, 450)
                if (!on()) return
            }

            await this.view.zoomTo(HOME, 1, TIMING.zoom)
            if (!on()) return
            const id = this.current().needs.find(d => this.gear.visible(d) && !this.net.socketOf(d))
            if (!id) return
            this.caption.say(CAPTION.drag)
            this.audio.grab()
            const from = this.gear.plugAt(id)
            await this.hand.drag(from, this.frontOf(from), TIMING.demoDrag, at => this.gear.hold(id, at))
            if (!on()) return
            this.caption.say(CAPTION.which)
            for (const kind of KINDS) {
                const sid = this.board.pcSocket(kind)
                if (!sid) continue
                this.audio.blip()
                await this.board.ping(sid)
                if (!on()) return
            }
            await FX.wait(this, 400)
            if (!on()) return
            this.hand.stop()
            await this.gear.retract(id)
            if (!on()) return
            this.audio.wake()
            this.caption.say(CAPTION.yourTurn, C.yes)
            await FX.wait(this, TIMING.caption)
        } finally {
            if (gen === this.gen) await this.endDemo()
        }
    }

    private async endDemo() {
        this.hand.stop()
        this.board.think(false)
        this.caption.hide()
        this.flow.clear()
        this.gear.ids().forEach(id => {
            if (this.gear.visible(id) && !this.net.socketOf(id)) void this.gear.retract(id)
        })
        await this.view.zoomTo(HOME, 1, TIMING.zoom / 2)
        this.updatePower()
        this.markers.visible(true)
        this.demoing = false
        this.skip = false
    }

    private awayFrom(kind: Kind, s: Vec): Vec {
        if (kind === 'entrada') return { x: s.x - 200, y: s.y }
        if (kind === 'saida') return { x: s.x + 200, y: s.y }
        return { x: s.x, y: s.y + 85 }
    }

    /** Muda o aparelho de lugar, e as tomadas dele vão junto. */
    private placeDevice(id: DeviceId, at: Vec) {
        this.gear.place(id, at)
        this.board.moveOwner(id, at)
    }

    /** Em frente ao computador, do lado de onde o plugue vem, sem escolher tomada. */
    private frontOf(from: Vec): Vec {
        return { x: PC.x + (from.x < PC.x ? -240 : 240), y: PC.y + 90 }
    }

    /** As tomadas dos aparelhos só valem no pedido do aninhamento. */
    private nestOn(): boolean {
        return this.level.nested && Boolean(this.current().nested)
    }

    /** Uma tomada livre e acesa desta família num aparelho (não no computador). */
    private ownSocket(kind: Kind, except: DeviceId) {
        if (!this.nestOn()) return undefined
        return [...this.net.sockets.values()].find(
            s => s.owner !== 'pc' && s.owner !== except && s.kind === kind && this.net.open(s.id) && !this.net.occupant(s.id),
        )
    }

    /**
     * O aninhamento chegando: com os primeiros aparelhos ligados, a câmera vai até
     * a tomada própria do monitor, ela pula, e o aparelho que vai nela entra na mesa.
     * Devolve `true` quando assumiu a vez (e já devolveu o jogo à criança).
     */
    private async reveal(gen: number): Promise<boolean> {
        const m = this.current()
        const waiting = (m.later ?? []).filter(id => !this.gear.visible(id))
        if (!waiting.length) return false
        if (!m.needs.filter(id => !m.later?.includes(id)).every(id => this.net.powered(id))) return false
        this.state = 'intro'
        this.header.setHelpEnabled(false)
        this.hand.stop()
        let last: Vec = HOME
        for (const id of waiting) {
            const own = this.ownSocket(DEVICES[id].kind, id)
            if (own && own.owner !== 'pc') {
                if (m.teach && this.firstTime(m.teach)) {
                    await this.teachNest(gen, own.owner, own.id, own.kind)
                    if (gen !== this.gen) return true
                }
                const at = this.board.socketAt(own.id)
                await this.view.zoomTo(at, ZOOM.socket, TIMING.zoom)
                if (gen !== this.gen) return true
                this.caption.say(CAPTION.nest(DEVICES[own.owner]), KIND_COLOR[own.kind])
                this.audio.blip()
                await this.board.ping(own.id)
                await this.board.ping(own.id)
                if (gen !== this.gen) return true
            }
            const place = m.place[id]
            if (place) this.placeDevice(id, place)
            this.audio.wake()
            await this.gear.show(id)
            if (gen !== this.gen) return true
            this.updatePower()
            const socket = own ? this.board.socketAt(own.id) : HOME
            const device = this.gear.at(id)
            last = { x: (socket.x + device.x) / 2, y: (socket.y + device.y) / 2 }
            await this.view.panTo(last, TIMING.zoom)
            if (gen !== this.gen) return true
            await FX.wait(this, TIMING.caption)
            if (gen !== this.gen) return true
        }
        this.caption.hide()
        await this.view.zoomTo(last, 1, TIMING.zoom)
        if (gen !== this.gen) return true
        this.play()
        return true
    }

    /** A criança parou: a mãozinha mostra de novo o gesto de puxar o cabo. */
    private async nudge() {
        const id = this.current().needs.find(d => this.gear.visible(d) && !this.net.socketOf(d))
        if (!id) return
        const from = this.gear.plugAt(id)
        // No aninhamento, o aparelho que entrou depois vai para o lado do dono
        // da tomada (o monitor). A mãozinha para no caminho, sem encaixar.
        const own = this.current().later?.includes(id) ? this.ownSocket(DEVICES[id].kind, id) : undefined
        const to = own ? Phaser.Math.LinearXY(new Phaser.Math.Vector2(from.x, from.y), new Phaser.Math.Vector2(this.board.socketAt(own.id)), 0.6) : this.frontOf(from)
        await this.hand.drag(from, { x: to.x, y: to.y }, TIMING.demoDrag)
        await FX.wait(this, 300)
        if (this.state === 'play' && !this.hinted) this.hand.stop()
    }

    /**
     * Monta a mesa do pedido: com `reset`, os cabos se soltam e os aparelhos do
     * pedido anterior saem; os deste pedido aparecem no lugar deles.
     */
    private async setTable(gen: number, index: number) {
        this.mission = index
        const m = this.current()
        this.header.setPhase(index)
        this.header.ask(m.ask)
        const jobs: Promise<void>[] = []
        if (this.level.reset) {
            this.gear.ids().forEach(id => {
                if (this.net.socketOf(id)) {
                    this.net.unplug(id)
                    jobs.push(this.gear.retract(id))
                }
            })
            this.updatePower()
        }
        await FX.all(...jobs, this.view.panTo(HOME, TIMING.pan))
        if (gen !== this.gen) return
        const table = onTable(m)
        const leaving = this.gear.ids().filter(id => this.gear.visible(id) && !table.includes(id) && (this.level.reset || !this.net.socketOf(id)))
        await FX.all(...leaving.map(id => this.gear.hide(id)))
        if (gen !== this.gen) return
        for (const id of table) {
            const at = m.place[id]
            if (m.later?.includes(id)) {
                if (this.gear.visible(id)) await this.gear.hide(id)
                continue
            }
            if (!this.gear.visible(id)) {
                if (at) this.placeDevice(id, at)
                this.audio.pop()
                await this.gear.show(id)
            } else if (at && !this.net.socketOf(id) && (this.gear.at(id).x !== at.x || this.gear.at(id).y !== at.y)) {
                await this.gear.hide(id)
                this.placeDevice(id, at)
                await this.gear.show(id)
            }
            if (gen !== this.gen) return
        }
        this.updatePower()
    }

    private play() {
        this.state = 'play'
        this.idleSince = this.time.now
        this.header.setHelpEnabled(true)
        this.checkReady()
    }

    private async finishMission(gen: number) {
        const m = this.current()
        this.state = 'flow'
        this.hinted = null
        this.gear.hint(null)
        this.done += 1
        this.audio.good()
        this.emitCheckpoint()
        const chip = this.view.toScreen(this.board.chip())
        void FX.sparks(this, chip.x, chip.y, { color: C.spark, count: 20, spread: 160, depth: DEPTH.bubble - 1 })
        await this.header.celebrate(this.mission)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.done)
        if (gen !== this.gen) return
        await this.view.panTo(HOME, TIMING.pan)
        if (gen !== this.gen) return
        this.caption.say(m.done, C.yes)
        await FX.wait(this, TIMING.recap)
        if (gen !== this.gen) return
        this.caption.hide()
        if (this.mission + 1 >= this.level.missions.length) {
            void this.endLevel()
            return
        }
        this.state = 'intro'
        await this.setTable(gen, this.mission + 1)
        if (gen !== this.gen) return
        await this.teachMemory(gen)
        if (gen !== this.gen) return
        this.play()
    }

    private think(text: string, worldAt: Vec, ms: number) {
        const s = this.view.toScreen(worldAt)
        this.bubble.think(text, { x: s.x, y: Phaser.Math.Clamp(s.y, VIEW.y + 120, VIEW.y + VIEW.h) }, ms)
    }

    // ───────────────────────────────────────────── erro

    private async wrong(gen: number, id: DeviceId, socket: string) {
        this.state = 'error'
        this.header.setHelpEnabled(false)
        this.hand.stop()
        this.hinted = null
        this.gear.hint(null)
        const at = this.board.socketAt(socket)
        await this.gear.snap(id, at)
        if (gen !== this.gen) return
        this.audio.zap()
        const s = this.view.toScreen(at)
        void FX.sparks(this, s.x, s.y, { color: C.coral, count: 22, spread: 120, depth: DEPTH.bubble - 1 })
        FX.shakeCam(this, 'leve')
        this.gear.nope(id)
        await this.gear.retract(id)
        if (gen !== this.gen) return
        this.banner.say(`${LABEL.oops} ${DEVICES[id].why}`)
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    /** O "?" passa a demonstração de novo. */
    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'help'
        this.hand.stop()
        await this.demo(gen)
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.header.ask('')
        this.hand.stop()
        this.audio.win()
        void FX.confetti(this, { colors: [C.entrada, C.saida, C.armazenamento, C.accentYellow, C.accentBlue] })
        await FX.wait(this, TIMING.finale)
        if (gen !== this.gen) return

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()
        this.state = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.accent,
            messageColor: CSS.inkSoft,
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.missions.length, current: this.level.missions.length },
            ...(!last
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () => this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.accent,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.min(100, Math.round((this.done / this.level.missions.length) * 100)),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') this.score = command.points ?? this.score
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
