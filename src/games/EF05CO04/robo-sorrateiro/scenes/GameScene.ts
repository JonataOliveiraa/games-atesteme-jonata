import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { formatTime } from '../../../../shared/hud/createTimeBar'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'

import { cards as cardList, owl as owlDef } from '../data/cast'
import {
    LEVELS,
    STEP_MS,
    legsIn,
    branchOf,
    pointsFor,
    solverIndex,
    stepOutcome,
    validateLevels,
} from '../data/levels'
import { CARD, DEPTH, H, HUD, OWL, PATH, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import type { Card, LevelDef, Phase, RoomDef } from '../types'

import { createRoom, type Room } from './room'
import { createOwl, type Owl } from './owl'
import { createRobot, type Robot } from './robot'
import { createCards, type CardsView } from './cards'
import { createHud, type Hud } from './hud'
import { createMel, type Mel } from './mel'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'robo-sorrateiro'

/** O enquadramento da escolha: perto da coruja e do robô, os dois na tela. */
const ZOOM = { close: 1.22, wide: 1, run: 1.42, owl: 1.72, caught: 1.5 } as const

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private roomIndex = 0
    private legIndex = 0
    private phase: Phase = 'intro'
    private gen = 0

    /** O relógio do mundo. Só anda com o plano rodando — na placa tudo para. */
    private clock = 0

    /** Ligado durante um corte de câmera: o mundo espera a cena terminar. */
    private cut = false

    /** O último aviso que a Mel deu, para ela não repetir a mesma frase. */
    private alert = ''
    private tipTurn = 0

    private offered: Card[] = []
    private solver = 0
    private armedCard?: Card
    private errorsInLeg = 0
    private chargedThisLeg = false

    private score = 0
    private hits = 0
    private errors = 0
    private legsDone = 0
    private startedAt = 0

    private room!: Room
    /**
     * UMA CORUJA POR TRECHO.
     *
     * Cada pedaço do caminho tem a sua guardiã, com o ritmo dela, e todas
     * ficam na tela ao mesmo tempo: a criança vê que o trecho seguinte é
     * vigiado por outra, que dorme e acorda noutro tempo. Quem manda no passo
     * é só a do trecho de agora — as outras continuam vivas, piscando o
     * círculo delas.
     */
    private owls: Owl[] = []
    private robot!: Robot
    private cards!: CardsView
    private hud!: Hud
    private mel!: Mel
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics

    /** A câmera de cima, que NÃO acompanha o zoom: cartas, HUD, Mel, tutorial. */
    private ui!: Phaser.Cameras.Scene2D.Camera

    private unsubPlatform?: () => void

    private get roomDef(): RoomDef {
        return this.level.rooms[this.roomIndex]
    }

    /** A guardiã do trecho de agora — a que decide o passo. */
    private get owl(): Owl | undefined {
        return this.owls[this.legIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.roomIndex = 0
        this.legIndex = 0
        this.phase = 'intro'
        this.clock = 0
        this.armedCard = undefined
        this.errorsInLeg = 0
        this.chargedThisLeg = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.legsDone = 0
    }

    create() {
        this.input.topOnly = true
        this.startedAt = Date.now()

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.ui = this.cameras.add(0, 0, W, H)

        this.audio = createAudio()
        this.room = createRoom(this)
        this.robot = createRobot(this, {
            onHide: x => this.room.tuck(x),
            onShow: () => this.room.tuck(),
        })
        this.cards = createCards(this, { onPick: index => void this.pick(index) })
        this.mel = createMel(this)
        this.hud = createHud(this, {
            rooms: this.level.rooms.length,
            level: this.level.level,
            levels: LEVELS.length,
            onHelp: () => this.replayTutorial(),
        })
        this.frame = this.add.graphics().setDepth(DEPTH.frame).setAlpha(0)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.livesY,
            size: 30,
            tint: C.red,
            color: CSS.white,
            stroke: CSS.ink,
            strokeThickness: 6,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startRoom(0)
    }

    update(_time: number, delta: number) {
        this.assignCameras()
        if (this.phase === 'running' && !this.cut) this.clock += delta
        this.owls.forEach(owl => owl.tick(this.clock))
        if (this.phase === 'running' && !this.cut) this.watchOwl()
    }

    /**
     * DUAS CÂMERAS, SEPARADAS PELA PROFUNDIDADE.
     *
     * A de baixo é a sala, e é ela que dá o zoom na hora da escolha. A de cima
     * é a interface — cartas, HUD, Mel, tutorial —, que não pode aproximar
     * junto, senão a carta sai da tela quando a câmera chega perto da coruja.
     * `ignore` é uma máscara de bits no objeto, então repetir não custa nada.
     */
    private assignCameras() {
        const list = this.children.list
        for (let i = 0; i < list.length; i++) {
            const object = list[i]
            const depth = (object as unknown as { depth?: number }).depth ?? 0
            if (depth >= DEPTH.card) this.cameras.main.ignore(object)
            else this.ui.ignore(object)
        }
    }

    /**
     * A MEL AVISA O QUE A CORUJA VAI FAZER.
     *
     * Enquanto o plano roda, ela olha o aro e fala uma frase curta em cada
     * virada: quando está para acordar, quando acordou e quando dormiu de
     * novo. Uma frase por virada — `alert` guarda a última, para ela não ficar
     * repetindo a mesma coisa em cima do jogo.
     */
    private watchOwl() {
        if (!this.owl) return
        const awake = this.owl.awakeAt(this.clock)
        const left = this.owl.leftAt(this.clock)

        const now = awake ? 'acordada' : left < 0.35 ? 'quase' : 'dormindo'
        if (now === this.alert) return
        this.alert = now

        if (now === 'quase') this.mel.say('Cuidado! Ela vai acordar.')
        else if (now === 'acordada') this.mel.say('Acordou! Agora não pode andar.')
        else this.mel.say('Dormiu! Agora dá para andar.')
    }

    private shutdownScene() {
        this.gen++
        this.mel?.destroy()
        this.hud?.destroy()
        this.cards?.destroy()
        this.robot?.destroy()
        this.owls.splice(0).forEach(owl => owl.destroy())
        this.room?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ───────────────────────────── a câmera ────────────────────────────── */

    /**
     * O ENQUADRAMENTO ÉPICO.
     *
     * A câmera chega perto da coruja e do robô — os dois na tela, com o aro de
     * tempo inteiro. O alvo vertical não é o meio da tela: é o meio da FAIXA
     * que sobra acima das cartas, senão o robô fica escondido atrás delas. E o
     * centro é preso dentro do fundo, para não aparecer borda preta.
     */
    private closeUp(ms = 780) {
        const owl = this.owl?.point() ?? { x: W / 2, y: 260 }
        const cam = this.cameras.main

        const zoom = ZOOM.close
        const top = owl.y + OWL.ringDy - OWL.ringR - 10

        /*
         * O QUE MANDA NO ENQUADRAMENTO É O TOPO.
         *
         * A coruja e o aro de tempo têm de aparecer INTEIROS logo abaixo do
         * HUD; o robô entra no que sobrar, e os pés dele podem encostar atrás
         * das cartas — ele tem 122 px de altura e se lê pela cabeça. Tentar
         * caber os dois por completo obrigava a câmera a AFASTAR quando as
         * cartas cresceram, que é o contrário do que a cena pede.
         */
        const cx = Phaser.Math.Clamp((owl.x + this.robot.x()) / 2, W / (2 * zoom), W - W / (2 * zoom))
        const cy = Phaser.Math.Clamp(
            top + (H / 2 - (HUD.h + 16)) / zoom,
            H / (2 * zoom),
            H - H / (2 * zoom),
        )

        cam.pan(cx, cy, ms, 'Sine.easeInOut')
        cam.zoomTo(zoom, ms, 'Back.easeOut')
    }

    /** Aponta a câmera para um ponto do mundo, sem deixar sobrar borda. */
    private lookAt(x: number, y: number, zoom: number, ms: number, ease = 'Sine.easeInOut') {
        const cam = this.cameras.main
        cam.pan(
            Phaser.Math.Clamp(x, W / (2 * zoom), W - W / (2 * zoom)),
            Phaser.Math.Clamp(y, H / (2 * zoom), H - H / (2 * zoom)),
            ms, ease,
        )
        cam.zoomTo(zoom, ms, ease)
    }

    /** A câmera no robô, que é quem vai agir. */
    private robotShot(ms = 460, toX = this.robot.x(), ease = 'Sine.easeInOut') {
        this.lookAt(toX + 30, PATH.y - 40, ZOOM.run, ms, ease)
    }

    /**
     * O CORTE PARA A CORUJA.
     *
     * A virada dela é o que decide o passo, então ela ganha a tela: a câmera
     * vai até lá, ela acorda (ou dorme) com calma, e só depois a tela volta
     * para o robô. O relógio do mundo fica parado o tempo todo — a cena não
     * pode fazer o plano avançar sozinho.
     */
    private async owlBeat(awake: boolean, ms = 560) {
        const owl = this.owl?.point() ?? { x: W / 2, y: OWL.y }
        this.lookAt(owl.x, owl.y + 40, ZOOM.owl, ms, 'Back.easeOut')
        await FX.wait(this, ms)
        this.audio.wake()
        await (awake ? this.owl?.wakeShow() : this.owl?.sleepShow())
        await FX.wait(this, 240)
    }

    private wideShot(ms = 520) {
        const cam = this.cameras.main
        cam.pan(W / 2, H / 2, ms, 'Sine.easeInOut')
        cam.zoomTo(ZOOM.wide, ms, 'Sine.easeInOut')
    }

    /** Corta seco para a sala inteira. Usado ao trocar de sala e no tutorial. */
    private cutWide() {
        const cam = this.cameras.main
        cam.panEffect.reset()
        cam.zoomEffect.reset()
        cam.setZoom(ZOOM.wide)
        cam.centerOn(W / 2, H / 2)
    }

    /* ─────────────────────────────── a sala ────────────────────────────── */

    private async startRoom(index: number) {
        const gen = ++this.gen
        this.roomIndex = index
        this.phase = 'intro'
        this.mel.hide()
        this.cards.setEnabled(false)
        this.cutWide()

        const def = this.roomDef
        this.room.build(def.legs.map(leg => leg.steps))
        this.hud.setDone(index)

        this.owls.splice(0).forEach(owl => owl.destroy())
        this.clock = 0
        def.legs.forEach((leg, index) => {
            const kind = owlDef(leg.owl)
            const span = kind.cycle.asleep + kind.cycle.awake
            this.owls.push(createOwl(this, kind, Phaser.Math.Between(0, span)))
            this.placeOwl(index)
        })

        this.robot.placeAt(this.room.entryPoint().x)
        await this.room.drawPath()
        if (gen !== this.gen) return

        await this.robot.walkTo(this.room.signPoint(0).x, 800)
        if (gen !== this.gen) return

        void this.startLeg(0)
    }

    private placeOwl(leg: number) {
        const def = this.roomDef.legs[leg]
        const from = this.room.signPoint(leg).x
        const to = this.room.stepPoint(leg, def.steps - 1).x
        this.owls[leg]?.place((from + to) / 2, from - 70, to + 80)
    }

    /* ────────────────────────────── o trecho ───────────────────────────── */

    private async startLeg(index: number) {
        const gen = ++this.gen
        this.legIndex = index
        this.errorsInLeg = 0
        this.chargedThisLeg = false
        this.armedCard = undefined

        const def = this.roomDef.legs[index]
        const owl = owlDef(def.owl)

        this.robot.placeAt(this.room.signPoint(index).x)

        this.offered = Phaser.Utils.Array.Shuffle(cardList(def.cards).slice())
        this.solver = Math.max(0, solverIndex(this.offered, owl.cycle, def.steps))

        this.phase = 'choosing'
        const first = this.roomIndex === 0 && index === 0
        if (!first) this.closeUp()

        await this.cards.open(this.offered, owl.column)
        if (gen !== this.gen) return

        this.cards.setEnabled(true)
        if (first) this.runTutorial(true)
        else this.mel.say(this.nextTip())
    }

    /**
     * As dicas da placa: uma frase curta por vez, em rodízio. Elas falam do
     * que está na tela — o círculo, a coruja, os dois casos —, nunca de regra
     * nem de condição.
     */
    private nextTip(): string {
        const tips = [
            'O círculo mostra quando ela acorda.',
            'Ela dorme e acorda sozinha.',
            'Escolha o que fazer nos dois casos.',
        ]
        return tips[this.tipTurn++ % tips.length]
    }

    private async pick(index: number) {
        if (this.phase !== 'choosing') return
        const gen = ++this.gen
        // A fase muda AQUI, e não só quando o trecho começa a rodar: entre o
        // toque e o primeiro passo há quase um segundo de animação, e sem isso
        // um segundo toque entrava por cima e matava a jogada anterior.
        this.phase = 'running'
        this.alert = ''
        this.mel.say('Vamos ver!')
        this.wideShot()

        this.armedCard = this.offered[index]
        this.audio.pick()
        await this.cards.arm(index)
        if (gen !== this.gen) return

        await FX.wait(this, 320)
        if (gen !== this.gen) return

        void this.runLeg()
    }

    /**
     * O trecho, passo a passo. A cada passo a regra é lida de novo contra o
     * estado da coruja NAQUELE instante — é o coração do jogo, e é por isso
     * que a mesma carta acende as duas linhas numa travessia só.
     */
    private async runLeg() {
        const gen = ++this.gen
        const card = this.armedCard
        const def = this.roomDef.legs[this.legIndex]
        if (!card || !this.owl) return

        this.phase = 'running'
        let done = 0
        let stuck = 0
        let was = this.owl.awakeAt(this.clock)

        // Abertura: a tela mostra a coruja como ela está agora...
        this.cut = true
        await this.owlBeat(was, 620)
        if (gen !== this.gen) return

        // ...e volta para o robô, que é quem vai andar.
        this.robotShot(520)
        await FX.wait(this, 460)
        if (gen !== this.gen) return

        while (done < def.steps) {
            this.cut = true
            const awake = this.owl.awakeAt(this.clock)

            // A CORUJA VIROU: isso é uma cena, não um detalhe no canto.
            if (awake !== was) {
                was = awake
                await this.owlBeat(awake)
                if (gen !== this.gen) return
                this.robotShot(520)
                await FX.wait(this, 460)
                if (gen !== this.gen) return
            }

            // A linha acende ANTES de o robô mexer: primeiro a regra decide,
            // depois a decisão acontece.
            const branch = branchOf(card, awake)
            this.cards.light(branch)
            this.audio.branch(branch)
            await FX.wait(this, 320)
            if (gen !== this.gen) return

            const verdict = stepOutcome(card, awake, stuck)
            this.cut = false

            if (verdict === 'visto') {
                const target = this.room.stepPoint(this.legIndex, done).x
                this.robotShot(STEP_MS / 2, target, 'Linear')
                await this.robot.walkTo((this.robot.x() + target) / 2, STEP_MS / 2)
                if (gen !== this.gen) return
                void this.caught()
                return
            }

            if (verdict === 'parado') {
                void this.stalled()
                return
            }

            if (verdict === 'andou') {
                this.audio.step()
                const target = this.room.stepPoint(this.legIndex, done).x
                this.robotShot(STEP_MS, target, 'Linear')
                await this.robot.walkTo(target, STEP_MS)
                done += 1
                stuck = 0
            } else {
                this.audio.duck()
                await this.robot.duck(STEP_MS)
                stuck += 1
            }

            if (gen !== this.gen) return
        }

        this.cut = false
        void this.legWon()
    }

    /* ─────────────────────────── ganhou o trecho ───────────────────────── */

    private async legWon() {
        const gen = ++this.gen
        this.cut = false
        const points = pointsFor(this.errorsInLeg > 0)
        this.score += points
        this.hits += 1
        this.legsDone += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.phase = 'replay'
        this.cards.light(undefined)
        this.wideShot(360)
        await this.robot.stand()
        if (gen !== this.gen) return

        this.audio.win()
        void this.flashFrame(C.green)
        void this.cards.stow()

        const next = this.legIndex + 1
        if (next < this.roomDef.legs.length) {
            await FX.wait(this, 500)
            if (gen !== this.gen) return
            void this.startLeg(next)
            return
        }
        void this.roomWon()
    }

    private async roomWon() {
        const gen = ++this.gen
        this.phase = 'replay'
        this.mel.hide()

        await this.robot.walkTo(this.room.doorPoint().x, 800)
        if (gen !== this.gen) return

        this.robot.say(this.roomDef.close, 1800)
        void this.room.knockDoor()
        void this.robot.cheer()
        void FX.sparks(this, this.room.doorPoint().x, PATH.y - 60, { color: C.cone, count: 18 })
        void this.hud.celebrate(this.roomIndex)
        await FX.wait(this, 1500)
        if (gen !== this.gen) return

        const next = this.roomIndex + 1
        if (next < this.level.rooms.length) {
            void this.startRoom(next)
            return
        }
        void this.finishLevel()
    }

    /* ───────────────────────────── os dois erros ───────────────────────── */

    private async caught() {
        const gen = ++this.gen
        this.cut = false
        this.phase = 'locked'
        this.audio.caught()
        void this.flashFrame(C.red)

        // O flagra é o momento grande do erro: a câmera pula em cima dos dois.
        const owl = this.owl?.point() ?? { x: W / 2, y: 260 }
        this.cameras.main.pan((owl.x + this.robot.x()) / 2, (owl.y + PATH.y) / 2, 220, 'Sine.easeOut')
        this.cameras.main.zoomTo(ZOOM.caught, 240, 'Back.easeOut')
        FX.shakeCam(this, 'leve')

        this.robot.say('Ela me viu!', 1600)
        void this.owl?.laugh()
        await this.robot.caught()
        if (gen !== this.gen) return
        await this.fail('A coruja acordada vê quem anda.')
    }

    private async stalled() {
        const gen = ++this.gen
        this.cut = false
        this.phase = 'locked'
        this.audio.stall()
        void this.flashFrame(C.red)
        this.robot.say('Não saí do lugar.', 1600)
        await this.robot.shrug()
        if (gen !== this.gen) return
        await this.fail('Escondido o tempo todo, ele não chega.')
    }

    private async fail(why: string) {
        const gen = this.gen
        this.errorsInLeg += 1
        this.chargeOnce()
        this.cards.light(undefined)
        this.mel.say(why)

        await FX.wait(this, 1400)
        if (gen !== this.gen) return

        this.robot.placeAt(this.room.signPoint(this.legIndex).x)
        this.closeUp(600)
        await this.cards.reopen()
        if (gen !== this.gen) return

        this.phase = 'choosing'
        this.cards.setEnabled(true)

        if (this.errorsInLeg >= 2) this.cards.blink(this.solver)
    }

    /**
     * Uma vida por TRECHO, no primeiro erro dele — e **nenhuma** na sala
     * guiada: ali o erro é aula, não castigo. Sem vida perdida não sai
     * `WRONG_ANSWER`, porque na plataforma um implica o outro.
     */
    private chargeOnce() {
        if (this.chargedThisLeg) return
        this.chargedThisLeg = true
        this.errors += 1
        if (this.roomDef.guided) return
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    /* ───────────────────────────── acabamento ──────────────────────────── */

    private async flashFrame(color: number) {
        this.frame.clear()
        this.frame.lineStyle(16, color, 1)
        this.frame.strokeRect(8, 8, W - 16, H - 16)
        this.frame.setAlpha(0)
        await FX.to(this, this.frame, { alpha: 1 }, { duration: 80 })
        await FX.to(this, this.frame, { alpha: 0 }, { duration: 380 })
    }

    private async finishLevel() {
        const gen = ++this.gen
        this.phase = 'done'
        this.cards.setEnabled(false)
        this.mel.hide()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.bip, C.green, C.sign, C.cardLift] })
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        const clean = this.errors === 0

        showLevelComplete(this, {
            accent: C.greenDeep,
            panelColor: 0xfffaf0,
            overlayColor: C.night,
            title: clean ? 'Ninguém viu o robô!' : 'O robô chegou!',
            subtitle: formatTime(Date.now() - this.startedAt),
            message: 'A regra decide sozinha: coruja acordada, esconde. Dormindo, anda.',
            progress: { total: LEVELS.length, current: this.level.level },
            ...(last
                ? {
                    buttons: [{
                        label: 'JOGAR DE NOVO',
                        color: C.greenDeep,
                        onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                    }],
                }
                : {
                    autoAdvance: {
                        delay: 2600,
                        label: 'Próximo nível',
                        onComplete: () => this.scene.restart({
                            level: this.level.level + 1,
                            points: this.score,
                            lives: this.livesLeft,
                        }),
                    },
                }),
        })
    }

    /* ─────────────────────────────── tutorial ──────────────────────────── */

    /**
     * Três passos, uma frase curta em cada, apontando para a coisa de verdade
     * na tela — o padrão dos jogos do 1º ao 3º ano. O holofote é desenhado em
     * coordenada de tela, então a câmera volta ao normal enquanto ele roda.
     */
    private tutorialSteps(): TutorialStep[] {
        const owl = this.owl?.point() ?? { x: 640, y: 200 }
        const door = this.room.doorPoint()

        return [
            {
                text: 'Este é o robô. Ele anda sozinho.',
                shape: 'circle',
                x: this.robot.x(), y: PATH.y - 40,
                w: 280, h: 280,
                balloonY: 428,
            },
            {
                text: 'A coruja acorda e dorme sozinha.',
                shape: 'circle',
                x: owl.x, y: owl.y,
                w: 260, h: 260,
                balloonY: 428,
            },
            {
                text: 'Escolha o que o robô faz em cada caso.',
                shape: 'rect',
                x: 640, y: CARD.cy,
                w: 1220, h: 260,
                balloonY: 200,
            },
            {
                text: 'Ele vai até a porta sem ser visto!',
                shape: 'circle',
                x: door.x + 60, y: door.y,
                w: 300, h: 300,
                balloonX: 560, balloonY: 210,
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        const back = this.phase
        this.phase = 'intro'
        this.cards.setEnabled(false)
        this.mel.hide()
        this.cutWide()

        createTutorial(this, {
            key: `ef05co04-robo-l${this.level.level}`,
            once,
            accent: C.sign,
            safeTop: HUD.h + 8,
            textSize: 34,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.phase = back
                if (this.phase !== 'choosing') return
                this.cards.setEnabled(true)
                this.closeUp()
                this.mel.say(this.nextTip())
                    },
        })
    }

    private replayTutorial() {
        if (this.phase !== 'choosing') return
        this.runTutorial(false)
    }

    /* ────────────────────────────── plataforma ─────────────────────────── */

    private emitCheckpoint(final = false) {
        const total = legsIn(this.level.level)
        const done = final ? total : this.legsDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / total) * 100),
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
