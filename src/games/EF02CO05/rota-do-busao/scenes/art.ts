import Phaser from 'phaser'
import { RIDER_FRAME, RIDERS_SHEET, SITUATION_FRAME, SITUATIONS_SHEET, frameKey } from '../data/files'
import { C } from '../data/theme'
import type { Glyph, RiderId, SituationId } from '../types'

export type Rect = { x: number; y: number; w: number; h: number }

export function riderImage(scene: Phaser.Scene, id: RiderId, size: number) {
    const [, , w, h] = RIDER_FRAME[id]
    return scene.add.image(0, 0, RIDERS_SHEET, frameKey(id)).setScale(size / Math.max(w, h))
}

export function situationImage(scene: Phaser.Scene, id: SituationId, size: number) {
    const [, , w, h] = SITUATION_FRAME[id]
    return scene.add.image(0, 0, SITUATIONS_SHEET, frameKey(id)).setScale(size / Math.max(w, h))
}

export function drawGlyph(g: Phaser.GameObjects.Graphics, glyph: Glyph) {
    g.lineStyle(3, C.ink, 1)
    switch (glyph) {
        case 'clock':
            g.fillStyle(C.white, 1)
            g.fillCircle(0, 0, 14)
            g.strokeCircle(0, 0, 14)
            g.lineBetween(0, 0, 0, -9)
            g.lineBetween(0, 0, 7, 3)
            break
        case 'flake':
            g.lineStyle(4, C.flake, 1)
            for (let i = 0; i < 3; i++) {
                const a = (i * Math.PI) / 3
                g.lineBetween(Math.cos(a) * -14, Math.sin(a) * -14, Math.cos(a) * 14, Math.sin(a) * 14)
            }
            g.lineStyle(2, C.white, 1)
            g.strokeCircle(0, 0, 4)
            break
        case 'note':
            g.fillStyle(C.note, 1)
            g.fillEllipse(-3, 8, 16, 12)
            g.fillRect(3, -16, 4, 24)
            g.fillTriangle(7, -16, 7, -6, 17, -10)
            break
        case 'ring':
            g.lineStyle(4, C.ring, 1)
            for (const r of [6, 13, 20]) {
                g.beginPath()
                g.arc(-8, 0, r, -0.32 * Math.PI, 0.32 * Math.PI)
                g.strokePath()
            }
            break
        case 'heat':
            g.lineStyle(4, C.heat, 1)
            for (const dx of [-8, 0, 8]) {
                g.beginPath()
                g.moveTo(dx, 12)
                g.lineTo(dx + 4, 4)
                g.lineTo(dx - 3, -4)
                g.lineTo(dx + 3, -12)
                g.strokePath()
            }
            break
        case 'light':
            g.fillStyle(C.light, 1)
            g.fillCircle(0, 0, 10)
            g.lineStyle(3, C.star, 1)
            for (let i = 0; i < 8; i++) {
                const a = (i * Math.PI) / 4
                g.lineBetween(Math.cos(a) * 14, Math.sin(a) * 14, Math.cos(a) * 20, Math.sin(a) * 20)
            }
            break
        case 'drop':
            g.fillStyle(C.drop, 1)
            g.fillCircle(0, 4, 9)
            g.fillTriangle(-8, 1, 8, 1, 0, -14)
            break
        case 'star':
        default: {
            const points: Phaser.Types.Math.Vector2Like[] = []
            for (let i = 0; i < 8; i++) {
                const r = i % 2 ? 6 : 17
                const a = (i * Math.PI) / 4 - Math.PI / 2
                points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
            }
            g.fillStyle(C.star, 1)
            g.fillPoints(points, true)
            g.lineStyle(2, C.ink, 1)
            g.strokePoints(points, true)
            break
        }
    }
}
