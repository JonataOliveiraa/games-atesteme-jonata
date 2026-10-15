import Phaser from 'phaser'
import { BG, SHED_SHEET, STAMP_SHEET, STRIP_SHEET, TRACK_SHEET, TRAIN_SHEET, UI_SHEET, type Sheet } from '../data/files'
import { H, W } from '../data/layout'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics
type P = Phaser.Types.Math.Vector2Like
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

export function ensureArt(scene: Phaser.Scene) {
    bakeOne(scene, BG, W, H, yard)
    bakeSheet(scene, TRACK_SHEET, (g, i) => TRACK_PAINT[i]?.(g, TRACK_SHEET.cellW / 2, TRACK_SHEET.cellH / 2))
    bakeSheet(scene, TRAIN_SHEET, (g, i) => TRAIN_PAINT(g, i, TRAIN_SHEET.cellW / 2, TRAIN_SHEET.cellH / 2))
    bakeSheet(scene, SHED_SHEET, (g, i) => shed(g, SHED_SHEET.cellW / 2, SHED_SHEET.cellH / 2, i === 0))
    bakeSheet(scene, UI_SHEET, (g, i) => UI_PAINT[i]?.(g, UI_SHEET.cellW / 2, UI_SHEET.cellH / 2))
    bakeSheet(scene, STRIP_SHEET, g => longLabel(g, STRIP_SHEET.cellW, STRIP_SHEET.cellH))
    bakeSheet(scene, STAMP_SHEET, (g, i) => STAMP_PAINT[i]?.(g, STAMP_SHEET.cellW / 2, STAMP_SHEET.cellH / 2))
}

function disc(g: G, x: number, y: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeCircle(x, y, r)
    }
}

function box(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function poly(g: G, pts: P[], fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillPoints(pts, true)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokePoints(pts, true)
    }
}

function sparkle(g: G, x: number, y: number, s: number) {
    g.fillStyle(C.white, 1)
    g.fillRect(x - s, y - s / 4, s * 2, s / 2)
    g.fillRect(x - s / 4, y - s, s / 2, s * 2)
}

function shadow(g: G, x: number, y: number, w: number, h: number, r: number) {
    g.fillStyle(C.shadow, 0.16)
    g.fillRoundedRect(x + 4, y + 8, w, h, r)
}

function darker(tone: number, k = 0.8) {
    const c = Phaser.Display.Color.IntegerToColor(tone)
    return Phaser.Display.Color.GetColor(Math.round(c.red * k), Math.round(c.green * k), Math.round(c.blue * k))
}

function puffs(g: G, x: number, y: number, r: number, fill: number) {
    const spots = [
        [-0.9, 0.2, 0.7],
        [0, -0.25, 1],
        [0.95, 0.15, 0.75],
    ]
    spots.forEach(([dx, dy, k]) => disc(g, x + dx * r, y + dy * r, r * k, fill, 4))
    g.fillStyle(fill, 1)
    spots.forEach(([dx, dy, k]) => g.fillCircle(x + dx * r, y + dy * r, r * k - 3))
    sparkle(g, x - r * 0.2, y - r * 0.55, 6)
}

function star(g: G, cx: number, cy: number, outer: number) {
    const pts: P[] = []
    for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5
        const r = k % 2 ? outer * 0.45 : outer
        pts.push({ x: cx + Math.cos(a) * r, y: cy + 8 + Math.sin(a) * r })
    }
    poly(g, pts, C.star, 6)
    sparkle(g, cx - outer * 0.25, cy - outer * 0.2, 9)
}

const QUIET = [
    { x0: 0, y0: 520, x1: 1060, y1: 660 },
    { x0: 680, y0: 240, x1: 1080, y1: 640 },
    { x0: 40, y0: 90, x1: 560, y1: 450 },
]

const quiet = (x: number, y: number) => QUIET.some(q => x > q.x0 && x < q.x1 && y > q.y0 && y < q.y1)

function yard(g: G) {
    g.fillStyle(C.dirt, 1)
    g.fillRect(0, 0, W, H)
    let seed = 7
    const rnd = () => {
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647
    }
    ;[
        [620, 170, 220, 90],
        [1000, 150, 200, 80],
        [190, 500, 240, 70],
        [600, 700, 260, 60],
        [1230, 470, 120, 140],
        [60, 330, 90, 160],
    ].forEach(([x, y, w, h]) => {
        g.fillStyle(C.grass, 0.85)
        g.fillEllipse(x, y, w, h)
        g.fillStyle(C.grassDark, 0.5)
        for (let k = 0; k < 10; k++) g.fillEllipse(x + (rnd() - 0.5) * w * 0.7, y + (rnd() - 0.5) * h * 0.6, 10, 5)
    })
    for (let k = 0; k < 420; k++) {
        const x = rnd() * W
        const y = 50 + rnd() * (H - 50)
        if (quiet(x, y) && rnd() < 0.8) continue
        g.fillStyle(rnd() < 0.5 ? C.gravel : C.dirtDark, 0.7)
        g.fillCircle(x, y, 1.5 + rnd() * 2.5)
    }

    g.fillStyle(C.shadow, 0.12)
    g.fillRect(0, 40, W, 8)
    g.fillStyle(C.fence, 1)
    g.fillRect(0, 14, W, 9)
    g.fillRect(0, 30, W, 9)
    g.lineStyle(4, darker(C.fence, 0.7), 1)
    g.strokeRect(-4, 14, W + 8, 9)
    g.strokeRect(-4, 30, W + 8, 9)
    for (let x = 20; x < W; x += 64) box(g, x, 4, 18, 42, 8, C.fence, 4)

    ;[
        [30, 90],
        [1250, 90],
        [610, 470],
        [1110, 690],
        [30, 470],
    ].forEach(([x, y]) => {
        disc(g, x - 10, y, 9, C.grassDark, 3)
        disc(g, x + 10, y + 2, 9, C.grassDark, 3)
        disc(g, x - 8, y - 8, 7, C.coral, 3)
        disc(g, x + 8, y - 6, 7, C.pillGlow, 3)
        disc(g, x, y + 6, 6, C.white, 3)
    })

    g.fillStyle(C.shadow, 0.16)
    g.fillEllipse(48, 700, 70, 26)
    disc(g, 44, 690, 22, C.metal, 4)
    disc(g, 44, 690, 11, C.pillGlow, 3)
    sparkle(g, 38, 682, 5)
}

const TRACK_PAINT: Array<(g: G, cx: number, cy: number) => void> = [
    (g, cx, cy) => {
        box(g, cx - 20, cy - 104, 40, 208, 8, C.wood)
        g.lineStyle(3, C.woodDark, 1)
        g.lineBetween(cx - 6, cy - 86, cx - 6, cy - 20)
        g.lineBetween(cx + 7, cy - 4, cx + 7, cy + 80)
        disc(g, cx, cy - 70, 4, C.woodDark, 0)
        disc(g, cx, cy + 70, 4, C.woodDark, 0)
    },
    (g, cx, cy) => {
        shadow(g, cx - 74, cy - 40, 148, 92, 26)
        box(g, cx - 74, cy - 40, 148, 92, 26, C.metal)
        box(g, cx - 64, cy + 24, 128, 20, 10, C.metalDark, 3)
        box(g, cx - 14, cy - 28, 28, 44, 12, C.lampOff, 4)
        sparkle(g, cx - 50, cy - 22, 6)
    },
    (g, cx, cy) => {
        box(g, cx - 10, cy - 70, 20, 180, 10, C.metalDark)
        g.fillStyle(C.white, 0.6)
        g.fillRect(cx - 4, cy - 50, 4, 130)
        disc(g, cx, cy - 86, 32, C.knob)
        sparkle(g, cx - 10, cy - 96, 7)
    },
    (g, cx, cy) => signal(g, cx, cy, true),
    (g, cx, cy) => signal(g, cx, cy, false),
    (g, cx, cy) => {
        const w = 236
        const h = 80
        box(g, cx - w / 2, cy - h / 2 + 8, w, h, h / 2, C.buttonDark)
        box(g, cx - w / 2, cy - h / 2, w, h, h / 2, C.button)
        g.fillStyle(C.white, 0.35)
        g.fillRoundedRect(cx - w / 2 + 22, cy - h / 2 + 10, w - 44, 16, 8)
        sparkle(g, cx - w / 2 + 30, cy - h / 2 + 18, 6)
    },
    (g, cx, cy) => star(g, cx, cy, 104),
    (g, cx, cy) => puffs(g, cx, cy + 10, 56, C.white),
]

function signal(g: G, cx: number, cy: number, red: boolean) {
    box(g, cx - 10, cy + 20, 20, 92, 6, C.metalDark, 4)
    box(g, cx - 40, cy + 100, 80, 18, 8, C.metal, 4)
    box(g, cx - 46, cy - 112, 92, 150, 34, C.lampOff)
    disc(g, cx, cy - 72, 28, red ? C.lampRed : darker(C.lampOff, 0.75), 4)
    disc(g, cx, cy - 4, 28, red ? darker(C.lampOff, 0.75) : C.lampGreen, 4)
    sparkle(g, cx - 10, red ? cy - 82 : cy - 14, 6)
}

const LOCO_TONES = [C.coral, C.sky, C.mintTruck]

function loco(g: G, cx: number, cy: number, tone: number) {
    const w = 256
    const h = 128
    const x = cx - w / 2
    const y = cy - h / 2
    box(g, x + 6, y - 6, 52, 20, 6, C.lampOff, 4)
    box(g, x + 6, y + h - 14, 52, 20, 6, C.lampOff, 4)
    box(g, x + 120, y - 6, 80, 20, 6, C.lampOff, 4)
    box(g, x + 120, y + h - 14, 80, 20, 6, C.lampOff, 4)
    box(g, x + 70, y + 16, w - 76, h - 32, (h - 32) / 2, tone)
    g.lineStyle(3, darker(tone, 0.8), 1)
    ;[120, 160, 200].forEach(dx => g.lineBetween(x + dx, y + 22, x + dx, y + h - 22))
    box(g, x, y, 92, h, 22, darker(tone, 0.85))
    box(g, x + 12, y + 12, 68, h - 24, 14, tone, 3)
    disc(g, x + 140, cy, 15, darker(tone, 0.8), 4)
    disc(g, x + 214, cy, 20, C.lampOff, 4)
    disc(g, x + 214, cy, 9, darker(C.lampOff, 0.6), 0)
    box(g, x + w - 10, cy - 22, 12, 44, 6, C.metal, 3)
    sparkle(g, x + 30, y + 30, 7)
    sparkle(g, x + 170, y + 32, 6)
}

function wagon(g: G, cx: number, cy: number) {
    const w = 256
    const h = 128
    const x = cx - w / 2
    const y = cy - h / 2
    box(g, x - 4, cy - 10, 14, 20, 5, C.metalDark, 3)
    box(g, x + w - 10, cy - 10, 14, 20, 5, C.metalDark, 3)
    box(g, x + 8, y, w - 16, h, 16, C.metal)
    box(g, x + 18, y + 10, w - 36, h - 20, 10, C.wood, 3)
    g.lineStyle(3, C.woodDark, 1)
    for (let px = x + 50; px < x + w - 30; px += 34) g.lineBetween(px, y + 14, px, y + h - 14)
    sparkle(g, x + 26, y + 18, 6)
}

function crate(g: G, cx: number, cy: number, w: number, h: number) {
    const x = cx - w / 2
    const y = cy - h / 2
    box(g, x, y, w, h, 12, C.crate)
    box(g, x + 8, y + 8, w - 16, h - 16, 8, C.crate, 3)
    const tw = Math.max(14, Math.min(w, h) * 0.16)
    g.fillStyle(C.tape, 1)
    g.fillRect(cx - tw / 2, y + 3, tw, h - 6)
    g.lineStyle(2, C.crateDark, 1)
    g.strokeRect(cx - tw / 2, y + 3, tw, h - 6)
    const sw = Math.min(w * 0.3, 64)
    const sh = Math.min(h * 0.3, 40)
    box(g, cx + tw / 2 + 6, y + 14, sw, sh, 6, C.white, 3)
    sparkle(g, x + 18, y + 18, 5)
}

const CRATES = [
    [150, 150],
    [210, 120],
    [240, 96],
    [104, 104],
]

function TRAIN_PAINT(g: G, i: number, cx: number, cy: number) {
    if (i < 3) return loco(g, cx, cy, LOCO_TONES[i])
    if (i === 3) return wagon(g, cx, cy)
    const [w, h] = CRATES[i - 4]
    crate(g, cx, cy, w, h)
}

function shed(g: G, cx: number, cy: number, open: boolean) {
    const s = 320
    const x = cx - s / 2
    const y = cy - s / 2
    const door = 150
    shadow(g, x, y, s, s, 30)
    box(g, x, y, s, s, 30, C.roof)
    g.lineStyle(4, C.roofDark, 1)
    for (let ry = y + 50; ry < y + s - 20; ry += 44) g.lineBetween(x + 54, ry, x + s - 18, ry)
    disc(g, cx + 70, cy - 70, 22, C.metal, 4)
    disc(g, cx + 70, cy - 70, 9, C.metalDark, 0)
    sparkle(g, x + s - 50, y + 30, 8)
    box(g, x - 24, cy - door / 2 - 12, 70, door + 24, 14, C.roofDark)
    if (open) {
        box(g, x - 12, cy - door / 2, 58, door, 10, C.dock, 3)
        g.fillStyle(C.shadow, 0.35)
        g.fillRect(x + 20, cy - door / 2 + 4, 24, door - 8)
        return
    }
    box(g, x - 12, cy - door / 2, 58, door, 10, C.shutter, 3)
    g.lineStyle(3, C.creamDark, 1)
    for (let dx = x; dx < x + 42; dx += 12) g.lineBetween(dx, cy - door / 2 + 6, dx, cy + door / 2 - 6)
}

const UI_PAINT: Array<(g: G, cx: number, cy: number) => void> = [
    (g, cx, cy) => {
        const w = 560
        const h = 380
        const x = cx - w / 2
        const y = cy - h / 2
        shadow(g, x, y, w, h, 24)
        box(g, x, y, w, h, 24, C.paper)
        g.fillStyle(C.paperLine, 1)
        for (let px = x + 30; px < x + w - 20; px += 28) g.fillCircle(px, y + 20, 6)
        g.fillStyle(C.ink, 1)
        for (let bx = x + 40, k = 0; bx < x + 240; bx += 7, k++) g.fillRect(bx, y + h - 40, k % 3 ? 3 : 5, 24)
    },
    (g, cx, cy) => {
        const w = 600
        const h = 100
        const x = cx - w / 2
        const y = cy - h / 2 + 30
        g.lineStyle(5, C.discDark, 1)
        ;[x + 90, x + w - 90].forEach(lx => {
            for (let ly = y - 70; ly < y; ly += 16) g.strokeEllipse(lx, ly + 8, 10, 16)
        })
        shadow(g, x, y, w, h, 22)
        box(g, x, y, w, h, 22, C.wood)
        g.lineStyle(3, C.woodDark, 1)
        g.lineBetween(x + 16, y + h * 0.36, x + w - 16, y + h * 0.36)
        g.lineBetween(x + 16, y + h * 0.7, x + w - 16, y + h * 0.7)
        disc(g, x + 90, y + 14, 8, C.discDark, 3)
        disc(g, x + w - 90, y + 14, 8, C.discDark, 3)
    },
    (g, cx, cy) => {
        const w = 420
        const h = 340
        const x = cx - w / 2
        const y = cy - h / 2
        shadow(g, x, y, w, h, 18)
        box(g, x, y, w, h, 18, C.note)
        disc(g, cx, y + 10, 20, C.coral)
        sparkle(g, cx - 6, y + 4, 5)
    },
    (g, cx, cy) => {
        const w = 400
        const h = 160
        const x = cx - w / 2
        const y = cy - h / 2 - 30
        box(g, x + 90, y + h - 10, 20, 70, 8, C.discDark, 4)
        box(g, x + w - 110, y + h - 10, 20, 70, 8, C.discDark, 4)
        shadow(g, x, y, w, h, 40)
        box(g, x, y, w, h, 40, C.cream)
        box(g, x + 14, y + 14, w - 28, h - 28, 30, C.white, 3)
    },
]

function longLabel(g: G, cw: number, ch: number) {
    const w = cw - 40
    const h = ch - 40
    const x = 20
    const y = 14
    shadow(g, x, y, w, h, 28)
    box(g, x, y, w, h, 28, C.paper)
    g.fillStyle(C.paperLine, 1)
    for (let px = x + 70; px < x + w - 40; px += 30) g.fillCircle(px, y + 16, 5)
    disc(g, x + 30, y + h / 2, 11, C.dirt, 4)
    g.lineStyle(3, C.paperLine, 1)
    g.strokeRoundedRect(x + 56, y + 30, w - 76, h - 48, 18)
}

const STAMP_PAINT: Array<(g: G, cx: number, cy: number) => void> = [
    (g, cx, cy) => {
        box(g, cx - 92, cy + 70, 184, 44, 14, C.rubberPad)
        box(g, cx - 104, cy + 18, 208, 64, 18, C.wood)
        g.lineStyle(3, C.woodDark, 1)
        g.lineBetween(cx - 84, cy + 50, cx + 84, cy + 50)
        box(g, cx - 22, cy - 70, 44, 96, 14, C.woodDark)
        disc(g, cx, cy - 100, 50, C.stamp)
        sparkle(g, cx - 18, cy - 118, 9)
        sparkle(g, cx - 76, cy + 32, 6)
    },
    (g, cx, cy) => {
        g.fillStyle(C.stampInk, 0.55)
        g.fillEllipse(cx, cy, 250, 150)
        ;[
            [-120, -40, 22],
            [118, 30, 18],
            [-60, 72, 16],
            [80, -66, 14],
        ].forEach(([dx, dy, r]) => g.fillCircle(cx + dx, cy + dy, r))
        g.lineStyle(6, C.stampInk, 0.75)
        g.strokeEllipse(cx, cy, 220, 124)
    },
    (g, cx, cy) => {
        shadow(g, cx - 130, cy - 110, 260, 220, 30)
        box(g, cx - 130, cy - 110, 260, 220, 30, C.wood)
        box(g, cx - 110, cy - 90, 120, 90, 18, C.lampOff, 4)
        box(g, cx - 100, cy - 80, 100, 70, 12, C.rubberPad, 3)
        box(g, cx + 30, cy - 80, 80, 150, 12, C.paper, 4)
        g.lineStyle(3, C.paperLine, 1)
        ;[-50, -26, -2, 22].forEach(dy => g.lineBetween(cx + 44, cy + dy, cx + 96, cy + dy))
        disc(g, cx - 40, cy + 50, 34, C.stamp)
        sparkle(g, cx - 52, cy + 38, 6)
        sparkle(g, cx - 104, cy - 96, 7)
    },
    (g, cx, cy) => {
        const w = 236
        const h = 80
        box(g, cx - w / 2, cy - h / 2 + 8, w, h, h / 2, C.stampDark)
        box(g, cx - w / 2, cy - h / 2, w, h, h / 2, C.stamp)
        g.fillStyle(C.white, 0.35)
        g.fillRoundedRect(cx - w / 2 + 22, cy - h / 2 + 10, w - 44, 16, 8)
        sparkle(g, cx - w / 2 + 30, cy - h / 2 + 18, 6)
    },
]
