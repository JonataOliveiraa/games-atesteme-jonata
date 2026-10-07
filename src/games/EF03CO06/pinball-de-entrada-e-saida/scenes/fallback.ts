import Phaser from 'phaser'
import { BG, DEVICES_SHEET, KID_SHEET, PIECES_SHEET, TABLE_ART, type Sheet } from '../data/files'
import { H, W } from '../data/layout'
import { C } from '../data/theme'
import type { PoseId } from '../types'

type G = Phaser.GameObjects.Graphics
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
    bakeOne(scene, BG, W, H, room)
    bakeOne(scene, TABLE_ART, 600, 660, table)
    bakeSheet(scene, DEVICES_SHEET, (g, i) => DEVICE_PAINT[i]?.(g))
    bakeSheet(scene, PIECES_SHEET, (g, i) => PIECE_PAINT[i]?.(g))
    const poses: PoseId[] = ['ask', 'happy', 'sad', 'listen', 'look', 'paper', 'sing', 'write', 'show', 'call']
    bakeSheet(scene, KID_SHEET, (g, i) => poses[i] && kid(g, poses[i]))
}

// ───────────────────────────────────────────── primitivas

function disc(g: G, x: number, y: number, r: number, fill: number, line = LINE, alpha = 1) {
    g.fillStyle(fill, alpha)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeCircle(x, y, r)
    }
}

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeEllipse(x, y, w, h)
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

function poly(g: G, flat: number[], fill: number, line = LINE) {
    const p: Phaser.Types.Math.Vector2Like[] = []
    for (let i = 0; i < flat.length; i += 2) p.push({ x: flat[i], y: flat[i + 1] })
    g.fillStyle(fill, 1)
    g.fillPoints(p, true)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokePoints(p, true)
    }
}

function limb(g: G, x1: number, y1: number, x2: number, y2: number, fill: number, width = 16) {
    g.lineStyle(width + 8, C.ink, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(C.ink, 1)
    g.fillCircle(x2, y2, (width + 8) / 2)
    g.lineStyle(width, fill, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(fill, 1)
    g.fillCircle(x2, y2, width / 2)
}

function arcLine(g: G, x: number, y: number, r: number, from: number, to: number, width = 4, color: number = C.ink) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

function topHalf(g: G, x: number, y: number, r: number, fill: number) {
    g.fillStyle(fill, 1)
    g.beginPath()
    g.arc(x, y, r, Math.PI, 0, false)
    g.closePath()
    g.fillPath()
    g.lineStyle(LINE, C.ink, 1)
    g.beginPath()
    g.arc(x, y, r, Math.PI, 0, false)
    g.closePath()
    g.strokePath()
}

function star(g: G, x: number, y: number, r: number, fill: number, line = LINE) {
    const p: number[] = []
    for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5
        const rr = k % 2 ? r * 0.45 : r
        p.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
    }
    poly(g, p, fill, line)
}

// ───────────────────────────────────────────── sala e mesa

function room(g: G) {
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(C.wallLow, 1)
    g.fillRect(0, 430, W, 260)
    g.lineStyle(10, C.neon, 0.8)
    g.lineBetween(60, 40, 330, 40)
    g.lineBetween(950, 40, 1220, 40)
    g.lineStyle(6, C.neonMint, 0.8)
    g.lineBetween(60, 62, 330, 62)
    g.lineBetween(950, 62, 1220, 62)
    g.fillStyle(C.floor, 1)
    g.fillRect(0, 690, W, 30)
    g.lineStyle(3, C.floorLine, 1)
    g.lineBetween(0, 690, W, 690)
    box(g, -60, 250, 110, 440, 30, C.cabinet, 4)
    box(g, 1230, 250, 110, 440, 30, C.cabinet, 4)
}

function table(g: G) {
    box(g, 4, 4, 592, 652, 48, C.frame, 6)
    box(g, 30, 40, 540, 580, 34, C.table, 4)
    g.lineStyle(3, C.tableLine, 1)
    ;[
        [120, 240, 200, 240, 200, 300],
        [480, 250, 400, 250, 400, 330],
        [140, 420, 220, 420],
        [460, 430, 380, 430, 380, 470],
        [300, 200, 300, 230],
    ].forEach(seg => {
        for (let k = 0; k + 3 < seg.length; k += 2) g.lineBetween(seg[k], seg[k + 1], seg[k + 2], seg[k + 3])
        g.fillStyle(C.tableLine, 1)
        g.fillCircle(seg[seg.length - 2], seg[seg.length - 1], 6)
    })
    ;[
        [30, 30],
        [570, 30],
        [30, 630],
        [570, 630],
    ].forEach(([x, y]) => disc(g, x, y, 9, C.metal, 3))
    g.fillStyle(C.frameDark, 1)
    g.fillRoundedRect(10, 300, 10, 60, 5)
    g.fillRoundedRect(580, 300, 10, 60, 5)
}

// ───────────────────────────────────────────── aparelhos (célula 320)

const DEVICE_PAINT: Array<(g: G) => void> = [
    g => {
        box(g, 30, 110, 260, 120, 26, C.device)
        for (let row = 0; row < 3; row++)
            for (let col = 0; col < 6; col++) box(g, 52 + col * 37, 126 + row * 30, 30, 22, 6, C.white, 3)
    },
    g => {
        oval(g, 160, 286, 140, 30, C.graphite)
        box(g, 150, 170, 20, 112, 6, C.metal, 4)
        disc(g, 160, 118, 72, C.deviceGrey)
        g.lineStyle(3, C.metalDark, 1)
        for (let k = -2; k <= 2; k++) {
            g.lineBetween(160 + k * 22, 60, 160 + k * 22, 176)
            g.lineBetween(100, 118 + k * 22, 220, 118 + k * 22)
        }
        g.lineStyle(5, C.ink, 1)
        g.strokeCircle(160, 118, 72)
        box(g, 92, 170, 136, 18, 8, C.mint, 4)
    },
    g => {
        box(g, 90, 72, 64, 40, 12, C.deviceGrey)
        box(g, 40, 100, 240, 160, 32, C.device)
        disc(g, 238, 90, 14, C.mint, 4)
        disc(g, 160, 182, 66, C.graphite)
        disc(g, 160, 182, 40, C.metalDark, 4)
        g.fillStyle(C.white, 0.8)
        g.fillCircle(144, 166, 12)
    },
    g => {
        box(g, 76, 30, 168, 266, 26, C.device)
        disc(g, 160, 92, 34, C.graphite)
        disc(g, 160, 92, 14, C.metalDark, 3)
        disc(g, 160, 206, 64, C.graphite)
        disc(g, 160, 206, 28, C.metalDark, 4)
    },
    g => {
        box(g, 140, 236, 40, 44, 6, C.metal, 4)
        oval(g, 160, 286, 150, 26, C.deviceGrey)
        box(g, 24, 46, 272, 196, 22, C.device)
        box(g, 46, 66, 228, 152, 10, C.graphite, 4)
        g.fillStyle(C.white, 0.25)
        g.fillTriangle(56, 76, 110, 76, 56, 130)
    },
    g => {
        box(g, 76, 64, 168, 64, 16, C.deviceGrey)
        box(g, 30, 110, 260, 140, 26, C.device)
        box(g, 72, 204, 176, 18, 6, C.graphite, 4)
        disc(g, 258, 140, 9, C.mint, 3)
    },
]

// ───────────────────────────────────────────── peças e conteúdos (célula 256)

function chipBody(g: G, fill: number) {
    for (let k = 0; k < 4; k++) {
        const o = 70 + k * 38
        box(g, o - 7, 28, 14, 30, 4, C.metalDark, 3)
        box(g, o - 7, 198, 14, 30, 4, C.metalDark, 3)
        box(g, 28, o - 7, 30, 14, 4, C.metalDark, 3)
        box(g, 198, o - 7, 30, 14, 4, C.metalDark, 3)
    }
    box(g, 50, 50, 156, 156, 28, fill)
    g.fillStyle(C.blush, 0.6)
    g.fillEllipse(90, 150, 22, 12)
    g.fillEllipse(166, 150, 22, 12)
}

function paper(g: G, x: number, y: number, w: number, h: number) {
    poly(g, [x, y, x + w - 24, y, x + w, y + 24, x + w, y + h, x, y + h], C.paper, 4)
    poly(g, [x + w - 24, y, x + w - 24, y + 24, x + w, y + 24], C.creamDark, 3)
}

function house(g: G, x: number, y: number, s: number) {
    g.lineStyle(6 * s, 0xff6f6f, 1)
    g.strokeTriangle(x - 34 * s, y, x + 34 * s, y, x, y - 30 * s)
    g.lineStyle(6 * s, 0x3f8fe6, 1)
    g.strokeRect(x - 26 * s, y, 52 * s, 40 * s)
    g.fillStyle(0x6cc46a, 1)
    g.fillCircle(x + 62 * s, y + 6 * s, 18 * s)
    g.lineStyle(6 * s, 0x8a5a36, 1)
    g.lineBetween(x + 62 * s, y + 20 * s, x + 62 * s, y + 42 * s)
    g.fillStyle(C.star, 1)
    g.fillCircle(x - 58 * s, y - 34 * s, 14 * s)
}

const PIECE_PAINT: Array<(g: G) => void> = [
    g => {
        chipBody(g, C.chip)
        arcLine(g, 100, 118, 12, Math.PI * 0.15, Math.PI * 0.85, 5)
        arcLine(g, 156, 118, 12, Math.PI * 0.15, Math.PI * 0.85, 5)
        arcLine(g, 128, 150, 10, Math.PI * 0.2, Math.PI * 0.8, 4)
    },
    g => {
        g.fillStyle(C.chipGlow, 0.45)
        g.fillCircle(128, 128, 124)
        chipBody(g, C.chipOn)
        ;[100, 156].forEach(x => {
            oval(g, x, 116, 18, 24, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(x - 3, 110, 4)
        })
        g.lineStyle(4, C.ink, 1)
        g.lineBetween(84, 96, 112, 102)
        g.lineBetween(172, 96, 144, 102)
        g.lineBetween(116, 154, 140, 154)
    },
    g => {
        poly(g, [40, 104, 226, 140, 232, 152, 226, 164, 40, 158], C.mint)
        disc(g, 52, 131, 32, C.white)
        disc(g, 52, 131, 12, C.metalDark, 3)
    },
    g => {
        disc(g, 128, 128, 92, C.metal)
        g.fillStyle(C.metalDark, 0.4)
        g.fillCircle(146, 150, 58)
        g.fillStyle(C.white, 0.9)
        g.fillCircle(96, 92, 26)
        g.fillCircle(132, 76, 9)
    },
    g => {
        box(g, 88, 30, 80, 24, 10, C.deviceGrey)
        g.lineStyle(9, C.ink, 1)
        for (let k = 0; k < 6; k++) g.lineBetween(92, 60 + k * 28, 164, 74 + k * 28)
        g.lineStyle(5, C.metal, 1)
        for (let k = 0; k < 6; k++) g.lineBetween(92, 60 + k * 28, 164, 74 + k * 28)
    },
    g => {
        oval(g, 128, 170, 170, 70, C.mintDark)
        oval(g, 128, 130, 170, 70, C.mint)
        oval(g, 128, 122, 90, 34, C.white, 4)
    },
    g => paper(g, 58, 28, 140, 200),
    g => star(g, 128, 132, 100, C.star),
    g => [44, 104, 164].forEach(x => box(g, x - 4, 96, 56, 64, 12, C.cream)),
    g => {
        poly(g, [40, 50, 216, 50, 216, 170, 110, 170, 74, 212, 82, 170, 40, 170], C.white)
        ;[24, 44, 64].forEach(r => arcLine(g, 92, 110, r, -Math.PI * 0.3, Math.PI * 0.3, 6, C.note))
    },
    g => {
        g.lineStyle(14, C.ink, 1)
        g.lineBetween(100, 70, 100, 176)
        g.lineBetween(184, 52, 184, 160)
        g.lineStyle(20, C.ink, 1)
        g.lineBetween(100, 70, 184, 52)
        g.lineStyle(10, C.note, 1)
        g.lineBetween(100, 70, 100, 176)
        g.lineBetween(184, 52, 184, 160)
        g.lineStyle(14, C.note, 1)
        g.lineBetween(100, 70, 184, 52)
        oval(g, 84, 182, 54, 40, C.note)
        oval(g, 168, 166, 54, 40, C.note)
    },
    g => {
        paper(g, 30, 44, 196, 168)
        house(g, 104, 120, 1)
    },
    g => {
        ;[-1, 1].forEach(s => oval(g, 128 + s * 36, 70, 40, 104, C.white))
        ;[-1, 1].forEach(s => oval(g, 128 + s * 36, 74, 18, 70, C.blush, 0))
        disc(g, 128, 150, 78, C.white)
        ;[100, 156].forEach(x => {
            oval(g, x, 140, 16, 22, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(x - 3, 134, 4)
        })
        g.fillStyle(C.blush, 0.7)
        g.fillEllipse(84, 170, 22, 12)
        g.fillEllipse(172, 170, 22, 12)
        arcLine(g, 128, 168, 14, Math.PI * 0.15, Math.PI * 0.85, 5)
    },
    g => {
        poly(g, [128, 80, 128, 206, 30, 190, 30, 64], C.white)
        poly(g, [128, 80, 128, 206, 226, 190, 226, 64], C.white)
        g.lineStyle(3, C.deviceGrey, 1)
        for (let k = 0; k < 4; k++) {
            g.lineBetween(50, 100 + k * 22, 112, 108 + k * 22)
            g.lineBetween(206, 100 + k * 22, 144, 108 + k * 22)
        }
        star(g, 176, 92, 16, C.star, 3)
    },
    g => {
        box(g, 30, 60, 196, 140, 14, C.cream)
        ;[
            [80, 110, 0xff6f8f],
            [128, 96, 0x8fdcc4],
            [176, 112, 0xffd23f],
        ].forEach(([x, y, color]) => {
            g.lineStyle(3, C.ink, 1)
            g.lineBetween(x, y + 26, x, y + 66)
            oval(g, x, y, 40, 50, color, 4)
        })
    },
    g => {
        g.lineStyle(6, C.mintDark, 1)
        g.lineBetween(90, 20, 118, 80)
        g.lineBetween(166, 20, 138, 80)
        box(g, 50, 80, 156, 120, 16, C.white)
        box(g, 112, 72, 32, 18, 6, C.metal, 3)
    },
]

// ───────────────────────────────────────────── Nino (célula 320)

function kid(g: G, pose: PoseId) {
    const cx = 160
    const feet = 304
    const R = 56
    const headY = feet - 268 + R
    const neck = headY + R - 8
    const hip = neck + 96
    const tw = 80

    ;[-1, 1].forEach(side => {
        limb(g, cx + side * 16, hip - 6, cx + side * 20, feet - 14, C.skin, 20)
        oval(g, cx + side * 24, feet - 8, 40, 18, C.white, 4)
    })
    box(g, cx - tw / 2 - 2, hip - 22, tw + 4, 36, 10, C.shorts)
    box(g, cx - tw / 2, neck, tw, hip - neck - 6, 22, C.shirt)
    star(g, cx, neck + 40, 12, C.star, 3)

    const shoulderY = neck + 18
    const left = { x: cx - tw / 2 - 14, y: hip }
    const right = { x: cx + tw / 2 + 14, y: hip }
    const H2 = headY
    switch (pose) {
        case 'ask':
            right.x = cx + 86
            right.y = neck - 10
            break
        case 'happy':
            left.x = cx - 84
            left.y = H2 - 50
            right.x = cx + 84
            right.y = H2 - 50
            break
        case 'sad':
            left.x = cx - tw / 2 - 4
            right.x = cx + tw / 2 + 4
            left.y = right.y = hip + 8
            break
        case 'listen':
            right.x = cx + R + 4
            right.y = H2 + 6
            break
        case 'look':
            right.x = cx + 18
            right.y = H2 - R * 0.42
            break
        case 'paper':
        case 'show':
            left.x = cx - 46
            right.x = cx + 46
            left.y = right.y = pose === 'show' ? neck + 30 : neck + 46
            break
        case 'sing':
            left.x = cx - 6
            left.y = neck + 34
            right.x = cx + 92
            right.y = neck + 10
            break
        case 'write':
            left.x = cx - 30
            left.y = neck + 50
            right.x = cx + 34
            right.y = neck + 44
            break
        case 'call':
            left.x = cx - 30
            left.y = H2 + 38
            right.x = cx + 30
            right.y = H2 + 38
            break
    }
    limb(g, cx - tw / 2 + 8, shoulderY, left.x, left.y, C.skin, 16)
    limb(g, cx + tw / 2 - 8, shoulderY, right.x, right.y, C.skin, 16)

    if (pose === 'paper') paper(g, cx - 56, neck + 8, 112, 92)
    if (pose === 'show') {
        paper(g, cx - 76, neck - 6, 152, 110)
        house(g, cx - 10, neck + 46, 0.62)
    }
    if (pose === 'write') {
        box(g, cx - 64, neck + 30, 70, 56, 6, C.cream, 4)
        g.lineStyle(8, C.ink, 1)
        g.lineBetween(cx + 34, neck + 44, cx + 4, neck + 64)
        g.lineStyle(5, C.star, 1)
        g.lineBetween(cx + 34, neck + 44, cx + 6, neck + 63)
    }

    disc(g, cx, H2, R, C.skin)
    topHalf(g, cx, H2 - 6, R + 4, C.hair)
    for (let k = 0; k <= 6; k++) {
        const a = Math.PI + (k * Math.PI) / 6
        g.fillStyle(C.hair, 1)
        g.fillCircle(cx + Math.cos(a) * (R + 4), H2 - 6 + Math.sin(a) * (R + 4), 14)
    }

    const eyeY = H2 + 10
    const closed = pose === 'happy' || pose === 'listen' || pose === 'sing'
    ;[-1, 1].forEach(side => {
        const ex = cx + side * 22
        if (closed) arcLine(g, ex, eyeY + 4, 9, Math.PI * 1.1, Math.PI * 1.9, 5)
        else {
            const big = pose === 'look' ? 1.2 : 1
            oval(g, ex, eyeY, 15 * big, 21 * big, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(ex - 3, eyeY - 5, 4)
        }
    })
    if (pose === 'sad') {
        oval(g, cx - 30, eyeY + 18, 8, 14, 0x8fd6ff, 2)
        g.lineStyle(4, C.ink, 1)
        g.lineBetween(cx - 34, eyeY - 18, cx - 12, eyeY - 24)
        g.lineBetween(cx + 34, eyeY - 18, cx + 12, eyeY - 24)
    }
    g.fillStyle(C.blush, 0.65)
    g.fillEllipse(cx - 36, H2 + 30, 18, 10)
    g.fillEllipse(cx + 36, H2 + 30, 18, 10)

    const my = H2 + 34
    if (pose === 'sing' || pose === 'happy') oval(g, cx, my + 2, 20, pose === 'sing' ? 22 : 14, C.eye, 0)
    else if (pose === 'ask' || pose === 'call') oval(g, cx, my, 12, 12, C.eye, 0)
    else if (pose === 'sad') arcLine(g, cx, my + 10, 9, Math.PI * 1.15, Math.PI * 1.85, 4)
    else arcLine(g, cx, my - 4, 9, Math.PI * 0.15, Math.PI * 0.85, 4)

    if (pose === 'listen') disc(g, right.x, right.y, 10, C.skin, 4)
    if (pose === 'call') [left, right].forEach(p => disc(g, p.x, p.y, 10, C.skin, 4))
}
