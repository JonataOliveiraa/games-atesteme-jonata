import Phaser from 'phaser'
import { BG, CAST, CAST_CELL, DRAWN_CELL, OBJ_CELL, OBJECTS, OBJ, POSE } from '../data/files'
import { H, W, WALL_Y } from '../data/layout'
import { C } from '../data/theme'

export type G = Phaser.GameObjects.Graphics

const LINE = 5

export function bake(scene: Phaser.Scene, key: string, w: number, h: number, cell: number | null, paint: (g: G, i: number) => void, drawn = cell) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    const cols = cell ? Math.floor(w / cell) : 1
    const rows = cell ? Math.floor(h / cell) : 1
    for (let i = 0; i < cols * rows; i++) {
        g.save()
        if (cell) g.translateCanvas((i % cols) * cell, Math.floor(i / cols) * cell)
        if (cell && drawn) g.scaleCanvas(cell / drawn, cell / drawn)
        paint(g, i)
        g.restore()
    }
    g.generateTexture(key, w, h)
    g.destroy()
    const texture = scene.textures.get(key)
    if (cell) for (let i = 0; i < cols * rows; i++) texture.add(i, 0, (i % cols) * cell, Math.floor(i / cols) * cell, cell, cell)
    ;(texture.customData as { fallback?: boolean }).fallback = true
}

export function ensureArt(scene: Phaser.Scene) {
    if (!scene.textures.exists(BG)) bake(scene, BG, W, H, null, room)
    if (!scene.textures.exists(OBJECTS)) bake(scene, OBJECTS, OBJ_CELL * 4, OBJ_CELL * 3, OBJ_CELL, (g, i) => OBJECT_PAINT[i]?.(g), DRAWN_CELL)
    if (!scene.textures.exists(CAST)) bake(scene, CAST, CAST_CELL * 4, CAST_CELL * 3, CAST_CELL, (g, i) => CAST_PAINT[i]?.(g), DRAWN_CELL)
}

type P = Phaser.Types.Math.Vector2Like

const pts = (flat: number[]): P[] => {
    const out: P[] = []
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

export function disc(g: G, x: number, y: number, r: number, fill: number, line = LINE, alpha = 1) {
    g.fillStyle(fill, alpha)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeCircle(x, y, r)
    }
}

export function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE, alpha = 1) {
    g.fillStyle(fill, alpha)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

export function box(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = LINE, alpha = 1) {
    g.fillStyle(fill, alpha)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function limb(g: G, x1: number, y1: number, x2: number, y2: number, fill: number, width = 16) {
    g.lineStyle(width + 7, C.ink, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(C.ink, 1)
    g.fillCircle(x1, y1, (width + 7) / 2)
    g.fillCircle(x2, y2, (width + 7) / 2)
    g.lineStyle(width, fill, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(fill, 1)
    g.fillCircle(x1, y1, width / 2)
    g.fillCircle(x2, y2, width / 2)
}

export function sparkle(g: G, x: number, y: number, r: number, fill: number, line = 3) {
    const k = r * 0.3
    poly(g, [x, y - r, x + k, y - k, x + r, y, x + k, y + k, x, y + r, x - k, y + k, x - r, y, x - k, y - k], fill, line)
}

function arcLine(g: G, x: number, y: number, r: number, from: number, to: number, width = 4, color: number = C.ink) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

function room(g: G) {
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, W, WALL_Y)
    g.fillStyle(C.wallDot, 1)
    for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 28; col++) {
            g.fillCircle(col * 48 + (row % 2) * 24 + 12, row * 46 + 20, 4)
        }
    }
    g.fillStyle(C.floor, 1)
    g.fillRect(0, WALL_Y, W, H - WALL_Y)
    g.lineStyle(3, C.floorLine, 0.45)
    ;[604, 650, 696].forEach((y, row) => {
        g.lineBetween(0, y, W, y)
        for (let x = (row * 140) % 280; x < W; x += 280) g.lineBetween(x + 60, y - (row === 0 ? 42 : 46), x + 60, y)
    })
    g.fillStyle(C.floorDark, 0.35)
    g.fillRect(0, WALL_Y, W, 10)
    box(g, -10, WALL_Y - 16, W + 20, 18, 0, C.baseboard, 3)

    g.fillStyle(C.skyLight, 1)
    g.fillRect(1196, 146, 90, WALL_Y - 146)
    g.fillStyle(C.creamDark, 1)
    g.fillRect(1196, WALL_Y - 40, 90, 40)
    g.lineStyle(5, C.ink, 1)
    g.fillStyle(C.woodLight, 1)
    g.fillRect(1180, 132, 18, WALL_Y - 132)
    g.fillRect(1180, 132, 110, 16)
    g.strokeRect(1180, 132, 18, WALL_Y - 132)
    g.strokeRect(1180, 132, 110, 16)

    box(g, 1064, 92, 104, 84, 8, C.woodLight, 4)
    g.fillStyle(C.white, 1)
    g.fillRect(1075, 103, 82, 62)
    disc(g, 1096, 123, 10, C.sun, 3)
    poly(g, [1112, 158, 1131, 136, 1150, 158], C.coral, 3)
    box(g, 1118, 148, 24, 17, 2, C.coral, 3)
    g.lineStyle(3, C.mintDark, 1)
    g.lineBetween(1077, 162, 1155, 162)

    oval(g, 640, 664, 600, 74, C.rugDark, 4)
    oval(g, 640, 662, 560, 60, C.rug, 0)
    g.lineStyle(3, C.white, 0.8)
    g.strokeEllipse(640, 662, 470, 44)

    poly(g, [24, 520, 92, 520, 84, 572, 32, 572], C.pot, 4)
    box(g, 18, 510, 80, 16, 6, C.pot, 4)
    ;[
        [42, 470, 26],
        [76, 462, 24],
        [58, 432, 26],
        [30, 438, 18],
        [86, 426, 18],
    ].forEach(([x, y, r]) => disc(g, x, y, r, C.plant, 4))
    g.lineStyle(3, C.plantDark, 1)
    g.lineBetween(58, 510, 58, 440)
    g.lineBetween(58, 490, 40, 470)
    g.lineBetween(58, 480, 78, 462)
}

function windowFrame(g: G) {
    g.fillStyle(C.sky, 1)
    g.fillRect(48, 48, 224, 224)
    g.fillStyle(C.skyLight, 1)
    g.fillRect(48, 190, 224, 82)
    g.lineStyle(14, C.frame, 1)
    g.strokeRect(41, 41, 238, 238)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeRect(34, 34, 252, 252)
    g.strokeRect(48, 48, 224, 224)
    box(g, 154, 48, 12, 224, 0, C.frame, 3)
    box(g, 48, 154, 224, 12, 0, C.frame, 3)
    box(g, 24, 270, 272, 20, 6, C.frame, 4)
}

function rod(g: G) {
    box(g, 12, 16, 296, 12, 6, C.woodDark, 4)
    disc(g, 14, 22, 10, C.woodDark, 4)
    disc(g, 306, 22, 10, C.woodDark, 4)
}

function curtainOpen(g: G, flip: boolean) {
    const m = (x: number) => (flip ? 320 - x : x)
    poly(g, [m(24), 24, m(96), 24, m(82), 118, m(66), 180, m(80), 296, m(24), 296], C.curtain, 4)
    g.lineStyle(3, C.curtainDark, 1)
    g.lineBetween(m(48), 36, m(46), 176)
    g.lineBetween(m(66), 36, m(58), 176)
    g.lineBetween(m(46), 196, m(40), 288)
    oval(g, m(64), 182, 30, 18, C.yellow, 3)
}

function curtainShut(g: G, flip: boolean) {
    const m = (x: number) => (flip ? 320 - x : x)
    poly(g, [m(22), 24, m(164), 24, m(164), 298, m(22), 298], C.curtain, 4)
    g.lineStyle(3, C.curtainDark, 1)
    ;[52, 86, 120, 150].forEach(x => g.lineBetween(m(x), 40, m(x + (x % 2 ? 4 : -4)), 286))
}

function windowOpen(g: G) {
    g.fillStyle(C.sunGlow, 0.5)
    g.fillCircle(115, 105, 64)
    windowFrame(g)
    g.lineStyle(5, C.sun, 1)
    for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        g.lineBetween(115 + Math.cos(a) * 44, 105 + Math.sin(a) * 44, 115 + Math.cos(a) * 58, 105 + Math.sin(a) * 58)
    }
    disc(g, 115, 105, 34, C.sun, 4)
    oval(g, 106, 96, 16, 10, C.white, 0, 0.7)
    rod(g)
    curtainOpen(g, false)
    curtainOpen(g, true)
}

function windowShut(g: G) {
    g.lineStyle(10, C.sunGlow, 0.9)
    g.strokeRect(28, 28, 264, 264)
    windowFrame(g)
    curtainShut(g, false)
    curtainShut(g, true)
    rod(g)
}

function table(g: G) {
    box(g, 36, 236, 22, 64, 4, C.woodDark, 4)
    box(g, 262, 236, 22, 64, 4, C.woodDark, 4)
    box(g, 28, 210, 264, 30, 4, C.wood, 4)
    box(g, 128, 216, 64, 18, 4, C.woodLight, 3)
    disc(g, 160, 225, 4, C.woodDark, 2)
    box(g, 15, 196, 290, 22, 8, C.wood, 5)
    g.lineStyle(4, C.woodLight, 1)
    g.lineBetween(30, 202, 290, 202)
}

function shelf(g: G) {
    poly(g, [72, 168, 104, 168, 72, 212], C.cream, 4)
    poly(g, [248, 168, 216, 168, 248, 212], C.cream, 4)
    box(g, 40, 150, 240, 22, 6, C.wood, 5)
    g.lineStyle(3, C.woodLight, 1)
    g.lineBetween(52, 156, 268, 156)
}

type Mood = 'ok' | 'wet' | 'hot' | 'broken'

function screenFace(g: G, mood: Mood) {
    const ex = [134, 186]
    const ey = 196
    if (mood === 'broken') {
        ex.forEach(x => {
            g.lineStyle(4, C.ink, 1)
            g.strokeCircle(x, ey, 13)
            g.strokeCircle(x, ey, 6)
        })
        g.lineStyle(4, C.ink, 1)
        g.beginPath()
        g.moveTo(140, 236)
        for (let k = 1; k <= 4; k++) g.lineTo(140 + k * 10, 236 + (k % 2 ? -5 : 5))
        g.strokePath()
        return
    }
    ex.forEach(x => {
        oval(g, x, ey, 24, 32, C.ink, 0)
        oval(g, x, ey + 6, 16, 14, mood === 'hot' ? 0x8a3a2a : 0x3a6a9a, 0)
        disc(g, x - 4, ey - 8, 5, C.white, 0)
        disc(g, x + 5, ey + 4, 2.5, C.white, 0)
    })
    oval(g, 116, 216, 16, 8, C.blush, 0, 0.8)
    oval(g, 204, 216, 16, 8, C.blush, 0, 0.8)
    if (mood === 'ok') arcLine(g, 160, 214, 14, 0.15 * Math.PI, 0.85 * Math.PI, 4)
    if (mood === 'wet') arcLine(g, 160, 236, 12, 1.15 * Math.PI, 1.85 * Math.PI, 4)
    if (mood === 'hot') {
        g.lineStyle(4, C.ink, 1)
        g.beginPath()
        g.moveTo(144, 228)
        for (let k = 1; k <= 4; k++) g.lineTo(144 + k * 8, 228 + (k % 2 ? -5 : 4))
        g.strokePath()
    }
}

function tablet(g: G, mood: Mood) {
    poly(g, [124, 286, 140, 250, 180, 250, 196, 286], C.mintDark, 4)
    box(g, 96, 282, 128, 18, 8, C.caseMint, 4)
    box(g, 62, 124, 196, 150, 22, C.caseMint, LINE)
    box(g, 74, 136, 172, 126, 12, 0x5a4a5c, 3)
    const screen = mood === 'hot' ? C.screenHot : mood === 'broken' ? 0x8a9bb4 : C.screen
    box(g, 82, 144, 156, 110, 8, screen, 0)
    g.fillStyle(C.white, 0.35)
    g.fillTriangle(82, 144, 140, 144, 82, 200)
    screenFace(g, mood)
    if (mood === 'ok') {
        sparkle(g, 222, 160, 9, C.white, 2)
        sparkle(g, 98, 238, 6, C.white, 2)
    }
    if (mood === 'wet') {
        ;[
            [96, 150, 18],
            [150, 140, 14],
            [216, 168, 16],
            [110, 176, 10],
        ].forEach(([x, y, r]) => disc(g, x, y, r, C.juice, 3))
        box(g, 92, 160, 10, 90, 5, C.juice, 3)
        box(g, 214, 176, 10, 70, 5, C.juice, 3)
        oval(g, 198, 214, 10, 14, C.sweat, 2)
    }
    if (mood === 'hot') {
        ;[
            [118, 104, 16],
            [160, 90, 20],
            [204, 104, 16],
        ].forEach(([x, y, r]) => disc(g, x, y, r, C.steam, 3))
        oval(g, 232, 150, 12, 18, C.sweat, 3)
        oval(g, 90, 160, 10, 14, C.sweat, 3)
    }
    if (mood === 'broken') {
        g.lineStyle(6, C.ink, 1)
        g.beginPath()
        g.moveTo(96, 150)
        g.lineTo(140, 188)
        g.lineTo(126, 206)
        g.lineTo(178, 246)
        g.strokePath()
        g.lineStyle(3, C.white, 1)
        g.beginPath()
        g.moveTo(96, 150)
        g.lineTo(140, 188)
        g.lineTo(126, 206)
        g.lineTo(178, 246)
        g.strokePath()
        g.lineStyle(4, C.ink, 1)
        g.lineBetween(140, 188, 200, 170)
    }
}

function cupBody(g: G) {
    g.lineStyle(9, C.ink, 1)
    g.lineBetween(168, 222, 186, 158)
    g.lineBetween(186, 158, 208, 150)
    g.lineStyle(5, C.straw, 1)
    g.lineBetween(168, 222, 186, 158)
    g.lineBetween(186, 158, 208, 150)
    poly(g, [120, 190, 200, 190, 190, 300, 130, 300], C.glass, LINE, 0.95)
    poly(g, [125, 210, 195, 210, 187, 294, 133, 294], C.juice, 0)
    g.fillStyle(C.juiceDark, 0.5)
    g.fillRect(126, 210, 68, 8)
    g.lineStyle(LINE, C.ink, 1)
    g.strokePoints(pts([120, 190, 200, 190, 190, 300, 130, 300]), true)
    g.fillStyle(C.white, 0.7)
    g.fillRect(136, 220, 8, 60)
}

function cup(g: G) {
    cupBody(g)
}

function cupDown(g: G) {
    oval(g, 226, 292, 150, 22, C.juice, 4)
    g.fillStyle(C.juiceDark, 0.5)
    g.fillEllipse(236, 294, 80, 8)
    poly(g, [88, 262, 196, 252, 196, 300, 88, 292], C.glass, LINE, 0.95)
    poly(g, [100, 280, 190, 274, 190, 296, 100, 290], C.juice, 0)
    g.lineStyle(LINE, C.ink, 1)
    g.strokePoints(pts([88, 262, 196, 252, 196, 300, 88, 292]), true)
    g.lineStyle(9, C.ink, 1)
    g.lineBetween(196, 268, 250, 250)
    g.lineStyle(5, C.straw, 1)
    g.lineBetween(196, 268, 250, 250)
}

function socket(g: G) {
    box(g, 104, 96, 112, 122, 18, C.white, LINE)
    oval(g, 140, 128, 10, 18, C.ink, 0)
    oval(g, 180, 128, 10, 18, C.ink, 0)
    g.lineStyle(14, C.ink, 1)
    g.lineBetween(160, 206, 160, 240)
    g.lineStyle(7, C.white, 1)
    g.lineBetween(160, 206, 160, 240)
    box(g, 128, 150, 64, 62, 12, C.cream, 4)
    g.lineStyle(3, C.creamDark, 1)
    g.lineBetween(140, 170, 180, 170)
}

function seal(g: G) {
    for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2
        disc(g, 160 + Math.cos(a) * 82, 160 + Math.sin(a) * 82, 20, C.mint, LINE)
    }
    disc(g, 160, 160, 86, C.mint, 0)
    disc(g, 160, 160, 66, C.mintDark, 0, 0.25)
    g.lineStyle(24, C.ink, 1)
    g.beginPath()
    g.moveTo(118, 160)
    g.lineTo(150, 192)
    g.lineTo(206, 128)
    g.strokePath()
    g.lineStyle(14, C.white, 1)
    g.beginPath()
    g.moveTo(118, 160)
    g.lineTo(150, 192)
    g.lineTo(206, 128)
    g.strokePath()
    disc(g, 196, 206, 9, C.coral, 3)
    disc(g, 212, 206, 9, C.coral, 3)
    poly(g, [188, 210, 220, 210, 204, 228], C.coral, 0)
    sparkle(g, 236, 82, 16, C.white, 3)
}

const OBJECT_PAINT: Record<number, (g: G) => void> = {
    [OBJ.windowOpen]: windowOpen,
    [OBJ.windowShut]: windowShut,
    [OBJ.table]: table,
    [OBJ.shelf]: shelf,
    [OBJ.tabletOk]: g => tablet(g, 'ok'),
    [OBJ.tabletWet]: g => tablet(g, 'wet'),
    [OBJ.tabletHot]: g => tablet(g, 'hot'),
    [OBJ.tabletBroken]: g => tablet(g, 'broken'),
    [OBJ.cup]: cup,
    [OBJ.cupDown]: cupDown,
    [OBJ.socket]: socket,
    [OBJ.seal]: seal,
}

type Face = 'smile' | 'open' | 'scared' | 'joy' | 'oops'
type Arms = 'down' | 'up' | 'cheeks' | 'clasp' | 'point' | 'run' | 'out' | 'wave' | 'mouth'
type Legs = 'stand' | 'run' | 'trip'

interface Kid {
    hair: 'puffs' | 'short'
    shirt: number
    shorts: number
    shoes: number
    face: Face
    arms: Arms
    legs: Legs
}

function eyes(g: G, face: Face, cx: number, cy: number) {
    const xs = [cx - 24, cx + 24]
    if (face === 'joy') {
        xs.forEach(x => arcLine(g, x, cy + 6, 12, 1.1 * Math.PI, 1.9 * Math.PI, 5))
        return
    }
    const h = face === 'scared' || face === 'oops' ? 36 : 32
    xs.forEach(x => {
        oval(g, x, cy, 25, h, C.ink, 0)
        oval(g, x, cy + 7, 18, 16, C.eye, 0)
        disc(g, x - 4, cy - 8, 5.5, C.white, 0)
        disc(g, x + 5, cy + 6, 2.5, C.white, 0)
        g.lineStyle(5, C.ink, 1)
        g.lineBetween(x - 15, cy - h / 2 + 2, x + 13, cy - h / 2 - 1)
    })
    if (face === 'scared') {
        g.lineStyle(4, C.ink, 1)
        g.lineBetween(cx - 34, cy - 30, cx - 16, cy - 36)
        g.lineBetween(cx + 34, cy - 30, cx + 16, cy - 36)
    }
}

function mouth(g: G, face: Face, cx: number, cy: number) {
    if (face === 'smile') arcLine(g, cx, cy - 6, 9, 0.2 * Math.PI, 0.8 * Math.PI, 4)
    if (face === 'open' || face === 'joy') {
        g.fillStyle(C.coralDark, 1)
        g.slice(cx, cy - 4, 12, 0, Math.PI, false)
        g.fillPath()
        g.lineStyle(4, C.ink, 1)
        g.slice(cx, cy - 4, 12, 0, Math.PI, false)
        g.strokePath()
    }
    if (face === 'scared' || face === 'oops') oval(g, cx, cy, 14, 18, C.coralDark, 4)
}

function head(g: G, kid: Kid, cx: number, cy: number) {
    if (kid.hair === 'puffs') {
        disc(g, cx - 66, cy - 46, 34, C.hair, LINE)
        disc(g, cx + 66, cy - 46, 34, C.hair, LINE)
        box(g, cx - 50, cy - 40, 14, 20, 5, C.yellow, 3)
        box(g, cx + 36, cy - 40, 14, 20, 5, C.yellow, 3)
    }
    disc(g, cx, cy - 6, kid.hair === 'puffs' ? 70 : 66, C.hair, LINE)
    if (kid.hair === 'short') {
        for (let k = 0; k < 7; k++) {
            const a = Math.PI * (1.05 + k * 0.15)
            disc(g, cx + Math.cos(a) * 64, cy - 6 + Math.sin(a) * 64, 16, C.hair, 4)
        }
    }
    oval(g, cx + 6, cy + 14, 116, 100, C.skin, 0)
    g.lineStyle(LINE, C.ink, 1)
    g.beginPath()
    g.arc(cx + 6, cy + 14, 58, 0.05 * Math.PI, 0.95 * Math.PI, false)
    g.strokePath()
    ;[
        [cx - 26, cy - 28, 24],
        [cx + 6, cy - 34, 26],
        [cx + 38, cy - 28, 22],
    ].forEach(([x, y, r]) => disc(g, x, y, r, C.hair, 0))
    arcLine(g, cx - 4, cy - 30, 46, 1.15 * Math.PI, 1.45 * Math.PI, 6, C.hairShine)
    eyes(g, kid.face, cx + 8, cy + 10)
    oval(g, cx - 24, cy + 34, 18, 9, C.blush, 0, 0.85)
    oval(g, cx + 40, cy + 34, 18, 9, C.blush, 0, 0.85)
    mouth(g, kid.face, cx + 8, cy + 40)
}

function arms(g: G, kid: Kid, sx: number, sy: number) {
    const l = { x: sx - 36, y: sy }
    const r = { x: sx + 36, y: sy }
    const ends: Record<Arms, [number, number, number, number]> = {
        down: [l.x - 10, sy + 48, r.x + 10, sy + 48],
        up: [l.x - 22, sy - 66, r.x + 22, sy - 66],
        cheeks: [sx - 44, sy - 44, sx + 52, sy - 44],
        clasp: [sx - 4, sy + 30, sx + 10, sy + 30],
        point: [l.x + 6, sy + 40, r.x + 64, sy - 18],
        run: [l.x - 30, sy + 26, r.x + 28, sy - 14],
        out: [l.x + 70, sy - 30, r.x + 70, sy - 6],
        wave: [l.x - 8, sy + 46, r.x + 30, sy - 60],
        mouth: [l.x - 8, sy + 46, sx + 22, sy - 26],
    }
    const [lx, ly, rx, ry] = ends[kid.arms]
    limb(g, l.x, l.y, lx, ly, C.skin, 14)
    limb(g, r.x, r.y, rx, ry, C.skin, 14)
    disc(g, lx, ly, 10, C.skin, 4)
    disc(g, rx, ry, 10, C.skin, 4)
}

function legs(g: G, kid: Kid, hip: number, foot: number) {
    const shoe = (x: number, y: number, flip = false) => oval(g, x + (flip ? -6 : 6), y, 36, 18, kid.shoes, 4)
    if (kid.legs === 'stand') {
        limb(g, 144, hip, 144, foot - 8, C.skin, 16)
        limb(g, 178, hip, 178, foot - 8, C.skin, 16)
        shoe(142, foot)
        shoe(180, foot)
    } else if (kid.legs === 'run') {
        limb(g, 150, hip, 112, foot - 14, C.skin, 16)
        limb(g, 172, hip, 212, foot - 20, C.skin, 16)
        shoe(108, foot - 6, true)
        shoe(214, foot - 14)
    } else {
        limb(g, 150, hip, 120, foot - 10, C.skin, 16)
        limb(g, 172, hip, 128, foot - 46, C.skin, 16)
        shoe(116, foot - 2, true)
        shoe(124, foot - 40, true)
    }
}

function kid(g: G, kidDef: Kid, height: number, lean = 0) {
    const s = height / 280
    g.save()
    g.translateCanvas(160, 300)
    g.rotateCanvas(lean)
    g.scaleCanvas(s, s)
    g.translateCanvas(-160, -300)
    if (kidDef.arms === 'run' || kidDef.arms === 'out') {
        legs(g, kidDef, 236, 292)
        box(g, 118, 150, 84, 76, 26, kidDef.shirt, LINE)
        box(g, 120, 212, 80, 32, 10, kidDef.shorts, LINE)
        arms(g, kidDef, 160, 170)
    } else {
        legs(g, kidDef, 236, 292)
        box(g, 120, 212, 80, 32, 10, kidDef.shorts, LINE)
        box(g, 118, 150, 84, 76, 26, kidDef.shirt, LINE)
        if (kidDef.hair === 'puffs') sparkle(g, 160, 180, 10, C.yellow, 3)
        if (kidDef.arms !== 'cheeks' && kidDef.arms !== 'mouth') arms(g, kidDef, 160, 170)
    }
    head(g, kidDef, 156, 92)
    if (kidDef.arms === 'cheeks' || kidDef.arms === 'mouth') arms(g, kidDef, 160, 170)
    g.restore()
}

const LIA_BASE = { hair: 'puffs', shirt: C.shirtLia, shorts: C.shortsLia, shoes: C.white } as const
const BETO_BASE = { hair: 'short', shirt: C.shirtBeto, shorts: C.navy, shoes: C.red } as const

function mirrored(g: G, paint: () => void) {
    g.save()
    g.translateCanvas(320, 0)
    g.scaleCanvas(-1, 1)
    paint()
    g.restore()
}

function liaWait(g: G) {
    kid(g, { ...LIA_BASE, face: 'open', arms: 'clasp', legs: 'stand' }, 280)
}

function liaYay(g: G) {
    kid(g, { ...LIA_BASE, face: 'joy', arms: 'up', legs: 'stand' }, 270)
    sparkle(g, 40, 70, 14, C.yellow)
    sparkle(g, 286, 96, 12, C.yellow)
}

function liaScared(g: G) {
    kid(g, { ...LIA_BASE, face: 'scared', arms: 'cheeks', legs: 'stand' }, 280)
    oval(g, 236, 70, 16, 24, C.sweat, 3)
}

function liaPoint(g: G) {
    kid(g, { ...LIA_BASE, face: 'open', arms: 'point', legs: 'stand' }, 280)
}

function catHead(g: G, x: number, y: number, face: 'calm' | 'wide' | 'sniff') {
    poly(g, [x - 38, y - 18, x - 30, y - 58, x - 8, y - 34], C.cat, 4)
    poly(g, [x + 38, y - 18, x + 30, y - 58, x + 8, y - 34], C.cat, 4)
    poly(g, [x - 32, y - 24, x - 28, y - 46, x - 16, y - 32], C.blush, 0)
    poly(g, [x + 32, y - 24, x + 28, y - 46, x + 16, y - 32], C.blush, 0)
    oval(g, x, y, 92, 78, C.cat, LINE)
    oval(g, x, y + 16, 54, 34, C.catLight, 0)
    g.lineStyle(4, C.ink, 0.6)
    g.lineBetween(x - 10, y - 38, x - 8, y - 26)
    g.lineBetween(x + 10, y - 38, x + 8, y - 26)
    const ey = y - 2
    ;[x - 18, x + 18].forEach(ex => {
        if (face === 'calm') {
            arcLine(g, ex, ey + 4, 8, 1.1 * Math.PI, 1.9 * Math.PI, 4)
            return
        }
        const h = face === 'wide' ? 26 : 20
        oval(g, ex, ey, 18, h, C.ink, 0)
        oval(g, ex, ey + 3, 12, h * 0.55, C.catEye, 0)
        disc(g, ex - 3, ey - 5, 4, C.white, 0)
    })
    poly(g, [x - 5, y + 10, x + 5, y + 10, x, y + 15], C.coral, 2)
    if (face === 'wide') oval(g, x, y + 24, 10, 12, C.coralDark, 3)
    else {
        arcLine(g, x - 5, y + 16, 5, 0, Math.PI, 3)
        arcLine(g, x + 5, y + 16, 5, 0, Math.PI, 3)
    }
    oval(g, x - 30, y + 14, 12, 6, C.blush, 0, 0.8)
    oval(g, x + 30, y + 14, 12, 6, C.blush, 0, 0.8)
}

function catSit(g: G) {
    g.lineStyle(20, C.ink, 1)
    g.beginPath()
    g.arc(118, 262, 40, 0.5 * Math.PI, 1.3 * Math.PI, false)
    g.strokePath()
    g.lineStyle(12, C.cat, 1)
    g.beginPath()
    g.arc(118, 262, 40, 0.5 * Math.PI, 1.3 * Math.PI, false)
    g.strokePath()
    oval(g, 156, 254, 108, 92, C.cat, LINE)
    oval(g, 168, 262, 56, 62, C.catLight, 0)
    oval(g, 150, 294, 34, 16, C.catLight, 4)
    oval(g, 186, 294, 34, 16, C.catLight, 4)
    catHead(g, 170, 186, 'calm')
}

function catJump(g: G) {
    g.save()
    g.translateCanvas(160, 190)
    g.rotateCanvas(-0.32)
    g.translateCanvas(-160, -190)
    limb(g, 96, 210, 54, 236, C.cat, 14)
    limb(g, 112, 214, 70, 246, C.cat, 14)
    limb(g, 200, 196, 250, 196, C.cat, 14)
    limb(g, 188, 206, 240, 214, C.cat, 14)
    g.lineStyle(20, C.ink, 1)
    g.lineBetween(86, 190, 40, 160)
    g.lineStyle(12, C.cat, 1)
    g.lineBetween(86, 190, 40, 160)
    oval(g, 150, 200, 140, 66, C.cat, LINE)
    oval(g, 156, 212, 84, 30, C.catLight, 0)
    g.restore()
    catHead(g, 236, 140, 'sniff')
}

function catSniff(g: G) {
    g.lineStyle(20, C.ink, 1)
    g.beginPath()
    g.arc(72, 196, 34, 0.9 * Math.PI, 1.9 * Math.PI, false)
    g.strokePath()
    g.lineStyle(12, C.cat, 1)
    g.beginPath()
    g.arc(72, 196, 34, 0.9 * Math.PI, 1.9 * Math.PI, false)
    g.strokePath()
    ;[96, 124, 176, 204].forEach(x => box(g, x - 9, 248, 18, 50, 8, C.cat, 4))
    oval(g, 150, 240, 150, 70, C.cat, LINE)
    oval(g, 156, 256, 90, 28, C.catLight, 0)
    catHead(g, 232, 246, 'sniff')
}

function catScared(g: G) {
    g.lineStyle(20, C.ink, 1)
    g.lineBetween(76, 230, 54, 150)
    g.lineStyle(12, C.cat, 1)
    g.lineBetween(76, 230, 54, 150)
    ;[96, 126, 186, 214].forEach(x => box(g, x - 9, 248, 18, 52, 8, C.cat, 4))
    g.fillStyle(C.cat, 1)
    g.lineStyle(LINE, C.ink, 1)
    g.beginPath()
    g.moveTo(80, 262)
    for (let k = 0; k <= 12; k++) {
        const a = Math.PI + (k / 12) * Math.PI
        const r = k % 2 ? 84 : 72
        g.lineTo(156 + Math.cos(a) * r, 262 + Math.sin(a) * r * 0.9)
    }
    g.lineTo(232, 262)
    g.closePath()
    g.fillPath()
    g.strokePath()
    catHead(g, 238, 206, 'wide')
    g.lineStyle(4, C.ink, 1)
    g.lineBetween(276, 150, 290, 136)
    g.lineBetween(286, 172, 304, 166)
    g.lineBetween(262, 138, 268, 120)
}

function betoRun(g: G) {
    mirrored(g, () => kid(g, { ...BETO_BASE, face: 'open', arms: 'run', legs: 'run' }, 228, 0.14))
    oval(g, 268, 286, 34, 18, C.creamDark, 3)
    oval(g, 292, 280, 22, 12, C.creamDark, 3)
}

function betoTrip(g: G) {
    mirrored(g, () => kid(g, { ...BETO_BASE, face: 'scared', arms: 'out', legs: 'trip' }, 220, 0.5))
}

function betoWave(g: G) {
    kid(g, { ...BETO_BASE, face: 'open', arms: 'wave', legs: 'stand' }, 228)
}

function betoOops(g: G) {
    mirrored(g, () => kid(g, { ...BETO_BASE, face: 'oops', arms: 'mouth', legs: 'stand' }, 228))
}

const CAST_PAINT: Record<number, (g: G) => void> = {
    [POSE.liaWait]: liaWait,
    [POSE.liaYay]: liaYay,
    [POSE.liaScared]: liaScared,
    [POSE.liaPoint]: liaPoint,
    [POSE.catSit]: catSit,
    [POSE.catJump]: catJump,
    [POSE.catSniff]: catSniff,
    [POSE.catScared]: catScared,
    [POSE.betoRun]: betoRun,
    [POSE.betoTrip]: betoTrip,
    [POSE.betoWave]: betoWave,
    [POSE.betoOops]: betoOops,
}
