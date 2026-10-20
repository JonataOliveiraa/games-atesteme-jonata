import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CIDA_CELL, cellKey } from '../data/files'
import { CAPTION, CONSOLE, NIGHT, ROAD_SPOT, STOP, TARGET, VILLAGE, WINDSHIELD } from '../data/layout'
import { LEVELS, POINTS, guideKey } from '../data/levels'
import { DEVICES } from '../data/devices'
import { fitting, verdict } from '../data/rules'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL, MESSAGE, RADIO_CALL, RADIO_DEFAULT, TUTOR, why } from '../data/words'
import type { DeviceId, LevelDef, ProblemDef, State, Verdict } from '../types'

import { createAudio, type Audio } from './audio'
import { createCaption, type Caption } from './caption'
import { createCockpit, type Cockpit } from './cockpit'
import { seen, spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createLandmarks, type Landmarks } from './landmarks'
import { createNight, type Night } from './night'
import { createRain, type Rain } from './rain'
import { createRoad, type Prop, type Road, type Spot, type Street } from './road'
import { createSplats, type Splats } from './splats'
import { createSignal, gpsScreen, paperMap, searching, type Signal } from './screens'
import { chatBubble, delivery, envelopeBack, flyEnvelope, hornWaves, radioWaves, speakerWaves, towCable } from './signals'

const GAME_ID = 'rota-da-madrugada'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private state: State = 'intro'
    private gen = 0
    private index = 0
    private introduce = false
    private heard = false
    private engineAt = 0

    private speed = 0
    private cruise = 0
    private braking = false
    private brakeTo?: { prop: Spot; at: number }
    private brakeRate = 0
    private stopWait?: () => void

    private on = new Set<DeviceId>()
    private dog?: Prop
    private cow?: Prop
    private stuck = false
    private online = true
    private street?: Street
    private cida?: Phaser.GameObjects.Image
    private tag?: Phaser.GameObjects.Container
    private sensorTimer?: Phaser.Time.TimerEvent

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private road!: Road
    private night!: Night
    private rain!: Rain
    private cockpit!: Cockpit
    private header!: Header
    private landmarks?: Landmarks
    private signal?: Signal
    private splats!: Splats
    private caption!: Caption
    private audio!: Audio

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.state = 'intro'
        this.index = 0
        this.introduce = false
        this.heard = false
        this.engineAt = 0
        this.speed = 0
        this.cruise = 0
        this.braking = false
        this.brakeTo = undefined
        this.brakeRate = 0
        this.stopWait = undefined
        this.on = new Set()
        this.dog = undefined
        this.cow = undefined
        this.stuck = false
        this.online = true
        this.landmarks = undefined
        this.signal = undefined
        this.street = undefined
        this.cida = undefined
        this.tag = undefined
        this.sensorTimer = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.road = createRoad(this, this.level.zone)
        this.night = createNight(this, NIGHT[this.level.zone])
        if (this.level.headlights) void this.night.setBeam(true, 0)
        if (this.level.village) this.landmarks = createLandmarks(this)
        this.rain = createRain(this)
        this.cockpit = createCockpit(this, this.level.devices, !!this.level.signal, id => void this.pick(id))
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.problems.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        if (this.level.signal) {
            const badges = this.level.devices.filter(id => DEVICES[id].online).map(id => this.cockpit.boxOf(id))
            this.signal = createSignal(this, true, badges)
        }
        this.splats = createSplats(this)
        this.caption = createCaption(this)
        this.audio = createAudio()
        this.header.setHelpEnabled(false)
        this.header.ask(this.level.goal)
        this.cockpit.offer(null)

        this.input.on('pointerdown', this.wake, this)
        this.input.keyboard?.on('keydown', this.wake, this)
        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.introduce = !seen(this, guideKey(this.level.level))
        void this.begin()
    }

    private focusGame = () => window.focus()

    private wake() {
        if (this.heard) return
        this.heard = true
    }

    private shutdownScene() {
        this.gen++
        this.sensorTimer?.remove()
        this.input.off('pointerdown', this.wake, this)
        this.input.keyboard?.off('keydown', this.wake, this)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.cida?.destroy()
        this.tag?.destroy()
        this.signal?.destroy()
        this.splats?.destroy()
        this.landmarks?.destroy()
        this.caption?.destroy()
        this.header?.destroy()
        this.cockpit?.destroy()
        this.rain?.destroy()
        this.night?.destroy()
        this.road?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(time: number, deltaMs: number) {
        if (!this.road) return
        const dt = Math.min(deltaMs, 50) / 1000
        this.drive(dt)
        this.road.update(dt, this.speed)
        this.rain.update(dt)
        if (this.heard && time - this.engineAt > 200) {
            this.engineAt = time
            this.audio.engine(this.stuck ? 0.9 : this.speed / TIMING.speed)
        }
    }

    private drive(dt: number) {
        if (this.brakeTo) {
            const left = this.brakeTo.prop.z - this.brakeTo.at
            if (left <= 0.02 || (this.braking && this.speed <= 0.05)) {
                this.halt()
                return
            }
            const need = (this.speed * this.speed) / (2 * left)
            if (!this.braking && need >= TIMING.speed / (TIMING.brake / 1000)) {
                this.braking = true
                this.audio.brake()
            }
            if (this.braking) this.speed = Math.max(0, this.speed - need * dt)
            return
        }
        if (this.brakeRate > 0) {
            this.speed = Math.max(0, this.speed - this.brakeRate * dt)
            if (this.speed === 0) this.halt()
            return
        }
        const step = (TIMING.speed / (TIMING.accel / 1000)) * dt
        this.speed = this.speed < this.cruise ? Math.min(this.cruise, this.speed + step) : Math.max(this.cruise, this.speed - step)
    }

    private go(cruise: number = TIMING.speed) {
        this.cruise = cruise
        this.brakeTo = undefined
        this.brakeRate = 0
        this.braking = false
    }

    private halt() {
        this.speed = 0
        this.cruise = 0
        this.brakeTo = undefined
        this.brakeRate = 0
        this.braking = false
        const done = this.stopWait
        this.stopWait = undefined
        done?.()
    }

    private stopAt(prop: Spot, at: number) {
        return new Promise<void>(resolve => {
            this.stopWait = resolve
            this.braking = false
            this.brakeTo = { prop, at }
        })
    }

    private stopNow() {
        return new Promise<void>(resolve => {
            this.stopWait = resolve
            this.audio.brake()
            this.brakeRate = Math.max(this.speed, 0.5) / (TIMING.brake / 1000)
        })
    }

    private problem(i: number): ProblemDef {
        return this.level.problems[i]
    }

    private free() {
        return this.level.devices.filter(id => !this.on.has(id))
    }

    private async begin() {
        const gen = this.gen
        if (this.introduce && this.level.level === 1) {
            await teach(this, guideKey(this.level.level), [{ text: TUTOR.start, ...spot(ROAD_SPOT), buttonLabel: TUTOR.see, balloonY: 150 }])
            if (gen !== this.gen) return
        }
        if (this.introduce && this.level.level === 2) {
            const key = guideKey(this.level.level)
            this.cockpit.offer(this.free())
            await teach(this, key, [{ text: TUTOR.newTech, ...spot(this.cockpit.consoleRect()), buttonLabel: TUTOR.see, balloonY: 300 }])
            if (gen !== this.gen) return
            this.cockpit.offer(null)
            await teach(this, key, [{ text: TUTOR.reach, ...spot(WINDSHIELD), buttonLabel: TUTOR.see, balloonY: 150 }])
            if (gen !== this.gen) return
        }
        await this.play(0)
    }

    private async play(i: number) {
        const gen = this.gen
        const p = this.problem(i)
        this.index = i
        this.state = 'drive'
        this.header.setHelpEnabled(false)
        this.header.ask(this.level.goal)
        this.cockpit.offer(null)
        if (p.kind === 'escuro') this.road.setZone('estrada')
        if (p.kind === 'entrega') {
            this.road.setZone('rua')
            void this.night.setDark(NIGHT.rua, 2400)
        }
        this.go()
        await FX.wait(this, p.drive)
        if (gen !== this.gen) return
        await this.arrive(p)
        if (gen !== this.gen) return
        await this.ask(p, i)
    }

    private async arrive(p: ProblemDef) {
        const gen = this.gen
        if (p.kind === 'escuro') {
            void this.night.setDark(NIGHT.estrada, TIMING.darken)
            await this.stopNow()
            return
        }
        if (p.kind === 'chuva') {
            this.rain.start(TIMING.rainUp)
            await FX.wait(this, TIMING.rainUp * 0.7)
            if (gen !== this.gen) return
            await this.stopNow()
            return
        }
        if (p.kind === 'cachorro') {
            this.sensorOff(false)
            this.dog = this.road.spawnDog(TARGET.dogSpawn)
            await this.stopAt(this.dog, STOP.dog)
            return
        }
        if (p.kind === 'bifurcacao') {
            const fork = this.road.spawnFork(TARGET.forkSpawn, p.way ?? 1, !p.newRoad, !!p.newRoad)
            if (p.offline && this.online) {
                this.online = false
                void this.signal?.set(false)
            }
            if (this.signal && !p.offline && !this.online) {
                this.road.spawnThing('tower', TARGET.forkSpawn + TARGET.towerAhead, -(p.way ?? 1) * TARGET.towerSide)
                void this.signalBack()
            }
            await this.stopAt(fork, STOP.fork)
            return
        }
        if (p.kind === 'vaca') {
            this.cow = this.road.spawnCow(TARGET.cowSpawn)
            await this.stopAt(this.cow, STOP.cow)
            this.audio.moo()
            return
        }
        if (p.kind === 'vizinho') {
            await this.stopNow()
            if (gen !== this.gen) return
            await this.landmarks?.tagNeighbor(LABEL.neighbor)
            return
        }
        if (p.kind === 'ponte') {
            const barrier = this.road.spawnThing('barrier', TARGET.barrierSpawn, 0)
            this.road.breakBridge(barrier)
            await this.stopAt(barrier, STOP.barrier)
            return
        }
        if (p.kind === 'atoleiro') {
            await this.stopAt(this.road.spawnMud(TARGET.mudSpawn), STOP.mud)
            if (gen !== this.gen) return
            this.stuck = true
            this.audio.stuck()
            FX.shakeCam(this, 'leve')
            this.splats.splash(8)
            await FX.wait(this, TIMING.stuck / 2)
            if (gen !== this.gen) return
            FX.shakeCam(this, 'leve')
            this.splats.splash(6)
            await FX.wait(this, TIMING.stuck / 2)
            return
        }
        this.street = this.road.spawnStreet(TARGET.streetSpawn)
        await this.stopAt(this.street.cida, STOP.house)
        if (gen !== this.gen) return
        this.tag = this.road.nameTag(this.street.cida, LABEL.house)
        await FX.popIn(this, this.tag, { from: 0.4, duration: 300 })
    }

    private async ask(p: ProblemDef, i: number) {
        const gen = this.gen
        this.header.ask(p.ask, true)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        if (this.introduce && i === 0 && this.level.level === 1) {
            await this.demo(p)
            return
        }
        if (this.introduce && i === 0 && this.signal) {
            await this.teachSignal(this.signal)
            if (gen !== this.gen) return
        }
        this.state = 'ask'
        this.cockpit.offer(this.free())
        this.header.setHelpEnabled(true)
    }

    private async demo(p: ProblemDef) {
        const gen = this.gen
        const key = guideKey(this.level.level)
        this.state = 'help'
        await teach(this, key, [{ text: TUTOR.dark, ...spot(ROAD_SPOT), buttonLabel: TUTOR.see, balloonY: 150 }])
        if (gen !== this.gen) return
        this.cockpit.offer(this.free())
        await teach(this, key, [{ text: TUTOR.tech, ...spot(this.cockpit.consoleRect()), buttonLabel: TUTOR.see, balloonY: 300 }])
        if (gen !== this.gen) return
        const fit = fitting(p, this.free())[0]
        this.cockpit.ring(fit)
        await FX.wait(this, TIMING.demoPress)
        if (gen !== this.gen) return
        this.cockpit.offer(null)
        this.audio.click()
        void this.cockpit.press(fit)
        await this.use(p, fit, 'fit')
        if (gen !== this.gen) return
        await this.solved(p, false, true)
        if (gen !== this.gen) return
        await teach(this, key, [{ text: TUTOR.yourTurn, shape: 'none' }])
        if (gen !== this.gen) return
        await this.play(this.index + 1)
    }

    private async teachSignal(signal: Signal) {
        const gen = this.gen
        const key = guideKey(this.level.level)
        this.state = 'help'
        await teach(this, key, [{ text: TUTOR.noSignal, ...spot(signal.rect()), buttonLabel: TUTOR.see, balloonY: 300 }])
        if (gen !== this.gen) return
        this.cockpit.offer(this.free())
        await teach(this, key, [{ text: TUTOR.online, ...spot(this.cockpit.consoleRect()), buttonLabel: TUTOR.see, balloonY: 300 }])
    }

    private async signalBack() {
        const gen = this.gen
        await FX.wait(this, TIMING.signalBack)
        if (gen !== this.gen) return
        this.online = true
        await this.signal?.set(true)
    }

    private async pick(id: DeviceId) {
        if (this.state !== 'ask' || this.on.has(id)) return
        const gen = this.gen
        const p = this.problem(this.index)
        this.state = 'resolve'
        this.header.setHelpEnabled(false)
        this.cockpit.offer(null)
        this.audio.click()
        void this.cockpit.press(id)
        const result = verdict(p, id)
        await this.use(p, id, result)
        if (gen !== this.gen) return
        if (result !== 'fit') {
            await this.wrong(p, id)
            return
        }
        await this.solved(p, true, false)
    }

    private async use(p: ProblemDef, id: DeviceId, result: Verdict) {
        const gen = this.gen
        const fit = result === 'fit'
        if (id === 'farol') {
            this.audio.beam()
            this.on.add('farol')
            this.cockpit.setOn('farol', true)
            await this.night.setBeam(true, TIMING.beamOn)
            return
        }
        if (id === 'limpador') {
            this.audio.wiper()
            await this.rain.sweep()
            if (!fit || gen !== this.gen) return
            this.on.add('limpador')
            this.cockpit.setOn('limpador', true)
            this.rain.setSensor(true)
            this.sensorTimer = this.time.delayedCall(TIMING.rainAfter, () => this.sensorOff(true))
            return
        }
        if (id === 'buzina') {
            this.audio.horn()
            this.cockpit.honk()
            hornWaves(this, TARGET.horn, p.kind === 'entrega' ? TARGET.streetReach : p.far ? TARGET.hornShort : TARGET.hornReach)
            await FX.wait(this, TIMING.horn)
            if (gen !== this.gen) return
            if (p.kind === 'cachorro' && this.dog) await this.chaseDog(this.dog)
            if (p.kind === 'vaca' && this.cow) await this.chaseCow(this.cow)
            if (p.kind === 'entrega' && this.street) await this.wakeStreet(this.street)
            return
        }
        if (id === 'gps') {
            this.audio.gps()
            if (p.offline) {
                await searching(this)
                return
            }
            await gpsScreen(this, p.need === 'caminho' ? (p.way ?? null) : null)
            if (gen !== this.gen) return
            if (fit) await this.takeWay()
            return
        }
        if (id === 'mapa') {
            this.audio.paper()
            await paperMap(this, fit ? (p.way ?? null) : null)
            if (gen !== this.gen) return
            if (fit) await this.takeWay()
            return
        }
        if (id === 'altofalante') {
            this.audio.speaker()
            await speakerWaves(this, TARGET.roof, this.landmarks?.villageCenter() ?? TARGET.lost)
            if (gen !== this.gen || !this.landmarks) return
            if (p.kind === 'vizinho') this.landmarks.lightNeighbor()
            await this.landmarks.lightVillage(TIMING.villageStep)
            return
        }
        if (id === 'radio') {
            this.audio.radio()
            radioWaves(this, TARGET.antenna)
            chatBubble(this, RADIO_CALL[p.kind] ?? RADIO_DEFAULT)
            await FX.wait(this, TIMING.radio)
            if (gen !== this.gen) return
            if (fit && p.kind === 'atoleiro') await this.callTow()
            return
        }
        this.audio.send()
        chatBubble(this, MESSAGE[p.kind])
        const from = { x: CONSOLE.x + CONSOLE.w / 2, y: CONSOLE.y + 10 }
        if (p.offline) {
            await envelopeBack(this, from, TARGET.lost)
            return
        }
        const to = this.envelopeTarget(p)
        await flyEnvelope(this, from, to ?? TARGET.lost, TARGET.envelope, !to || (!fit && p.kind !== 'ponte'))
        if (gen !== this.gen) return
        if (p.kind === 'ponte') this.landmarks?.lightOne(VILLAGE.one)
        if (fit && p.kind === 'vizinho') this.landmarks?.lightNeighbor()
        if (fit && p.kind === 'entrega' && this.street) await this.openDoor(this.street)
    }

    private envelopeTarget(p: ProblemDef) {
        if (p.kind === 'entrega' && this.street) return this.road.windowOf(this.street.cida)
        if (p.kind === 'cachorro' && this.dog) return this.headOf(this.dog, 120)
        if (p.kind === 'vaca' && this.cow) return this.headOf(this.cow, 160)
        if (p.kind === 'vizinho') return this.landmarks?.neighborWindow()
        if (p.kind === 'ponte') return this.landmarks?.villageWindow(VILLAGE.one)
        return undefined
    }

    private headOf(prop: Prop, height: number) {
        const at = this.road.base(prop)
        return { x: at.x, y: at.y - height * this.road.scaleOf(prop) }
    }

    private async takeWay() {
        this.road.showArrow()
        await FX.wait(this, TIMING.arrow)
    }

    private async chaseCow(cow: Prop) {
        const gen = this.gen
        this.road.cowPose(cow, 'startled')
        this.audio.moo()
        void FX.to(this, cow.img, { y: cow.img.y - 14 }, { duration: 140, yoyo: true })
        await FX.wait(this, TIMING.cowStartle)
        if (gen !== this.gen) return
        this.road.cowPose(cow, 'walk')
        await new Promise<void>(resolve =>
            this.tweens.add({ targets: cow, side: TARGET.run, duration: TIMING.cowWalk, ease: 'Sine.easeIn', onComplete: () => resolve() }),
        )
        if (gen !== this.gen) return
        this.road.remove(cow)
        this.cow = undefined
    }

    private async callTow() {
        const gen = this.gen
        const tow = this.road.spawnTow(TARGET.towFrom)
        this.audio.tow()
        await new Promise<void>(resolve =>
            this.tweens.add({ targets: tow, z: TARGET.towAt, duration: TIMING.towIn, ease: 'Sine.easeOut', onComplete: () => resolve() }),
        )
        if (gen !== this.gen) return
        this.road.towBack(tow)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.stuck = false
        this.audio.tow()
        const cable = towCable(this, this.headOf(tow, TARGET.hookHeight), TARGET.carHook)
        this.go(TIMING.speed * TIMING.pullSpeed)
        await new Promise<void>(resolve =>
            this.tweens.addCounter({ duration: TIMING.towPull, onUpdate: () => (tow.z = TARGET.towAt), onComplete: () => resolve() }),
        )
        cable.destroy()
        if (gen !== this.gen) return
        this.splats.clear()
        this.go()
        await new Promise<void>(resolve =>
            this.tweens.add({ targets: tow, z: TARGET.towGone, duration: TIMING.towAway, ease: 'Sine.easeIn', onComplete: () => resolve() }),
        )
        if (gen !== this.gen) return
        this.road.remove(tow)
    }

    private async chaseDog(dog: Prop) {
        const gen = this.gen
        this.road.dogPose(dog, 'awake')
        this.audio.bark()
        void FX.to(this, dog.img, { y: dog.img.y - 10 }, { duration: 120, yoyo: true })
        await FX.wait(this, TIMING.dogWake)
        if (gen !== this.gen) return
        this.road.dogPose(dog, 'run')
        await new Promise<void>(resolve =>
            this.tweens.add({ targets: dog, side: TARGET.run, duration: TIMING.dogRun, ease: 'Sine.easeIn', onComplete: () => resolve() }),
        )
        if (gen !== this.gen) return
        this.road.remove(dog)
        this.dog = undefined
    }

    private async wakeStreet(street: Street) {
        const houses = [street.cida, ...street.others]
        houses.forEach((house, i) => this.time.delayedCall(i * 110, () => this.road.light(house, true)))
        await FX.wait(this, houses.length * 110 + TIMING.window)
        this.audio.bark()
    }

    private async openDoor(street: Street) {
        const gen = this.gen
        this.road.light(street.cida, true)
        await FX.wait(this, TIMING.window)
        if (gen !== this.gen) return
        this.audio.door()
        this.cida = this.road.showCida(street, 'wave')
        await FX.popIn(this, this.cida, { from: 0.4, duration: TIMING.door })
    }

    private sensorOff(say: boolean) {
        this.sensorTimer?.remove()
        this.sensorTimer = undefined
        if (!this.on.has('limpador')) return
        this.on.delete('limpador')
        this.rain.setSensor(false)
        this.rain.stop(1200)
        this.cockpit.setOn('limpador', false)
        if (!say || this.state !== 'drive') return
        this.caption.say(LABEL.sensorOff, C.white)
        const gen = this.gen
        this.time.delayedCall(2000, () => {
            if (gen === this.gen && this.state === 'drive') this.caption.hide()
        })
    }

    private captionY(p: ProblemDef, id?: DeviceId) {
        return p.kind === 'vizinho' || p.kind === 'ponte' || id === 'altofalante' ? CAPTION.low : CAPTION.y
    }

    private async solved(p: ProblemDef, scored: boolean, demo: boolean) {
        const gen = this.gen
        this.caption.say(p.good, C.yes, this.captionY(p))
        this.audio.good()
        if (scored) {
            this.score += POINTS
            this.hits += 1
            runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        }
        this.done += 1
        this.emitCheckpoint()
        void this.header.celebrate(this.index)
        await FX.wait(this, TIMING.good)
        if (gen !== this.gen) return
        this.caption.hide()
        if (demo) return
        if (this.index + 1 < this.level.problems.length) await this.play(this.index + 1)
        else await this.finale()
    }

    private async wrong(p: ProblemDef, id: DeviceId) {
        const gen = this.gen
        this.state = 'error'
        this.audio.oops()
        this.caption.say(why(p, id), C.oops, this.captionY(p, id))
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    private async explain() {
        if (this.state !== 'ask') return
        const gen = this.gen
        this.state = 'help'
        this.header.setHelpEnabled(false)
        this.cockpit.offer(null)
        await teach(this, guideKey(this.level.level), [
            { text: TUTOR.help, ...spot(this.cockpit.consoleRect()), buttonLabel: TUTOR.ok, balloonY: 300 },
        ])
        if (gen !== this.gen) return
        this.state = 'ask'
        this.cockpit.offer(this.free())
        this.header.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async finale() {
        const gen = this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.header.ask(this.level.goal)
        const cida = this.cida
        if (cida) {
            await delivery(this, { x: 640, y: 600 }, { x: cida.x, y: cida.y - cida.displayHeight * 0.45 })
            if (gen !== this.gen) return
            cida.setFrame(cellKey(CIDA_CELL.box))
        }
        this.caption.say(this.level.village ? LABEL.warned : LABEL.delivered, C.butter, this.level.village ? CAPTION.low : CAPTION.y)
        void FX.confetti(this, { colors: [C.butter, C.hub, C.yes, C.houseC, C.bubble] })
        await FX.wait(this, TIMING.finale)
        if (gen !== this.gen) return
        this.caption.hide()
        this.endLevel()
    }

    private endLevel() {
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()
        this.state = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.accent,
            messageColor: CSS.inkSoft,
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.problems.length, current: this.done },
            ...(!last
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
                              color: C.accent,
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
            progress: Math.min(100, Math.round((this.done / this.level.problems.length) * 100)),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') this.score = command.points ?? this.score
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
