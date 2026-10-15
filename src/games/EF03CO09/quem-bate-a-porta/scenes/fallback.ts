import Phaser from 'phaser'
import { BG, BG_ROOM, DOOR_SHEET, INFO_SHEET, PEOPLE_SHEET, PIECES_SHEET, type Sheet } from '../data/files'
import { FLOOR, H, TABLET, W } from '../data/layout'
import type { PersonPose } from '../types'

type G = Phaser.GameObjects.Graphics
type P = Phaser.Types.Math.Vector2Like
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

const POSES: PersonPose[] = ['ask', 'happy', 'sad']

export function ensureArt(scene: Phaser.Scene) {
    bakeOne(scene, BG, W, H, hall)
    bakeOne(scene, BG_ROOM, W, H, room)
    bakeSheet(scene, DOOR_SHEET, (g, i) => DOOR_PAINT[i]?.(g))
    bakeSheet(scene, PEOPLE_SHEET, (g, i) => PEOPLE_PAINT[Math.floor(i / 3)]?.(g, POSES[i % 3]))
    bakeSheet(scene, INFO_SHEET, (g, i) => INFO_PAINT[i]?.(g, INFO_SHEET.cellW / 2, INFO_SHEET.cellH / 2))
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

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

type Radius = number | { tl: number; tr: number; bl: number; br: number }

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

function limb(g: G, x1: number, y1: number, x2: number, y2: number, fill: number, width = 14) {
    g.lineStyle(width + 8, INK, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.lineStyle(width, fill, 1)
    g.lineBetween(x1, y1, x2, y2)
}

function sparkle(g: G, x: number, y: number, s: number) {
    g.fillStyle(0xffffff, 1)
    g.fillRect(x - s, y - s / 4, s * 2, s / 2)
    g.fillRect(x - s / 4, y - s, s / 2, s * 2)
}

function question(g: G, x: number, y: number, s: number, color: number) {
    g.lineStyle(9 * s, color, 1)
    g.beginPath()
    g.arc(x, y - 12 * s, 14 * s, Math.PI * 1.05, Math.PI * 2.35)
    g.strokePath()
    g.lineBetween(x + 6 * s, y + 0.5 * s, x, y + 10 * s)
    g.fillStyle(color, 1)
    g.fillCircle(x, y + 24 * s, 5.5 * s)
}

function eyes(g: G, x: number, y: number, s: number, mood: 'open' | 'happy' | 'sad') {
    ;[-1, 1].forEach(side => {
        const ex = x + side * 22 * s
        if (mood === 'happy') {
            g.lineStyle(5 * s, INK, 1)
            g.beginPath()
            g.arc(ex, y + 4 * s, 9 * s, Math.PI * 1.1, Math.PI * 1.9)
            g.strokePath()
            return
        }
        g.fillStyle(INK, 1)
        g.fillEllipse(ex, y, 15 * s, 21 * s)
        g.fillStyle(0xffffff, 1)
        g.fillCircle(ex - 3 * s, y - 5 * s, 4 * s)
        if (mood === 'sad') {
            g.fillStyle(0x9fd8ff, 1)
            g.fillEllipse(ex + 6 * s, y + 14 * s, 6 * s, 10 * s)
        }
    })
    g.fillStyle(0xff9fb0, 0.8)
    g.fillEllipse(x - 36 * s, y + 14 * s, 15 * s, 8 * s)
    g.fillEllipse(x + 36 * s, y + 14 * s, 15 * s, 8 * s)
}

function mouth(g: G, x: number, y: number, s: number, kind: 'smile' | 'open' | 'frown') {
    g.lineStyle(4 * s, INK, 1)
    if (kind === 'open') {
        g.fillStyle(0xd96a7a, 1)
        g.fillEllipse(x, y + 4 * s, 18 * s, 14 * s)
        return
    }
    g.beginPath()
    if (kind === 'smile') g.arc(x, y - 2 * s, 8 * s, Math.PI * 0.15, Math.PI * 0.85)
    else g.arc(x, y + 8 * s, 8 * s, Math.PI * 1.15, Math.PI * 1.85)
    g.strokePath()
}

function phone(g: G, x: number, y: number, s: number) {
    box(g, x - 13 * s, y - 22 * s, 26 * s, 44 * s, 6 * s, 0x4a4f5e, 3)
    box(g, x - 9 * s, y - 17 * s, 18 * s, 30 * s, 3 * s, 0xbfe8ff, 0)
}

// ───────────────────────────────────────────── o corredor

function hall(g: G) {
    g.fillStyle(0xeee4fb, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(0xe2d4f8, 1)
    g.fillRect(0, 0, W, 120)
    g.fillStyle(0xffffff, 0.7)
    for (let x = 30; x < 1040; x += 52) g.fillCircle(x, 100, 5)
    ;[
        [120, 52],
        [430, 40],
        [760, 60],
    ].forEach(([x, y]) => {
        g.fillStyle(0xffffff, 0.55)
        g.fillRoundedRect(x - 36, y - 20, 72, 40, 18)
        g.fillTriangle(x - 18, y + 16, x - 4, y + 16, x - 22, y + 30)
    })
    ;[
        [280, 60],
        [600, 34],
        [930, 50],
    ].forEach(([x, y]) => {
        g.fillStyle(0xffb8d0, 0.6)
        g.fillCircle(x - 7, y, 9)
        g.fillCircle(x + 7, y, 9)
        g.fillTriangle(x - 16, y + 3, x + 16, y + 3, x, y + 20)
    })

    g.fillStyle(0xfff3e0, 1)
    g.fillRect(0, FLOOR - 26, W, 26)
    g.lineStyle(4, INK, 0.5)
    g.lineBetween(0, FLOOR - 26, 1040, FLOOR - 26)

    g.fillStyle(0xe9d2a8, 1)
    g.fillRect(0, FLOOR, W, H - FLOOR)
    g.lineStyle(3, 0xd2b483, 1)
    for (let y = FLOOR + 36; y < H; y += 40) g.lineBetween(0, y, W, y)
    g.fillStyle(0xa9e6d2, 1)
    g.fillRect(0, FLOOR + 40, W, 70)
    g.lineStyle(4, 0x7fcdb4, 1)
    g.lineBetween(0, FLOOR + 48, W, FLOOR + 48)
    g.lineBetween(0, FLOOR + 102, W, FLOOR + 102)
    g.lineStyle(4, INK, 0.8)
    g.lineBetween(0, FLOOR, W, FLOOR)

    for (let k = 0; k < 16; k++) {
        const x = 1030 + k * 16
        g.fillStyle(0xd3dbe8, Math.min(0.92, 0.12 + k * 0.06))
        g.fillRect(x, 0, 16, H)
    }
}

function room(g: G) {
    g.fillStyle(0xfff3e0, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(0xf7e3c4, 1)
    g.fillRect(0, 520, W, H - 520)
    g.lineStyle(3, 0xe2c79c, 1)
    for (let y = 560; y < H; y += 44) g.lineBetween(0, y, W, y)
    box(g, 90, 110, 220, 200, 14, 0xdff2ff)
    g.lineStyle(4, INK, 0.6)
    g.lineBetween(200, 112, 200, 308)
    g.lineBetween(92, 210, 308, 210)
    oval(g, 1100, 470, 120, 50, 0xd9825a)
    ;[-30, 0, 30].forEach(dx => oval(g, 1100 + dx, 400, 46, 100, 0x8fdcc4, 4))

    box(g, 300, 330, 680, 230, 50, 0x9be7d4)
    box(g, 260, 400, 90, 190, 30, 0x8fdcc4)
    box(g, 930, 400, 90, 190, 30, 0x8fdcc4)
    box(g, 360, 300, 140, 110, 30, 0xffc6e8, 4)

    const skin = 0xa5704a
    const hair = 0x3a2a24
    box(g, 560, 360, 160, 190, 50, 0xc9b6f2)
    disc(g, 640 - 66, 150, 34, hair, 4)
    disc(g, 640 + 66, 150, 34, hair, 4)
    disc(g, 640, 196, 72, skin, 5)
    g.fillStyle(hair, 1)
    g.fillEllipse(640, 148, 140, 60)
    sparkle(g, 610, 140, 6)
    eyes(g, 640, 202, 1, 'open')
    mouth(g, 640, 230, 1, 'smile')

    const { x, y, w, h } = TABLET
    box(g, x - w / 2 - 20, y - h / 2 - 20, w + 40, h + 40, 26, 0x4a4f5e)
    box(g, x - w / 2, y - h / 2, w, h, 10, 0xeee4fb, 3)
    g.fillStyle(0xffffff, 0.5)
    g.fillRoundedRect(x - w / 2 + 14, y - h / 2 + 12, 80, 18, 9)
    disc(g, x - w / 2 - 24, y + 30, 26, skin, 4)
    disc(g, x + w / 2 + 24, y + 30, 26, skin, 4)
}

// ───────────────────────────────────────────── portas

const DOOR_COLORS = [0xc9b6f2, 0x9be7d4, 0xffe38a, 0xffb8a4, 0xc9ccd6]
const FRAME = 0xf3e2c4
const CELL = { w: DOOR_SHEET.cellW, h: DOOR_SHEET.cellH }
const ARCH = (inset: number) => ({ tl: 120 - inset, tr: 120 - inset, bl: 4, br: 4 })

function frame(g: G) {
    box(g, 16, 16, CELL.w - 32, CELL.h - 24, ARCH(0), FRAME)
}

function leaf(g: G, color: number, unknown: boolean) {
    frame(g)
    box(g, 38, 38, CELL.w - 76, CELL.h - 46, ARCH(22), color)
    g.lineStyle(3, INK, 0.25)
    g.strokeRoundedRect(62, 300, CELL.w - 124, 110, 10)
    disc(g, 150, 210, 34, 0xdff2ff)
    g.lineStyle(3, INK, 0.5)
    g.lineBetween(150, 178, 150, 242)
    g.lineBetween(118, 210, 182, 210)
    box(g, 92, 92, 116, 44, 10, 0xfffaf0, 4)
    if (unknown) question(g, 150, 110, 0.9, 0x75667a)
    disc(g, 228, 290, 11, 0xffd23f, 4)
}

function doorway(g: G) {
    frame(g)
    box(g, 38, 38, CELL.w - 76, CELL.h - 46, ARCH(22), 0xfff2c6, 4)
    g.fillStyle(0xffe5a0, 1)
    g.fillRect(40, CELL.h - 80, CELL.w - 80, 70)
}

function farDoor(g: G, lit: boolean) {
    const x = 150
    const bottom = CELL.h - 10
    box(g, x - 60, bottom - 230, 120, 230, { tl: 60, tr: 60, bl: 4, br: 4 }, lit ? 0xd9dfea : 0xc6ccd8)
    if (lit) {
        g.fillStyle(0x9fd8ff, 0.45)
        g.fillCircle(x, bottom - 160, 46)
    }
    disc(g, x, bottom - 160, 24, lit ? 0x9fe0ff : 0xaeb6c6, 4)
}

const DOOR_PAINT: Array<(g: G) => void> = [
    ...DOOR_COLORS.map((c, i) => (g: G) => leaf(g, c, i === 4)),
    doorway,
    g => farDoor(g, false),
    g => farDoor(g, true),
]

// ───────────────────────────────────────────── pessoas

interface Look {
    skin: number
    hair: number
    style: 'bun' | 'tied' | 'short' | 'braids' | 'cap' | 'glasses'
    shirt: number
    legs: number
    adult?: boolean
    glasses?: boolean
}

function person(g: G, x: number, feet: number, s: number, look: Look, pose: PersonPose) {
    const legH = (look.adult ? 80 : 60) * s
    const lift = pose === 'happy' ? 8 * s : 0
    const f = feet - lift
    box(g, x - 34 * s, f - legH - 6 * s, 26 * s, legH, 10 * s, look.legs, 4)
    box(g, x + 8 * s, f - legH - 6 * s, 26 * s, legH, 10 * s, look.legs, 4)
    oval(g, x - 22 * s, f - 8 * s, 40 * s, 20 * s, 0xffffff, 4)
    oval(g, x + 22 * s, f - 8 * s, 40 * s, 20 * s, 0xffffff, 4)
    const bodyTop = f - legH - 80 * s
    box(g, x - 50 * s, bodyTop, 100 * s, 86 * s, 26 * s, look.shirt, 4)

    const sy = bodyTop + 16 * s
    if (pose === 'happy') {
        limb(g, x - 44 * s, sy, x - 96 * s, sy - 52 * s, look.skin, 14 * s)
        limb(g, x + 44 * s, sy, x + 96 * s, sy - 52 * s, look.skin, 14 * s)
    } else if (pose === 'sad') {
        limb(g, x - 40 * s, sy + 4 * s, x - 8 * s, sy + 52 * s, look.skin, 14 * s)
        limb(g, x + 40 * s, sy + 4 * s, x + 8 * s, sy + 52 * s, look.skin, 14 * s)
    } else {
        limb(g, x - 44 * s, sy, x - 18 * s, sy + 40 * s, look.skin, 14 * s)
        limb(g, x + 44 * s, sy, x + 74 * s, sy - 48 * s, look.skin, 14 * s)
        phone(g, x - 14 * s, sy + 34 * s, s)
        disc(g, x + 76 * s, sy - 52 * s, 11 * s, look.skin, 4)
    }

    const hy = bodyTop - 58 * s
    if (look.style === 'bun') disc(g, x, hy - 70 * s, 26 * s, look.hair, 4)
    if (look.style === 'braids') {
        box(g, x - 82 * s, hy - 10 * s, 22 * s, 80 * s, 10 * s, look.hair, 4)
        box(g, x + 60 * s, hy - 10 * s, 22 * s, 80 * s, 10 * s, look.hair, 4)
    }
    if (look.style === 'tied') disc(g, x + 60 * s, hy - 40 * s, 24 * s, look.hair, 4)
    disc(g, x, hy, 68 * s, look.skin, 5)
    g.fillStyle(look.hair, 1)
    if (look.style === 'cap') {
        box(g, x - 66 * s, hy - 70 * s, 132 * s, 44 * s, { tl: 40 * s, tr: 40 * s, bl: 0, br: 0 }, 0xff8a6a, 4)
        box(g, x - 10 * s, hy - 34 * s, 92 * s, 14 * s, 6 * s, 0xff8a6a, 4)
    } else {
        g.fillEllipse(x, hy - 44 * s, 136 * s, 56 * s)
        if (look.style === 'short') g.fillEllipse(x - 30 * s, hy - 26 * s, 70 * s, 34 * s)
    }
    sparkle(g, x - 28 * s, hy - 50 * s, 5 * s)
    eyes(g, x, hy + 6 * s, s, pose === 'happy' ? 'happy' : pose === 'sad' ? 'sad' : 'open')
    if (look.glasses) {
        g.lineStyle(4 * s, INK, 1)
        g.strokeCircle(x - 22 * s, hy + 6 * s, 16 * s)
        g.strokeCircle(x + 22 * s, hy + 6 * s, 16 * s)
        g.lineBetween(x - 6 * s, hy + 6 * s, x + 6 * s, hy + 6 * s)
    }
    mouth(g, x, hy + 32 * s, s, pose === 'happy' ? 'open' : pose === 'sad' ? 'frown' : 'smile')
}

const PX = PEOPLE_SHEET.cellW / 2
const PFEET = PEOPLE_SHEET.cellH - 12

const GRANDMA: Look = { skin: 0xf2c9a4, hair: 0xf1ece4, style: 'bun', shirt: 0xc9b6f2, legs: 0x8f86a8, adult: true, glasses: true }
const TEACHER: Look = { skin: 0xd9a47a, hair: 0x5a3a2a, style: 'tied', shirt: 0xffb8a4, legs: 0x6f7fa8, adult: true }
const DAVI: Look = { skin: 0xf6d2b4, hair: 0x8a5a3a, style: 'short', shirt: 0xffe38a, legs: 0x7fb4e0 }
const CLASS: Look[] = [
    { skin: 0xd9a47a, hair: 0x3a2a24, style: 'glasses', shirt: 0x9be7d4, legs: 0x8f86a8, glasses: true },
    { skin: 0xa5704a, hair: 0x2a1f20, style: 'braids', shirt: 0xffc6e8, legs: 0x7fb4e0 },
    { skin: 0xf2c9a4, hair: 0x6a4a3a, style: 'cap', shirt: 0xb8d8ff, legs: 0x8f86a8 },
]

function unknown(g: G, pose: PersonPose) {
    const x = PX
    const f = PFEET
    const grey = 0xc6ccd8
    box(g, x - 34, f - 66, 26, 60, 10, 0x9aa1b3, 4)
    box(g, x + 8, f - 66, 26, 60, 10, 0x9aa1b3, 4)
    oval(g, x - 22, f - 8, 40, 20, 0xffffff, 4)
    oval(g, x + 22, f - 8, 40, 20, 0xffffff, 4)
    box(g, x - 56, f - 160, 112, 100, 30, grey)
    const sy = f - 144
    if (pose === 'sad') {
        limb(g, x + 44, sy, x + 70, sy - 80, grey)
        phone(g, x + 72, sy - 100, 1.1)
        g.lineStyle(4, 0x9fd8ff, 1)
        ;[0, 1, 2].forEach(k => {
            g.beginPath()
            g.arc(x + 72, sy - 104, 34 + k * 16, -Math.PI * 0.8, -Math.PI * 0.2)
            g.strokePath()
        })
        limb(g, x - 44, sy, x - 56, sy + 56, grey)
    } else if (pose === 'happy') {
        limb(g, x - 44, sy, x - 70, sy - 64, grey)
        limb(g, x + 44, sy, x + 70, sy - 64, grey)
    } else {
        limb(g, x - 44, sy, x - 18, sy + 40, grey)
        limb(g, x + 44, sy, x + 74, sy - 48, grey)
        phone(g, x - 14, sy + 34, 1)
    }
    const hy = f - 222
    poly(
        g,
        [
            { x: x - 76, y: hy + 64 },
            { x: x - 74, y: hy - 30 },
            { x: x - 30, y: hy - 82 },
            { x: x + 30, y: hy - 82 },
            { x: x + 74, y: hy - 30 },
            { x: x + 76, y: hy + 64 },
        ],
        0xb4bbc9,
    )
    box(g, x - 50, hy - 40, 100, 86, 18, 0x4a4f5e, 4)
    box(g, x - 40, hy - 30, 80, 66, 12, 0x6f8fb0, 0)
    if (pose === 'happy') {
        g.lineStyle(6, 0xffffff, 1)
        g.beginPath()
        g.arc(x, hy - 6, 20, Math.PI * 0.15, Math.PI * 0.85)
        g.strokePath()
    } else question(g, x, hy - 2, 0.85, 0xffffff)
}

const PEOPLE_PAINT: Array<(g: G, pose: PersonPose) => void> = [
    (g, pose) => person(g, PX, PFEET, 1, GRANDMA, pose),
    (g, pose) => {
        person(g, PX - 92, PFEET, 0.62, CLASS[0], pose === 'ask' ? 'happy' : pose)
        person(g, PX + 92, PFEET, 0.62, CLASS[2], pose === 'ask' ? 'happy' : pose)
        person(g, PX, PFEET, 0.66, CLASS[1], pose)
    },
    (g, pose) => person(g, PX, PFEET, 1, TEACHER, pose),
    unknown,
    (g, pose) => person(g, PX, PFEET, 1, DAVI, pose),
]

// ───────────────────────────────────────────── informações (pictogramas)

const SKIN = 0xa5704a
const HAIR = 0x3a2a24

function kidFace(g: G, x: number, y: number, s: number, skin: number, hair: number, puffs: boolean) {
    if (puffs) {
        disc(g, x - 40 * s, y - 32 * s, 16 * s, hair, 3)
        disc(g, x + 40 * s, y - 32 * s, 16 * s, hair, 3)
    }
    disc(g, x, y, 42 * s, skin, 4)
    g.fillStyle(hair, 1)
    g.fillEllipse(x, y - 28 * s, 84 * s, 34 * s)
    eyes(g, x, y + 4 * s, 0.55 * s, 'open')
    mouth(g, x, y + 22 * s, 0.7 * s, 'smile')
}

const INFO_PAINT: Array<(g: G, x: number, y: number) => void> = [
    (g, x, y) => {
        box(g, x - 70, y - 30, 140, 100, 10, 0xfff1dc)
        poly(g, [{ x: x - 86, y: y - 26 }, { x, y: y - 96 }, { x: x + 86, y: y - 26 }], 0xff9cc8)
        box(g, x - 18, y + 14, 36, 56, 6, 0xb98a63, 4)
        box(g, x + 32, y - 6, 30, 20, 4, 0xffffff, 3)
    },
    (g, x, y) => {
        box(g, x - 50, y - 90, 100, 180, 20, 0xc9b6f2)
        box(g, x - 38, y - 72, 76, 132, 10, 0xffffff, 3)
        g.fillStyle(0xc9b6f2, 1)
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) g.fillCircle(x - 22 + c * 22, y - 48 + r * 28, 8)
    },
    (g, x, y) => {
        box(g, x - 80, y - 90, 160, 180, 14, 0xb98a63)
        box(g, x - 62, y - 72, 124, 144, 8, 0xeaf6ff, 3)
        kidFace(g, x, y + 6, 1, SKIN, HAIR, true)
    },
    (g, x, y) => {
        box(g, x - 90, y - 80, 180, 160, 10, 0xffffff)
        box(g, x - 76, y - 66, 152, 110, 6, 0xcfe6ff, 3)
        g.fillStyle(0xffe7a8, 1)
        g.fillRect(x - 74, y + 10, 148, 32)
        ;[-34, 0, 30].forEach((dx, k) => disc(g, x + dx, y - 6, k === 1 ? 12 : 16, 0xf2c9a4, 3))
        disc(g, x + 50, y - 40, 14, 0xffd23f, 3)
    },
    (g, x, y) => {
        box(g, x - 80, y - 96, 160, 192, 8, 0xffffff)
        disc(g, x, y - 20, 30, 0xffd23f, 4)
        g.lineStyle(5, 0xffb03c, 1)
        for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2
            g.lineBetween(x + Math.cos(a) * 40, y - 20 + Math.sin(a) * 40, x + Math.cos(a) * 54, y - 20 + Math.sin(a) * 54)
        }
        g.fillStyle(0x8fdcc4, 1)
        g.fillEllipse(x, y + 66, 140, 50)
    },
    (g, x, y) => {
        oval(g, x, y, 180, 140, 0xfff1dc)
        disc(g, x + 40, y + 30, 18, 0xfff1dc, 4)
        disc(g, x - 50, y - 20, 18, 0xff9cc8, 3)
        disc(g, x, y - 40, 18, 0x9be7d4, 3)
        disc(g, x + 50, y - 20, 18, 0xc9b6f2, 3)
    },
    (g, x, y) => {
        box(g, x - 90, y - 50, 180, 100, 18, 0xffffff)
        box(g, x - 90, y - 50, 180, 30, { tl: 18, tr: 18, bl: 0, br: 0 }, 0xc9b6f2, 4)
        star(g, x - 52, y + 18, 18, 0xffd23f)
    },
    (g, x, y) => {
        box(g, x - 90, y - 80, 180, 160, 10, 0xffffff)
        box(g, x - 76, y - 66, 152, 110, 6, 0xeaf6ff, 3)
        kidFace(g, x - 34, y - 6, 0.7, SKIN, HAIR, true)
        kidFace(g, x + 36, y - 6, 0.7, 0xf6d2b4, 0x8a5a3a, false)
    },
]

function star(g: G, x: number, y: number, r: number, fill: number) {
    const pts: P[] = []
    for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5
        const rr = k % 2 ? r * 0.45 : r
        pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr })
    }
    poly(g, pts, fill, 4)
}

// ───────────────────────────────────────────── peças

function giftBox(g: G, x: number, y: number, open: boolean) {
    if (open) {
        g.fillStyle(0xfff3a0, 0.5)
        g.fillCircle(x, y - 30, 70)
        sparkle(g, x - 40, y - 70, 8)
        sparkle(g, x + 44, y - 56, 6)
    }
    box(g, x - 80, y - 30, 160, 110, 12, 0xfff1dc)
    g.fillStyle(0x9be7d4, 1)
    g.fillRect(x - 14, y - 28, 28, 106)
    g.lineStyle(4, INK, 1)
    g.strokeRect(x - 14, y - 28, 28, 106)
    if (open) box(g, x - 90, y - 92, 180, 34, 10, 0xfff1dc)
    else {
        box(g, x - 90, y - 52, 180, 34, 10, 0xfff1dc)
        oval(g, x - 26, y - 68, 50, 30, 0x9be7d4, 4)
        oval(g, x + 26, y - 68, 50, 30, 0x9be7d4, 4)
        disc(g, x, y - 62, 12, 0x8fdcc4, 4)
    }
}

const PIECE_PAINT: Array<(g: G, x: number, y: number) => void> = [
    (g, x, y) => {
        poly(g, [{ x: x - 90, y: y - 10 }, { x: x + 90, y: y - 50 }, { x: x - 30, y: y + 20 }], 0xffffff)
        poly(g, [{ x: x - 30, y: y + 20 }, { x: x + 90, y: y - 50 }, { x: x - 10, y: y + 60 }], 0xe6ecf5)
        g.lineStyle(4, 0x9fd8ff, 1)
        g.lineBetween(x - 110, y + 30, x - 70, y + 24)
        g.lineBetween(x - 100, y + 50, x - 60, y + 42)
    },
    (g, x, y) => giftBox(g, x, y + 20, false),
    (g, x, y) => giftBox(g, x, y + 30, true),
    (g, x, y) => {
        g.lineStyle(10, INK, 1)
        ;[-1, 0, 1].forEach(k => {
            g.beginPath()
            g.arc(x - 60, y + k * 50, 70, -0.35, 0.35)
            g.strokePath()
        })
    },
    (g, x, y) => {
        disc(g, x - 36, y - 20, 46, 0xff6f8f)
        disc(g, x + 36, y - 20, 46, 0xff6f8f)
        poly(g, [{ x: x - 80, y: y - 4 }, { x: x + 80, y: y - 4 }, { x, y: y + 86 }], 0xff6f8f)
        g.fillStyle(0xff6f8f, 1)
        g.fillRect(x - 60, y - 30, 120, 40)
        sparkle(g, x - 44, y - 34, 8)
    },
    (g, x, y) => star(g, x, y, 90, 0xffd23f),
    (g, x, y) => {
        poly(g, [{ x: x - 60, y: y - 40 }, { x: x + 60, y: y - 40 }, { x: x + 46, y: y + 90 }, { x: x - 46, y: y + 90 }], 0xc9ccd6)
        box(g, x - 74, y - 64, 148, 26, 8, 0xb4bbc9, 4)
        box(g, x - 20, y - 82, 40, 20, 6, 0xb4bbc9, 4)
    },
    (g, x, y) => {
        poly(g, [{ x: x - 40, y: y + 50 }, { x: x - 70, y: y + 96 }, { x: x - 6, y: y + 60 }], 0xffffff, 4)
        disc(g, x, y, 90, 0xffffff)
        question(g, x, y - 10, 2.6, 0x2fb3a6)
    },
]
