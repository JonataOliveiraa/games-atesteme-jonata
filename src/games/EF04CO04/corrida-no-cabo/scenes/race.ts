import Phaser from 'phaser'
import { CAR, DRIVE, GATE, PLAY } from '../data/layout'
import type { Bit, Lane } from '../types'
import type { Car } from './car'
import type { Tube } from './tube'

export interface RaceEvents {
    /** o número escolhido para o portal i (cinza no visor) */
    pending(i: number, bit: Bit): void
    /** o carrinho passou pela porta: o número vale */
    pass(i: number, bit: Bit): void
    waiting(on: boolean): void
    /** o carrinho chegou ao conector do outro computador */
    arrived(): void
}

export interface Race {
    readonly sent: string
    readonly gate: number
    readonly isWaiting: boolean
    readonly speed: number
    readonly running: boolean
    paused: boolean
    start(): void
    press(bit: Bit): boolean
    update(dt: number): void
    stop(): void
}

const OFFSET: Record<Lane, number> = { '1': PLAY.lane, mid: 0, '0': -PLAY.lane }

/**
 * A régua é o comprimento do fio (s). Antes de cada portal o carrinho espera uma escolha; até a
 * trava dá para trocar; a porta escreve o número; depois dele o carrinho volta para o meio.
 */
export function createRace(tube: Tube, car: Car, opts: { bits: number; cruise: number }, ev: RaceEvents): Race {
    let running = false
    let s = 0
    let off = 0
    let speed = 0
    let g = 0
    let lane: Lane = 'mid'
    let pending: Bit | null = null
    let locked: Bit | null = null
    let queued: Bit | null = null
    let passed = false
    let waited = false
    let reached = false
    let waiting = false
    let flow = 0
    let sent = ''

    const setWaiting = (on: boolean) => {
        if (on === waiting) return
        waiting = on
        car.setBrake(on)
        ev.waiting(on)
    }

    const setFlow = (n: number) => {
        flow = n
        car.setFlow(n)
    }

    return {
        get sent() {
            return sent
        },
        get gate() {
            return g
        },
        get isWaiting() {
            return waiting
        },
        get speed() {
            return speed
        },
        get running() {
            return running
        },
        paused: false,
        start() {
            running = true
            s = tube.startS
            off = 0
            speed = 0
            g = 0
            lane = 'mid'
            pending = null
            locked = null
            queued = null
            passed = false
            waited = false
            reached = false
            waiting = false
            sent = ''
            setFlow(0)
        },
        press(bit) {
            if (!running || g >= opts.bits) return false
            if (!locked) {
                pending = bit
                lane = bit
                ev.pending(g, bit)
                return true
            }
            if (g + 1 >= opts.bits) return false
            queued = bit
            ev.pending(g + 1, bit)
            return true
        },
        update(dt) {
            if (!running || this.paused) return
            const front = s + CAR.front
            let cap = Infinity

            if (g < opts.bits) {
                const gs = tube.gates[g]
                const reach = gs - GATE.reach
                if (!locked) {
                    if (!pending) {
                        const room = reach - front
                        cap = room > 0.5 ? Math.sqrt(2 * DRIVE.brake * room) : 0
                        if (cap === 0) {
                            speed = 0
                            s = reach - CAR.front
                            waited = true
                            if (flow) setFlow(0)
                            setWaiting(true)
                        }
                    } else {
                        setWaiting(false)
                        if (!reached && front >= reach) {
                            reached = true
                            setFlow(waited ? 0 : Math.min(DRIVE.flowMax, flow + 1))
                        }
                        if (front >= gs - GATE.lock) locked = pending
                    }
                }
                if (locked && !passed && front >= gs) {
                    passed = true
                    sent += locked
                    ev.pass(g, locked)
                }
                if (passed && s - CAR.back >= gs + GATE.clear) {
                    g += 1
                    locked = null
                    passed = false
                    waited = false
                    reached = false
                    pending = queued
                    queued = null
                    lane = pending ?? 'mid'
                }
            } else {
                lane = 'mid'
                if (front >= tube.dockS) {
                    running = false
                    setFlow(0)
                    ev.arrived()
                    return
                }
            }

            const target = Math.min(opts.cruise + flow * DRIVE.flowStep, cap)
            if (speed < target) speed = Math.min(target, speed + DRIVE.accel * dt)
            else speed = cap < speed ? cap : Math.max(target, speed - DRIVE.brake * dt)
            if (!waiting) s += speed * dt

            const step = (OFFSET[lane] - off) * Math.min(1, DRIVE.laneRate * dt)
            off += step
            const pose = tube.pose(s)
            const p = tube.lanePoint(s, off)
            car.place(p.x, p.y, pose.angle - Phaser.Math.Clamp(step * 0.05, -0.25, 0.25))
            tube.follow(p.x)
        },
        stop() {
            running = false
            setWaiting(false)
            setFlow(0)
        },
    }
}
