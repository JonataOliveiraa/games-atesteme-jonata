import Phaser from 'phaser'
import { DEVICE_SHEET, PIECE_SHEET, PISTA_SHEET, UI1_SHEET, UI2_SHEET, type Sheet } from '../data/files'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics
type P = Phaser.Types.Math.Vector2Like
const LINE = 5

export const STATIC = 'cabo-chiado'

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
    bakeSheet(scene, PISTA_SHEET, (g, i) => PISTA_PAINT[i]?.(g))
    bakeSheet(scene, DEVICE_SHEET, (g, i) => {
        g.scaleCanvas(DEVICE_SHEET.cellW / 640, DEVICE_SHEET.cellH / 560)
        DEVICE_PAINT[i]?.(g)
    })
    bakeSheet(scene, PIECE_SHEET, (g, i) => PIECE_PAINT[i]?.(g))
    bakeSheet(scene, UI1_SHEET, (g, i) => UI1_PAINT[i]?.(g))
    bakeSheet(scene, UI2_SHEET, g => box(g, 10, 12, 1024, 316, 70, C.paper, 8))
    bakeOne(scene, STATIC, 160, 120, g => {
        const rnd = seeded(7)
        g.fillStyle(C.screenStatic, 1)
        g.fillRect(0, 0, 160, 120)
        for (let i = 0; i < 900; i++) {
            const tone = [0xffffff, 0xb8b2c8, 0x8e88a0, 0xece8f4][Math.floor(rnd() * 4)]
            g.fillStyle(tone, 1)
            g.fillRect(Math.floor(rnd() * 160), Math.floor(rnd() * 120), 3, 2)
        }
    })
}

function seeded(seed: number) {
    let s = seed
    return () => {
        s = (s * 9301 + 49297) % 233280
        return s / 233280
    }
}

function disc(g: G, x: number, y: number, r: number, fill: number, line = LINE, alpha = 1) {
    g.fillStyle(fill, alpha)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeCircle(x, y, r)
    }
}

function box(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function poly(g: G, pts: P[], fill: number, line = LINE, alpha = 1) {
    g.fillStyle(fill, alpha)
    g.fillPoints(pts, true)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokePoints(pts, true)
    }
}

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE, alpha = 1) {
    g.fillStyle(fill, alpha)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

function sparkle(g: G, x: number, y: number, s: number) {
    g.fillStyle(C.white, 1)
    g.fillRect(x - s, y - s / 4, s * 2, s / 2)
    g.fillRect(x - s / 4, y - s, s / 2, s * 2)
}

// ───────────────────────────────────────────── o tubo (visto de lado)

const TUBE_TOP = 105
const TUBE_H = 150
const RIM = 13

function glow(g: G, color: number, r = 120) {
    ;[
        [1, 0.12],
        [0.82, 0.2],
        [0.64, 0.34],
        [0.46, 0.55],
        [0.3, 0.85],
    ].forEach(([k, a]) => {
        g.fillStyle(color, a)
        g.fillCircle(180, 180, r * k)
    })
    g.fillStyle(C.white, 0.75)
    g.fillCircle(180, 180, r * 0.16)
}

const PISTA_PAINT: Array<(g: G) => void> = [
    g => {
        const y0 = TUBE_TOP
        const y1 = TUBE_TOP + TUBE_H
        g.fillStyle(C.cableInner, 1)
        g.fillRect(0, y0, 360, TUBE_H)
        g.fillStyle(C.cableEdge, 1)
        g.fillRect(0, y0, 360, RIM)
        g.fillRect(0, y1 - RIM, 360, RIM)
        g.fillStyle(C.white, 0.6)
        g.fillRect(0, y0 + RIM + 6, 360, 7)
        g.fillStyle(C.cableDark, 0.18)
        g.fillRect(0, y1 - RIM - 16, 360, 16)
        g.fillStyle(C.laneLine, 1)
        for (let x = 15; x < 360; x += 60) g.fillRoundedRect(x, 180 - 3, 30, 6, 3)
        g.lineStyle(4, C.ink, 1)
        g.lineBetween(0, y0 + 2, 360, y0 + 2)
        g.lineBetween(0, y1 - 2, 360, y1 - 2)
    },
    g => {
        box(g, 112, 92, 34, 176, 10, C.cableDark)
        box(g, 146, 118, 104, 124, 22, C.metal)
        g.fillStyle(C.metalDark, 1)
        g.fillRoundedRect(156, 132, 84, 14, 7)
        g.fillRoundedRect(156, 214, 84, 14, 7)
        ;[138, 164, 190, 216].forEach(y => box(g, 248, y - 9, 18, 18, 4, C.gold, 3))
        sparkle(g, 176, 160, 7)
    },
    g => {
        const x0 = 146
        const w = 68
        const rail = 9
        const open = (y: number) => {
            g.fillStyle(C.post, 1)
            g.fillRect(x0, y, rail, 56)
            g.fillRect(x0 + w - rail, y, rail, 56)
            g.lineStyle(4, C.ink, 1)
            g.strokeRect(x0, y, rail, 56)
            g.strokeRect(x0 + w - rail, y, rail, 56)
        }
        open(112)
        open(192)
        box(g, x0 - 4, 78, w + 8, 36, 14, C.post)
        box(g, x0 - 4, 246, w + 8, 36, 14, C.post)
        box(g, x0, 166, w, 28, 12, C.lilac)
        disc(g, 180, 96, 10, C.lampOff, 3)
        disc(g, 180, 264, 10, C.lampOff, 3)
    },
    g => glow(g, C.one),
    g => glow(g, C.zero),
    g => {
        glow(g, C.one, 70)
        g.fillStyle(C.white, 1)
        g.fillCircle(180, 180, 16)
    },
]

// ───────────────────────────────────────────── os dois computadores, cada um na sua mesa

function desk(g: G) {
    box(g, 90, 474, 36, 84, 8, C.deskDark, 4)
    box(g, 514, 474, 36, 84, 8, C.deskDark, 4)
    box(g, 60, 440, 520, 38, 12, C.desk, 5)
}

const DEVICE_PAINT: Array<(g: G) => void> = [
    g => {
        desk(g)
        poly(g, [{ x: 150, y: 372 }, { x: 490, y: 372 }, { x: 520, y: 440 }, { x: 120, y: 440 }], C.laptopDark, 5)
        g.fillStyle(C.cream, 1)
        for (let row = 0; row < 2; row++)
            for (let k = 0; k < 9; k++) g.fillRoundedRect(168 + k * 34 - row * 6, 384 + row * 22, 26, 14, 4)
        box(g, 170, 120, 300, 252, 24, C.laptop, 6)
        box(g, 190, 140, 260, 210, 12, C.screen, 4)
        box(g, 496, 392, 24, 24, 6, C.slot, 3)
        sparkle(g, 214, 166, 7)
    },
    g => {
        desk(g)
        box(g, 285, 376, 70, 60, 8, C.monitorDark, 4)
        box(g, 230, 420, 180, 18, 8, C.monitorDark, 4)
        box(g, 70, 20, 500, 360, 30, C.monitor, 6)
        box(g, 100, 48, 440, 304, 16, C.screen, 4)
        box(g, 52, 184, 30, 32, 8, C.slot, 4)
        sparkle(g, 140, 80, 9)
    },
]

// ───────────────────────────────────────────── peças

function car(g: G, braking: boolean) {
    box(g, 34, 108, 22, 30, 6, C.carDark, 4)
    oval(g, 128, 126, 86, 46, C.canopy, 4)
    g.fillStyle(C.white, 0.8)
    g.fillEllipse(112, 116, 26, 10)
    box(g, 40, 128, 182, 42, 20, C.carBody, 5)
    g.fillStyle(C.carStripe, 1)
    g.fillRect(48, 144, 166, 9)
    disc(g, 82, 172, 18, C.tire, 4)
    disc(g, 178, 172, 18, C.tire, 4)
    disc(g, 82, 172, 7, C.metal, 0)
    disc(g, 178, 172, 7, C.metal, 0)
    disc(g, 214, 142, 7, 0xfff3b0, 3)
    if (braking) {
        g.fillStyle(C.brake, 0.45)
        g.fillCircle(42, 142, 16)
        disc(g, 44, 142, 7, C.brake, 3)
    }
}

function heartPoints(cx: number, cy: number, s: number): P[] {
    const pts: P[] = []
    for (let i = 0; i < 64; i++) {
        const t = (i / 64) * Math.PI * 2
        const x = 16 * Math.pow(Math.sin(t), 3)
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
        pts.push({ x: cx + x * s, y: cy - y * s })
    }
    return pts
}

function starPoints(cx: number, cy: number, outer: number, inner: number): P[] {
    const pts: P[] = []
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        const r = i % 2 ? inner : outer
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
    }
    return pts
}

const PIECE_PAINT: Array<(g: G) => void> = [
    g => car(g, false),
    g => car(g, true),
    g => {
        poly(g, [{ x: 36, y: 128 }, { x: 140, y: 92 }, { x: 206, y: 106 }, { x: 222, y: 128 }, { x: 206, y: 150 }, { x: 140, y: 164 }], C.flame, 4)
        poly(g, [{ x: 92, y: 128 }, { x: 160, y: 110 }, { x: 196, y: 118 }, { x: 204, y: 128 }, { x: 196, y: 138 }, { x: 160, y: 146 }], C.flameCore, 0)
    },
    g => {
        poly(
            g,
            [
                { x: 128, y: 24 },
                { x: 148, y: 108 },
                { x: 232, y: 128 },
                { x: 148, y: 148 },
                { x: 128, y: 232 },
                { x: 108, y: 148 },
                { x: 24, y: 128 },
                { x: 108, y: 108 },
            ],
            C.white,
            4,
        )
        disc(g, 128, 128, 18, C.one, 0)
    },
    g => {
        poly(g, starPoints(128, 136, 104, 46), C.star, 6)
        g.fillStyle(C.starDark, 0.45)
        g.fillPoints(
            [
                { x: 128, y: 136 },
                { x: 128 + 46 * Math.cos(Math.PI * 0.3), y: 136 + 46 * Math.sin(Math.PI * 0.3) },
                { x: 128, y: 136 + 104 * 0.82 },
                { x: 128 - 46 * Math.cos(Math.PI * 0.3), y: 136 + 46 * Math.sin(Math.PI * 0.3) },
            ],
            true,
        )
        sparkle(g, 100, 104, 9)
    },
    g => {
        poly(g, heartPoints(128, 124, 6.2), C.heart, 6)
        g.fillStyle(C.heartDark, 0.4)
        g.fillEllipse(160, 170, 50, 30)
        g.fillStyle(C.white, 0.85)
        g.fillEllipse(84, 92, 30, 18)
    },
    g => {
        for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2
            const b = a + 0.18
            const c = a - 0.18
            poly(
                g,
                [
                    { x: 128 + Math.cos(c) * 70, y: 128 + Math.sin(c) * 70 },
                    { x: 128 + Math.cos(a) * 114, y: 128 + Math.sin(a) * 114 },
                    { x: 128 + Math.cos(b) * 70, y: 128 + Math.sin(b) * 70 },
                ],
                C.star,
                4,
            )
        }
        disc(g, 128, 128, 70, C.sun, 6)
        g.fillStyle(C.sunDark, 0.35)
        g.fillCircle(146, 146, 40)
        g.fillStyle(C.white, 0.7)
        g.fillEllipse(104, 98, 30, 18)
    },
    g => {
        poly(g, [{ x: 112, y: 176 }, { x: 144, y: 176 }, { x: 128, y: 232 }], C.flame, 4)
        poly(g, [{ x: 96, y: 128 }, { x: 64, y: 182 }, { x: 64, y: 208 }, { x: 98, y: 184 }], C.rocketFin, 5)
        poly(g, [{ x: 160, y: 128 }, { x: 192, y: 182 }, { x: 192, y: 208 }, { x: 158, y: 184 }], C.rocketFin, 5)
        poly(
            g,
            [
                { x: 128, y: 22 },
                { x: 150, y: 46 },
                { x: 164, y: 90 },
                { x: 164, y: 180 },
                { x: 92, y: 180 },
                { x: 92, y: 90 },
                { x: 106, y: 46 },
            ],
            C.rocket,
            5,
        )
        disc(g, 128, 104, 20, C.rocketFin, 5)
        g.fillStyle(C.white, 0.9)
        g.fillCircle(121, 97, 6)
        g.fillStyle(C.rocketFin, 1)
        g.fillRect(96, 150, 64, 10)
    },
]

// ───────────────────────────────────────────── interface

function button(g: G, color: number, dark: number) {
    disc(g, 175, 185, 158, dark, 7)
    disc(g, 175, 168, 146, color, 6)
    g.fillStyle(C.white, 0.45)
    g.fillEllipse(125, 100, 110, 44)
    sparkle(g, 92, 112, 12)
}

/** ui1: botão 1, botão 0, caixinha, painel, cartão (células de 350) */
const UI1_PAINT: Array<(g: G) => void> = [
    g => button(g, C.one, C.oneDark),
    g => button(g, C.zero, C.zeroDark),
    g => {
        box(g, 22, 40, 312, 280, 52, C.slot, 7)
        g.lineStyle(7, C.slotRim, 1)
        g.strokeRoundedRect(38, 56, 280, 248, 40)
    },
    g => {
        box(g, 88, 9, 184, 336, 56, C.cream, 7)
        g.lineStyle(6, C.lilac, 1)
        g.strokeRoundedRect(102, 23, 156, 308, 44)
    },
    g => {
        box(g, 6, 96, 340, 164, 46, C.paper, 7)
        g.lineStyle(6, C.lilac, 1)
        g.strokeRoundedRect(20, 110, 312, 136, 36)
    },
]
