import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG, BG_FRONT, PIECES_SHEET, TOWEL_CELL } from '../data/files'
import { BAY, DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'
import { fit } from './art'

export type Rect = { x: number; y: number; w: number; h: number }

export const bayPos = (bay: number) => ({ x: BAY.xs[bay % 3], feet: BAY.feet[Math.floor(bay / 3)] })

export function bayRect(bay: number): Rect {
    const { x, feet } = bayPos(bay)
    return { x, y: feet - (BAY.hitTop - BAY.hitBottom) / 2, w: BAY.hitW, h: BAY.hitTop + BAY.hitBottom }
}

export function bayAt(px: number, py: number) {
    for (let bay = 0; bay < 6; bay++) {
        const r = bayRect(bay)
        if (Math.abs(px - r.x) <= r.w / 2 && Math.abs(py - r.y) <= r.h / 2) return bay
    }
    return -1
}

export function rectOf(bays: number[]): Rect {
    const rects = bays.map(bayRect)
    const left = Math.min(...rects.map(r => r.x - r.w / 2))
    const right = Math.max(...rects.map(r => r.x + r.w / 2))
    const top = Math.min(...rects.map(r => r.y - r.h / 2))
    const bottom = Math.max(...rects.map(r => r.y + r.h / 2))
    return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
}

export interface Beach {
    splash(x: number, y: number): void
    hearts(x: number, y: number): void
    destroy(): void
}

export function createBeach(scene: Phaser.Scene): Beach {
    const bg = scene.add.image(W / 2, H / 2, BG).setDepth(DEPTH.bg)
    bg.setScale(Math.max(W / bg.width, H / bg.height))
    const front = scene.textures.exists(BG_FRONT)
        ? scene.add.image(W / 2, H / 2, BG_FRONT).setDepth(DEPTH.cabin).setScale(bg.scale)
        : undefined

    const towels = Array.from({ length: 6 }, (_, bay) => {
        const { x, feet } = bayPos(bay)
        return fit(scene, PIECES_SHEET, TOWEL_CELL, BAY.towelW).setPosition(x, feet - 12).setDepth(DEPTH.towel)
    })

    return {
        splash(x, y) {
            const ring = scene.add.graphics({ x, y }).setDepth(DEPTH.fx)
            ring.lineStyle(5, C.white, 1)
            ring.strokeEllipse(0, 0, 60, 18)
            void FX.to(scene, ring, { scaleX: 2.2, scaleY: 2.2, alpha: 0 }, { duration: 520 }).then(() => ring.destroy())
            for (let k = 0; k < 7; k++) {
                const drop = scene.add.graphics({ x, y }).setDepth(DEPTH.fx)
                drop.fillStyle(k % 2 ? C.white : C.sea, 1)
                drop.fillCircle(0, 0, 7)
                drop.lineStyle(2, C.ink, 0.6)
                drop.strokeCircle(0, 0, 7)
                const angle = -Math.PI * (0.15 + (0.7 * k) / 6)
                void FX.to(
                    scene,
                    drop,
                    { x: x + Math.cos(angle) * 54, y: y + Math.sin(angle) * 54, alpha: 0 },
                    { duration: 460, ease: 'Quad.easeOut' },
                ).then(() => drop.destroy())
            }
        },
        hearts(x, y) {
            for (let k = 0; k < 5; k++) {
                const heart = scene.add.graphics({ x: x + (k - 2) * 26, y }).setDepth(DEPTH.fx)
                heart.fillStyle(C.heart, 1)
                heart.fillCircle(-6, 0, 8)
                heart.fillCircle(6, 0, 8)
                heart.fillTriangle(-13, 3, 13, 3, 0, 17)
                heart.setScale(0.4)
                void FX.to(scene, heart, { y: y - 90 - k * 8, scale: 1, alpha: 0 }, { duration: 1100, delay: k * 90 }).then(() =>
                    heart.destroy(),
                )
            }
        },
        destroy() {
            towels.forEach(t => t.destroy())
            front?.destroy()
            bg.destroy()
        },
    }
}
