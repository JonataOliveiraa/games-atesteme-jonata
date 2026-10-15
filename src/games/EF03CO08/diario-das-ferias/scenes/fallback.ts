import Phaser from 'phaser'
import { BG_BEACH, BG_STAGE, DUDA_SHEET, NOTE, THINGS_SHEET, UI_SHEET, type Sheet } from '../data/files'
import { H, W, WORLD } from '../data/layout'
import { C } from '../data/theme'
import type { DudaPose } from '../types'

export type G = Phaser.GameObjects.Graphics
export type P = { x: number; y: number }
const INK = C.ink
const LINE = 4

export function bakeSheet(scene: Phaser.Scene, sheet: Sheet, paint: (g: G, i: number) => void) {
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

export function bakeOne(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

const POSES: DudaPose[] = ['smile', 'talk', 'cheer', 'oops', 'present', 'bow']

export function ensureArt(scene: Phaser.Scene) {
    bakeOne(scene, BG_BEACH, WORLD.w, H, beach)
    bakeOne(scene, BG_STAGE, W, H, stage)
    bakeOne(scene, NOTE, 48, 64, note)
    bakeSheet(scene, THINGS_SHEET, thing)
    bakeSheet(scene, UI_SHEET, ui)
    bakeSheet(scene, DUDA_SHEET, (g, i) => duda(g, POSES[i]))
}

// ───────────────────────────────────────────── primitivas

export function disc(g: G, x: number, y: number, r: number, fill: number, line = LINE, ink: number = INK) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, ink, 1)
        g.strokeCircle(x, y, r)
    }
}

export function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE, ink: number = INK) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, ink, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

export function box(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = LINE, ink: number = INK) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, ink, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

export function poly(g: G, points: P[], fill: number, line = LINE, ink: number = INK) {
    g.fillStyle(fill, 1)
    g.fillPoints(points, true)
    if (line > 0) {
        g.lineStyle(line, ink, 1)
        g.strokePoints(points, true)
    }
}

export function limb(g: G, a: P, b: P, width: number, fill: number) {
    g.lineStyle(width + 7, INK, 1)
    g.lineBetween(a.x, a.y, b.x, b.y)
    g.fillStyle(INK, 1)
    g.fillCircle(a.x, a.y, (width + 7) / 2)
    g.fillCircle(b.x, b.y, (width + 7) / 2)
    g.lineStyle(width, fill, 1)
    g.lineBetween(a.x, a.y, b.x, b.y)
    g.fillStyle(fill, 1)
    g.fillCircle(a.x, a.y, width / 2)
    g.fillCircle(b.x, b.y, width / 2)
}

/** corpo que segue uma curva, mais grosso no meio: golfinho, onda */
function curvedBody(g: G, curve: (t: number) => P, thick: (t: number) => number, fill: number) {
    const top: P[] = []
    const bottom: P[] = []
    const steps = 28
    for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const p = curve(t)
        const q = curve(Math.min(1, t + 0.01))
        const o = curve(Math.max(0, t - 0.01))
        const dx = q.x - o.x
        const dy = q.y - o.y
        const len = Math.hypot(dx, dy) || 1
        const nx = -dy / len
        const ny = dx / len
        const r = thick(t)
        top.push({ x: p.x + nx * r, y: p.y + ny * r })
        bottom.push({ x: p.x - nx * r, y: p.y - ny * r })
    }
    poly(g, [...top, ...bottom.reverse()], fill)
}

export function cloud(g: G, x: number, y: number, w: number) {
    g.fillStyle(C.cloud, 1)
    g.fillEllipse(x, y, w, w * 0.42)
    g.fillEllipse(x - w * 0.28, y + 6, w * 0.6, w * 0.34)
    g.fillEllipse(x + w * 0.3, y + 8, w * 0.55, w * 0.3)
}

function leaf(g: G, from: P, angle: number, len: number, fill: number) {
    const tip = { x: from.x + Math.cos(angle) * len, y: from.y + Math.sin(angle) * len }
    const mid = { x: (from.x + tip.x) / 2, y: (from.y + tip.y) / 2 }
    const nx = -Math.sin(angle)
    const ny = Math.cos(angle)
    const wide = len * 0.2
    const droop = len * 0.16
    poly(
        g,
        [
            from,
            { x: mid.x + nx * wide, y: mid.y + ny * wide + droop },
            tip,
            { x: mid.x - nx * wide * 0.6, y: mid.y - ny * wide * 0.6 + droop },
        ],
        fill,
        3,
        C.palmDark,
    )
}

// ───────────────────────────────────────────── a praia

function beach(g: G) {
    const horizon = 252
    const shore = 446
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, WORLD.w, horizon)
    g.fillStyle(C.skyLow, 1)
    g.fillRect(0, horizon - 70, WORLD.w, 70)
    cloud(g, 520, 78, 120)
    cloud(g, 1130, 64, 110)
    cloud(g, 400, 150, 70)

    g.fillStyle(C.seaDeep, 1)
    g.fillRect(0, horizon, WORLD.w, shore - horizon)
    g.fillStyle(C.sea, 1)
    g.fillRect(0, horizon + 40, WORLD.w, shore - horizon - 40)
    g.lineStyle(3, C.seaLine, 1)
    g.lineBetween(0, horizon, WORLD.w, horizon)
    ;[
        [80, 300, 70],
        [560, 330, 90],
        [840, 300, 70],
        [760, 390, 80],
        [180, 400, 70],
        [1040, 350, 60],
    ].forEach(([x, y, w]) => {
        g.lineStyle(4, C.seaLine, 1)
        g.beginPath()
        g.arc(x, y, w / 2, Math.PI * 1.15, Math.PI * 1.85)
        g.strokePath()
    })

    // a pedra no mar
    oval(g, 400, 388, 230, 40, C.foam, 0)
    poly(
        g,
        [
            { x: 320, y: 392 },
            { x: 332, y: 330 },
            { x: 372, y: 292 },
            { x: 430, y: 286 },
            { x: 472, y: 318 },
            { x: 486, y: 392 },
        ],
        C.rock,
    )
    g.fillStyle(C.rockDark, 1)
    g.fillPoints(
        [
            { x: 420, y: 392 },
            { x: 462, y: 330 },
            { x: 482, y: 392 },
        ],
        true,
    )
    oval(g, 400, 396, 210, 26, C.foam, 3, C.seaLine)

    // a areia
    g.fillStyle(C.sand, 1)
    g.fillRect(0, shore, WORLD.w, H - shore)
    g.fillStyle(C.foam, 1)
    for (let x = -40; x < WORLD.w + 40; x += 80) g.fillEllipse(x, shore, 110, 26)
    g.fillStyle(C.sandDark, 1)
    ;[
        [240, 600, 60],
        [820, 640, 70],
        [520, 690, 50],
        [1000, 560, 40],
    ].forEach(([x, y, w]) => g.fillEllipse(x, y, w, w * 0.25))

    // a toca do caranguejo
    oval(g, 600, 528, 64, 20, C.sandLine, 3, C.sandDark)
    oval(g, 600, 530, 44, 12, 0x8a6a48, 0)

    // a duna
    oval(g, 980, 486, 380, 200, C.sandDark, 0)
    poly(
        g,
        [
            { x: 790, y: 520 },
            { x: 860, y: 430 },
            { x: 940, y: 380 },
            { x: 1010, y: 372 },
            { x: 1090, y: 410 },
            { x: 1170, y: 520 },
        ],
        C.sand,
        4,
        C.sandLine,
    )
    g.lineStyle(4, C.palmDark, 1)
    ;[
        [930, 388, -0.5],
        [952, 380, -0.2],
        [1010, 374, 0.1],
        [1032, 378, 0.4],
        [1060, 392, 0.2],
    ].forEach(([x, y, a]) => g.lineBetween(x, y, x + Math.sin(a) * 30, y - 34))

    // a cabana fechada
    box(g, 1092, 262, 170, 196, 10, C.wood, LINE, C.woodDark)
    g.lineStyle(3, C.woodDark, 1)
    for (let y = 292; y < 452; y += 26) g.lineBetween(1096, y, 1258, y)
    poly(
        g,
        [
            { x: 1074, y: 270 },
            { x: 1177, y: 196 },
            { x: 1280, y: 270 },
        ],
        C.roof,
        LINE,
        C.coralDark,
    )
    box(g, 1112, 300, 80, 76, 8, C.woodDark, 3, C.trunkDark)
    box(g, 1116, 304, 34, 68, 4, C.peach, 3, C.trunkDark)
    box(g, 1154, 304, 34, 68, 4, C.peach, 3, C.trunkDark)
    g.lineStyle(3, C.peachDark, 1)
    for (let y = 316; y < 368; y += 12) {
        g.lineBetween(1120, y, 1146, y)
        g.lineBetween(1158, y, 1184, y)
    }
    box(g, 1208, 360, 42, 98, 6, C.peach, 3, C.trunkDark)
    disc(g, 1216, 410, 4, C.butter, 2, C.trunkDark)

    // o coqueiro, com a copa cheia
    const trunk: P[] = []
    for (let i = 0; i <= 10; i++) {
        const t = i / 10
        trunk.push({ x: 222 - t * 32 + Math.sin(t * Math.PI) * 26, y: 505 - t * 280 })
    }
    for (let i = 0; i < trunk.length - 1; i++) {
        const w = 34 - i * 1.4
        g.lineStyle(w + 8, C.trunkDark, 1)
        g.lineBetween(trunk[i].x, trunk[i].y, trunk[i + 1].x, trunk[i + 1].y)
    }
    for (let i = 0; i < trunk.length - 1; i++) {
        const w = 34 - i * 1.4
        g.lineStyle(w, C.trunk, 1)
        g.lineBetween(trunk[i].x, trunk[i].y, trunk[i + 1].x, trunk[i + 1].y)
        g.lineStyle(3, C.trunkDark, 1)
        g.lineBetween(trunk[i].x - w / 2, trunk[i].y, trunk[i].x + w / 2, trunk[i].y - 4)
    }
    const crown = { x: 190, y: 196 }
    for (let k = 0; k < 14; k++) leaf(g, crown, -Math.PI + (k / 13) * Math.PI * 1.25 - 0.1, 150, k % 2 ? C.palm : C.palmDark)
    oval(g, crown.x, crown.y, 250, 150, C.palm, 4, C.palmDark)
    ;[
        [130, 170, 90],
        [250, 175, 90],
        [190, 140, 100],
        [160, 225, 80],
        [225, 228, 80],
    ].forEach(([x, y, w]) => oval(g, x, y, w, w * 0.62, k(x) ? C.palm : 0x8fcf98, 3, C.palmDark))
    disc(g, 172, 252, 13, C.trunkDark, 3)
    disc(g, 198, 258, 13, C.trunk, 3)
}

const k = (x: number) => Math.round(x / 10) % 2 === 0

// ───────────────────────────────────────────── as coisas da praia

function thing(g: G, i: number) {
    const cx = 160
    if (i === 0) {
        const bands = [0xf7a7a7, 0xffc39a, 0xffe49a, 0xb6e6b0, 0xa6d8ef, 0xb7b8ee, 0xd7b6ea]
        bands.forEach((tone, b) => {
            g.lineStyle(13, tone, 1)
            g.beginPath()
            g.arc(cx, 262, 140 - b * 12, Math.PI, 0)
            g.strokePath()
        })
        g.lineStyle(3, 0xd08a8a, 1)
        g.beginPath()
        g.arc(cx, 262, 147, Math.PI, 0)
        g.strokePath()
        cloud(g, 34, 260, 80)
        cloud(g, 286, 260, 80)
        return
    }
    if (i === 1 || i === 2) {
        const scared = i === 2
        g.lineStyle(6, C.coralDark, 1)
        for (let s = -1; s <= 1; s += 2)
            for (let l = 0; l < 3; l++) {
                const x = cx + s * (40 + l * 16)
                g.lineBetween(x, 205, x + s * 26, 238 + (l % 2) * 6)
            }
        const clawY = scared ? 108 : 168
        ;[-1, 1].forEach(s => {
            limb(g, { x: cx + s * 62, y: 190 }, { x: cx + s * 96, y: clawY + 20 }, 10, C.coral)
            disc(g, cx + s * 100, clawY, 26, C.coral)
            g.fillStyle(C.sand, 1)
            g.fillTriangle(cx + s * 100, clawY, cx + s * 130, clawY - 18, cx + s * 128, clawY + 8)
        })
        oval(g, cx, 196, 150, 96, C.coral)
        oval(g, cx, 210, 100, 40, 0xf9bcae, 0)
        ;[-1, 1].forEach(s => {
            g.lineStyle(6, C.coralDark, 1)
            g.lineBetween(cx + s * 20, 160, cx + s * 26, 120)
            const r = scared ? 15 : 11
            disc(g, cx + s * 26, 116, r, C.white, 3)
            disc(g, cx + s * 26, 118, scared ? 5 : 6, INK, 0)
        })
        g.lineStyle(4, INK, 1)
        if (scared) oval(g, cx, 214, 18, 22, INK, 0)
        else {
            g.beginPath()
            g.arc(cx, 204, 14, 0.3, Math.PI - 0.3)
            g.strokePath()
        }
        oval(g, cx - 40, 210, 16, 9, C.cheek, 0)
        oval(g, cx + 40, 210, 16, 9, C.cheek, 0)
        return
    }
    if (i === 3) {
        const arc = (t: number) => ({ x: 40 + t * 240, y: 210 - Math.sin(t * Math.PI) * 130 })
        poly(
            g,
            [
                { x: 50, y: 214 },
                { x: 20, y: 196 },
                { x: 24, y: 248 },
            ],
            C.dolphin,
        )
        curvedBody(g, arc, t => 8 + Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.7) * 38, C.dolphin)
        poly(
            g,
            [
                { x: 150, y: 90 },
                { x: 176, y: 44 },
                { x: 188, y: 92 },
            ],
            C.dolphinDark,
        )
        poly(
            g,
            [
                { x: 250, y: 150 },
                { x: 296, y: 170 },
                { x: 252, y: 176 },
            ],
            C.dolphin,
        )
        disc(g, 238, 128, 6, INK, 0)
        disc(g, 240, 126, 2, C.white, 0)
        oval(g, 226, 146, 16, 9, C.cheek, 0)
        ;[
            [30, 270, 8],
            [60, 290, 6],
            [14, 300, 5],
        ].forEach(([x, y, r]) => disc(g, x, y, r, 0xd8f2f2, 2, C.dolphinDark))
        return
    }
    if (i === 4) {
        oval(g, cx, 250, 220, 50, C.sea, 3, C.dolphinDark)
        curvedBody(g, t => ({ x: 170 - t * 50, y: 240 - t * 150 }), t => 6 + (1 - t) * 30, C.dolphin)
        poly(
            g,
            [
                { x: 120, y: 92 },
                { x: 80, y: 64 },
                { x: 96, y: 100 },
                { x: 150, y: 70 },
            ],
            C.dolphinDark,
        )
        splashCrown(g, cx, 250, 0.8)
        return
    }
    if (i === 5) {
        splashCrown(g, cx, 240, 1.2)
        return
    }
    if (i === 6) {
        const base = 262
        oval(g, cx, base, 250, 40, C.sandDark, 0)
        box(g, 60, 170, 200, 92, 10, C.sand, LINE, C.sandLine)
        ;[
            [70, 110, 50],
            [135, 80, 50],
            [200, 110, 50],
        ].forEach(([x, y, w]) => {
            box(g, x, y, w, base - 92 - y + 2, 6, C.sand, LINE, C.sandLine)
            for (let c = 0; c < 3; c++) box(g, x - 4 + c * 20, y - 16, 14, 18, 3, C.sand, 3, C.sandLine)
        })
        box(g, 140, 210, 40, 52, 18, C.sandLine, 3, C.sandDark)
        disc(g, 95, 140, 7, C.sandLine, 0)
        disc(g, 225, 140, 7, C.sandLine, 0)
        g.lineStyle(4, C.trunkDark, 1)
        g.lineBetween(160, 64, 160, 18)
        poly(
            g,
            [
                { x: 160, y: 18 },
                { x: 204, y: 30 },
                { x: 160, y: 44 },
            ],
            C.coral,
            3,
            C.coralDark,
        )
        return
    }
    if (i === 7) {
        const curl = (t: number) => ({ x: 40 + t * 220, y: 270 - Math.sin(t * Math.PI * 0.85) * 170 })
        curvedBody(g, curl, t => 18 + Math.sin(t * Math.PI) * 26, 0xbfe8e0)
        ;[
            [230, 110, 30],
            [262, 132, 24],
            [200, 96, 22],
            [250, 84, 18],
            [178, 120, 18],
            [280, 160, 16],
        ].forEach(([x, y, r]) => disc(g, x, y, r, C.foam, 3, C.seaLine))
        oval(g, cx, 278, 280, 34, C.foam, 3, C.seaLine)
    }
}

function splashCrown(g: G, x: number, y: number, s: number) {
    ;[-3, -2, -1, 0, 1, 2, 3].forEach(n => {
        const h = (90 - Math.abs(n) * 18) * s
        poly(
            g,
            [
                { x: x + n * 24 * s - 12 * s, y },
                { x: x + n * 34 * s, y: y - h },
                { x: x + n * 24 * s + 12 * s, y },
            ],
            C.foam,
            3,
            C.seaLine,
        )
        disc(g, x + n * 38 * s, y - h - 22 * s, 8 * s, C.foam, 2, C.seaLine)
    })
    oval(g, x, y, 200 * s, 30 * s, C.foam, 3, C.seaLine)
}

// ───────────────────────────────────────────── controles

function ui(g: G, i: number) {
    const cx = 128
    const cy = 128
    if (i === 0 || i === 1) {
        const tone = i === 0 ? C.peach : C.mint
        const dark = i === 0 ? C.peachDark : C.mintDark
        box(g, 20, 26, 216, 210, 46, dark, 0)
        box(g, 20, 18, 216, 210, 46, tone, 5, dark)
        g.fillStyle(C.white, 0.45)
        g.fillRoundedRect(40, 30, 176, 40, 20)
        if (i === 0) {
            box(g, 62, 86, 132, 92, 18, C.cream, LINE)
            box(g, 82, 70, 42, 22, 8, C.cream, LINE)
            disc(g, cx, 132, 34, 0x9fb8d6, LINE)
            disc(g, cx, 132, 18, 0x6f86a8, 3)
            disc(g, cx - 8, 124, 6, C.white, 0)
            disc(g, 176, 104, 7, C.butter, 3)
        } else {
            box(g, cx - 14, 150, 28, 52, 10, C.cream, LINE)
            g.lineStyle(6, INK, 1)
            g.beginPath()
            g.arc(cx, 128, 50, 0.15 * Math.PI, 0.85 * Math.PI)
            g.strokePath()
            disc(g, cx, 104, 44, 0xd9dde8, LINE)
            g.lineStyle(3, 0x9aa1b3, 1)
            for (let d = -30; d <= 30; d += 15) {
                g.lineBetween(cx + d, 104 - Math.sqrt(1600 - d * d), cx + d, 104 + Math.sqrt(1600 - d * d))
                g.lineBetween(cx - Math.sqrt(1600 - d * d), 104 + d, cx + Math.sqrt(1600 - d * d), 104 + d)
            }
            g.lineStyle(LINE, INK, 1)
            g.strokeCircle(cx, 104, 44)
        }
        return
    }
    if (i === 2) {
        g.fillStyle(C.cream, 0.55)
        g.fillCircle(cx, cy, 112)
        g.lineStyle(8, C.white, 0.9)
        g.strokeCircle(cx, cy, 108)
        g.lineStyle(3, C.creamDark, 1)
        g.strokeCircle(cx, cy, 114)
        g.fillStyle(C.white, 0.9)
        const tri = (a: number) => {
            const p = (r: number, da: number) => ({ x: cx + Math.cos(a + da) * r, y: cy + Math.sin(a + da) * r })
            g.fillTriangle(p(92, 0).x, p(92, 0).y, p(72, 0.18).x, p(72, 0.18).y, p(72, -0.18).x, p(72, -0.18).y)
        }
        ;[0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(tri)
        return
    }
    disc(g, cx, cy + 6, 62, C.peachDark, 0)
    disc(g, cx, cy, 62, C.peach, 5, C.peachDark)
    g.fillStyle(C.white, 0.55)
    g.fillEllipse(cx - 16, cy - 22, 50, 26)
}

// ───────────────────────────────────────────── a Duda

function duda(g: G, pose: DudaPose) {
    const cx = 160
    const lift = pose === 'cheer' ? -22 : 0
    const bow = pose === 'bow' ? 26 : 0
    const y = (v: number) => v + lift

    oval(g, cx - 26, y(408), 48, 20, C.butter, 3)
    oval(g, cx + 26, y(408), 48, 20, C.butter, 3)
    limb(g, { x: cx - 24, y: y(330) }, { x: cx - 26, y: y(398) }, 22, C.skin)
    limb(g, { x: cx + 24, y: y(330) }, { x: cx + 26, y: y(398) }, 22, C.skin)
    box(g, cx - 54, y(286), 108, 54, 14, C.denim)

    const hand = HANDS[pose]
    const shoulderL = { x: cx - 46, y: y(222) + bow * 0.4 }
    const shoulderR = { x: cx + 46, y: y(222) + bow * 0.4 }
    const backArm = (from: P, to: P) => limb(g, from, { x: to.x, y: y(to.y) }, 18, C.skin)
    if (pose === 'present') backArm(shoulderL, hand.l)

    box(g, cx - 54, y(204) + bow * 0.4, 108, 96, 26, C.cream)
    g.fillStyle(C.coral, 1)
    for (let s = 0; s < 3; s++) g.fillRect(cx - 50, y(222 + s * 26) + bow * 0.4, 100, 11)
    g.lineStyle(LINE, INK, 1)
    g.strokeRoundedRect(cx - 54, y(204) + bow * 0.4, 108, 96, 26)

    const headY = y(150) + bow
    disc(g, cx - 46, headY - 52, 30, C.hair)
    disc(g, cx + 46, headY - 52, 30, C.hair)
    disc(g, cx, headY, 54, C.skin)
    g.fillStyle(C.hair, 1)
    g.beginPath()
    g.arc(cx, headY - 2, 56, Math.PI * 1.02, Math.PI * 1.98)
    g.closePath()
    g.fillPath()
    g.lineStyle(LINE, INK, 1)
    g.beginPath()
    g.arc(cx, headY, 54, 0, Math.PI * 2)
    g.strokePath()
    g.fillStyle(C.hair, 1)
    for (let s = -2; s <= 2; s++) g.fillCircle(cx + s * 18, headY - 38 + Math.abs(s) * 4, 12)

    const eyeY = headY + 6
    const closed = pose === 'cheer' || pose === 'bow'
    const wide = pose === 'oops'
    ;[-1, 1].forEach(s => {
        const ex = cx + s * 20
        if (closed) {
            g.lineStyle(4, INK, 1)
            g.beginPath()
            g.arc(ex, eyeY + 4, 8, Math.PI * 1.15, Math.PI * 1.85)
            g.strokePath()
        } else {
            oval(g, ex, eyeY, wide ? 13 : 10, wide ? 16 : 13, INK, 0)
            disc(g, ex + 2, eyeY - 3, 2.5, C.white, 0)
        }
        oval(g, cx + s * 34, eyeY + 18, 18, 10, C.cheek, 0)
    })
    g.lineStyle(4, INK, 1)
    if (pose === 'talk' || pose === 'cheer') oval(g, cx, headY + 30, 18, 14, 0xd06a6a, 3)
    else if (pose === 'oops') oval(g, cx, headY + 30, 12, 12, 0xd06a6a, 3)
    else {
        g.beginPath()
        g.arc(cx, headY + 22, 12, 0.25, Math.PI - 0.25)
        g.strokePath()
    }

    if (pose !== 'present') {
        backArm(shoulderL, hand.l)
        backArm(shoulderR, hand.r)
    } else backArm(shoulderR, hand.r)
    const t = hand.tablet
    box(g, t.x - 38, y(t.y) - 48, 76, 96, 12, C.mint, LINE, C.mintDark)
    disc(g, t.x, y(t.y) - 36, 4, C.mintDark, 0)
    if (pose === 'oops') disc(g, hand.r.x, y(hand.r.y), 11, C.skin, 3)
}

const HANDS: Record<DudaPose, { l: P; r: P; tablet: P }> = {
    smile: { l: { x: 124, y: 262 }, r: { x: 196, y: 262 }, tablet: { x: 160, y: 258 } },
    talk: { l: { x: 100, y: 292 }, r: { x: 236, y: 150 }, tablet: { x: 92, y: 300 } },
    cheer: { l: { x: 70, y: 120 }, r: { x: 252, y: 128 }, tablet: { x: 64, y: 96 } },
    oops: { l: { x: 96, y: 292 }, r: { x: 170, y: 184 }, tablet: { x: 90, y: 300 } },
    present: { l: { x: 112, y: 280 }, r: { x: 300, y: 212 }, tablet: { x: 104, y: 262 } },
    bow: { l: { x: 132, y: 286 }, r: { x: 188, y: 286 }, tablet: { x: 160, y: 284 } },
}

// ───────────────────────────────────────────── o teatrinho

function stage(g: G) {
    g.fillStyle(0xe9def7, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(0xdcd0ee, 1)
    for (let x = 0; x < W; x += 64) g.fillRect(x, 0, 30, 432)

    box(g, 334, 74, 612, 370, 14, C.woodDark, LINE)
    box(g, 346, 86, 588, 346, 8, C.screen, 3, C.woodDark)

    g.fillStyle(C.floor, 1)
    g.fillRect(0, 432, W, 160)
    g.lineStyle(3, C.floorLine, 1)
    for (let yy = 456; yy < 592; yy += 30) g.lineBetween(0, yy, W, yy)
    g.lineStyle(5, C.woodDark, 1)
    g.lineBetween(0, 432, W, 432)
    g.fillStyle(C.woodDark, 1)
    g.fillRect(0, 586, W, 14)

    const curtain = (x0: number, dir: number) => {
        for (let f = 0; f < 5; f++) {
            const x = x0 + dir * f * 40
            poly(
                g,
                [
                    { x, y: 0 },
                    { x: x + dir * 44, y: 0 },
                    { x: x + dir * 36 + dir * f * 6, y: 600 },
                    { x: x - dir * 4 + dir * f * 6, y: 600 },
                ],
                f % 2 ? C.curtain : C.curtainDark,
                3,
                C.coralDark,
            )
        }
        disc(g, x0 + dir * 120, 330, 14, C.butter, 3)
    }
    curtain(-10, 1)
    curtain(W + 10, -1)
    g.fillStyle(C.curtainDark, 1)
    g.fillRect(0, 0, W, 46)
    for (let x = 0; x < W + 60; x += 80) {
        g.fillStyle(C.curtain, 1)
        g.fillEllipse(x, 46, 84, 50)
        g.lineStyle(3, C.coralDark, 1)
        g.strokeEllipse(x, 46, 84, 50)
    }

    g.fillStyle(0xcab8e8, 1)
    g.fillRect(0, 600, W, 120)
    for (let n = 0; n < 12; n++) {
        const x = 54 + n * 107
        const yy = 664 + (n % 2) * 12
        const hair = C.crowd[n % C.crowd.length]
        disc(g, x, yy, 48, C.skin, 0)
        disc(g, x, yy - 4, 48, hair, LINE)
        if (n % 3 === 0) {
            disc(g, x - 36, yy - 40, 18, hair, 3)
            disc(g, x + 36, yy - 40, 18, hair, 3)
        }
        if (n % 4 === 1) oval(g, x, yy - 46, 70, 26, C.coral, 3)
    }
}

// ───────────────────────────────────────────── a nota (efeito)

function note(g: G) {
    g.fillStyle(C.white, 1)
    g.lineStyle(3, INK, 1)
    g.fillEllipse(16, 50, 26, 18)
    g.strokeEllipse(16, 50, 26, 18)
    g.fillRect(26, 8, 6, 42)
    g.strokeRect(26, 8, 6, 42)
    g.fillPoints(
        [
            { x: 32, y: 8 },
            { x: 46, y: 18 },
            { x: 42, y: 30 },
            { x: 32, y: 22 },
        ],
        true,
    )
    g.strokePoints(
        [
            { x: 32, y: 8 },
            { x: 46, y: 18 },
            { x: 42, y: 30 },
            { x: 32, y: 22 },
        ],
        true,
    )
}
