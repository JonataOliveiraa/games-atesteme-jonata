import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import { createVisualGuide, type VisualGuide } from '../../../../shared/guide/createVisualGuide'

import { GUIDE_KEY, LEVELS, POINTS, TRAINING, outcome } from '../data/levels'
import { HAND, PIECE, PIECES } from '../data/files'
import { ALL_CARDS, plankRect, robotX } from '../data/layout'
import { A, C, CONFETTI, CSS, PAINT } from '../data/theme'
import type { FenceDef, LevelDef, Mode } from '../types'

import { createAudio, type Audio } from './audio'
import { createBoard, type Board } from './board'
import { createCards, type Cards } from './cards'
import { ensureArt, isFallback } from './fallback'
import { createFence, type Fence } from './fence'
import { createHud, type Hud } from './hud'
import { createRobot, type Robot } from './robot'
import { createYard } from './yard'

const GAME_ID = 'robo-pintor'
const RESULT_MS = 900
const HINT_MS = 600

const LEVEL_MESSAGE: Record<number, string> = {
    1: 'O robô faz exatamente o que você escreve!',
}

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private coaching = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private yard!: { destroy(): void }
    private board!: Board
    private fence!: Fence
    private robot!: Robot
    private cards!: Cards
    private hud!: Hud
    private guide!: VisualGuide

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    private get current(): FenceDef {
        return this.level.fences[this.index]
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 1)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.index = 0
        this.mode = 'intro'
        this.coaching = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        ensureArt(this)

        this.audio = createAudio()
        this.yard = createYard(this)
        this.board = createBoard(this)
        this.fence = createFence(this)
        this.robot = createRobot(this)
        this.cards = createCards(this)
        this.hud = createHud(this, {
            phases: this.level.fences.length,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.guide = createVisualGuide(this, {
            depth: 8500,
            veilColor: C.shadow,
            veilAlpha: A.veil,
            rimColor: C.glow,
            captionColor: CSS.ink,
            ...(isFallback(this, PIECES) ? {} : { handTexture: { key: PIECES, frame: PIECE.hand, tipX: HAND.tipX, tipY: HAND.tipY, height: 120 } }),
        })

        this.robot.place(-200)
        this.cards.onPick(i => void this.pick(i))
        this.input.keyboard?.on('keydown', this.onKeyDown, this)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.registry.get(GUIDE_KEY)) void this.startFence(0)
        else {
            this.registry.set(GUIDE_KEY, true)
            void this.runGuide()
        }
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.guide?.destroy()
        this.hud?.destroy()
        this.cards?.destroy()
        this.robot?.destroy()
        this.fence?.destroy()
        this.board?.destroy()
        this.yard?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private onKeyDown(event: KeyboardEvent) {
        const slot = ['Digit1', 'Digit2', 'Digit3'].indexOf(event.code)
        const pad = ['Numpad1', 'Numpad2', 'Numpad3'].indexOf(event.code)
        const i = slot >= 0 ? slot : pad
        if (i >= 0) void this.pick(i)
    }

    private async setUp(fence: FenceDef) {
        this.board.reset()
        this.robot.place(robotX(fence.boards, 0) - 900)
        await Promise.all([
            this.fence.build(fence.boards),
            this.robot.walkTo(robotX(fence.boards, 0)),
            this.cards.show(fence.cards),
        ])
    }

    private async startFence(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'enter'
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.cards.setEnabled(false)

        await this.setUp(this.current)
        if (gen !== this.gen) return
        this.mode = 'choose'
        this.cards.setEnabled(true)
        this.hud.setHelpEnabled(!this.coaching)
        if (this.coaching) void this.coach(gen)
    }

    private async coach(gen: number) {
        try {
            await this.guide.waitFor({ target: ALL_CARDS, gesture: { kind: 'none' }, until: () => gen !== this.gen || this.mode !== 'choose' })
        } finally {
            await this.guide.hide()
            this.coaching = false
            if (gen === this.gen && this.mode === 'choose') this.hud.setHelpEnabled(true)
        }
    }

    private async pick(i: number) {
        if (this.mode !== 'choose') return
        const fence = this.current
        const n = fence.cards[i]
        if (n === undefined) return
        const gen = this.gen
        this.mode = 'run'
        this.cards.setEnabled(false)
        this.hud.setHelpEnabled(false)

        await this.execute(gen, fence, n, i)
        if (gen !== this.gen) return

        this.mode = 'result'
        const result = outcome(fence.boards, n)
        if (result === 'exact') await this.painted(gen)
        else await this.missed(gen, fence, result === 'under' ? n : -1)
    }

    private async execute(gen: number, fence: FenceDef, n: number, card: number): Promise<boolean> {
        this.audio.toc()
        await this.cards.fly(card, this.board.slot)
        if (gen !== this.gen) return false
        this.board.write(n)
        this.audio.bip()
        await FX.wait(this, 380)
        if (gen !== this.gen) return false

        const color = PAINT[fence.paint]
        for (let k = 0; k < n; k++) {
            this.board.lightDot(k)
            this.audio.loopNote(k)
            this.board.flash('brush')
            await this.robot.paint()
            if (gen !== this.gen) return false
            this.audio.paint()
            if (k < fence.boards) await this.fence.paintPlank(k, color)
            else if (k === fence.boards) {
                this.audio.meow()
                await this.fence.paintCat(color)
            } else await this.fence.paintGrass(k, color)
            if (gen !== this.gen) return false
            this.board.flash('step')
            this.audio.step()
            await this.robot.walkTo(robotX(fence.boards, k + 1))
            if (gen !== this.gen) return false
        }
        return true
    }

    private async painted(gen: number) {
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()

        this.audio.purr()
        this.audio.win()
        await Promise.all([this.fence.purr(), this.fence.shine(), this.robot.cheer()])
        if (gen !== this.gen) return
        void this.hud.celebrate(this.index)
        await FX.wait(this, RESULT_MS)
        if (gen !== this.gen) return

        await Promise.all([this.fence.clear(), this.cards.clear(), this.robot.walkTo(1500)])
        if (gen !== this.gen) return

        const next = this.index + 1
        if (next < this.level.fences.length) {
            void this.startFence(next)
            return
        }
        void this.endLevel()
    }

    private async missed(gen: number, fence: FenceDef, painted: number) {
        if (painted >= 0) {
            this.robot.pose('puzzled')
            this.audio.puzzled()
            await this.fence.shineRaw(painted)
        } else {
            this.robot.pose('oops')
            this.audio.fomfom()
            await this.robot.shake()
        }
        if (gen !== this.gen) return
        await FX.wait(this, HINT_MS)
        if (gen !== this.gen) return
        await this.fence.countHint()
        if (gen !== this.gen) return
        await this.board.reveal(fence.boards)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.cards.setEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level })
        this.hud.lives.loseAll()
        this.livesLeft = this.hud.lives.remaining
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.hud.setHelpEnabled(false)
        await this.playTraining(gen)
        if (gen !== this.gen) return
        this.coaching = true
        void this.startFence(0)
    }

    private async playTraining(gen: number) {
        const training = TRAINING
        try {
            await this.setUp(training)
            if (gen !== this.gen) return
            for (let i = 0; i < training.boards; i++) {
                const ok = await this.guide.demo({
                    target: plankRect(training.boards, i),
                    gesture: { kind: 'tap' },
                    action: () => this.fence.popNumber(i),
                })
                if (!ok || gen !== this.gen) return
            }
            const card = training.cards.indexOf(training.boards)
            await this.guide.demo({
                target: this.cards.rect(card),
                gesture: { kind: 'tap' },
                action: async () => {
                    if (!(await this.execute(gen, training, training.boards, card))) return
                    this.audio.purr()
                    await Promise.all([this.fence.purr(), this.robot.cheer()])
                },
            })
        } finally {
            await this.guide.hide()
        }
        if (gen !== this.gen) return
        await Promise.all([this.fence.clear(), this.cards.clear(), this.robot.walkTo(1500)])
    }

    private async explain() {
        if (this.mode !== 'choose') return
        const gen = ++this.gen
        this.mode = 'panel'
        this.hud.setHelpEnabled(false)
        this.cards.setEnabled(false)
        await Promise.all([this.fence.clear(), this.cards.clear()])
        if (gen !== this.gen) return
        await this.playTraining(gen)
        if (gen !== this.gen) return
        void this.startFence(this.index)
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        this.audio.win()
        void FX.confetti(this, { colors: CONFETTI })
        await FX.wait(this, 900)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.orange,
            panelColor: C.white,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: 'Cercas pintadas!',
            message: LEVEL_MESSAGE[this.level.level] ?? LEVEL_MESSAGE[1],
            stars: 3,
            progress: { total: this.level.fences.length, current: this.level.fences.length },
            ...(this.level.level < LEVELS.length
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
                              color: C.orange,
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
            progress: Math.round((this.done / this.level.fences.length) * 100),
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
