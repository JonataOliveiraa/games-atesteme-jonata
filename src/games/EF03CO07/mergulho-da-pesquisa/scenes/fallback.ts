import Phaser from 'phaser'
import { CELL, CLIENT_CELL, CLIENTS, FINDS, PLACES, SUBS } from '../data/files'
import { C } from '../data/theme'

export type G = Phaser.GameObjects.Graphics

export function bake(scene: Phaser.Scene, key: string, w: number, h: number, cell: { w: number; h: number } | null, paint: (g: G, i: number) => void) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    const cols = cell ? Math.floor(w / cell.w) : 1
    const rows = cell ? Math.floor(h / cell.h) : 1
    for (let i = 0; i < cols * rows; i++) {
        g.save()
        if (cell) g.translateCanvas((i % cols) * cell.w, Math.floor(i / cols) * cell.h)
        paint(g, i)
        g.restore()
    }
    g.generateTexture(key, w, h)
    g.destroy()
    const texture = scene.textures.get(key)
    if (cell) for (let i = 0; i < cols * rows; i++) texture.add(i, 0, (i % cols) * cell.w, Math.floor(i / cols) * cell.h, cell.w, cell.h)
    ;(texture.customData as { fallback?: boolean }).fallback = true
}

export function ensureArt(scene: Phaser.Scene) {
    const grid = { w: CELL, h: CELL }
    if (!scene.textures.exists(PLACES)) bake(scene, PLACES, CELL * 4, CELL * 2, grid, (g, i) => PLACE_PAINT[i]?.(g))
    if (!scene.textures.exists(FINDS)) bake(scene, FINDS, CELL * 4, CELL * 6, grid, (g, i) => FIND_PAINT[i]?.(g))
    if (!scene.textures.exists(SUBS)) bake(scene, SUBS, CELL * 4, CELL * 2, grid, (g, i) => SUB_PAINT[i]?.(g))
    if (!scene.textures.exists(CLIENTS)) bake(scene, CLIENTS, CLIENT_CELL * 4, CLIENT_CELL * 3, { w: CLIENT_CELL, h: CLIENT_CELL }, (g, i) => client(g, Math.floor(i / 4), i % 4))
}

const box = (g: G, x: number, y: number, w: number, h: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

const dot = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillCircle(x, y, r)
}

const oval = (g: G, x: number, y: number, w: number, h: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillEllipse(x, y, w, h)
}

const line = (g: G, x1: number, y1: number, x2: number, y2: number, width: number, color: number, alpha = 1) => {
    g.lineStyle(width, color, alpha)
    g.lineBetween(x1, y1, x2, y2)
}

const capsule = (g: G, x1: number, y1: number, x2: number, y2: number, width: number, color: number) => {
    line(g, x1, y1, x2, y2, width, color)
    dot(g, x1, y1, width / 2, color)
    dot(g, x2, y2, width / 2, color)
}

const arc = (g: G, x: number, y: number, r: number, from: number, to: number, width: number, color: number) => {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

const ring = (g: G, x: number, y: number, w: number, h: number, r: number, width = 4) => {
    g.lineStyle(width, C.ink, 1)
    g.strokeRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

const PLACE_PAINT: Record<number, (g: G) => void> = {
    0: g => {
        g.fillStyle(0xb0784a, 1)
        g.fillTriangle(40, 200, 220, 170, 200, 240)
        g.fillTriangle(40, 200, 200, 240, 60, 240)
        line(g, 120, 186, 150, 70, 7, 0x8a5a36)
        g.fillStyle(C.pink, 1)
        g.fillTriangle(150, 74, 150, 110, 196, 92)
        dot(g, 110, 214, 13, C.aqua)
        dot(g, 110, 214, 7, C.light)
    },
    1: g => {
        g.fillStyle(C.rock, 1)
        g.fillEllipse(128, 190, 210, 150)
        g.fillRect(23, 190, 210, 50)
        oval(g, 128, 210, 90, 76, C.dark)
        g.fillStyle(C.aqua, 1)
        g.fillTriangle(54, 150, 64, 120, 74, 150)
        g.fillTriangle(184, 140, 194, 112, 204, 140)
    },
    2: g => {
        capsule(g, 70, 238, 52, 140, 16, C.pink)
        capsule(g, 60, 190, 30, 160, 12, C.pink)
        capsule(g, 186, 238, 206, 130, 16, C.lemon)
        capsule(g, 200, 180, 228, 156, 12, C.lemon)
        capsule(g, 100, 238, 92, 120, 12, C.aqua)
        capsule(g, 160, 238, 168, 112, 12, C.lilac)
        oval(g, 128, 236, 200, 22, C.pinkDark, 0.6)
    },
    3: g => {
        g.fillStyle(0x9a6040, 1)
        g.fillRect(56, 100, 144, 40)
        g.fillStyle(C.glow, 0.6)
        g.fillEllipse(128, 150, 120, 40)
        box(g, 50, 140, 156, 100, 10, 0xb0784a)
        box(g, 50, 140, 156, 14, 6, C.lemonDark)
        box(g, 118, 160, 20, 26, 4, C.lemonDark)
    },
    4: g => {
        g.fillStyle(C.pink, 1)
        g.slice(128, 238, 100, Math.PI, Math.PI * 2, false)
        g.fillPath()
        for (let i = 1; i < 6; i++) {
            const a = Math.PI + (Math.PI * i) / 6
            line(g, 128, 238, 128 + Math.cos(a) * 96, 238 + Math.sin(a) * 96, 4, C.pinkDark)
        }
        oval(g, 128, 230, 110, 26, C.glow, 0.7)
    },
    5: g => {
        oval(g, 120, 206, 170, 70, 0xe58a5a)
        box(g, 196, 192, 40, 28, 8, 0xe58a5a)
        line(g, 60, 206, 180, 206, 5, 0xc06a40)
        ;[[240, 170, 8], [226, 140, 6], [244, 116, 5]].forEach(([x, y, r]) => dot(g, x, y, r, C.white, 0.8))
    },
    6: g => {
        g.fillStyle(C.white, 1)
        g.fillTriangle(96, 240, 160, 240, 140, 70)
        g.fillTriangle(96, 240, 140, 70, 116, 70)
        for (let i = 0; i < 4; i++) {
            g.fillStyle(C.pink, 1)
            const y = 220 - i * 44
            g.fillRect(100 + i * 5, y - 12, 56 - i * 10, 16)
        }
        dot(g, 128, 62, 20, C.aqua)
        dot(g, 128, 62, 32, C.aqua, 0.3)
    },
    7: g => {
        oval(g, 128, 210, 200, 90, C.lilac)
        g.fillStyle(C.lilac, 1)
        g.fillRect(28, 210, 200, 30)
        ;[70, 110, 190].forEach(x => {
            g.lineStyle(8, 0x5fc46a, 1)
            g.beginPath()
            g.moveTo(x, 180)
            g.lineTo(x - 10, 140)
            g.lineTo(x + 6, 100)
            g.lineTo(x - 4, 70)
            g.strokePath()
        })
        g.fillStyle(C.lemon, 1)
        g.fillPoints(star(150, 186, 22, 10), true)
    },
}

function star(x: number, y: number, outer: number, inner: number) {
    const pts: Phaser.Types.Math.Vector2Like[] = []
    for (let i = 0; i < 10; i++) {
        const r = i % 2 ? inner : outer
        const a = -Math.PI / 2 + (Math.PI * i) / 5
        pts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r })
    }
    return pts
}

type Look = { flying?: boolean; close?: boolean; erupting?: boolean; jumping?: boolean; baby?: boolean; crayon?: boolean }

function toucan(g: G, x: number, y: number, s: number, look: Look = {}) {
    const k = look.crayon ? 0.9 : 1
    if (look.close) {
        dot(g, x - 30 * s, y, 46 * s, C.toucan)
        dot(g, x - 40 * s, y - 8 * s, 12 * s, C.white)
        dot(g, x - 38 * s, y - 8 * s, 6 * s, C.ink)
        g.fillStyle(C.beak, 1)
        g.fillTriangle(x - 4 * s, y - 26 * s, x - 4 * s, y + 18 * s, x + 76 * s, y + 10 * s)
        g.fillStyle(C.lava, 1)
        g.fillTriangle(x + 56 * s, y + 4 * s, x + 76 * s, y + 10 * s, x + 60 * s, y + 14 * s)
        return
    }
    if (look.flying) {
        g.fillStyle(C.toucan, 1)
        g.fillTriangle(x - 10 * s, y, x - 60 * s, y - 50 * s, x + 10 * s, y - 6 * s)
        g.fillTriangle(x - 10 * s, y, x - 40 * s, y + 46 * s, x + 10 * s, y + 6 * s)
    } else {
        line(g, x - 50 * s, y + 42 * s, x + 50 * s, y + 42 * s, 7 * s, 0x8a5a36)
    }
    oval(g, x - 8 * s, y + 6 * s, 52 * s * k, 70 * s, C.toucan)
    oval(g, x + 2 * s, y - 6 * s, 24 * s, 26 * s, C.white)
    dot(g, x + 4 * s, y - 20 * s, 8 * s, C.white)
    dot(g, x + 6 * s, y - 20 * s, 4 * s, C.ink)
    g.fillStyle(C.beak, 1)
    g.fillTriangle(x + 12 * s, y - 28 * s, x + 12 * s, y - 8 * s, x + 54 * s, y - 14 * s)
}

function volcano(g: G, x: number, y: number, s: number, look: Look = {}) {
    g.fillStyle(0x9a6aa8, 1)
    g.fillTriangle(x - 60 * s, y + 44 * s, x + 60 * s, y + 44 * s, x, y - 34 * s)
    g.fillStyle(0x7a4a8a, 1)
    g.fillRect(x - 16 * s, y - 30 * s, 32 * s, 10 * s)
    if (look.erupting) {
        g.fillStyle(C.lava, 1)
        g.fillTriangle(x - 12 * s, y - 24 * s, x + 12 * s, y - 24 * s, x, y + 10 * s)
        ;[[-14, -50, 10], [10, -58, 12], [-2, -72, 9], [24, -44, 7]].forEach(([dx, dy, r]) => dot(g, x + dx * s, y + dy * s, r * s, C.lava))
        dot(g, x, y - 46 * s, 10 * s, C.orange)
    } else {
        ;[[-8, -46, 9], [6, -56, 11], [-4, -68, 8]].forEach(([dx, dy, r]) => dot(g, x + dx * s, y + dy * s, r * s, 0xd8d0e8))
    }
}

function whale(g: G, x: number, y: number, s: number, look: Look = {}) {
    g.save()
    g.translateCanvas(x, y)
    if (look.jumping) g.rotateCanvas(-0.5)
    oval(g, 0, 0, 110 * s, 56 * s, C.whale)
    oval(g, 6 * s, 12 * s, 80 * s, 24 * s, 0xb8d4ff)
    g.fillStyle(C.whale, 1)
    g.fillTriangle(-50 * s, 0, -78 * s, -22 * s, -74 * s, 14 * s)
    dot(g, 28 * s, -6 * s, 4 * s, C.ink)
    g.restore()
    if (look.jumping) {
        arc(g, x - 10 * s, y + 52 * s, 40 * s, Math.PI * 1.1, Math.PI * 1.9, 5 * s, C.aqua)
        ;[[-40, 40], [20, 44], [-10, 56]].forEach(([dx, dy]) => dot(g, x + dx * s, y + dy * s, 5 * s, C.aqua))
    }
    if (look.baby) {
        oval(g, x + 34 * s, y + 34 * s, 46 * s, 24 * s, C.whale)
        dot(g, x + 46 * s, y + 30 * s, 2.5 * s, C.ink)
    }
}

type Pic = (g: G, x: number, y: number, s: number) => void

function photo(g: G, pic: Pic) {
    box(g, 38, 24, 180, 208, 8, C.white)
    ring(g, 38, 24, 180, 208, 8, 3)
    box(g, 50, 36, 156, 150, 4, 0xbfe9ff)
    pic(g, 128, 112, 1.1)
}

function video(g: G, pic: Pic) {
    box(g, 22, 50, 212, 156, 14, C.film)
    for (let i = 0; i < 9; i++) {
        box(g, 32 + i * 22, 56, 12, 10, 2, C.white)
        box(g, 32 + i * 22, 190, 12, 10, 2, C.white)
    }
    box(g, 36, 72, 184, 112, 6, 0xbfe9ff)
    pic(g, 128, 128, 0.95)
}

function text(g: G, pic: Pic) {
    box(g, 50, 20, 156, 216, 8, C.paper)
    ring(g, 50, 20, 156, 216, 8, 3)
    box(g, 62, 34, 64, 54, 6, 0xbfe9ff)
    pic(g, 94, 62, 0.42)
    for (let i = 0; i < 8; i++) {
        const y = 104 + i * 15
        const w = i % 3 === 2 ? 80 : 120
        line(g, 66, y, 66 + w, y, 4, C.paperLine)
    }
    for (let i = 0; i < 3; i++) line(g, 136, 44 + i * 14, 192, 44 + i * 14, 4, C.paperLine)
}

function drawing(g: G, pic: Pic) {
    box(g, 30, 34, 196, 188, 6, C.paper)
    for (let i = 0; i < 7; i++) line(g, 30, 60 + i * 24, 226, 60 + i * 24, 2, 0xcfe2ff)
    ring(g, 30, 34, 196, 188, 6, 3)
    pic(g, 128, 128, 1)
    g.lineStyle(5, C.pink, 0.8)
    g.beginPath()
    g.moveTo(50, 200)
    for (let i = 0; i < 9; i++) g.lineTo(60 + i * 18, 196 + (i % 2) * 10)
    g.strokePath()
    dot(g, 200, 64, 14, C.lemon)
}

const FIND_PAINT: Record<number, (g: G) => void> = {
    0: g => photo(g, (g2, x, y, s) => toucan(g2, x, y, s)),
    1: g => photo(g, (g2, x, y, s) => toucan(g2, x, y, s, { flying: true })),
    2: g => photo(g, (g2, x, y, s) => toucan(g2, x, y, s, { close: true })),
    3: g => drawing(g, (g2, x, y, s) => toucan(g2, x, y, s, { crayon: true })),
    4: g => {
        oval(g, 128, 226, 150, 20, C.shadow, 0.15)
        toucan(g, 120, 140, 1.5)
        g.lineStyle(3, C.white, 0.9)
        for (let i = 0; i < 6; i++) g.lineBetween(100, 104 + i * 18, 108, 110 + i * 18)
        dot(g, 112, 150, 10, C.lilac)
    },
    5: g => {
        oval(g, 128, 160, 120, 200, C.lemon)
        oval(g, 128, 160, 96, 176, 0xfff7b8)
        g.lineStyle(14, C.pink, 1)
        g.beginPath()
        g.moveTo(84, 150)
        g.lineTo(128, 110)
        g.lineTo(172, 150)
        g.strokePath()
        toucan(g, 128, 106, 0.6)
    },
    6: g => video(g, (g2, x, y, s) => toucan(g2, x, y, s)),
    7: g => text(g, (g2, x, y, s) => toucan(g2, x, y, s)),
    8: g => video(g, (g2, x, y, s) => volcano(g2, x, y, s, { erupting: true })),
    9: g => video(g, (g2, x, y, s) => volcano(g2, x, y, s)),
    10: g => photo(g, (g2, x, y, s) => volcano(g2, x, y, s)),
    11: g => {
        box(g, 30, 196, 196, 24, 6, 0xc98f4c)
        volcano(g, 128, 150, 1.3)
        dot(g, 128, 104, 8, C.lava)
    },
    12: g => drawing(g, (g2, x, y, s) => volcano(g2, x, y, s, { erupting: true })),
    13: g => text(g, (g2, x, y, s) => volcano(g2, x, y, s)),
    14: g => text(g, (g2, x, y, s) => whale(g2, x, y, s)),
    15: g => text(g, (g2, x, y, s) => whale(g2, x, y, s, { baby: true })),
    16: g => photo(g, (g2, x, y, s) => whale(g2, x, y, s)),
    17: g => photo(g, (g2, x, y, s) => whale(g2, x, y, s, { jumping: true })),
    18: g => video(g, (g2, x, y, s) => whale(g2, x, y, s, { jumping: true })),
    19: g => {
        whale(g, 128, 140, 1.6)
        dot(g, 150, 116, 12, C.white, 0.8)
        g.lineStyle(10, C.lemon, 1)
        g.strokeEllipse(128, 160, 150, 50)
    },
    20: g => drawing(g, (g2, x, y, s) => whale(g2, x, y, s)),
}

function submarine(g: G, blue: boolean, moving: boolean) {
    const body = blue ? C.aqua : C.lemon
    const dark = blue ? C.violet : C.lemonDark
    if (moving) {
        ;[[30, 128, 9], [16, 112, 6], [10, 140, 5]].forEach(([x, y, r]) => dot(g, x, y, r, C.white, 0.8))
        arc(g, 44, 128, 18, -1.2, 1.2, 4, C.white)
    } else {
        box(g, 34, 112, 14, 32, 6, dark)
    }
    if (blue) {
        g.fillStyle(C.lilac, 1)
        g.fillTriangle(110, 84, 150, 84, 120, 56)
        oval(g, 132, 128, 196, 100, body)
        g.fillStyle(body, 1)
        g.fillTriangle(46, 128, 22, 96, 22, 160)
        ;[96, 130, 164].forEach(x => g.fillPoints(star(x, 150, 7, 3), true))
        dot(g, 190, 120, 26, C.white)
        dot(g, 190, 120, 20, 0xbff6ff)
    } else {
        box(g, 112, 58, 18, 34, 6, dark)
        box(g, 112, 56, 34, 12, 6, dark)
        oval(g, 128, 130, 200, 104, body)
        box(g, 60, 116, 140, 12, 6, C.pink)
        g.fillStyle(C.aqua, 1)
        g.fillTriangle(70, 172, 110, 172, 80, 196)
        dot(g, 186, 122, 24, C.white)
        dot(g, 186, 122, 18, 0xbff6ff)
    }
    dot(g, 226, 136, 7, C.glow)
    g.lineStyle(3, C.ink, 0.8)
    g.strokeEllipse(blue ? 132 : 128, blue ? 128 : 130, blue ? 196 : 200, blue ? 100 : 104)
}

const SUB_PAINT: Record<number, (g: G) => void> = {
    0: g => submarine(g, false, false),
    1: g => submarine(g, false, true),
    2: g => submarine(g, true, false),
    3: g => submarine(g, true, true),
    4: g => {
        dot(g, 128, 128, 36, C.aqua, 0.85)
        dot(g, 116, 114, 10, C.white)
        g.lineStyle(3, C.ink, 0.7)
        g.strokeCircle(128, 128, 36)
    },
    5: g => {
        for (let i = 0; i < 10; i++) {
            const a = (Math.PI * 2 * i) / 10
            dot(g, 128 + Math.cos(a) * 40, 128 + Math.sin(a) * 40, 5, C.aqua)
        }
    },
}

const CLIENT_LOOK = [
    { body: 0x2c3460, belly: C.white, extra: 'penguin' },
    { body: 0xc9905c, belly: 0xffe9cc, extra: 'otter' },
    { body: 0xb6aee0, belly: 0xebe6ff, extra: 'seal' },
] as const

function client(g: G, who: number, pose: number) {
    const look = CLIENT_LOOK[who]
    const lift = pose === 2 ? 16 : 0
    const cx = 175
    const foot = 324 - lift
    oval(g, cx, 324, 140, 18, C.shadow, 0.15)
    oval(g, cx, foot - 90, 150, 170, look.body)
    oval(g, cx + 8, foot - 74, 100, 120, look.belly)
    const hand = pose === 0 ? [cx + 70, foot - 190] : pose === 3 ? [cx + 96, foot - 60] : pose === 1 ? [cx + 20, foot - 96] : [cx + 70, foot - 200]
    capsule(g, cx + 50, foot - 120, hand[0], hand[1], 22, look.body)
    capsule(g, cx - 56, foot - 120, pose === 2 ? cx - 76 : cx - 66, pose === 2 ? foot - 200 : foot - 70, 22, look.body)
    const ey = foot - 140
    if (pose === 2) {
        arc(g, cx - 14, ey, 12, Math.PI * 1.1, Math.PI * 1.9, 5, C.ink)
        arc(g, cx + 30, ey, 12, Math.PI * 1.1, Math.PI * 1.9, 5, C.ink)
    } else {
        ;[cx - 14, cx + 30].forEach(x => {
            oval(g, x, ey, 26, 32, C.white)
            oval(g, x + 2, ey + 3, 16, 22, 0x6a3fd0)
            dot(g, x - 2, ey - 4, 4, C.white)
        })
    }
    dot(g, cx - 34, ey + 22, 8, C.pink, 0.6)
    dot(g, cx + 52, ey + 22, 8, C.pink, 0.6)
    if (pose === 3) {
        line(g, cx - 4, ey + 30, cx + 20, ey + 26, 4, C.ink)
        dot(g, cx + 64, ey - 30, 7, 0x9fd4f7)
    } else {
        arc(g, cx + 8, ey + 22, 12, Math.PI * 0.15, Math.PI * 0.85, 4, C.ink)
    }
    if (look.extra === 'penguin') {
        g.fillStyle(C.orange, 1)
        g.fillTriangle(cx + 2, ey + 12, cx + 16, ey + 12, cx + 9, ey + 22)
        box(g, cx - 50, foot - 236, 110, 34, 16, C.lemon)
        box(g, cx - 80, foot - 214, 46, 12, 6, C.lemonDark)
        box(g, cx - 10, foot - 60, 44, 30, 6, C.ink)
        dot(g, cx + 12, foot - 45, 9, C.aqua)
    }
    if (look.extra === 'otter') {
        oval(g, cx + 8, ey + 18, 50, 30, look.belly)
        dot(g, cx + 8, ey + 10, 6, C.ink)
        g.lineStyle(4, C.violet, 1)
        g.strokeCircle(cx - 14, ey, 18)
        g.strokeCircle(cx + 30, ey, 18)
        box(g, cx - 54, foot - 112, 120, 18, 8, C.pink)
    }
    if (look.extra === 'seal') {
        line(g, cx - 24, ey + 18, cx - 50, ey + 14, 2, C.ink)
        line(g, cx + 40, ey + 18, cx + 66, ey + 14, 2, C.ink)
        oval(g, cx - 6, foot - 228, 120, 34, C.aqua)
        dot(g, cx - 6, foot - 248, 8, C.aqua)
        capsule(g, cx + 60, foot - 200, cx + 84, foot - 172, 8, C.lemon)
    }
    if (pose === 2) {
        g.fillStyle(C.lemon, 1)
        g.fillPoints(star(cx - 80, foot - 220, 12, 5), true)
        g.fillPoints(star(cx + 92, foot - 180, 10, 4), true)
    }
}
