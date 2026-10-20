import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CAR_CELL, CREW_CELL } from '../data/files'
import { CAR_X, DEPTH, H, HAY, LANES, W } from '../data/layout'
import { LEVELS, POINTS, groundAt, guideKey, lapOf, lapPos, nextBox, situationAt, startTire, totalOf, vehicleAt } from '../data/levels'
import { DRIVE, GUST, PIT } from '../data/physics'
import { TIRES, WEATHERS, pathOf, tireFor } from '../data/rules'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { CAPTION, LABEL, WHY } from '../data/words'
import type { Failure, Lane, LevelDef, Situation, State, TireId, Vehicle, Weather } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createCaption, type Caption } from './caption'
import { createCar, type Car } from './car'
import { createCarts, type Carts } from './carts'
import { createControls, type Controls, type Pedal } from './controls'
import { createCrew, type Crew } from './crew'
import { createEffects, type Effects } from './effects'
import { spot, teach } from './guide'
import { createHand, type Hand } from './hand'
import { createHeader, type Header } from './header'
import { createRacers, type Racers } from './racers'
import { createRule, type RuleBoard } from './rule'
import { createSky, type Sky } from './sky'
import { createTrack, type Track } from './track'
import { createView, type View } from './view'

const GAME_ID = 'pit-stop-da-chuva'

const easeIn = (t: number) => t * t
const easeOut = (t: number) => 1 - (1 - t) * (1 - t)
const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private paused = false
    private demoing = false

    private d = 0
    private lastD = 0
    private v = 0
    private lane: Lane = 'front'
    private laneFrom: Lane = 'front'
    private laneK = 1
    private vehicle: Vehicle = 'carro'
    private tire: TireId | null = 'liso'
    private weather: Weather = 'sol'
    private gustMs = 0
    private wrongMs = 0
    private pitCalled = false
    private target: number | null = null
    private relayed = false
    private relayAuto = false
    private seenMud = false
    private auto: { gas: boolean; brake: boolean } | null = null
    private trayReady: (() => void) | null = null

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private sky!: Sky
    private track!: Track
    private crew!: Crew
    private racers!: Racers
    private car!: Car
    private effects!: Effects
    private header!: Header
    private rule!: RuleBoard
    private controls!: Controls
    private carts!: Carts
    private caption!: Caption
    private hand!: Hand
    private banner!: Banner

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
        this.introduce = false
        this.paused = false
        this.demoing = false
        this.d = 0
        this.lastD = 0
        this.v = 0
        this.lane = 'front'
        this.laneFrom = 'front'
        this.laneK = 1
        this.vehicle = this.level.vehicles[0]
        this.tire = startTire(this.level)
        this.weather = this.level.start
        this.gustMs = 0
        this.wrongMs = 0
        this.pitCalled = false
        this.target = null
        this.relayed = false
        this.seenMud = false
        this.auto = null
        this.trayReady = null
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.view = createView(this, W, 1, H / 2)
        this.audio = createAudio()
        this.sky = createSky(this, this.view)
        this.track = createTrack(this, this.view, this.level)
        this.crew = createCrew(this, this.view, this.audio)
        this.racers = createRacers(this, this.view, this.level)
        this.car = createCar(this, this.view, { vehicle: this.vehicle })
        this.effects = createEffects(this, this.view)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.laps,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.rule = createRule(this, this.level.rule)
        this.controls = createControls(this, () => this.callPit(false))
        this.carts = createCarts(this, this.level.carts, this.level.vehicles.includes('moto'), tire => void this.onPick(tire))
        this.caption = createCaption(this)
        this.hand = createHand(this)
        this.banner = createBanner(this)

        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.openLevel()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        ;[this.banner, this.hand, this.caption, this.carts, this.controls, this.rule, this.header, this.effects, this.car, this.racers, this.crew, this.track, this.sky, this.audio, this.view].forEach(m =>
            m?.destroy(),
        )
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o quadro a quadro

    update(time: number, deltaMs: number) {
        if (!this.track) return
        const delta = Math.min(deltaMs, 50)
        const dt = delta / 1000
        if (!this.paused && (this.state === 'race' || this.state === 'demo')) this.drive(dt)
        const racing = this.state === 'race' || this.state === 'pit' || this.state === 'swap' || this.state === 'error' || this.state === 'finish'
        if (!this.paused && (racing || this.state === 'grid')) this.racers.update(this.state === 'grid' ? 0 : dt, this.d, this.weather)
        if (this.laneK < 1) this.laneK = Math.min(1, this.laneK + delta / TIMING.lane)

        const moved = this.d - this.lastD
        this.lastD = this.d
        const speed = dt > 0 ? moved / dt : 0
        this.track.paint(this.d)
        this.crew.update(this.track.screenX, this.track.near)
        this.placeCar()
        this.car.roll(moved)
        if (this.state !== 'error') this.car.jiggle(time, speed > 40 ? 1.6 : 0)

        const s = this.situation()
        const raining = WEATHERS[this.weather].raining
        const wrong = this.tire !== null && this.tire !== tireFor(this.level.rule, s)
        if (this.state === 'race' || this.state === 'demo') this.car.tilt(wrong && raining && speed > 60 ? Math.sin(time * 0.012) * 6 : 0)
        this.sky.update(delta, moved)
        this.effects.update(delta, this.car, speed, {
            wet: raining && s.ground === 'asfalto',
            mud: s.ground === 'lama',
            smoking: wrong && !raining && s.ground === 'asfalto' && this.state !== 'error',
        })
        const total = totalOf(this.level)
        if (this.demoing || this.state === 'intro') this.header.setRace(this.d / total, [], 0)
        else
            this.header.setRace(
                this.d / total,
                this.racers.ds.map(x => x / total),
                this.d >= total ? 1 + this.racers.finishedBefore() : 1 + this.racers.ahead(this.d),
            )
        this.audio.engine(this.state === 'race' || this.state === 'demo' ? Phaser.Math.Clamp(speed / DRIVE.vmax, 0, 1) : 0)
        const near = this.target !== null ? this.target - this.d : Infinity
        this.controls.warnBrake(this.state === 'race' && this.pitCalled && this.lane === 'pit' && near < PIT.warn && near > -PIT.zone && this.v > PIT.parkV)
        this.controls.nudgePit(this.state === 'race' && !this.pitCalled && this.wrongMs > 2500)
        this.view.update(delta, W / 2)
    }

    private placeCar() {
        const from = LANES[this.laneFrom]
        const to = LANES[this.lane]
        const k = easeInOut(this.laneK)
        this.car.place(CAR_X, Phaser.Math.Linear(from.ground, to.ground, k), Phaser.Math.Linear(from.scale, to.scale, k))
        this.car.setDepth(this.lane === 'pit' ? (k > 0.5 ? DEPTH.pit : DEPTH.front) : k > 0.5 ? DEPTH.front : DEPTH.pit)
    }

    private setLane(lane: Lane, now = false) {
        if (lane === this.lane && this.laneK >= 1) return
        this.laneFrom = now ? lane : this.lane
        this.lane = lane
        this.laneK = now ? 1 : 0
    }

    private situation(at = this.d): Situation {
        return situationAt(this.level, at, this.weather, this.vehicle)
    }

    // ───────────────────────────────────────────── pilotar

    private drive(dt: number) {
        const ms = dt * 1000
        const need = tireFor(this.level.rule, this.situation())
        const right = this.tire === need
        this.wrongMs = right ? 0 : this.wrongMs + ms
        let cap = DRIVE.vmax * (right ? 1 : DRIVE.wrong)
        if (this.gustMs > 0) {
            this.gustMs -= ms
            cap *= GUST.factor
        }
        let gas = this.auto ? this.auto.gas : this.controls.gas
        let brake = this.auto ? this.auto.brake : this.controls.brake
        if (this.relayAuto && this.target !== null) {
            const left = this.target - this.d
            brake = left < (this.v * this.v) / (2 * DRIVE.brake * 0.7) + 40
            gas = !brake
        }
        if (brake) this.v = Math.max(0, this.v - DRIVE.brake * dt)
        else if (gas && this.v < cap) this.v = Math.min(cap, this.v + DRIVE.accel * dt)
        else if (!gas) this.v = Math.max(0, this.v - DRIVE.coast * dt)
        if (this.v > cap) this.v = Math.max(cap, this.v - DRIVE.over * dt)

        const prev = this.d
        this.d += this.v * dt

        if (this.pitCalled && this.target !== null && this.lane === 'pit') {
            const off = this.d - this.target
            if (off >= -PIT.zone && off <= PIT.zone && this.v <= PIT.parkV) {
                void this.park(this.gen)
                return
            }
            if (off > PIT.zone) this.missBox()
        }
        if (this.demoing) return

        this.level.events.forEach(e => {
            if (prev < e.at && this.d >= e.at) this.changeWeather(e.weather)
        })
        const was = groundAt(this.level, prev)
        const now = groundAt(this.level, this.d)
        if (was !== now && now === 'lama') {
            this.audio.mud()
            this.effects.mudBurst(this.car.wheel(1))
            if (!this.seenMud) this.caption.say(CAPTION.mud, C.mudLight, TIMING.caption)
            this.seenMud = true
        }
        const lap = Math.floor(this.d / this.level.lap)
        if (lap > Math.floor(prev / this.level.lap) && lap < this.level.laps) this.onLap(lap)
        if (!this.pitCalled && this.relayAhead()) this.callPit(true)
        if (this.lapIndex() === this.level.laps - 1 && lapPos(this.level, this.d) > this.level.lap - 1600) this.crew.beto(CREW_CELL.betoFlag)
        if (this.d >= totalOf(this.level)) void this.finish(this.gen)
    }

    private lapIndex() {
        return lapOf(this.level, this.d)
    }

    private relayAhead() {
        const next = this.level.vehicles[this.lapIndex() + 1]
        const soon = next !== undefined && next !== this.vehicle && lapPos(this.level, this.d) >= this.level.lap - PIT.relayCall
        return soon || vehicleAt(this.level, this.d) !== this.vehicle
    }

    private changeWeather(w: Weather) {
        if (w === this.weather) return
        const was = WEATHERS[this.weather].raining
        this.weather = w
        const raining = WEATHERS[w].raining
        this.gustMs = GUST.ms
        this.racers.gust()
        this.effects.wind()
        this.audio.gust()
        if (raining !== was) this.audio.rain(raining)
        void this.sky.change(w)
        void this.track.setWet(raining, TIMING.weather)
    }

    private setWeather(w: Weather) {
        this.weather = w
        this.sky.set(w)
        const raining = WEATHERS[w].raining
        void this.track.setWet(raining, 0)
        this.audio.rain(raining)
    }

    private onLap(lap: number) {
        this.header.setPhase(lap)
        void this.header.celebrate(lap - 1).then(() => this.header.setPhase(lap))
        this.audio.cheer()
        this.crew.beto(CREW_CELL.betoTalk)
        this.time.delayedCall(1400, () => this.state === 'race' && this.crew.beto(CREW_CELL.beto))
        if (lap === this.level.laps - 1) this.caption.say(CAPTION.lastLap, C.butter, TIMING.caption)
    }

    // ───────────────────────────────────────────── o box

    private callPit(relay: boolean, scripted = false) {
        if (this.state !== 'race' && !(this.state === 'demo' && scripted)) return
        if (this.pitCalled) {
            if (this.relayAhead()) return
            this.pitCalled = false
            this.target = null
            this.track.mark(null)
            this.setLane('front')
            this.controls.setPit('off')
            return
        }
        this.pitCalled = true
        this.target = nextBox(this.level, this.d, PIT.minAhead)
        this.crew.call(this.target)
        this.track.mark(this.target)
        this.setLane('pit')
        this.controls.setPit(relay ? 'relay' : 'on')
        this.audio.pop()
        if (relay) {
            this.relayAuto = true
            this.controls.setEnabled(false)
            this.caption.say(CAPTION.relay, C.butter, TIMING.caption)
        }
    }

    private missBox() {
        this.target = nextBox(this.level, this.d, PIT.minAhead)
        this.crew.call(this.target)
        this.track.mark(this.target)
        this.caption.say(CAPTION.missed, C.oops, TIMING.caption)
        this.audio.whoosh()
    }

    private glide(to: number, ms: number, ease: (t: number) => number) {
        const from = this.d
        const k = { t: 0 }
        return new Promise<void>(resolve => {
            this.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(this, ms),
                onUpdate: () => {
                    this.d = from + (to - from) * ease(k.t)
                },
                onComplete: () => resolve(),
            })
        })
    }

    private async park(gen: number) {
        if (this.target === null) return
        this.state = 'pit'
        this.controls.setEnabled(false)
        this.auto = this.demoing ? { gas: false, brake: false } : null
        this.audio.brake()
        const at = this.target
        this.track.mark(null)
        await this.glide(at, TIMING.park, easeOut)
        this.v = 0
        if (gen !== this.gen) return
        this.controls.visible(false)
        this.car.pose(CAR_CELL.idle)
        await this.crew.toWheels(this.car, this.d)
        if (gen !== this.gen) return
        this.relayed = vehicleAt(this.level, this.d) !== this.vehicle
        if (this.relayed) {
            await this.relay()
            if (gen !== this.gen) return
        }
        await this.carts.open()
        if (gen !== this.gen) return
        if (!this.demoing) {
            this.carts.setEnabled(true)
            this.header.setHelpEnabled(true)
        }
        const ready = this.trayReady
        this.trayReady = null
        ready?.()
    }

    /** O revezamento: o veículo velho entra na tenda e o novo sai sem pneus. */
    private async relay() {
        this.audio.whoosh()
        await this.car.fade(0, TIMING.relay / 2)
        this.vehicle = vehicleAt(this.level, this.d)
        this.car.setVehicle(this.vehicle)
        this.tire = null
        this.car.setTire(null)
        this.car.pose(CAR_CELL.idle)
        await this.car.fade(1, TIMING.relay / 2)
    }

    private async onPick(tire: TireId) {
        if (this.state !== 'pit') return
        const gen = this.gen
        this.state = 'swap'
        this.header.setHelpEnabled(false)
        this.carts.setEnabled(false)
        this.audio.press()
        const s = this.situation()
        const need = tireFor(this.level.rule, s)
        const before = this.tire
        this.rule.light(pathOf(this.rule.rows, tire))
        this.audio.branch()
        void this.carts.close()
        if (TIRES[tire].vehicle !== this.vehicle) {
            await this.crew.work()
            if (gen !== this.gen) return
            await this.car.bounceOff(tire)
            if (gen !== this.gen) return
            await this.crash(gen, 'naoServe', need, s)
            return
        }
        await this.crew.work()
        if (gen !== this.gen) return
        this.audio.pop()
        await this.car.swapTires(tire)
        if (gen !== this.gen) return
        this.tire = tire
        if (tire !== need) {
            await this.crash(gen, this.failureOf(need), need, s)
            return
        }
        const needed = this.relayed || before !== need
        if (!this.demoing && needed) {
            this.score += POINTS
            this.hits += 1
            this.done += 1
            runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
            this.emitCheckpoint()
            this.audio.good()
            void FX.sparks(this, CAR_X, LANES.pit.ground - 120, { color: C.yellow, count: 16, spread: 120, depth: DEPTH.fx })
        } else if (!needed) this.caption.say(CAPTION.already, C.mint, TIMING.caption)
        this.relayed = false
        this.relayAuto = false
        await this.crew.back()
        if (gen !== this.gen) return
        this.pitCalled = false
        this.target = null
        this.controls.setPit('off')
        this.setLane('front')
        this.wrongMs = 0
        this.time.delayedCall(900, () => gen === this.gen && this.rule.light(null))
        this.state = this.demoing ? 'demo' : 'race'
        this.controls.visible(true)
        this.controls.setEnabled(true)
    }

    // ───────────────────────────────────────────── erro

    private failureOf(need: TireId): Failure {
        if (need === 'cravos') return 'atola'
        if (need === 'chuva' || need === 'motoChuva') return 'aquaplana'
        return 'esquenta'
    }

    private whyOf(failure: Failure, s: Situation) {
        const raining = WEATHERS[s.weather].raining
        if (failure === 'naoServe') return this.vehicle === 'moto' ? WHY.moto : WHY.carro
        if (failure === 'atola') return raining ? WHY.mudFirst : WHY.mud
        if (failure === 'aquaplana') return WHY.rain
        if (this.level.mud.length) return WHY.dryNoMud
        return s.weather === 'nublado' ? WHY.cloudy : WHY.dry
    }

    private async crash(gen: number, failure: Failure, need: TireId, s: Situation) {
        this.state = 'error'
        this.controls.visible(false)
        this.header.setHelpEnabled(false)
        this.car.pose(CAR_CELL.worried)
        if (failure !== 'naoServe') {
            this.setLane('front')
            this.car.pose(CAR_CELL.race)
            this.audio.vroom()
        }
        if (failure === 'aquaplana') {
            const hayAt = this.d + 300 + HAY.ahead
            this.track.hay(hayAt)
            await this.glide(this.d + 300, TIMING.crashDrive, easeIn)
            if (gen !== this.gen) return
            this.audio.skid()
            this.car.pose(CAR_CELL.worried)
            void this.glide(hayAt - 70, TIMING.spin, easeOut)
            await this.car.spin(0, HAY.y - 10 - LANES.front.ground, TIMING.spin)
            if (gen !== this.gen) return
            this.audio.thump()
            FX.shakeCam(this, 'leve')
            this.car.pose(CAR_CELL.dizzy)
            this.effects.dizzy(true)
        } else if (failure === 'esquenta') {
            await this.glide(this.d + 260, TIMING.crashDrive, easeIn)
            if (gen !== this.gen) return
            this.audio.sizzle()
            this.car.pose(CAR_CELL.worried)
            void this.glide(this.d + 200, TIMING.melt, easeOut)
            for (let i = 0; i < 6; i++) {
                ;[0, 1].forEach(k => this.effects.smoke(this.car.wheel(k as 0 | 1), true))
                await FX.wait(this, TIMING.melt / 8)
                if (gen !== this.gen) return
            }
            await this.car.melt()
            if (gen !== this.gen) return
        } else if (failure === 'atola') {
            void this.glide(this.d + 90, TIMING.stuck, easeOut)
            for (let i = 0; i < 8; i++) {
                this.car.roll(60)
                this.effects.mudBurst(this.car.wheel(0))
                if (i % 3 === 0) this.audio.mud()
                await FX.wait(this, TIMING.stuck / 8)
                if (gen !== this.gen) return
            }
            this.car.pose(CAR_CELL.worried)
            await this.car.sink(14)
            if (gen !== this.gen) return
        }
        void this.rule.shake(pathOf(this.rule.rows, need))
        this.banner.say(this.whyOf(failure, s))
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.controls.visible(false)
        this.audio.rain(false)
        this.audio.engine(0)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── nível

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.controls.setEnabled(false)
        this.header.setHelpEnabled(false)
        this.header.setPhase(0)
        this.racers.setActive(false)
        this.resetPlayer(0)
        if (this.introduce) {
            if (this.level.level === 1) await this.demo(gen)
            else await this.introRule(gen)
            if (gen !== this.gen) return
        }
        await this.grid(gen)
    }

    private resetPlayer(d: number) {
        this.d = d
        this.lastD = d
        this.v = 0
        this.auto = null
        this.pitCalled = false
        this.relayAuto = false
        this.target = null
        this.track.mark(null)
        this.crew.call(null)
        this.crew.beto(CREW_CELL.beto)
        this.vehicle = this.level.vehicles[0]
        this.car.setVehicle(this.vehicle)
        this.tire = startTire(this.level)
        this.car.setTire(this.tire)
        this.car.reset()
        this.car.pose(CAR_CELL.idle)
        this.setLane('front', true)
        this.setWeather(this.level.start)
        this.controls.setPit('off')
        this.rule.light(null)
        this.track.paint(d)
    }

    private async grid(gen: number) {
        this.state = 'grid'
        this.resetPlayer(0)
        this.racers.grid()
        this.racers.setActive(true)
        this.header.visible(true)
        this.rule.visible(true)
        this.controls.visible(true)
        this.controls.setEnabled(false)
        await FX.wait(this, TIMING.beat)
        for (const n of ['3', '2', '1']) {
            if (gen !== this.gen) return
            this.caption.say(n, C.white, TIMING.count * 0.8, 72)
            this.audio.beep(false)
            await FX.wait(this, TIMING.count)
        }
        if (gen !== this.gen) return
        this.caption.say(CAPTION.go, C.yes, TIMING.caption, 72)
        this.audio.beep(true)
        this.car.pose(CAR_CELL.race)
        this.state = 'race'
        this.controls.setEnabled(true)
        this.header.setHelpEnabled(true)
    }

    // ───────────────────────────────────────────── demonstração (N1) e apresentação (N2, N3)

    private async showRule(gen: number, groups: { ids: number[]; caption: string }[]) {
        this.header.visible(true)
        this.controls.visible(false)
        this.audio.pop()
        await this.rule.big()
        for (const group of groups) {
            if (gen !== this.gen) return
            this.caption.say(group.caption, C.butter)
            for (const id of group.ids) {
                await this.rule.flash(id)
                await FX.wait(this, 320)
                if (gen !== this.gen) return
            }
            await FX.wait(this, 500)
        }
        this.caption.hide()
        this.rule.light(null)
        await this.rule.dock()
    }

    private async introRule(gen: number) {
        const rows = this.rule.rows
        const groups =
            this.level.level === 2
                ? [{ ids: rows.map(r => r.id), caption: CAPTION.topDown }]
                : [
                      { ids: rows.filter(r => r.indent === 0).map(r => r.id), caption: CAPTION.which },
                      { ids: rows.filter(r => r.indent > 0).map(r => r.id), caption: CAPTION.thenSky },
                  ]
        await this.showRule(gen, groups)
    }

    private pedal(which: Pedal) {
        const r = this.controls.rect(which)
        return { x: r.x, y: r.y - 6 }
    }

    private async holdPedal(which: 'gas' | 'brake' | null) {
        this.controls.show('gas', which === 'gas')
        this.controls.show('brake', which === 'brake')
        this.auto = { gas: which === 'gas', brake: which === 'brake' }
        if (which) await this.hand.press(this.pedal(which), true)
    }

    private until(test: () => boolean, gen: number) {
        return new Promise<void>(resolve => {
            const ev = this.time.addEvent({
                delay: 50,
                loop: true,
                callback: () => {
                    if (gen !== this.gen || test()) {
                        ev.remove()
                        resolve()
                    }
                },
            })
        })
    }

    private async demo(gen: number) {
        await this.showRule(gen, [{ ids: this.rule.rows.map(r => r.id), caption: CAPTION.rule }])
        if (gen !== this.gen) return
        this.demoing = true
        this.resetPlayer(this.level.boxes[1] - 1700)
        this.controls.visible(true)
        this.controls.setEnabled(true)
        this.state = 'demo'

        this.caption.say(CAPTION.gas, C.gas)
        await this.holdPedal('gas')
        await FX.wait(this, 1700)
        if (gen !== this.gen) return
        this.caption.say(CAPTION.brake, C.brake)
        await this.holdPedal('brake')
        await FX.wait(this, 600)
        if (gen !== this.gen) return
        await this.holdPedal('gas')
        await FX.wait(this, 500)
        if (gen !== this.gen) return

        this.changeWeather('chuva')
        this.caption.say(CAPTION.rained, C.drop)
        void this.view.lean(true, { x: CAR_X + 80, y: 560 })
        await FX.wait(this, 2000)
        if (gen !== this.gen) return
        await this.view.lean(false, { x: W / 2, y: 0 })

        this.caption.say(CAPTION.box, C.pit)
        await this.hand.press(this.pedal('pit'))
        this.callPit(false, true)
        await this.holdPedal('gas')
        await this.until(() => this.target !== null && this.target - this.d < PIT.zone - 30, gen)
        if (gen !== this.gen) return
        this.caption.say(CAPTION.stop, C.brake)
        const tray = new Promise<void>(resolve => (this.trayReady = resolve))
        await this.holdPedal('brake')
        await tray
        if (gen !== this.gen) return
        this.controls.show('brake', false)
        this.hand.hide()

        const need = tireFor(this.level.rule, this.situation())
        this.caption.say(CAPTION.rainRain, C.drop)
        for (const id of pathOf(this.rule.rows, need)) await this.rule.flash(id)
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        const r = this.carts.rect(need)
        await this.hand.press({ x: r.x, y: r.y })
        void this.carts.press(need)
        await this.onPick(need)
        if (gen !== this.gen) return
        this.hand.hide()
        this.caption.say(CAPTION.yourTurn, C.yes, TIMING.caption)
        await FX.wait(this, 1200)
        this.demoing = false
        this.state = 'intro'
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.state !== 'race' && this.state !== 'pit') return
        const gen = this.gen
        const inPit = this.state === 'pit'
        this.paused = true
        this.controls.release()
        this.header.setHelpEnabled(false)
        if (inPit) this.carts.setEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: this.level.help, ...spot(this.rule.rect()), balloonY: 440, buttonLabel: 'Continuar' },
        ])
        if (gen !== this.gen) return
        this.paused = false
        this.header.setHelpEnabled(true)
        if (inPit && this.state === 'pit') this.carts.setEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async finish(gen: number) {
        this.state = 'finish'
        this.controls.setEnabled(false)
        this.controls.visible(false)
        this.track.mark(null)
        this.setLane('front')
        const place = 1 + this.racers.finishedBefore()
        this.crew.beto(CREW_CELL.betoFlag)
        this.car.pose(CAR_CELL.cheer)
        this.audio.cheer()
        this.audio.engine(0)
        void this.header.celebrate(this.level.laps - 1)
        this.caption.say(LABEL.placeLong(place), place === 1 ? C.yellow : C.white)
        if (place === 1) void FX.confetti(this, { colors: [C.yellow, C.team, C.lilac, C.coral, C.pink] })
        const coast = Math.min(900, (this.v * this.v) / (2 * DRIVE.coast * 2) + 200)
        await this.glide(this.d + coast, TIMING.finale, easeOut)
        if (gen !== this.gen) return
        this.v = 0
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        this.endLevel(place)
    }

    private endLevel(place: number) {
        this.gen++
        this.audio.rain(false)
        this.audio.win()
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
            subtitle: `${LABEL.placeLong(place)} · ${this.level.title}`,
            message: this.level.message,
            stars: Math.max(1, 4 - place),
            progress: { total: LEVELS.length, current: this.level.level },
            ...(!last
                ? {
                      autoAdvance: {
                          delay: 3200,
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
            progress: Math.min(100, Math.round((this.d / totalOf(this.level)) * 100)),
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
        if (!muted) this.audio.rain(WEATHERS[this.weather].raining)
    }
}
