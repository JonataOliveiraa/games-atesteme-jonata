import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { formatTime } from '../../../../shared/hud/createTimeBar'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, TOTAL_CHESTS, chestsBefore, optionsOf } from '../data/levels'
import { C } from '../data/theme'
import {
    CLUE,
    OPTION,
    W,
    cluePanelHeight,
    cluePanelWidth,
    optionsSpan,
} from '../data/layout'
import type { ChestDef, Code, LevelDef, LevelNumber, PlayState, Word } from '../types'
import { createAudio } from './audio'
import { createClue } from './clue'
import { createHud } from './hud'
import { createIsland } from './island'
import { createLegend } from './legend'
import { createOptions } from './options'
import { createRecap } from './recap'
import { createStatus } from './status'

const GAME_ID = 'ilha-dos-codigos'
const KEY_PHRASE = 'A mesma coisa pode ser dita com sons, cores ou desenhos!'
const DOT_SIZE = 7

const hasSound = (code: Code) => code === 'batidas' || code === 'som'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private chestIndex = 0
    private chest!: ChestDef

    private state: PlayState = 'intro'
    private paused = false
    private busy = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private streak = 0
    private chestsDone = 0
    private attempts = 0
    private levelStart = 0

    private island!: ReturnType<typeof createIsland>
    private clue!: ReturnType<typeof createClue>
    private options!: ReturnType<typeof createOptions>
    private legend!: ReturnType<typeof createLegend>
    private hud!: ReturnType<typeof createHud>
    private recap!: ReturnType<typeof createRecap>
    private status!: ReturnType<typeof createStatus>
    private audio!: ReturnType<typeof createAudio>

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]
        this.chestIndex = 0
        this.chest = this.level.chests[0]

        this.state = 'intro'
        this.paused = false
        this.busy = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.streak = 0
        this.chestsDone = 0
        this.attempts = 0
    }

    create() {
        this.input.topOnly = true
        this.levelStart = this.time.now

        this.audio = createAudio(this)
        this.island = createIsland(this, this.level.chests.length)
        this.clue = createClue(this, () => void this.replayClue())
        this.options = createOptions(this, {
            onPick: index => this.onPick(index),
            onPreview: index => void this.onPreview(index),
        })
        this.legend = createLegend(this)
        this.hud = createHud(this, () => this.replayTutorial())
        this.recap = createRecap(this)
        this.status = createStatus(this)

        this.legend.build(this.level.from, this.level.to)
        this.status.setLevel(this.level.level, LEVELS.length)
        this.status.setPhases(this.level.chests.length)
        this.options.setEnabled(false)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 24,
            y: 44,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startChest(0)
    }

    private shutdownScene() {
        this.gen++
        this.island?.destroy()
        this.clue?.destroy()
        this.options?.destroy()
        this.legend?.destroy()
        this.hud?.destroy()
        this.recap?.destroy()
        this.status?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private async startChest(index: number) {
        const gen = this.gen
        this.chestIndex = index
        this.chest = this.level.chests[index]
        this.attempts = 0
        this.status.setPhase(index)

        this.state = 'walking'
        this.busy = false
        this.options.clear()
        this.options.setEnabled(false)
        this.clue.setEnabled(false)
        this.clue.close()
        this.clue.hidePanel()

        await this.island.walkTo(index)
        if (gen !== this.gen) return

        this.clue.show(this.chest.message, this.level.from, hasSound(this.level.from))
        this.applyLegendPolicy(index)

        this.state = 'telling'
        this.clue.setEnabled(true)
        await FX.wait(this, 340)
        if (gen !== this.gen) return

        await this.clue.say(word => this.audio.speak(word, this.level.from))
        if (gen !== this.gen) return

        this.options.show(optionsOf(this.chest), this.level.to, this.level.playsOnTap)
        await FX.wait(this, 280)
        if (gen !== this.gen) return

        if (index === 0) {
            this.state = 'tutorial'
            await this.runTutorial(true)
            if (gen !== this.gen) return
        }

        this.state = 'choosing'
        this.options.setEnabled(true)
    }

    private applyLegendPolicy(index: number) {
        this.legend.setSticky(this.level.legend === 'always')
        if (this.level.legend === 'always') {
            this.legend.show()
            return
        }
        if (this.level.legend === 'peek') {
            this.legend.show(5000)
            return
        }
        if (index === 0) this.legend.show(5000)
        else this.legend.hide()
    }

    private async speakRow(words: Word[], code: Code) {
        const gen = this.gen
        for (const word of words) {
            const ms = this.audio.speak(word, code)
            await FX.wait(this, Math.max(380, ms))
            if (gen !== this.gen) return
        }
    }

    private async replayClue() {
        if (this.state !== 'choosing' || this.busy) return
        const gen = this.gen
        this.busy = true
        this.options.setEnabled(false)
        await this.clue.say(word => this.audio.speak(word, this.level.from))
        if (gen !== this.gen) return
        this.busy = false
        if (this.state === 'choosing') this.options.setEnabled(true)
    }

    private async onPreview(index: number) {
        if (this.state !== 'choosing' || this.busy) return
        const gen = this.gen
        this.busy = true
        this.options.setEnabled(false)
        await this.speakRow(optionsOf(this.chest)[index], this.level.to)
        if (gen !== this.gen) return
        this.busy = false
        if (this.state === 'choosing') this.options.setEnabled(true)
    }

    private onPick(index: number) {
        if (this.state !== 'choosing' || this.busy) return
        this.audio.pick()
        if (index === this.chest.correctAt) {
            void this.openChest()
            return
        }
        this.trap(index)
    }

    private trap(index: number) {
        this.attempts++
        this.errors++
        this.streak = 0

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.audio.wrong()
        this.hud.flash(C.bad)
        this.options.reject(index)
        void this.clue.shakeChest()
        this.clue.flashWrong()
        this.legend.peek(3200)

        if (this.attempts >= 2) this.options.hint(this.chest.correctAt)
        this.emitCheckpoint()
    }

    private async openChest() {
        const gen = this.gen
        this.state = 'opening'
        this.options.setEnabled(false)
        this.hits++
        this.streak++

        const earned = this.attempts === 0 ? 10 : 5
        this.score += earned
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        this.options.accept(this.chest.correctAt)
        this.clue.tone('ok')
        this.hud.flash(C.ok)
        this.audio.open()

        await this.clue.open()
        if (gen !== this.gen) return

        this.audio.streak(this.streak)
        this.island.sendPiece(this.clue.chestPoint(), this.chestIndex)
        this.chestsDone++
        this.status.setPhase(this.chestIndex + 1)
        this.emitCheckpoint()

        await FX.wait(this, 900)
        if (gen !== this.gen) return

        if (this.chestIndex + 1 < this.level.chests.length) {
            this.clue.hidePanel()
            this.options.clear()
            await this.fadeHud(0, 240)
            if (gen !== this.gen) return

            await this.island.travelTo(this.chestIndex + 1)
            if (gen !== this.gen) return

            await this.fadeHud(1, 240)
            if (gen !== this.gen) return

            await this.startChest(this.chestIndex + 1)
            return
        }

        await FX.wait(this, 300)
        if (gen !== this.gen) return
        await this.endLevel()
    }

    private fadeHud(alpha: number, ms: number) {
        this.legend.fade(alpha, ms)
        this.hud.fade(alpha, ms)
        this.status.fade(alpha, ms)
        return FX.wait(this, ms + 40)
    }

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.hud.setEnabled(false)
        this.status.setEnabled(false)
        this.legend.setEnabled(false)
        this.clue.setEnabled(false)
        this.options.setEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
            durationMs: Math.round(this.time.now - this.levelStart),
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        await this.island.celebrate()
        if (gen !== this.gen) return

        await this.recap.play(this.level, () => this.audio.tap())
        if (gen !== this.gen) return

        const level = this.level.level
        const elapsed = formatTime(this.time.now - this.levelStart)

        if (level < LEVELS.length) {
            const next = (level + 1) as LevelNumber
            showLevelComplete(this, {
                title: `${this.level.name} completa!`,
                subtitle: `Baús abertos  ·  ${elapsed}`,
                accent: C.warn,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level, size: DOT_SIZE },
                autoAdvance: {
                    delay: 2600,
                    label: 'Seguindo pela trilha...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft,
                        level: next,
                        points: this.score,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Tesouro da ilha!',
            subtitle: KEY_PHRASE,
            accent: C.warn,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length, size: DOT_SIZE },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal,
                        level: 1,
                        points: 0,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.cyan,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private tutorialSteps(): TutorialStep[] {
        const n = this.chest.message.length

        return [
            {
                text: 'O baú falou isto.',
                shape: 'rect',
                x: CLUE.cx, y: CLUE.cy,
                w: cluePanelWidth(n) + 30,
                h: cluePanelHeight(n) + 30,
            },
            {
                text: 'Toque no cartão igual.',
                shape: 'rect',
                x: OPTION.cx, y: OPTION.cy,
                w: optionsSpan(n) + 26,
                h: OPTION.h + 26,
                balloonX: W / 2, balloonY: 238,
                pointer: {
                    fromX: OPTION.cx, fromY: OPTION.cy,
                    toX: OPTION.cx, toY: OPTION.cy,
                    tap: true,
                },
            },
            {
                text: KEY_PHRASE,
                shape: 'none',
                balloonX: W / 2, balloonY: 330,
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        return new Promise<void>(resolve => {
            createTutorial(this, {
                key: 'ef01co05-ilha',
                once,
                accent: C.warn,
                safeTop: 12,
                steps: this.tutorialSteps(),
                onFinish: () => resolve(),
            })
        })
    }

    private replayTutorial() {
        if (this.state !== 'choosing' || this.busy) return
        const gen = this.gen
        this.state = 'tutorial'
        this.hud.setEnabled(false)
        this.options.setEnabled(false)
        this.clue.setEnabled(false)

        void this.runTutorial(false).then(() => {
            if (gen !== this.gen) return
            this.state = 'choosing'
            this.hud.setEnabled(true)
            this.options.setEnabled(true)
            this.clue.setEnabled(true)
        })
    }

    private emitCheckpoint(complete = false) {
        const done = chestsBefore(this.level.level)
            + (complete ? this.level.chests.length : this.chestsDone)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_CHESTS) * 100),
            score: Math.max(0, this.score),
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
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: command.stage,
                        points: this.score,
                    })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.setPaused(true)
            if (command.type === 'RESUME_GAME') this.setPaused(false)
        })
    }

    private setPaused(paused: boolean) {
        if (this.paused === paused) return
        this.paused = paused
        if (paused) this.scene.pause()
        else this.scene.resume()
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
