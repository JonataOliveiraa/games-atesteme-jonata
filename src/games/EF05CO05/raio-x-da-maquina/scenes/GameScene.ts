import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, answerIndex, pointsFor, validateLevels, verdict } from '../data/levels'
import { part } from '../data/parts'
import { DEPTH, H, HUD, W } from '../data/layout'
import { A, C, CSS } from '../data/theme'
import type { LevelDef, MachineDef, Mode, PartDef, RequestDef } from '../types'

import { hasTrial, powerTrial, runTrial, trialFor, type TrialDef } from './trials'
import { createStart, type StartGate } from './start'
import { createXRay, type XRay } from './xray'
import { createRequest, type Request } from './request'
import { createSign, type Sign } from './sign'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'raio-x-da-maquina'
const IDLE_MS = 13000

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private machineIndex = 0
    private requestIndex = 0
    private mode: Mode = 'intro'
    private gen = 0

    private bays: PartDef[] = []
    private missesHere = 0
    private chargedHere = false

    private score = 0
    private hits = 0
    private errors = 0
    private machinesDone = 0

    private xray!: XRay
    private request!: Request
    private sign!: Sign
    private start!: StartGate
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics
    private idle?: Phaser.Time.TimerEvent

    private unsubPlatform?: () => void

    private get machine(): MachineDef {
        return this.level.machines[this.machineIndex]
    }

    private get ask(): RequestDef {
        return this.machine.requests[this.requestIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.machineIndex = 0
        this.requestIndex = 0
        this.mode = 'intro'
        this.bays = []
        this.missesHere = 0
        this.chargedHere = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.machinesDone = 0
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels(LEVELS, hasTrial)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.buildBackground()

        this.audio = createAudio()
        this.xray = createXRay(this, {
            onPick: index => void this.pick(index),
            blurNames: this.level.mode === 'mudo',
        })
        this.request = createRequest(this, this.machine.requests.length)
        this.sign = createSign(this)
        this.start = createStart(this, { onTap: () => this.audio.tap() })
        this.hud = createHud(this, {
            level: this.level.level,
            machines: this.level.machines.length,
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
            tint: C.gold,
            color: CSS.white,
            stroke: CSS.ink,
            strokeThickness: 6,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startMachine(0)
    }

    private buildBackground() {
        if (this.textures.exists('bg-oficina')) {
            this.add.image(W / 2, H / 2, 'bg-oficina').setDisplaySize(W, H).setDepth(DEPTH.bg)
        } else {
            const back = this.add.graphics().setDepth(DEPTH.bg)
            back.fillStyle(C.inkSoft, 1)
            back.fillRect(0, 0, W, H)
            back.fillStyle(C.ink, 1)
            back.fillRect(0, 300, W, H - 300)
        }

        const veil = this.add.graphics().setDepth(DEPTH.bg + 1)
        veil.fillStyle(C.ink, A.veil)
        veil.fillRect(0, 0, W, H)
    }

    private shutdownScene() {
        this.gen++
        this.idle?.remove()
        this.start?.destroy()
        this.sign?.destroy()
        this.hud?.destroy()
        this.request?.destroy()
        this.xray?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ─────────────────────────────── a máquina ─────────────────────────── */

    private async startMachine(index: number) {
        const gen = ++this.gen
        this.machineIndex = index
        this.requestIndex = 0
        this.missesHere = 0
        this.chargedHere = false
        this.mode = 'intro'

        this.cancelIdle()
        this.hud.setDone(index)
        this.xray.setEnabled(false)

        this.bays = this.machine.bays.map(part)
        this.xray.mount(this.bays)

        await this.request.arrive()
        if (gen !== this.gen) return

        this.audio.scan()
        await this.xray.scan()
        if (gen !== this.gen) return

        if (index === 0) {
            this.runTutorial(true)
            return
        }

        void this.askNow()
    }

    private async askNow() {
        const gen = ++this.gen
        this.mode = 'intro'
        this.xray.setEnabled(false)

        if (this.level.mode === 'mudo') {
            const answer = this.bays[answerIndex(this.machine.bays, this.ask.asks)]
            const trial = answer && trialFor(answer.id)
            if (trial) {
                await this.request.say('Olhe o que eu preciso fazer.')
                if (gen !== this.gen) return
                if (!(await this.openTrial(trial, gen, true))) return
            }
        }

        await this.request.say(this.ask.text)
        if (gen !== this.gen) return

        this.mode = 'asking'
        this.xray.setEnabled(true)
        this.armIdle()
    }

    private async pick(index: number) {
        if (this.mode !== 'asking') return
        this.mode = 'busy'
        this.cancelIdle()
        this.xray.setEnabled(false)
        this.xray.stopPulse()
        this.audio.tap()

        const gen = this.gen
        const chosen = this.bays[index]
        const result = verdict(chosen, this.ask.asks)

        if (result.kind === 'right') {
            this.audio.right()
            await this.xray.stamp(index)
            if (gen !== this.gen) return

            this.hits += 1
            this.request.setLamps(this.requestIndex + 1)
            void FX.sparks(this, this.xray.point(index).x, this.xray.point(index).y, { color: C.green, count: 16 })

            await this.request.say(chosen.confirm)
            if (gen !== this.gen) return
            await FX.wait(this, 500)
            if (gen !== this.gen) return

            const trial = this.level.mode === 'funcao' ? trialFor(chosen.id) : undefined
            if (trial) {
                await this.request.say(trial.prompt)
                if (gen !== this.gen) return
                if (!(await this.openTrial(trial, gen))) return
            }

            const next = this.requestIndex + 1
            if (next < this.machine.requests.length) {
                this.requestIndex = next
                void this.askNow()
            } else {
                void this.finishMachine()
            }
            return
        }

        this.audio.wrong()
        this.chargeOnce()
        this.missesHere += 1
        void this.flashFrame(C.amber)

        this.xray.dim(true)
        await this.xray.refuse(index)
        if (gen !== this.gen) return
    }

    /**
     * A máquina fala, e o desafio só abre quando a criança manda.
     *
     * Sem o botão a tela do desafio cobre o balão em cima da última letra, e
     * quem lê devagar perde a frase inteira. Devolve `false` se a cena virou.
     */
    private async openTrial(trial: TrialDef, gen: number, quiet = false): Promise<boolean> {
        this.xray.dim(true)
        await this.start.ask('COMEÇAR')
        if (gen !== this.gen) return false
        this.xray.dim(false)

        await runTrial(this, {
            trial: trial.run,
            title: trial.prompt,
            audio: this.audio,
            quiet,
            alive: () => gen === this.gen,
        })
        return gen === this.gen
    }

    private async finishMachine() {
        const gen = ++this.gen
        this.mode = 'busy'
        this.cancelIdle()
        this.xray.setEnabled(false)

        if (this.level.mode !== 'nome') {
            await this.request.say(powerTrial.prompt)
            if (gen !== this.gen) return
            if (!(await this.openTrial(powerTrial, gen))) return
        }

        const points = pointsFor(this.level.machines.length, !this.chargedHere)
        this.score += points
        this.machinesDone += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.audio.powerOn()
        await this.request.powerOn()
        if (gen !== this.gen) return

        void this.flashFrame(C.green)
        await this.hud.celebrate(this.machineIndex)
        if (gen !== this.gen) return

        await this.request.leave()
        if (gen !== this.gen) return

        const next = this.machineIndex + 1
        if (next < this.level.machines.length) void this.startMachine(next)
        else void this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.cancelIdle()
        this.xray.setEnabled(false)
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

        await this.xray.album()
        if (gen !== this.gen) return

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.cyan, C.green, C.gold, C.cream] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length

        showLevelComplete(this, {
            accent: C.cyan,
            panelColor: 0x11314c,
            overlayColor: C.ink,
            titleColor: CSS.cream,
            subtitleColor: CSS.gold,
            messageColor: CSS.cream,
            title: this.errors === 0 ? 'Nenhuma peça enganou você!' : 'Todas as máquinas ligaram!',
            subtitle: 'Você já sabe quem faz o quê lá dentro.',
            message: 'Entra, pensa, segura, guarda e mostra: cada peça tem o seu papel.',
            progress: { total: LEVELS.length, current: this.level.level },
            ...(last
                ? {
                    buttons: [
                        {
                            label: 'JOGAR DE NOVO',
                            color: C.cyan,
                            onClick: () =>
                                this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
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

    /* ─────────────────────────────── acabamento ────────────────────────── */

    private async flashFrame(color: number) {
        this.frame.clear()
        this.frame.lineStyle(14, color, 1)
        this.frame.strokeRect(7, 7, W - 14, H - 14)
        this.frame.setAlpha(0)
        await FX.to(this, this.frame, { alpha: 1 }, { duration: 80 })
        await FX.to(this, this.frame, { alpha: 0 }, { duration: 360 })
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

    private armIdle() {
        this.cancelIdle()
        this.idle = this.time.delayedCall(IDLE_MS, () => {
            if (this.mode !== 'asking') return
            this.request.nudge()
            this.armIdle()
        })
    }

    private cancelIdle() {
        this.idle?.remove()
        this.idle = undefined
    }

    /* ─────────────────────────────── tutorial ──────────────────────────── */

    private tutorialSteps(): TutorialStep[] {
        const machine = this.request.machinePoint()
        const balloon = this.request.balloonPoint()
        const bay = this.xray.point(0)

        return [
            {
                text: 'Esta máquina chegou para revisão.',
                shape: 'circle',
                x: machine.x,
                y: machine.y,
                w: 300,
                h: 300,
                balloonX: 520,
                balloonY: 470,
            },
            {
                text: 'O raio-X mostra as peças que ela tem dentro.',
                shape: 'rect',
                x: 640,
                y: 470,
                w: 1230,
                h: 480,
                balloonX: 640,
                balloonY: 160,
            },
            {
                text: 'Ela pede uma coisa de cada vez.',
                shape: 'rect',
                x: balloon.x,
                y: balloon.y,
                w: 920,
                h: 160,
                balloonX: 640,
                balloonY: 470,
            },
            {
                text: 'Toque na peça que faz aquilo. Depois você testa a peça.',
                shape: 'rect',
                x: bay.x,
                y: bay.y,
                w: 300,
                h: 430,
                balloonX: 820,
                balloonY: 300,
                buttonLabel: 'Vamos lá!',
                pointer: { fromX: bay.x, fromY: bay.y, toX: bay.x, toY: bay.y, tap: true },
            },
        ]
    }

    private runTutorial(once: boolean) {
        this.mode = 'intro'
        this.cancelIdle()
        this.xray.setEnabled(false)
        this.xray.stopPulse()
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef05co05rx-l${this.level.level}`,
            once,
            accent: C.cyan,
            safeTop: HUD.h + 10,
            textSize: 34,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.hud.setHelpEnabled(true)
                if (this.mode === 'done') return
                void this.askNow()
            },
        })
    }

    private replayTutorial() {
        if (this.mode !== 'asking') return
        this.runTutorial(false)
    }

    /* ────────────────────────────── plataforma ─────────────────────────── */

    private emitCheckpoint(final = false) {
        const total = this.level.machines.length
        const done = final ? total : this.machinesDone
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
