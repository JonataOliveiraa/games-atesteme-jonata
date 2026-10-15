import Phaser from 'phaser'
import { APP_SHEET, FALL_SHEET, NATURE_SHEET, SCENERY_SHEET, TEO_SHEET, UI_SHEET, type Sheet } from '../data/files'
import { C } from '../data/theme'
import type { Pose } from '../types'

type G = Phaser.GameObjects.Graphics
type P = { x: number; y: number }
type Disc = [number, number, number]

const INK = C.ink
let lw = 6

function bakeSheet(scene: Phaser.Scene, sheet: Sheet, line: number, paint: (g: G, i: number) => void) {
    if (scene.textures.exists(sheet.key)) return
    lw = line
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

const POSES: Pose[] = ['front', 'back', 'side', 'frontUp', 'backUp', 'sideUp', 'cheer', 'oops']

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, TEO_SHEET, 6, (g, i) => teo(g, POSES[i]))
    bakeSheet(scene, NATURE_SHEET, 7, nature)
    bakeSheet(scene, SCENERY_SHEET, 7, scenery)
    bakeSheet(scene, FALL_SHEET, 8, waterfall)
    bakeSheet(scene, APP_SHEET, 8, app)
    bakeSheet(scene, UI_SHEET, 8, ui)
}

function disc(g: G, x: number, y: number, r: number, fill: number, line = lw) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeCircle(x, y, r)
    }
}

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = lw) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

function box(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = lw) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function poly(g: G, points: P[], fill: number, line = lw) {
    g.fillStyle(fill, 1)
    g.fillPoints(points, true)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokePoints(points, true)
    }
}

function limb(g: G, a: P, b: P, width: number, fill: number) {
    g.lineStyle(width + lw, INK, 1)
    g.lineBetween(a.x, a.y, b.x, b.y)
    g.fillStyle(INK, 1)
    g.fillCircle(a.x, a.y, (width + lw) / 2)
    g.fillCircle(b.x, b.y, (width + lw) / 2)
    g.lineStyle(width, fill, 1)
    g.lineBetween(a.x, a.y, b.x, b.y)
    g.fillStyle(fill, 1)
    g.fillCircle(a.x, a.y, width / 2)
    g.fillCircle(b.x, b.y, width / 2)
}

function blob(g: G, discs: Disc[], fill: number) {
    g.fillStyle(INK, 1)
    discs.forEach(([x, y, r]) => g.fillCircle(x, y, r + lw))
    g.fillStyle(fill, 1)
    discs.forEach(([x, y, r]) => g.fillCircle(x, y, r))
}

function ellipsePts(cx: number, cy: number, rx: number, ry: number, rot = 0, n = 28): P[] {
    const out: P[] = []
    const cos = Math.cos(rot)
    const sin = Math.sin(rot)
    for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2
        const x = Math.cos(t) * rx
        const y = Math.sin(t) * ry
        out.push({ x: cx + x * cos - y * sin, y: cy + x * sin + y * cos })
    }
    return out
}

function arc(g: G, x: number, y: number, r: number, from: number, to: number, width = lw, color: number = INK) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

function sparkle(g: G, x: number, y: number, s: number) {
    g.fillStyle(C.white, 0.95)
    g.fillRect(x - s / 6, y - s, s / 3, s * 2)
    g.fillRect(x - s, y - s / 6, s * 2, s / 3)
}

function cheeks(g: G, a: P, b: P) {
    g.fillStyle(C.cheek, 0.65)
    g.fillEllipse(a.x, a.y, 24, 13)
    g.fillEllipse(b.x, b.y, 24, 13)
}

function eye(g: G, x: number, y: number, w = 28, h = 34) {
    oval(g, x, y, w, h, C.eye, 4)
    g.fillStyle(C.eyeDark, 1)
    g.fillEllipse(x, y + 4, w * 0.5, h * 0.55)
    g.fillStyle(C.white, 1)
    g.fillCircle(x - w * 0.18, y - h * 0.2, w * 0.2)
    g.fillCircle(x + w * 0.2, y + h * 0.22, w * 0.09)
}

function closedEye(g: G, x: number, y: number) {
    arc(g, x, y + 8, 12, Math.PI * 1.15, Math.PI * 1.85, 5)
}

// ───────────────────────────────────────────── Téo

function hairBack(g: G, cx: number) {
    oval(g, cx, 100, 172, 154, C.hair)
}

function faceFront(g: G, cx: number) {
    oval(g, cx, 118, 146, 124, C.skin)
}

function bangsFront(g: G, cx: number) {
    const d = cx - 160
    poly(
        g,
        [
            { x: 86, y: 116 },
            { x: 92, y: 72 },
            { x: 126, y: 46 },
            { x: 172, y: 42 },
            { x: 214, y: 58 },
            { x: 236, y: 100 },
            { x: 232, y: 120 },
            { x: 212, y: 92 },
            { x: 198, y: 112 },
            { x: 180, y: 86 },
            { x: 162, y: 108 },
            { x: 146, y: 84 },
            { x: 128, y: 108 },
            { x: 112, y: 88 },
            { x: 100, y: 120 },
        ].map(pt => ({ x: pt.x + d, y: pt.y })),
        C.hair,
    )
    cowlick(g, cx)
    g.fillStyle(C.hairLight, 1)
    g.fillEllipse(cx - 30, 62, 34, 10)
    sparkle(g, cx + 34, 60, 7)
}

function cowlick(g: G, cx: number) {
    poly(
        g,
        [
            { x: cx - 12, y: 48 },
            { x: cx - 4, y: 18 },
            { x: cx + 18, y: 8 },
            { x: cx + 10, y: 26 },
            { x: cx + 10, y: 46 },
        ],
        C.hair,
    )
}

function headFront(g: G, mood: 'smile' | 'joy' | 'oops' | 'peek' = 'smile') {
    hairBack(g, 160)
    faceFront(g, 160)
    bangsFront(g, 160)
    if (mood === 'joy') {
        closedEye(g, 132, 124)
        closedEye(g, 188, 124)
    } else {
        eye(g, 132, 124)
        eye(g, 188, 124)
    }
    cheeks(g, { x: 112, y: 150 }, { x: 208, y: 150 })
    if (mood === 'smile') arc(g, 160, 144, 11, Math.PI * 0.15, Math.PI * 0.85, 5)
    if (mood === 'joy') {
        poly(g, [{ x: 144, y: 146 }, { x: 176, y: 146 }, { x: 170, y: 162 }, { x: 160, y: 166 }, { x: 150, y: 162 }], C.coral, 4)
    }
    if (mood === 'oops') {
        g.lineStyle(5, INK, 1)
        g.beginPath()
        g.moveTo(148, 154)
        g.lineTo(156, 150)
        g.lineTo(164, 155)
        g.lineTo(172, 150)
        g.strokePath()
    }
}

function headBack(g: G) {
    oval(g, 160, 104, 172, 156, C.hair)
    g.fillStyle(C.hairDark, 1)
    g.fillEllipse(160, 150, 120, 26)
    poly(g, [{ x: 120, y: 160 }, { x: 132, y: 176 }, { x: 146, y: 162 }, { x: 160, y: 178 }, { x: 174, y: 162 }, { x: 188, y: 176 }, { x: 200, y: 160 }], C.hair, 5)
    cowlick(g, 160)
    g.fillStyle(C.hairLight, 1)
    g.fillEllipse(130, 66, 40, 12)
    sparkle(g, 196, 70, 7)
}

function headSide(g: G) {
    oval(g, 150, 100, 160, 152, C.hair)
    oval(g, 174, 118, 124, 120, C.skin)
    poly(
        g,
        [
            { x: 112, y: 120 },
            { x: 104, y: 76 },
            { x: 134, y: 46 },
            { x: 184, y: 44 },
            { x: 226, y: 66 },
            { x: 240, y: 104 },
            { x: 222, y: 96 },
            { x: 210, y: 112 },
            { x: 196, y: 88 },
            { x: 176, y: 104 },
            { x: 158, y: 84 },
            { x: 146, y: 110 },
            { x: 134, y: 92 },
            { x: 124, y: 124 },
        ],
        C.hair,
    )
    cowlick(g, 156)
    oval(g, 134, 126, 22, 28, C.skin, 4)
    eye(g, 200, 124, 24, 32)
    g.fillStyle(C.cheek, 0.65)
    g.fillEllipse(212, 150, 22, 12)
    arc(g, 214, 144, 9, Math.PI * 0.2, Math.PI * 0.8, 5)
    sparkle(g, 150, 62, 7)
}

function legsFront(g: G) {
    limb(g, { x: 142, y: 254 }, { x: 140, y: 286 }, 17, C.skin)
    limb(g, { x: 178, y: 254 }, { x: 180, y: 286 }, 17, C.skin)
    oval(g, 136, 296, 42, 20, C.white)
    oval(g, 184, 296, 42, 20, C.white)
    g.fillStyle(C.mintDark, 1)
    g.fillRect(126, 292, 18, 4)
    g.fillRect(176, 292, 18, 4)
}

function torsoFront(g: G) {
    box(g, 116, 224, 88, 40, 14, C.shorts)
    box(g, 114, 158, 92, 78, 24, C.shirt)
    box(g, 114, 160, 34, 76, 14, C.mint)
    box(g, 172, 160, 34, 76, 14, C.mint)
    box(g, 120, 196, 20, 16, 5, C.mintDark, 3)
    box(g, 180, 196, 20, 16, 5, C.mintDark, 3)
    g.lineStyle(7, C.packDark, 1)
    g.lineBetween(126, 160, 128, 196)
    g.lineBetween(194, 160, 192, 196)
}

function tabletEdge(g: G, x: number, y: number) {
    box(g, x, y, 30, 46, 7, C.lilac)
    g.fillStyle(C.lilacDark, 1)
    g.fillRect(x + 6, y + 6, 4, 34)
}

function teo(g: G, pose: Pose) {
    if (pose === 'front' || pose === 'oops') {
        legsFront(g)
        limb(g, { x: 120, y: 176 }, { x: 106, y: 230 }, 16, C.skin)
        if (pose === 'front') limb(g, { x: 200, y: 176 }, { x: 214, y: 230 }, 16, C.skin)
        else limb(g, { x: 200, y: 176 }, { x: 222, y: 108 }, 16, C.skin)
        torsoFront(g)
        if (pose === 'front') tabletEdge(g, 206, 212)
        else tabletEdge(g, 92, 214)
        headFront(g, pose === 'front' ? 'smile' : 'oops')
        if (pose === 'oops') {
            disc(g, 214, 94, 14, C.skin)
            poly(g, [{ x: 250, y: 70 }, { x: 260, y: 92 }, { x: 250, y: 102 }, { x: 240, y: 92 }], C.screen, 4)
        }
        return
    }
    if (pose === 'cheer') {
        legsFront(g)
        limb(g, { x: 120, y: 176 }, { x: 86, y: 110 }, 16, C.skin)
        limb(g, { x: 200, y: 176 }, { x: 234, y: 110 }, 16, C.skin)
        torsoFront(g)
        headFront(g, 'joy')
        tabletEdge(g, 222, 70)
        disc(g, 86, 106, 13, C.skin)
        disc(g, 236, 108, 13, C.skin)
        sparkle(g, 60, 70, 10)
        sparkle(g, 266, 40, 8)
        return
    }
    if (pose === 'frontUp') {
        legsFront(g)
        torsoFront(g)
        limb(g, { x: 120, y: 176 }, { x: 116, y: 160 }, 16, C.skin)
        limb(g, { x: 200, y: 176 }, { x: 204, y: 160 }, 16, C.skin)
        headFront(g, 'peek')
        box(g, 104, 138, 112, 78, 12, C.lilac)
        disc(g, 196, 156, 10, C.ink, 0)
        g.fillStyle(C.white, 1)
        g.fillCircle(193, 153, 3)
        disc(g, 104, 182, 13, C.skin)
        disc(g, 216, 182, 13, C.skin)
        return
    }
    if (pose === 'back' || pose === 'backUp') {
        limb(g, { x: 142, y: 254 }, { x: 140, y: 286 }, 17, C.skin)
        limb(g, { x: 178, y: 254 }, { x: 180, y: 286 }, 17, C.skin)
        oval(g, 136, 294, 40, 20, C.white)
        oval(g, 184, 294, 40, 20, C.white)
        box(g, 116, 224, 88, 40, 14, C.shorts)
        box(g, 114, 158, 92, 78, 24, C.mint)
        if (pose === 'back') {
            limb(g, { x: 120, y: 176 }, { x: 106, y: 230 }, 16, C.skin)
            limb(g, { x: 200, y: 176 }, { x: 214, y: 230 }, 16, C.skin)
            tabletEdge(g, 202, 212)
        }
        box(g, 128, 168, 64, 62, 16, C.pack)
        box(g, 138, 200, 44, 20, 8, C.packDark, 4)
        headBack(g)
        if (pose === 'backUp') {
            limb(g, { x: 120, y: 172 }, { x: 108, y: 70 }, 16, C.skin)
            limb(g, { x: 200, y: 172 }, { x: 212, y: 70 }, 16, C.skin)
            box(g, 96, 4, 128, 84, 12, C.lilac)
            box(g, 106, 12, 108, 68, 8, C.screen, 3)
            g.fillStyle(C.white, 0.7)
            g.fillTriangle(112, 18, 150, 18, 112, 52)
            disc(g, 100, 62, 13, C.skin)
            disc(g, 220, 62, 13, C.skin)
        }
        return
    }
    const up = pose === 'sideUp'
    limb(g, { x: 150, y: 254 }, { x: up ? 140 : 128, y: 288 }, 17, C.skin)
    limb(g, { x: 168, y: 254 }, { x: up ? 176 : 188, y: 286 }, 17, C.skin)
    oval(g, up ? 146 : 134, 296, 42, 20, C.white)
    oval(g, up ? 184 : 196, 294, 42, 20, C.white)
    box(g, 102, 168, 36, 58, 12, C.pack)
    box(g, 128, 224, 66, 40, 14, C.shorts)
    box(g, 126, 158, 70, 78, 22, C.shirt)
    box(g, 126, 160, 40, 76, 14, C.mint)
    headSide(g)
    if (up) {
        limb(g, { x: 168, y: 178 }, { x: 226, y: 160 }, 16, C.skin)
        box(g, 226, 108, 20, 96, 6, C.lilac)
        disc(g, 228, 162, 13, C.skin)
    } else {
        limb(g, { x: 162, y: 178 }, { x: 184, y: 226 }, 16, C.skin)
        tabletEdge(g, 176, 210)
    }
}

// ───────────────────────────────────────────── natureza

function petals(g: G, cx: number, cy: number, r: number, n: number, len: number, wide: number, fill: number) {
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        poly(g, ellipsePts(cx + Math.cos(a) * r, cy + Math.sin(a) * r, len, wide, a, 16), fill, 4)
    }
}

function wing(g: G, cx: number, cy: number, rx: number, ry: number, rot: number, fill: number) {
    poly(g, ellipsePts(cx, cy, rx, ry, rot, 24), fill)
}

function butterfly(g: G, open: boolean) {
    const k = open ? 1 : 0.5
    wing(g, 128 - 44 * k, 100, 46 * k, 36, -0.35 * k, C.lilac)
    wing(g, 128 + 44 * k, 100, 46 * k, 36, 0.35 * k, C.lilac)
    wing(g, 128 - 32 * k, 160, 32 * k, 26, 0.4 * k, C.butter)
    wing(g, 128 + 32 * k, 160, 32 * k, 26, -0.4 * k, C.butter)
    if (open) {
        g.fillStyle(C.white, 0.9)
        g.fillCircle(84, 94, 9)
        g.fillCircle(172, 94, 9)
        g.fillStyle(C.lilacDark, 1)
        g.fillCircle(98, 166, 7)
        g.fillCircle(158, 166, 7)
    }
    oval(g, 128, 130, 22, 96, C.lilacDark)
    g.lineStyle(4, INK, 1)
    g.lineBetween(122, 86, 104, 50)
    g.lineBetween(134, 86, 152, 50)
    disc(g, 104, 48, 6, C.ink, 0)
    disc(g, 152, 48, 6, C.ink, 0)
}

function frog(g: G, jump: boolean) {
    if (!jump) {
        oval(g, 80, 214, 56, 24, C.frogDark)
        oval(g, 176, 214, 56, 24, C.frogDark)
        oval(g, 128, 164, 156, 112, C.frog)
        oval(g, 128, 182, 92, 62, C.belly, 0)
        disc(g, 90, 104, 28, C.frog)
        disc(g, 166, 104, 28, C.frog)
        disc(g, 90, 102, 18, C.white, 4)
        disc(g, 166, 102, 18, C.white, 4)
        disc(g, 92, 104, 9, C.ink, 0)
        disc(g, 164, 104, 9, C.ink, 0)
        g.fillStyle(C.white, 1)
        g.fillCircle(88, 99, 3.5)
        g.fillCircle(160, 99, 3.5)
        arc(g, 128, 140, 26, Math.PI * 0.2, Math.PI * 0.8, 5)
        cheeks(g, { x: 80, y: 150 }, { x: 176, y: 150 })
        return
    }
    limb(g, { x: 92, y: 150 }, { x: 34, y: 196 }, 22, C.frogDark)
    oval(g, 30, 204, 44, 18, C.frogDark)
    limb(g, { x: 176, y: 150 }, { x: 214, y: 186 }, 16, C.frogDark)
    poly(g, ellipsePts(132, 136, 82, 50, -0.3, 30), C.frog)
    poly(g, ellipsePts(136, 152, 52, 26, -0.3, 20), C.belly, 0)
    disc(g, 174, 92, 24, C.frog)
    disc(g, 174, 90, 15, C.white, 4)
    disc(g, 178, 92, 8, C.ink, 0)
    g.fillStyle(C.white, 1)
    g.fillCircle(174, 87, 3)
    arc(g, 196, 126, 16, Math.PI * 0.05, Math.PI * 0.6, 5)
}

function duck(g: G) {
    g.fillStyle(C.water, 0.7)
    g.fillEllipse(128, 196, 216, 60)
    g.lineStyle(5, C.waterLight, 1)
    g.strokeEllipse(128, 196, 216, 60)
    poly(g, [{ x: 50, y: 150 }, { x: 22, y: 128 }, { x: 64, y: 136 }], C.duck)
    oval(g, 118, 168, 160, 84, C.duck)
    oval(g, 108, 160, 76, 42, C.cream, 4)
    disc(g, 180, 112, 38, C.duck)
    oval(g, 220, 120, 40, 20, C.beak)
    disc(g, 190, 104, 6, C.ink, 0)
    g.fillStyle(C.white, 1)
    g.fillCircle(188, 102, 2.5)
    g.fillStyle(C.cheek, 0.6)
    g.fillEllipse(188, 124, 18, 10)
}

function lily(g: G) {
    poly(
        g,
        [...ellipsePts(128, 132, 104, 92, 0, 40).filter(pt => !(pt.x > 128 && Math.abs(pt.y - 132) < (pt.x - 128) * 0.45)), { x: 128, y: 132 }],
        C.leaf,
    )
    g.lineStyle(4, C.leafDark, 1)
    for (let i = 0; i < 6; i++) {
        const a = Math.PI * 0.35 + (i / 6) * Math.PI * 1.4
        g.lineBetween(128, 132, 128 + Math.cos(a) * 78, 132 + Math.sin(a) * 68)
    }
    petals(g, 92, 104, 14, 6, 16, 9, C.pink)
    disc(g, 92, 104, 9, C.butter, 3)
}

function nature(g: G, i: number) {
    if (i === 0) {
        box(g, 166, 170, 26, 52, 10, C.stem)
        box(g, 60, 172, 24, 46, 10, C.stem)
        box(g, 114, 140, 30, 82, 12, C.stem)
        poly(g, [...ellipsePts(178, 172, 44, 30, 0, 24).filter(pt => pt.y <= 176)], C.mushroom)
        poly(g, [...ellipsePts(72, 174, 40, 28, 0, 24).filter(pt => pt.y <= 178)], C.mushroom)
        poly(g, [...ellipsePts(128, 142, 66, 46, 0, 28).filter(pt => pt.y <= 146)], C.mushroom)
        g.fillStyle(C.mushroomDark, 1)
        ;[
            [110, 116, 8],
            [140, 108, 7],
            [156, 128, 6],
            [100, 134, 5],
            [178, 156, 6],
            [64, 158, 6],
        ].forEach(([x, y, r]) => g.fillCircle(x, y, r))
        sparkle(g, 120, 102, 6)
        return
    }
    if (i === 1 || i === 2) return butterfly(g, i === 1)
    if (i === 3) {
        limb(g, { x: 128, y: 240 }, { x: 128, y: 110 }, 12, C.leafDark)
        poly(g, ellipsePts(96, 196, 34, 14, -0.5, 18), C.leaf)
        poly(g, ellipsePts(160, 170, 34, 14, 0.5, 18), C.leaf)
        petals(g, 128, 90, 52, 14, 26, 14, C.sun)
        disc(g, 128, 90, 40, C.seed)
        g.fillStyle(C.sunDark, 1)
        for (let k = 0; k < 10; k++) g.fillCircle(128 + Math.cos(k * 2.4) * (k * 3), 90 + Math.sin(k * 2.4) * (k * 3), 3.5)
        sparkle(g, 112, 76, 6)
        return
    }
    if (i === 4 || i === 5) return frog(g, i === 5)
    if (i === 6) return duck(g)
    lily(g)
}

// ───────────────────────────────────────────── cenário

function canopy(g: G, discs: Disc[], fill: number, dark: number, light: number) {
    blob(g, discs, fill)
    g.fillStyle(dark, 0.55)
    discs.slice(0, 3).forEach(([x, y, r]) => g.fillEllipse(x, y + r * 0.55, r * 1.3, r * 0.5))
    g.fillStyle(light, 1)
    discs.slice(3).forEach(([x, y, r]) => g.fillEllipse(x - r * 0.2, y - r * 0.35, r * 0.7, r * 0.32))
}

function scenery(g: G, i: number) {
    if (i === 0) {
        poly(g, [{ x: 128, y: 300 }, { x: 140, y: 216 }, { x: 180, y: 216 }, { x: 192, y: 300 }, { x: 172, y: 290 }, { x: 160, y: 304 }, { x: 148, y: 290 }], C.trunk)
        canopy(
            g,
            [
                [160, 160, 84],
                [94, 172, 58],
                [226, 172, 58],
                [118, 104, 60],
                [204, 106, 58],
                [160, 74, 54],
            ],
            C.leaf,
            C.leafDark,
            C.leafLight,
        )
        sparkle(g, 210, 82, 8)
        return
    }
    if (i === 1) {
        box(g, 148, 200, 24, 100, 8, C.trunk)
        canopy(
            g,
            [
                [160, 160, 64],
                [112, 170, 44],
                [208, 170, 44],
                [134, 116, 46],
                [190, 118, 44],
            ],
            C.leaf,
            C.leafDark,
            C.leafLight,
        )
        ;[
            [118, 150],
            [176, 136],
            [204, 182],
            [146, 190],
            [150, 108],
        ].forEach(([x, y]) => disc(g, x, y, 10, C.oops, 4))
        return
    }
    if (i === 2) {
        canopy(
            g,
            [
                [160, 220, 72],
                [100, 236, 52],
                [222, 236, 52],
                [130, 176, 50],
                [194, 178, 48],
            ],
            C.leaf,
            C.leafDark,
            C.leafLight,
        )
        ;[
            [120, 196, C.white],
            [172, 166, C.lilac],
            [210, 214, C.white],
            [146, 236, C.lilac],
            [92, 228, C.white],
        ].forEach(([x, y, c]) => {
            petals(g, x, y, 7, 5, 8, 5, c)
            disc(g, x, y, 4, C.butter, 0)
        })
        return
    }
    if (i === 3) {
        blob(
            g,
            [
                [160, 214, 84],
                [96, 236, 56],
                [226, 236, 56],
            ],
            C.rock,
        )
        g.fillStyle(C.rockDark, 1)
        g.fillEllipse(160, 270, 220, 40)
        g.fillStyle(C.white, 0.6)
        g.fillEllipse(130, 168, 60, 18)
        poly(g, ellipsePts(176, 144, 50, 16, 0.1, 20), C.moss, 4)
        return
    }
    if (i === 4) {
        box(g, 40, 168, 236, 92, 44, C.trunk)
        g.lineStyle(4, C.trunkDark, 1)
        ;[90, 140, 190].forEach(x => g.lineBetween(x, 182, x + 16, 246))
        oval(g, 266, 214, 56, 92, C.wood)
        arc(g, 266, 214, 16, 0, Math.PI * 2, 4, C.woodDark)
        arc(g, 266, 214, 30, 0, Math.PI * 2, 3, C.woodDark)
        box(g, 112, 140, 12, 30, 5, C.stem, 4)
        poly(g, ellipsePts(118, 140, 22, 13, 0, 18).filter(pt => pt.y <= 142), C.mushroom, 4)
        return
    }
    if (i === 5) {
        const blades: [number, number, number][] = [
            [100, 60, C.leafDark],
            [126, 30, C.leaf],
            [150, 20, C.pack],
            [172, 40, C.leaf],
            [196, 64, C.leafDark],
            [218, 96, C.leaf],
            [80, 110, C.leaf],
        ]
        blades.forEach(([x, top, c]) => poly(g, [{ x: x - 12, y: 300 }, { x, y: top }, { x: x + 12, y: 300 }], c, 5))
        ;[
            [138, 70],
            [184, 86],
            [110, 104],
        ].forEach(([x, y]) => {
            g.lineStyle(5, INK, 1)
            g.lineBetween(x, y + 30, x, 300)
            oval(g, x, y, 18, 52, C.trunkDark, 4)
        })
        return
    }
    if (i === 6) {
        box(g, 110, 16, 100, 288, 10, C.wood)
        g.lineStyle(4, C.woodDark, 1)
        for (let y = 44; y < 300; y += 30) g.lineBetween(112, y, 208, y)
        ;[
            [112, 26],
            [208, 26],
            [112, 296],
            [208, 296],
            [112, 160],
            [208, 160],
        ].forEach(([x, y]) => disc(g, x, y, 12, C.woodDark, 4))
        return
    }
    poly(g, ellipsePts(160, 270, 96, 34, 0, 24), C.leaf)
    ;[
        [118, 236, C.sun],
        [160, 214, C.lilac],
        [204, 238, C.white],
        [138, 262, C.white],
        [184, 266, C.sun],
    ].forEach(([x, y, c]) => {
        g.lineStyle(4, C.leafDark, 1)
        g.lineBetween(x, y, x, 280)
        petals(g, x, y, 10, 5, 11, 7, c)
        disc(g, x, y, 6, C.sunDark, 3)
    })
}

// ───────────────────────────────────────────── cachoeira

function waterfall(g: G, i: number) {
    oval(g, 256, 420, 380, 132, C.water)
    g.lineStyle(6, C.waterLight, 1)
    g.strokeEllipse(256, 420, 330, 104)
    box(g, 192, 160, 128, 256, 24, C.water)
    g.fillStyle(C.waterLight, 1)
    g.fillRect(204, 168, 104, 240)
    g.lineStyle(10, C.white, 0.95)
    const shift = i === 0 ? 0 : 34
    ;[214, 244, 270, 298].forEach((x, k) => {
        const top = 176 + ((k * 52 + shift) % 120)
        g.lineBetween(x, top, x, top + 70)
        g.lineBetween(x, top + 120, x, Math.min(400, top + 170))
    })
    blob(
        g,
        [
            [256, 124, 120],
            [140, 172, 70],
            [372, 172, 70],
            [180, 92, 70],
            [330, 92, 70],
        ],
        C.rock,
    )
    g.fillStyle(C.rockDark, 1)
    g.fillEllipse(256, 196, 220, 40)
    g.fillStyle(C.white, 0.55)
    g.fillEllipse(210, 70, 80, 20)
    poly(g, ellipsePts(320, 64, 46, 16, 0.2, 20), C.moss, 5)
    poly(g, ellipsePts(150, 134, 36, 12, -0.3, 20), C.moss, 5)
    box(g, 192, 168, 128, 30, 14, C.water, 0)
    g.fillStyle(C.white, 1)
    const foam = i === 0 ? [180, 214, 256, 298, 332] : [196, 236, 276, 316]
    foam.forEach((x, k) => g.fillCircle(x, 404 + (k % 2) * 10, 18))
    g.fillStyle(C.waterLight, 1)
    ;(i === 0 ? [150, 362] : [170, 344]).forEach(x => g.fillEllipse(x, 446, 50, 12))
}

// ───────────────────────────────────────────── botões e ícones

function ring(g: G) {
    disc(g, 128, 128, 104, C.greyDark)
    disc(g, 128, 128, 82, C.white)
}

function app(g: G, i: number) {
    if (i <= 2) {
        ring(g)
        if (i === 1) disc(g, 128, 128, 46, C.red, 6)
        if (i === 2) box(g, 92, 92, 72, 72, 16, C.red, 6)
        if (i === 0) {
            g.fillStyle(C.grey, 1)
            g.fillEllipse(110, 100, 60, 26)
        }
        return
    }
    if (i === 3) {
        box(g, 82, 52, 56, 34, 10, C.mintDark)
        box(g, 30, 74, 196, 136, 30, C.mint)
        disc(g, 128, 144, 50, C.white)
        disc(g, 128, 144, 32, C.mintDark, 5)
        disc(g, 128, 144, 16, C.ink, 0)
        g.fillStyle(C.white, 1)
        g.fillCircle(120, 136, 6)
        box(g, 178, 90, 30, 20, 6, C.butter, 4)
        return
    }
    if (i === 4) {
        disc(g, 78, 70, 30, C.lilac)
        disc(g, 144, 70, 30, C.lilac)
        disc(g, 78, 70, 10, C.lilacDark, 0)
        disc(g, 144, 70, 10, C.lilacDark, 0)
        poly(g, [{ x: 176, y: 128 }, { x: 236, y: 96 }, { x: 236, y: 206 }, { x: 176, y: 174 }], C.lilacDark)
        box(g, 26, 100, 160, 110, 26, C.lilac)
        disc(g, 62, 132, 10, C.red, 4)
        return
    }
    if (i === 5 || i === 6) {
        const on = i === 6
        if (on) {
            g.lineStyle(10, C.sunDark, 1)
            for (let k = 0; k < 7; k++) {
                const a = Math.PI * (1.05 + k * 0.15)
                g.lineBetween(128 + Math.cos(a) * 84, 104 + Math.sin(a) * 84, 128 + Math.cos(a) * 112, 104 + Math.sin(a) * 112)
            }
        }
        disc(g, 128, 104, 66, on ? C.butter : C.grey)
        box(g, 98, 166, 60, 50, 10, C.greyDark)
        g.lineStyle(5, INK, 1)
        g.lineBetween(100, 184, 156, 184)
        g.lineBetween(100, 200, 156, 200)
        g.fillStyle(C.white, 0.85)
        g.fillEllipse(104, 82, 26, 36)
        return
    }
    limb(g, { x: 160, y: 160 }, { x: 214, y: 214 }, 30, C.trunk)
    disc(g, 110, 110, 70, C.trunkDark)
    disc(g, 110, 110, 52, C.waterLight)
    g.fillStyle(C.white, 0.9)
    g.fillEllipse(92, 90, 30, 18)
}

function ui(g: G, i: number) {
    if (i === 0) {
        box(g, 20, 192, 600, 104, 24, C.woodDark)
        box(g, 30, 200, 580, 86, 16, C.cream, 4)
        box(g, 294, 182, 52, 24, 10, C.greyDark, 5)
        return
    }
    if (i === 1) {
        box(g, 170, 80, 300, 320, 12, C.paper)
        box(g, 188, 98, 264, 198, 4, C.grey, 4)
        return
    }
    if (i === 2) {
        box(g, 140, 90, 360, 300, 20, C.film)
        g.fillStyle(C.white, 0.85)
        for (let x = 162; x < 490; x += 40) {
            g.fillRoundedRect(x, 102, 20, 16, 5)
            g.fillRoundedRect(x, 362, 20, 16, 5)
        }
        box(g, 170, 128, 300, 225, 6, C.grey, 4)
        return
    }
    if (i === 3) {
        disc(g, 320, 240, 196, 0xeee6f8)
        g.lineStyle(10, C.lilac, 1)
        g.strokeCircle(320, 240, 150)
        g.fillStyle(C.lilac, 0.35)
        g.fillCircle(320, 240, 96)
        return
    }
    if (i === 4) {
        disc(g, 320, 240, 150, C.mint)
        g.fillStyle(C.mintDark, 0.35)
        g.fillEllipse(320, 300, 230, 120)
        g.fillStyle(C.white, 0.8)
        g.fillEllipse(270, 180, 110, 60)
        return
    }
    box(g, 170, 90, 300, 300, 64, C.cream)
    g.fillStyle(C.creamDark, 1)
    g.fillRoundedRect(184, 300, 272, 70, { tl: 0, tr: 0, bl: 54, br: 54 })
    g.fillStyle(C.white, 0.85)
    g.fillRoundedRect(196, 112, 180, 30, 15)
}
