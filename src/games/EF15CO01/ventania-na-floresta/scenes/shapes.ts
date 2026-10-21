import Phaser from 'phaser'
import { JEITO } from '../data/layout'
import { C, FONT, inkOn } from '../data/theme'
import { HOME_LABEL } from '../data/words'
import type { Home, Vec } from '../types'
import { baked } from './art'

type G = Phaser.GameObjects.Graphics

const { w: SW, h: SH } = JEITO.shape

// Where the "things" sit inside each drawing, in shape units; the wrong-choice scene drops the group onto them.
export const SHAPE_DOTS: Record<Home, Vec[]> = {
    fila: [
        { x: 11, y: 22 },
        { x: 42, y: 22 },
        { x: 64, y: 22 },
    ],
    grade: [0, 1].flatMap(r => [0, 1, 2].map(c => ({ x: 15 + c * 20, y: 12 + r * 20 }))),
    ficha: [
        { x: 54, y: 12 },
        { x: 54, y: 32 },
    ],
    teia: [
        { x: 12, y: 10 },
        { x: 58, y: 8 },
        { x: 16, y: 36 },
        { x: 56, y: 34 },
    ],
    solto: [{ x: 35, y: 22 }],
}

const TEIA_LINKS = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
    [0, 3],
]

// The shape of each way of organizing, the same everywhere: it defines the way, it never points at the answer.
export function paintShape(g: G, home: Home, ox: number, oy: number, k = 1) {
    const X = (x: number) => ox + x * k
    const Y = (y: number) => oy + y * k
    const line = (w: number) => Math.max(w, w * k * 0.6)
    const dot = (p: Vec, r: number, fill: number = C.chip) => {
        g.fillStyle(fill, 1)
        g.fillCircle(X(p.x), Y(p.y), r * k)
    }
    const chevron = (x: number, y: number) => {
        g.lineStyle(line(4), C.inkSoft, 1)
        g.beginPath()
        g.moveTo(X(x - 3), Y(y - 6))
        g.lineTo(X(x + 3), Y(y))
        g.lineTo(X(x - 3), Y(y + 6))
        g.strokePath()
    }
    const dots = SHAPE_DOTS[home]
    if (home === 'fila') {
        ;[10, 8, 5].forEach((r, i) => dot(dots[i], r))
        chevron(28, 22)
        chevron(55, 22)
    } else if (home === 'grade') {
        dots.forEach(p => {
            g.fillStyle(C.chip, 0.22)
            g.fillRoundedRect(X(p.x - 8), Y(p.y - 8), 16 * k, 16 * k, 4 * k)
            g.lineStyle(line(3), C.chip, 1)
            g.strokeRoundedRect(X(p.x - 8), Y(p.y - 8), 16 * k, 16 * k, 4 * k)
        })
    } else if (home === 'ficha') {
        ;[C.laranja, C.verde].forEach((fill, r) => {
            const y = dots[r].y
            g.fillStyle(C.labelRing, 1)
            g.fillCircle(X(14), Y(y), 8 * k)
            g.lineStyle(line(2), C.labelIcon, 1)
            g.strokeCircle(X(14), Y(y), 8 * k)
            g.fillStyle(C.labelIcon, 1)
            g.fillRect(X(10), Y(y - 1.5), 8 * k, 3 * k)
            chevron(34, y)
            dot(dots[r], 8, fill)
        })
    } else if (home === 'teia') {
        g.lineStyle(line(3), C.chip, 1)
        TEIA_LINKS.forEach(([a, b]) => g.lineBetween(X(dots[a].x), Y(dots[a].y), X(dots[b].x), Y(dots[b].y)))
        dots.forEach(p => dot(p, 7))
    } else {
        dot(dots[0], 11)
    }
}

export const shapeAt = (home: Home, center: Vec, k: number, i: number): Vec => {
    const p = SHAPE_DOTS[home][i]
    return { x: center.x + (p.x - SW / 2) * k, y: center.y + (p.y - SH / 2) * k }
}

export function shapeBoard(scene: Phaser.Scene, home: Home, k: number) {
    const pad = 22
    const w = SW * k + pad * 2
    const h = SH * k + pad * 2
    const key = baked(scene, `vnf-board-${home}-${k}`, w + 8, h + 10, g => {
        g.fillStyle(C.shadow, 0.22)
        g.fillRoundedRect(6, 10, w, h, 26)
        g.fillStyle(C.board, 1)
        g.fillRoundedRect(0, 0, w, h, 26)
        g.lineStyle(5, C.woodDark, 1)
        g.strokeRoundedRect(2.5, 2.5, w - 5, h - 5, 24)
        paintShape(g, home, pad, pad, k)
    })
    return scene.add.image(4, 5, key)
}

export function makePlate(scene: Phaser.Scene, home: Home, k: number, fontSize: number) {
    const label = scene.add
        .text(0, -1, HOME_LABEL[home], { fontFamily: FONT.black, fontSize: `${fontSize}px`, color: inkOn(C.chip) })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const sw = SW * k
    const sh = SH * k
    const pad = 10 * k
    const h = sh + pad * 2
    const w = pad + sw + 16 * k + label.width + 20 * k
    const key = baked(scene, `vnf-plate-${home}-${k}`, w, h + 6, g => {
        g.fillStyle(C.chipDark, 1)
        g.fillRoundedRect(0, 6, w, h, 18 * k)
        g.fillStyle(C.chip, 1)
        g.fillRoundedRect(0, 0, w, h, 18 * k)
        g.fillStyle(C.board, 1)
        g.fillRoundedRect(pad - 5 * k, pad - 5 * k, sw + 10 * k, sh + 10 * k, 12 * k)
        paintShape(g, home, pad, pad, k)
    })
    const art = scene.add.image(0, 3, key)
    label.setX(-w / 2 + pad + sw + 16 * k)
    return { box: scene.add.container(0, 0, [art, label]), w, h }
}
