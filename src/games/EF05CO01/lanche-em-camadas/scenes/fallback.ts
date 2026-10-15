import Phaser from 'phaser'
import { CHEF_SHEET, CUSTOMER_SHEET, HELPER_SHEET, ING_SHEET, KITCHEN_KEY, UI_SHEET, type Sheet } from '../data/files'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics
type P = { x: number; y: number }

const INK = C.line
let lw = 5

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

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, ING_SHEET, 5, ingredient)
    bakeSheet(scene, HELPER_SHEET, 5, helper)
    bakeSheet(scene, CUSTOMER_SHEET, 5, (g, i) => customer(g, Math.floor(i / 3), i % 3))
    bakeSheet(scene, CHEF_SHEET, 5, chef)
    bakeSheet(scene, UI_SHEET, 6, ui)
    if (!scene.textures.exists(KITCHEN_KEY)) {
        lw = 5
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        kitchen(g)
        g.generateTexture(KITCHEN_KEY, 1280, 720)
        g.destroy()
    }
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

function arcLine(g: G, x: number, y: number, r: number, from: number, to: number, width = lw, color: number = INK) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, Phaser.Math.DegToRad(from), Phaser.Math.DegToRad(to), false)
    g.strokePath()
}

function ellipsePts(cx: number, cy: number, rx: number, ry: number, from = 0, to = 360, n = 32): P[] {
    const pts: P[] = []
    for (let i = 0; i <= n; i++) {
        const a = Phaser.Math.DegToRad(from + ((to - from) * i) / n)
        pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
    }
    return pts
}

function sparkle(g: G, x: number, y: number, s: number) {
    g.fillStyle(C.white, 1)
    g.fillRect(x - s / 6, y - s, s / 3, s * 2)
    g.fillRect(x - s, y - s / 6, s * 2, s / 3)
}

// ───────────────────────────────────────────── ingredientes (de lado)

function ingredient(g: G, i: number) {
    const cx = 128
    const cy = 128
    if (i === 0) {
        box(g, cx - 108, cy - 26, 216, 56, { tl: 10, tr: 10, bl: 30, br: 30 }, C.bun)
        g.fillStyle(C.bunLight, 1)
        g.fillRoundedRect(cx - 100, cy - 22, 200, 10, 5)
        g.fillStyle(C.bunDark, 0.5)
        g.fillRoundedRect(cx - 96, cy + 14, 192, 8, 4)
        return
    }
    if (i === 1) {
        poly(g, [...ellipsePts(cx, cy + 30, 112, 92, 180, 360), { x: cx + 112, y: cy + 46 }, { x: cx - 112, y: cy + 46 }], C.bun)
        g.fillStyle(C.bunLight, 0.8)
        g.fillEllipse(cx - 30, cy - 30, 90, 30)
        ;[
            [-60, 0],
            [-20, -22],
            [24, -10],
            [62, 6],
            [0, 14],
            [-48, 24],
            [44, 26],
        ].forEach(([dx, dy]) => {
            g.fillStyle(C.seed, 1)
            g.fillEllipse(cx + dx, cy + dy, 14, 8)
        })
        return
    }
    if (i === 2) {
        box(g, cx - 104, cy - 28, 208, 56, 26, C.meat)
        g.lineStyle(6, C.meatDark, 0.8)
        ;[-60, -20, 20, 60].forEach(dx => g.lineBetween(cx + dx - 10, cy - 14, cx + dx + 10, cy + 12))
        g.fillStyle(0xb06a43, 0.6)
        g.fillRoundedRect(cx - 90, cy - 22, 120, 8, 4)
        return
    }
    if (i === 3) {
        poly(
            g,
            [
                { x: cx - 112, y: cy - 12 },
                { x: cx + 112, y: cy - 12 },
                { x: cx + 112, y: cy + 4 },
                { x: cx + 96, y: cy + 30 },
                { x: cx + 80, y: cy + 4 },
                { x: cx + 10, y: cy + 4 },
                { x: cx - 4, y: cy + 22 },
                { x: cx - 18, y: cy + 4 },
                { x: cx - 80, y: cy + 4 },
                { x: cx - 96, y: cy + 30 },
                { x: cx - 112, y: cy + 4 },
            ],
            C.cheese,
        )
        g.fillStyle(C.cheeseDark, 1)
        ;[-60, 30, 70].forEach(dx => g.fillCircle(cx + dx, cy - 4, 4))
        return
    }
    if (i === 4) {
        const pts: P[] = []
        for (let k = 0; k <= 16; k++) pts.push({ x: cx - 116 + k * 14.5, y: cy - 10 + (k % 2 ? -10 : 0) })
        for (let k = 16; k >= 0; k--) pts.push({ x: cx - 116 + k * 14.5, y: cy + 14 + (k % 2 ? 8 : 0) })
        poly(g, pts, C.lettuce)
        g.lineStyle(3, C.lettuceDark, 0.8)
        g.lineBetween(cx - 100, cy + 2, cx + 100, cy + 2)
        return
    }
    if (i === 5) {
        ;[-54, 54].forEach(dx => {
            oval(g, cx + dx, cy, 104, 34, C.tomato)
            g.fillStyle(C.tomatoDark, 0.7)
            g.fillEllipse(cx + dx, cy + 2, 70, 14)
        })
        return
    }
    if (i === 6) {
        const pts: P[] = []
        for (let k = 0; k <= 20; k++) {
            const a = Math.PI + (k / 20) * Math.PI
            pts.push({ x: cx + Math.cos(a) * 110, y: cy + 10 + Math.sin(a) * 26 + (k % 2 ? -4 : 0) })
        }
        pts.push({ x: cx + 110, y: cy + 18 }, { x: cx - 110, y: cy + 18 })
        poly(g, pts, C.egg)
        oval(g, cx, cy - 6, 70, 40, C.yolk)
        g.fillStyle(C.white, 0.8)
        g.fillEllipse(cx - 14, cy - 14, 18, 8)
        return
    }
    ;[-72, 0, 72].forEach(dx => {
        oval(g, cx + dx, cy, 64, 26, C.pickle)
        g.fillStyle(C.pickleDark, 1)
        g.fillCircle(cx + dx - 12, cy, 3)
        g.fillCircle(cx + dx + 12, cy, 3)
    })
}

// ───────────────────────────────────────────── o ajudante (de frente)

interface KidLook {
    skin: number
    skinDark: number
    hair: number
    top: number
    topDark: number
    bottom: number
}

const HELPER_LOOK: KidLook = { skin: C.skinA, skinDark: C.skinADark, hair: C.hairBrown, top: C.apron, topDark: C.apronDark, bottom: C.shorts }

function face(g: G, cx: number, cy: number, mood: 'smile' | 'joy' | 'oops' | 'focus' | 'eat' | 'yuck') {
    if (mood === 'joy' || mood === 'eat') {
        arcLine(g, cx - 30, cy + 10, 13, 200, 340, 5)
        arcLine(g, cx + 30, cy + 10, 13, 200, 340, 5)
    } else if (mood === 'yuck') {
        g.lineStyle(5, INK, 1)
        g.lineBetween(cx - 42, cy, cx - 20, cy + 8)
        g.lineBetween(cx - 42, cy + 16, cx - 20, cy + 8)
        g.lineBetween(cx + 42, cy, cx + 20, cy + 8)
        g.lineBetween(cx + 42, cy + 16, cx + 20, cy + 8)
    } else {
        ;[-30, 30].forEach(dx => {
            oval(g, cx + dx, cy + 6, 24, 32, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(cx + dx + 4, cy - 2, 6)
        })
    }
    g.fillStyle(C.cheek, 0.7)
    g.fillEllipse(cx - 48, cy + 32, 24, 13)
    g.fillEllipse(cx + 48, cy + 32, 24, 13)
    if (mood === 'joy') {
        g.fillStyle(C.eye, 1)
        g.slice(cx, cy + 34, 16, 0, Math.PI, false)
        g.fillPath()
    } else if (mood === 'oops') {
        arcLine(g, cx, cy + 50, 11, 200, 340, 4)
        oval(g, cx + 66, cy - 36, 14, 22, 0xd8f1fb, 3)
    } else if (mood === 'focus') {
        arcLine(g, cx, cy + 28, 10, 20, 160, 4)
        oval(g, cx + 6, cy + 42, 14, 12, C.pink, 3)
    } else if (mood === 'yuck') {
        arcLine(g, cx, cy + 44, 14, 200, 340, 4)
        oval(g, cx + 4, cy + 46, 16, 18, C.pink, 3)
    } else if (mood !== 'eat') arcLine(g, cx, cy + 28, 11, 20, 160, 4)
}

function helperBody(g: G, lift: number, arms: 'up' | 'cheer' | 'cheeks' | 'forward' | 'thumb', mood: Parameters<typeof face>[3]) {
    const look = HELPER_LOOK
    const left = { hip: { x: 142, y: 320 }, ankle: { x: 140, y: lift < 0 ? 356 : 376 } }
    const right = { hip: { x: 178, y: 320 }, ankle: { x: 180, y: lift > 0 ? 356 : 376 } }
    ;[left, right].forEach(leg => {
        limb(g, [leg.hip, leg.ankle], 24, look.skin)
        oval(g, leg.ankle.x, leg.ankle.y + 10, 46, 26, C.shoe)
    })
    box(g, 116, 294, 88, 36, 12, look.bottom)
    box(g, 114, 228, 92, 86, 22, C.shirt)
    box(g, 126, 238, 68, 84, { tl: 10, tr: 10, bl: 18, br: 18 }, look.top)
    g.fillStyle(look.topDark, 1)
    g.fillRoundedRect(140, 276, 40, 22, 6)
    const shoulderL = { x: 124, y: 246 }
    const shoulderR = { x: 196, y: 246 }
    if (arms === 'up') {
        limb(g, [shoulderL, { x: 90, y: 150 }, { x: 110, y: 52 }], 20, look.skin)
        limb(g, [shoulderR, { x: 230, y: 150 }, { x: 210, y: 52 }], 20, look.skin)
    } else if (arms === 'cheer') {
        limb(g, [shoulderL, { x: 80, y: 170 }, { x: 60, y: 100 }], 20, look.skin)
        limb(g, [shoulderR, { x: 240, y: 170 }, { x: 260, y: 100 }], 20, look.skin)
    } else if (arms === 'cheeks') {
        limb(g, [shoulderL, { x: 96, y: 220 }, { x: 108, y: 186 }], 20, look.skin)
        limb(g, [shoulderR, { x: 224, y: 220 }, { x: 212, y: 186 }], 20, look.skin)
    } else if (arms === 'forward') {
        limb(g, [shoulderL, { x: 190, y: 270 }, { x: 262, y: 262 }], 20, look.skin)
        limb(g, [shoulderR, { x: 230, y: 276 }, { x: 286, y: 262 }], 20, look.skin)
    } else {
        limb(g, [shoulderL, { x: 104, y: 290 }], 20, look.skin)
        limb(g, [shoulderR, { x: 236, y: 220 }, { x: 236, y: 180 }], 20, look.skin)
        box(g, 226, 150, 20, 36, 10, look.skin)
    }
    const cx = 160
    const cy = 168
    ;[
        [104, 130, 30],
        [216, 130, 30],
        [120, 104, 30],
        [200, 104, 30],
    ].forEach(([x, y, r]) => disc(g, x, y, r, look.hair))
    disc(g, cx, cy, 72, look.skin)
    poly(
        g,
        [
            { x: 92, y: 150 },
            { x: 104, y: 96 },
            { x: 128, y: 110 },
            { x: 140, y: 84 },
            { x: 160, y: 104 },
            { x: 178, y: 82 },
            { x: 192, y: 108 },
            { x: 216, y: 96 },
            { x: 228, y: 150 },
            { x: 200, y: 128 },
            { x: 160, y: 132 },
            { x: 120, y: 128 },
        ],
        look.hair,
    )
    box(g, 126, 70, 68, 26, 8, C.white)
    ;[136, 160, 184].forEach(x => disc(g, x, 66, 16, C.white))
    face(g, cx, cy, mood)
}

function helper(g: G, i: number) {
    if (i === 3) {
        g.save()
        g.translateCanvas(160, 398)
        g.rotateCanvas(-0.12)
        g.translateCanvas(-160, -398)
        helperBody(g, 0, 'up', 'focus')
        g.restore()
        return
    }
    if (i === 0) return helperBody(g, 0, 'up', 'smile')
    if (i === 1) return helperBody(g, -1, 'up', 'smile')
    if (i === 2) return helperBody(g, 1, 'up', 'smile')
    if (i === 4) return helperBody(g, 0, 'cheer', 'joy')
    if (i === 5) return helperBody(g, 0, 'cheeks', 'oops')
    if (i === 6) return helperBody(g, 0, 'forward', 'smile')
    helperBody(g, 0, 'thumb', 'joy')
}

// ───────────────────────────────────────────── clientes

const CUSTOMERS = [
    { skin: C.skinB, hair: C.hairBlack, top: C.lilac, style: 'pigtails' },
    { skin: C.skinB, hair: C.hairGinger, top: C.sky, style: 'glasses' },
    { skin: C.skinB, hair: C.hairWhite, top: C.coral, style: 'granny' },
] as const

function customer(g: G, who: number, mood: number) {
    const look = CUSTOMERS[who]
    const cx = 160
    const cy = 150
    box(g, 120, 300, 80, 90, 16, look.top === C.coral ? 0x6d5a7a : 0x5a6d8a)
    box(g, 108, 222, 104, 100, 26, look.top)
    if (look.style === 'pigtails') {
        disc(g, 76, 120, 30, look.hair)
        disc(g, 244, 120, 30, look.hair)
    }
    if (look.style === 'granny') disc(g, 160, 60, 32, look.hair)
    disc(g, cx, cy, 72, look.skin)
    if (look.style === 'pigtails') {
        poly(g, [...ellipsePts(cx, cy - 6, 78, 70, 190, 350)], look.hair)
    } else if (look.style === 'glasses') {
        poly(g, [...ellipsePts(cx, cy - 10, 76, 64, 185, 355)], look.hair)
    } else {
        poly(g, [...ellipsePts(cx, cy - 12, 76, 56, 185, 355)], look.hair)
    }
    const m = mood === 0 ? 'smile' : mood === 1 ? 'eat' : 'yuck'
    face(g, cx, cy + 4, m)
    if (look.style !== 'pigtails') {
        g.lineStyle(4, INK, 1)
        g.strokeCircle(cx - 30, cy + 10, 20)
        g.strokeCircle(cx + 30, cy + 10, 20)
        g.lineBetween(cx - 10, cy + 10, cx + 10, cy + 10)
    }
    if (mood === 0) {
        limb(g, [{ x: 116, y: 244 }, { x: 138, y: 290 }, { x: 156, y: 280 }], 18, look.top)
        limb(g, [{ x: 204, y: 244 }, { x: 182, y: 290 }, { x: 164, y: 280 }], 18, look.top)
        disc(g, 160, 278, 13, look.skin)
    } else if (mood === 1) {
        limb(g, [{ x: 116, y: 244 }, { x: 120, y: 260 }, { x: 132, y: 214 }], 18, look.top)
        limb(g, [{ x: 204, y: 244 }, { x: 200, y: 260 }, { x: 188, y: 214 }], 18, look.top)
        box(g, 126, 196, 68, 20, { tl: 18, tr: 18, bl: 4, br: 4 }, C.bun, 4)
        box(g, 128, 214, 64, 10, 4, C.meat, 3)
        box(g, 126, 222, 68, 10, 4, C.bun, 4)
        disc(g, 130, 214, 12, look.skin)
        disc(g, 190, 214, 12, look.skin)
    } else {
        limb(g, [{ x: 116, y: 244 }, { x: 132, y: 296 }], 18, look.top)
        limb(g, [{ x: 204, y: 244 }, { x: 188, y: 296 }], 18, look.top)
        disc(g, 134, 298, 12, look.skin)
        disc(g, 186, 298, 12, look.skin)
    }
}

// ───────────────────────────────────────────── o chef (do peito para cima)

function chef(g: G, i: number) {
    const cx = 160
    box(g, 70, 236, 180, 100, { tl: 50, tr: 50, bl: 0, br: 0 }, C.chefCoat)
    ;[196, 226].forEach(y => disc(g, cx, y + 60, 6, C.chefCoatDark, 3))
    if (i === 1) limb(g, [{ x: 236, y: 260 }, { x: 278, y: 190 }, { x: 288, y: 120 }], 26, C.chefCoat)
    if (i === 2) {
        limb(g, [{ x: 90, y: 262 }, { x: 96, y: 200 }], 26, C.chefCoat)
        limb(g, [{ x: 230, y: 262 }, { x: 224, y: 200 }], 26, C.chefCoat)
    }
    disc(g, cx, 160, 70, C.skinB)
    box(g, 102, 30, 116, 76, 30, C.chefCoat)
    ;[112, 160, 208].forEach(x => disc(g, x, 40, 30, C.chefCoat))
    g.fillStyle(C.chefCoatDark, 1)
    g.fillRect(104, 96, 112, 10)
    if (i === 3) {
        arcLine(g, cx - 28, 154, 12, 200, 340, 5)
        oval(g, cx + 28, 152, 20, 28, C.eye, 0)
    } else if (i === 2) {
        ;[-28, 28].forEach(dx => oval(g, cx + dx, 150, 26, 32, C.white, 4))
        ;[-28, 28].forEach(dx => disc(g, cx + dx, 150, 6, C.eye, 0))
    } else {
        ;[-28, 28].forEach(dx => {
            oval(g, cx + dx, 152, 20, 28, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(cx + dx + 3, 146, 5)
        })
    }
    g.fillStyle(C.cheek, 0.7)
    g.fillEllipse(cx - 46, 182, 24, 12)
    g.fillEllipse(cx + 46, 182, 24, 12)
    poly(
        g,
        [
            { x: cx, y: 178 },
            { x: cx - 30, y: 170 },
            { x: cx - 64, y: 186 },
            { x: cx - 44, y: 200 },
            { x: cx - 14, y: 194 },
            { x: cx, y: 188 },
            { x: cx + 14, y: 194 },
            { x: cx + 44, y: 200 },
            { x: cx + 64, y: 186 },
            { x: cx + 30, y: 170 },
        ],
        C.mustache,
    )
    if (i === 2) oval(g, cx, 214, 20, 22, C.eye, 3)
    if (i === 3) {
        limb(g, [{ x: 236, y: 268 }, { x: 266, y: 220 }], 24, C.chefCoat)
        box(g, 254, 180, 22, 40, 10, C.skinB)
    }
}

// ───────────────────────────────────────────── interface

function ui(g: G, i: number) {
    if (i === 0) {
        disc(g, 128, 128, 106, C.cream, 7)
        g.lineStyle(9, C.creamDark, 1)
        g.strokeCircle(128, 134, 92)
        poly(
            g,
            [
                { x: 82, y: 110 },
                { x: 136, y: 110 },
                { x: 136, y: 78 },
                { x: 186, y: 128 },
                { x: 136, y: 178 },
                { x: 136, y: 146 },
                { x: 82, y: 146 },
            ],
            C.accent,
            7,
        )
        return
    }
    if (i === 1) {
        box(g, 52, 24, 152, 208, 18, C.cream, 6)
        g.fillStyle(C.butter, 1)
        g.fillRoundedRect(58, 30, 140, 46, { tl: 14, tr: 14, bl: 0, br: 0 })
        g.lineStyle(4, INK, 0.6)
        g.lineBetween(58, 76, 198, 76)
        return
    }
    if (i === 2) {
        oval(g, 128, 140, 230, 54, C.tray, 6)
        g.fillStyle(C.trayDark, 1)
        g.fillEllipse(128, 150, 190, 22)
        g.fillStyle(C.white, 0.6)
        g.fillEllipse(96, 128, 70, 10)
        return
    }
    if (i === 3) {
        const pts: P[] = []
        for (let k = 0; k < 10; k++) {
            const r = k % 2 ? 40 : 96
            const a = -Math.PI / 2 + (k * Math.PI) / 5
            pts.push({ x: 128 + Math.cos(a) * r, y: 134 + Math.sin(a) * r })
        }
        poly(g, pts, C.butter, 6)
        sparkle(g, 104, 104, 12)
        return
    }
    if (i === 4) {
        g.fillStyle(C.pink, 1)
        g.fillCircle(96, 108, 46)
        g.fillCircle(160, 108, 46)
        g.fillTriangle(52, 124, 204, 124, 128, 214)
        g.lineStyle(6, INK, 1)
        g.beginPath()
        g.arc(96, 108, 46, Math.PI * 0.75, Math.PI * 1.95, false)
        g.arc(160, 108, 46, Math.PI * 1.05, Math.PI * 0.25, false)
        g.lineTo(128, 214)
        g.closePath()
        g.strokePath()
        return
    }
    ;[
        [92, 140, 44],
        [150, 120, 52],
        [186, 158, 36],
    ].forEach(([x, y, r]) => disc(g, x, y, r, C.white, 5))
}

// ───────────────────────────────────────────── a cozinha (o fundo)

function kitchen(g: G) {
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, 1280, 720)
    g.fillStyle(C.wallTile, 0.6)
    for (let y = 380; y < 660; y += 40) for (let x = (y / 40) % 2 ? 0 : 20; x < 1280; x += 40) g.fillRect(x + 2, y + 2, 36, 36)
    g.fillStyle(C.mint, 0.35)
    g.fillRect(0, 370, 1280, 10)
    box(g, 486, 118, 308, 196, 18, C.sill, 0)
    g.fillStyle(C.kitchen, 1)
    g.fillRoundedRect(500, 130, 280, 170, 12)
    g.fillStyle(C.kitchenDark, 1)
    g.fillRect(500, 200, 280, 8)
    g.fillRect(500, 250, 280, 8)
    ;[540, 600, 700].forEach(x => {
        g.fillStyle(0x7a6890, 1)
        g.fillRoundedRect(x, 176, 30, 24, 6)
    })
    g.fillStyle(C.sillDark, 1)
    g.fillRoundedRect(480, 296, 320, 22, 8)
    g.lineStyle(3, C.lamp, 0.6)
    g.lineBetween(300, 0, 300, 120)
    g.fillStyle(C.lamp, 1)
    g.slice(300, 150, 40, Math.PI, 0, false)
    g.fillPath()
    g.fillStyle(C.lamp, 0.15)
    g.fillTriangle(260, 150, 340, 150, 300, 330)
    box(g, 940, 150, 120, 96, 10, C.cream, 4)
    g.fillStyle(C.bun, 1)
    g.fillRoundedRect(962, 176, 76, 20, { tl: 12, tr: 12, bl: 0, br: 0 })
    g.fillStyle(C.meat, 1)
    g.fillRect(964, 196, 72, 12)
    g.fillStyle(C.bun, 1)
    g.fillRoundedRect(962, 208, 76, 12, { tl: 0, tr: 0, bl: 8, br: 8 })
    for (let y = 660; y < 720; y += 30)
        for (let x = (y / 30) % 2 ? 0 : 30; x < 1280; x += 60) {
            g.fillStyle(C.floorA, 1)
            g.fillRect(x, y, 30, 30)
        }
    g.fillStyle(C.floorB, 1)
    for (let y = 660; y < 720; y += 30)
        for (let x = (y / 30) % 2 ? 30 : 0; x < 1280; x += 60) g.fillRect(x, y, 30, 30)
    box(g, 1076, 490, 230, 240, 0, C.counter, 6)
    g.fillStyle(C.counterDark, 1)
    for (let x = 1100; x < 1280; x += 46) g.fillRoundedRect(x, 520, 30, 180, 8)
    box(g, 1064, 468, 240, 30, 10, C.counterTop, 6)
}
