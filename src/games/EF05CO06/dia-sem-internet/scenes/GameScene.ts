import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX, type FxTarget } from '../../../../shared/effects/FX'

import {
    LEVELS,
    WRONG_TEXT,
    cheerFor,
    openedAt,
    pointsFor,
    rightPlaces,
    targetsOf,
    validateLevels,
    verdict,
} from '../data/levels'
import { file } from '../data/files'
import {
    ASK,
    BTN,
    DEPTH,
    H,
    HUD,
    RAIL_AIR,
    RAIL_ROOM,
    SCROLL,
    SCROLL_AIR,
    VIEW,
    VIEW_AIR,
    W,
} from '../data/layout'
import { C, CSS } from '../data/theme'
import type { AskDef, LevelDef, Mode, PhaseDef, Place } from '../types'

import { createWorld } from './world'
import { createWorldAir } from './worldAir'
import type { World } from './worldTypes'
import { createButtons, type Buttons } from './buttons'
import { createScroll, type Scroll } from './scroll'
import { createCinema, type Cinema, type Step } from './cinema'
import { createAsk, type Ask } from './ask'
import { createSign, type Sign } from './sign'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'dia-sem-internet'
const IDLE_MS = 12000

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * A TOMADA DE ABERTURA DE CADA MUNDO.
 *
 * É a única parte sem decisão, então ela precisa CONTAR alguma coisa. No quarto
 * ela conta de onde para onde o cabo vai; no ar, que há **dois** aparelhos
 * embaixo da mesma nuvem — e a criança só descobre o segundo porque a câmera vai
 * até lá.
 */
const OPENING: Record<LevelDef['world'], Step[]> = {
    room: [
        { wait: 600 },
        { link: true, wait: 320 },
        { go: 'wire', ms: 760 },
        { go: 'sky', ms: 900 },
        { wait: 800 },
        { go: 'room', ms: 900 },
    ],
    air: [
        { wait: 520 },
        { link: true, wait: 640 },
        { go: 'wide', ms: 720 },
        { wait: 460 },
        { go: 'phone', ms: 880 },
        { wait: 760 },
        { go: 'pc', ms: 980 },
    ],
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phaseIndex = 0
    private askIndex = 0
    private mode: Mode = 'intro'
    private gen = 0

    private missesHere = 0
    private chargedHere = false
    private score = 0
    private errors = 0

    private world!: World
    private buttons!: Buttons
    private scroll!: Scroll
    private cinema!: Cinema
    private ask!: Ask
    private sign!: Sign
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics
    private idle?: Phaser.Time.TimerEvent

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get question(): AskDef {
        return this.phase.asks[this.askIndex]
    }

    /** O mundo do ar corre de lado; o do quarto, de cima a baixo. */
    private get air(): boolean {
        return this.level.world === 'air'
    }

    /** Onde o mundo fica parado quando ninguém está viajando. */
    private get home(): string {
        return this.air ? 'pc' : 'room'
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.askIndex = 0
        this.mode = 'intro'
        this.missesHere = 0
        this.chargedHere = false
        this.score = data?.points ?? 0
        this.errors = 0
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.audio = createAudio()
        this.world = this.air ? createWorldAir(this) : createWorld(this)
        this.buttons = createButtons(this, {
            onPick: target => void this.pick(target),
            onDown: pointer => this.scroll.begin(pointer),
        })
        this.scroll = createScroll(this, {
            stage: () => this.world.stage(),
            rail: this.air ? RAIL_AIR : RAIL_ROOM,
            range: this.air ? SCROLL_AIR : SCROLL,
            onFocus: on => this.focusWorld(on),
        })
        this.ask = createAsk(this)
        this.sign = createSign(this)
        this.hud = createHud(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            onHelp: () => this.replayTutorial(),
        })
        this.cinema = createCinema(this, {
            stage: () => this.world.stage(),
            axis: this.air ? 'x' : 'y',
            views: this.air ? VIEW_AIR : VIEW,
            home: this.home,
            opening: OPENING[this.level.world],
            hide: on => {
                this.hud.setShown(!on)
                this.ask.setShown(!on)
                this.buttons.setShown(!on)
                this.scroll.setShown(!on)
            },
            onLink: () => {
                this.audio.pop()
                this.world.lightLink()
            },
        })
        this.frame = this.add.graphics().setScrollFactor(0).setDepth(DEPTH.frame).setAlpha(0)

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
            tint: C.gold,
            color: CSS.creamSoft,
            stroke: CSS.navyDeep,
            strokeThickness: 6,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.cancelIdle()
        this.cinema?.destroy()
        this.sign?.destroy()
        this.hud?.destroy()
        this.ask?.destroy()
        this.scroll?.destroy()
        this.buttons?.destroy()
        this.world?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }

    /* ─────────────────────────────── a fase ───────────────────────────── */

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.askIndex = 0
        this.missesHere = 0
        this.chargedHere = false
        this.mode = 'intro'

        this.cancelIdle()
        this.hud.setDone(index)
        this.setTurn(false)

        /**
         * TODA TELA NOVA COMEÇA EM CASA.
         *
         * Dentro de uma tela, a vista fica onde a criança deixou — ela escolheu
         * estar ali. Mas uma tela nova é um recomeço, e a fase anterior podia
         * ter terminado na outra ponta do mundo: os cartões novos nasciam fora
         * da vista, e a criança abria a tela olhando para algo que ainda não
         * tinha nada a ver com ela.
         */
        if (index > 0) {
            await this.cinema.go(this.home, 560)
            if (gen !== this.gen) return
        }

        await this.world.mount(this.phase.slots)
        if (gen !== this.gen) return

        await this.buttons.mount(targetsOf(this.level, this.phase))
        if (gen !== this.gen) return

        // a abertura só na primeira tela: ela conta como o mundo é ligado, e
        // repetir isso em toda fase vira espera
        if (index === 0) {
            await this.cinema.open()
            if (gen !== this.gen) return
        }

        await this.askNow(index === 0)
    }

    private async askNow(withTutorial = false) {
        const gen = ++this.gen
        this.mode = 'intro'
        this.setTurn(false)
        this.buttons.stopPulse()
        this.missesHere = 0

        await this.ask.say(`Quero ${file(this.question.file).want}.`)
        if (gen !== this.gen) return

        if (withTutorial) {
            this.runTutorial(true)
            return
        }

        this.armAsking()
    }

    private armAsking() {
        this.mode = 'asking'
        this.setTurn(true)
        this.armIdle()
    }

    /**
     * A VEZ DA CRIANÇA — os botões e a rolagem, sempre juntos.
     *
     * Eles têm de ligar e desligar no mesmo instante: se a rolagem sobrevivesse
     * a uma viagem do `cinema`, o dedo e o tween disputariam a mesma posição do
     * mundo, e o jogo terminaria a viagem convencido de estar num lugar onde
     * não está.
     */
    private setTurn(on: boolean) {
        this.buttons.setEnabled(on)
        this.scroll.setEnabled(on)
    }

    /**
     * ENQUANTO O DEDO PERCORRE O MUNDO, A INTERFACE SAI.
     *
     * O cabeçalho, o pedido e os botões somem: percorrer é um gesto de OLHAR, e
     * três tarjas na tela deixam a criança olhando pelas frestas — ainda mais
     * aqui, onde o que ela foi ver é justamente a ligação que atravessa o meio.
     *
     * O trilho fica. Ele não é tarja: é o instrumento do próprio gesto, e é a
     * única coisa que diz quanto do caminho já foi.
     */
    private focusWorld(on: boolean) {
        this.hud.setShown(!on)
        this.ask.setShown(!on)
        this.buttons.setShown(!on)
    }

    /* ────────────────────────────── o toque ───────────────────────────── */

    private async pick(target: Place) {
        if (this.mode !== 'asking') return
        const gen = ++this.gen
        this.mode = 'busy'
        this.cancelIdle()
        this.setTurn(false)
        this.buttons.stopPulse()
        this.audio.tap()

        await this.buttons.press(target)
        if (gen !== this.gen) return

        const result = verdict(this.level, this.phase, this.question, target)

        // a câmera VAI ATÉ O LUGAR escolhido: é ali que a resposta acontece
        await this.cinema.go(this.shotFor(target))
        if (gen !== this.gen) return

        if (result.kind === 'opens') {
            const where = openedAt(this.level, this.phase, this.question, target)
            this.audio.open()
            void this.flashFrame(C.green)

            await this.world.openAt(where, this.question.file, target)
            if (gen !== this.gen) return

            // a plaquinha é UI: o ponto do mundo vira ponto de tela antes de ir
            const at = this.onScreen(this.world.cardPoint(where))
            await this.sign.cheer(cheerFor(where, target), at.x, at.y)
            if (gen !== this.gen) return

            void this.afterRight()
            return
        }

        this.audio.wrong()
        this.chargeOnce()
        this.missesHere += 1
        void this.flashFrame(C.amber)

        await this.world.denyAt(target)
        if (gen !== this.gen) return

        const at = this.onScreen(this.world.cardPoint(target))
        await this.sign.show(WRONG_TEXT[result.why], at.x, at.y)
        if (gen !== this.gen) return

        if (!this.air) {
            await this.cinema.go('room', 480)
            if (gen !== this.gen) return
        }

        if (this.missesHere >= 2) {
            this.audio.hint()
            this.buttons.pulse(rightPlaces(this.level, this.phase, this.question))
        }

        this.armAsking()
    }

    /**
     * Para onde a câmera vai quando a criança toca num botão.
     *
     * No ar o botão JÁ É uma vista — o computador é a ponta esquerda do mundo e
     * o celular é a direita. No quarto, a nuvem mora no céu e os outros dois na
     * mesa.
     */
    private shotFor(target: Place): string {
        if (this.air) return target
        return target === 'cloud' ? 'sky' : 'room'
    }

    /**
     * O ESTALO fica ENTRE os dois pedidos da mesma tela.
     *
     * Quem decide se ele acontece é o DADO: quando o pedido seguinte lista um
     * corte que o atual não listava, alguma ligação acabou de arrebentar. É por
     * isso que o nível 1 não corta nada sem uma linha de código a menos — lá
     * nenhum pedido lista corte nenhum.
     *
     * A câmera vai até onde a coisa quebra, o cabeçalho e os botões saem de
     * cena, e o corte acontece com a tela toda para ele. É o miolo dos níveis 2
     * e 3, e ele merece a tela inteira.
     */
    private async afterRight() {
        const gen = ++this.gen
        const next = this.askIndex + 1

        if (next >= this.phase.asks.length) {
            void this.finishPhase()
            return
        }

        const was = this.question.cut ?? []
        const broke = (this.phase.asks[next].cut ?? []).filter(p => !was.includes(p))

        for (const who of broke) {
            await FX.wait(this, 260)
            if (gen !== this.gen) return

            this.hud.setShown(false)
            this.ask.setShown(false)
            this.buttons.setShown(false)
            this.scroll.setShown(false)

            await this.cinema.go(this.air ? who : 'wire', 700)
            if (gen !== this.gen) return

            await FX.wait(this, 220)
            if (gen !== this.gen) return

            this.audio.snap()
            await this.world.breakLink(who)
            if (gen !== this.gen) return

            /**
             * O CADEADO NO BOTÃO é só do quarto.
             *
             * Lá o que caiu foi o caminho até a nuvem, e a nuvem inteira fica
             * fora de alcance — trancar o botão é dizer a verdade. No ar quem
             * caiu foi UM APARELHO, e ele continua abrindo o que tem guardado
             * dentro: trancá-lo seria ensinar que ficar sem sinal é ficar sem
             * nada, que é justamente o contrário do nível 3.
             */
            if (!this.air) {
                this.audio.lock()
                this.buttons.setLocked('cloud', true)
                await this.cinema.go('room', 760)
                if (gen !== this.gen) return
            }

            this.hud.setShown(true)
            this.ask.setShown(true)
            this.buttons.setShown(true)
            this.scroll.setShown(true)
            await FX.wait(this, 260)
            if (gen !== this.gen) return
        }

        this.askIndex = next
        void this.askNow()
    }

    /* ─────────────────────────── fim de fase e nível ──────────────────── */

    private async finishPhase() {
        const gen = ++this.gen
        this.mode = 'busy'
        this.cancelIdle()
        this.setTurn(false)

        const points = pointsFor(this.level.phases.length, !this.chargedHere)
        this.score += points

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })

        this.audio.pop()
        await this.hud.celebrate(this.phaseIndex)
        if (gen !== this.gen) return

        this.emitCheckpoint()

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) void this.startPhase(next)
        else void this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.cancelIdle()
        this.setTurn(false)
        this.scroll.setShown(false)
        this.hud.setHelpEnabled(false)

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
        void FX.confetti(this, { colors: [C.orange, C.gold, C.sky, C.creamSoft] })
        await FX.wait(this, 800)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length

        showLevelComplete(this, {
            accent: C.orange,
            panelColor: 0xfffaf0,
            overlayColor: C.navyDeep,
            titleColor: CSS.navy,
            subtitleColor: CSS.orange,
            messageColor: CSS.navy,
            title: this.errors === 0 ? 'Você abriu tudo certo!' : 'Nada ficou trancado!',
            subtitle: this.level.subtitle,
            message: this.level.message,
            progress: { total: LEVELS.length, current: this.level.level },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.orange,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }
                : {
                      autoAdvance: {
                          delay: 2600,
                          label: 'Próximo nível',
                          onComplete: () =>
                              this.scene.restart({
                                  level: this.level.level + 1,
                                  points: this.score,
                                  lives: this.livesLeft,
                              }),
                      },
                  }),
        })
    }

    /* ─────────────────────────────── acabamento ───────────────────────── */

    /**
     * Converte um ponto do MUNDO para a tela: o mundo é que se move, e não a
     * câmera — e ele se move no eixo que o nível usa.
     */
    private onScreen(point: { x: number; y: number }) {
        const stage = this.world.stage()
        return this.air ? { x: point.x + stage.x, y: point.y } : { x: point.x, y: point.y + stage.y }
    }

    private async flashFrame(color: number) {
        this.frame.clear()
        this.frame.lineStyle(14, color, 1)
        this.frame.strokeRect(7, 7, W - 14, H - 14)
        this.frame.setAlpha(0)
        await FX.to(this, fx(this.frame), { alpha: 1 }, { duration: 80 })
        await FX.to(this, fx(this.frame), { alpha: 0 }, { duration: 360 })
    }

    private chargeOnce() {
        this.errors += 1
        if (this.chargedHere) return
        this.chargedHere = true
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    private emitCheckpoint(done = false) {
        const total = this.level.phases.length
        const doneCount = done ? total : this.phaseIndex
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((doneCount / total) * 100),
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
    }

    private armIdle() {
        this.cancelIdle()
        this.idle = this.time.delayedCall(IDLE_MS, () => {
            if (this.mode !== 'asking') return
            this.ask.nudge()
            this.buttons.pulse(rightPlaces(this.level, this.phase, this.question))
            this.armIdle()
        })
    }

    private cancelIdle() {
        this.idle?.remove()
        this.idle = undefined
    }

    /* ─────────────────────────────── tutorial ─────────────────────────── */

    private tutorialSteps(): TutorialStep[] {
        const right = rightPlaces(this.level, this.phase, this.question)[0] ?? 'pc'
        const btn = this.buttons.pointOf(right)
        const rail = this.air ? RAIL_AIR : RAIL_ROOM

        /**
         * O passo do meio é o único do jogo com TRAJETO em vez de toque, e é
         * assim de propósito: trajeto é o desenho universal de arrastar. Ele
         * corre no eixo do nível — em pé no quarto, deitado no ar.
         */
        const drag = this.air
            ? { fromX: 940, fromY: 470, toX: 440, toY: 470 }
            : { fromX: rail.at - 236, fromY: 292, toX: rail.at - 236, toY: 516 }

        return [
            {
                text: 'Aqui em cima aparece o que você quer abrir.',
                shape: 'rect',
                x: ASK.cx,
                y: ASK.cy,
                w: ASK.w + 40,
                h: ASK.h + 40,
                balloonX: 640,
                balloonY: 400,
            },
            {
                text: this.air
                    ? 'Arraste a tela para os lados. O computador fica de um lado, o celular do outro — e a nuvem alcança os dois pelo ar.'
                    : 'Arraste a tela para passear pela casa. O computador e o pen drive ficam na mesa — e a nuvem fica lá longe, no céu.',
                shape: 'rect',
                x: 640,
                y: (ASK.cy + ASK.h / 2 + BTN.cy - BTN.h / 2) / 2,
                w: 1250,
                h: BTN.cy - BTN.h / 2 - ASK.cy - ASK.h / 2 - 16,
                balloonX: 430,
                balloonY: 372,
                pointer: drag,
            },
            {
                text: this.air
                    ? 'Toque no aparelho que consegue abrir isso agora.'
                    : 'Achou o que você quer? Toque no lugar de onde ele vai abrir.',
                shape: 'rect',
                x: btn.x,
                y: btn.y,
                w: BTN.w + 30,
                h: BTN.h + 30,
                balloonX: 640,
                balloonY: 330,
                buttonLabel: 'Vamos lá!',
                pointer: { fromX: btn.x, fromY: btn.y, toX: btn.x, toY: btn.y, tap: true },
            },
        ]
    }

    private runTutorial(once: boolean) {
        this.mode = 'intro'
        this.cancelIdle()
        this.setTurn(false)
        this.buttons.stopPulse()
        this.hud.setHelpEnabled(false)
        // o passo do meio aponta para o miolo da tela: o trilho tem de estar lá
        this.scroll.setShown(true)

        createTutorial(this, {
            key: `ef05co06dsi-l${this.level.level}`,
            once,
            accent: C.orange,
            textSize: 32,
            balloonWidth: 780,
            safeTop: HUD.h + 8,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.hud.setHelpEnabled(true)
                if (this.mode === 'done') return
                this.armAsking()
            },
        })
    }

    private replayTutorial() {
        if (this.mode === 'done') return
        this.runTutorial(false)
    }
}
