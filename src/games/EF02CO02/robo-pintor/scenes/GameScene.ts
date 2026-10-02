import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import { createVisualGuide, type VisualGuide } from '../../../../shared/guide/createVisualGuide'

import { LEVELS, POINTS, TRAINING, boardsOf, guideKey, isExact, paintAt, planned, wrongRow } from '../data/levels'
import { HAND, PIECE, PIECES } from '../data/files'
import { ALL_CARDS, plankRect, robotX, stageRect } from '../data/layout'
import { A, C, CONFETTI, CSS, PAINT } from '../data/theme'
import type { FenceDef, LevelDef, Mode, Rect } from '../types'

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
const BUG_PAUSE_MS = 900

const LEVEL_MESSAGE: Record<number, string> = {
    1: 'O robô faz exatamente o que você escreve!',
    2: 'Um laço depois do outro: cada um com o seu número!',
    3: 'Você achou o número errado e consertou o programa!',
}

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private coaching = false

    private values: number[] = []
    private writing = 0
    private fixing = false

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
        this.values = []
        this.writing = 0
        this.fixing = false
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
        this.board.onSlot(r => this.chooseSlot(r))
        this.input.keyboard?.on('keydown', this.onKeyDown, this)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        if (this.registry.get(key)) void this.startFence(0)
        else {
            this.registry.set(key, true)
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
        const digit = ['Digit1', 'Digit2', 'Digit3'].indexOf(event.code)
        const pad = ['Numpad1', 'Numpad2', 'Numpad3'].indexOf(event.code)
        const i = digit >= 0 ? digit : pad
        if (i < 0) return
        if (this.mode === 'pickSlot') this.chooseSlot(i)
        else void this.pick(i)
    }

    private colorsOf(fence: FenceDef) {
        return fence.segments.map(s => PAINT[s.paint])
    }

    private marksOf(fence: FenceDef) {
        return fence.segments.length > 1 ? planned(fence).map(p => PAINT[p]) : null
    }

    private async setUp(fence: FenceDef) {
        const boards = boardsOf(fence)
        this.values = fence.preset ? [...fence.preset] : fence.segments.map(() => 0)
        this.writing = 0
        this.fixing = !!fence.preset
        this.board.setProgram(this.colorsOf(fence), this.values)
        this.board.mark(this.fixing ? null : 0)
        this.robot.place(robotX(boards, 0) - 900)
        await Promise.all([
            this.fence.build(this.marksOf(fence), boards),
            this.robot.walkTo(robotX(boards, 0)),
            this.fixing ? Promise.resolve() : this.cards.show(fence.cards),
        ])
    }

    private async startFence(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'enter'
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.cards.setEnabled(false)
        this.board.setSlotsEnabled(false)

        const fence = this.current
        await this.setUp(fence)
        if (gen !== this.gen) return

        if (this.fixing) {
            this.mode = 'bug'
            if (!(await this.showBug(gen, fence))) return
            this.mode = 'pickSlot'
            this.board.setSlotsEnabled(true)
            this.hud.setHelpEnabled(!this.coaching)
            if (this.coaching) void this.coach(gen, this.slotsRect(fence), 'pickSlot')
            return
        }

        this.mode = 'choose'
        this.cards.setEnabled(true)
        this.hud.setHelpEnabled(!this.coaching)
        if (this.coaching) void this.coach(gen, ALL_CARDS, 'choose')
    }

    private slotsRect(fence: FenceDef): Rect {
        const rects = fence.segments.map((_, r) => this.board.slotRect(r))
        const top = Math.min(...rects.map(r => r.y - r.h / 2))
        const bottom = Math.max(...rects.map(r => r.y + r.h / 2))
        return { x: rects[0].x, y: (top + bottom) / 2, w: rects[0].w, h: bottom - top }
    }

    private async coach(gen: number, target: Rect, waitMode: Mode) {
        try {
            await this.guide.waitFor({ target, gesture: { kind: 'none' }, until: () => gen !== this.gen || this.mode !== waitMode })
        } finally {
            await this.guide.hide()
            this.coaching = false
            if (gen === this.gen && (this.mode === 'choose' || this.mode === 'pickSlot')) this.hud.setHelpEnabled(true)
        }
    }

    private async showBug(gen: number, fence: FenceDef): Promise<boolean> {
        await FX.wait(this, 400)
        if (gen !== this.gen) return false
        if (!(await this.runLoop(gen, fence))) return false
        this.robot.pose(this.overflows(fence) ? 'oops' : 'puzzled')
        this.audio.fomfom()
        await this.fence.flag(this.mismatches(fence))
        await FX.wait(this, BUG_PAUSE_MS)
        if (gen !== this.gen) return false
        this.robot.place(robotX(boardsOf(fence), 0))
        this.audio.whoosh()
        await this.fence.wash()
        return gen === this.gen
    }

    private chooseSlot(r: number) {
        if (this.mode !== 'pickSlot') return
        const fence = this.current
        if (r >= fence.segments.length) return
        this.audio.toc()
        this.writing = r
        this.values[r] = 0
        this.board.clearSlot(r)
        this.board.mark(r)
        this.board.setSlotsEnabled(false)
        this.mode = 'enter'
        const gen = this.gen
        void this.cards.show(fence.cards).then(() => {
            if (gen !== this.gen) return
            this.mode = 'choose'
            this.cards.setEnabled(true)
        })
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

        if (!(await this.write(gen, this.writing, n, i))) return

        const next = this.writing + 1
        if (!this.fixing && next < fence.segments.length) {
            this.writing = next
            this.board.mark(next)
            await this.cards.restore()
            if (gen !== this.gen) return
            this.mode = 'choose'
            this.cards.setEnabled(true)
            this.hud.setHelpEnabled(true)
            return
        }

        this.board.mark(null)
        if (!(await this.runLoop(gen, fence))) return
        this.mode = 'result'
        if (isExact(fence, this.values)) await this.painted(gen)
        else await this.missed(gen, fence)
    }

    private async write(gen: number, row: number, n: number, card: number): Promise<boolean> {
        this.audio.toc()
        await this.cards.fly(card, this.board.slot(row))
        if (gen !== this.gen) return false
        this.values[row] = n
        this.board.write(row, n)
        this.audio.bip()
        await FX.wait(this, 380)
        return gen === this.gen
    }

    private async runLoop(gen: number, fence: FenceDef): Promise<boolean> {
        const boards = boardsOf(fence)
        let p = 0
        for (let r = 0; r < fence.segments.length; r++) {
            const color = PAINT[fence.segments[r].paint]
            for (let k = 0; k < this.values[r]; k++) {
                this.board.lightDot(r, k)
                this.audio.loopNote(p)
                this.board.flash(r, 'brush')
                await this.robot.paint()
                if (gen !== this.gen) return false
                this.audio.paint()
                if (p < boards) await this.fence.paintPlank(p, color)
                else if (p === boards) {
                    this.audio.meow()
                    await this.fence.paintCat(color)
                } else await this.fence.paintGrass(p, color)
                if (gen !== this.gen) return false
                this.board.flash(r, 'step')
                this.audio.step()
                p++
                await this.robot.walkTo(robotX(boards, p))
                if (gen !== this.gen) return false
            }
        }
        return true
    }

    private overflows(fence: FenceDef) {
        return this.values.reduce((sum, n) => sum + n, 0) > boardsOf(fence)
    }

    private mismatches(fence: FenceDef): number[] {
        const want = planned(fence)
        const got = paintAt(fence, this.values)
        return want.map((paint, i) => (got[i] === paint ? -1 : i)).filter(i => i >= 0)
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

    private async missed(gen: number, fence: FenceDef) {
        if (this.overflows(fence)) {
            this.robot.pose('oops')
            this.audio.fomfom()
            await this.robot.shake()
        } else {
            this.robot.pose('puzzled')
            this.audio.puzzled()
        }
        await this.fence.flag(this.mismatches(fence))
        if (gen !== this.gen) return
        await FX.wait(this, HINT_MS)
        if (gen !== this.gen) return
        await this.fence.countHint(fence.segments.map(s => ({ count: s.count, color: PAINT[s.paint] })))
        if (gen !== this.gen) return
        await this.board.reveal(fence.segments.map(s => s.count))
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.cards.setEnabled(false)
        this.board.setSlotsEnabled(false)
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
        const training = TRAINING[this.level.level] ?? TRAINING[1]
        const boards = boardsOf(training)
        const stage = stageRect(boards)
        try {
            await this.setUp(training)
            if (gen !== this.gen) return

            if (training.preset) {
                const bugged = await this.guide.demo({
                    target: stage,
                    gesture: { kind: 'none' },
                    action: async () => {
                        await this.showBug(gen, training)
                    },
                })
                if (!bugged || gen !== this.gen) return
                const row = wrongRow(training)
                const tapped = await this.guide.demo({
                    target: this.board.slotRect(row),
                    gesture: { kind: 'tap' },
                    action: async () => {
                        this.writing = row
                        this.values[row] = 0
                        this.board.clearSlot(row)
                        this.board.mark(row)
                        await this.cards.show(training.cards)
                    },
                })
                if (!tapped || gen !== this.gen) return
                const card = training.cards.indexOf(training.segments[row].count)
                const wrote = await this.guide.demo({
                    target: this.cards.rect(card),
                    gesture: { kind: 'tap' },
                    action: async () => {
                        await this.write(gen, row, training.segments[row].count, card)
                        this.board.mark(null)
                    },
                })
                if (!wrote || gen !== this.gen) return
            } else {
                if (training.segments.length === 1) {
                    for (let i = 0; i < boards; i++) {
                        const ok = await this.guide.demo({
                            target: plankRect(boards, i),
                            gesture: { kind: 'tap' },
                            action: () => this.fence.popNumber(i),
                        })
                        if (!ok || gen !== this.gen) return
                    }
                }
                for (let r = 0; r < training.segments.length; r++) {
                    const n = training.segments[r].count
                    const card = training.cards.indexOf(n)
                    const wrote = await this.guide.demo({
                        target: this.cards.rect(card),
                        gesture: { kind: 'tap' },
                        action: async () => {
                            await this.write(gen, r, n, card)
                            const next = r + 1
                            if (next < training.segments.length) {
                                this.board.mark(next)
                                await this.cards.restore()
                            } else this.board.mark(null)
                        },
                    })
                    if (!wrote || gen !== this.gen) return
                }
            }

            await this.guide.demo({
                target: stage,
                gesture: { kind: 'none' },
                action: async () => {
                    if (!(await this.runLoop(gen, training))) return
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
        if (this.mode !== 'choose' && this.mode !== 'pickSlot') return
        const gen = ++this.gen
        this.mode = 'panel'
        this.hud.setHelpEnabled(false)
        this.cards.setEnabled(false)
        this.board.setSlotsEnabled(false)
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
