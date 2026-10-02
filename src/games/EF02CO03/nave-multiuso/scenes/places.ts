import Phaser from 'phaser'
import { GROUND, GROUND_TILE, SCENERY, SCENERY_CELL, STREAKS, THINGS, THING_CELL } from '../data/files'
import { H, W } from '../data/layout'
import { C } from '../data/theme'
import { bake, disc, drop, face, oval, poly, sheep, sparkle, type G } from './fallback'

type Mood = 'worry' | 'happy' | 'scared'

const THING_DRAWN = { w: 384, h: 384 }
const SCENERY_DRAWN = { w: 256, h: 256 }

const S = {
    void: 0x16124a,
    nebula: 0x2a1f6e,
    star: 0xffffff,
    rock: 0x8c7aa8,
    rockDark: 0x6a5a88,
    dust: 0x9b5cff,
    dustPink: 0xff86c8,
    dustLight: 0xc9b6ff,
    goo: 0x4a3a6a,
    moon: 0xb7b3cc,
    moonDark: 0xa29dbb,
    crater: 0x9f99b8,
    boulder: 0x8d87a8,
    moonDust: 0xc9c4dc,
    moonDustDark: 0xa9a3c4,
    moonDustLight: 0xdcd8ea,
    mud: 0x6f6a86,
    crystal: 0x5ee0ff,
    glass: 0x9ff0ff,
} as const

function seeded(seed: number) {
    let t = seed
    return () => {
        t += 0x6d2b79f5
        let r = Math.imul(t ^ (t >>> 15), 1 | t)
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    }
}

function paintSpace(g: G) {
    const { w, h } = GROUND_TILE
    const rand = seeded(7)
    g.fillStyle(S.void, 1)
    g.fillRect(0, 0, w, h)
    for (let k = 0; k < 7; k++) {
        const r = 90 + rand() * 90
        g.fillStyle(S.nebula, 0.55)
        g.fillCircle(r + rand() * (w - 2 * r), r + rand() * (h - 2 * r), r)
    }
    for (let k = 0; k < 170; k++) {
        const r = 1 + rand() * 2.2
        g.fillStyle(S.star, 0.5 + rand() * 0.5)
        g.fillCircle(6 + rand() * (w - 12), 6 + rand() * (h - 12), r)
    }
    for (let k = 0; k < 14; k++) sparkle(g, 20 + rand() * (w - 40), 20 + rand() * (h - 40), 6 + rand() * 6, rand() < 0.5 ? C.yellow : C.white, 0)
}

function crater(g: G, x: number, y: number, r: number) {
    g.fillStyle(S.crater, 1)
    g.fillCircle(x, y, r)
    g.fillStyle(S.moonDark, 1)
    g.fillCircle(x + r * 0.15, y + r * 0.15, r * 0.75)
    g.lineStyle(3, C.ink, 0.18)
    g.strokeCircle(x, y, r)
    g.fillStyle(C.white, 0.18)
    g.fillEllipse(x - r * 0.35, y - r * 0.45, r * 0.6, r * 0.25)
}

function paintMoon(g: G) {
    const { w, h } = GROUND_TILE
    const rand = seeded(11)
    g.fillStyle(S.moon, 1)
    g.fillRect(0, 0, w, h)
    for (let k = 0; k < 18; k++) {
        const r = 40 + rand() * 90
        g.fillStyle(S.moonDark, 0.6)
        g.fillEllipse(r + rand() * (w - 2 * r), r + rand() * (h - 2 * r), r * 2, r * 1.4)
    }
    for (let k = 0; k < 12; k++) {
        const r = 10 + rand() * 30
        crater(g, r + 4 + rand() * (w - 2 * r - 8), r + 4 + rand() * (h - 2 * r - 8), r)
    }
    g.fillStyle(S.moonDark, 1)
    for (let k = 0; k < 50; k++) g.fillCircle(4 + rand() * (w - 8), 4 + rand() * (h - 8), 1.5 + rand() * 2)
}

function paintStreaks(g: G) {
    const rand = seeded(3)
    for (let k = 0; k < 46; k++) {
        const len = 20 + rand() * 50
        const x = 4 + rand() * (W - 8)
        const y = rand() * (H - len)
        g.lineStyle(1.5 + rand() * 1.5, C.white, 0.4 + rand() * 0.5)
        g.lineBetween(x, y, x, y + len)
    }
}

function rough(g: G, cx: number, cy: number, r: number, fill: number, seed: number, line = 5) {
    const rand = seeded(seed)
    const flat: number[] = []
    for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2
        const rr = r * (0.82 + rand() * 0.3)
        flat.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
    }
    poly(g, flat, fill, line)
}

function paintSpaceScenery(g: G, i: number) {
    const c = 128
    switch (i) {
        case 0:
            disc(g, c, c, 66, C.pink)
            g.lineStyle(16, C.ink, 1)
            g.strokeEllipse(c, c, 230, 70)
            g.lineStyle(10, C.yellow, 1)
            g.strokeEllipse(c, c, 230, 70)
            g.fillStyle(C.pink, 1)
            g.fillEllipse(c, c - 22, 120, 60)
            break
        case 1:
            disc(g, c, c, 84, C.cyan)
            disc(g, c - 30, c - 20, 18, C.cyanDark, 3)
            disc(g, c + 34, c + 26, 12, C.cyanDark, 3)
            disc(g, c + 10, c - 46, 9, C.cyanDark, 3)
            break
        case 2:
            disc(g, c, c, 56, C.yellow)
            g.lineStyle(8, C.orange, 1)
            g.lineBetween(c - 50, c - 18, c + 50, c - 18)
            g.lineBetween(c - 46, c + 20, c + 46, c + 20)
            g.lineStyle(5, C.ink, 1)
            g.strokeCircle(c, c, 56)
            break
        case 3:
            rough(g, c, c, 82, S.rock, 1)
            disc(g, c - 26, c - 10, 14, S.rockDark, 3)
            disc(g, c + 24, c + 24, 10, S.rockDark, 3)
            break
        case 4:
            rough(g, c - 40, c + 20, 48, S.rock, 2)
            rough(g, c + 44, c - 26, 40, S.rockDark, 3)
            rough(g, c + 30, c + 56, 26, S.rock, 4)
            break
        case 5:
            g.fillStyle(C.glass, 0.5)
            g.fillTriangle(c - 34, c + 40, c + 34, c + 40, c, 20)
            disc(g, c, c + 50, 36, C.white)
            disc(g, c, c + 50, 18, C.glass, 0)
            break
        case 6:
            g.fillStyle(C.violet, 0.5)
            g.fillCircle(c, c, 100)
            g.lineStyle(10, C.pink, 1)
            for (let k = 0; k < 2; k++) {
                g.beginPath()
                g.arc(c, c, 70, k * Math.PI, k * Math.PI + 2.2, false)
                g.strokePath()
            }
            disc(g, c, c, 26, C.white, 4)
            break
        case 7:
            ;[
                [-40, -20, 60, C.violet],
                [30, -30, 54, S.dustPink],
                [10, 30, 66, S.dustLight],
            ].forEach(([dx, dy, r, color]) => {
                g.fillStyle(color, 0.6)
                g.fillCircle(c + dx, c + dy, r)
            })
            break
        case 8:
            ;[
                [-50, -40, 22],
                [30, -60, 14],
                [50, 20, 26],
                [-20, 40, 16],
                [-60, 60, 10],
            ].forEach(([dx, dy, r]) => sparkle(g, c + dx, c + dy, r, C.yellow))
            break
        case 9:
            poly(g, [c - 120, c - 30, c - 40, c - 30, c - 40, c + 30, c - 120, c + 30], C.royal, 4)
            poly(g, [c + 40, c - 30, c + 120, c - 30, c + 120, c + 30, c + 40, c + 30], C.royal, 4)
            poly(g, [c - 32, c - 40, c + 32, c - 40, c + 32, c + 40, c - 32, c + 40], C.white, 5)
            disc(g, c, c, 14, C.pink, 3)
            break
        case 10:
            g.lineStyle(26, C.ink, 1)
            g.strokeCircle(c, c, 90)
            g.lineStyle(18, C.white, 1)
            g.strokeCircle(c, c, 90)
            g.lineStyle(8, C.white, 1)
            g.lineBetween(c - 90, c, c + 90, c)
            g.lineBetween(c, c - 90, c, c + 90)
            disc(g, c, c, 26, C.cyan)
            break
        case 11:
            disc(g, c, c, 60, S.moon)
            disc(g, c - 20, c - 12, 12, S.crater, 3)
            disc(g, c + 22, c + 18, 9, S.crater, 3)
            break
    }
}

function paintMoonScenery(g: G, i: number) {
    const c = 128
    switch (i) {
        case 0:
            crater(g, c, c, 110)
            break
        case 1:
            crater(g, c, c, 56)
            break
        case 2:
            crater(g, c - 40, c + 20, 56)
            crater(g, c + 50, c - 34, 40)
            crater(g, c + 40, c + 64, 26)
            break
        case 3:
            rough(g, c, c, 76, S.boulder, 5)
            g.fillStyle(C.white, 0.3)
            g.fillEllipse(c - 24, c - 30, 50, 20)
            break
        case 4:
            rough(g, c - 40, c + 26, 40, S.boulder, 6)
            rough(g, c + 40, c - 20, 34, S.moonDark, 7)
            rough(g, c + 26, c + 60, 22, S.boulder, 8)
            break
        case 5:
            disc(g, c, c, 100, C.grey)
            disc(g, c, c, 78, S.glass)
            g.fillStyle(C.white, 0.6)
            g.fillEllipse(c - 26, c - 28, 60, 24)
            g.lineStyle(4, C.ink, 0.6)
            g.lineBetween(c - 78, c, c + 78, c)
            g.lineBetween(c, c - 78, c, c + 78)
            break
        case 6:
            g.lineStyle(8, C.ink, 1)
            ;[0, 1, 2].forEach(k => {
                const a = (k / 3) * Math.PI * 2 + 0.5
                g.lineBetween(c, c, c + Math.cos(a) * 90, c + Math.sin(a) * 90)
            })
            disc(g, c, c, 62, C.white)
            disc(g, c, c, 14, C.pink, 3)
            break
        case 7:
            for (let k = 0; k < 5; k++) {
                const y = 30 + k * 46
                const dx = k % 2 === 0 ? -20 : 20
                g.fillStyle(S.moonDark, 1)
                g.fillEllipse(c + dx, y, 22, 34)
                g.lineStyle(3, C.ink, 0.5)
                g.strokeEllipse(c + dx, y, 22, 34)
            }
            break
        case 8:
            ;[
                [-30, 10, 44],
                [20, -20, 56],
                [44, 40, 32],
            ].forEach(([dx, dy, r]) => {
                poly(g, [c + dx, c + dy - r, c + dx + r * 0.5, c + dy, c + dx, c + dy + r * 0.6, c + dx - r * 0.5, c + dy], S.crystal, 4)
                g.fillStyle(C.white, 0.6)
                g.fillTriangle(c + dx, c + dy - r, c + dx + r * 0.2, c + dy - r * 0.2, c + dx - r * 0.1, c + dy - r * 0.2)
            })
            break
        case 9:
            g.fillStyle(S.moonDark, 1)
            for (let y = 10; y < 246; y += 26) {
                g.fillRect(c - 50, y, 22, 14)
                g.fillRect(c + 28, y, 22, 14)
            }
            break
        case 10:
            disc(g, c, c, 110, C.grey)
            g.lineStyle(12, C.yellow, 1)
            g.strokeCircle(c, c, 80)
            g.lineStyle(12, C.yellow, 1)
            g.strokeCircle(c, c, 40)
            break
        case 11:
            ;[
                [-50, -40, 16],
                [30, -50, 12],
                [50, 30, 18],
                [-30, 40, 14],
                [0, 0, 10],
            ].forEach(([dx, dy, r]) => disc(g, c + dx, c + dy, r, S.boulder, 3))
            break
    }
}

function faceOn(g: G, x: number, y: number, mood: Mood) {
    g.fillStyle(C.white, 1)
    g.fillCircle(x - 16, y, 11)
    g.fillCircle(x + 16, y, 11)
    face(g, x, y, mood)
}

function ringFlames(g: G, cx: number, cy: number, r: number, len: number) {
    for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2
        const l = len * (k % 2 === 0 ? 1 : 0.7)
        const at = (rr: number, da: number) => [cx + Math.cos(a + da) * rr, cy + Math.sin(a + da) * rr]
        poly(g, [...at(r, -0.24), ...at(r + l, 0), ...at(r, 0.24)], C.red, 4)
        poly(g, [...at(r, -0.12), ...at(r + l * 0.6, 0), ...at(r, 0.12)], C.flame, 0)
    }
}

function helmet(g: G, cx: number, cy: number, r: number) {
    g.fillStyle(S.glass, 0.18)
    g.fillCircle(cx, cy, r)
    g.lineStyle(10, C.ink, 1)
    g.strokeCircle(cx, cy, r)
    g.lineStyle(6, S.glass, 1)
    g.strokeCircle(cx, cy, r)
    g.lineStyle(6, C.white, 0.8)
    g.beginPath()
    g.arc(cx, cy, r - 16, Math.PI * 1.1, Math.PI * 1.45, false)
    g.strokePath()
}

function meteor(g: G, mood: Mood) {
    rough(g, 192, 196, 80, S.rock, 9)
    disc(g, 150, 160, 12, S.rockDark, 3)
    disc(g, 236, 236, 10, S.rockDark, 3)
    faceOn(g, 192, 196, mood)
}

function rover(g: G, mood: Mood) {
    ;[
        [-70, -46],
        [70, -46],
        [-70, 46],
        [70, 46],
    ].forEach(([dx, dy]) => disc(g, 192 + dx, 196 + dy, 24, C.ink, 0))
    poly(g, [112, 136, 272, 136, 272, 256, 112, 256], C.yellow, 5)
    g.lineStyle(5, C.ink, 1)
    g.lineBetween(192, 136, 220, 96)
    disc(g, 220, 96, 10, C.pink, 3)
    faceOn(g, 192, 196, mood)
}

function rabbit(g: G, cx: number, cy: number, mood: 'scared' | 'happy' | 'wet', legsOut = false) {
    const fur = mood === 'wet' ? 0xc9d6ee : C.white
    g.lineStyle(10, C.ink, 1)
    ;[-36, 36].forEach(dx => g.lineBetween(cx + dx, cy + 30, cx + dx * (legsOut ? 1.8 : 1), cy + (legsOut ? 80 : 64)))
    oval(g, cx, cy + 20, 120, 100, fur)
    oval(g, cx - 22, cy - 92, 26, 80, fur)
    oval(g, cx + 22, cy - 92, 26, 80, fur)
    g.fillStyle(C.pink, 1)
    g.fillEllipse(cx - 22, cy - 92, 10, 50)
    g.fillEllipse(cx + 22, cy - 92, 10, 50)
    disc(g, cx, cy - 34, 42, fur)
    face(g, cx, cy - 34, mood === 'happy' ? 'happy' : mood === 'wet' ? 'worry' : 'scared')
    if (mood === 'wet') {
        drop(g, cx - 50, cy + 70, 9)
        drop(g, cx + 50, cy + 66, 9)
    }
}

function paintSpaceThing(g: G, i: number) {
    const c = 192
    switch (i) {
        case 0:
            ;[
                [-50, 10, 56, S.dust],
                [30, -30, 50, S.dustPink],
                [40, 40, 54, S.dustLight],
                [-20, -40, 44, S.dustLight],
                [0, 10, 46, S.dust],
            ].forEach(([dx, dy, r, color]) => disc(g, c + dx, c + dy, r, color, 4))
            sparkle(g, c - 60, c - 60, 14, C.yellow)
            sparkle(g, c + 70, c - 10, 12, C.white)
            break
        case 1:
            sparkle(g, c, c, 46, C.yellow, 4)
            sparkle(g, c + 50, c - 40, 16, C.white)
            break
        case 2:
            ringFlames(g, c, 196, 82, 46)
            meteor(g, 'worry')
            break
        case 3:
            meteor(g, 'happy')
            drop(g, 120, 120, 10)
            drop(g, 270, 150, 10)
            break
        case 4:
            sheep(g, 182, 210, 'scared')
            helmet(g, c, 196, 128)
            break
        case 5:
            sheep(g, 172, 200, 'happy', true)
            helmet(g, c, 196, 128)
            break
        case 7:
            oval(g, c, c + 20, 220, 120, S.goo)
            drop(g, c - 60, c - 20, 12)
            drop(g, c + 50, c - 30, 12)
            drop(g, c + 10, c + 70, 10)
            break
        case 8:
            ringFlames(g, c, 196, 82, 96)
            meteor(g, 'scared')
            break
        case 9:
            sheep(g, 182, 214, 'wet')
            helmet(g, c, 196, 128)
            break
        case 10:
            g.save()
            g.translateCanvas(c, c)
            g.rotateCanvas(Math.PI * 0.85)
            sheep(g, -10, 0, 'dizzy', true)
            helmet(g, 0, 0, 128)
            g.restore()
            sparkle(g, 60, 60, 14, C.yellow)
            break
        case 11:
            disc(g, c, c, 80, S.dust, 4)
            sparkle(g, c + 30, c - 30, 18, C.white)
            break
    }
}

function paintMoonThing(g: G, i: number) {
    const c = 192
    switch (i) {
        case 0:
            ;[
                [-50, 20, 56, S.moonDust],
                [30, -20, 54, S.moonDustDark],
                [40, 46, 48, S.moonDustLight],
                [-20, -40, 44, S.moonDustDark],
                [0, 10, 46, S.moonDust],
            ].forEach(([dx, dy, r, color]) => disc(g, c + dx, c + dy, r, color, 4))
            break
        case 1:
            poly(g, [c, c - 70, c + 40, c, c, c + 50, c - 40, c], S.crystal, 5)
            sparkle(g, c + 50, c - 50, 16, C.white)
            break
        case 2:
            ringFlames(g, c, 196, 96, 44)
            rover(g, 'worry')
            break
        case 3:
            rover(g, 'happy')
            drop(g, 110, 110, 10)
            drop(g, 280, 120, 10)
            break
        case 4:
            rabbit(g, c, 220, 'scared')
            helmet(g, c, 190, 140)
            break
        case 5:
            rabbit(g, c, 210, 'happy', true)
            helmet(g, c, 190, 140)
            break
        case 7:
            oval(g, c, c + 20, 220, 110, S.mud)
            drop(g, c - 60, c - 10, 12)
            drop(g, c + 60, c - 20, 12)
            break
        case 8:
            ringFlames(g, c, 196, 96, 96)
            rover(g, 'scared')
            break
        case 9:
            rabbit(g, c, 220, 'wet')
            helmet(g, c, 190, 140)
            break
        case 10:
            g.save()
            g.translateCanvas(c, c)
            g.rotateCanvas(Math.PI)
            rabbit(g, 0, 20, 'scared', true)
            helmet(g, 0, -10, 140)
            g.restore()
            sparkle(g, 70, 70, 14, C.yellow)
            sparkle(g, 310, 90, 12, C.yellow)
            break
        case 11:
            disc(g, c, c, 80, S.moonDust, 4)
            break
    }
}

export function ensurePlaces(scene: Phaser.Scene) {
    const missing = (key: string) => !scene.textures.exists(key)
    const sheet = (key: string, cell: number, paint: (g: G, i: number) => void, drawn: { w: number; h: number }) => {
        if (missing(key)) bake(scene, key, cell * 4, cell * 3, { w: cell, h: cell }, paint, drawn)
    }
    if (missing(GROUND.space)) bake(scene, GROUND.space, GROUND_TILE.w, GROUND_TILE.h, null, g => paintSpace(g))
    if (missing(GROUND.moon)) bake(scene, GROUND.moon, GROUND_TILE.w, GROUND_TILE.h, null, g => paintMoon(g))
    if (missing(STREAKS)) bake(scene, STREAKS, W, H, null, g => paintStreaks(g))
    sheet(SCENERY.space, SCENERY_CELL.space, paintSpaceScenery, SCENERY_DRAWN)
    sheet(SCENERY.moon, SCENERY_CELL.moon, paintMoonScenery, SCENERY_DRAWN)
    sheet(THINGS.space, THING_CELL.space, paintSpaceThing, THING_DRAWN)
    sheet(THINGS.moon, THING_CELL.moon, paintMoonThing, THING_DRAWN)
}
