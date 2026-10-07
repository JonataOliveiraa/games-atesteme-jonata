import Phaser from 'phaser'
import { BG, FORMATS, OBJ_CELL, OBJECTS, PIECE, ROBOT_CELL, ROBOTS, SCENE_CELL, SCENERY, SLING_ART, SLING_CELL, SLINGSHOT } from '../data/files'
import { FLOOR, H, W } from '../data/layout'
import { C, PLATFORM_TONE, ROBOT_TONE } from '../data/theme'
import type { Format, PieceType } from '../types'

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
    if (!scene.textures.exists(SLINGSHOT)) bake(scene, SLINGSHOT, SLING_CELL * 3, SLING_CELL, { w: SLING_CELL, h: SLING_CELL }, (g, i) => slingshot(g, i))
    if (!scene.textures.exists(SCENERY)) bake(scene, SCENERY, SCENE_CELL * 4, SCENE_CELL * 2, { w: SCENE_CELL, h: SCENE_CELL }, (g, i) => piece(g, i))
    if (!scene.textures.exists(BG)) bake(scene, BG, W, H, null, room)
    if (!scene.textures.exists(ROBOTS)) bake(scene, ROBOTS, ROBOT_CELL * 4, ROBOT_CELL * 4, { w: ROBOT_CELL, h: ROBOT_CELL }, (g, i) => {
            g.scaleCanvas(ROBOT_CELL / 384, ROBOT_CELL / 384)
            robot(g, FORMATS[i % 4], Math.floor(i / 4))
        })
    if (!scene.textures.exists(OBJECTS)) bake(scene, OBJECTS, OBJ_CELL * 4, OBJ_CELL * 2, { w: OBJ_CELL, h: OBJ_CELL }, (g, i) => {
            g.scaleCanvas(OBJ_CELL / 256, OBJ_CELL / 256)
            OBJECT_PAINT[i]?.(g)
        })
}

const box = (g: G, x: number, y: number, w: number, h: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

const dot = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillCircle(x, y, r)
}

const capsule = (g: G, x1: number, y1: number, x2: number, y2: number, width: number, color: number) => {
    g.lineStyle(width, color, 1)
    g.lineBetween(x1, y1, x2, y2)
    dot(g, x1, y1, width / 2, color)
    dot(g, x2, y2, width / 2, color)
}

const arc = (g: G, x: number, y: number, r: number, from: number, to: number, width: number, color: number) => {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

const outline = (g: G, x: number, y: number, w: number, h: number, r: number, width = 4) => {
    g.lineStyle(width, C.ink, 1)
    g.strokeRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

function room(g: G) {
    const bands = 12
    for (let i = 0; i < bands; i++) {
        const t = i / (bands - 1)
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0xfdf8ea),
            Phaser.Display.Color.ValueToColor(C.sky),
            100,
            Math.round(t * 100),
        )
        g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
        g.fillRect(0, (FLOOR / bands) * i, W, FLOOR / bands + 1)
    }
    for (let y = 120; y < FLOOR - 30; y += 70) for (let x = 40 + ((y / 70) % 2) * 35; x < W; x += 70) dot(g, x, y, 3, C.rivet, 0.7)
    box(g, 0, 92, W, 18, 9, C.pipe)
    box(g, 0, 98, W, 4, 2, C.pipeDark, 0.6)
    for (let x = 60; x < W; x += 220) box(g, x, 86, 26, 30, 6, C.pipeDark)
    box(g, 0, FLOOR - 40, W, 14, 7, C.pipe)

    dot(g, 120, 220, 54, C.white)
    dot(g, 120, 220, 44, 0xbfe4ff)
    dot(g, 104, 206, 12, C.white, 0.7)
    g.lineStyle(6, C.metalDark, 1)
    g.strokeCircle(120, 220, 52)

    box(g, -20, 470, 120, 180, 18, 0xf6d6e4)
    dot(g, 70, 520, 7, C.pipeDark)
    dot(g, 70, 600, 7, C.pipeDark)

    g.fillStyle(C.floor, 1)
    g.fillRect(0, FLOOR, W, H - FLOOR)
    for (let x = 0; x < W; x += 80) {
        g.fillStyle(C.floorDark, 0.5)
        g.fillRect(x, FLOOR, 3, H - FLOOR)
    }
    g.fillStyle(C.floorDark, 1)
    g.fillRect(0, FLOOR, W, 5)
    g.fillStyle(C.rug, 0.9)
    g.fillEllipse(260, FLOOR + 26, 300, 34)

    box(g, 20, FLOOR - 64, 36, 60, 10, 0x8fd18a)
    box(g, 14, FLOOR - 16, 48, 22, 8, 0xe7a37a)
}

function robot(g: G, format: Format, row: number) {
    const tone = ROBOT_TONE[format]
    const face = (['idle', 'open', 'chew', 'yuck'] as const)[row]

    g.fillStyle(C.shadow, 0.12)
    g.fillEllipse(192, 364, 210, 22)
    box(g, 118, 334, 64, 30, 12, tone.dark)
    box(g, 202, 334, 64, 30, 12, tone.dark)
    outline(g, 118, 334, 64, 30, 12, 3)
    outline(g, 202, 334, 64, 30, 12, 3)

    const armUp = face === 'open' ? -40 : face === 'yuck' ? 10 : 0
    capsule(g, 98, 240, 76, 290 + armUp, 22, tone.dark)
    capsule(g, 286, 240, 308, 290 + armUp, 22, tone.dark)

    box(g, 100, 206, 184, 138, 40, tone.body)
    outline(g, 100, 206, 184, 138, 40)
    box(g, 117, 224, 150, 104, 18, C.screenDark)
    box(g, 120, 227, 144, 98, 16, C.screen)

    box(g, 72, 64, 240, 150, 54, tone.body)
    box(g, 72, 160, 240, 54, 27, tone.dark, 0.35)
    outline(g, 72, 64, 240, 150, 54)

    if (format === 'music') {
        arc(g, 192, 140, 128, Math.PI * 1.08, Math.PI * 1.92, 16, tone.dark)
        box(g, 50, 104, 40, 74, 18, tone.accent)
        box(g, 294, 104, 40, 74, 18, tone.accent)
        outline(g, 50, 104, 40, 74, 18, 3)
        outline(g, 294, 104, 40, 74, 18, 3)
    } else if (format === 'photo') {
        box(g, 146, 26, 96, 46, 12, tone.accent)
        outline(g, 146, 26, 96, 46, 12, 3)
        dot(g, 194, 50, 17, 0x2f3a46)
        dot(g, 194, 50, 10, 0x9fd4f7)
        dot(g, 189, 45, 4, C.white)
        box(g, 222, 16, 16, 14, 4, C.yellow)
    } else if (format === 'text') {
        capsule(g, 192, 66, 206, 14, 14, tone.accent)
        g.fillStyle(0xf2c39b, 1)
        g.fillTriangle(199, 4, 213, 8, 210, 18)
    } else {
        capsule(g, 182, 66, 146, 18, 6, 0x5b6b7c)
        capsule(g, 202, 66, 238, 18, 6, 0x5b6b7c)
        dot(g, 146, 18, 10, tone.accent)
        dot(g, 238, 18, 10, tone.accent)
    }

    const eyes = [134, 214]
    dot(g, 108, 160, 15, C.blush, 0.8)
    dot(g, 244, 160, 15, C.blush, 0.8)
    if (face === 'chew') {
        eyes.forEach(x => arc(g, x, 128, 18, Math.PI * 1.1, Math.PI * 1.9, 7, C.ink))
    } else if (face === 'yuck') {
        eyes.forEach(x => {
            arc(g, x, 122, 16, 0, Math.PI * 1.6, 5, C.ink)
            arc(g, x + 2, 122, 8, Math.PI, Math.PI * 2.6, 4, C.ink)
        })
    } else {
        eyes.forEach(x => {
            g.fillStyle(C.white, 1)
            g.fillEllipse(x, 120, 44, 52)
            g.fillStyle(0x3b2f4a, 1)
            g.fillEllipse(x - 6, 124, 28, 36)
            dot(g, x - 12, 112, 7, C.white)
            dot(g, x - 2, 132, 3, C.white)
        })
        if (format === 'text') eyes.forEach(x => {
            g.lineStyle(5, 0x5b6b7c, 1)
            g.strokeCircle(x - 4, 122, 30)
        })
    }

    const m = { x: 168, y: 166 }
    if (face === 'idle') arc(g, m.x, m.y - 10, 18, Math.PI * 0.15, Math.PI * 0.85, 6, C.ink)
    if (face === 'open') {
        g.fillStyle(0x6b2d3a, 1)
        g.fillEllipse(m.x, m.y + 4, 74, 56)
        g.fillStyle(0xff8fa6, 1)
        g.fillEllipse(m.x, m.y + 20, 44, 20)
        g.lineStyle(4, C.ink, 1)
        g.strokeEllipse(m.x, m.y + 4, 74, 56)
    }
    if (face === 'chew') {
        dot(g, 108, 168, 22, C.blush, 0.9)
        dot(g, 244, 168, 22, C.blush, 0.9)
        g.lineStyle(6, C.ink, 1)
        g.beginPath()
        g.moveTo(m.x - 22, m.y)
        for (let k = 1; k <= 4; k++) g.lineTo(m.x - 22 + k * 11, m.y + (k % 2 ? -6 : 0))
        g.strokePath()
    }
    if (face === 'yuck') {
        g.fillStyle(0xff8fa6, 1)
        g.fillRoundedRect(m.x - 12, m.y, 26, 34, 12)
        g.lineStyle(6, C.ink, 1)
        g.beginPath()
        g.moveTo(m.x - 30, m.y)
        for (let k = 1; k <= 6; k++) g.lineTo(m.x - 30 + k * 10, m.y + (k % 2 ? -7 : 0))
        g.strokePath()
        dot(g, 286, 84, 9, 0x9fd4f7)
    }
}

const OBJECT_PAINT: Record<number, (g: G) => void> = {
    0: g => {
        box(g, 112, 150, 32, 96, 10, C.woodDark)
        capsule(g, 124, 162, 98, 46, 26, C.wood)
        capsule(g, 132, 162, 158, 46, 26, C.wood)
        box(g, 84, 64, 28, 16, 6, 0x9fe3c9)
        box(g, 144, 64, 28, 16, 6, 0x9fe3c9)
        box(g, 104, 236, 48, 12, 6, C.woodDark)
    },
    1: g => {
        capsule(g, 120, 152, 98, 46, 26, C.wood)
        box(g, 84, 64, 28, 16, 6, 0x9fe3c9)
    },
    2: g => {
        g.fillStyle(0x9a6544, 1)
        g.fillEllipse(128, 128, 72, 40)
        g.fillStyle(0x7a4c32, 1)
        g.fillEllipse(128, 134, 50, 18)
    },
    3: g => {
        box(g, 38, 94, 180, 150, 22, 0xf7d9a8)
        box(g, 38, 94, 180, 22, 11, 0xe9bf82)
        outline(g, 38, 94, 180, 150, 22)
        g.fillStyle(0xe9bf82, 1)
        g.fillTriangle(38, 98, 76, 98, 20, 66)
        g.fillTriangle(218, 98, 180, 98, 236, 66)
        dot(g, 100, 170, 13, C.white)
        dot(g, 156, 170, 13, C.white)
        dot(g, 97, 172, 8, 0x3b2f4a)
        dot(g, 153, 172, 8, 0x3b2f4a)
        arc(g, 128, 190, 16, Math.PI * 0.15, Math.PI * 0.85, 5, C.ink)
        dot(g, 76, 196, 9, C.blush, 0.8)
        dot(g, 180, 196, 9, C.blush, 0.8)
    },
    4: g => cart(g, false),
    5: g => cart(g, true),
    6: g => {
        box(g, 18, 93, 220, 70, 18, C.woodDark)
        box(g, 26, 100, 204, 56, 14, C.cream)
        dot(g, 36, 128, 4, C.woodDark)
        dot(g, 220, 128, 4, C.woodDark)
    },
    7: g => {
        box(g, 68, 124, 120, 120, 10, C.crate)
        g.lineStyle(10, C.crateDark, 1)
        g.strokeRoundedRect(74, 130, 108, 108, 8)
        g.lineBetween(80, 136, 176, 232)
        outline(g, 68, 124, 120, 120, 10, 3)
    },
}

function cart(g: G, flying: boolean) {
    box(g, 33, 43, 190, 170, 34, C.cartRim)
    box(g, 41, 51, 174, 154, 28, C.cart)
    outline(g, 33, 43, 190, 170, 34)
    box(g, 53, 96, 150, 100, 14, C.screenDark)
    box(g, 56, 99, 144, 94, 12, C.white)
    if (flying) {
        g.lineStyle(5, C.ink, 1)
        g.lineBetween(92, 62, 106, 70)
        g.lineBetween(92, 78, 106, 70)
        g.lineBetween(164, 62, 150, 70)
        g.lineBetween(164, 78, 150, 70)
        g.fillStyle(0x6b2d3a, 1)
        g.fillEllipse(128, 82, 16, 12)
    } else {
        dot(g, 100, 70, 9, 0x3b2f4a)
        dot(g, 156, 70, 9, 0x3b2f4a)
        dot(g, 97, 67, 3, C.white)
        dot(g, 153, 67, 3, C.white)
        arc(g, 128, 74, 10, Math.PI * 0.15, Math.PI * 0.85, 4, C.ink)
    }
    dot(g, 76, 80, 7, C.blush, 0.8)
    dot(g, 180, 80, 7, C.blush, 0.8)
}

const PIECE_LOOK: Partial<Record<PieceType, number>> = {
    block: PLATFORM_TONE[2],
    pillar: PLATFORM_TONE[3],
    plank: C.wood,
    stage: PLATFORM_TONE[0],
    barrel: 0x9fd4f7,
    pipe: C.pipe,
    brick: PLATFORM_TONE[1],
}

function piece(g: G, cell: number) {
    const entry = (Object.entries(PIECE) as [PieceType, (typeof PIECE)[PieceType]][]).find(([, art]) => art.sheet === SCENERY && art.cell === cell)
    if (!entry) return
    const [type, art] = entry
    const { x, y, w, h } = art.box
    const r = Math.min(18, w / 4, h / 4)
    box(g, x, y, w, h, r, PIECE_LOOK[type] ?? C.cream)
    if (type === 'block' || type === 'stage' || type === 'brick') box(g, x, y, w, Math.min(30, h * 0.2), r, C.cream)
    if (type === 'plank') {
        g.lineStyle(4, C.woodDark, 1)
        g.lineBetween(x + 10, y + h / 2, x + w - 10, y + h / 2)
    }
    if (type === 'barrel') {
        box(g, x, y + h * 0.25, w, 14, 6, C.metalDark)
        box(g, x, y + h * 0.7, w, 14, 6, C.metalDark)
    }
    if (type === 'pipe') {
        box(g, x + w * 0.3, y - 4, 24, h + 8, 6, C.pipeDark)
        box(g, x + w * 0.7, y - 4, 24, h + 8, 6, C.pipeDark)
    }
    outline(g, x, y, w, h, r, 5)
}

function slingshot(g: G, cell: number) {
    const { foot, tipFront, tipBack, pouch } = SLING_ART
    const fork = { x: 176, y: 214 }
    if (cell === 0) {
        g.fillStyle(C.shadow, 0.12)
        g.fillEllipse(fork.x, foot - 4, 120, 18)
        capsule(g, fork.x, foot - 12, fork.x, fork.y, 36, C.woodDark)
        capsule(g, fork.x + 2, fork.y, tipBack.x, tipBack.y, 26, 0xb07a3e)
        box(g, tipBack.x - 16, tipBack.y + 8, 32, 18, 6, 0x7cc9ae)
        dot(g, fork.x, fork.y, 20, C.woodDark)
    }
    if (cell === 1) {
        capsule(g, fork.x - 4, fork.y, tipFront.x, tipFront.y, 30, C.wood)
        box(g, tipFront.x - 18, tipFront.y + 10, 36, 20, 7, 0x9fe3c9)
        dot(g, fork.x - 2, fork.y + 4, 18, C.wood)
        g.lineStyle(3, C.ink, 0.5)
        g.lineBetween(fork.x - 10, fork.y + 6, tipFront.x - 8, tipFront.y + 12)
    }
    if (cell === 2) {
        g.fillStyle(0x9a6544, 1)
        g.fillEllipse(pouch.x, pouch.y, 64, 44)
        g.fillStyle(0x7a4c32, 1)
        g.fillEllipse(pouch.x + 10, pouch.y, 30, 30)
    }
}
