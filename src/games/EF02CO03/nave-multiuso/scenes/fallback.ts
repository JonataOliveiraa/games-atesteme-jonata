import Phaser from 'phaser'
import { CLOUD, GROUND, GROUND_TILE, PIECES, PIECE_SIZE, PILOT, PILOT_CELL, SCENERY, SCENERY_CELL, SHIP, SHIP_CELL, THINGS, THING_CELL } from '../data/files'
import { RIVER } from '../data/layout'
import { ensurePlaces } from './places'
import { C } from '../data/theme'

export type G = Phaser.GameObjects.Graphics

const LINE = 5

export const isFallback = (scene: Phaser.Scene, key: string): boolean =>
    !!(scene.textures.get(key).customData as { fallback?: boolean }).fallback

type Size = { w: number; h: number }

const DRAWN = {
    ship: { w: 320, h: 384 },
    pilot: { w: 512, h: 640 },
    thing: { w: 384, h: 384 },
    piece: { w: 256, h: 256 },
} as const

export function bake(scene: Phaser.Scene, key: string, w: number, h: number, cell: Size | null, paint: (g: G, i: number) => void, drawn?: Size) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    const cols = cell ? Math.floor(w / cell.w) : 1
    const rows = cell ? Math.floor(h / cell.h) : 1
    for (let i = 0; i < cols * rows; i++) {
        g.save()
        if (cell) g.translateCanvas((i % cols) * cell.w, Math.floor(i / cols) * cell.h)
        if (cell && drawn) g.scaleCanvas(cell.w / drawn.w, cell.h / drawn.h)
        paint(g, i)
        g.restore()
    }
    g.generateTexture(key, w, h)
    g.destroy()
    const texture = scene.textures.get(key)
    if (cell) {
        for (let i = 0; i < cols * rows; i++) texture.add(i, 0, (i % cols) * cell.w, Math.floor(i / cols) * cell.h, cell.w, cell.h)
    }
    ;(texture.customData as { fallback?: boolean }).fallback = true
}

const pts = (flat: number[]) => {
    const out: Phaser.Types.Math.Vector2Like[] = []
    for (let i = 0; i < flat.length; i += 2) out.push({ x: flat[i], y: flat[i + 1] })
    return out
}

export function poly(g: G, flat: number[], fill: number, line = LINE, alpha = 1) {
    const p = pts(flat)
    g.fillStyle(fill, alpha)
    g.fillPoints(p, true)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokePoints(p, true)
    }
}

export function disc(g: G, x: number, y: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeCircle(x, y, r)
    }
}

export function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

export function sparkle(g: G, x: number, y: number, r: number, fill: number, line = 3) {
    const k = r * 0.28
    poly(g, [x, y - r, x + k, y - k, x + r, y, x + k, y + k, x, y + r, x - k, y + k, x - r, y, x - k, y - k], fill, line)
}

const BASE = 262

function roof(g: G, x: number, y: number, w: number, h: number, color: number) {
    poly(g, [x - w / 2, y - h / 2, x + w / 2, y - h / 2, x + w / 2, y + h / 2, x - w / 2, y + h / 2], color, 4)
    g.fillStyle(C.white, 0.3)
    g.fillRect(x - w / 2 + 5, y - h / 2 + 5, w - 10, h / 2 - 8)
    g.lineStyle(4, C.ink, 1)
    g.lineBetween(x - w / 2, y, x + w / 2, y)
}

function treeTop(g: G, x: number, y: number, r: number) {
    g.fillStyle(C.grassDark, 1)
    g.fillCircle(x + 5, y + 7, r)
    disc(g, x, y, r, C.hillDark, 4)
    g.fillStyle(C.hill, 1)
    g.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.35)
}

const riverX = (y: number) => RIVER.x + RIVER.swing * Math.sin((2 * Math.PI * y * 2) / GROUND_TILE.h)

function paintGround(g: G) {
    const { w, h } = GROUND_TILE
    g.fillStyle(C.hill, 1)
    g.fillRect(0, 0, w, h)
    g.fillStyle(C.hillDark, 1)
    for (let y = 30, row = 0; y < h; y += 90, row++) {
        for (let x = RIVER.x + RIVER.swing + RIVER.half + 50 + (row % 2) * 80, k = 0; x < w - 30; x += 160, k++) {
            const tx = x + ((row + k) % 3) * 22
            g.fillTriangle(tx - 7, y + 6, tx, y - 9, tx + 7, y + 6)
        }
    }
    const left: number[] = []
    const right: number[] = []
    for (let y = 0; y <= h; y += 20) {
        left.push(riverX(y) - RIVER.half, y)
        right.unshift(riverX(y) + RIVER.half, y)
    }
    poly(g, [...left, ...right], C.cyan, 0)
    g.lineStyle(5, C.ink, 1)
    g.strokePoints(pts(left), false)
    g.strokePoints(pts(right), false)
    g.lineStyle(4, C.white, 0.85)
    for (let y = 60; y < h; y += 150) g.lineBetween(riverX(y) - 18, y, riverX(y) + 8, y)
}

function paintCloud(g: G) {
    g.fillStyle(C.white, 1)
    ;[
        [70, 95, 50],
        [130, 70, 62],
        [200, 80, 56],
        [255, 100, 42],
    ].forEach(([x, y, r]) => g.fillCircle(x, y, r))
    g.fillRoundedRect(40, 90, 250, 50, 25)
}

function field(g: G, color: number) {
    poly(g, [28, 28, 228, 28, 228, 228, 28, 228], color, 5)
    g.lineStyle(4, C.ink, 0.3)
    for (let x = 58; x < 228; x += 30) g.lineBetween(x, 40, x, 216)
}

function paintScenery(g: G, i: number) {
    const c = 128
    switch (i) {
        case 0:
            treeTop(g, c, c, 92)
            break
        case 1:
            g.fillStyle(C.grassDark, 1)
            g.fillCircle(c + 6, c + 8, 84)
            ;[
                [-40, -30, 50],
                [36, -34, 46],
                [0, 30, 56],
            ].forEach(([dx, dy, r]) => disc(g, c + dx, c + dy, r, C.teal, 4))
            break
        case 2:
            ;[
                [-44, 10, 38],
                [0, -20, 44],
                [44, 14, 36],
            ].forEach(([dx, dy, r]) => disc(g, c + dx, c + dy, r, C.grass, 4))
            disc(g, c - 10, c - 30, 7, C.pink, 2)
            disc(g, c + 40, c + 4, 7, C.pink, 2)
            break
        case 3:
            roof(g, c, c, 170, 200, C.roof)
            break
        case 4:
            roof(g, c, c, 170, 200, C.roofAlt)
            break
        case 5:
            roof(g, c, c, 200, 150, C.violet)
            break
        case 6:
            field(g, C.cropA)
            break
        case 7:
            field(g, C.cropB)
            break
        case 8:
            ;[
                [-50, -30, C.pink],
                [20, -50, C.yellow],
                [50, 10, C.violet],
                [-20, 30, C.yellow],
                [30, 60, C.pink],
                [-60, 50, C.violet],
            ].forEach(([dx, dy, color]) => {
                ;[0, 1, 2, 3, 4].forEach(k => {
                    const a = (k / 5) * Math.PI * 2
                    disc(g, c + dx + Math.cos(a) * 12, c + dy + Math.sin(a) * 12, 9, color, 2)
                })
                disc(g, c + dx, c + dy, 6, C.white, 2)
            })
            break
        case 9:
            disc(g, c - 30, c + 10, 46, C.rock)
            disc(g, c + 40, c - 20, 34, C.rockLight)
            disc(g, c + 30, c + 50, 24, C.rock)
            break
        case 10:
            oval(g, c, c, 210, 160, C.cyan)
            g.fillStyle(C.white, 0.8)
            g.fillEllipse(c - 40, c - 30, 50, 12)
            disc(g, c + 40, c + 20, 24, C.grass, 3)
            break
        case 11:
            poly(g, [c - 10, 20, c + 10, 20, c + 10, 236, c - 10, 236], C.white, 4)
            ;[40, 128, 216].forEach(y => poly(g, [c - 22, y - 12, c + 22, y - 12, c + 22, y + 12, c - 22, y + 12], C.white, 4))
            break
    }
}

function paintShip(g: G, i: number) {
    const cx = DRAWN.ship.w / 2
    poly(g, [cx - 40, 170, cx - 150, 290, cx - 140, 322, cx - 40, 292], C.pink)
    poly(g, [cx + 40, 170, cx + 150, 290, cx + 140, 322, cx + 40, 292], C.pink)
    ;[-57, 57].forEach(dx => poly(g, [cx + dx - 18, 296, cx + dx + 18, 296, cx + dx + 14, 366, cx + dx - 14, 366], C.indigoDark))
    oval(g, cx, 220, 150, 290, C.indigo)
    g.fillStyle(C.white, 1)
    g.fillEllipse(cx, 280, 64, 130)
    g.fillStyle(C.pink, 1)
    g.fillRect(cx - 7, 230, 14, 120)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeEllipse(cx, 220, 150, 290)
    disc(g, cx, 182, 50, C.glass)
    g.fillStyle(C.skin, 1)
    g.fillEllipse(cx, 166, 32, 16)
    disc(g, cx, 192, 30, C.hair, 4)
    g.fillStyle(C.hairShine, 1)
    g.fillRect(cx - 22, 200, 8, 26)
    g.fillRect(cx + 14, 200, 8, 26)
    poly(g, [cx + 16, 170, cx + 36, 160, cx + 38, 180, cx + 22, 184], C.cyan, 3)
    g.fillStyle(C.white, 0.55)
    g.fillEllipse(cx - 22, 158, 22, 12)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeCircle(cx, 182, 50)
    if (i === 0) {
        poly(g, [cx - 22, 100, cx + 22, 100, cx + 58, 16, cx - 58, 16], C.cyan)
        g.lineStyle(8, C.white, 1)
        g.lineBetween(cx - 50, 23, cx + 50, 23)
    } else if (i === 1) {
        disc(g, cx + 38, 96, 24, C.royal)
        poly(g, [cx - 20, 100, cx + 20, 100, cx + 20, 18, cx - 20, 18], C.royal)
        poly(g, [cx - 27, 44, cx + 27, 44, cx + 27, 60, cx - 27, 60], C.white, 4)
    } else {
        poly(g, [cx - 10, 100, cx + 10, 100, cx + 10, 74, cx - 10, 74], C.pink, 4)
        g.lineStyle(26, C.ink, 1)
        g.beginPath()
        g.arc(cx, 46, 34, 0, Math.PI, false)
        g.strokePath()
        g.lineStyle(17, C.pink, 1)
        g.beginPath()
        g.arc(cx, 46, 34, 0, Math.PI, false)
        g.strokePath()
        poly(g, [cx - 46, 14, cx - 24, 14, cx - 24, 40, cx - 46, 40], C.white, 4)
        poly(g, [cx + 24, 14, cx + 46, 14, cx + 46, 40, cx + 24, 40], C.white, 4)
    }
}

function paintPilot(g: G, i: number) {
    const cx = DRAWN.pilot.w / 2
    g.fillStyle(C.hair, 1)
    g.fillRoundedRect(cx - 150, 60, 300, 580, 80)
    g.fillStyle(C.hairShine, 1)
    g.fillRect(cx - 140, 260, 18, 380)
    g.fillRect(cx + 122, 260, 18, 380)
    poly(g, [cx - 150, 640, cx - 120, 430, cx + 120, 430, cx + 150, 640], C.ink, 4)
    poly(g, [cx - 110, 430, cx, 520, cx + 110, 430, cx + 70, 410, cx - 70, 410], C.white, 4)
    poly(g, [cx - 40, 470, cx, 450, cx + 40, 470, cx, 490], C.cyan, 4)
    g.fillStyle(C.pink, 1)
    g.fillRect(cx - 150, 470, 40, 12)
    g.fillRect(cx + 110, 470, 40, 12)
    g.fillStyle(C.skinDark, 1)
    g.fillRect(cx - 26, 340, 52, 80)
    disc(g, cx, 240, 118, C.skin)
    poly(g, [cx - 124, 230, cx - 124, 110, cx - 60, 60, cx + 60, 60, cx + 124, 110, cx + 124, 230, cx + 96, 230, cx + 96, 170, cx - 96, 170, cx - 96, 230], C.hair, 4)
    poly(g, [cx - 124, 230, cx - 96, 230, cx - 96, 330, cx - 124, 330], C.hair, 4)
    poly(g, [cx + 96, 230, cx + 124, 230, cx + 124, 330, cx + 96, 330], C.hair, 4)
    poly(g, [cx + 70, 96, cx + 110, 70, cx + 120, 110, cx + 90, 120], C.cyan, 4)
    const eyeY = 236
    ;[-46, 46].forEach(dx => {
        const x = cx + dx
        if (i === 2 && dx < 0) {
            g.lineStyle(6, C.ink, 1)
            g.beginPath()
            g.arc(x, eyeY + 6, 18, Math.PI * 1.1, Math.PI * 1.9, false)
            g.strokePath()
            return
        }
        oval(g, x, eyeY, i === 1 ? 46 : 40, i === 1 ? 54 : 46, C.white, 4)
        disc(g, x + 2, eyeY + 4, i === 1 ? 12 : 15, C.eye, 0)
        disc(g, x + 2, eyeY + 4, 6, C.ink, 0)
        disc(g, x - 4, eyeY - 4, 4, C.white, 0)
        g.lineStyle(7, C.ink, 1)
        g.lineBetween(x - 24, eyeY - 22, x + 24, eyeY - 26)
    })
    g.fillStyle(C.ink, 1)
    if (i === 0) {
        g.fillEllipse(cx, 300, 34, 18)
    } else if (i === 1) {
        g.fillCircle(cx, 304, 12)
        poly(g, [cx + 120, 170, cx + 132, 196, cx + 108, 196], C.cyan, 3)
    } else {
        poly(g, [cx - 30, 292, cx + 30, 292, cx, 320], C.ink, 0)
    }
    if (i === 0) {
        poly(g, [cx + 110, 440, cx + 150, 440, cx + 190, 330, cx + 160, 320], C.ink, 4)
        disc(g, cx + 178, 300, 30, C.skin)
    } else if (i === 1) {
        disc(g, cx - 100, 288, 30, C.skin)
        disc(g, cx + 100, 288, 30, C.skin)
    } else {
        poly(g, [cx + 110, 440, cx + 150, 440, cx + 200, 170, cx + 170, 160], C.ink, 4)
        disc(g, cx + 188, 140, 34, C.skin)
        sparkle(g, cx - 170, 120, 22, C.yellow)
        sparkle(g, cx + 120, 50, 16, C.yellow)
    }
}

function leavesPile(g: G, soaked: boolean) {
    const t = BASE
    const colors = soaked ? [0x8a5a3a, 0x6e4a32, 0x7a5236] : [C.orange, C.yellow, C.leafRed]
    const h = soaked ? 46 : 110
    oval(g, 192, t - h / 2 + 6, 250, h + 20, colors[0])
    const n = soaked ? 7 : 11
    for (let k = 0; k < n; k++) {
        const x = 90 + (k * 210) / (n - 1)
        const y = t - 10 - Math.sin((k / (n - 1)) * Math.PI) * (h - 18)
        leafShape(g, x, y, 24, (k * 0.9) % Math.PI, colors[k % 3])
    }
    if (soaked) {
        ;[
            [120, t + 24],
            [200, t + 34],
            [262, t + 20],
        ].forEach(([x, y]) => drop(g, x, y, 12))
    }
}

export function leafShape(g: G, x: number, y: number, r: number, angle: number, fill: number) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const at = (u: number, v: number) => [x + u * c - v * s, y + u * s + v * c]
    poly(g, [...at(-r, 0), ...at(-r * 0.3, -r * 0.55), ...at(r, 0), ...at(-r * 0.3, r * 0.55)], fill, 3)
    g.lineStyle(2, C.ink, 1)
    const a = at(-r * 0.8, 0)
    const b = at(r * 0.8, 0)
    g.lineBetween(a[0], a[1], b[0], b[1])
}

export function drop(g: G, x: number, y: number, r: number, fill: number = C.royal) {
    poly(g, [x, y - r * 2, x + r * 0.9, y - r * 0.2, x - r * 0.9, y - r * 0.2], fill, 0)
    disc(g, x, y, r, fill, 3)
    g.fillStyle(fill, 1)
    g.fillTriangle(x, y - r * 2, x + r * 0.9, y - r * 0.4, x - r * 0.9, y - r * 0.4)
    g.lineStyle(3, C.ink, 1)
    g.lineBetween(x, y - r * 2, x + r * 0.95, y - r * 0.3)
    g.lineBetween(x, y - r * 2, x - r * 0.95, y - r * 0.3)
}

export function face(g: G, x: number, y: number, mood: 'worry' | 'happy' | 'scared') {
    g.fillStyle(C.face, 1)
    g.fillCircle(x - 16, y, 6)
    g.fillCircle(x + 16, y, 6)
    g.lineStyle(4, C.face, 1)
    if (mood === 'happy') {
        g.beginPath()
        g.arc(x, y + 10, 14, 0.2, Math.PI - 0.2, false)
        g.strokePath()
    } else {
        g.lineBetween(x - 24, y - 14, x - 10, y - 10)
        g.lineBetween(x + 24, y - 14, x + 10, y - 10)
        if (mood === 'scared') g.strokeCircle(x, y + 20, 7)
        else {
            g.beginPath()
            g.arc(x, y + 26, 12, Math.PI + 0.3, -0.3, false)
            g.strokePath()
        }
    }
}

function flames(g: G, top: number, tall: number) {
    const base = 150
    ;[
        [120, 0.7],
        [160, 1],
        [200, 0.85],
        [240, 1.05],
        [272, 0.7],
    ].forEach(([x, k]) => poly(g, [x - 26, base, x, base - tall * k - top, x + 26, base], C.red, 4))
    ;[
        [150, 0.55],
        [200, 0.6],
        [245, 0.5],
    ].forEach(([x, k]) => poly(g, [x - 14, base, x, base - tall * k - top, x + 14, base], C.flame, 3))
}

function treeThing(g: G, state: 'fire' | 'saved' | 'big') {
    const t = BASE
    poly(g, [178, t, 180, 200, 204, 200, 206, t], C.trunk)
    disc(g, 192, 166, 76, state === 'saved' ? C.crown : 0x6fb85a)
    if (state !== 'saved') flames(g, state === 'big' ? 40 : 0, state === 'big' ? 120 : 70)
    face(g, 192, 176, state === 'saved' ? 'happy' : state === 'big' ? 'scared' : 'worry')
    if (state === 'saved') {
        drop(g, 130, 110, 9)
        drop(g, 262, 130, 9)
        drop(g, 200, 82, 8)
    }
}

export function sheep(g: G, x: number, y: number, mood: 'scared' | 'happy' | 'wet' | 'dizzy', legsOut = false) {
    const wool = mood === 'wet' ? 0xc9d6ee : C.wool
    g.lineStyle(10, C.ink, 1)
    ;[-40, -14, 14, 40].forEach((dx, k) => {
        const ox = legsOut ? (k < 2 ? -18 : 18) : 0
        g.lineBetween(x + dx, y + 30, x + dx + ox, y + 64)
    })
    const puffs = mood === 'wet' ? [[-50, 6, 28], [-16, -4, 32], [20, -2, 30], [52, 8, 26], [0, 22, 36]] : [[-56, 0, 34], [-20, -24, 38], [22, -22, 36], [56, 0, 32], [-30, 20, 34], [24, 22, 34]]
    puffs.forEach(([dx, dy, r]) => disc(g, x + dx, y + dy, r, wool, 4))
    g.fillStyle(wool, 1)
    g.fillEllipse(x, y + 4, 130, 60)
    disc(g, x + 78, y - 6, 30, C.face, 4)
    g.fillStyle(C.white, 1)
    if (mood === 'dizzy') {
        g.lineStyle(3, C.white, 1)
        g.strokeCircle(x + 70, y - 12, 7)
        g.strokeCircle(x + 88, y - 12, 7)
    } else {
        g.fillCircle(x + 70, y - 12, 7)
        g.fillCircle(x + 88, y - 12, 7)
        g.fillStyle(C.ink, 1)
        g.fillCircle(x + 72, y - 11, 3.5)
        g.fillCircle(x + 90, y - 11, 3.5)
    }
    g.lineStyle(3, C.white, 1)
    if (mood === 'happy') {
        g.beginPath()
        g.arc(x + 80, y + 4, 8, 0.2, Math.PI - 0.2, false)
        g.strokePath()
    } else if (mood === 'wet') {
        g.lineBetween(x + 64, y - 24, x + 76, y - 20)
        g.lineBetween(x + 96, y - 24, x + 84, y - 20)
        g.lineBetween(x + 72, y + 10, x + 88, y + 10)
    } else if (mood === 'scared') {
        g.strokeCircle(x + 80, y + 10, 5)
    }
    if (mood === 'wet') {
        drop(g, x - 40, y + 50, 9)
        drop(g, x + 20, y + 54, 9)
    }
}

function paintThing(g: G, i: number) {
    const t = BASE
    if (![5, 10, 11].includes(i)) g.translateCanvas(0, 60)
    switch (i) {
        case 0:
            leavesPile(g, false)
            break
        case 1:
            g.lineStyle(5, C.grassDark, 1)
            g.lineBetween(192, t - 6, 192, t - 44)
            ;[0, 1, 2, 3, 4].forEach(k => {
                const a = (k / 5) * Math.PI * 2
                disc(g, 192 + Math.cos(a) * 16, t - 56 + Math.sin(a) * 16, 12, C.pink, 3)
            })
            disc(g, 192, t - 56, 9, C.yellow, 3)
            sparkle(g, 250, t - 80, 14, C.yellow)
            break
        case 2:
            treeThing(g, 'fire')
            break
        case 3:
            treeThing(g, 'saved')
            break
        case 4:
            sheep(g, 182, t - 70, 'scared')
            break
        case 5:
            sheep(g, 172, 180, 'happy', true)
            sparkle(g, 300, 90, 16, C.yellow)
            break
        case 7:
            leavesPile(g, true)
            break
        case 8:
            treeThing(g, 'big')
            break
        case 9:
            sheep(g, 182, t - 64, 'wet')
            break
        case 10:
            g.save()
            g.translateCanvas(192, 192)
            g.rotateCanvas(Math.PI * 0.85)
            sheep(g, -10, 0, 'dizzy', true)
            g.restore()
            sparkle(g, 80, 80, 14, C.yellow)
            sparkle(g, 300, 110, 12, C.yellow)
            break
        case 11:
            leafShape(g, 192, 192, 120, -0.5, C.orange)
            break
    }
}

function paintPiece(g: G, i: number) {
    const c = DRAWN.piece.w / 2
    switch (i) {
        case 0:
            poly(g, [56, c - 30, 150, c - 64, 150, c + 64, 56, c + 30], C.cyan)
            g.lineStyle(10, C.white, 1)
            g.lineBetween(144, c - 56, 144, c + 56)
            g.lineStyle(9, C.white, 1)
            ;[-34, 0, 34].forEach(dy => g.lineBetween(172, c + dy, 214 - Math.abs(dy) * 0.3, c + dy))
            break
        case 1:
            disc(g, 74, c - 40, 30, C.royal)
            poly(g, [52, c - 24, 150, c - 24, 150, c + 24, 52, c + 24], C.royal)
            poly(g, [118, c - 32, 134, c - 32, 134, c + 32, 118, c + 32], C.white, 4)
            drop(g, 176, c + 4, 11)
            drop(g, 204, c - 20, 9)
            drop(g, 210, c + 30, 9)
            break
        case 2:
            g.lineStyle(40, C.ink, 1)
            g.beginPath()
            g.arc(120, c, 52, Math.PI * 0.5, Math.PI * 1.5, false)
            g.strokePath()
            g.lineStyle(28, C.pink, 1)
            g.beginPath()
            g.arc(120, c, 52, Math.PI * 0.5, Math.PI * 1.5, false)
            g.strokePath()
            poly(g, [116, c - 68, 156, c - 68, 156, c - 38, 116, c - 38], C.white, 4)
            poly(g, [116, c + 38, 156, c + 38, 156, c + 68, 116, c + 68], C.white, 4)
            g.lineStyle(7, C.pink, 1)
            g.beginPath()
            g.arc(170, c, 30, -0.9, 0.9, false)
            g.strokePath()
            g.beginPath()
            g.arc(170, c, 54, -0.7, 0.7, false)
            g.strokePath()
            break
        case 3:
            poly(g, [c, 40, c + 80, 130, c + 34, 130, c + 34, 210, c - 34, 210, c - 34, 130, c - 80, 130], C.white, 7)
            break
        case 4:
            drop(g, c, c + 30, 44)
            break
        case 5:
            sparkle(g, c, c, 90, C.yellow, 5)
            break
    }
}

export function ensureArt(scene: Phaser.Scene) {
    const missing = (key: string) => !scene.textures.exists(key)
    if (missing(GROUND.earth)) bake(scene, GROUND.earth, GROUND_TILE.w, GROUND_TILE.h, null, g => paintGround(g))
    if (missing(CLOUD)) bake(scene, CLOUD, 320, 160, null, g => paintCloud(g))
    if (missing(SCENERY.earth)) bake(scene, SCENERY.earth, SCENERY_CELL.earth * 4, SCENERY_CELL.earth * 3, { w: SCENERY_CELL.earth, h: SCENERY_CELL.earth }, paintScenery, { w: 256, h: 256 })
    if (missing(SHIP)) bake(scene, SHIP, SHIP_CELL.w * 3, SHIP_CELL.h, { w: SHIP_CELL.w, h: SHIP_CELL.h }, paintShip, DRAWN.ship)
    if (missing(PILOT)) bake(scene, PILOT, PILOT_CELL.w * 3, PILOT_CELL.h, { w: PILOT_CELL.w, h: PILOT_CELL.h }, paintPilot, DRAWN.pilot)
    if (missing(THINGS.earth)) bake(scene, THINGS.earth, THING_CELL.earth * 4, THING_CELL.earth * 3, { w: THING_CELL.earth, h: THING_CELL.earth }, paintThing, DRAWN.thing)
    if (missing(PIECES)) bake(scene, PIECES, PIECE_SIZE * 3, PIECE_SIZE * 2, { w: PIECE_SIZE, h: PIECE_SIZE }, paintPiece, DRAWN.piece)
    ensurePlaces(scene)
}
