import Phaser from 'phaser'
import { BEAR, BEAR_ART } from '../data/files'
import { C } from '../data/theme'
import type { Piece, Rule, Shape, Size } from '../types'
import { createDrop } from './claw'

export const LIT = 'lit'
export const LIT_FROM = 'from'

const BEAR_WIDTH = 0.78
const BEAR_RATIO = 0.5

function paintBear(g: Phaser.GameObjects.Graphics, h: number, lit: boolean) {
    const blob = (pad: number) => {
        for (const s of [-1, 1]) {
            g.fillCircle(s * 0.27 * h, -0.86 * h, 0.12 * h + pad)
            g.fillEllipse(s * 0.29 * h, -0.28 * h, 0.16 * h + pad * 2, 0.24 * h + pad * 2)
            g.fillEllipse(s * 0.17 * h, -0.075 * h, 0.24 * h + pad * 2, 0.15 * h + pad * 2)
        }
        g.fillEllipse(0, -0.24 * h, 0.62 * h + pad * 2, 0.46 * h + pad * 2)
        g.fillCircle(0, -0.64 * h, 0.3 * h + pad)
    }
    if (!lit) {
        g.fillStyle(C.cabinet, 1)
        blob(0)
        return
    }
    const line = Math.max(2, h * 0.05)
    g.fillStyle(C.white, 1)
    blob(line + 2)
    g.fillStyle(C.ink, 1)
    blob(line)
    g.fillStyle(C.bear, 1)
    blob(0)
    g.fillStyle(C.cream, 1)
    for (const s of [-1, 1]) {
        g.fillCircle(s * 0.27 * h, -0.86 * h, 0.06 * h)
        g.fillEllipse(s * 0.17 * h, -0.07 * h, 0.13 * h, 0.08 * h)
    }
    g.fillEllipse(0, -0.22 * h, 0.32 * h, 0.26 * h)
    g.fillEllipse(0, -0.56 * h, 0.28 * h, 0.19 * h)
    g.fillStyle(C.ink, 1)
    g.fillEllipse(0, -0.6 * h, 0.1 * h, 0.065 * h)
    for (const s of [-1, 1]) g.fillCircle(s * 0.11 * h, -0.7 * h, Math.max(1.5, 0.038 * h))
}

function createBear(scene: Phaser.Scene, h: number, lit: boolean): Phaser.GameObjects.Container {
    if (scene.textures.exists(BEAR)) {
        const art = scene.add.image(0, 0, BEAR).setOrigin(0.5, BEAR_ART.foot)
        art.setScale(h / (art.height * BEAR_ART.span))
        if (!lit) art.setTintFill(C.cabinet)
        return scene.add.container(0, 0, [art])
    }
    const g = scene.add.graphics()
    paintBear(g, h, lit)
    return scene.add.container(0, 0, [g])
}

function sizeLayout(r: number) {
    const big = r * 1.95
    const small = big * BEAR_RATIO
    const total = (big + small) * BEAR_WIDTH + r * 0.3
    return {
        base: big / 2,
        big: { h: big, x: -total / 2 + (big * BEAR_WIDTH) / 2 },
        small: { h: small, x: total / 2 - (small * BEAR_WIDTH) / 2 },
    }
}

function sizeParts(scene: Phaser.Scene, size: Size, r: number): Phaser.GameObjects.GameObject[] {
    const spots = sizeLayout(r)
    const own = size === 'big' ? spots.big : spots.small
    const other = size === 'big' ? spots.small : spots.big
    const ghost = createBear(scene, other.h, false).setPosition(other.x, spots.base)
    const lit = createBear(scene, own.h, true)
        .setPosition(own.x, spots.base)
        .setName(LIT)
        .setData(LIT_FROM, other.h / own.h)
    return [ghost, lit]
}

function paintShape(g: Phaser.GameObjects.Graphics, shape: Shape, r: number) {
    const s = r * 0.9
    g.fillStyle(C.cream, 1)
    g.lineStyle(5, C.ink, 1)
    if (shape === 'round') {
        g.fillCircle(0, 0, s)
        g.strokeCircle(0, 0, s)
    } else if (shape === 'square') {
        g.fillRoundedRect(-s, -s, s * 2, s * 2, s * 0.25)
        g.strokeRoundedRect(-s, -s, s * 2, s * 2, s * 0.25)
    } else {
        g.fillTriangle(0, -s * 1.1, s * 1.1, s * 0.9, -s * 1.1, s * 0.9)
        g.strokeTriangle(0, -s * 1.1, s * 1.1, s * 0.9, -s * 1.1, s * 0.9)
    }
}

export const CROSS = 'cross'

export function paintCross(g: Phaser.GameObjects.Graphics, r: number, progress = 1) {
    g.clear()
    const k = r * 1.15
    const first = Phaser.Math.Clamp(progress * 2, 0, 1)
    const second = Phaser.Math.Clamp(progress * 2 - 1, 0, 1)
    const strokes: [number, number, number][] = [
        [-k, k, first],
        [k, -k, second],
    ]
    for (const [width, color] of [[14, C.white], [8, C.amberDark]] as const) {
        g.lineStyle(width, color, 1)
        for (const [x0, x1, p] of strokes) {
            if (p <= 0) continue
            g.lineBetween(x0, -k, x0 + (x1 - x0) * p, -k + 2 * k * p)
        }
    }
}

function valueParts(scene: Phaser.Scene, value: Rule, r: number): Phaser.GameObjects.GameObject[] {
    if (value.feature === 'color') return [createDrop(scene, value.color, r)]
    if (value.feature === 'size') return sizeParts(scene, value.size, r)
    const g = scene.add.graphics()
    paintShape(g, value.shape, r)
    return [g]
}

export function createRuleIcon(scene: Phaser.Scene, rule: Rule, r: number): Phaser.GameObjects.Container {
    const parts = valueParts(scene, rule, r)
    if (rule.not) {
        const cross = scene.add.graphics().setName(CROSS)
        paintCross(cross, r)
        if (rule.feature === 'size') {
            const spots = sizeLayout(r)
            const own = rule.size === 'big' ? spots.big : spots.small
            cross.setPosition(own.x, spots.base - own.h / 2).setScale((0.78 * own.h) / spots.big.h)
        }
        parts.push(cross)
    }
    return scene.add.container(0, 0, parts)
}

export function featureOf(piece: Piece, rule: Rule): Rule {
    if (rule.feature === 'size') return { feature: 'size', size: piece.size }
    if (rule.feature === 'shape' && piece.def.shape) return { feature: 'shape', shape: piece.def.shape }
    return { feature: 'color', color: piece.def.color }
}

export function createFeatureIcon(scene: Phaser.Scene, piece: Piece, rule: Rule, r: number): Phaser.GameObjects.Container {
    return scene.add.container(0, 0, valueParts(scene, featureOf(piece, rule), r))
}
