import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, risksIn } from '../data/levels'
import { outcomeOf, situation } from '../data/situations'
import { FIELD, HUD, TABLET, fieldBounds } from '../data/layout'
import { C } from '../data/theme'
import type { LevelDef, LevelNumber, Phase, RoundDef } from '../types'
import { createAudio, type Audio } from './audio'
import { createTablet, type Tablet } from './tablet'
import { createHud, type Hud } from './hud'
import { createQueue, type Queue } from './queue'
import { createFloater, type Floater } from './floater'
import { captureAndRise, popAt, riseFrom } from './bubble'
import { showSafeSeal } from './seal'

const GAME_ID = 'bolhas-da-seguranca'

const COMBO_STEP = 3
const HINT = 'Toque no que é perigo para o tablet.'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private roundIndex = 0
    private phase: Phase = 'intro'
    private paused = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private combo = 0
    private roundErrors = 0
    private colorTurn = 0

    private audio!: Audio
    private tablet!: Tablet
    private hud!: Hud
    private queue!: Queue

    private floaters: Floater[] = []
    private pending: string[] = []
    private spawnTimer = 0
    private spawnGap = 2000

    private unsubPlatform?: () => void

    private get round(): RoundDef {
        return this.level.rounds[this.roundIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.roundIndex = 0
        this.phase = 'intro'
        this.paused = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.combo = 0
        this.roundErrors = 0
        this.colorTurn = 0
        this.floaters = []
        this.pending = []
    }

    create() {
        this.audio = createAudio(this)
        this.tablet = createTablet(this, this.level)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            onHelp: () => this.replayTutorial(),
        })
        this.queue = createQueue(this, risksIn(this.round))

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
            tint: C.warn,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.playRound(0)
    }

    private shutdownScene() {
        this.gen++
        this.clearFloaters()
        this.queue?.destroy()
        this.hud?.destroy()
        this.tablet?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private async playRound(index: number) {
        const gen = ++this.gen
        this.roundIndex = index
        this.paused = false
        this.combo = 0
        this.roundErrors = 0
        this.spawnTimer = 0

        this.clearFloaters()
        this.queue.destroy()
        this.queue = createQueue(this, risksIn(this.round))

        this.pending = [...this.round.order]
        this.spawnGap = (this.level.crossing * 1000) / this.level.maxVisible

        this.hud.setTitle(`Rodada ${index + 1} de ${this.level.rounds.length}`)
        this.hud.setHint(HINT)

        await FX.wait(this, 320)
        if (gen !== this.gen) return

        if (index === 0) {
            this.phase = 'tutorial'
            const demo = this.level.level === 3
                ? [{ x: 400, lane: 0 }, { x: 700, lane: 1 }]
                : [{ x: 430, lane: 0 }, { x: 210, lane: 2 }]
            demo.forEach(spot => this.spawnNext(spot.x, spot.lane))
            await this.runTutorial(true)
            if (gen !== this.gen) return
        }

        this.phase = 'playing'
    }

    update(_time: number, delta: number) {
        if (this.phase !== 'playing' || this.paused) return

        this.spawnTimer += delta
        if (this.spawnTimer >= this.spawnGap) {
            this.spawnTimer = 0
            this.spawnNext()
        }

        for (const floater of [...this.floaters]) {
            if (floater.state !== 'flying') continue
            floater.tick(delta)
            if (floater.x < FIELD.lockX) continue

            if (floater.situation.kind === 'risk') {
                this.holdAtBorder(floater)
            } else {
                void this.letGo(floater)
            }
        }

        if (!this.pending.length && !this.floaters.length) {
            this.phase = 'done'
            void this.finishRound()
        }
    }

    private spawnNext(atX?: number, atLane?: number) {
        if (!this.pending.length) return
        if (this.floaters.length >= this.level.maxVisible) return

        const lane = atLane ?? this.freeLane()
        if (lane < 0) return

        const id = this.pending.shift()!
        const speed = (FIELD.lockX - FIELD.spawnX) / this.level.crossing

        const floater = createFloater(this, {
            situation: situation(id),
            lane,
            x: atX ?? FIELD.spawnX,
            speed,
            onTap: target => this.onTap(target),
        })

        this.floaters.push(floater)
    }

    private freeLane() {
        const busy = new Set(
            this.floaters
                .filter(f => f.x < FIELD.spawnX + FIELD.laneClearance)
                .map(f => FIELD.lanes.indexOf(Math.round(f.container.y))),
        )
        const free = FIELD.lanes.map((_, i) => i).filter(i => !busy.has(i))
        if (!free.length) return -1
        return Phaser.Utils.Array.GetRandom(free)
    }

    private remove(floater: Floater) {
        this.floaters = this.floaters.filter(item => item !== floater)
        floater.destroy()
    }

    private onTap(floater: Floater) {
        if (this.phase !== 'playing') return
        if (this.paused && !floater.locked) return

        const outcome = outcomeOf(floater.situation, floater.locked)
        if (outcome === 'safe-touched') {
            void this.touchedSafe(floater)
            return
        }
        void this.protect(floater, outcome === 'late')
    }

    private async protect(floater: Floater, late: boolean) {
        const gen = this.gen
        const wasPaused = this.paused

        floater.markCaptured()
        if (wasPaused && !this.floaters.some(item => item.locked)) {
            this.paused = false
            this.audio.unlock()
        }

        this.combo++
        const bonus = this.combo % COMBO_STEP === 0
        const earned = (late ? 5 : 10) + (bonus ? 5 : 0)
        this.score += earned
        this.hits++

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        if (bonus) this.audio.combo()
        else this.audio.bubble()

        const x = floater.x
        const y = floater.y

        const color = this.nextColor()

        void this.queue.fill(color)
        void FX.ping(this, x, y, color, { radius: 120, duration: 460 })

        if (bonus) void FX.stars(this, x, y, { color: C.gold, count: 10, rise: 130 })

        await captureAndRise(this, floater.container, bonus, floater.situation.seal, color)
        if (gen !== this.gen) return

        this.remove(floater)
    }

    private async touchedSafe(floater: Floater) {
        const gen = this.gen
        this.paused = true
        this.combo = 0
        this.errors++
        this.roundErrors++

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.audio.pop()
        this.hud.flash(C.warn)
        void popAt(this, floater.x, floater.y, C.warn)

        await showSafeSeal(this, floater.x, floater.y, floater.situation.seal, 1000)
        if (gen !== this.gen) return

        if (this.roundErrors >= 2) {
            this.floaters
                .filter(item => item.situation.kind === 'risk')
                .forEach(item => item.pulse())
        }

        this.paused = false
        this.emitCheckpoint()
    }

    private holdAtBorder(floater: Floater) {
        floater.lockHere()
        this.paused = true
        this.audio.lock()
        this.hud.flash(C.warn)
        this.hud.alert('Este perigo ficou preso! Toque nele.')
        void FX.shake(this, this.tablet.container, { amount: 9, times: 3 })
            .then(() => this.tablet.container.setPosition(0, 0))
    }

    private nextColor() {
        const colors = this.level.bubbleColors
        const color = colors[this.colorTurn % colors.length]
        this.colorTurn++
        return color
    }

    private async letGo(floater: Floater) {
        const gen = this.gen
        this.audio.leave()
        await floater.leave()
        if (gen !== this.gen) return
        this.remove(floater)
    }

    private async finishRound() {
        const gen = this.gen
        const tray = this.queue.trayPoint()
        riseFrom(this, tray.x, tray.y, this.level.bubbleColors)
        await this.queue.celebrate()
        if (gen !== this.gen) return

        const next = this.roundIndex + 1
        if (next < this.level.rounds.length) {
            this.emitCheckpoint()
            await FX.wait(this, 260)
            if (gen !== this.gen) return
            await this.playRound(next)
            return
        }

        this.finishLevel()
    }

    private finishLevel() {
        this.gen++
        this.phase = 'done'
        this.clearFloaters()
        this.hud.setTitle('Tablet protegido!')
        this.hud.setHint('')
        this.hud.setEnabled(false)
        this.audio.win()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.name} em segurança!`,
                subtitle: 'Cada perigo virou uma bolha.',
                accent: C.bubbleDark,
                panelColor: C.cream,
                overlayColor: C.shellDeep,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 2600,
                    label: 'Outro lugar da casa apareceu...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft,
                        level: (done + 1) as LevelNumber,
                        points: this.score,
                    }),
                },
            })
            return
        }

        void FX.confetti(this, { colors: [C.bubble, C.gold, C.ok, C.white] })
        showLevelComplete(this, {
            title: 'Tablet protegido!',
            subtitle: 'Você viu o perigo e deixou o seguro em paz.',
            accent: C.bubbleDark,
            panelColor: C.cream,
            overlayColor: C.shellDeep,
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
                    color: C.bubbleDark,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private clearFloaters() {
        this.floaters.forEach(floater => floater.destroy())
        this.floaters = []
    }

    private tutorialSteps(): TutorialStep[] {
        const field = fieldBounds()
        const risk = this.floaters.find(f => f.situation.kind === 'risk')
        const safe = this.floaters.find(f => f.situation.kind === 'safe')

        const grow = (box: { x: number; y: number; w: number; h: number }) => ({
            x: box.x, y: box.y, w: box.w + 30, h: box.h + 30,
        })
        const tapAt = (box: { x: number; y: number }) =>
            ({ fromX: box.x, fromY: box.y, toX: box.x, toY: box.y, tap: true })

        const riskBox = grow(risk ? risk.bounds() : field)
        const safeBox = grow(safe ? safe.bounds() : field)

        if (this.level.level === 3) {
            const left = Math.min(riskBox.x - riskBox.w / 2, safeBox.x - safeBox.w / 2)
            const right = Math.max(riskBox.x + riskBox.w / 2, safeBox.x + safeBox.w / 2)
            const top = Math.min(riskBox.y - riskBox.h / 2, safeBox.y - safeBox.h / 2)
            const bottom = Math.max(riskBox.y + riskBox.h / 2, safeBox.y + safeBox.h / 2)

            return [{
                text: 'Nem todo aviso é perigo.',
                shape: 'rect',
                x: (left + right) / 2,
                y: (top + bottom) / 2,
                w: right - left,
                h: bottom - top,
                balloonX: TABLET.cx,
                buttonLabel: 'Vamos lá!',
            }]
        }

        if (this.level.level === 2) {
            return [{
                text: 'Agora o perigo é o jeito de usar.',
                shape: 'rect',
                ...riskBox,
                balloonX: TABLET.cx,
                pointer: tapAt(riskBox),
                buttonLabel: 'Vamos lá!',
            }]
        }

        return [
            {
                text: 'Toque no perigo.',
                shape: 'rect',
                ...riskBox,
                balloonX: TABLET.cx,
                pointer: tapAt(riskBox),
            },
            {
                text: 'No seguro, não toque.',
                shape: 'rect',
                ...safeBox,
                balloonX: TABLET.cx,
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        return new Promise<void>(resolve => {
            createTutorial(this, {
                key: `ef02co06-bolhas-l${this.level.level}`,
                once,
                accent: C.bubbleDark,
                safeTop: HUD.h + 10,
                steps: this.tutorialSteps(),
                onFinish: () => resolve(),
            })
        })
    }

    private replayTutorial() {
        if (this.phase !== 'playing' || this.paused) return
        const gen = this.gen

        this.phase = 'tutorial'
        this.hud.setEnabled(false)
        this.floaters.forEach(floater => floater.setEnabled(false))

        void this.runTutorial(false).then(() => {
            if (gen !== this.gen) return
            this.phase = 'playing'
            this.hud.setEnabled(true)
            this.floaters.forEach(floater => floater.setEnabled(true))
        })
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.rounds.length
        const done = complete ? total : this.roundIndex
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
