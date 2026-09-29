import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { DEPTH, SAIL } from '../data/layout'
import { C } from '../data/theme'
import type { CodeDef } from '../types'
import { createMarkView, type MarkView } from './marks'

export interface Sail {
    readonly rect: GuideRect
    light(row: number, pulses?: number): Promise<void>
    walk(onBeat: () => void): Promise<void>
    destroy(): void
}

const PAD = 10
const MARK_X = SAIL.x + SAIL.w - 8 - SAIL.mark / 2
const ARROW_X = MARK_X - SAIL.mark / 2 - 14

export function createSail(scene: Phaser.Scene, code: CodeDef, beatMs: number): Sail {
    const rows = code.pairs.length
    const top = SAIL.y + (SAIL.h - rows * SAIL.rowH) / 2
    const rowY = (i: number) => top + SAIL.rowH * (i + 0.5)

    const glow = scene.add.graphics().setDepth(DEPTH.sail).setAlpha(0)
    const arrows = scene.add.graphics().setDepth(DEPTH.sail + 1)
    const views: { from: MarkView; to: MarkView }[] = []

    code.pairs.forEach(([from, to], i) => {
        const y = rowY(i)
        const left = createMarkView(scene, from, SAIL.drum, 4)
        left.container.setPosition(SAIL.x + PAD + left.width / 2, y).setDepth(DEPTH.sail + 1)
        const right = createMarkView(scene, to, SAIL.mark)
        right.container.setPosition(MARK_X, y).setDepth(DEPTH.sail + 1)
        views.push({ from: left, to: right })

        arrows.lineStyle(4, C.ink, 0.85)
        arrows.lineBetween(ARROW_X - 12, y, ARROW_X + 6, y)
        arrows.fillStyle(C.ink, 0.85)
        arrows.fillTriangle(ARROW_X + 12, y, ARROW_X + 3, y - 7, ARROW_X + 3, y + 7)
    })

    const paintGlow = (row: number) => {
        glow.clear()
        const y = rowY(row)
        glow.fillStyle(C.glow, 1)
        glow.fillRoundedRect(SAIL.x + 2, y - SAIL.rowH / 2 + 3, SAIL.w - 4, SAIL.rowH - 6, 14)
        glow.lineStyle(4, C.mintDark, 1)
        glow.strokeRoundedRect(SAIL.x + 2, y - SAIL.rowH / 2 + 3, SAIL.w - 4, SAIL.rowH - 6, 14)
    }

    const light = async (row: number, pulses = 1) => {
        FX.kill(scene, glow)
        paintGlow(row)
        glow.setAlpha(0)
        for (let i = 0; i < pulses; i++) {
            await FX.to(scene, glow, { alpha: 1 }, { duration: 200 })
            await FX.wait(scene, 260)
            await FX.to(scene, glow, { alpha: 0.25 }, { duration: 200 })
        }
        await FX.to(scene, glow, { alpha: 0 }, { duration: 200 })
    }

    return {
        rect: { x: SAIL.x + SAIL.w / 2, y: SAIL.y + SAIL.h / 2, w: SAIL.w, h: SAIL.h },
        light,
        async walk(onBeat) {
            for (let row = 0; row < views.length; row++) {
                FX.kill(scene, glow)
                paintGlow(row)
                await FX.to(scene, glow, { alpha: 1 }, { duration: 180 })
                const { from, to } = views[row]
                for (let b = 0; b < from.parts.length; b++) {
                    onBeat()
                    void from.beat(b)
                    void to.beat(0)
                    await FX.wait(scene, beatMs)
                }
                await FX.wait(scene, 250)
            }
            await FX.to(scene, glow, { alpha: 0 }, { duration: 200 })
        },
        destroy() {
            FX.kill(scene, glow)
            views.forEach(({ from, to }) => {
                from.destroy()
                to.destroy()
            })
            glow.destroy()
            arrows.destroy()
        },
    }
}
