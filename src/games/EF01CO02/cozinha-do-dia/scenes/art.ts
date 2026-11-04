import Phaser from 'phaser'
import { BENCH, RECIPE } from '../data/layout'
import { C } from '../data/theme'

export const DOT = 'cdd-dot'
export const SPLAT = 'cdd-splat'
export const PUFF = 'cdd-puff'
export const HEART = 'cdd-heart'
export const CHECK = 'cdd-check'
export const ARROW = 'cdd-arrow'
export const CARD = 'cdd-card'
export const CARD_LIT = 'cdd-card-lit'
export const PAD = 'cdd-pad'
export const PAD_RING = 'cdd-pad-ring'
export const ROUND_RING = 'cdd-round-ring'
export const THOUGHT_CLOUD = 'cdd-thought'

const TINT_RIM = 0xc8c0b4

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

export function ensureBits(scene: Phaser.Scene) {
    baked(scene, DOT, 28, 28, g => {
        g.fillStyle(TINT_RIM, 1)
        g.fillCircle(14, 14, 14)
        g.fillStyle(C.white, 1)
        g.fillCircle(13, 12, 11)
    })

    baked(scene, SPLAT, 128, 128, g => {
        const blobs = [
            [64, 64, 34],
            [34, 56, 16],
            [94, 52, 18],
            [84, 92, 16],
            [42, 90, 14],
            [62, 26, 12],
            [16, 34, 6],
            [112, 92, 6],
            [24, 108, 5],
        ]
        g.fillStyle(TINT_RIM, 1)
        blobs.forEach(([x, y, r]) => g.fillCircle(x, y, r + 3))
        g.fillStyle(C.white, 1)
        blobs.forEach(([x, y, r]) => g.fillCircle(x, y, r))
    })

    baked(scene, PUFF, 128, 96, g => {
        const blobs = [
            [40, 56, 26],
            [68, 42, 32],
            [96, 58, 22],
        ]
        g.fillStyle(C.creamDark, 1)
        blobs.forEach(([x, y, r]) => g.fillCircle(x, y, r + 3))
        g.fillStyle(C.white, 1)
        blobs.forEach(([x, y, r]) => g.fillCircle(x, y, r))
    })

    baked(scene, HEART, 64, 60, g => {
        const heart = (grow: number, color: number) => {
            g.fillStyle(color, 1)
            g.fillCircle(20, 22, 15 + grow)
            g.fillCircle(44, 22, 15 + grow)
            g.fillTriangle(6 - grow, 29, 58 + grow, 29, 32, 56 + grow)
        }
        heart(3, C.heartRim)
        heart(0, C.pink)
    })

    baked(scene, CHECK, 48, 48, g => {
        g.fillStyle(C.cream, 1)
        g.fillCircle(24, 24, 24)
        g.fillStyle(C.yes, 1)
        g.fillCircle(24, 24, 20)
        g.lineStyle(7, C.white, 1)
        g.lineBetween(14, 25, 22, 33)
        g.lineBetween(22, 33, 35, 16)
    })

    baked(scene, ARROW, 32, 32, g => {
        g.fillStyle(C.headerLine, 1)
        g.fillTriangle(6, 3, 28, 16, 6, 29)
    })

    const cw = RECIPE.cardW
    const ch = RECIPE.cardH
    baked(scene, CARD, cw + 8, ch + 14, g => {
        g.fillStyle(C.softShadow, 0.24)
        g.fillRoundedRect(4, 10, cw, ch, 14)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(4, 4, cw, ch, 14)
        g.lineStyle(3, C.soft, 1)
        g.strokeRoundedRect(4, 4, cw, ch, 14)
    })

    baked(scene, CARD_LIT, cw + 24, ch + 24, g => {
        g.lineStyle(8, C.butter, 1)
        g.strokeRoundedRect(8, 8, cw + 8, ch + 8, 18)
    })

    const pw = BENCH.padW
    const ph = BENCH.padH
    baked(scene, PAD, pw + 8, ph + 18, g => {
        g.fillStyle(C.softShadow, 0.28)
        g.fillRoundedRect(4, 16, pw, ph, 26)
        g.fillStyle(C.creamDark, 1)
        g.fillRoundedRect(4, 10, pw, ph, 26)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(4, 4, pw, ph - 4, 26)
    })

    baked(scene, PAD_RING, pw + 26, ph + 34, g => {
        g.lineStyle(9, C.butter, 1)
        g.strokeRoundedRect(8, 8, pw + 10, ph + 18, 30)
    })

    baked(scene, ROUND_RING, 140, 140, g => {
        g.lineStyle(9, C.butter, 1)
        g.strokeCircle(70, 70, 62)
    })

    baked(scene, THOUGHT_CLOUD, 260, 210, g => {
        const blobs = [
            [140, 85, 74],
            [78, 90, 46],
            [204, 92, 44],
            [108, 44, 40],
            [176, 44, 38],
            [140, 130, 40],
        ]
        const bubbles = [
            [62, 168, 15],
            [40, 190, 9],
        ]
        g.fillStyle(C.soft, 1)
        ;[...blobs, ...bubbles].forEach(([x, y, r]) => g.fillCircle(x, y, r + 3))
        g.fillStyle(C.white, 1)
        ;[...blobs, ...bubbles].forEach(([x, y, r]) => g.fillCircle(x, y, r))
    })
}
