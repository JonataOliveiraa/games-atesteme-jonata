import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, GAUGE, H, W } from '../data/layout'
import { C } from '../data/theme'
import type { Power, Vec } from '../types'
import { SPARK, baked } from './art'
import { starShape } from './icons'

export interface ChargeOptions {
    onTick?(t: number): void
    demoTap?(at: Vec): Promise<void>
}

export interface Gauge {
    charge(opts?: ChargeOptions): Promise<Power>
    cancel(): void
    destroy(): void
}

const ARC = 'bm-gauge-arc'
const NEEDLE = 'bm-gauge-needle'
const PAD = 22

export const powerOf = (t: number): Power => (t >= GAUGE.max ? 'max' : t >= GAUGE.weak ? 'good' : 'weak')

const angleOf = (t: number) => Math.PI + t * Math.PI

export function createGauge(scene: Phaser.Scene): Gauge {
    const r = GAUGE.r
    const cx = r + PAD
    const cy = r + PAD
    baked(scene, ARC, cx * 2, cy + PAD + 14, g => {
        const band = (from: number, to: number, width: number, color: number, alpha = 1) => {
            g.lineStyle(width, color, alpha)
            g.beginPath()
            g.arc(cx, cy, r, angleOf(from), angleOf(to), false)
            g.strokePath()
        }
        g.fillStyle(C.shadow, 0.18)
        g.fillCircle(cx, cy + 6, 22)
        band(-0.03, 1.03, GAUGE.band + 14, C.headerLine)
        band(0, 1, GAUGE.band + 6, C.gaugeBack)
        band(0, GAUGE.weak, GAUGE.band, C.weak)
        band(GAUGE.weak, GAUGE.max, GAUGE.band, C.good)
        band(GAUGE.max, 1, GAUGE.band, C.max)
        const mid = angleOf((GAUGE.max + 1) / 2)
        starShape(g, cx + Math.cos(mid) * r, cy + Math.sin(mid) * r, 14, C.white, 2)
        g.fillStyle(C.headerLine, 1)
        g.fillCircle(cx, cy, 18)
        g.fillStyle(C.accentYellow, 1)
        g.fillCircle(cx, cy, 11)
    })
    baked(scene, NEEDLE, r + 8, 20, g => {
        g.fillStyle(C.headerLine, 1)
        g.fillTriangle(0, 1, r + 6, 10, 0, 19)
        g.fillStyle(C.white, 1)
        g.fillTriangle(4, 6, r - 6, 10, 4, 14)
    })
    const arc = scene.add.image(0, 0, ARC).setOrigin(cx / (cx * 2), cy / (cy + PAD + 14))
    const needle = scene.add.image(0, 0, NEEDLE).setOrigin(0, 0.5)
    const box = scene.add.container(GAUGE.x, GAUGE.y, [arc, needle]).setDepth(DEPTH.bench + 6).setVisible(false)
    const zone = scene.add.zone(W / 2, H / 2, W, H).setDepth(DEPTH.bench + 5).setInteractive()
    if (zone.input) zone.input.enabled = false

    let t = 0
    let dir = 1
    let laps = 0
    let held = false
    let done: ((p: Power) => void) | undefined
    let opts: ChargeOptions = {}
    let timer: Phaser.Time.TimerEvent | undefined
    let demoStarted = false

    const step = (_time: number, delta: number) => {
        if (!done || held) return
        const before = t
        t += (delta / FX.ms(scene, GAUGE.sweep)) * dir
        if (t >= 1) {
            t = 1
            dir = -1
        } else if (t <= 0) {
            t = 0
            dir = 1
            laps += 1
        }
        needle.setRotation(angleOf(t))
        opts.onTick?.(t)
        if (opts.demoTap && !demoStarted && laps >= 1 && dir > 0 && before < 0.5 && t >= 0.5) {
            demoStarted = true
            const at = { x: box.x, y: box.y - r * 0.55 }
            void opts.demoTap(at).then(() => finish())
        }
        if (opts.demoTap && demoStarted && dir > 0 && t >= 0.93) held = true
    }

    const cleanup = () => {
        scene.events.off('update', step)
        timer?.remove()
        timer = undefined
        if (zone.input) zone.input.enabled = false
        scene.input.keyboard?.off('keydown-SPACE', finish)
    }

    function finish() {
        const resolve = done
        if (!resolve) return
        done = undefined
        cleanup()
        const power = powerOf(t)
        const tip = { x: box.x + Math.cos(angleOf(t)) * r, y: box.y + Math.sin(angleOf(t)) * r }
        if (power === 'max') void FX.sparks(scene, tip.x, tip.y, { color: C.max, count: 16, spread: 90, size: 10, depth: DEPTH.bench + 7 })
        else {
            const s = scene.add.image(tip.x, tip.y, SPARK).setDepth(DEPTH.bench + 7)
            void FX.to(scene, s, { scale: 2.2, alpha: 0 }, { duration: 300 }).then(() => s.destroy())
        }
        void FX.to(scene, needle, { scale: 1.15 }, { duration: 110, yoyo: true }).then(() => needle.setScale(1))
        void FX.wait(scene, 220)
            .then(() => FX.to(scene, box, { alpha: 0, scale: 0.8 }, { duration: 200 }))
            .then(() => box.setVisible(false))
        resolve(power)
    }

    zone.on('pointerdown', () => {
        if (!opts.demoTap) finish()
    })

    return {
        charge(o = {}) {
            cleanup()
            opts = o
            t = 0
            dir = 1
            laps = 0
            held = false
            demoStarted = false
            needle.setRotation(angleOf(0)).setScale(1)
            scene.tweens.killTweensOf(box)
            box.setVisible(true).setAlpha(1).setScale(1)
            void FX.popIn(scene, box, { from: 0.5, duration: 260 })
            return new Promise<Power>(resolve => {
                done = resolve
                scene.events.on('update', step)
                if (!o.demoTap) {
                    if (zone.input) zone.input.enabled = true
                    scene.input.keyboard?.on('keydown-SPACE', finish)
                    timer = scene.time.delayedCall(FX.ms(scene, GAUGE.auto), () => {
                        t = (GAUGE.weak + GAUGE.max) / 2
                        finish()
                    })
                }
            })
        },
        cancel() {
            const resolve = done
            done = undefined
            cleanup()
            box.setVisible(false)
            resolve?.('good')
        },
        destroy() {
            this.cancel()
            scene.tweens.killTweensOf([box, needle])
            zone.destroy()
            box.destroy()
        },
    }
}
