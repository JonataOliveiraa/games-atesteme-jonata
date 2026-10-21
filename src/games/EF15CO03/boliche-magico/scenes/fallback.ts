import Phaser from 'phaser'
import { BALL_SHEET, BG_KEY, EXTRAS_SHEET, PINS_SHEET, type Sheet } from '../data/files'
import { H, LANE, W } from '../data/layout'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics
type P = { x: number; y: number }

const INK = C.line
const LW = 5

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

function bakeImage(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, PINS_SHEET, pinCell)
    bakeSheet(scene, EXTRAS_SHEET, extraCell)
    bakeSheet(scene, BALL_SHEET, ballCell)
    bakeImage(scene, BG_KEY, W, H, background)
}

function starPoints(cx: number, cy: number, outer: number, inner: number, turn = -Math.PI / 2): P[] {
    const pts: P[] = []
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner
        const a = turn + (i * Math.PI) / 5
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
    }
    return pts
}

function star(g: G, cx: number, cy: number, outer: number, fill: number, line = LW) {
    const pts = starPoints(cx, cy, outer, outer * 0.46)
    g.fillStyle(fill, 1)
    g.fillPoints(pts, true)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokePoints(pts, true)
    }
}

// ───────────────────────────────────────────── pinos

const PIN_BODY = [
    { fill: C.azul, dark: C.azulDark },
    { fill: C.verde, dark: C.verdeDark },
    { fill: C.vermelho, dark: C.vermelhoDark },
]

function pinCell(g: G, i: number) {
    if (i < 3) pinBody(g, PIN_BODY[i].fill, PIN_BODY[i].dark)
    else if (i >= 4) pinFace(g, i - 4)
}

function pinBody(g: G, fill: number, dark: number) {
    const outline = LW * 2
    g.lineStyle(outline, INK, 1)
    g.strokeEllipse(74, 274, 36, 18)
    g.strokeEllipse(118, 274, 36, 18)
    g.strokeEllipse(96, 200, 128, 152)
    g.strokeRect(70, 110, 52, 40)
    g.strokeCircle(96, 74, 54)

    g.fillStyle(dark, 1)
    g.fillEllipse(74, 274, 36, 18)
    g.fillEllipse(118, 274, 36, 18)
    g.fillEllipse(96, 200, 128, 152)
    g.fillRect(70, 110, 52, 40)
    g.fillCircle(96, 74, 54)

    g.fillStyle(fill, 1)
    g.fillEllipse(89, 197, 112, 144)
    g.fillRect(70, 110, 44, 40)
    g.fillCircle(90, 70, 48)

    g.fillStyle(C.white, 1)
    g.fillRect(70, 114, 52, 9)
    g.fillRect(70, 133, 52, 9)

    g.fillStyle(C.white, 0.55)
    g.fillEllipse(68, 44, 26, 14)
    g.fillEllipse(58, 168, 20, 34)
}

function cheeks(g: G) {
    g.fillStyle(C.cheek, 0.85)
    g.fillEllipse(58, 92, 18, 10)
    g.fillEllipse(134, 92, 18, 10)
}

function eye(g: G, x: number, y: number) {
    g.fillStyle(C.eye, 1)
    g.fillEllipse(x, y, 20, 26)
    g.fillStyle(C.white, 1)
    g.fillCircle(x - 4, y - 6, 4.5)
    g.fillCircle(x + 4, y + 5, 2)
}

function pinFace(g: G, f: number) {
    g.lineStyle(4, C.eye, 1)
    if (f === 0) {
        eye(g, 76, 72)
        eye(g, 116, 72)
        g.lineStyle(4, C.mouth, 1)
        g.beginPath()
        g.arc(96, 88, 11, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false)
        g.strokePath()
        cheeks(g)
    } else if (f === 1) {
        ;[76, 116].forEach(x => {
            g.fillStyle(C.eye, 1)
            g.fillEllipse(x, 78, 18, 10)
            g.lineStyle(4, C.eye, 1)
            g.lineBetween(x - 12, 73, x + 12, 73)
        })
        g.fillStyle(C.mouth, 1)
        g.fillEllipse(96, 96, 10, 12)
        cheeks(g)
    } else if (f === 2) {
        ;[76, 116].forEach(x => {
            g.beginPath()
            g.arc(x, 70, 10, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false)
            g.strokePath()
        })
        g.lineStyle(4, C.mouth, 1)
        g.beginPath()
        g.arc(96, 90, 8, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150), false)
        g.strokePath()
        cheeks(g)
    } else {
        ;[76, 116].forEach(x => spiral(g, x, 72))
        g.lineStyle(4, C.mouth, 1)
        const pts: P[] = []
        for (let k = 0; k <= 12; k++) pts.push({ x: 82 + k * 2.4, y: 96 + Math.sin(k * 1.1) * 3 })
        g.strokePoints(pts, false)
    }
}

function spiral(g: G, cx: number, cy: number) {
    const pts: P[] = []
    for (let k = 0; k <= 40; k++) {
        const a = k * 0.42
        const r = 1 + k * 0.28
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
    }
    g.lineStyle(3.5, C.eye, 1)
    g.strokePoints(pts, false)
}

function extraCell(g: G, i: number) {
    if (i === 0) {
        star(g, 96, 205, 36, C.star)
        g.fillStyle(C.white, 0.7)
        g.fillCircle(86, 196, 4)
        return
    }
    if (i === 2) {
        pillow(g)
        return
    }
    ;[76, 116].forEach(x => {
        g.fillStyle(C.lens, 0.35)
        g.fillCircle(x, 74, 18)
        g.lineStyle(6, C.glasses, 1)
        g.strokeCircle(x, 74, 18)
    })
    g.lineStyle(6, C.glasses, 1)
    g.lineBetween(93, 71, 99, 71)
}

function pillow(g: G) {
    const x = 96 - 75
    const y = 150 - 40
    g.fillStyle(C.pillowDark, 1)
    g.fillRoundedRect(x, y + 6, 150, 78, 30)
    g.fillStyle(C.pillow, 1)
    g.fillRoundedRect(x, y, 150, 74, 30)
    ;[
        [52, 128],
        [96, 120],
        [140, 130],
        [70, 162],
        [122, 164],
    ].forEach(([px, py]) => {
        g.fillStyle(C.pillowDot, 1)
        g.fillCircle(px, py, 6)
    })
    star(g, 96, 146, 9, C.star, 0)
    g.lineStyle(LW, INK, 1)
    g.strokeRoundedRect(x, y, 150, 74, 30)
}

// ───────────────────────────────────────────── bola

function ballCell(g: G, i: number) {
    if (i === 0) ballBody(g)
    else if (i <= 5) ballFace(g, i - 1)
}

function ballBody(g: G) {
    g.fillStyle(C.ballDark, 1)
    g.fillCircle(128, 128, 118)
    g.fillStyle(C.ball, 1)
    g.fillCircle(121, 121, 110)
    g.fillStyle(C.ballLight, 0.7)
    g.fillEllipse(84, 76, 54, 30)
    g.fillStyle(C.ballHole, 1)
    g.fillCircle(168, 70, 12)
    g.fillCircle(194, 96, 12)
    g.fillCircle(162, 108, 14)
    ;[
        [70, 170, 10],
        [118, 208, 8],
        [196, 160, 9],
        [58, 112, 7],
        [140, 48, 7],
    ].forEach(([x, y, r]) => star(g, x, y, r, C.star, 0))
    g.lineStyle(6, INK, 1)
    g.strokeCircle(128, 128, 118)
}

function ballEye(g: G, x: number, y: number, dx = 0) {
    g.fillStyle(C.white, 1)
    g.fillEllipse(x, y, 34, 42)
    g.fillStyle(C.eye, 1)
    g.fillEllipse(x + dx, y + 2, 22, 30)
    g.fillStyle(C.white, 1)
    g.fillCircle(x + dx - 5, y - 6, 5)
}

function ballFace(g: G, f: number) {
    const cheek = () => {
        g.fillStyle(C.cheek, 0.8)
        g.fillEllipse(80, 168, 24, 12)
        g.fillEllipse(176, 168, 24, 12)
    }
    g.lineStyle(5, C.white, 1)
    if (f === 0) {
        ballEye(g, 100, 136)
        ballEye(g, 156, 136)
        g.beginPath()
        g.arc(128, 160, 16, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false)
        g.strokePath()
        cheek()
    } else if (f === 1) {
        ballEye(g, 100, 138, 6)
        ballEye(g, 156, 138, 6)
        g.lineBetween(82, 108, 112, 114)
        g.lineBetween(144, 114, 174, 108)
        g.lineBetween(116, 174, 142, 174)
        cheek()
    } else if (f === 2) {
        ;[100, 156].forEach(x => {
            g.beginPath()
            g.arc(x, 142, 15, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false)
            g.strokePath()
        })
        g.fillStyle(C.mouth, 1)
        g.beginPath()
        g.arc(128, 160, 20, 0, Math.PI, false)
        g.closePath()
        g.fillPath()
        g.lineStyle(4, C.white, 1)
        g.beginPath()
        g.arc(128, 160, 20, 0, Math.PI, false)
        g.closePath()
        g.strokePath()
        cheek()
    } else if (f === 4) {
        ;[100, 156].forEach((x, k) => {
            const d = k ? -1 : 1
            g.lineBetween(x - 14 * d, 124, x + 10 * d, 136)
            g.lineBetween(x + 10 * d, 136, x - 14 * d, 148)
        })
        g.fillStyle(C.vermelho, 0.85)
        g.fillCircle(74, 166, 20)
        g.fillCircle(182, 166, 20)
        g.lineBetween(116, 172, 140, 172)
    } else {
        ;[100, 156].forEach(x => {
            g.fillStyle(C.white, 1)
            g.fillCircle(x, 136, 20)
            g.fillStyle(C.eye, 1)
            g.fillCircle(x, 138, 7)
        })
        g.fillStyle(C.mouth, 1)
        g.fillEllipse(128, 174, 16, 20)
        g.lineStyle(3, C.white, 1)
        g.strokeEllipse(128, 174, 16, 20)
        g.fillStyle(C.sky, 1)
        g.fillTriangle(196, 92, 188, 110, 204, 110)
        g.fillCircle(196, 112, 8)
    }
}

// ───────────────────────────────────────────── fundo

function background(g: G) {
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, W, LANE.top)
    for (let x = 0; x < W; x += 160) {
        g.fillStyle(C.wallPanel, 1)
        g.fillRect(x + 8, 150, 144, LANE.top - 170)
        g.lineStyle(3, C.wallLine, 1)
        g.strokeRect(x + 8, 150, 144, LANE.top - 170)
    }
    g.fillStyle(C.wallTop, 1)
    g.fillRect(0, 0, W, 134)
    g.fillStyle(C.wallLine, 1)
    g.fillRect(0, 134, W, 6)
    for (let x = 40; x < W; x += 80) {
        g.fillStyle(C.bulbRim, 1)
        g.fillCircle(x, 118, 11)
        g.fillStyle(C.bulb, 1)
        g.fillCircle(x, 118, 8)
    }

    neonMoon(g, 96, 236)
    neonStar(g, 206, 258)
    neonPin(g, 316, 318)

    g.fillStyle(C.carpet, 1)
    g.fillRect(0, LANE.bottom, W, H - LANE.bottom)
    for (let y = LANE.bottom + 24; y < H; y += 40)
        for (let x = (y / 40) % 2 ? 20 : 60; x < W; x += 80) {
            g.fillStyle(((x + y) / 20) % 2 ? C.carpetDot : C.carpetDot2, 0.8)
            g.fillCircle(x, y, 5)
        }
    g.fillStyle(C.carpetDark, 1)
    g.fillRect(0, LANE.bottom, W, 8)

    hood(g)

    g.fillStyle(C.woodDark, 1)
    g.fillRect(0, LANE.front, LANE.end, LANE.bottom - LANE.front)
    g.fillStyle(C.woodEdge, 1)
    g.fillRect(0, LANE.bottom - 8, LANE.end, 8)
    g.fillStyle(C.wood, 1)
    g.fillRect(0, LANE.top, LANE.end, LANE.front - LANE.top)
    for (let k = 0; k < 4; k++) {
        g.fillStyle(k % 2 ? C.woodLight : C.woodLine, 0.6)
        g.fillRect(0, LANE.top + 6 + k * 10, LANE.end, 3)
    }
    ;[250, 290, 330].forEach(x => {
        g.fillStyle(C.woodEdge, 0.8)
        g.fillTriangle(x, LANE.top + 14, x, LANE.top + 34, x + 16, LANE.top + 24)
    })
    g.lineStyle(4, C.woodEdge, 1)
    g.lineBetween(0, LANE.top, LANE.end, LANE.top)
    g.lineBetween(0, LANE.front, LANE.end, LANE.front)

    g.fillStyle(C.machineDark, 1)
    g.fillRoundedRect(24, 376, 150, LANE.front - 376 + 4, { tl: 60, tr: 60, bl: 8, br: 8 })
    g.fillStyle(C.machine, 1)
    g.fillRoundedRect(24, 370, 144, LANE.front - 376, { tl: 58, tr: 58, bl: 8, br: 8 })
    g.fillStyle(C.machineTeal, 1)
    g.fillRect(24, 412, 144, 16)
    g.fillStyle(C.pit, 1)
    g.fillRoundedRect(96, 440, 72, LANE.front - 446, { tl: 26, tr: 0, bl: 0, br: 0 })
    g.lineStyle(LW, INK, 1)
    g.strokeRoundedRect(24, 370, 144, LANE.front - 376, { tl: 58, tr: 58, bl: 8, br: 8 })
}

function hood(g: G) {
    const left = 330
    const top = 140
    const bottom = 196
    g.fillStyle(C.pitCurtain, 1)
    g.fillRect(left, top, W - left, bottom - top)
    for (let x = left; x < W; x += 60) {
        g.fillStyle(C.pitCurtain, 1)
        g.fillCircle(x + 30, bottom, 30)
    }
    g.fillStyle(C.pit, 1)
    g.fillRect(left, top, W - left, 14)
    g.fillStyle(C.neonYellow, 1)
    for (let x = left + 30; x < W; x += 60) g.fillCircle(x, top + 28, 6)
}

function neonStar(g: G, x: number, y: number) {
    const pts = starPoints(x, y, 46, 21)
    g.lineStyle(14, C.neonYellow, 0.25)
    g.strokePoints(pts, true)
    g.lineStyle(6, C.neonYellow, 1)
    g.strokePoints(pts, true)
}

function neonPin(g: G, x: number, y: number) {
    g.lineStyle(14, C.neonPink, 0.25)
    g.strokeCircle(x, y - 40, 18)
    g.strokeEllipse(x, y + 18, 46, 64)
    g.lineStyle(6, C.neonPink, 1)
    g.strokeCircle(x, y - 40, 18)
    g.strokeEllipse(x, y + 18, 46, 64)
}

function neonMoon(g: G, x: number, y: number) {
    g.lineStyle(14, C.neonCyan, 0.25)
    g.beginPath()
    g.arc(x, y, 36, Phaser.Math.DegToRad(60), Phaser.Math.DegToRad(300), false)
    g.strokePath()
    g.lineStyle(6, C.neonCyan, 1)
    g.beginPath()
    g.arc(x, y, 36, Phaser.Math.DegToRad(60), Phaser.Math.DegToRad(300), false)
    g.strokePath()
}
