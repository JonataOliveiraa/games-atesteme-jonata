import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { GAME_DONE, LEVELS, LEVEL_DONE, TOTAL_TESTS, testsBefore, testsInLevel } from '../data/levels'
import { MISS_LINE, matchesZone, fittingZone, vehicleOf, zoneAttribute, zoneKey } from '../data/vehicles'
import { playTest } from './theatre'
import { C } from '../data/theme'
import { MAT } from '../data/layout'
import { createAudio } from './audio'
import { createAlbum } from './album'
import { createDetective } from './detective'
import { createHud } from './hud'
import { createVehiclePiece, drawBackdrop } from './stage'
import { createZones } from './zones'
import { pause } from './timing'
import type { LevelDef, LevelNumber, PhaseDef, VehicleModel } from '../types'

const GAME_ID = 'detetive-dos-modelos'
const CHEER = ['Funcionou!', 'Combinou!', 'Isso mesmo!']

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private levelDef!: LevelDef
    private phaseIndex = 0
    private vehicleIndex = 0
    private vehicle!: VehicleModel
    private missesHere = 0

    private state: 'tutorial' | 'playing' | 'busy' | 'ending' = 'tutorial'
    private paused = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private resolved = 0

    private backdrop: Phaser.GameObjects.GameObject[] = []
    private hud!: ReturnType<typeof createHud>
    private album!: ReturnType<typeof createAlbum>
    private detective!: ReturnType<typeof createDetective>
    private piece!: ReturnType<typeof createVehiclePiece>
    private zones?: ReturnType<typeof createZones>
    private audio!: ReturnType<typeof createAudio>

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.levelDef = LEVELS[number - 1]

        this.state = 'tutorial'
        this.paused = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.resolved = 0
        this.phaseIndex = 0
        this.vehicleIndex = 0
        this.missesHere = 0
    }

    create() {
        this.input.topOnly = true

        this.backdrop = drawBackdrop(this)
        this.audio = createAudio(this)
        this.hud = createHud(this, () => this.replayTutorial())
        this.album = createAlbum(this)
        this.detective = createDetective(this)
        this.piece = createVehiclePiece(this)

        this.hud.setLevel(this.levelDef.level, LEVELS.length)
        this.hud.setPhases(this.levelDef.phases.length)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startPhase()
        this.setEnabled(false)
        this.hud.setHelpEnabled(false)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 24,
            y: 108,
            size: 30,
            stage: () => this.levelDef.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        this.runTutorial(true, () => this.beginPlay())
    }

    private shutdownScene() {
        this.gen++
        this.zones?.destroy()
        this.piece?.destroy()
        this.detective?.destroy()
        this.album?.destroy()
        this.hud?.destroy()
        this.backdrop.forEach(part => part.destroy())
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private get phase(): PhaseDef {
        return this.levelDef.phases[this.phaseIndex]
    }

    private setEnabled(on: boolean) {
        this.zones?.setEnabled(on)
        if (on) this.matZone.setInteractive({ useHandCursor: true })
        else this.matZone.disableInteractive()
    }

    private matZone!: Phaser.GameObjects.Zone

    private startPhase() {
        this.zones?.destroy()
        this.zones = createZones(this, this.phase.zones, i => this.onZoneTap(i))
        this.album.reset(this.phase.vehicles.length)
        this.vehicleIndex = 0

        if (!this.matZone) {
            this.matZone = this.add
                .zone(MAT.x, MAT.touchY, MAT.touch.w, MAT.touch.h)
                .setOrigin(0.5)
                .setDepth(200)
            this.matZone.on('pointerdown', () => this.onVehicleTap())
        }
        this.startVehicle()
    }

    private startVehicle() {
        this.vehicle = vehicleOf(this.phase.vehicles[this.vehicleIndex])
        this.missesHere = 0
        this.piece.show(this.vehicle)
        this.detective.mood('watch')
        this.detective.hush()
        this.zones?.arm(false)
    }

    private beginPlay() {
        if (this.state === 'ending') return
        this.state = 'playing'
        this.hud.setHelpEnabled(true)
        this.setEnabled(true)
    }

    private onVehicleTap() {
        if (this.paused || this.state !== 'playing') return
        this.audio.pick()
        if (this.piece.lifted) {
            this.piece.drop()
            this.zones?.arm(false)
            return
        }
        this.piece.lift()
        this.zones?.arm(true)
    }

    private onZoneTap(index: number) {
        if (this.paused || this.state !== 'playing') return
        if (!this.piece.lifted) {
            this.audio.tap()
            this.piece.nudge()
            return
        }
        void this.test(index)
    }

    private reward() {
        const points = this.missesHere === 0 ? 10 : 5
        this.score += points
        this.hits += 1
        this.resolved += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.levelDef.level,
        })
        this.emitCheckpoint()
    }

    private penalize() {
        this.errors += 1
        this.missesHere += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()
    }

    private async test(index: number) {
        const gen = this.gen
        const zones = this.zones
        if (!zones) return

        this.state = 'busy'
        this.setEnabled(false)
        this.hud.setHelpEnabled(false)
        zones.arm(false)
        zones.press(index)
        this.detective.hush()

        this.audio.send()
        await this.piece.flyTo(zones.centerOf(index))
        if (gen !== this.gen) return

        const zone = this.phase.zones[index]
        const key = zoneKey(zone)
        const ok = matchesZone(this.vehicle, zone)

        await playTest(this, {
            zone,
            zoneKey: key,
            vehicle: this.vehicle,
            ok,
            onAction: () => {
                if (key === 'air') this.audio.air()
                else if (key === 'water') this.audio.water()
                else if (key === 'land') this.audio.land()
                else this.audio.still()
                if (!ok) this.audio.wrong()
            },
        })
        if (gen !== this.gen) return

        if (ok) await this.succeed(index, key)
        else await this.miss(index)
    }

    private async succeed(index: number, key: string) {
        const gen = this.gen
        this.reward()
        this.detective.mood('smile')
        this.detective.say(CHEER[this.resolved % CHEER.length], C.ok)

        const slot = this.album.slotAt(this.vehicleIndex)
        await this.piece.toAlbum(slot, this.album.slotSize())
        if (gen !== this.gen) return

        await this.album.place(this.vehicleIndex, this.vehicle, key)
        if (gen !== this.gen) return
        this.detective.hush()

        if (this.vehicleIndex + 1 >= this.phase.vehicles.length) {
            await this.endPhase()
            return
        }
        this.vehicleIndex += 1
        this.startVehicle()
        this.beginPlay()
    }

    private async miss(index: number) {
        const gen = this.gen
        const zones = this.zones!
        const zone = this.phase.zones[index]

        this.penalize()
        const attr = zoneAttribute(zone)
        this.detective.mood('think')
        this.detective.say(MISS_LINE[attr], C.bad, attr)

        void zones.deny(index)
        await pause(this, 900)
        if (gen !== this.gen) return

        await zones.release(index)
        if (gen !== this.gen) return
        await this.piece.back()
        if (gen !== this.gen) return
        this.detective.hush()
        this.detective.mood('watch')

        if (this.missesHere >= 2) {
            const safe = fittingZone(this.vehicle, this.phase.zones)
            if (safe >= 0) zones.nudge(safe)
            await pause(this, 750)
            if (gen !== this.gen) return
        }
        this.beginPlay()
    }

    private async endPhase() {
        const gen = this.gen
        this.detective.mood('cheer')
        this.audio.fanfare()
        await this.album.parade()
        if (gen !== this.gen) return
        await this.hud.markPhase()
        if (gen !== this.gen) return
        await pause(this, 420)
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 >= this.levelDef.phases.length) {
            void this.endLevel()
            return
        }
        this.phaseIndex += 1
        this.startPhase()
        this.emitCheckpoint()
        this.beginPlay()
    }

    private tutorialSteps(): TutorialStep[] {
        const zone = this.zones?.centerOf(0) ?? { x: 300, y: 250 }
        return [
            {
                text: 'Veja o veículo.',
                shape: 'circle', x: MAT.x, y: MAT.y, w: 330, h: 330,
                balloonX: 700, balloonY: 210,
            },
            {
                text: 'Toque nele para pegar.',
                shape: 'circle', x: MAT.x, y: MAT.y, w: 330, h: 330,
                balloonX: 700, balloonY: 210,
                pointer: { fromX: MAT.x, fromY: MAT.y, toX: MAT.x, toY: MAT.y, tap: true },
            },
            {
                text: 'Agora toque no lugar que combina.',
                shape: 'rect', x: zone.x, y: zone.y, w: 360, h: 274,
                balloonX: 700, balloonY: 520,
                pointer: { fromX: zone.x, fromY: zone.y, toX: zone.x, toY: zone.y, tap: true },
            },
            {
                text: 'Se combinar, ele funciona!',
                shape: 'rect', x: 640, y: 664, w: 560, h: 120,
                balloonX: 640, balloonY: 300,
                buttonLabel: 'Vamos investigar!',
            },
        ]
    }

    private runTutorial(once: boolean, onFinish: () => void) {
        createTutorial(this, {
            key: 'ef02co01-detetive',
            once,
            accent: C.warn,
            safeTop: 12,
            steps: this.tutorialSteps(),
            onFinish,
        })
    }

    private replayTutorial() {
        if (this.state !== 'playing') return
        this.state = 'tutorial'
        this.hud.setHelpEnabled(false)
        this.setEnabled(false)
        this.runTutorial(false, () => this.beginPlay())
    }

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.hud.setHelpEnabled(false)
        this.setEnabled(false)
        this.piece.hide()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.levelDef.level,
            totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        void FX.confetti(this, { count: 40, duration: 1600 })
        await pause(this, 460)
        if (gen !== this.gen) return

        const level = this.levelDef.level

        if (level < LEVELS.length) {
            const next = (level + 1) as LevelNumber
            showLevelComplete(this, {
                title: LEVEL_DONE,
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2200,
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft, level: next, points: this.score,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: GAME_DONE,
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal, level: 1, points: 0,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.sky,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private emitCheckpoint(complete = false) {
        const total = testsInLevel(this.levelDef)
        const partial = testsBefore(this.levelDef.level)
            + (complete ? total : Math.min(this.resolved, total))
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((partial / TOTAL_TESTS) * 100),
            score: Math.max(0, this.score),
            stage: this.levelDef.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                const wanted = command.stage
                    ? Phaser.Math.Clamp(command.stage, 1, LEVELS.length)
                    : this.levelDef.level
                if (wanted !== this.levelDef.level) {
                    this.scene.restart({
                        lives: this.livesLeft, level: wanted, points: this.score,
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
