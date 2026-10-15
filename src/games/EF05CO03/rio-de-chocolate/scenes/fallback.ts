import Phaser from 'phaser'
import { FAR_KEY, MEL_SHEET, NEAR_KEY, RIVER_KEY, ROUND_SHEET, SQUARE_SHEET, type Sheet } from '../data/files'
import { BANK, RIVER } from '../data/layout'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics
type P = { x: number; y: number }

const INK = C.line
let lw = 5

function seeded(seed: number) {
    let s = seed
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296
        return s / 4294967296
    }
}

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

function bakeImage(scene: Phaser.Scene, key: string, w: number, h: number, line: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    lw = line
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, ROUND_SHEET, 5, (g, i) => sweet(g, 'redondo', i))
    bakeSheet(scene, SQUARE_SHEET, 5, (g, i) => sweet(g, 'quadrado', i))
    bakeSheet(scene, MEL_SHEET, 5, mel)
    bakeImage(scene, RIVER_KEY, RIVER.tile, RIVER.tile, 0, riverTile)
    bakeImage(scene, NEAR_KEY, BANK.nearW, 720, 5, nearBank)
    bakeImage(scene, FAR_KEY, BANK.farW, 720, 5, farBank)
}

// ───────────────────────────────────────────── primitivas

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

type Radius = number | { tl: number; tr: number; bl: number; br: number }

function box(g: G, x: number, y: number, w: number, h: number, r: Radius, fill: number, line = lw) {
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

function limb(g: G, pts: P[], width: number, fill: number) {
    g.lineStyle(width + lw * 2, INK, 1)
    g.strokePoints(pts, false)
    pts.forEach(p => {
        g.fillStyle(INK, 1)
        g.fillCircle(p.x, p.y, width / 2 + lw)
    })
    g.lineStyle(width, fill, 1)
    g.strokePoints(pts, false)
    pts.forEach(p => {
        g.fillStyle(fill, 1)
        g.fillCircle(p.x, p.y, width / 2)
    })
}

function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps = 24): P[] {
    const pts: P[] = []
    for (let i = 0; i <= steps; i++) {
        const a = from + ((to - from) * i) / steps
        pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
    }
    return pts
}

// ───────────────────────────────────────────── doces

const SWEET_COLORS = [
    [C.rosa, C.rosaDark, C.rosaLight],
    [C.verde, C.verdeDark, C.verdeLight],
    [C.marrom, C.marromDark, C.marromLight],
] as const

const TOP = { cx: 128, cy: 112, rx: 100, ry: 55, side: 38, sqW: 190 }

function sweet(g: G, shape: 'redondo' | 'quadrado', i: number) {
    const [base, dark, light] = SWEET_COLORS[Math.floor(i / 3)]
    const cover = i % 3
    const { cx, cy, rx, ry, side } = TOP
    if (shape === 'redondo') {
        g.fillStyle(dark, 1)
        g.fillEllipse(cx, cy + side, rx * 2, ry * 2)
        g.fillRect(cx - rx, cy, rx * 2, side)
        g.lineStyle(lw, INK, 1)
        g.strokePoints(arc(cx, cy + side, rx, ry, 0, Math.PI), false)
        g.lineBetween(cx - rx, cy, cx - rx, cy + side)
        g.lineBetween(cx + rx, cy, cx + rx, cy + side)
        g.fillStyle(light, 0.5)
        g.fillEllipse(cx - rx * 0.55, cy + side * 0.9, 22, 30)
        oval(g, cx, cy, rx * 2, ry * 2, base)
    } else {
        const w = TOP.sqW
        const x = cx - w / 2
        box(g, x, cy - ry + 40, w, ry * 2 - 40 + side, { tl: 0, tr: 0, bl: 22, br: 22 }, dark)
        g.fillStyle(light, 0.5)
        g.fillRoundedRect(x + 12, cy + ry + 4, 22, side - 14, 8)
        box(g, x, cy - ry, w, ry * 2, 22, base)
    }
    const insideW = (y: number) => {
        if (shape === 'quadrado') return TOP.sqW / 2 - 20
        const t = (y - cy) / ry
        return Math.max(0, rx * Math.sqrt(Math.max(0, 1 - t * t)) - 14)
    }
    if (cover === 0) {
        const rnd = seeded(7 + i * 13)
        const colors = [C.sprinkleA, C.sprinkleB, C.sprinkleC]
        for (let k = 0; k < 16; k++) {
            const y = cy + (rnd() * 2 - 1) * ry * 0.7
            const half = insideW(y) * 0.86
            const x = cx + (rnd() * 2 - 1) * half
            const a = rnd() * Math.PI
            const dx = Math.cos(a) * 7
            const dy = Math.sin(a) * 4
            g.lineStyle(9, dark, 1)
            g.lineBetween(x - dx, y - dy + 1, x + dx, y + dy + 1)
            g.lineStyle(6, colors[k % 3], 1)
            g.lineBetween(x - dx, y - dy, x + dx, y + dy)
            g.fillStyle(colors[k % 3], 1)
            g.fillCircle(x - dx, y - dy, 3)
            g.fillCircle(x + dx, y + dy, 3)
        }
    } else if (cover === 1) {
        ;[-0.5, 0, 0.5].forEach((t, k) => {
            const y0 = cy + t * ry * 1.05
            const half = insideW(y0) * 0.9
            const pts: P[] = []
            for (let x = -half; x <= half; x += 6) pts.push({ x: cx + x, y: y0 + Math.sin(x * 0.11 + k) * 4 })
            g.lineStyle(10, dark, 0.8)
            g.strokePoints(pts.map(p => ({ x: p.x, y: p.y + 2 })), false)
            g.lineStyle(7, C.drizzle, 1)
            g.strokePoints(pts, false)
        })
    } else {
        g.fillStyle(C.white, 0.6)
        g.fillEllipse(cx - 34, cy - 22, 62, 20)
        g.fillCircle(cx + 4, cy - 30, 5)
    }
}

// ───────────────────────────────────────────── Mel

type Face = 'smile' | 'grin' | 'oops' | 'sad' | 'curious' | 'focus'

interface Pose {
    dx: number
    dy: number
    lean: number
    armF: [P, P]
    armB: [P, P]
    legF: [P, P]
    legB: [P, P]
    face: Face
}

const pt = (x: number, y: number): P => ({ x, y })

const POSES: Pose[] = [
    { dx: 0, dy: 0, lean: 0, armF: [pt(152, 214), pt(156, 240)], armB: [pt(104, 214), pt(100, 238)], legF: [pt(140, 280), pt(146, 306)], legB: [pt(116, 280), pt(110, 306)], face: 'smile' },
    { dx: 0, dy: 26, lean: 4, armF: [pt(112, 232), pt(90, 244)], armB: [pt(102, 228), pt(78, 236)], legF: [pt(154, 286), pt(146, 306)], legB: [pt(126, 290), pt(110, 306)], face: 'focus' },
    { dx: 8, dy: -10, lean: 8, armF: [pt(170, 160), pt(178, 128)], armB: [pt(112, 156), pt(106, 126)], legF: [pt(148, 266), pt(128, 290)], legB: [pt(124, 264), pt(102, 284)], face: 'grin' },
    { dx: 0, dy: 18, lean: 0, armF: [pt(172, 202), pt(204, 196)], armB: [pt(88, 202), pt(58, 194)], legF: [pt(158, 284), pt(160, 306)], legB: [pt(102, 284), pt(98, 306)], face: 'curious' },
    { dx: 0, dy: -14, lean: 0, armF: [pt(162, 150), pt(168, 116)], armB: [pt(98, 150), pt(92, 116)], legF: [pt(140, 270), pt(148, 292)], legB: [pt(116, 272), pt(108, 294)], face: 'grin' },
    { dx: -10, dy: 0, lean: -8, armF: [pt(162, 154), pt(184, 132)], armB: [pt(92, 150), pt(72, 126)], legF: [pt(152, 272), pt(178, 290)], legB: [pt(120, 282), pt(116, 306)], face: 'oops' },
    { dx: 0, dy: 0, lean: 0, armF: [pt(0, 0), pt(0, 0)], armB: [pt(0, 0), pt(0, 0)], legF: [pt(0, 0), pt(0, 0)], legB: [pt(0, 0), pt(0, 0)], face: 'sad' },
    { dx: -14, dy: 6, lean: -6, armF: [pt(158, 204), pt(180, 218)], armB: [pt(92, 198), pt(66, 190)], legF: [pt(164, 276), pt(212, 296)], legB: [pt(112, 284), pt(106, 306)], face: 'curious' },
]

function mel(g: G, i: number) {
    if (i === 6) {
        sunk(g)
        return
    }
    const p = POSES[i]
    const hip = pt(128 + p.dx * 0.4, 248 + p.dy)
    const neck = pt(128 + p.dx, 176 + p.dy)
    const head = pt(132 + p.dx + p.lean, 114 + p.dy)
    const shoulderF = pt(neck.x + 14, neck.y + 14)
    const shoulderB = pt(neck.x - 14, neck.y + 14)
    const move = (q: P): P => pt(q.x + p.dx * 0.6, q.y + (p.dy > 0 ? p.dy * 0.4 : p.dy))

    limb(g, [shoulderB, move(p.armB[0]), move(p.armB[1])], 15, C.shirtDark)
    disc(g, move(p.armB[1]).x, move(p.armB[1]).y, 9, C.skinDark)
    leg(g, hip, -10, p.legB, C.legsDark)
    torso(g, neck, hip)
    leg(g, hip, 10, p.legF, C.legs)
    limb(g, [shoulderF, move(p.armF[0]), move(p.armF[1])], 15, C.shirt)
    disc(g, move(p.armF[1]).x, move(p.armF[1]).y, 9, C.skin)
    face(g, head.x, head.y, p.face)
}

function leg(g: G, hip: P, offset: number, [knee, foot]: [P, P], fill: number) {
    const top = pt(hip.x + offset, hip.y)
    limb(g, [top, knee, foot], 19, fill)
    oval(g, foot.x + 7, foot.y + 2, 32, 16, C.shoe)
    g.fillStyle(C.shoeDark, 1)
    g.fillRect(foot.x - 7, foot.y + 4, 28, 3)
}

function torso(g: G, neck: P, hip: P) {
    const pts = [pt(neck.x - 26, neck.y), pt(neck.x + 26, neck.y), pt(hip.x + 30, hip.y + 8), pt(hip.x - 30, hip.y + 8)]
    poly(g, pts, C.shirt)
    const apron = [pt(neck.x - 6, neck.y + 18), pt(neck.x + 26, neck.y + 18), pt(hip.x + 32, hip.y + 14), pt(hip.x - 12, hip.y + 14)]
    poly(g, apron, C.apron)
    g.lineStyle(4, C.apronDark, 1)
    g.lineBetween(neck.x + 2, neck.y + 18, neck.x - 10, neck.y)
    box(g, hip.x + 2, hip.y - 26, 22, 16, 5, C.apronDark, 3)
}

function face(g: G, hx: number, hy: number, kind: Face) {
    disc(g, hx - 64, hy - 8, 20, C.hair)
    oval(g, hx - 76, hy + 18, 30, 48, C.hair)
    disc(g, hx - 6, hy - 4, 58, C.hair)
    disc(g, hx + 4, hy + 6, 52, C.skin)
    g.fillStyle(C.hair, 1)
    g.fillPoints([pt(hx - 52, hy - 4), pt(hx - 40, hy - 46), pt(hx + 10, hy - 54), pt(hx + 50, hy - 30), pt(hx + 26, hy - 26), pt(hx - 4, hy - 34), pt(hx - 26, hy - 14)], true)
    g.lineStyle(lw, INK, 1)
    g.strokePoints([pt(hx - 52, hy - 4), pt(hx - 26, hy - 14), pt(hx - 4, hy - 34), pt(hx + 26, hy - 26), pt(hx + 50, hy - 30)], false)
    box(g, hx - 34, hy - 70, 68, 22, 6, C.hat)
    disc(g, hx - 22, hy - 84, 18, C.hat)
    disc(g, hx + 20, hy - 84, 18, C.hat)
    disc(g, hx, hy - 96, 22, C.hat)
    g.fillStyle(C.hat, 1)
    g.fillRect(hx - 30, hy - 84, 60, 20)
    g.fillStyle(C.cheek, 0.7)
    g.fillEllipse(hx + 4, hy + 30, 18, 10)
    g.fillEllipse(hx + 48, hy + 28, 14, 9)
    const eyes = [pt(hx + 14, hy + 8), pt(hx + 40, hy + 8)]
    if (kind === 'grin') {
        eyes.forEach(e => {
            g.lineStyle(5, C.eye, 1)
            g.strokePoints([pt(e.x - 8, e.y + 3), pt(e.x, e.y - 5), pt(e.x + 8, e.y + 3)], false)
        })
    } else if (kind === 'sad') {
        eyes.forEach(e => {
            g.lineStyle(5, C.eye, 1)
            g.strokePoints([pt(e.x - 8, e.y - 2), pt(e.x, e.y + 4), pt(e.x + 8, e.y - 2)], false)
        })
    } else {
        const big = kind === 'oops' ? 1.2 : 1
        eyes.forEach((e, k) => {
            g.fillStyle(C.eye, 1)
            g.fillEllipse(e.x, e.y, (k ? 11 : 13) * big, 20 * big)
            g.fillStyle(C.white, 1)
            g.fillCircle(e.x + 2, e.y - 4, 3.5)
        })
    }
    g.lineStyle(4, C.eye, 1)
    const m = pt(hx + 28, hy + 32)
    if (kind === 'smile') g.strokePoints(arc(m.x, m.y - 4, 9, 6, 0.2, Math.PI - 0.2, 10), false)
    else if (kind === 'grin') {
        g.fillStyle(C.eye, 1)
        g.fillPoints(arc(m.x, m.y - 4, 11, 10, 0, Math.PI, 12), true)
    } else if (kind === 'oops') {
        g.fillStyle(C.eye, 1)
        g.fillEllipse(m.x, m.y + 2, 14, 18)
    } else if (kind === 'sad') g.strokePoints(arc(m.x, m.y + 6, 9, 6, Math.PI + 0.3, Math.PI * 2 - 0.3, 10), false)
    else if (kind === 'curious') {
        g.fillStyle(C.eye, 1)
        g.fillCircle(m.x, m.y, 5)
    } else g.lineBetween(m.x - 7, m.y, m.x + 7, m.y)
}

function sunk(g: G) {
    const neck = pt(128, 210)
    torso(g, neck, pt(128, 290))
    limb(g, [pt(104, 224), pt(86, 256), pt(72, 278)], 15, C.shirtDark)
    limb(g, [pt(152, 224), pt(172, 256), pt(186, 278)], 15, C.shirt)
    face(g, 132, 150, 'sad')
    g.fillStyle(C.river, 1)
    g.fillEllipse(110, 56, 40, 18)
    g.fillEllipse(140, 64, 26, 14)
    g.fillRect(104, 56, 8, 24)
    g.fillRect(136, 60, 7, 20)
    g.fillCircle(108, 82, 5)
    g.fillCircle(139, 80, 4)
    g.fillEllipse(170, 172, 10, 18)
    g.fillEllipse(110, 186, 8, 14)
    oval(g, 128, 290, 236, 52, C.river)
    g.fillStyle(C.riverLight, 1)
    g.fillEllipse(128, 286, 180, 26)
    g.fillStyle(C.river, 1)
    g.fillEllipse(128, 290, 120, 18)
    g.fillStyle(C.riverShine, 0.8)
    g.fillEllipse(70, 282, 26, 6)
    ;[pt(36, 268), pt(220, 262), pt(60, 250), pt(206, 244)].forEach((d, k) => disc(g, d.x, d.y, k < 2 ? 8 : 6, C.river, 3))
    g.fillStyle(C.riverDark, 1)
    g.fillEllipse(72, 284, 26, 12)
    g.fillEllipse(186, 284, 26, 12)
}

// ───────────────────────────────────────────── rio e margens

function riverTile(g: G) {
    const s = RIVER.tile
    g.fillStyle(C.river, 1)
    g.fillRect(0, 0, s, s)
    const rnd = seeded(41)
    for (let i = 0; i < 8; i++) {
        const x0 = 16 + i * 32
        for (let j = 0; j < 4; j++) {
            const y0 = j * 64 + (i % 2) * 32 + Math.floor(rnd() * 10)
            const len = 34 + Math.floor(rnd() * 16)
            for (const shift of [0, -s]) {
                const pts: P[] = []
                for (let y = 0; y <= len; y += 6) pts.push({ x: x0 + Math.sin((y0 + y) * 0.05) * 5, y: y0 + y + shift })
                g.lineStyle(5, C.riverLight, 0.6)
                g.strokePoints(pts, false)
            }
        }
    }
    for (let k = 0; k < 10; k++) {
        const x = Math.floor(rnd() * s)
        const y = Math.floor(rnd() * s)
        g.fillStyle(C.riverShine, 0.45)
        g.fillEllipse(x, y, 5, 14)
        g.fillEllipse(x, y - s, 5, 14)
    }
}

function shore(x0: number, amp: number, phase: number): P[] {
    const pts: P[] = []
    for (let y = -10; y <= 730; y += 20) pts.push({ x: x0 + Math.sin(y * 0.028 + phase) * amp + Math.sin(y * 0.011) * 8, y })
    return pts
}

function wetEdge(g: G, line: P[], dir: number) {
    g.lineStyle(16, C.riverDark, 0.35)
    g.strokePoints(line.map(p => ({ x: p.x - dir * 6, y: p.y })), false)
    g.lineStyle(lw, INK, 1)
    g.strokePoints(line, false)
    g.lineStyle(6, C.foam, 0.9)
    g.strokePoints(line.map(p => ({ x: p.x + dir * 8, y: p.y })), false)
}

function chips(g: G, rnd: () => number, x0: number, x1: number, n: number) {
    for (let k = 0; k < n; k++) {
        const x = x0 + rnd() * (x1 - x0)
        const y = 30 + rnd() * 660
        g.fillStyle(C.chip, 0.85)
        g.fillEllipse(x, y, 16, 11)
        g.fillStyle(C.cookieLight, 0.7)
        g.fillEllipse(x + 18, y - 22, 24, 8)
    }
}

function tuft(g: G, x: number, y: number) {
    g.lineStyle(4, C.sugar, 1)
    g.strokePoints([pt(x - 12, y), pt(x - 6, y - 12), pt(x, y), pt(x + 6, y - 14), pt(x + 12, y)], false)
}

function cane(g: G, x: number, y: number) {
    limb(g, [pt(x, y + 60), pt(x, y), pt(x + 8, y - 20), pt(x + 26, y - 22), pt(x + 32, y - 8)], 14, C.cane)
    g.lineStyle(5, C.caneStripe, 1)
    for (let k = 0; k < 4; k++) g.lineBetween(x - 6, y + 50 - k * 14, x + 6, y + 42 - k * 14)
}

function gumdrop(g: G, x: number, y: number, fill: number) {
    g.fillStyle(C.shadow, 0.18)
    g.fillEllipse(x, y + 4, 60, 16)
    poly(g, arc(x, y, 28, 30, Math.PI, Math.PI * 2, 16), fill)
    g.fillStyle(C.white, 0.6)
    g.fillEllipse(x - 10, y - 18, 10, 6)
}

function nearBank(g: G) {
    const line = shore(BANK.nearW - 40, 12, 0)
    poly(g, [pt(0, -10), ...line, pt(0, 730)], C.cookie, 0)
    const rnd = seeded(5)
    chips(g, rnd, 20, 520, 26)
    for (let k = 0; k < 18; k++) tuft(g, 20 + rnd() * 400, 30 + rnd() * 660)
    wetEdge(g, line, 1)
    cane(g, 300, 150)
    cane(g, 330, 560)
    gumdrop(g, 180, 300, C.gumBlue)
    gumdrop(g, 240, 330, C.gumYellow)
    gumdrop(g, 160, 640, C.gumLilac)
    gumdrop(g, 360, 420, C.gumBlue)
}

function farBank(g: G) {
    const line = shore(BANK.farShore, 12, 1.4)
    poly(g, [...line, pt(BANK.farW + 10, 730), pt(BANK.farW + 10, -10)], C.cookie, 0)
    const rnd = seeded(9)
    chips(g, rnd, 260, BANK.farW - 20, 40)
    for (let k = 0; k < 26; k++) tuft(g, 240 + rnd() * 1000, 30 + rnd() * 660)
    wetEdge(g, line, -1)
    party(g, BANK.party.x, BANK.party.y)
    gumdrop(g, 1040, 560, C.gumLilac)
    gumdrop(g, 1100, 600, C.gumBlue)
    cane(g, 980, 220)
}

function party(g: G, x: number, y: number) {
    g.lineStyle(3, INK, 1)
    const flags = (y0: number, from: number, to: number, sag: number) => {
        const pts: P[] = []
        for (let t = 0; t <= 1.001; t += 0.05) pts.push(pt(from + (to - from) * t, y0 + Math.sin(t * Math.PI) * sag))
        g.lineStyle(3, INK, 1)
        g.strokePoints(pts, false)
        const colors = [C.balloonBlue, C.balloonYellow, C.flagLilac, C.white]
        for (let k = 1; k < 13; k++) {
            const t = k / 13
            const fx = from + (to - from) * t
            const fy = y0 + Math.sin(t * Math.PI) * sag
            poly(g, [pt(fx - 16, fy), pt(fx + 16, fy), pt(fx, fy + 30)], colors[k % 4], 3)
        }
    }
    flags(y - 190, x - 360, x + 400, 40)
    ;[pt(x + 170, y - 120), pt(x + 214, y - 150), pt(x + 140, y - 160)].forEach((b, k) => {
        g.lineStyle(3, INK, 0.8)
        g.lineBetween(b.x, b.y + 34, x + 110, y + 10)
        oval(g, b.x, b.y, 54, 66, k === 1 ? C.balloonYellow : C.balloonBlue, 4)
        g.fillStyle(C.white, 0.6)
        g.fillEllipse(b.x - 12, b.y - 14, 12, 18)
    })
    g.fillStyle(C.shadow, 0.18)
    g.fillEllipse(x, y + 92, 330, 60)
    box(g, x - 150, y + 10, 300, 74, { tl: 0, tr: 0, bl: 30, br: 30 }, C.tableDark, 4)
    oval(g, x, y + 10, 320, 96, C.table, 4)
    const tier = (w: number, h: number, top: number, deco: number) => {
        box(g, x - w / 2, top, w, h, 10, C.cakeDark, 4)
        oval(g, x, top, w, 26, C.cake, 4)
        for (let k = 0; k < 5; k++) disc(g, x - w / 2 + 18 + k * ((w - 36) / 4), top + h * 0.6, 6, deco, 2)
    }
    tier(170, 58, y - 50, C.cakeBlue)
    tier(126, 50, y - 98, C.cakeYellow)
    tier(84, 44, y - 140, C.cakeBlue)
    const star = arc(x, y - 168, 18, 18, -Math.PI / 2, Math.PI * 1.5, 10).map((q, k) =>
        k % 2 ? pt(x + (q.x - x) * 0.45, y - 168 + (q.y - y + 168) * 0.45) : q,
    )
    poly(g, star, C.cakeYellow, 3)
    box(g, x - 250, y + 70, 56, 46, 6, C.balloonBlue, 4)
    g.fillStyle(C.balloonYellow, 1)
    g.fillRect(x - 226, y + 70, 8, 46)
    box(g, x + 190, y + 80, 50, 42, 6, C.flagLilac, 4)
    g.fillStyle(C.white, 1)
    g.fillRect(x + 211, y + 80, 8, 42)
}
