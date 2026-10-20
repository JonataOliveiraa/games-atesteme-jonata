import Phaser from 'phaser'
import { CAR_X, DEPTH, W, laneOf } from '../data/layout'
import { groundAt, needOf, nextBox, totalOf, vehicleAt } from '../data/levels'
import { DRIVE, GUST, RIVALS, RIVAL_AI } from '../data/physics'
import { TIMING } from '../data/timing'
import type { Lane, LevelDef, TireId, Vehicle, Weather } from '../types'
import { createCar, type Car } from './car'
import type { View } from './view'

/**
 * Os dois rivais. A equipe deles segue a MESMA regra: quando o pneu deixa de
 * servir, eles demoram para perceber (e às vezes nem trocam), param na próxima
 * tenda e voltam com o pneu certo. Na pista estreita eles também trocam para a
 * moto, e isso eles nunca esquecem. A corrida deles não para enquanto a Kika está no box.
 */
export interface Racers {
    update(dt: number, playerD: number, weather: Weather): void
    gust(): void
    grid(): void
    setActive(on: boolean): void
    readonly ds: number[]
    finishedBefore(): number
    ahead(playerD: number): number
    destroy(): void
}

interface Rival {
    car: Car
    factor: number
    spot: number
    d: number
    v: number
    tire: TireId
    vehicle: Vehicle
    state: 'race' | 'toPit' | 'pit'
    wrongMs: number
    need: TireId
    reactMs: number
    ignoring: boolean
    pitMs: number
    box: number
    lane: Lane
    laneK: number
    finished: boolean
}

export function createRacers(scene: Phaser.Scene, view: View, level: LevelDef): Racers {
    const total = totalOf(level)
    let active = false
    let gustMs = 0
    let finishCount = 0
    let playerFinish = Infinity

    const rivals: Rival[] = RIVALS.map(def => ({
        car: createCar(scene, view, { vehicle: vehicleAt(level, def.start), cell: def.cell }),
        factor: def.factor * (level.rivalPace ?? 1),
        spot: def.spot,
        d: def.start,
        v: 0,
        tire: 'liso',
        vehicle: vehicleAt(level, def.start),
        state: 'race',
        wrongMs: 0,
        need: 'liso',
        reactMs: 0,
        ignoring: false,
        pitMs: 0,
        box: 0,
        lane: 'back',
        laneK: 1,
        finished: false,
    }))

    const needFor = (r: Rival, weather: Weather) => needOf(level, { weather, ground: groundAt(level, r.d), narrow: r.vehicle === 'moto' }, r.vehicle)

    const laneY = (r: Rival) => {
        const moto = r.vehicle === 'moto'
        const from = laneOf(r.lane === 'pit' ? 'back' : 'pit', moto)
        const to = laneOf(r.lane, moto)
        return {
            ground: Phaser.Math.Linear(from.ground, to.ground, r.laneK),
            scale: Phaser.Math.Linear(from.scale, to.scale, r.laneK),
        }
    }

    const notice = (r: Rival, need: TireId) => {
        r.need = need
        r.wrongMs = 0
        r.reactMs = Phaser.Math.Between(RIVAL_AI.reactMin, RIVAL_AI.reactMax)
        r.ignoring = need !== r.tire && Math.random() < RIVAL_AI.ignore
    }

    const setLane = (r: Rival, lane: Lane) => {
        if (r.lane === lane) return
        r.lane = lane
        r.laneK = 0
    }

    const racers: Racers = {
        get ds() {
            return rivals.map(r => r.d)
        },
        grid() {
            finishCount = 0
            playerFinish = Infinity
            rivals.forEach((r, i) => {
                r.d = RIVALS[i].start
                r.v = 0
                r.vehicle = vehicleAt(level, r.d)
                r.car.setVehicle(r.vehicle)
                r.tire = needFor(r, level.start)
                r.car.setTire(r.tire)
                r.state = 'race'
                notice(r, r.tire)
                r.lane = 'back'
                r.laneK = 1
                r.finished = false
                r.car.reset()
            })
        },
        setActive(on) {
            active = on
            rivals.forEach(r => r.car.setVisible(on))
        },
        gust() {
            gustMs = GUST.ms
        },
        update(dt, playerD, weather) {
            const ms = dt * 1000
            if (gustMs > 0) gustMs -= ms
            rivals.forEach(r => {
                if (!active) return
                const due = vehicleAt(level, r.d)
                const need = needFor(r, weather)
                const relay = due !== r.vehicle && !r.finished
                if (r.state === 'race' && !r.finished) {
                    if (need !== r.need) notice(r, need)
                    if (need !== r.tire) r.wrongMs += ms
                    if (relay || (need !== r.tire && !r.ignoring && r.wrongMs > r.reactMs)) {
                        r.box = nextBox(level, r.d - r.spot, RIVAL_AI.minAhead) + r.spot
                        r.state = 'toPit'
                        setLane(r, 'pit')
                    }
                }
                if (r.state === 'pit') {
                    r.v = 0
                    r.pitMs -= ms
                    if (r.pitMs <= 0) {
                        r.vehicle = vehicleAt(level, r.d)
                        r.car.setVehicle(r.vehicle)
                        r.tire = needFor(r, weather)
                        r.car.setTire(r.tire)
                        r.state = 'race'
                        notice(r, r.tire)
                        setLane(r, 'back')
                    }
                } else {
                    let cap = DRIVE.vmax * r.factor * (r.tire === need ? 1 : DRIVE.wrong)
                    if (gustMs > 0) cap *= GUST.factor
                    if (r.state === 'toPit') {
                        const left = r.box - r.d
                        const stop = (r.v * r.v) / (2 * DRIVE.brake * 0.6)
                        if (left <= 4) {
                            r.d = r.box
                            r.v = 0
                            r.state = 'pit'
                            r.pitMs = relay ? RIVAL_AI.relay : RIVAL_AI.pit
                        } else if (left <= stop + 10) r.v = Math.max(60, r.v - DRIVE.brake * 0.6 * dt)
                        else r.v = Math.min(cap, r.v + DRIVE.accel * dt)
                    } else if (r.v > cap) r.v = Math.max(cap, r.v - DRIVE.over * dt)
                    else r.v = Math.min(cap, r.v + DRIVE.accel * dt)
                    if (r.state === 'toPit') r.d = Math.min(r.box, r.d + r.v * dt)
                    else r.d += r.v * dt
                }
                if (!r.finished && r.d >= total) {
                    r.finished = true
                    if (playerD < total) finishCount++
                }
                if (r.laneK < 1) r.laneK = Math.min(1, r.laneK + ms / TIMING.lane)
                const x = CAR_X + (r.d - playerD)
                const lane = laneY(r)
                r.car.place(x, lane.ground, lane.scale)
                r.car.setDepth(r.lane === 'pit' && r.laneK > 0.5 ? DEPTH.pit : DEPTH.back)
                r.car.roll(r.v * dt)
                r.car.setVisible(active && x > -300 && x < W + 300)
            })
            if (playerD >= total && playerFinish === Infinity) playerFinish = finishCount
        },
        finishedBefore() {
            return playerFinish === Infinity ? finishCount : playerFinish
        },
        ahead(playerD) {
            return rivals.filter(r => r.d > playerD).length
        },
        destroy() {
            rivals.forEach(r => r.car.destroy())
        },
    }
    return racers
}
