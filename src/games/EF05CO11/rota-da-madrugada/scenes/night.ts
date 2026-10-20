import Phaser from 'phaser'
import { BEAM, DEPTH, H, ROAD, SKY_SHADE, W } from '../data/layout'
import { C } from '../data/theme'

export interface Night {
    dark(): number
    setDark(value: number, ms: number): Promise<void>
    setBeam(on: boolean, ms: number): Promise<void>
    destroy(): void
}

export function createNight(scene: Phaser.Scene, dark: number): Night {
    const g = scene.add.graphics().setDepth(DEPTH.night)
    const shade = { v: dark }
    const beam = { v: 0 }
    const top = ROAD.horizon - 24

    const paint = () => {
        g.clear()
        const d = shade.v
        const b = beam.v
        const s = BEAM.soft
        const outer = { nl: BEAM.nearL - s, nr: BEAM.nearR + s, fl: BEAM.farL - s * 0.2, fr: BEAM.farR + s * 0.2 }
        const y = BEAM.farY
        const sky = Phaser.Math.Clamp((d - SKY_SHADE.from) / (1 - SKY_SHADE.from), 0, 1) * SKY_SHADE.max
        if (sky > 0) {
            g.fillStyle(C.night, sky)
            g.fillRect(0, 0, W, top)
        }
        g.fillStyle(C.night, d)
        g.fillRect(0, top, W, y - top)
        g.fillPoints(
            [
                { x: 0, y },
                { x: outer.fl, y },
                { x: outer.nl, y: H },
                { x: 0, y: H },
            ],
            true,
        )
        g.fillPoints(
            [
                { x: outer.fr, y },
                { x: W, y },
                { x: W, y: H },
                { x: outer.nr, y: H },
            ],
            true,
        )
        g.fillStyle(C.night, d * (1 - 0.45 * b))
        g.fillPoints(
            [
                { x: outer.fl, y },
                { x: BEAM.farL, y },
                { x: BEAM.nearL, y: H },
                { x: outer.nl, y: H },
            ],
            true,
        )
        g.fillPoints(
            [
                { x: BEAM.farR, y },
                { x: outer.fr, y },
                { x: outer.nr, y: H },
                { x: BEAM.nearR, y: H },
            ],
            true,
        )
        const cone = [
            { x: BEAM.farL, y },
            { x: BEAM.farR, y },
            { x: BEAM.nearR, y: H },
            { x: BEAM.nearL, y: H },
        ]
        g.fillStyle(C.night, d * (1 - 0.9 * b))
        g.fillPoints(cone, true)
        if (b > 0) {
            g.fillStyle(C.beam, 0.12 * b)
            g.fillPoints(cone, true)
        }
    }
    paint()

    const waiting = new Map<object, () => void>()
    const settle = (target: object) => {
        waiting.get(target)?.()
        waiting.delete(target)
    }

    const tween = (target: { v: number }, v: number, ms: number) =>
        new Promise<void>(resolve => {
            settle(target)
            scene.tweens.killTweensOf(target)
            waiting.set(target, resolve)
            scene.tweens.add({
                targets: target,
                v,
                duration: Math.max(1, ms),
                ease: 'Sine.easeInOut',
                onUpdate: paint,
                onComplete: () => {
                    paint()
                    settle(target)
                },
            })
        })

    return {
        dark: () => shade.v,
        setDark(value, ms) {
            return tween(shade, value, ms)
        },
        setBeam(on, ms) {
            return tween(beam, on ? 1 : 0, ms)
        },
        destroy() {
            scene.tweens.killTweensOf(shade)
            scene.tweens.killTweensOf(beam)
            settle(shade)
            settle(beam)
            g.destroy()
        },
    }
}

