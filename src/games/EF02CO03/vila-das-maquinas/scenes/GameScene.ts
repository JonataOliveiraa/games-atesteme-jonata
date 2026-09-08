import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS } from '../data/levels'
import { MACHINES, canRunStep } from '../data/machines'
import { ASK, DEPTH, DRONE_HOVER, HUD, buttonX } from '../data/layout'
import { C } from '../data/theme'
import { createVillage } from './village'
import { createAsk, type Ask } from './ask'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { createCinema, type Cinema } from './cinema'
import { createProblem, type ProblemHandle } from './problems'
import { createMachineButton, machineImage, type MachineButton } from './machineButton'
import { performCorrect, performWrong } from './perform'
import { showAlbum } from './album'
import type { Command, LevelDef, LevelNumber, MachineId, MissionDef, MissionStep, Phase } from '../types'

const GAME_ID = 'vila-das-maquinas'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private missionIndex = 0
    private stepIndex = 0
    private missesOnStep = 0
    private missionsDone = 0

    private phase: Phase = 'intro'
    private busy = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0

    private village!: ReturnType<typeof createVillage>
    private ask!: Ask
    private hud!: Hud
    private audio!: Audio
    private cinema!: Cinema

    private problem?: ProblemHandle
    private buttons: MachineButton[] = []

    private unsubPlatform?: () => void

    private get mission(): MissionDef {
        return this.level.missions[this.missionIndex]
    }

    private get step(): MissionStep {
        return this.mission.steps[this.stepIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.missionIndex = 0
        this.stepIndex = 0
        this.missesOnStep = 0
        this.missionsDone = 0
        this.phase = 'intro'
        this.busy = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.buttons = []
        this.problem = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio(this)
        this.cinema = createCinema(this)
        this.cinema.reset()
        this.village = createVillage(this)
        this.ask = createAsk(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            missions: this.level.missions.length,
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
            size: 30,
            tint: C.bad,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startMission(0)
    }

    private shutdownScene() {
        this.gen++
        this.cinema?.reset()
        this.clearRound()
        this.ask?.destroy()
        this.hud?.destroy()
        this.village?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private clearRound() {
        this.buttons.forEach(button => button.destroy())
        this.buttons = []
        this.problem?.destroy()
        this.problem = undefined
    }

    // ─────────────────────────────────────────────── missão

    private async startMission(index: number) {
        const gen = ++this.gen
        this.missionIndex = index
        this.stepIndex = 0
        this.missesOnStep = 0
        this.phase = 'intro'
        this.busy = false

        this.clearRound()
        this.hud.setCurrent(index)

        const mission = this.mission
        this.problem = createProblem(this, mission.problem)
        void FX.popIn(this, this.problem.root, { from: 0.86, duration: 420 })

        this.audio.ask()
        await this.ask.show(mission.problem, mission.label)
        if (gen !== this.gen) return

        this.buttons = mission.shelf.map((id, i) =>
            createMachineButton(this, {
                machine: id,
                x: buttonX(i, mission.shelf.length),
                onTap: machine => void this.onTap(machine),
            }),
        )
        await Promise.all(this.buttons.map((button, i) => button.appear(i * 130)))
        if (gen !== this.gen) return

        if (index === 0) {
            this.phase = 'tutorial'
            await this.runTutorial(true)
            if (gen !== this.gen) return
        }

        this.phase = 'choosing'
        this.setButtonsEnabled(true)
    }

    private setButtonsEnabled(on: boolean) {
        this.buttons.forEach(button => button.setEnabled(on))
    }

    private correctButton() {
        return this.buttons.find(button => canRunStep(button.machine, this.step))
    }

    /** O primeiro comando que a etapa pede e a máquina não sabe fazer. */
    private missingCommand(machine: MachineId): Command {
        const known = MACHINES[machine].commands
        return this.step.requiredCommands.find(command => !known.includes(command))
            ?? this.step.requiredCommands[0]
    }

    // ─────────────────────────────────────────────── toque

    private async onTap(machineId: MachineId) {
        if (this.phase !== 'choosing' || this.busy) return
        const button = this.buttons.find(item => item.id === machineId)
        const problem = this.problem
        if (!button || !problem) return

        const gen = this.gen
        this.busy = true
        this.phase = 'running'
        this.setButtonsEnabled(false)
        this.hud.setEnabled(false)

        this.audio.tap()
        await button.press()
        if (gen !== this.gen) return

        this.audio.lift()
        const spot = {
            x: problem.anchors.machine.x,
            y: problem.anchors.machine.y - (machineId === 'drone' ? DRONE_HOVER : 0),
        }

        this.uiFade(0, 300, machineId)
        await Promise.all([
            button.lift(spot, problem.anchors.strip),
            this.cinema.enter(problem.shot),
        ])
        if (gen !== this.gen) return

        const context = {
            scene: this,
            audio: this.audio,
            button,
            problem,
            cinema: this.cinema,
        }
        const solved = canRunStep(button.machine, this.step)

        if (solved) await performCorrect(context)
        else await performWrong(context, this.missingCommand(machineId))
        if (gen !== this.gen) return

        await FX.wait(this, solved ? 760 : 440)
        if (gen !== this.gen) return

        const back = this.cinema.exit()
        await FX.wait(this, 220)
        this.uiFade(1, 340, machineId)
        await back
        if (gen !== this.gen) return

        if (solved) await this.succeed(button)
        else await this.fail(button)
    }

    /**
     * Some com tudo que é interface enquanto a máquina trabalha.
     *
     * `acting` é a máquina que subiu ao palco: o bay dela apaga junto com o
     * galpão, mas ela e as plaquinhas continuam acesas — são o assunto da cena.
     */
    private uiFade(alpha: number, ms: number, acting?: MachineId) {
        this.hud.fade(alpha, ms)
        this.ask.fade(alpha, ms)
        this.village.fadeFrame(alpha, ms)
        this.buttons.forEach(button => button.fade(alpha, ms, button.id !== acting))
        FX.to(this, this.lives.container, { alpha }, { duration: ms })
    }

    private async succeed(button: MachineButton) {
        const gen = this.gen
        const problem = this.problem!

        this.hits++
        const earned = this.missesOnStep === 0 ? 10 : 5
        this.score += earned
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        this.audio.missionDone()
        void this.ask.cheer()
        void FX.stars(this, problem.anchors.focus.x, problem.anchors.focus.y - 40, {
            color: C.ok,
            count: 12,
        })

        await FX.wait(this, 340)
        if (gen !== this.gen) return

        await button.land()
        if (gen !== this.gen) return

        this.stepIndex++
        if (this.stepIndex < this.mission.steps.length) {
            this.missesOnStep = 0
            this.phase = 'choosing'
            this.hud.setEnabled(true)
            this.buttons.forEach(item => item.setSpent(false))
            this.setButtonsEnabled(true)
            this.busy = false
            return
        }

        await this.sealMission(button.id)
        if (gen !== this.gen) return

        this.missionsDone++
        this.emitCheckpoint()

        if (this.missionIndex + 1 < this.level.missions.length) {
            void this.ask.hide()
            await FX.wait(this, 420)
            if (gen !== this.gen) return
            await this.startMission(this.missionIndex + 1)
            return
        }

        await this.endLevel()
    }

    /** A máquina que resolveu voa até o selo da missão e fica lá. */
    private async sealMission(machineId: MachineId) {
        const target = this.hud.stampPoint(this.missionIndex)
        const badge = machineImage(this, MACHINES[machineId], 74)
        badge.setPosition(buttonX(
            this.mission.shelf.indexOf(machineId),
            this.mission.shelf.length,
        ), 540).setDepth(DEPTH.fx)

        const base = badge.scale
        await FX.arcTo(this, badge, target, { height: 190, duration: 620 })
        await FX.to(this, badge, { scale: base * 0.4, alpha: 0 }, { duration: 220 })
        badge.destroy()

        this.hud.fill(this.missionIndex, machineId)
        await FX.wait(this, 420)
    }

    private async fail(button: MachineButton) {
        const gen = this.gen

        this.errors++
        this.missesOnStep++
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        void this.ask.worry()
        const hint = this.step.hints[button.id]
        if (hint) void this.hud.say(hint)

        await button.land()
        if (gen !== this.gen) return

        button.setSpent(true)
        if (this.missesOnStep >= 2) this.correctButton()?.setHint(true)

        this.phase = 'choosing'
        this.hud.setEnabled(true)
        this.setButtonsEnabled(true)
        this.busy = false
    }

    // ─────────────────────────────────────────────── fim de nível

    private async endLevel() {
        const gen = ++this.gen
        this.phase = 'done'
        this.busy = true
        this.hud.setEnabled(false)
        this.setButtonsEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.oven, C.sweeper, C.drone, C.ovenLight] })
        void this.ask.hide()

        await FX.wait(this, 520)
        if (gen !== this.gen) return

        await showAlbum(this)
        if (gen !== this.gen) return

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.name} pronta!`,
                subtitle: this.level.message,
                accent: C.oven,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 2400,
                    label: 'Outro morador está chamando...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft,
                        level: (done + 1) as LevelNumber,
                        points: this.score,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Vila resolvida!',
            subtitle: 'Cada máquina fez o que sabe fazer.',
            accent: C.oven,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
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
                    color: C.drone,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────── tutorial

    private tutorialSteps(): TutorialStep[] {
        const target = this.correctButton() ?? this.buttons[0]
        const strip = target.stripBounds()
        const bounds = target.buttonBounds()
        const stamps = this.hud.stampsBounds()

        return [
            {
                text: 'O morador tem um problema.',
                shape: 'rect',
                x: ASK.cx, y: ASK.cy,
                w: ASK.w + 22, h: ASK.h + 22,
                balloonY: 330,
            },
            {
                text: 'Cada máquina sabe dois comandos.',
                shape: 'rect',
                x: strip.x, y: strip.y,
                w: strip.w, h: strip.h,
                balloonX: 640, balloonY: 330,
            },
            {
                text: 'Toque na máquina que resolve.',
                shape: 'rect',
                x: bounds.x, y: bounds.y,
                w: bounds.w + 16, h: bounds.h + 16,
                balloonX: 640, balloonY: 330,
                pointer: {
                    fromX: bounds.x, fromY: bounds.y,
                    toX: bounds.x, toY: bounds.y,
                    tap: true,
                },
            },
            {
                text: 'Ela resolve e o selo acende!',
                shape: 'rect',
                x: stamps.x, y: stamps.y,
                w: stamps.w, h: stamps.h,
                balloonY: 300,
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        return new Promise<void>(resolve => {
            createTutorial(this, {
                key: `ef02co03-vila-l${this.level.level}`,
                once,
                accent: C.oven,
                safeTop: 8,
                steps: this.tutorialSteps(),
                onFinish: () => resolve(),
            })
        })
    }

    private replayTutorial() {
        if (this.phase !== 'choosing' || this.busy) return
        const gen = this.gen
        this.phase = 'tutorial'
        this.hud.setEnabled(false)
        this.setButtonsEnabled(false)

        void this.runTutorial(false).then(() => {
            if (gen !== this.gen) return
            this.phase = 'choosing'
            this.hud.setEnabled(true)
            this.setButtonsEnabled(true)
        })
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = this.level.missions.length
        const done = complete ? total : this.missionsDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / total) * 100),
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
            if (command.type === 'PAUSE_GAME') this.scene.pause()
            if (command.type === 'RESUME_GAME') this.scene.resume()
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
