import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX, type FxTarget } from '../../../../shared/effects/FX'

import { DEPTH, H, HUD, POSE, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import {
    LEVELS,
    WEAK_TEXT,
    aimSlots,
    pointsFor,
    stronger,
    weakestLink,
} from '../data/levels'
import type { LevelDef, Mode, PhaseDef } from '../types'

import { createReading, type Reading } from './papers'
import { createSquare, type Square } from './square'
import { createControls, type Controls } from './controls'
import { createSign, type Sign } from './sign'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'olha-o-jornal'
const fx = (o: unknown) => o as unknown as FxTarget

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'reading'
    private gen = 0

    private score = 0
    private errors = 0
    private attemptsHere = 0
    private chargedHere = false
    private rejected: number[] = []
    private chosen = 0

    private slots = aimSlots()
    private aimIndex = 0

    private reading!: Reading
    private square!: Square
    private controls!: Controls
    private sign!: Sign
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics
    private aimTutorialDone = false

    constructor() {
        super({ key: 'GameScene' })
    }

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        const index = Phaser.Math.Clamp(data.level ?? 1, 1, LEVELS.length) - 1
        this.level = LEVELS[index]
        this.score = data.points ?? 0
        this.phaseIndex = 0
        this.mode = 'reading'
        this.errors = 0
        this.attemptsHere = 0
        this.chargedHere = false
        this.rejected = []
        this.aimTutorialDone = false
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data.lives ?? this.livesTotal
    }

    create() {
        this.audio = createAudio()
        this.reading = createReading(this, { onPick: i => void this.onPick(i) })
        this.square = createSquare(this)
        this.controls = createControls(this, {
            onStep: dir => this.onStep(dir),
            onThrow: () => void this.onThrow(),
        })
        this.sign = createSign(this)
        this.hud = createHud(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            onHelp: () => this.replayTutorial(),
        })
        this.frame = this.add.graphics().setDepth(DEPTH.frame).setAlpha(0)

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
            color: CSS.cream,
            stroke: CSS.wall,
            strokeThickness: 6,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startPhase(0)
    }

    update(_time: number, delta: number) {
        if (this.mode === 'aiming') this.controls.update(delta)
    }

    private shutdownScene() {
        this.gen++
        this.reading?.destroy()
        this.square?.destroy()
        this.controls?.destroy()
        this.sign?.destroy()
        this.hud?.destroy()
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
        this.attemptsHere = 0
        this.chargedHere = false
        this.rejected = []
        this.mode = 'reading'

        this.hud.setPhase(index)
        await this.toReading(gen)
        if (gen !== this.gen) return

        if (index !== 0) this.reading.setEnabled(true)
        else if (this.level.level === 1) this.runTutorial(false)
        else this.runHint(false)
    }

    private async toReading(gen: number) {
        this.square.setShown(false)
        this.controls.setShown(false)
        this.controls.setEnabled(false)
        this.reading.setShown(true)
        this.hud.setTicker(`Sobre ${this.phase.subject}`)
        this.audio.drop()
        await this.reading.deal(this.phase.papers, this.level.today, this.rejected)
        if (gen !== this.gen) return
        this.reading.setEnabled(this.mode === 'reading')
    }

    private async onPick(index: number) {
        if (this.mode !== 'reading') return
        const gen = this.gen
        this.mode = 'locked'
        this.chosen = index
        this.sign.hide()
        await this.reading.pick(index)
        if (gen !== this.gen) return

        this.reading.setShown(false)
        this.square.setShown(true)
        this.controls.setShown(true)
        this.square.build(this.phase.groups, this.level.backdrop)
        /* A mira começa no MEIO da faixa e nunca mais se move sozinha: quem
           aponta é a criança, e depois de um arremesso ela fica onde estava. */
        this.aimIndex = Math.floor(this.slots.length / 2)
        this.square.setAim(this.slots[this.aimIndex])
        this.square.setAimShown(true)
        this.hud.setTicker(this.phase.papers[index].headline)

        /* A chegada: a praça abre aproximada nele e afasta até caber inteira. */
        await this.square.arrive()
        if (gen !== this.gen) return

        if (!this.aimTutorialDone) {
            this.aimTutorialDone = true
            this.runAimTutorial(false)
        } else {
            this.mode = 'aiming'
            this.controls.setEnabled(true)
        }
    }

    private nearestSlot(x: number) {
        let best = 0
        this.slots.forEach((s, i) => {
            if (Math.abs(s - x) < Math.abs(this.slots[best] - x)) best = i
        })
        return best
    }

    private onStep(dir: -1 | 1) {
        if (this.mode !== 'aiming') return
        this.aimIndex = Phaser.Math.Clamp(this.aimIndex + dir, 0, this.slots.length - 1)
        this.square.setAim(this.slots[this.aimIndex])
    }

    private async onThrow() {
        if (this.mode !== 'aiming') return
        const gen = this.gen
        this.mode = 'flying'
        this.controls.setEnabled(false)
        this.square.setAimShown(false)
        this.audio.swish()

        const reached = await this.square.throwTo(this.slots[this.aimIndex])
        if (gen !== this.gen) return

        const fresh = reached.filter(i => this.square.pending().includes(i))
        if (!fresh.length) {
            /* Errar a mira não é resposta errada: nada é cobrado, a fase não anda. */
            this.square.pose(POSE.reload)
            await FX.wait(this, 320)
            if (gen !== this.gen) return
            await this.square.walkToPending()
            if (gen !== this.gen) return
            this.square.pose(POSE.ready)
            this.mode = 'aiming'
            this.square.setAimShown(true)
            this.controls.setEnabled(true)
            return
        }

        this.audio.burst()
        for (let i = 0; i < fresh.length; i++) {
            this.audio.inform(i)
            await this.square.inform(fresh[i], 1)
            if (gen !== this.gen) return
        }

        if (this.square.pending().length > 0) {
            this.square.pose(POSE.reload)
            await FX.wait(this, 280)
            if (gen !== this.gen) return
            /* Grupo fora de alcance? Ele ANDA até lá antes de devolver a vez. */
            await this.square.walkToPending()
            if (gen !== this.gen) return
            this.square.pose(POSE.ready)
            this.mode = 'aiming'
            this.square.setAimShown(true)
            this.controls.setEnabled(true)
            return
        }

        const right = stronger(this.phase, this.level.today) === this.chosen
        if (right) await this.win(gen)
        else await this.sour(gen)
    }

    private async win(gen: number) {
        this.mode = 'locked'
        this.square.pose(POSE.cheer)
        const points = pointsFor(this.level.phases.length, !this.chargedHere)
        this.score += points

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })

        this.audio.fanfare()
        await this.flashFrame(C.green)
        if (gen !== this.gen) return
        await this.hud.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        this.emitCheckpoint()

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) void this.startPhase(next)
        else void this.endLevel()
    }

    /** A virada: as carinhas apagam da direita para a esquerda, e a praça espera. */
    private async sour(gen: number) {
        this.mode = 'turning'
        this.square.pose(POSE.down)
        this.attemptsHere += 1
        this.chargeOnce()

        this.audio.turn()
        await FX.wait(this, 320)
        if (gen !== this.gen) return
        await this.square.turnSour()
        if (gen !== this.gen) return

        const weak = this.phase.papers[this.chosen]
        const clue = weakestLink(weak, this.level.today)
        const reason = WEAK_TEXT[clue](weak)
        const pos = this.square.groupPos(this.phase.groups.length - 1)
        await this.sign.show(reason, pos.x, Math.max(220, pos.y - 120))
        if (gen !== this.gen) return

        /* A praça inteira reclama por dois segundos — e aí a partida acaba. */
        await this.square.rage(2000)
        if (gen !== this.gen) return
        await FX.wait(this, 400)
        if (gen !== this.gen) return

        this.loseRun()
    }

    /**
     * DIVULGAR O JORNAL ERRADO ACABA COM A PARTIDA.
     *
     * A regra do `GAME_OVER` mora no `createLives`, e não aqui: por isso a
     * derrota é gasta pelo próprio contador até o zero, e o evento sai de lá,
     * uma vez só, como sai nos outros 48 jogos.
     */
    private loseRun() {
        this.mode = 'done'
        this.controls.setEnabled(false)
        this.controls.setShown(false)
        this.square.setAimShown(false)
        this.hud.setHelpEnabled(false)

        /*
         * QUEM DESENHA A DERROTA É A PLATAFORMA, NÃO O JOGO.
         *
         * O `GAME_OVER` do `createLives` já abre o painel "suas vidas
         * acabaram" por cima do canvas. Um painel próprio aqui empilhava duas
         * telas de derrota, e o botão da de baixo ficava inalcançável. O jogo
         * só zera o contador e sai de cena — a plaquinha âmbar segue visível
         * por trás, dizendo qual linha da capa falhou.
         */
        while (this.lives.remaining > 0) this.lives.lose()
        this.livesLeft = 0
        this.emitCheckpoint()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.controls.setEnabled(false)
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

        void FX.confetti(this, { colors: [C.mustard, C.green, C.red, C.cream] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            title: 'Jornal do dia entregue!',
            subtitle: last
                ? 'A praça inteira soube o que aconteceu de verdade.'
                : 'Tem mais notícia chegando.',
            accent: C.mustard,
            panelColor: C.cream,
            titleColor: CSS.wall,
            progress: { total: LEVELS.length, current: this.level.level },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.mustard,
                              onClick: () =>
                                  this.scene.restart({ level: 1, points: 0, lives: this.livesLeft }),
                          },
                      ],
                  }
                : {
                      autoAdvance: {
                          delay: 2200,
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

    private async flashFrame(colour: number) {
        this.frame.clear()
        this.frame.lineStyle(16, colour, 1)
        this.frame.strokeRect(8, 8, W - 16, H - 16)
        this.frame.setAlpha(0)
        await FX.to(this, fx(this.frame), { alpha: 1 }, { duration: 90 })
        await FX.to(this, fx(this.frame), { alpha: 0 }, { duration: 340 })
    }

    /* ───────────────────────────── tutorial ───────────────────────────── */

    private readingSteps(): TutorialStep[] {
        const left = this.reading.posOf(0)
        const clues = this.reading.cluesOf(0)
        const all = this.reading.allCards()
        return [
            {
                text: 'O carteiro trouxe dois jornais sobre a mesma coisa. Eles não dizem a mesma coisa.',
                shape: 'rect',
                x: all.x,
                y: all.y,
                w: all.w,
                h: all.h,
                balloonX: W / 2,
                balloonY: 640,
            },
            {
                text: 'Leia os dois e toque no que você acredita.',
                shape: 'rect',
                x: clues.x,
                y: clues.y,
                w: clues.w,
                h: clues.h,
                balloonX: W / 2,
                balloonY: 150,
                pointer: { fromX: left.x, fromY: left.y, toX: left.x, toY: left.y, tap: true },
            },
        ]
    }

    private runTutorial(force: boolean) {
        createTutorial(this, {
            key: 'ef05co08-l1-ler',
            steps: this.readingSteps(),
            once: !force,
            accent: C.mustard,
            safeTop: HUD.h + HUD.accent + 12,
            onFinish: () => {
                if (this.mode === 'reading') this.reading.setEnabled(true)
            },
        })
    }

    /** Um passo por nível, dizendo ONDE olhar — nunca qual é a resposta. */
    private runHint(force: boolean) {
        const clues = this.reading.allClues()
        createTutorial(this, {
            key: `ef05co08-l${this.level.level}-pista`,
            steps: [
                {
                    text: this.level.hint ?? 'Leia os dois e toque no que você acredita.',
                    shape: 'rect',
                    x: clues.x,
                    y: clues.y,
                    w: clues.w,
                    h: clues.h,
                    balloonX: W / 2,
                    balloonY: 150,
                },
            ],
            once: !force,
            accent: C.mustard,
            safeTop: HUD.h + HUD.accent + 12,
            onFinish: () => {
                if (this.mode === 'reading') this.reading.setEnabled(true)
            },
        })
    }

    private runAimTutorial(force: boolean) {
        const left = this.controls.arrowPos(-1)
        const shoot = this.controls.throwPos()
        createTutorial(this, {
            key: 'ef05co08-l1-mirar',
            steps: [
                {
                    text: 'Agora espalhe: mire com as setas e solte o jornal em cada grupo.',
                    shape: 'rect',
                    x: W / 2,
                    y: 620,
                    w: 1250,
                    h: 200,
                    balloonX: W / 2,
                    balloonY: 250,
                    pointer: { fromX: left.x, fromY: left.y, toX: shoot.x, toY: shoot.y, tap: true },
                },
            ],
            once: !force,
            accent: C.mustard,
            safeTop: HUD.h + HUD.accent + 12,
            onFinish: () => {
                this.mode = 'aiming'
                this.controls.setEnabled(true)
                this.square.setAimShown(true)
            },
        })
    }

    private replayTutorial() {
        if (this.mode === 'done') return
        if (this.mode === 'aiming') {
            this.controls.setEnabled(false)
            this.runAimTutorial(true)
            return
        }
        if (this.mode !== 'reading') return
        this.reading.setEnabled(false)
        if (this.level.level === 1) this.runTutorial(true)
        else this.runHint(true)
    }
}


