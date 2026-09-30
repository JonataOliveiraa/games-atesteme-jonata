import Phaser from 'phaser'
import { BG, BOARD_CELL, FENCE, PIECES, PIECE_SIZE, ROBOT, ROBOT_CELL, SHEETS } from '../data/files'
import { BOARD, H, W } from '../data/layout'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics

export const isFallback = (scene: Phaser.Scene, key: string): boolean =>
    !!(scene.textures.get(key).customData as { fallback?: boolean }).fallback

function bake(scene: Phaser.Scene, key: string, w: number, h: number, cell: { w: number; h: number } | null, paint: (g: G, i: number) => void) {
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
    if (cell) {
        for (let i = 0; i < cols * rows; i++) texture.add(i, 0, (i % cols) * cell.w, Math.floor(i / cols) * cell.h, cell.w, cell.h)
    }
    ;(texture.customData as { fallback?: boolean }).fallback = true
}

const box = (g: G, cx: number, cy: number, w: number, h: number, r: number, color: number) => {
    g.fillStyle(color, 1)
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, Math.min(r, w / 2, h / 2))
}

const pill = (g: G, x1: number, y1: number, x2: number, y2: number, width: number, color: number) => {
    g.lineStyle(width, color, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(color, 1)
    g.fillCircle(x1, y1, width / 2)
    g.fillCircle(x2, y2, width / 2)
}

const dot = (g: G, x: number, y: number, r: number, color: number) => {
    g.fillStyle(color, 1)
    g.fillCircle(x, y, r)
}

function eye(g: G, x: number, y: number, s: number, look = 0) {
    box(g, x, y, s, s * 1.1, s * 0.35, C.white)
    dot(g, x + look * s * 0.15, y + s * 0.08, s * 0.3, C.ink)
    dot(g, x + look * s * 0.15 - s * 0.1, y - s * 0.04, s * 0.08, C.white)
}

function paintYard(g: G) {
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, W, H)
    ;[[180, 70, 70], [1030, 110, 90]].forEach(([x, y, w]) => {
        box(g, x, y, w, 34, 17, C.cloud)
        box(g, x + w * 0.2, y - 16, w * 0.55, 34, 17, C.cloud)
    })
    box(g, W / 2, 470, W, 200, 0, C.wall)
    g.fillStyle(C.wallDark, 1)
    g.fillRect(0, 372, W, 16)
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 548, W, H - 548)
    g.fillStyle(C.grassDark, 1)
    g.fillRect(0, 548, W, 10)
    dot(g, 60, 330, 58, C.green)
    dot(g, 30, 290, 40, C.green)
    pill(g, 60, 380, 60, 548, 22, C.easel)
    ;[[70, 640], [1210, 610], [1150, 690]].forEach(([x, y]) => {
        dot(g, x, y, 12, C.flower)
        dot(g, x, y, 5, C.flowerCore)
    })
    const bx = BOARD.x + BOARD.w / 2
    pill(g, bx - 150, BOARD.y + BOARD.h - 10, bx - 190, 380, 16, C.easel)
    pill(g, bx + 150, BOARD.y + BOARD.h - 10, bx + 190, 380, 16, C.easel)
    box(g, bx, BOARD.y + BOARD.h / 2, BOARD.w + 24, BOARD.h + 24, 26, C.easel)
    box(g, bx, BOARD.y + BOARD.h / 2, BOARD.w, BOARD.h, 18, C.board)
}

function paintRobot(g: G, pose: number) {
    const cx = ROBOT_CELL.size / 2
    const foot = ROBOT_CELL.foot
    const walk = pose === 1
    const cheer = pose === 3
    const lift = cheer ? -18 : 0
    const tilt = pose === 5 ? 8 : 0

    pill(g, cx - 34 + (walk ? -22 : 0), foot - 8, cx - 8 + (walk ? -22 : 0), foot - 8, 22, C.graphite)
    pill(g, cx + 14 + (walk ? 26 : 0), foot - 8 + (walk ? -10 : 0), cx + 40 + (walk ? 26 : 0), foot - 8 + (walk ? -10 : 0), 22, C.graphite)
    if (walk || cheer) {
        pill(g, cx - 78, foot - 26, cx - 64, foot - 26, 8, C.graphite)
        pill(g, cx - 84, foot - 6, cx - 70, foot - 6, 8, C.graphite)
    }

    const bodyY = foot - 78 + lift
    g.fillStyle(C.orange, 1)
    g.fillRoundedRect(cx - 62, bodyY - 56, 124, 104, 28)
    g.fillStyle(C.orangeDark, 1)
    g.fillRoundedRect(cx - 30, bodyY - 30, 60, 50, 16)

    const headY = bodyY - 112 + (pose === 5 ? 6 : 0)
    const hx = cx + tilt
    pill(g, hx + 10, headY - 64, hx + 18, headY - 92, 8, C.greyDark)
    dot(g, hx + 18, headY - 98, 10, C.orange)
    box(g, hx, headY, 132, 108, 32, C.grey)
    box(g, hx - 6, headY - 60, 96, 30, 15, C.orange)
    box(g, hx, headY + 6, 104, 70, 22, C.screen)
    const wide = pose === 4
    eye(g, hx - 22, headY + 2, wide ? 30 : 26, 1)
    eye(g, hx + 26, headY + 2, wide ? 30 : 26, 1)
    if (pose === 5) pill(g, hx + 16, headY - 26, hx + 38, headY - 32, 7, C.grey)
    if (cheer) {
        g.fillStyle(C.maroon, 1)
        g.fillRoundedRect(hx - 14, headY + 24, 28, 16, 8)
    } else if (pose !== 4) {
        pill(g, hx - 10 + (pose === 5 ? 4 : 0), headY + 30, hx + 12, headY + (pose === 5 ? 26 : 30), 6, C.white)
    }

    const shoulderY = bodyY - 30
    const arm = (x1: number, y1: number, x2: number, y2: number) => {
        pill(g, x1, y1, x2, y2, 20, C.orangeDark)
        dot(g, x2 + (x2 - x1) * 0.12, y2 + (y2 - y1) * 0.12, 15, C.grey)
    }
    arm(cx - 62, shoulderY, cx - 92, shoulderY + (cheer ? -60 : 40))
    let hand = { x: cx + 100, y: shoulderY - 30 }
    if (pose === 2) hand = { x: cx + 128, y: shoulderY + 20 }
    if (cheer) hand = { x: cx + 90, y: shoulderY - 96 }
    if (pose === 4) hand = { x: hx + 4, y: headY + 34 }
    arm(cx + 62, shoulderY, hand.x - 10, hand.y)
    if (pose !== 4) {
        const down = pose === 2
        pill(g, hand.x, hand.y, hand.x + (down ? 20 : 6), hand.y + (down ? 30 : -46), 10, C.easel)
        box(g, hand.x + (down ? 30 : 8), hand.y + (down ? 46 : -62), 22, 28, 8, C.greyDark)
    }
    if (pose === 4) box(g, hx + 40, headY - 30, 10, 20, 5, 0x9ad8ff)
}

function paintPlank(g: G, kind: number) {
    const cx = BOARD_CELL.w / 2
    const base = BOARD_CELL.base
    const wood = kind === 1 ? C.white : C.wood
    const dark = kind === 1 ? C.white : C.woodDark
    if (kind !== 1) {
        ;[190, 360].forEach(y => {
            g.fillStyle(dark, 1)
            g.fillRect(0, y - 14, kind === 2 ? cx : BOARD_CELL.w, 28)
        })
    }
    const w = kind === 2 ? 110 : 128
    g.fillStyle(wood, 1)
    g.fillRoundedRect(cx - w / 2, base - 400, w, 400, { tl: w / 2, tr: w / 2, bl: 6, br: 6 })
    if (kind === 1) {
        pill(g, cx - 30, base - 60, cx - 30, base - 20, 14, C.white)
        pill(g, cx + 24, base - 90, cx + 24, base - 60, 12, C.white)
    } else {
        pill(g, cx - 20, base - 300, cx - 20, base - 250, 8, C.woodDark)
        pill(g, cx + 18, base - 170, cx + 18, base - 120, 8, C.woodDark)
        dot(g, cx, 190, 6, C.easel)
        dot(g, cx, 360, 6, C.easel)
    }
}

function paintCat(g: G, jump: boolean) {
    const cx = PIECE_SIZE / 2
    if (!jump) {
        box(g, cx, 200, 170, 40, 20, C.cushion)
        box(g, cx + 6, 164, 130, 62, 30, C.purple)
        box(g, cx - 52, 150, 70, 62, 24, C.purple)
        g.fillStyle(C.purple, 1)
        g.fillTriangle(cx - 82, 128, cx - 72, 96, cx - 58, 124)
        g.fillTriangle(cx - 44, 124, cx - 30, 96, cx - 22, 128)
        pill(g, cx - 68, 152, cx - 58, 152, 5, C.ink)
        pill(g, cx - 44, 152, cx - 34, 152, 5, C.ink)
        pill(g, cx + 70, 180, cx + 96, 160, 16, C.purpleDark)
        return
    }
    const y = 150
    box(g, cx, y + 20, 84, 104, 30, C.purple)
    box(g, cx, y - 56, 92, 78, 28, C.purple)
    g.fillStyle(C.purple, 1)
    g.fillTriangle(cx - 44, y - 80, cx - 36, y - 124, cx - 14, y - 90)
    g.fillTriangle(cx + 14, y - 90, cx + 36, y - 124, cx + 44, y - 80)
    eye(g, cx - 20, y - 60, 26)
    eye(g, cx + 20, y - 60, 26)
    box(g, cx, y - 30, 20, 16, 8, C.maroon)
    ;[[-70, 0], [70, 0], [-30, 96], [30, 96]].forEach(([dx, dy]) => dot(g, cx + dx, y + dy, 14, C.purpleDark))
    pill(g, cx + 44, y + 40, cx + 90, y - 10, 16, C.purpleDark)
    ;[[-100, -40], [100, -60], [-96, 40]].forEach(([dx, dy]) => pill(g, cx + dx, y + dy, cx + dx + 10, y + dy - 6, 8, C.ink))
}

function paintPiece(g: G, i: number) {
    const cx = PIECE_SIZE / 2
    const cy = PIECE_SIZE / 2
    switch (i) {
        case 0:
            box(g, cx, cy, 200, 150, 34, C.card)
            box(g, cx, cy + 64, 170, 12, 6, C.orange)
            break
        case 1: {
            g.lineStyle(26, C.orange, 1)
            g.beginPath()
            g.arc(cx, cy, 86, Phaser.Math.DegToRad(-60), Phaser.Math.DegToRad(250))
            g.strokePath()
            const a = Phaser.Math.DegToRad(-60)
            const tx = cx + Math.cos(a) * 86
            const ty = cy + Math.sin(a) * 86
            g.fillStyle(C.orange, 1)
            g.fillTriangle(tx - 30, ty - 16, tx + 26, ty - 22, tx + 4, ty + 30)
            break
        }
        case 2:
            pill(g, cx - 40, cy + 60, cx + 20, cy - 20, 22, C.easel)
            box(g, cx + 36, cy - 44, 48, 60, 16, C.greyDark)
            break
        case 3:
            pill(g, cx - 70, cy - 10, cx + 40, cy - 10, 26, C.graphite)
            g.fillStyle(C.graphite, 1)
            g.fillTriangle(cx + 30, cy - 50, cx + 90, cy - 10, cx + 30, cy + 30)
            pill(g, cx - 50, cy + 56, cx - 20, cy + 56, 18, C.graphite)
            pill(g, cx + 10, cy + 66, cx + 40, cy + 66, 18, C.graphite)
            break
        case 4:
            paintCat(g, false)
            break
        case 5:
            paintCat(g, true)
            break
        case 6:
            dot(g, cx, cy, 70, C.white)
            ;[[-90, -40, 18], [80, -70, 14], [96, 50, 20], [-70, 80, 14]].forEach(([dx, dy, r]) => dot(g, cx + dx, cy + dy, r, C.white))
            break
        case 7:
            box(g, cx, cy + 20, 150, 150, 26, C.grey)
            box(g, cx, cy - 50, 150, 34, 17, C.white)
            pill(g, cx + 40, cy - 40, cx + 40, cy + 10, 16, C.white)
            break
        case 8:
            box(g, 120, 150, 90, 90, 34, 0xd9a07a)
            pill(g, 96, 124, 76, 40, 28, 0xd9a07a)
            pill(g, 150, 190, 186, 226, 34, 0xd9a07a)
            break
    }
}

export function ensureArt(scene: Phaser.Scene) {
    if (!scene.textures.exists(BG)) bake(scene, BG, W, H, null, g => paintYard(g))
    if (!scene.textures.exists(ROBOT)) {
        const s = SHEETS[ROBOT]
        bake(scene, ROBOT, s.frameWidth * 3, s.frameHeight * 2, { w: s.frameWidth, h: s.frameHeight }, paintRobot)
    }
    if (!scene.textures.exists(FENCE)) bake(scene, FENCE, BOARD_CELL.w * 4, BOARD_CELL.h, { w: BOARD_CELL.w, h: BOARD_CELL.h }, (g, i) => {
        if (i < 3) paintPlank(g, i)
    })
    if (!scene.textures.exists(PIECES)) bake(scene, PIECES, PIECE_SIZE * 4, PIECE_SIZE * 3, { w: PIECE_SIZE, h: PIECE_SIZE }, paintPiece)
}
