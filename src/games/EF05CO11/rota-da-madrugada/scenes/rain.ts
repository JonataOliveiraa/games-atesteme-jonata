import Phaser from 'phaser'
import { WIPER_KEY } from '../data/files'
import { DEPTH, GLASS, W, WIPER } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import { DROP_KEY } from './art'

export interface Rain {
    start(ms: number): void
    stop(ms: number): void
    raining(): boolean
    blur(): number
    sweep(): Promise<void>
    setSensor(on: boolean): void
    update(dt: number): void
    destroy(): void
}

interface Streak {
    x: number
    y: number
    len: number
    speed: number
}

const STREAKS = 70
const MAX_DROPS = 46

export function createRain(scene: Phaser.Scene): Rain {
    const lines = scene.add.graphics().setDepth(DEPTH.rain)
    const fog = scene.add
        .rectangle(0, GLASS.top, W, GLASS.bottom - GLASS.top, C.fog, 1)
        .setOrigin(0)
        .setDepth(DEPTH.fog)
        .setAlpha(0)
    const wipers = WIPER.pivots.map(p => {
        const img = scene.add.image(p.x, p.y, WIPER_KEY).setOrigin(WIPER.originX, 0.5).setDepth(DEPTH.wiper)
        img.setScale(WIPER.length / img.width).setRotation(WIPER.rest)
        return img
    })
    const level = { v: 0 }
    const streaks: Streak[] = Array.from({ length: STREAKS }, () => ({
        x: Math.random() * W,
        y: GLASS.top + Math.random() * (GLASS.bottom - GLASS.top),
        len: 18 + Math.random() * 22,
        speed: 900 + Math.random() * 500,
    }))
    const drops: Phaser.GameObjects.Image[] = []
    let dropDebt = 0
    let sensor = false
    let sinceSweep = 0
    let sweeping = false
    let stopping = false

    const clearGlass = () => {
        drops.splice(0).forEach((d, i) => {
            scene.tweens.add({
                targets: d,
                alpha: 0,
                y: d.y - 30,
                duration: 160,
                delay: (d.x / W) * 180 + i,
                onComplete: () => d.destroy(),
            })
        })
        scene.tweens.killTweensOf(fog)
        scene.tweens.add({ targets: fog, alpha: 0.04 * level.v, duration: 220 })
    }

    const sweep = () =>
        new Promise<void>(resolve => {
            if (sweeping) {
                resolve()
                return
            }
            sweeping = true
            sinceSweep = 0
            let cleared = false
            scene.tweens.add({
                targets: wipers,
                rotation: WIPER.sweep,
                duration: TIMING.sweep / 2,
                ease: 'Sine.easeInOut',
                yoyo: true,
                onYoyo: () => {
                    if (cleared) return
                    cleared = true
                    clearGlass()
                },
                onComplete: () => {
                    wipers.forEach(w => w.setRotation(WIPER.rest))
                    sweeping = false
                    resolve()
                },
            })
        })

    const paintLines = (dt: number) => {
        lines.clear()
        if (level.v <= 0.01) return
        const count = Math.round(STREAKS * level.v)
        lines.lineStyle(3, C.rain, 0.5)
        for (let i = 0; i < count; i++) {
            const s = streaks[i]
            s.y += s.speed * dt
            s.x -= s.speed * dt * 0.12
            if (s.y > GLASS.bottom) {
                s.y = GLASS.top - s.len
                s.x = Math.random() * (W + 120)
            }
            lines.lineBetween(s.x, s.y, s.x - s.len * 0.12, s.y + s.len)
        }
    }

    const growDrops = (dt: number) => {
        if (level.v <= 0.05 || stopping) return
        dropDebt += dt * 16 * level.v
        while (dropDebt >= 1) {
            dropDebt -= 1
            if (drops.length >= MAX_DROPS) break
            const d = scene.add
                .image(40 + Math.random() * (W - 80), GLASS.top + 20 + Math.random() * (GLASS.bottom - GLASS.top - 60), DROP_KEY)
                .setDepth(DEPTH.drops)
                .setScale(0.7 + Math.random() * 0.9)
                .setAlpha(0)
            scene.tweens.add({ targets: d, alpha: 1, duration: 160 })
            drops.push(d)
        }
        drops.forEach(d => (d.y += dt * 10))
        if (!sweeping) fog.setAlpha(Math.min(0.62 * level.v, fog.alpha + dt * 0.3 * level.v))
    }

    return {
        start(ms) {
            stopping = false
            scene.tweens.killTweensOf(level)
            scene.tweens.add({ targets: level, v: 1, duration: ms })
        },
        stop(ms) {
            stopping = true
            scene.tweens.killTweensOf(level)
            scene.tweens.add({ targets: level, v: 0, duration: ms, onComplete: clearGlass })
            clearGlass()
            scene.tweens.add({ targets: fog, alpha: 0, duration: ms })
        },
        raining: () => level.v > 0.3,
        blur: () => fog.alpha,
        sweep,
        setSensor(on) {
            sensor = on
            sinceSweep = 0
        },
        update(dt) {
            paintLines(dt)
            growDrops(dt)
            if (!sensor || level.v < 0.3) return
            sinceSweep += dt * 1000
            if (sinceSweep >= TIMING.sweepEvery) void sweep()
        },
        destroy() {
            scene.tweens.killTweensOf(level)
            scene.tweens.killTweensOf(wipers)
            scene.tweens.killTweensOf(fog)
            drops.forEach(d => d.destroy())
            wipers.forEach(w => w.destroy())
            fog.destroy()
            lines.destroy()
        },
    }
}
