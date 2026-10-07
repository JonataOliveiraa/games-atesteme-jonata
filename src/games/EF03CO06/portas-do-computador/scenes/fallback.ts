import Phaser from 'phaser'
import { BG, COMPUTER_ART, INFO_SHEET, type Sheet } from '../data/files'
import { CHIP, COMPUTER, GOAL, H, W, WINDOW } from '../data/layout'
import type { InfoId, InfoPose } from '../types'

type G = Phaser.GameObjects.Graphics
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

const INFOS: InfoId[] = ['note', 'photo', 'letter']
const POSES: InfoPose[] = ['walkA', 'walkB', 'happy', 'dizzy']

export function ensureArt(scene: Phaser.Scene) {
    bakeOne(scene, BG, W, H, world)
    bakeOne(scene, COMPUTER_ART, COMPUTER.w, COMPUTER.h, computer)
    bakeSheet(scene, INFO_SHEET, (g, i) => info(g, INFOS[Math.floor(i / 4)], POSES[i % 4]))
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

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

function box(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function sparkle(g: G, x: number, y: number, s: number) {
    g.fillStyle(0xffffff, 1)
    g.fillRect(x - s, y - s / 4, s * 2, s / 2)
    g.fillRect(x - s / 4, y - s, s / 2, s * 2)
}

// ───────────────────────────────────────────── fundo

function world(g: G) {
    const ground = 562
    g.fillStyle(0xeee6fc, 1)
    g.fillRect(0, 0, W, ground)
    g.fillStyle(0xe2d6fa, 1)
    g.fillRect(0, 0, W, 120)
    ;[
        [120, 90, 120],
        [1150, 70, 140],
        [980, 130, 80],
    ].forEach(([x, y, w]) => {
        g.fillStyle(0xfffaf0, 1)
        g.fillEllipse(x, y, w, w * 0.42)
        g.fillEllipse(x - w * 0.25, y + 6, w * 0.6, w * 0.32)
        g.fillEllipse(x + w * 0.28, y + 8, w * 0.55, w * 0.3)
    })
    g.fillStyle(0xcdeedd, 1)
    g.fillEllipse(170, ground + 10, 520, 170)
    g.fillEllipse(1110, ground + 14, 560, 180)
    g.fillStyle(0xbfe8d4, 1)
    g.fillRect(0, ground, W, H - ground)
    g.lineStyle(4, 0x8fcfb4, 1)
    g.lineBetween(0, ground, W, ground)

    g.fillStyle(0xfff1dc, 1)
    g.fillPoints(
        [
            { x: 0, y: 600 },
            { x: 330, y: 610 },
            { x: 380, y: 690 },
            { x: 0, y: 700 },
        ],
        true,
    )
    g.lineStyle(4, 0xe4cfae, 1)
    for (let x = 60; x < 360; x += 70) g.lineBetween(x, 604, x + 8, 696)

    g.fillStyle(0xfff1dc, 1)
    g.fillPoints(
        [
            { x: 900, y: 610 },
            { x: W, y: 600 },
            { x: W, y: 700 },
            { x: 920, y: 690 },
        ],
        true,
    )

    ;[
        [40, 548, 0x9ddcc0],
        [320, 556, 0xa9e3c9],
        [1240, 548, 0x9ddcc0],
        [960, 556, 0xa9e3c9],
    ].forEach(([x, y, tone]) => {
        g.fillStyle(tone, 1)
        g.fillCircle(x, y, 30)
        g.fillCircle(x + 26, y + 6, 24)
        g.fillCircle(x - 24, y + 8, 22)
        g.lineStyle(3, 0x6fb79a, 1)
        g.strokeCircle(x, y, 30)
    })
    ;[
        [1000, 640, 0xffb3d1],
        [1060, 660, 0xfff09a],
        [1150, 636, 0xd2b8ff],
        [1220, 664, 0xffb3d1],
    ].forEach(([x, y, tone]) => {
        g.fillStyle(0x6fb79a, 1)
        g.fillRect(x - 2, y, 4, 22)
        g.fillStyle(tone, 1)
        for (let k = 0; k < 5; k++) g.fillCircle(x + Math.cos((k / 5) * Math.PI * 2) * 8, y + Math.sin((k / 5) * Math.PI * 2) * 8, 6)
        g.fillStyle(0xfff6e4, 1)
        g.fillCircle(x, y, 5)
    })
    g.fillStyle(0xb8a6ea, 1)
    g.fillRect(28, 420, 10, 180)
    box(g, 14, 396, 38, 34, 12, 0xfff6c8, 3)
}

// ───────────────────────────────────────────── computador (gabinete)

function computer(g: G) {
    const w = COMPUTER.w
    const h = COMPUTER.h
    const left = COMPUTER.x - w / 2
    const top = COMPUTER.bottom - h
    const win = { x: WINDOW.x - left - WINDOW.w / 2, y: WINDOW.y - top - WINDOW.h / 2, w: WINDOW.w, h: WINDOW.h }
    const chip = { x: CHIP.x - left, y: CHIP.y - top }
    const goalY = GOAL.y - top

    box(g, 40, h - 30, 70, 26, 10, 0xb6bccc, 4)
    box(g, w - 110, h - 30, 70, 26, 10, 0xb6bccc, 4)
    box(g, 6, 6, w - 12, h - 30, 36, 0xe8e3f6, 6)
    g.fillStyle(0xd6cff0, 1)
    g.fillRoundedRect(14, h - 140, w - 28, 100, { tl: 0, tr: 0, bl: 30, br: 30 })
    g.fillStyle(0xffffff, 0.7)
    g.fillRoundedRect(20, 14, w - 40, 14, 7)

    box(g, 30, goalY - 30, w - 60, 60, 30, 0x4a4f5e, 4)

    box(g, win.x - 12, win.y - 12, win.w + 24, win.h + 24, 26, 0xc4b2ee, 5)
    box(g, win.x, win.y, win.w, win.h, 16, 0x2e2a63, 4)
    g.lineStyle(3, 0x4a4396, 1)
    const rng = new Phaser.Math.RandomDataGenerator(['gabinete'])
    for (let k = 0; k < 16; k++) {
        let x = rng.between(win.x + 16, win.x + win.w - 16)
        let y = rng.between(win.y + 16, win.y + win.h - 16)
        g.beginPath()
        g.moveTo(x, y)
        for (let s2 = 0; s2 < 2; s2++) {
            if (rng.frac() < 0.5) x = Phaser.Math.Clamp(x + rng.between(-60, 60), win.x + 12, win.x + win.w - 12)
            else y = Phaser.Math.Clamp(y + rng.between(-50, 50), win.y + 12, win.y + win.h - 12)
            g.lineTo(x, y)
        }
        g.strokePath()
        g.fillStyle(0x7a70d0, 1)
        g.fillCircle(x, y, 4)
    }
    box(g, chip.x - 66, chip.y - 66, 132, 132, 16, 0x3a3478, 3)
    g.fillStyle(0xffffff, 0.22)
    g.fillPoints(
        [
            { x: win.x + 20, y: win.y + win.h - 20 },
            { x: win.x + win.w * 0.55, y: win.y + 20 },
            { x: win.x + win.w * 0.7, y: win.y + 20 },
            { x: win.x + 50, y: win.y + win.h - 20 },
        ],
        true,
    )

    disc(g, w / 2, h - 92, 20, 0x9be7d4, 4)
    g.lineStyle(4, INK, 1)
    g.beginPath()
    g.arc(w / 2, h - 92, 9, -Math.PI * 0.3, Math.PI * 1.3)
    g.strokePath()
    g.lineBetween(w / 2, h - 106, w / 2, h - 94)
    g.lineStyle(5, 0xb8a6ea, 1)
    for (let k = 0; k < 3; k++) {
        g.lineBetween(46, h - 112 + k * 16, 130, h - 112 + k * 16)
        g.lineBetween(w - 130, h - 112 + k * 16, w - 46, h - 112 + k * 16)
    }
    sparkle(g, 34, 46, 7)
}

// ───────────────────────────────────────────── informações

const CELL = 320
const FEET = 304

function face(g: G, x: number, y: number, s: number, pose: InfoPose) {
    if (pose === 'happy') {
        g.lineStyle(5 * s, INK, 1)
        ;[-1, 1].forEach(side => {
            g.beginPath()
            g.arc(x + side * 22 * s, y + 4 * s, 10 * s, Math.PI * 1.1, Math.PI * 1.9)
            g.strokePath()
        })
    } else if (pose === 'dizzy') {
        g.lineStyle(4 * s, INK, 1)
        ;[-1, 1].forEach(side => {
            const cx = x + side * 22 * s
            g.beginPath()
            for (let k = 0; k <= 30; k++) {
                const a = (k / 30) * Math.PI * 4
                const rr = (k / 30) * 11 * s
                const px = cx + Math.cos(a) * rr
                const py = y + Math.sin(a) * rr
                if (k === 0) g.moveTo(px, py)
                else g.lineTo(px, py)
            }
            g.strokePath()
        })
    } else {
        ;[-1, 1].forEach(side => {
            g.fillStyle(INK, 1)
            g.fillEllipse(x + side * 22 * s, y, 16 * s, 22 * s)
            g.fillStyle(0xffffff, 1)
            g.fillCircle(x + side * 22 * s - 3 * s, y - 5 * s, 4 * s)
        })
    }
    g.fillStyle(0xff9fb0, 0.8)
    g.fillEllipse(x - 38 * s, y + 14 * s, 16 * s, 9 * s)
    g.fillEllipse(x + 38 * s, y + 14 * s, 16 * s, 9 * s)
    g.lineStyle(4 * s, INK, 1)
    g.beginPath()
    if (pose === 'dizzy') {
        g.moveTo(x - 8 * s, y + 22 * s)
        g.lineTo(x - 2 * s, y + 18 * s)
        g.lineTo(x + 4 * s, y + 22 * s)
        g.lineTo(x + 10 * s, y + 18 * s)
    } else g.arc(x, y + 14 * s, (pose === 'happy' ? 10 : 7) * s, Math.PI * 0.15, Math.PI * 0.85)
    g.strokePath()
}

function feet(g: G, x: number, pose: InfoPose, tone: number) {
    const step = pose === 'walkA' ? 1 : pose === 'walkB' ? -1 : 0
    const lift = pose === 'happy' ? 10 : 0
    ;[-1, 1].forEach(side => {
        const dx = side * 26 + step * side * 8
        const dy = step * side * 6
        g.lineStyle(10, INK, 1)
        g.lineBetween(x + side * 22, FEET - 40 - lift, x + dx, FEET - 14 - lift + dy)
        g.lineStyle(5, tone, 1)
        g.lineBetween(x + side * 22, FEET - 40 - lift, x + dx, FEET - 14 - lift + dy)
        oval(g, x + dx + side * 6, FEET - 10 - lift + dy, 30, 18, tone, 4)
    })
}

function arms(g: G, x: number, y: number, half: number, pose: InfoPose, tone: number) {
    ;[-1, 1].forEach(side => {
        const sx = x + side * half
        const up = pose === 'happy'
        const swing = pose === 'walkA' ? side * 10 : pose === 'walkB' ? -side * 10 : 0
        const ex = sx + side * (up ? 26 : 24)
        const ey = up ? y - 56 : y + 30 + swing
        g.lineStyle(10, INK, 1)
        g.lineBetween(sx, y, ex, ey)
        g.lineStyle(5, tone, 1)
        g.lineBetween(sx, y, ex, ey)
        disc(g, ex, ey, 9, tone, 4)
    })
}

function stars(g: G, x: number, y: number) {
    ;[
        [-34, 0],
        [0, -16],
        [34, 0],
    ].forEach(([dx, dy]) => {
        const cx = x + dx
        const cy = y + dy
        const pts: Phaser.Types.Math.Vector2Like[] = []
        for (let k = 0; k < 10; k++) {
            const a = -Math.PI / 2 + (k * Math.PI) / 5
            const rr = k % 2 ? 6 : 14
            pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr })
        }
        g.fillStyle(0xffd23f, 1)
        g.fillPoints(pts, true)
        g.lineStyle(3, INK, 1)
        g.strokePoints(pts, true)
    })
}

function info(g: G, id: InfoId, pose: InfoPose) {
    const x = CELL / 2
    const lift = pose === 'happy' ? 18 : 0
    if (pose === 'dizzy') {
        g.translateCanvas(x, FEET)
        g.rotateCanvas(-0.18)
        g.translateCanvas(-x, -FEET)
    }
    if (id === 'note') {
        const tone = 0xb48be8
        feet(g, x - 40, pose, tone)
        g.lineStyle(14, INK, 1)
        g.lineBetween(x - 6, 216 - lift, x - 6, 66 - lift)
        g.lineBetween(x + 92, 192 - lift, x + 92, 44 - lift)
        g.lineStyle(7, tone, 1)
        g.lineBetween(x - 6, 216 - lift, x - 6, 66 - lift)
        g.lineBetween(x + 92, 192 - lift, x + 92, 44 - lift)
        const beam = [
            { x: x - 12, y: 54 - lift },
            { x: x + 98, y: 30 - lift },
            { x: x + 98, y: 66 - lift },
            { x: x - 12, y: 90 - lift },
        ]
        g.fillStyle(tone, 1)
        g.fillPoints(beam, true)
        g.lineStyle(LINE, INK, 1)
        g.strokePoints(beam, true)
        oval(g, x + 56, 200 - lift, 84, 62, tone)
        arms(g, x - 40, 226 - lift, 52, pose, tone)
        oval(g, x - 40, 228 - lift, 120, 92, tone)
        sparkle(g, x - 66, 206 - lift, 7)
        face(g, x - 40, 228 - lift, 0.85, pose)
    } else if (id === 'photo') {
        feet(g, x, pose, 0xf4f5f8)
        arms(g, x, 190 - lift, 92, pose, 0xf4f5f8)
        box(g, x - 92, 50 - lift, 184, 220, 18, 0xffffff)
        g.fillStyle(0xcfe6ff, 1)
        g.fillRect(x - 74, 68 - lift, 148, 116)
        g.fillStyle(0xffd23f, 1)
        g.fillCircle(x + 40, 100 - lift, 18)
        g.fillStyle(0x8fdcc4, 1)
        g.fillEllipse(x - 24, 186 - lift, 170, 96)
        g.fillStyle(0x6fc7a9, 1)
        g.fillEllipse(x + 50, 190 - lift, 120, 60)
        g.lineStyle(4, INK, 1)
        g.strokeRect(x - 74, 68 - lift, 148, 116)
        face(g, x, 222 - lift, 0.8, pose)
    } else {
        const tone = 0xfff1d6
        feet(g, x, pose, tone)
        arms(g, x, 196 - lift, 90, pose, tone)
        box(g, x - 90, 56 - lift, 180, 210, 36, tone)
        g.lineStyle(30, 0x9a6ad8, 1)
        g.lineBetween(x - 46, 172 - lift, x, 74 - lift)
        g.lineBetween(x, 74 - lift, x + 46, 172 - lift)
        g.lineStyle(20, 0x9a6ad8, 1)
        g.lineBetween(x - 26, 138 - lift, x + 26, 138 - lift)
        face(g, x, 216 - lift, 0.8, pose)
        sparkle(g, x - 66, 80 - lift, 7)
    }
    if (pose === 'dizzy') stars(g, x, 30)
}
