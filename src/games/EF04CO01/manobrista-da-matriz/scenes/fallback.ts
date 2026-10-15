import Phaser from 'phaser'
import { BG, CAR_SHEET, CONTROL_SHEET, PIECES_SHEET, type Sheet } from '../data/files'
import { GATE, H, W, YARD } from '../data/layout'

type G = Phaser.GameObjects.Graphics
type P = Phaser.Types.Math.Vector2Like
type Radius = number | { tl: number; tr: number; bl: number; br: number }
const INK = 0x3d2c3e
const LINE = 5

function bakeSheet(scene: Phaser.Scene, sheet: Sheet, paint: (g: G, i: number) => void) {
    if (scene.textures.exists(sheet.key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    for (let i = 0; i < sheet.cols * sheet.rows; i++) {
        g.save()
        g.translateCanvas((i % sheet.cols) * sheet.cellW, Math.floor(i / sheet.cols) * sheet.cellH)
        paint(g, i)
        g.restore()
    }
    g.generateTexture(sheet.key, sheet.cols * sheet.cellW, sheet.rows * sheet.cellH)
    g.destroy()
}

function bakeOne(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

export function ensureArt(scene: Phaser.Scene) {
    bakeOne(scene, BG, W, H, yard)
    bakeSheet(scene, CAR_SHEET, (g, i) => car(g, CAR_SHEET.cellW / 2, CAR_SHEET.cellH / 2, CAR_BODY[i]))
    bakeSheet(scene, CONTROL_SHEET, (g, i) => CONTROL_PAINT[i]?.(g, CONTROL_SHEET.cellW / 2, CONTROL_SHEET.cellH / 2))
    bakeSheet(scene, PIECES_SHEET, (g, i) => PIECE_PAINT[i]?.(g, PIECES_SHEET.cellW / 2, PIECES_SHEET.cellH / 2))
}

// ───────────────────────────────────────────── primitivas

function disc(g: G, x: number, y: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeCircle(x, y, r)
    }
}

function box(g: G, x: number, y: number, w: number, h: number, r: Radius, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function poly(g: G, pts: P[], fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillPoints(pts, true)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokePoints(pts, true)
    }
}

function sparkle(g: G, x: number, y: number, s: number) {
    g.fillStyle(0xffffff, 1)
    g.fillRect(x - s, y - s / 4, s * 2, s / 2)
    g.fillRect(x - s / 4, y - s, s / 2, s * 2)
}

function star(g: G, x: number, y: number, r: number, fill: number) {
    const pts: P[] = []
    for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5
        const rr = k % 2 ? r * 0.45 : r
        pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr })
    }
    poly(g, pts, fill, 4)
}

function arrow(g: G, x: number, y: number, s: number, dir: 1 | -1, fill: number) {
    poly(
        g,
        [
            { x, y: y - 46 * s * dir },
            { x: x + 38 * s, y: y - 6 * s * dir },
            { x: x + 14 * s, y: y - 6 * s * dir },
            { x: x + 14 * s, y: y + 40 * s * dir },
            { x: x - 14 * s, y: y + 40 * s * dir },
            { x: x - 14 * s, y: y - 6 * s * dir },
            { x: x - 38 * s, y: y - 6 * s * dir },
        ],
        fill,
        0,
    )
}

// ───────────────────────────────────────────── o pátio

function tree(g: G, x: number, y: number, r: number) {
    g.fillStyle(0x7fc48f, 1)
    g.fillCircle(x + 6, y + 8, r)
    disc(g, x, y, r, 0x9ddcaa, 4)
    disc(g, x - r * 0.35, y - r * 0.3, r * 0.45, 0xb5e8bf, 0)
}

function yard(g: G) {
    g.fillStyle(0xbfe3b4, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(0xe9dcc6, 1)
    g.fillRect(0, 0, W, 86)
    g.lineStyle(2, 0xd6c6aa, 1)
    for (let x = 0; x < W; x += 40) g.lineBetween(x, 0, x, 86)
    g.lineBetween(0, 43, W, 43)
    ;[
        [70, 330, 40],
        [180, 400, 34],
        [1150, 160, 38],
        [1240, 250, 30],
    ].forEach(([x, y, r]) => tree(g, x, y, r))
    ;[
        [60, 140],
        [210, 300],
        [1110, 300],
    ].forEach(([x, y]) => {
        g.fillStyle(0xffffff, 1)
        g.fillCircle(x, y, 5)
        g.fillStyle(0xffd23f, 1)
        g.fillCircle(x, y, 2.5)
    })

    box(g, YARD.x - 14, YARD.y - 14, YARD.w + 28, YARD.h + 40, 34, 0xf3e6cc, 5)
    g.fillStyle(0xc7cdd8, 1)
    g.fillRoundedRect(YARD.x, YARD.y, YARD.w, YARD.h + 30, 24)
    g.fillStyle(0xbcc3cf, 0.6)
    for (let k = 0; k < 140; k++) {
        const x = YARD.x + ((k * 97) % YARD.w)
        const y = YARD.y + ((k * 53) % YARD.h)
        g.fillCircle(x, y, 2)
    }

    const gx = GATE.x
    g.fillStyle(0xc7cdd8, 1)
    g.fillRect(gx - 60, YARD.y + YARD.h - 10, 120, H)
    box(g, gx + 66, H - 64, 18, 18, 4, 0xffffff, 3)
    g.lineStyle(10, INK, 1)
    g.lineBetween(gx + 75, H - 60, gx + 75, H - 180)
    g.lineStyle(6, 0xff6f6f, 1)
    g.lineBetween(gx + 75, H - 60, gx + 75, H - 180)
    g.lineStyle(6, 0xffffff, 1)
    for (let y = H - 160; y > H - 180; y -= 30) g.lineBetween(gx + 75, y, gx + 75, y - 12)
}

// ───────────────────────────────────────────── carros

const CAR_BODY = [0xff8a7a, 0x7cc4f2, 0xffd84d, 0x8fdcc4, 0xc4b2ee, 0xffaa5c]

function car(g: G, x: number, y: number, body: number) {
    const w = 120
    const h = 210
    ;[-1, 1].forEach(side =>
        [-1, 1].forEach(end => box(g, x + side * (w / 2 - 6) - 12, y + end * 58 - 22, 24, 44, 8, 0x3d3a48, 3)),
    )
    box(g, x - w / 2, y - h / 2, w, h, { tl: 46, tr: 46, bl: 32, br: 32 }, body)
    box(g, x - w / 2 + 16, y - 46, w - 32, 44, { tl: 18, tr: 18, bl: 6, br: 6 }, 0xbfe8ff, 4)
    box(g, x - w / 2 + 18, y + 40, w - 36, 34, { tl: 6, tr: 6, bl: 14, br: 14 }, 0xbfe8ff, 4)
    box(g, x - w / 2 + 14, y - 4, w - 28, 46, 10, body, 3)
    g.fillStyle(0xffffff, 0.5)
    g.fillRoundedRect(x - w / 2 + 22, y - 2, 18, 38, 8)
    disc(g, x - 34, y - h / 2 + 14, 11, 0xfff3a0, 3)
    disc(g, x + 34, y - h / 2 + 14, 11, 0xfff3a0, 3)
    box(g, x - 46, y + h / 2 - 14, 22, 10, 4, 0xff6f6f, 2)
    box(g, x + 24, y + h / 2 - 14, 22, 10, 4, 0xff6f6f, 2)
    sparkle(g, x - 30, y - 34, 6)
}

// ───────────────────────────────────────────── controles

function wheel(g: G, x: number, y: number) {
    const r = 140
    g.lineStyle(34, INK, 1)
    g.strokeCircle(x, y, r)
    g.lineStyle(24, 0x6b6f85, 1)
    g.strokeCircle(x, y, r)
    g.lineStyle(6, 0x8f93a8, 1)
    g.strokeCircle(x, y, r - 6)
    ;[
        [-Math.PI, 18],
        [0, 18],
        [Math.PI / 2, 30],
    ].forEach(([a, wdt]) => {
        g.lineStyle(wdt + 8, INK, 1)
        g.lineBetween(x, y, x + Math.cos(a) * (r - 10), y + Math.sin(a) * (r - 10))
        g.lineStyle(wdt, 0x6b6f85, 1)
        g.lineBetween(x, y, x + Math.cos(a) * (r - 10), y + Math.sin(a) * (r - 10))
    })
    disc(g, x, y, 46, 0x8f93a8)
    disc(g, x, y, 26, 0xff8a7a, 4)
    disc(g, x, y - r, 12, 0xffd23f, 4)
}

function pedal(g: G, x: number, y: number, fill: number, dir: 1 | -1, pressed: boolean) {
    const h = pressed ? 230 : 270
    const top = y - 135 + (pressed ? 40 : 0)
    box(g, x - 90, top + 10, 180, h, 36, 0x3d3a48, 0)
    box(g, x - 90, top, 180, h, 36, pressed ? Phaser.Display.Color.ValueToColor(fill).darken(14).color : fill)
    g.lineStyle(4, 0xffffff, 0.35)
    for (let k = 1; k < 5; k++) g.lineBetween(x - 70, top + (k * h) / 5, x + 70, top + (k * h) / 5)
    arrow(g, x, top + h / 2, 1.3, dir, 0xffffff)
}

const CONTROL_PAINT: Array<(g: G, x: number, y: number) => void> = [
    (g, x, y) => wheel(g, x, y),
    (g, x, y) => pedal(g, x, y, 0x8fdcc4, 1, false),
    (g, x, y) => pedal(g, x, y, 0xffb36b, -1, false),
    (g, x, y) => {
        disc(g, x, y + 8, 126, 0x2f6fb3, 0)
        disc(g, x, y, 126, 0x4a9be6)
        g.lineStyle(26, 0xffffff, 1)
        g.lineBetween(x - 34, y - 70, x - 34, y + 72)
        g.beginPath()
        g.arc(x - 4, y - 28, 42, -Math.PI / 2, Math.PI / 2)
        g.strokePath()
        g.lineBetween(x - 34, y - 70, x - 4, y - 70)
        g.lineBetween(x - 34, y + 14, x - 4, y + 14)
        sparkle(g, x - 70, y - 60, 10)
    },
    (g, x, y) => pedal(g, x, y, 0x8fdcc4, 1, true),
    (g, x, y) => pedal(g, x, y, 0xffb36b, -1, true),
]

// ───────────────────────────────────────────── peças

const PIECE_PAINT: Array<(g: G, x: number, y: number) => void> = [
    (g, x, y) => {
        box(g, x - 80, y + 60, 160, 30, 10, 0xff8a3d)
        poly(g, [{ x: x - 56, y: y + 64 }, { x: x - 14, y: y - 90 }, { x: x + 14, y: y - 90 }, { x: x + 56, y: y + 64 }], 0xff8a3d)
        poly(g, [{ x: x - 38, y: y }, { x: x + 38, y: y }, { x: x + 30, y: y - 28 }, { x: x - 30, y: y - 28 }], 0xffffff, 3)
    },
    (g, x, y) => {
        box(g, x - 70, y - 100, 140, 200, 14, 0xfff6e4)
        g.fillStyle(INK, 0.4)
        for (let yy = y - 84; yy < y + 90; yy += 14) g.fillCircle(x + 70, yy, 3)
        disc(g, x, y - 76, 9, 0xbcc3cf, 3)
    },
    (g, x, y) => {
        ;[
            [-40, 10, 40],
            [20, -10, 48],
            [40, 30, 36],
            [-10, 40, 34],
        ].forEach(([dx, dy, r]) => disc(g, x + dx, y + dy, r, 0xffffff, 4))
        star(g, x - 70, y - 50, 16, 0xffd23f)
        star(g, x + 76, y - 40, 14, 0xffd23f)
        star(g, x + 4, y - 74, 12, 0xffd23f)
    },
    (g, x, y) => star(g, x, y, 100, 0xffd23f),
    (g, x, y) => {
        disc(g, x - 70, y, 12, INK, 0)
        g.lineStyle(10, 0xffd23f, 1)
        ;[40, 70, 100].forEach(r => {
            g.beginPath()
            g.arc(x - 70, y, r, -0.6, 0.6)
            g.strokePath()
        })
    },
    (g, x, y) => {
        g.fillStyle(0xfff3a0, 0.85)
        g.fillTriangle(x - 90, y, x + 90, y - 100, x + 90, y + 100)
        g.fillStyle(0xffffff, 0.6)
        g.fillTriangle(x - 90, y, x + 60, y - 40, x + 60, y + 40)
    },
    (g, x, y) => {
        box(g, x - 34, y + 30, 28, 60, 10, 0x4a6fa5, 4)
        box(g, x + 6, y + 30, 28, 60, 10, 0x4a6fa5, 4)
        box(g, x - 48, y - 30, 96, 74, 26, 0xffd84d)
        g.lineStyle(22, INK, 1)
        g.lineBetween(x + 40, y - 20, x + 80, y - 74)
        g.lineStyle(14, 0xd9a47a, 1)
        g.lineBetween(x + 40, y - 20, x + 80, y - 74)
        disc(g, x, y - 76, 52, 0xd9a47a)
        box(g, x - 54, y - 136, 108, 46, { tl: 40, tr: 40, bl: 0, br: 0 }, 0x4a9be6, 4)
        box(g, x - 10, y - 98, 74, 14, 6, 0x4a9be6, 4)
        g.lineStyle(5, INK, 1)
        g.beginPath()
        g.arc(x - 18, y - 72, 8, Math.PI * 1.1, Math.PI * 1.9)
        g.strokePath()
        g.beginPath()
        g.arc(x + 18, y - 72, 8, Math.PI * 1.1, Math.PI * 1.9)
        g.strokePath()
        g.fillStyle(0xd96a7a, 1)
        g.fillEllipse(x, y - 52, 20, 14)
    },
    (g, x, y) => arrow(g, x, y, 1.8, 1, 0xffffff),
]
