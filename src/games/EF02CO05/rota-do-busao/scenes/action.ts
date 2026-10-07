import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import type { Glyph } from '../types'
import { drawGlyph } from './art'

const COUNT = 6
const GAP_MS = 90
const FLIGHT_MS = 560

type Point = { x: number; y: number }

export async function act(scene: Phaser.Scene, glyph: Glyph, from: Point, to: Point, lands: boolean): Promise<void> {
    const flights: Promise<void>[] = []
    for (let i = 0; i < COUNT; i++) {
        const g = scene.add.graphics({ x: from.x, y: from.y }).setDepth(DEPTH.card + 1)
        drawGlyph(g, glyph)
        g.setScale(0.4).setAlpha(0)
        const tx = to.x + Phaser.Math.Between(-60, 60)
        const ty = to.y + Phaser.Math.Between(-50, 50)
        const delay = i * GAP_MS
        const flight = (async () => {
            await FX.wait(scene, delay)
            g.setAlpha(1)
            await Promise.all([
                FX.to(scene, g, { x: tx }, { duration: FLIGHT_MS, ease: 'Sine.easeInOut' }),
                FX.to(scene, g, { y: ty, scale: 1.1 }, { duration: FLIGHT_MS, ease: 'Back.easeOut' }),
                FX.to(scene, g, { angle: Phaser.Math.Between(-30, 30) }, { duration: FLIGHT_MS }),
            ])
            if (lands) {
                await FX.to(scene, g, { scale: 1.6, alpha: 0 }, { duration: 260 })
            } else {
                await FX.to(scene, g, { y: ty + 140, angle: g.angle + 120, alpha: 0 }, { duration: 420, ease: 'Quad.easeIn' })
            }
            g.destroy()
        })()
        flights.push(flight)
    }
    await FX.wait(scene, (COUNT - 1) * GAP_MS + FLIGHT_MS)
    void Promise.all(flights)
}
