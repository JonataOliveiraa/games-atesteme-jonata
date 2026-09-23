import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { formatTime } from '../../../../shared/hud/createTimeBar'
import { FX } from '../../../../shared/effects/FX'

import {
    BEAT_MS,
    LEVELS,
    askOf,
    beat as runBeat,
    canPlayNow,
    faseDone,
    fasesIn,
    joinGuest,
    judgeServe,
    kill,
    mustHold,
    newWorld,
    notesIn,
    openFase,
    pointsFor,
    queueHead,
    serve,
    slotOf,
    validateLevels,
} from '../data/fases'
import { PROGRAMS } from '../data/cast'
import { DEPTH, DESK, FERIAS, H, HUD, SEAT, SPOT_X, W, seatX } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { FaseDef, Layer, LevelDef, Phase, Piece, World } from '../types'

import { createStage, type StageView } from './stage'
import { createProgram, type ProgramView } from './program'
import { createDesk, type Desk } from './desk'
import { createBaton, type Baton } from './baton'
import { createEncore, type Encore } from './encore'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'maestro-do-sistema'

/** Quantos compassos a fita do fim de fase mostra. */
const TAPE_MAX = 22

/** O enquadramento do exemplo animado. */
const ZOOM = { wide: 1, near: 1.5, mid: 1.26, desk: 1.45 } as const

/**
 * ONDE A LEGENDA PODE FICAR SEM TAPAR O QUE ELA EXPLICA.
 *
 * O balão do pedido mora entre `y = 108` e `y = 232`, e a legenda no alto caía
 * exatamente em cima dele — a frase dizia "cada um pede uma peça" enquanto
 * escondia os pedidos. O lugar de baixo é o padrão; o de cima só é usado quando
 * o assunto é o atril, que é o único momento em que a faixa de baixo importa.
 */
const SAY_AT = { top: 136, bottom: 580 } as const
const NEXT_DY = 88

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private faseIndex = 0
    private phase: Phase = 'intro'
    private gen = 0

    private world!: World
    private clockMs = 0
    private idleMs = 0
    private nudged?: string
    private batonHint = false
    private tape: string[][] = []

    private erredThisFase = false
    /** As férias são uma por fase, e o botão sai de cena depois de usadas. */
    private feriasUsed = false
    private feriasBtn?: Phaser.GameObjects.Container
    private feriasBg?: Phaser.GameObjects.Graphics
    /** O X acima de quem travou, e a zona que o encerra. */
    private killX?: {
        id: string
        box: Phaser.GameObjects.Container
        zone: Phaser.GameObjects.Zone
    }
    private score = 0
    private hits = 0
    private errors = 0
    private startedAt = 0

    private stage!: StageView
    private desk!: Desk
    private baton!: Baton
    private encore!: Encore
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics
    private progs = new Map<string, ProgramView>()

    /** A câmera de cima: HUD, vidas, tutorial e fim de nível não dão zoom. */
    private ui!: Phaser.Cameras.Scene2D.Camera
    private caption!: Phaser.GameObjects.Container
    private captionBg!: Phaser.GameObjects.Graphics
    private captionTxt!: Phaser.GameObjects.Text

    /** O CONTINUAR da abertura: quem manda no tempo de leitura é a criança. */
    private nextBtn!: Phaser.GameObjects.Container
    private nextBg!: Phaser.GameObjects.Graphics
    private nextTxt!: Phaser.GameObjects.Text
    private nextZone!: Phaser.GameObjects.Zone
    private nextResolve?: () => void
    private sayAt: number = SAY_AT.bottom

    private unsubPlatform?: () => void

    private get fase(): FaseDef {
        return this.level.fases[this.faseIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.faseIndex = 0
        this.phase = 'intro'
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
    }

    create() {
        this.input.topOnly = true
        this.startedAt = Date.now()

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.ui = this.cameras.add(0, 0, W, H)

        this.audio = createAudio()
        this.stage = createStage(this)
        this.baton = createBaton(this)
        this.encore = createEncore(this)
        this.hud = createHud(this, {
            fases: this.level.fases.length,
            level: this.level.level,
            levels: LEVELS.length,
            onHelp: () => this.replayTutorial(),
        })
        this.frame = this.add.graphics().setDepth(DEPTH.frame).setAlpha(0)
        this.buildCaption()
        this.buildNext()
        this.buildFerias()

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

        void this.startFase(0)
    }

    update(_time: number, delta: number) {
        this.assignCameras()

        if (this.phase === 'running') {
            this.clockMs += delta
            while (this.clockMs >= BEAT_MS) {
                this.clockMs -= BEAT_MS
                this.doBeat()
                if (this.phase !== 'running') break
            }
        }

        if (this.phase === 'running' || this.phase === 'hold') {
            this.idleMs += delta
            this.paintRings()
            this.checkNudge()
        }
    }

    private shutdownScene() {
        this.gen++
        this.clearFase()
        this.encore?.destroy()
        this.baton?.destroy()
        this.hud?.destroy()
        this.stage?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ────────────────────────── câmera e legenda ───────────────────────── */

    /**
     * DUAS CÂMERAS, SEPARADAS PELA PROFUNDIDADE.
     *
     * A de baixo é o palco, e é ela que dá o zoom no exemplo animado. A de
     * cima é a interface — HUD, vidas, legenda, tutorial e fim de nível —, que
     * não pode aproximar junto. `ignore` é máscara de bits, então repetir todo
     * frame não custa nada.
     */
    private assignCameras() {
        const list = this.children.list
        for (let i = 0; i < list.length; i++) {
            const object = list[i]
            const depth = (object as unknown as { depth?: number }).depth ?? 0
            if (depth >= DEPTH.hud) this.cameras.main.ignore(object)
            else this.ui.ignore(object)
        }
    }

    private lookAt(x: number, y: number, zoom: number, ms: number) {
        const cam = this.cameras.main
        cam.pan(
            Phaser.Math.Clamp(x, W / (2 * zoom), W - W / (2 * zoom)),
            Phaser.Math.Clamp(y, H / (2 * zoom), H - H / (2 * zoom)),
            ms, 'Sine.easeInOut',
        )
        cam.zoomTo(zoom, ms, 'Sine.easeInOut')
    }

    private cutWide() {
        const cam = this.cameras.main
        cam.panEffect.reset()
        cam.zoomEffect.reset()
        cam.setZoom(ZOOM.wide)
        cam.centerOn(W / 2, H / 2)
    }

    private buildCaption() {
        this.caption = this.add.container(W / 2, 136).setDepth(DEPTH.encore + 2).setAlpha(0)
        this.captionBg = this.add.graphics()
        this.captionTxt = this.add
            .text(0, 0, '', { fontFamily: FONT.black, fontSize: '32px', color: CSS.ink })
            .setOrigin(0.5).setResolution(2)
        this.caption.add([this.captionBg, this.captionTxt])
    }

    private say(line: string, spot: 'top' | 'bottom' = 'bottom') {
        this.sayAt = SAY_AT[spot]
        this.caption.setY(this.sayAt)
        this.captionTxt.setText(line)
        const w = this.captionTxt.width + 76
        this.captionBg.clear()
        this.captionBg.fillStyle(C.ink, 0.3)
        this.captionBg.fillRoundedRect(-w / 2 + 5, -27, w, 66, 33)
        this.captionBg.fillStyle(C.gold, 1)
        this.captionBg.fillRoundedRect(-w / 2, -32, w, 64, 32)
        this.captionBg.fillStyle(C.white, 0.24)
        this.captionBg.fillRoundedRect(-w / 2 + 12, -24, w - 24, 14, 7)

        FX.kill(this, this.caption)
        this.caption.setScale(0.9)
        void FX.to(this, this.caption, { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
    }

    private hideSay() {
        FX.kill(this, this.caption)
        void FX.to(this, this.caption, { alpha: 0, scale: 0.94 }, { duration: 200 })
    }

    /* ─────────────────────────── o CONTINUAR ───────────────────────────── */

    private buildNext() {
        this.nextBtn = this.add.container(W / 2, 226).setDepth(DEPTH.encore + 3).setAlpha(0)
        this.nextBg = this.add.graphics()
        this.nextTxt = this.add
            .text(0, -1, '', { fontFamily: FONT.black, fontSize: '27px', color: CSS.ink })
            .setOrigin(0.5).setResolution(2)
        this.nextBtn.add([this.nextBg, this.nextTxt])

        this.nextZone = this.add.zone(W / 2, 226, 340, 92).setOrigin(0.5)
            .setDepth(DEPTH.encore + 4).setInteractive({ useHandCursor: true })
        if (this.nextZone.input) this.nextZone.input.enabled = false
        this.nextZone.on('pointerdown', () => {
            void FX.press(this, this.nextBtn)
            this.audio.pick()
            this.nextResolve?.()
        })
    }

    /**
     * Mostra o botão e **espera o toque**. Nenhuma frase da abertura sai da
     * tela por conta do relógio: quem lê devagar lê devagar.
     */
    private showNext(label: string, y = this.sayAt + NEXT_DY): Promise<void> {
        this.nextBtn.setY(y)
        this.nextZone.setY(y)
        return new Promise(resolve => {
            this.nextResolve = () => {
                this.nextResolve = undefined
                if (this.nextZone.input) this.nextZone.input.enabled = false
                FX.kill(this, this.nextBtn)
                void FX.to(this, this.nextBtn, { alpha: 0, scale: 0.92 }, { duration: 160 })
                resolve()
            }

            this.nextTxt.setText(label)
            const w = Math.max(240, this.nextTxt.width + 76)
            this.nextBg.clear()
            this.nextBg.fillStyle(C.ink, 0.32)
            this.nextBg.fillRoundedRect(-w / 2 + 4, -24, w, 58, 29)
            this.nextBg.fillStyle(C.cream, 1)
            this.nextBg.fillRoundedRect(-w / 2, -29, w, 58, 29)
            this.nextBg.fillStyle(C.gold, 1)
            this.nextBg.fillRoundedRect(-w / 2 + 5, -24, w - 10, 48, 24)
            this.nextBg.fillStyle(C.white, 0.3)
            this.nextBg.fillRoundedRect(-w / 2 + 14, -19, w - 28, 13, 7)

            this.nextZone.setSize(w + 40, 96)
            if (this.nextZone.input) this.nextZone.input.enabled = true

            FX.kill(this, this.nextBtn)
            this.nextBtn.setScale(0.9)
            void FX.to(this, this.nextBtn, { alpha: 1, scale: 1 }, {
                duration: 240, ease: 'Back.easeOut',
            }).then(() => {
                if (!this.nextResolve) return
                void FX.to(this, this.nextBtn, { scale: 1.05 }, {
                    duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                })
            })
        })
    }

    private hideNext() {
        this.nextResolve = undefined
        if (this.nextZone?.input) this.nextZone.input.enabled = false
        FX.kill(this, this.nextBtn)
        this.nextBtn?.setAlpha(0)
    }

    /** O anel de toque. Não é um dedo desenhado: é a marca de onde tocar. */
    private async ripple(x: number, y: number) {
        for (let i = 0; i < 2; i++) {
            void FX.ping(this, x, y, C.white, { radius: 120, duration: 640, depth: DEPTH.balloon - 1 })
            await FX.wait(this, 320)
        }
    }

    /* ──────────────────────────── a abertura ───────────────────────────── */

    /**
     * O PULAR É UM BOTÃO, e não a tela inteira.
     *
     * Com o CONTINUAR gerindo o ritmo, "toque em qualquer lugar" passou a
     * significar duas coisas ao mesmo tempo. Agora cada toque tem um alvo: o
     * botão grande adianta uma frase, o pequeno do canto sai da abertura.
     */
    private buildSkip(onSkip: () => void) {
        const btn = this.add.container(W - 106, H - 46).setDepth(DEPTH.encore + 3).setAlpha(0)
        const bg = this.add.graphics()
        bg.fillStyle(C.ink, 0.55)
        bg.fillRoundedRect(-84, -23, 168, 46, 23)
        bg.lineStyle(3, C.cream, 0.5)
        bg.strokeRoundedRect(-84, -23, 168, 46, 23)
        const txt = this.add
            .text(0, -1, 'pular  ▸', { fontFamily: FONT.black, fontSize: '22px', color: CSS.cream })
            .setOrigin(0.5).setResolution(2)
        btn.add([bg, txt])

        const zone = this.add.zone(W - 106, H - 46, 200, 84).setOrigin(0.5)
            .setDepth(DEPTH.encore + 4).setInteractive({ useHandCursor: true })
        if (zone.input) zone.input.enabled = false
        zone.on('pointerdown', onSkip)

        void FX.to(this, btn, { alpha: 1 }, { duration: 400, delay: 1200 })
        this.time.delayedCall(1200, () => {
            if (zone.active && zone.input) zone.input.enabled = true
        })

        return {
            destroy: () => {
                zone.destroy()
                FX.kill(this, btn)
                btn.destroy(true)
            },
        }
    }

    /**
     * A ABERTURA.
     *
     * A criança precisa de três coisas antes de tocar em qualquer lugar: que o
     * palco é um computador, que os bonecos são os programas, e que **sem peça
     * ninguém toca**. Nada disso cabe num painel de texto — então o palco
     * acende, os programas entram andando, os balões sobem, a música não vem, e
     * só então ela vê a primeira entrega acontecer de verdade.
     *
     * Roda uma vez por nível, e um toque em qualquer lugar pula sem deixar o
     * mundo pela metade (`close`).
     */
    private async showOpening(gen: number) {
        this.phase = 'demo'
        const ids = this.fase.programs.map(p => p.id)
        const views = ids.map(id => this.progs.get(id)).filter(Boolean) as ProgramView[]
        if (!views.length) {
            this.phase = 'running'
            return
        }

        let skipped = false
        const skip = this.buildSkip(() => {
            skipped = true
            this.nextResolve?.()
        })

        /** A pausa de ANIMAÇÃO: o tempo de a cena acontecer, não o de ler. */
        const hold = async (ms: number) => {
            await FX.wait(this, ms)
            return skipped || gen !== this.gen
        }

        /** A pausa de LEITURA: dura o que a criança quiser. */
        const next = async (label = 'Continuar') => {
            if (skipped || gen !== this.gen) return true
            await this.showNext(label)
            return skipped || gen !== this.gen
        }

        const close = () => {
            skip.destroy()
            this.hideNext()
            if (gen !== this.gen) return
            this.hideSay()
            this.cutWide()
            void this.stage.dim(false)
            this.progs.forEach(view => {
                view.place()
                view.slump(false)
            })
            if (!this.world.slots.some(s => s.state === 'asking' || s.state === 'playing')) {
                openFase(this.world).asked.forEach(id => this.raise(id))
            }
            const first = slotOf(this.world, ids[0])
            if (first && first.state === 'asking') void this.deliver(ids[0], true)
            this.paintStage()
            this.idleMs = 0
            this.batonHint = false
            this.phase = 'running'
        }

        /*
         * A CÂMERA NUNCA FICA PARADA.
         *
         * A primeira versão desta abertura passava os nove segundos iniciais em
         * plano fixo, e o que se via era um cartaz com texto: parecia que a
         * animação não tinha começado. Agora cada tempo tem um movimento —
         * afastar, varrer, acompanhar quem entra — mesmo quando o que muda na
         * tela é só a legenda.
         */

        /* 1. o palco apagado, e a ideia do jogo em uma frase */
        const cam = this.cameras.main
        cam.panEffect.reset()
        cam.zoomEffect.reset()
        cam.setZoom(1.18)
        cam.centerOn(W / 2, H / 2 - 30)
        void this.stage.dim(true)
        this.say('Dentro do computador tem uma orquestra.', 'top')
        this.lookAt(W / 2, H / 2, ZOOM.wide, 2000)
        if (await hold(900)) return close()
        if (await next()) return close()

        /* 2. as luzes acendem, e a câmera varre o palco */
        this.hideSay()
        void this.stage.dim(false)
        this.lookAt(SPOT_X[0] + 40, 300, 1.16, 300)
        SPOT_X.forEach((x, i) => {
            this.time.delayedCall(i * 190, () => {
                void FX.ping(this, x, 150, C.gold, { radius: 96, duration: 700, depth: DEPTH.spot })
                this.lookAt(x, 300, 1.16, 320)
            })
        })
        this.audio.land()
        if (await hold(1500)) return close()

        /* 3. o atril sobe, e a câmera desce com ele */
        this.lookAt(W / 2, DESK.cy - 60, 1.2, 700)
        void this.desk.enter()
        if (await hold(1000)) return close()

        /* 4. os programas entram andando, e a câmera acompanha */
        this.say('Estes são os programas.')
        for (const view of views) {
            const from = view.x < W / 2 ? -200 : W + 200
            this.lookAt((from + view.x) / 2, SEAT.footY - 130, 1.3, 500)
            if (await hold(420)) return close()
            void view.walkIn(from, 1700)
            this.audio.pick()
            this.lookAt(view.x, SEAT.footY - 130, 1.3, 1700)
            if (await hold(1500)) return close()
        }
        this.lookAt(W / 2, H / 2, ZOOM.wide, 900)
        if (await hold(700)) return close()
        if (await next()) return close()

        /* 5. cada um levanta o que precisa */
        this.say('Cada um pede uma peça para tocar.')
        openFase(this.world).asked.forEach(id => this.raise(id))
        this.audio.land()
        this.lookAt(W / 2, SEAT.footY - 190, 1.14, 900)
        if (await hold(1000)) return close()
        if (await next()) return close()

        /*
         * 6. A ESCASSEZ, DITA COM TODAS AS LETRAS.
         *
         * "Só existe uma de cada" é o fato que faz o jogo existir, e ele não
         * estava em lugar nenhum da abertura. A câmera desce ao atril e as
         * peças piscam uma a uma enquanto a frase está no alto.
         */
        this.hideSay()
        this.lookAt(W / 2, DESK.cy, ZOOM.desk, 800)
        if (await hold(850)) return close()
        this.say('Só existe uma peça de cada.', 'top')
        this.fase.pieces.forEach((piece, i) => {
            this.time.delayedCall(300 + i * 520, () => this.desk.pulse(piece))
        })
        if (await hold(1500)) return close()
        if (await next()) return close()

        /* 7. o silêncio: é aqui que o jogo diz para que serve */
        this.hideSay()
        this.lookAt(W / 2, SEAT.footY - 150, 1.2, 700)
        if (await hold(700)) return close()
        this.say('Sem peça, ninguém toca.')
        views.forEach(view => view.slump(true))
        this.lookAt(W / 2, H / 2, ZOOM.wide, 1900)
        if (await hold(1500)) return close()
        if (await next()) return close()
        views.forEach(view => view.slump(false))

        /* 8. o nome do que ela é: o maestro */
        const first = views[0]
        this.say('Quem dá a vez é você, o maestro.')
        this.baton.show(W / 2 - 40, 330, 1.5)
        if (await hold(900)) return close()
        if (await next()) return close()
        this.baton.hide()

        /* 9. e como se dá a vez */
        this.say('Toque no programa!')
        this.lookAt(first.x, SEAT.footY - 150, ZOOM.near, 800)
        if (await hold(1000)) return close()
        await this.ripple(first.x, SEAT.footY - 130)
        if (await next(`Dar a vez`)) return close()

        /* 10. a entrega, de verdade */
        this.hideSay()
        void this.deliver(ids[0], true)
        this.lookAt(first.x, SEAT.footY - 170, ZOOM.mid, 900)
        if (await hold(1600)) return close()

        this.say('Pronto: ele está tocando!')
        this.doBeat()
        this.lookAt(first.x, SEAT.footY - 190, 1.36, 2600)
        if (await hold(1500)) return close()
        this.doBeat()
        if (await hold(900)) return close()
        if (await next()) return close()

        /* 11. o palco inteiro, e a vez dela */
        this.say('Agora é com você.')
        this.lookAt(W / 2, H / 2, ZOOM.wide, 900)
        if (await hold(700)) return close()
        if (await next(`Vamos!`)) return close()

        close()
    }

    /* ─────────────────────────────── a fase ────────────────────────────── */

    private clearFase() {
        this.dropKill()
        this.progs.forEach(p => p.destroy())
        this.progs.clear()
        this.desk?.destroy()
    }

    private async startFase(index: number, replay = false) {
        const gen = ++this.gen
        this.faseIndex = index
        this.phase = 'intro'
        this.clockMs = 0
        this.idleMs = 0
        this.nudged = undefined
        this.batonHint = false
        this.erredThisFase = false
        this.feriasUsed = false
        this.tape = []

        this.clearFase()
        this.hud.setDone(index)

        const def = this.fase
        this.world = newWorld(def)
        this.desk = createDesk(this, def.pieces)

        // A cadeira do convidado é reservada AGORA, vazia. Abrir espaço no
        // meio da música faria os quatro balões trocarem de lugar de uma vez.
        const xs = seatX(def.programs.length + (def.guest ? 1 : 0))
        def.programs.forEach((p, i) => {
            const view = createProgram(this, {
                id: p.id,
                x: xs[i],
                onTap: () => this.onTap(p.id),
            })
            view.setNotes(notesIn(def, p.id))
            this.progs.set(p.id, view)
        })

        this.stage.lightOn([])
        this.stage.setFullness(0)

        // A abertura abre o nível, toda vez. Quem já sabe, pula com um toque.
        if (replay || index === 0) {
            this.progs.forEach(view => view.hide())
            await this.showOpening(gen)
            return
        }

        await FX.all(
            this.desk.enter(),
            ...def.programs.map((p, i) => this.progs.get(p.id)!.enter(i * 160)),
        )
        if (gen !== this.gen) return

        openFase(this.world).asked.forEach(id => this.raise(id))
        this.phase = 'running'
    }

    /**
     * A ÚLTIMA NOTA PRECISA RESPIRAR.
     *
     * `faseDone` fica verdadeiro no instante em que a última nota acende, e a
     * cortina entrava por cima do programa ainda se curvando e da peça ainda
     * voltando ao atril — a fase acabava com um corte seco. Estes dois segundos
     * são o fim da música: a reverência, a peça guardada e a partitura dourada.
     */
    private async finishFase() {
        const gen = ++this.gen
        this.phase = 'encore'

        await FX.wait(this, 2500)
        if (gen !== this.gen) return

        this.stage.lightOn([])
        this.stage.setFullness(0)

        await this.hud.celebrate(this.faseIndex)
        if (gen !== this.gen) return

        const lanes = this.fase.programs.map(p => ({
            row: PROGRAMS[p.id].row,
            color: PROGRAMS[p.id].color,
            beats: this.tape.map(row => row.includes(p.id)),
        }))

        await this.encore.play({
            lanes,
            together: this.tape.some(row => row.length > 1),
            onChord: () => this.audio.chord(),
            onBow: () => this.bowAll(),
            waitNext: () => this.showNext('Continuar', 642),
        })
        if (gen !== this.gen) return

        const next = this.faseIndex + 1
        if (next >= this.level.fases.length) {
            void this.finishLevel()
            return
        }
        this.emitCheckpoint()
        void this.startFase(next)
    }

    private async bowAll() {
        const list = [...this.progs.values()]
        for (const p of list) {
            void p.bow()
            void p.goldNotes()
            await FX.wait(this, 180)
        }
        await FX.wait(this, 420)
    }

    /* ─────────────────────────────── o compasso ────────────────────────── */

    private doBeat() {
        const index = this.world.beat
        const layers = this.playingLayers()
        const report = runBeat(this.world)

        this.audio.beat(index, layers)

        report.notes.forEach(id => {
            const slot = slotOf(this.world, id)
            const view = this.progs.get(id)
            if (!slot || !view) return
            view.lightNote(slot.played - 1)
            view.beat()
        })

        this.tape.push(report.notes.slice())
        if (this.tape.length > TAPE_MAX) this.tape.shift()

        report.freed.forEach(f => void this.release(f.id, f.piece))
        report.froze.forEach(id => this.freeze(id))
        report.finished.forEach(id => {
            this.audio.finish()
            const view = this.progs.get(id)
            void FX.stars(this, view?.x ?? W / 2, SEAT.footY - 150, { color: C.gold })
            void view?.goldNotes()
        })
        report.asked.forEach(id => this.raise(id))

        const guest = this.fase.guest
        if (guest && this.world.beat === guest.at) void this.welcomeGuest()

        this.refreshLit()
        this.paintStage()
        this.chatter(report.notes)

        if (faseDone(this.world)) {
            void this.finishFase()
            return
        }
        this.syncHold()
    }

    /**
     * O CONVIDADO CHEGA ANDANDO.
     *
     * A cadeira dele já estava reservada desde o começo da fase — `seatX` foi
     * calculado com ele —, então ninguém se mexe. O palco que se reorganiza no
     * meio da música é ilegível para quem está acompanhando quatro balões.
     */
    private async welcomeGuest() {
        const guest = this.fase.guest
        if (!guest || this.progs.has(guest.program.id)) return

        const gen = this.gen
        const seats = seatX(this.fase.programs.length + 1)
        const x = seats[seats.length - 1]

        const view = createProgram(this, {
            id: guest.program.id,
            x,
            onTap: () => this.onTap(guest.program.id),
        })
        view.setNotes(notesIn(this.fase, guest.program.id))
        this.progs.set(guest.program.id, view)

        joinGuest(this.world, guest.program)
        this.audio.pick()
        await view.walkIn(W + 140, 900)
        if (gen !== this.gen) return
        this.refreshLit()
    }

    private playingLayers(): Layer[] {
        return this.world.slots
            .filter(s => s.state === 'playing')
            .map(s => PROGRAMS[s.id].layer)
    }

    private paintStage() {
        const xs = this.world.slots
            .filter(s => s.state === 'playing')
            .map(s => this.progs.get(s.id)?.x ?? W / 2)
        this.stage.lightOn(xs)
        this.stage.setFullness(xs.length)
    }

    /** Dois tocando juntos se olham. É o que separa personagem de painel. */
    private chatter(playing: string[]) {
        if (playing.length < 2) return
        if (this.world.beat % 4 !== 0) return
        const views = playing.map(id => this.progs.get(id)).filter(Boolean) as ProgramView[]
        views.sort((a, b) => a.x - b.x)
        views[0].lean(1)
        views[views.length - 1].lean(-1)
    }

    private paintRings() {
        this.world.busy.forEach((id, piece) => {
            const slot = slotOf(this.world, id)
            const ask = slot && askOf(slot)
            if (!slot || !ask) return
            const done = slot.inAsk + this.clockMs / BEAT_MS
            this.desk.setRing(piece, 1 - Math.min(1, done / ask.notes))
        })
    }

    private raise(id: string) {
        const slot = slotOf(this.world, id)
        const view = this.progs.get(id)
        if (!slot || !view) return
        const ask = askOf(slot)
        if (!ask) return
        view.setState('asking')
        view.ask(ask.piece, canPlayNow(this.world, slot))
        this.desk.pulse(ask.piece)
        this.idleMs = 0
    }

    private refreshLit() {
        this.world.slots.forEach(slot => {
            if (slot.state !== 'asking') return
            this.progs.get(slot.id)?.setLit(canPlayNow(this.world, slot))
        })
    }

    /**
     * A PEÇA VOLTA DEPOIS DA MÚSICA, NÃO JUNTO COM A ÚLTIMA NOTA.
     *
     * A ordem é a da vida: a última nota soa, o programa se curva, e só então
     * ele devolve a peça. Devolver no mesmo instante da nota fazia a peça sair
     * voando enquanto ele ainda estava tocando.
     */
    private async release(id: string, piece: Piece) {
        const gen = this.gen
        const view = this.progs.get(id)
        if (!view) return
        view.setState('asking')
        await view.bow()
        if (gen !== this.gen) return
        this.audio.ret()
        void this.desk.back(piece, { x: view.x, y: SEAT.footY - 150 })
        const slot = slotOf(this.world, id)
        if (slot) view.setState(slot.state)
        this.refreshLit()
    }

    /* ──────────────────────── o travamento e o X ───────────────────────── */

    /**
     * ELE TRAVOU.
     *
     * A peça não volta, e nenhum compasso resolve isso: o atril fica com um
     * buraco até o maestro encerrar. O tremor é contínuo de propósito — é a
     * única coisa no palco que não acompanha a música.
     */
    private freeze(id: string) {
        const view = this.progs.get(id)
        const slot = slotOf(this.world, id)
        if (!view || !slot) return
        view.clearAsk()
        view.setState('frozen')
        view.slump(true)
        // o encaixe dele no atril pisca vazio: a peça está presa lá em cima
        if (slot.holds) this.desk.flashBusy(slot.holds)
        FX.shakeCam(this, 'leve')
        void this.flashFrame(C.red)
    }

    /** O X grande, acima da cabeça de quem travou. Um toque nele encerra. */
    private raiseKill(id: string) {
        if (this.killX?.id === id) return
        this.dropKill()

        const view = this.progs.get(id)
        if (!view) return

        const box = this.add.container(view.x, view.headY - 96).setDepth(DEPTH.fly)
        const disc = this.add.graphics()
        disc.fillStyle(C.ink, 0.22)
        disc.fillCircle(4, 6, 46)
        disc.fillStyle(C.red, 1)
        disc.fillCircle(0, 0, 44)
        disc.lineStyle(7, C.cream, 1)
        disc.strokeCircle(0, 0, 44)
        disc.lineStyle(11, C.cream, 1)
        disc.lineBetween(-17, -17, 17, 17)
        disc.lineBetween(17, -17, -17, 17)
        box.add(disc)

        const zone = this.add
            .zone(view.x, view.headY - 96, 132, 132)
            .setDepth(DEPTH.fly + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => void this.endProgram(id))

        this.killX = { id, box, zone }
        FX.popIn(this, box, { from: 0.4, duration: 280 })
        FX.float(this, box, { amount: 7, duration: 1500 })
    }

    private dropKill() {
        if (!this.killX) return
        this.killX.zone.destroy()
        this.killX.box.destroy()
        this.killX = undefined
    }

    /**
     * O X DESCE: o programa é encerrado e a peça volta ao atril.
     *
     * Encerrar não custa vida nem ponto. Não é um erro da criança — é a coisa
     * certa a fazer, e a única que o sistema operacional pode fazer.
     */
    private async endProgram(id: string) {
        if (this.phase !== 'running' && this.phase !== 'hold') return
        const gen = this.gen
        const view = this.progs.get(id)
        const piece = kill(this.world, id)
        this.dropKill()
        if (!view || !piece) return

        this.audio.ret()
        view.slump(false)
        view.setState('done')
        void this.baton.swingTo(view.x, SEAT.footY - 170)
        void this.desk.back(piece, { x: view.x, y: SEAT.footY - 150 })

        this.refreshLit()
        this.paintStage()
        this.syncHold()

        await FX.wait(this, 260)
        if (gen !== this.gen) return
        if (faseDone(this.world)) void this.finishFase()
    }

    /* ─────────────────────── as férias do maestro ──────────────────────── */

    /**
     * O BOTÃO, ao lado do atril e longe dos programas.
     *
     * Ele não existe no nível 1: sem fila não há o que demonstrar, e um botão
     * a mais na estreia é uma pergunta a mais. A partir do nível 2 ele fica
     * sempre à vista, e apaga depois de usado — uma por fase.
     */
    private buildFerias() {
        const box = this.add.container(FERIAS.x, FERIAS.y).setDepth(DEPTH.hud - 2)
        const bg = this.add.graphics()
        const label = this.add.text(0, 0, 'FÉRIAS', {
            fontFamily: FONT.black, fontSize: '26px', color: CSS.ink,
        }).setOrigin(0.5).setResolution(2)
        box.add([bg, label])

        const zone = this.add
            .zone(FERIAS.x, FERIAS.y, FERIAS.w + 20, FERIAS.h + 20)
            .setDepth(DEPTH.hud - 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => void this.takeVacation())

        this.feriasBtn = box
        this.feriasBg = bg
        this.paintFerias()
    }

    /** Aceso enquanto sobra; apagado e sem toque depois de usado. */
    private paintFerias() {
        const bg = this.feriasBg
        const box = this.feriasBtn
        if (!bg || !box) return

        const on = this.level.ferias && !this.feriasUsed
        box.setVisible(this.level.ferias).setAlpha(on ? 1 : 0.35)

        const w = FERIAS.w
        const h = FERIAS.h
        bg.clear()
        bg.fillStyle(C.ink, 0.22)
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, h / 2)
        bg.fillStyle(on ? C.gold : C.cream, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        bg.lineStyle(6, on ? C.goldDeep : C.ink, 0.6)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    /**
     * TRÊS SEGUNDOS SEM MAESTRO.
     *
     * Todo mundo pede ao mesmo tempo e nada toca — é a resposta desenhada
     * para "por que o computador precisa disso?". Uma vez por fase, sem custo
     * e sem mexer no mundo: quando acaba, o palco está exatamente como estava.
     */
    private async takeVacation() {
        if (!this.level.ferias || this.feriasUsed) return
        if (this.phase !== 'running' && this.phase !== 'hold') return

        const gen = this.gen
        const back = this.phase
        this.feriasUsed = true
        this.phase = 'locked'
        this.paintFerias()
        this.dropKill()

        this.baton.hide()
        this.stage.lightOn([])
        this.stage.setFullness(0)

        // todo mundo levanta a mão, e nenhuma mão é atendida
        this.progs.forEach(view => {
            view.setState('asking')
            view.nudge(true)
        })

        await FX.wait(this, 3000)
        if (gen !== this.gen) return

        this.progs.forEach((view, id) => {
            view.nudge(false)
            const slot = slotOf(this.world, id)
            if (slot) view.setState(slot.state)
        })
        this.world.slots.forEach(slot => {
            if (slot.state !== 'asking') return
            const ask = askOf(slot)
            if (ask) this.progs.get(slot.id)?.ask(ask.piece, canPlayNow(this.world, slot))
        })
        this.refreshLit()
        this.paintStage()
        this.phase = back
    }

    /**
     * O MUNDO PRENDE A RESPIRAÇÃO.
     *
     * Quando uma peça se solta e dois a querem, o compasso para sozinho: a
     * criança pensa sem relógio nenhum correndo, e nada no palco a apressa.
     */
    private syncHold() {
        const hold = mustHold(this.world)
        if (hold && this.phase === 'running') {
            this.phase = 'hold'
            this.stage.lightOn(this.world.slots
                .filter(s => s.state === 'asking')
                .map(s => this.progs.get(s.id)?.x ?? W / 2))
        } else if (!hold && this.phase === 'hold') {
            this.phase = 'running'
            this.paintStage()
        }
    }

    /* ────────────────────────────── o toque ────────────────────────────── */

    private onTap(id: string) {
        if (this.phase !== 'running' && this.phase !== 'hold') return
        this.idleMs = 0
        this.clearNudge()

        const view = this.progs.get(id)
        const slot = slotOf(this.world, id)
        if (!view || !slot) return

        // Quem travou não tem balão nem veredito: ele tem um X.
        if (slot.state === 'frozen') {
            this.raiseKill(id)
            return
        }

        const verdict = judgeServe(this.world, id)
        if (verdict === 'served') {
            void this.deliver(id)
            return
        }
        if (verdict === 'busy') {
            view.shrug()
            const ask = askOf(slot)
            if (ask) this.desk.flashBusy(ask.piece)
            return
        }
        if (verdict === 'skip-queue') {
            void this.cutLine(id)
            return
        }
        view.wave()
    }

    /** `demo` é a entrega que o jogo faz na abertura: ela não pontua. */
    private async deliver(id: string, demo = false) {
        const gen = this.gen
        const view = this.progs.get(id)
        if (!view) return

        const piece = serve(this.world, id)
        if (!piece) return

        if (!demo) {
            this.hits += 1
            this.score += pointsFor(!this.erredThisFase)
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER',
                gameId: GAME_ID,
                pointsEarned: pointsFor(!this.erredThisFase),
                stage: this.level.level,
            })
        }

        this.audio.pick()
        view.clearAsk()
        view.setState('playing')
        this.refreshLit()
        this.paintStage()
        this.syncHold()

        void this.baton.swingTo(view.x, SEAT.footY - 170)
        await FX.wait(this, 150)
        if (gen !== this.gen) return
        await this.desk.send(piece, { x: view.x, y: SEAT.footY - 150 })
        if (gen !== this.gen) return
        this.audio.land()
        await view.receive()
    }

    /**
     * Furar a fila é o único erro do jogo que custa vida — e ele só existe
     * quando dois balões acesos disputam a mesma peça.
     */
    private async cutLine(id: string) {
        const gen = this.gen
        this.phase = 'locked'
        const slot = slotOf(this.world, id)
        const ask = slot && askOf(slot)
        const headId = ask ? queueHead(this.world, ask.piece) : undefined
        const head = headId ? this.progs.get(headId) : undefined

        this.progs.get(id)?.shrug()
        void this.flashFrame(C.red)
        this.charge()

        head?.nudge(true)
        await FX.wait(this, 1400)
        if (gen !== this.gen) return
        head?.nudge(false)
        this.phase = 'hold'
        this.syncHold()
    }

    private charge() {
        if (this.erredThisFase) return
        this.erredThisFase = true
        this.errors += 1
        if (this.fase.guided) return
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    /* ────────────────────────────── o cutucão ──────────────────────────── */

    private clearNudge() {
        if (!this.nudged) return
        this.progs.get(this.nudged)?.nudge(false)
        this.nudged = undefined
        this.batonHint = false
    }

    private checkNudge() {
        const wait = this.fase.guided ? 3200 : 6000

        /*
         * QUANDO NÃO HÁ NINGUÉM PARA ATENDER, O CUTUCÃO APONTA O TRAVADO.
         *
         * É o único momento em que o palco inteiro fica parado sem ser culpa
         * da criança: todos os balões cinzas, esperando uma peça que está na
         * mão de quem não toca mais. Sem este cutucão o jogo espera para
         * sempre, e a criança não tem como adivinhar que o X é a saída.
         */
        const ready = this.world.slots.find(slot =>
            canPlayNow(this.world, slot) && queueHead(this.world, askOf(slot).piece) === slot.id)
            ?? this.world.slots.find(slot => slot.state === 'frozen')

        if (!ready) {
            this.clearNudge()
            return
        }
        if (this.idleMs < wait) return

        if (this.nudged !== ready.id) {
            this.clearNudge()
            this.nudged = ready.id
            this.progs.get(ready.id)?.nudge(true)
        }
        if (!this.batonHint && this.idleMs > wait + 6000) {
            this.batonHint = true
            const view = this.progs.get(ready.id)
            if (view) void this.baton.nudge(view.x, SEAT.footY - 170)
        }
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
        void FX.confetti(this, { colors: [C.gold, C.coral, C.teal, C.violet] })
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length

        showLevelComplete(this, {
            accent: C.goldDeep,
            panelColor: 0xfffaf0,
            overlayColor: C.plum,
            title: this.errors === 0 ? 'Que orquestra!' : 'A música saiu!',
            subtitle: formatTime(Date.now() - this.startedAt),
            message: 'Cada programa esperou a vez e todo mundo tocou.',
            progress: { total: LEVELS.length, current: this.level.level },
            ...(last
                ? {
                    buttons: [{
                        label: 'JOGAR DE NOVO',
                        color: C.goldDeep,
                        onClick: () => this.scene.restart({
                            level: 1, points: 0, lives: this.livesTotal,
                        }),
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
     * O `?` REPETE A ABERTURA, e não um painel de passos.
     *
     * A explicação deste jogo é a cena: o palco acendendo, os programas
     * entrando, o silêncio sem peça. Um painel de holofote com duas frases era
     * justamente o que não explicava nada. Como a abertura mexe no mundo — ela
     * levanta os balões e faz a primeira entrega —, repetir significa **recomeçar
     * a música da vez**, que dura uns vinte segundos e é o preço certo por uma
     * criança que se perdeu.
     */
    private replayTutorial() {
        if (this.phase !== 'running' && this.phase !== 'hold') return
        void this.startFase(this.faseIndex, true)
    }

    /* ────────────────────────────── plataforma ─────────────────────────── */

    private emitCheckpoint(final = false) {
        const total = fasesIn(this.level.level)
        const done = final ? total : this.faseIndex
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
