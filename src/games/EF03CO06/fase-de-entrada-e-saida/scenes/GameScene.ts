import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS } from '../data/levels'
import { emptySide, explain, problemSide, runChain, sideOf,  SOURCE_CONTENT } from '../data/rules'
import { DEPTH, HUD, REQUEST, STATION, TABLE } from '../data/layout'
import { C } from '../data/theme'
import type { ChallengeDef, LevelDef, LevelNumber, Mode, Outcome, Side } from '../types'
import { createRoom, type Room } from './room'
import { createComputer, type Computer } from './computer'
import { createCables, type Cables } from './cables'
import { createStations, type Stations } from './stations'
import { createLia, type Lia } from './lia'
import { createCarrier, type Carrier } from './carrier'
import { createOutputFx, type OutputFx } from './outputFx'
import { createCards, type Cards } from './cards'
import { createHint, type Hint } from './hint'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { showNextLevel } from './levelCard'

const GAME_ID = 'fase-de-entrada-e-saida'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0

    private tries = 0
    private focus: Side = 'input'
    private stalled = false

    private tutorialOpen = false
    private pendingTutorial = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private room!: Room
    private computer!: Computer
    private cables!: Cables
    private stations!: Stations
    private lia!: Lia
    private carrier!: Carrier
    private outputFx!: OutputFx
    private cards!: Cards
    private hint!: Hint
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get challenge(): ChallengeDef {
        return this.level.challenges[this.index]
    }

    private get repair(): boolean {
        return emptySide(this.challenge) === null
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.index = 0
        this.mode = 'intro'
        this.tries = 0
        this.stalled = false
        this.tutorialOpen = false
        this.pendingTutorial = true
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
    }

    create() {
        this.input.topOnly = true

        this.room = createRoom(this)
        this.audio = createAudio(this)
        this.computer = createComputer(this)
        this.cables = createCables(this, { inPort: this.computer.inPort(), outPort: this.computer.outPort() })
        this.stations = createStations(this)
        this.lia = createLia(this)
        this.carrier = createCarrier(this)
        this.outputFx = createOutputFx(this)
        this.cards = createCards(this, index => void this.pick(index))
        this.hint = createHint(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            challenges: this.level.challenges.length,
            onHelp: () => this.replayTutorial(),
        })

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
            tint: C.warn,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startChallenge(0)
    }

    private shutdownScene() {
        this.gen++
        this.hint?.destroy()
        this.cards?.destroy()
        this.outputFx?.destroy()
        this.carrier?.destroy()
        this.lia?.destroy()
        this.stations?.destroy()
        this.cables?.destroy()
        this.computer?.destroy()
        this.room?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private resetChain() {
        this.outputFx.clear()
        this.carrier.hide()
        this.stations.activate('input', false)
        this.stations.activate('output', false)
        this.stations.mark('input', false)
        this.stations.mark('output', false)
        this.computer.idle()
        this.cables.fault('input', false)
        this.cables.fault('output', false)
        this.cables.light('input', false)
        this.cables.light('output', false)
    }

    private async startChallenge(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'intro'
        this.tries = 0
        this.stalled = false
        this.applyInput()

        const challenge = this.challenge
        const empty = emptySide(challenge)
        this.hint.hush()
        this.stations.hideLock()
        this.resetChain()
        this.cards.clear()
        if (empty) this.stations.clear(empty)
        this.hud.setDone(this.done)
        this.lia.idle()

        await this.lia.say(challenge.prompt)
        if (gen !== this.gen) return

        this.lia.present(challenge.source)
        await FX.all(
            challenge.input ? this.stations.showFixed('input', challenge.input) : Promise.resolve(),
            challenge.output ? this.stations.showFixed('output', challenge.output) : Promise.resolve(),
        )
        if (gen !== this.gen) return

        if (empty) {
            this.focus = empty
            this.stations.showEmpty(empty)
        } else {
            const diagnosed = await this.diagnose(gen)
            if (!diagnosed) return
        }

        await this.cards.show(challenge.options)
        if (gen !== this.gen) return

        this.mode = 'choosing'
        this.applyInput()

        if (this.pendingTutorial && index === 0) {
            this.pendingTutorial = false
            this.runTutorial(true, this.level.level === 1)
        }
    }

    private async diagnose(gen: number) {
        const challenge = this.challenge
        this.mode = 'running'
        this.applyInput()
        await FX.wait(this, 400)
        if (gen !== this.gen) return false

        const outcome = runChain(challenge, null)
        const finished = await this.playChain(outcome, gen)
        if (!finished || gen !== this.gen) return false

        this.focus = problemSide(outcome)
        this.audio.stall()
        this.stations.showLock(this.focus)
        void this.hint.bad(explain(challenge, outcome, this.focus))
        await FX.wait(this, 900)
        if (gen !== this.gen) return false

        this.resetChain()
        this.lia.present(challenge.source)
        this.stations.mark(this.focus, true)
        this.cables.fault(this.focus, true)
        await FX.wait(this, 260)
        return gen === this.gen
    }

    private async pick(index: number) {
        if (this.mode !== 'choosing' || this.tutorialOpen) return
        const gen = this.gen
        const challenge = this.challenge
        const device = challenge.options[index]
        const side = sideOf(device)

        this.mode = 'running'
        this.applyInput()
        this.audio.tap()
        this.cards.press(index)
        this.cards.clearHints()
        this.hint.hush()

        const from = this.cards.artOf(index)
        this.cards.take(index, true)
        if (this.repair) {
            this.cables.fault(side, false)
            this.audio.dock()
            await this.stations.swap(side, device, from)
        } else {
            await this.stations.remove(side)
            if (gen !== this.gen) return
            this.audio.dock()
            await this.stations.dock(side, device, from)
        }
        if (gen !== this.gen) return

        const outcome = runChain(challenge, device)
        const finished = await this.playChain(outcome, gen)
        if (!finished || gen !== this.gen) return

        if (outcome.solved) await this.succeed()
        else await this.stall(outcome, side)
    }

    private async playChain(outcome: Outcome, gen: number) {
        const alive = () => gen === this.gen
        const challenge = this.challenge
        const source = SOURCE_CONTENT[challenge.source]
        const cableIn = this.cables.curve('input')
        const cableOut = this.cables.curve('output')

        this.lia.present(challenge.source)
        this.audio.source(source)
        await this.carrier.appear(source, this.lia.sourcePos(challenge.source))
        if (!alive()) return false
        await this.carrier.travel(this.stations.center('input'), C.input)
        if (!alive()) return false

        this.stations.activate('input', true)
        this.audio.capture(outcome.input)
        await FX.wait(this, 220)
        if (!alive()) return false

        if (!outcome.captured) {
            this.audio.empty()
            await this.carrier.fizzle()
            return alive()
        }

        await this.carrier.absorb(this.stations.center('input'))
        if (!alive()) return false
        await this.carrier.emerge(outcome.captured, cableIn.getPoint(0), C.input)
        if (!alive()) return false

        this.cables.light('input', true)
        this.computer.receive()
        this.audio.travel()
        await this.carrier.follow(cableIn, C.input)
        if (!alive()) return false
        this.stations.activate('input', false)

        await this.carrier.absorb(this.computer.face())
        if (!alive()) return false
        this.audio.process()
        await this.computer.process()
        if (!alive()) return false

        this.computer.send()
        await this.carrier.emerge(outcome.captured, cableOut.getPoint(0), C.output)
        if (!alive()) return false
        this.cables.light('output', true)
        this.audio.travel()
        await this.carrier.follow(cableOut, C.output)
        if (!alive()) return false

        if (!outcome.rendered) {
            void this.stations.bump('output')
            await this.carrier.bounce(this.stations.center('output'))
            return alive()
        }

        await this.carrier.absorb(this.stations.center('output'))
        if (!alive()) return false
        this.stations.activate('output', true)

        if (outcome.output === 'speaker') {
            this.audio.play(outcome.captured)
            await this.outputFx.speaker(this.stations.cone())
        }
        const screen = this.stations.screen()
        if (outcome.output === 'monitor' && screen) {
            this.audio.play(outcome.captured)
            await this.outputFx.monitor(screen, outcome.captured)
        }
        const slot = this.stations.printerSlot()
        if (outcome.output === 'printer' && slot) {
            this.audio.print()
            await this.outputFx.printer(slot, outcome.captured)
        }
        return alive()
    }

    private async succeed() {
        const gen = this.gen
        this.mode = 'success'
        this.applyInput()

        const points = this.stalled ? 5 : 10
        this.score += points
        this.hits += 1
        this.done += 1

        void this.hint.good()
        void this.stations.openLock()
        this.audio.success()
        void this.lia.cheer()
        void this.stations.hop('output')
        void FX.sparks(this, this.stations.center('output').x, this.stations.center('output').y, {
            color: C.gold,
            count: 18,
            spread: 170,
            depth: DEPTH.fx,
        })

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        await this.hud.celebrate(this.done - 1)
        if (gen !== this.gen) return
        await FX.wait(this, 1500)
        if (gen !== this.gen) return

        this.resetChain()
        await FX.all(this.cards.hide(), this.lia.hush())
        if (gen !== this.gen) return

        const next = this.index + 1
        if (next < this.level.challenges.length) void this.startChallenge(next)
        else void this.endLevel()
    }

    private async stall(outcome: Outcome, side: Side) {
        const gen = this.gen
        const challenge = this.challenge
        this.tries += 1

        this.audio.stall()
        this.stations.showLock(this.focus)
        void this.hint.bad(explain(challenge, outcome, side))

        if (!this.stalled) {
            this.stalled = true
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

        await FX.wait(this, 1100)
        if (gen !== this.gen) return
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.applyInput()
        this.hud.setEnabled(false)

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
        void FX.confetti(this, { colors: [C.input, C.output, C.ok, C.gold] })

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        const done = this.level.level

        if (done < LEVELS.length) {
            showNextLevel(this, {
                done,
                total: LEVELS.length,
                onDone: () => {
                    if (gen !== this.gen) return
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: (done + 1) as LevelNumber,
                        points: this.score,
                    })
                },
            })
            return
        }

        showLevelComplete(this, {
            accent: C.input,
            panelColor: C.cream,
            overlayColor: C.ink,
            depth: 5000,
            title: 'Caminho completo!',
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.input,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private applyInput() {
        const free = !this.tutorialOpen && this.mode === 'choosing'
        this.cards.setEnabled(free, !this.tutorialOpen && this.mode !== 'choosing')
    }

    private tutorialSteps(full: boolean) {
        const side = this.focus
        const repair = emptySide(this.challenge) === null
        const slotX = side === 'input' ? STATION.input.x : STATION.output.x
        const slotY = TABLE.top - STATION.slot.h / 2
        const cards = this.cards.bounds()
        const steps = [
            {
                text: 'Leia o que a Lia pede.',
                shape: 'rect' as const,
                ...this.lia.requestBounds(),
                balloonX: 640,
                balloonY: 330,
                pointer: { fromX: REQUEST.x, fromY: REQUEST.y, toX: REQUEST.x, toY: REQUEST.y, tap: true },
            },
            {
                text: repair
                    ? 'Aqui o caminho parou.'
                    : side === 'input'
                      ? 'Falta o aparelho de ENTRADA.'
                      : 'Agora falta o aparelho de SAÍDA.',
                shape: 'rect' as const,
                x: slotX,
                y: slotY,
                w: STATION.slot.w + 36,
                h: STATION.slot.h + 36,
                balloonX: side === 'input' ? 900 : 380,
                balloonY: 270,
                pointer: { fromX: slotX, fromY: slotY, toX: slotX, toY: slotY, tap: true },
            },
            {
                text: repair ? 'Toque no aparelho que conserta.' : 'Toque no aparelho que ajuda a Lia.',
                shape: 'rect' as const,
                ...cards,
                balloonX: 640,
                balloonY: 300,
                buttonLabel: 'Vamos!',
            },
        ]
        return full ? steps : steps.slice(1)
    }

    private runTutorial(once: boolean, full = true) {
        this.tutorialOpen = true
        this.applyInput()
        this.hud.setEnabled(false)
        createTutorial(this, {
            key: `ef03co06-entrada-saida-l${this.level.level}`,
            once,
            accent: C.input,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(full),
            onFinish: () => {
                this.tutorialOpen = false
                this.hud.setEnabled(true)
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode !== 'choosing') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.challenges.length
        const done = complete ? total : this.done
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
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: command.stage,
                        points: this.score,
                    })
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
