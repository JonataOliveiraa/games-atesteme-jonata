import Phaser from 'phaser'
import { C } from '../data/theme'
import type { Piece, Rule, Shape, Size } from '../types'
import { createDrop } from './claw'

function paintSize(g: Phaser.GameObjects.Graphics, size: Size, r: number) {
    const big = r * 1.5
    const small = r * 0.85
    const gap = r * 0.35
    const total = big + gap + small
    const base = big / 2
    const boxes: [number, number, boolean][] = [
        [-total / 2, big, size === 'big'],
        [-total / 2 + big + gap, small, size === 'small'],
    ]
    for (const [left, side, on] of boxes) {
        const top = base - side
        if (on) {
            g.fillStyle(C.ink, 1)
            g.fillRoundedRect(left - 3, top - 3, side + 6, side + 6, side * 0.22)
            g.fillStyle(C.gold, 1)
            g.fillRoundedRect(left, top, side, side, side * 0.2)
            g.fillStyle(C.white, 0.5)
            g.fillRoundedRect(left + side * 0.15, top + side * 0.12, side * 0.4, side * 0.16, side * 0.08)
        } else {
            g.lineStyle(4, C.cabinetLight, 1)
            g.strokeRoundedRect(left, top, side, side, side * 0.2)
        }
    }
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

function valueIcon(scene: Phaser.Scene, value: Rule, r: number): Phaser.GameObjects.GameObject {
    if (value.feature === 'color') return createDrop(scene, value.color, r)
    const g = scene.add.graphics()
    if (value.feature === 'size') paintSize(g, value.size, r)
    else paintShape(g, value.shape, r)
    return g
}

export function createRuleIcon(scene: Phaser.Scene, rule: Rule, r: number): Phaser.GameObjects.Container {
    const parts = [valueIcon(scene, rule, r)]
    if (rule.not) {
        const cross = scene.add.graphics().setName(CROSS)
        paintCross(cross, r)
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
    const value = featureOf(piece, rule)
    return scene.add.container(0, 0, [valueIcon(scene, value, r)])
}
