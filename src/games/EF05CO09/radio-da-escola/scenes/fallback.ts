import Phaser from 'phaser'
import { COVER2_SHEET, COVER_SHEET, DUDA_SHEET, OWNER2_SHEET, OWNER_SHEET, STAGE_KEY, UI2_SHEET, UI_SHEET, type Sheet } from '../data/files'
import { H, W } from '../data/layout'
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
    if (!scene.textures.exists(STAGE_KEY)) {
        lw = 5
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        stage(g)
        g.generateTexture(STAGE_KEY, W, H)
        g.destroy()
    }
    bakeSheet(scene, DUDA_SHEET, 5, duda)
    bakeSheet(scene, OWNER_SHEET, 5, (g, i) => owner(g, OWNER_LOOKS[Math.floor(i / 6) * 2 + (i % 6 >= 3 ? 1 : 0)], i % 3))
    bakeSheet(scene, COVER_SHEET, 5, cover)
    bakeSheet(scene, UI_SHEET, 6, ui)
    bakeSheet(scene, OWNER2_SHEET, 5, (g, i) => owner(g, OWNER2_LOOKS[Math.floor(i / 6) * 2 + (i % 6 >= 3 ? 1 : 0)], i % 3))
    bakeSheet(scene, COVER2_SHEET, 5, cover2)
    bakeSheet(scene, UI2_SHEET, 6, ui2)
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

function stroke(g: G, points: P[], width = lw, color: number = INK) {
    g.lineStyle(width, color, 1)
    g.strokePoints(points, false)
}

function arc(g: G, x: number, y: number, r: number, from: number, to: number, width = lw, color: number = INK) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, Phaser.Math.DegToRad(from), Phaser.Math.DegToRad(to), false)
    g.strokePath()
}

function noteMark(g: G, x: number, y: number, s: number, color: number = INK) {
    g.fillStyle(color, 1)
    g.fillEllipse(x, y, 14 * s, 11 * s)
    g.fillRect(x + 5 * s, y - 26 * s, 3 * s, 26 * s)
    g.fillTriangle(x + 8 * s, y - 26 * s, x + 18 * s, y - 18 * s, x + 8 * s, y - 16 * s)
}

function star4(g: G, x: number, y: number, r: number, color: number, line = 2) {
    const k = r * 0.28
    poly(
        g,
        [
            { x, y: y - r },
            { x: x + k, y: y - k },
            { x: x + r, y },
            { x: x + k, y: y + k },
            { x, y: y + r },
            { x: x - k, y: y + k },
            { x: x - r, y },
            { x: x - k, y: y - k },
        ],
        color,
        line,
    )
}

const rand = (seed: number) => {
    let s = seed
    return () => {
        s = (s * 9301 + 49297) % 233280
        return s / 233280
    }
}

// ───────────────────────────────────────────── o palco no espaço

function stage(g: G) {
    const bands = [C.space, 0x1a0d3d, 0x1f1047, 0x241252, 0x2a155e, 0x30186a, C.spaceHi]
    const step = H / bands.length
    bands.forEach((tone, i) => {
        g.fillStyle(tone, 1)
        g.fillRect(0, i * step, W, step + 1)
    })
    g.fillStyle(C.nebulaViolet, 0.22)
    g.fillEllipse(170, 260, 520, 300)
    g.fillEllipse(1120, 230, 520, 320)
    g.fillStyle(C.nebulaPink, 0.2)
    g.fillEllipse(260, 380, 360, 200)
    g.fillEllipse(1030, 360, 380, 220)
    g.fillStyle(C.cyan, 0.08)
    g.fillEllipse(640, 40, 900, 160)

    const r = rand(7)
    for (let i = 0; i < 160; i++) {
        const x = r() * W
        const y = r() * 620
        const center = x > 400 && x < 880 && y > 120
        if (center && r() < 0.8) continue
        g.fillStyle(C.white, 0.4 + r() * 0.6)
        g.fillCircle(x, y, 1 + r() * 2)
    }
    for (let i = 0; i < 18; i++) {
        const x = r() * W
        const y = 90 + r() * 480
        if (x > 400 && x < 880) continue
        star4(g, x, y, 5 + r() * 8, [C.white, C.lemonLight, C.pinkLight, C.cyanLight][i % 4], 0)
    }

    ;[
        { x: 0, flip: 1 },
        { x: W, flip: -1 },
    ].forEach(({ x, flip }) => {
        const bx = x + flip * 36
        g.fillStyle(C.violetDark, 1)
        g.fillRect(Math.min(bx, bx + flip * 150) - 2, 70, 150, 20)
        g.fillRect(bx - 10, 0, 20, 250)
        g.lineStyle(3, C.violetLight, 0.8)
        for (let y = 10; y < 250; y += 30) {
            g.lineBetween(bx - 10, y, bx + 10, y + 30)
            g.lineBetween(bx + 10, y, bx - 10, y + 30)
        }
        ;[0, 1, 2].forEach(k => {
            const lx = bx + flip * (30 + k * 46)
            disc(g, lx, 100, 17, C.indigo, 4)
            disc(g, lx, 100, 10, [C.lemon, C.white, C.pinkLight][k], 0)
        })
    })

    g.fillStyle(C.indigoDark, 1)
    g.fillRect(0, 640, W, 80)
    g.fillStyle(C.cyan, 1)
    g.fillRect(0, 636, W, 6)
    g.fillStyle(C.pink, 1)
    g.fillRect(0, 646, W, 3)
    for (let x = 30; x < W; x += 60) {
        g.fillStyle(x % 120 ? C.pinkLight : C.cyanLight, 0.9)
        g.fillCircle(x, 664, 4)
    }

    const crowd = (x0: number, x1: number, seed: number) => {
        const cr = rand(seed)
        for (let x = x0; x < x1; x += 34) {
            const y = 690 + cr() * 18
            const tone = [C.pink, C.cyan, C.lemon][Math.floor(cr() * 3)]
            const tilt = (cr() - 0.5) * 30
            g.lineStyle(9, tone, 1)
            g.lineBetween(x + 6, y - 30, x + 6 + Math.sin(Phaser.Math.DegToRad(tilt)) * 40, y - 30 - 40)
            g.fillStyle(tone, 0.25)
            g.fillCircle(x + 6 + Math.sin(Phaser.Math.DegToRad(tilt)) * 40, y - 72, 14)
            g.fillStyle(C.space, 1)
            g.fillCircle(x, y - 14, 20)
            g.fillRect(x - 24, y, 48, 40)
        }
    }
    crowd(0, 250, 3)
    crowd(1040, W + 20, 11)
}

// ───────────────────────────────────────────── as pessoas

interface Look {
    skin: number
    skinDark: number
    hair: number
    shirt: number
    style: 'long' | 'messy' | 'puffs' | 'curly' | 'fringe' | 'buzz' | 'braids' | 'twists'
    glasses?: boolean
    band?: number
    cap?: number
    clip?: boolean
    freckles?: boolean
    gap?: boolean
    beads?: number
    lens?: number
    phones?: number
    necklace?: number
}

const OWNER_LOOKS: Look[] = [
    { skin: 0xd9a27a, skinDark: 0xbd8460, hair: 0x2b2228, shirt: C.lemon, style: 'long', band: C.pink },
    { skin: 0xf7d6bd, skinDark: 0xe4b896, hair: 0xa7774f, shirt: C.indigo, style: 'messy', glasses: true },
    { skin: 0x8a5a3c, skinDark: 0x6e4429, hair: 0x261b1b, shirt: C.violet, style: 'puffs' },
    { skin: 0xc58b62, skinDark: 0xa66f4b, hair: 0x221a1a, shirt: C.red, style: 'curly' },
    { skin: 0xc99363, skinDark: 0xab774a, hair: 0x1e1a22, shirt: C.cyan, style: 'fringe', clip: true },
    { skin: 0xa8714b, skinDark: 0x8b5937, hair: 0x221a1a, shirt: C.mint, style: 'buzz', gap: true },
    { skin: 0xfbe3d2, skinDark: 0xeec4aa, hair: 0xe0743a, shirt: C.pink, style: 'braids', freckles: true },
    { skin: 0x5e3b27, skinDark: 0x47291a, hair: 0x1b1414, shirt: C.white, style: 'twists', cap: C.lemon },
]

const OWNER2_LOOKS: Look[] = [
    { skin: 0xc99a72, skinDark: 0xab7c55, hair: 0x6b4428, shirt: 0x4f7fd6, style: 'curly', band: C.mint },
    { skin: 0xf6d8c0, skinDark: 0xe2b897, hair: 0xf2cf5b, shirt: C.orange, style: 'fringe' },
    { skin: 0x6a4029, skinDark: 0x50301d, hair: 0x1b1414, shirt: C.pink, style: 'braids', beads: C.lemon },
    { skin: 0xb07a52, skinDark: 0x92603c, hair: 0x1b1414, shirt: C.violet, style: 'curly', phones: C.cyan },
    { skin: 0xf7d6bd, skinDark: 0xe4b896, hair: 0x8a5a36, shirt: C.lemon, style: 'messy', glasses: true, lens: C.violet },
    { skin: 0x4a2c1c, skinDark: 0x372012, hair: 0x140f0f, shirt: C.cyan, style: 'buzz' },
    { skin: 0xc28d5e, skinDark: 0xa37043, hair: 0x15110f, shirt: C.mint, style: 'fringe', necklace: C.orange },
    { skin: 0xfbe6d6, skinDark: 0xeec8ae, hair: 0x1b1414, shirt: C.violetLight, style: 'fringe', band: C.violet },
]

function hairBack(g: G, look: Look, x: number, y: number, r: number) {
    if (look.style === 'long') box(g, x - r - 6, y - r * 0.2, r * 2 + 12, r * 1.9, { tl: 20, tr: 20, bl: 14, br: 14 }, look.hair)
    if (look.style === 'puffs') {
        disc(g, x - r * 0.95, y - r * 0.75, r * 0.52, look.hair)
        disc(g, x + r * 0.95, y - r * 0.75, r * 0.52, look.hair)
    }
    if (look.style === 'braids') {
        ;[-1, 1].forEach(side => {
            for (let i = 0; i < 3; i++) oval(g, x + side * r * 0.95, y + r * 0.35 + i * r * 0.36, r * 0.42, r * 0.42, look.hair, 4)
            disc(g, x + side * r * 0.95, y + r * 1.32, r * 0.13, look.beads ?? C.mint, 3)
        })
    }
}

function cap(g: G, x: number, y: number, r: number, from: number, to: number, tone: number) {
    g.fillStyle(tone, 1)
    g.slice(x, y, r, Phaser.Math.DegToRad(from), Phaser.Math.DegToRad(to), false)
    g.fillPath()
    g.lineStyle(lw, INK, 1)
    g.beginPath()
    g.arc(x, y, r, Phaser.Math.DegToRad(from), Phaser.Math.DegToRad(to), false)
    g.strokePath()
}

function hairFront(g: G, look: Look, x: number, y: number, r: number) {
    const h = look.hair
    switch (look.style) {
        case 'long':
        case 'fringe':
            poly(
                g,
                [
                    { x: x - r * 1.02, y: y + r * 0.1 },
                    { x: x - r * 0.95, y: y - r * 0.55 },
                    { x: x - r * 0.4, y: y - r * 1.02 },
                    { x: x + r * 0.4, y: y - r * 1.02 },
                    { x: x + r * 0.95, y: y - r * 0.55 },
                    { x: x + r * 1.02, y: y + r * 0.1 },
                    { x: x + r * 0.78, y: y - r * 0.3 },
                    { x: x - r * 0.78, y: y - r * 0.3 },
                ],
                h,
            )
            break
        case 'messy':
            poly(
                g,
                [
                    { x: x - r * 1.02, y: y - r * 0.05 },
                    { x: x - r * 0.98, y: y - r * 0.7 },
                    { x: x - r * 0.55, y: y - r * 1.18 },
                    { x: x - r * 0.1, y: y - r * 0.96 },
                    { x: x + r * 0.3, y: y - r * 1.22 },
                    { x: x + r * 0.95, y: y - r * 0.72 },
                    { x: x + r * 1.02, y: y - r * 0.05 },
                    { x: x + r * 0.7, y: y - r * 0.42 },
                    { x: x + r * 0.2, y: y - r * 0.3 },
                    { x: x - r * 0.3, y: y - r * 0.46 },
                    { x: x - r * 0.75, y: y - r * 0.3 },
                ],
                h,
            )
            break
        case 'puffs':
        case 'buzz':
        case 'twists':
            cap(g, x, y, r * 1.02, 180, 360, h)
            g.fillStyle(h, 1)
            g.fillRect(x - r * 1.0, y - r * 0.32, r * 2.0, r * 0.32)
            if (look.style === 'buzz') {
                g.fillStyle(look.skin, 1)
                g.fillRect(x - r * 0.95, y - r * 0.3, r * 1.9, r * 0.3)
            }
            if (look.style === 'twists')
                for (let i = -3; i <= 3; i++) oval(g, x + i * r * 0.26, y - r * 0.92 + Math.abs(i) * r * 0.08, r * 0.24, r * 0.34, h, 3)
            break
        case 'curly':
            for (let i = -3; i <= 3; i++) disc(g, x + i * r * 0.3, y - r * 0.82 + Math.abs(i) * r * 0.12, r * 0.3, h, 4)
            break
        case 'braids':
            cap(g, x, y, r * 1.02, 185, 355, h)
            g.lineStyle(3, INK, 1)
            g.lineBetween(x, y - r, x, y - r * 0.55)
            break
    }
    if (look.band) {
        g.lineStyle(9, look.band, 1)
        g.beginPath()
        g.arc(x, y + 4, r * 0.92, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false)
        g.strokePath()
    }
    if (look.clip) star4(g, x + r * 0.62, y - r * 0.58, 14, C.lemon)
    if (look.cap) {
        box(g, x - r * 0.95, y - r * 1.1, r * 1.9, r * 0.62, { tl: r * 0.6, tr: r * 0.6, bl: 4, br: 4 }, look.cap)
        box(g, x - r * 0.2, y - r * 0.56, r * 1.25, r * 0.2, 6, look.cap)
    }
}

function face(g: G, look: Look, x: number, y: number, r: number, expr: number, iris: number = C.cyanDark) {
    const ey = y + r * 0.12
    const ex = r * 0.38
    if (expr === 1) {
        ;[-1, 1].forEach(s => arc(g, x + s * ex, ey + 6, r * 0.16, 200, 340, lw))
    } else {
        ;[-1, 1].forEach(s => {
            oval(g, x + s * ex, ey, r * 0.28, r * 0.34, C.white, 3)
            oval(g, x + s * ex, ey + r * 0.03, r * 0.2, r * 0.26, iris, 0)
            disc(g, x + s * ex, ey + r * 0.04, r * 0.07, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(x + s * ex - r * 0.05, ey - r * 0.06, r * 0.05)
            g.lineStyle(5, INK, 1)
            g.lineBetween(x + s * ex - r * 0.16, ey - r * 0.17, x + s * ex + r * 0.16, ey - r * 0.17)
        })
        if (expr === 2)
            [-1, 1].forEach(s =>
                stroke(
                    g,
                    [
                        { x: x + s * (ex + r * 0.18), y: ey - r * 0.36 },
                        { x: x + s * (ex - r * 0.14), y: ey - r * 0.24 },
                    ],
                    lw,
                ),
            )
    }
    g.fillStyle(C.blush, expr === 2 ? 0.95 : 0.75)
    ;[-1, 1].forEach(s => g.fillEllipse(x + s * r * 0.62, y + r * 0.42, r * (expr === 2 ? 0.36 : 0.28), r * 0.16))
    if (look.freckles) {
        g.fillStyle(0xc0714a, 1)
        ;[-1, 1].forEach(s => [0, 1, 2].forEach(k => g.fillCircle(x + s * (r * 0.5 + k * 6), y + r * 0.26 + (k % 2) * 5, 2.5)))
    }
    if (look.glasses) {
        g.lineStyle(4, look.lens ?? C.cyan, 1)
        ;[-1, 1].forEach(s => g.strokeCircle(x + s * ex, ey, r * 0.26))
        g.lineBetween(x - ex + r * 0.26, ey, x + ex - r * 0.26, ey)
    }
    const my = y + r * 0.56
    if (expr === 0) arc(g, x, my - r * 0.12, r * 0.16, 30, 150, lw)
    if (expr === 1) {
        g.fillStyle(C.redDark, 1)
        g.slice(x, my - r * 0.06, r * 0.22, 0, Math.PI, false)
        g.fillPath()
        g.lineStyle(lw - 1, INK, 1)
        g.beginPath()
        g.arc(x, my - r * 0.06, r * 0.22, 0, Math.PI, false)
        g.closePath()
        g.strokePath()
        if (look.gap) {
            g.fillStyle(C.white, 1)
            g.fillRect(x - r * 0.16, my - r * 0.04, r * 0.12, r * 0.07)
            g.fillRect(x + r * 0.04, my - r * 0.04, r * 0.12, r * 0.07)
        }
    }
    if (expr === 2) oval(g, x, my, r * 0.14, r * 0.12, C.redDark, 3)
}

function head(g: G, look: Look, x: number, y: number, r: number) {
    disc(g, x, y, r, look.skin)
    ;[-1, 1].forEach(s => disc(g, x + s * r * 0.98, y + r * 0.18, r * 0.16, look.skin, 4))
}

function owner(g: G, look: Look, expr: number) {
    const cx = 128
    const cy = 112
    const r = 68
    hairBack(g, look, cx, cy, r)
    box(g, cx - r * 1.05, cy + r * 1.02, r * 2.1, 246 - cy - r * 1.02, { tl: r * 0.7, tr: r * 0.7, bl: 0, br: 0 }, look.shirt)
    box(g, cx - r * 0.22, cy + r * 0.8, r * 0.44, r * 0.34, 4, look.skinDark, 4)
    if (look.necklace) for (let k = -3; k <= 3; k++) disc(g, cx + k * r * 0.17, cy + r * 1.1 + (3 - Math.abs(k)) * 5, 7, look.necklace, 3)
    if (look.phones) {
        arc(g, cx, cy + r * 0.86, r * 0.62, 20, 160, 10, look.phones)
        ;[-1, 1].forEach(s => oval(g, cx + s * r * 0.62, cy + r * 1.02, r * 0.3, r * 0.4, look.phones ?? C.cyan, 4))
    }
    head(g, look, cx, cy, r)
    hairFront(g, look, cx, cy, r)
    face(g, look, cx, cy, r, expr)
    if (expr === 1) {
        noteMark(g, 30, 74, 1.1, C.pink)
        noteMark(g, 214, 56, 1, C.cyanDark)
        star4(g, 222, 128, 10, C.lemon)
    }
    if (expr === 2) {
        g.lineStyle(5, C.red, 1)
        ;[0, 90, 180, 270].forEach(a => {
            const t = Phaser.Math.DegToRad(a + 45)
            g.beginPath()
            g.arc(196 + Math.cos(t) * 12, 44 + Math.sin(t) * 12, 8, t + Math.PI * 0.6, t + Math.PI * 1.4, false)
            g.strokePath()
        })
    }
}

const DUDA_LOOK: Look = { skin: 0x9c6844, skinDark: 0x7f5131, hair: 0x241a1a, shirt: C.cyan, style: 'puffs' }

function arm(g: G, from: P, to: P, skin: number, sleeve: number) {
    g.lineStyle(32, INK, 1)
    g.lineBetween(from.x, from.y, to.x, to.y)
    g.lineStyle(24, skin, 1)
    g.lineBetween(from.x, from.y, to.x, to.y)
    disc(g, to.x, to.y, 17, skin, 4)
    box(g, to.x - 15, to.y + 10, 30, 12, 4, C.pink, 3)
    disc(g, from.x, from.y, 24, sleeve, 4)
}

function duda(g: G, pose: number) {
    const x = 160
    const y = 150
    const r = 90
    const look = DUDA_LOOK
    disc(g, x, y - r * 1.12, r * 0.52, look.hair)
    box(g, x - 30, y - r * 1.46, 60, 22, 10, C.lemon, 4)
    if (pose === 3) {
        arm(g, { x: x - 96, y: 300 }, { x: x - 130, y: 150 }, look.skin, C.violet)
        arm(g, { x: x + 96, y: 300 }, { x: x + 130, y: 150 }, look.skin, C.violet)
    }
    box(g, x - 112, y + r * 1.0, 224, 400 - (y + r * 1.0), { tl: 60, tr: 60, bl: 0, br: 0 }, C.violet, 5)
    poly(
        g,
        [
            { x: x - 52, y: y + r * 1.0 },
            { x: x + 52, y: y + r * 1.0 },
            { x: x + 40, y: 400 },
            { x: x - 40, y: 400 },
        ],
        look.shirt,
        5,
    )
    star4(g, x, 330, 22, C.white, 3)
    ;[
        [x - 84, 290],
        [x + 80, 320],
        [x - 70, 370],
        [x + 92, 372],
    ].forEach(([sx, sy]) => star4(g, sx, sy, 9, C.lemon, 2))
    box(g, x - 22, y + r * 0.8, 44, 30, 6, look.skinDark, 4)
    head(g, look, x, y, r)
    hairFront(g, look, x, y, r)
    star4(g, x - r * 0.7, y - r * 0.62, 15, C.lemon)
    star4(g, x + r * 0.72, y - r * 0.56, 13, C.pink)
    face(g, look, x, y, r, pose === 1 || pose === 3 ? 1 : 0, 0xb5651d)
    if (pose === 2) {
        oval(g, x, y + r * 0.58, r * 0.2, r * 0.24, C.redDark, 4)
        poly(
            g,
            [
                { x: x + r * 1.1, y: y - r * 0.5 },
                { x: x + r * 1.2, y: y - r * 0.3 },
                { x: x + r * 1.1, y: y - r * 0.22 },
                { x: x + r * 1.0, y: y - r * 0.3 },
            ],
            C.cyanLight,
            3,
        )
    }
    stroke(
        g,
        [
            { x: x + r * 0.98, y: y + r * 0.1 },
            { x: x + r * 0.8, y: y + r * 0.62 },
            { x: x + r * 0.32, y: y + r * 0.66 },
        ],
        6,
        C.pink,
    )
    disc(g, x + r * 0.28, y + r * 0.66, 9, C.pinkDark, 3)
    disc(g, x + r * 0.98, y + r * 0.12, 14, C.pink, 4)
    if (pose === 0) arm(g, { x: x + 96, y: 300 }, { x: x + 134, y: 196 }, look.skin, C.violet)
    if (pose === 1) {
        arm(g, { x: x + 96, y: 300 }, { x: x + r * 0.62, y: y + r * 0.86 }, look.skin, C.violet)
        noteMark(g, 40, 90, 1.4, C.pink)
        noteMark(g, 286, 70, 1.2, C.cyan)
    }
    if (pose === 2) {
        arm(g, { x: x - 96, y: 300 }, { x: x - 66, y: y + r * 0.66 }, look.skin, C.violet)
        arm(g, { x: x + 96, y: 300 }, { x: x + 66, y: y + r * 0.66 }, look.skin, C.violet)
    }
    if (pose === 3) {
        star4(g, 30, 60, 16, C.lemon)
        star4(g, 292, 92, 13, C.cyan)
        star4(g, 270, 22, 10, C.pink)
    }
}

// ───────────────────────────────────────────── as capas

function cover(g: G, i: number) {
    const bg = [C.cyan, C.pinkLight, C.violet, C.lemon, C.indigoDark, C.mint, C.aqua, C.peach][i]
    g.fillStyle(bg, 1)
    g.fillRect(0, 0, 256, 256)
    g.lineStyle(4, INK, 1)
    g.strokeRect(2, 2, 252, 252)
    switch (i) {
        case 0:
            oval(g, 80, 60, 90, 44, C.white, 4)
            oval(g, 178, 46, 80, 40, C.white, 4)
            ;[
                [60, 110],
                [130, 96],
                [200, 112],
                [100, 132],
                [170, 136],
            ].forEach(([x, y]) => noteMark(g, x, y, 0.9, C.indigo))
            poly(
                g,
                [
                    { x: 20, y: 230 },
                    { x: 128, y: 150 },
                    { x: 236, y: 230 },
                ],
                C.red,
                5,
            )
            g.lineStyle(3, C.redDark, 1)
            for (let k = 0; k < 4; k++) g.lineBetween(52 + k * 22, 206 - k * 16, 204 - k * 22, 206 - k * 16)
            break
        case 1:
            box(g, 50, 150, 156, 70, 12, C.cream)
            box(g, 70, 108, 116, 48, 10, C.paper)
            g.lineStyle(6, C.pinkDark, 1)
            g.lineBetween(56, 176, 200, 176)
            box(g, 122, 72, 12, 38, 3, C.lemonLight, 3)
            oval(g, 128, 62, 14, 22, C.orange, 3)
            poly(
                g,
                [
                    { x: 210, y: 92 },
                    { x: 224, y: 80 },
                    { x: 238, y: 92 },
                    { x: 224, y: 110 },
                ],
                C.red,
                3,
            )
            break
        case 2:
            oval(g, 128, 196, 196, 64, C.violetLight)
            oval(g, 132, 160, 150, 80, C.orange)
            disc(g, 82, 148, 40, C.orange)
            poly(
                g,
                [
                    { x: 54, y: 126 },
                    { x: 60, y: 96 },
                    { x: 80, y: 114 },
                ],
                C.orange,
                4,
            )
            poly(
                g,
                [
                    { x: 92, y: 110 },
                    { x: 108, y: 90 },
                    { x: 114, y: 120 },
                ],
                C.orange,
                4,
            )
            arc(g, 70, 152, 7, 200, 340, 3)
            arc(g, 94, 152, 7, 200, 340, 3)
            noteMark(g, 170, 80, 1, C.white)
            noteMark(g, 210, 52, 0.8, C.white)
            break
        case 3:
            g.fillStyle(C.orange, 1)
            g.fillRect(4, 196, 248, 56)
            ;[
                [86, 150],
                [176, 162],
            ].forEach(([x, y]) => {
                box(g, x - 46, y - 10, 92, 70, 6, x < 100 ? C.red : C.cyan)
                oval(g, x, y - 10, 92, 30, C.paper)
            })
            stroke(
                g,
                [
                    { x: 60, y: 70 },
                    { x: 120, y: 130 },
                ],
                9,
                C.indigo,
            )
            stroke(
                g,
                [
                    { x: 200, y: 70 },
                    { x: 150, y: 140 },
                ],
                9,
                C.indigo,
            )
            break
        case 4:
            for (let k = 0; k < 14; k++) star4(g, 20 + ((k * 73) % 220), 20 + ((k * 47) % 220), 6 + (k % 3) * 3, k % 2 ? C.lemon : C.white, 0)
            disc(g, 196, 70, 30, C.silver)
            g.lineStyle(2, C.silverDark, 1)
            for (let k = -2; k <= 2; k++) g.lineBetween(196 + k * 12, 44, 196 + k * 12, 96)
            g.lineBetween(168, 70, 224, 70)
            poly(
                g,
                [
                    { x: 86, y: 216 },
                    { x: 112, y: 170 },
                    { x: 60, y: 160 },
                ],
                C.orange,
                4,
            )
            poly(
                g,
                [
                    { x: 150, y: 60 },
                    { x: 172, y: 130 },
                    { x: 118, y: 196 },
                    { x: 74, y: 160 },
                    { x: 112, y: 92 },
                ],
                C.white,
                5,
            )
            disc(g, 132, 116, 16, C.cyan, 4)
            poly(
                g,
                [
                    { x: 150, y: 60 },
                    { x: 172, y: 130 },
                    { x: 160, y: 72 },
                ],
                C.pink,
                4,
            )
            break
        case 5:
            for (let k = 0; k < 3; k++) box(g, 40 + k * 60, 196, 56, 46, 4, C.paper, 4)
            arc(g, 128, 200, 100, 190, 350, 7, C.pink)
            ;[
                [96, 160],
                [150, 150],
            ].forEach(([x, y]) => {
                box(g, x - 26, y - 14, 52, 28, { tl: 14, tr: 14, bl: 6, br: 6 }, C.white)
                g.fillStyle(C.cyan, 1)
                g.fillRect(x - 24, y + 6, 48, 6)
            })
            break
        case 6:
            oval(g, 128, 210, 200, 60, C.mintDark)
            oval(g, 128, 160, 140, 90, C.mint)
            disc(g, 92, 112, 22, C.mint)
            disc(g, 164, 112, 22, C.mint)
            disc(g, 92, 110, 10, C.eye, 0)
            disc(g, 164, 110, 10, C.eye, 0)
            oval(g, 128, 166, 70, 40, C.redDark, 4)
            noteMark(g, 210, 70, 1.1, C.indigo)
            break
        case 7:
            stroke(
                g,
                [
                    { x: 10, y: 196 },
                    { x: 246, y: 170 },
                ],
                12,
                C.indigo,
            )
            disc(g, 120, 140, 50, C.lemon)
            poly(
                g,
                [
                    { x: 166, y: 130 },
                    { x: 196, y: 140 },
                    { x: 166, y: 150 },
                ],
                C.orange,
                4,
            )
            disc(g, 142, 124, 7, C.eye, 0)
            oval(g, 100, 150, 46, 26, C.lemonLight, 4)
            noteMark(g, 210, 90, 0.9, C.indigo)
            noteMark(g, 226, 50, 0.8, C.indigo)
            break
    }
}

// ───────────────────────────────────────────── interface

function ui(g: G, i: number) {
    const c = 128
    switch (i) {
        case 0:
            box(g, 14, 93, 228, 70, 35, 0xdcdcea, 6)
            box(g, 30, 100, 196, 22, 11, C.white, 0)
            noteMark(g, c - 8, c + 18, 1.2, C.silverDark)
            break
        case 1: {
            const pts: P[] = []
            for (let k = 0; k < 16; k++) {
                const a = (k / 16) * Math.PI * 2 - Math.PI / 2
                const r = k % 2 ? 40 : 108
                pts.push({ x: c + Math.cos(a) * r, y: c + Math.sin(a) * r })
            }
            poly(g, pts, C.white, 5)
            star4(g, 40, 50, 18, C.white, 3)
            star4(g, 214, 196, 16, C.white, 3)
            break
        }
        case 2:
            box(g, 8, 70, 240, 112, 6, C.paper, 5)
            g.fillStyle(C.paperLine, 1)
            for (let y = 112; y < 176; y += 24) g.fillRect(24, y, 208, 3)
            g.fillStyle(C.tape, 0.95)
            g.fillRect(98, 58, 60, 26)
            break
        case 3:
            g.fillStyle(0xd8ecff, 0.5)
            g.fillRoundedRect(10, 10, 236, 236, 10)
            g.lineStyle(6, INK, 1)
            g.strokeRoundedRect(10, 10, 236, 236, 10)
            g.fillStyle(C.cyanLight, 1)
            g.fillRect(13, 13, 14, 230)
            g.lineStyle(4, INK, 1)
            g.lineBetween(27, 12, 27, 244)
            g.lineStyle(5, C.white, 0.8)
            g.lineBetween(160, 30, 220, 90)
            g.lineBetween(184, 30, 226, 72)
            break
        case 4:
            disc(g, c, c, 118, C.silver, 6)
            ;[C.pinkLight, C.lemonLight, C.mintLight, C.cyanLight].forEach((tone, k) => {
                g.lineStyle(10, tone, 0.8)
                g.strokeCircle(c, c, 100 - k * 12)
            })
            disc(g, c, c, 118 * 0.36 + 4, C.white, 4)
            disc(g, c, c, 16, C.silverDark, 3)
            break
        case 5:
            poly(
                g,
                [
                    { x: c, y: c + 86 },
                    { x: c - 92, y: c - 6 },
                    { x: c - 84, y: c - 66 },
                    { x: c - 36, y: c - 82 },
                    { x: c, y: c - 42 },
                    { x: c + 36, y: c - 82 },
                    { x: c + 84, y: c - 66 },
                    { x: c + 92, y: c - 6 },
                ],
                C.pink,
                7,
            )
            g.fillStyle(C.white, 0.7)
            g.fillEllipse(c - 50, c - 44, 30, 20)
            break
        case 6:
            g.lineStyle(30, C.pink, 1)
            g.strokeCircle(c, c, 104)
            g.lineStyle(10, C.violet, 1)
            g.strokeCircle(c, c, 86)
            g.lineStyle(5, INK, 1)
            g.strokeCircle(c, c, 120)
            g.strokeCircle(c, c, 81)
            disc(g, c + 82, c - 82, 16, C.lamp, 5)
            star4(g, 30, 200, 16, C.lemon)
            star4(g, 220, 214, 12, C.cyan)
            break
        case 7:
            star4(g, c, c, 100, C.white, 6)
            break
    }
}

// ───────────────────────────────────────────── as capas do N2 e do N3

function rainbow(g: G, x: number, y: number, r: number, width: number) {
    ;[C.red, C.orange, C.lemon, C.mint, C.cyan, C.violet].forEach((tone, k) => arc(g, x, y, r - k * width, 180, 360, width + 1, tone))
}

function burst(g: G, x: number, y: number, tone: number) {
    for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        stroke(
            g,
            [
                { x: x + Math.cos(a) * 8, y: y + Math.sin(a) * 8 },
                { x: x + Math.cos(a) * 26, y: y + Math.sin(a) * 26 },
            ],
            5,
            tone,
        )
    }
}

function cover2(g: G, i: number) {
    const bg = [C.orange, C.cyan, C.pink, C.indigo, C.lemon, C.mint, 0x2f8a4e, C.violetLight, C.violet, C.indigoDark, 0xffc6e4, C.indigo][i]
    g.fillStyle(bg, 1)
    g.fillRect(0, 0, 256, 256)
    g.lineStyle(4, INK, 1)
    g.strokeRect(2, 2, 252, 252)
    switch (i) {
        case 0:
            ;[
                [86, 110],
                [118, 96],
                [150, 104],
                [176, 112],
                [104, 58],
                [160, 50],
                [132, 30],
            ].forEach(([x, y]) => disc(g, x, y, 18, C.lemonLight, 4))
            poly(
                g,
                [
                    { x: 70, y: 120 },
                    { x: 186, y: 120 },
                    { x: 170, y: 236 },
                    { x: 86, y: 236 },
                ],
                C.white,
            )
            g.fillStyle(C.red, 1)
            ;[0, 1, 2].forEach(k => g.fillRect(92 + k * 28, 124, 14, 108))
            break
        case 1:
            stroke(
                g,
                [
                    { x: 92, y: 140 },
                    { x: 54, y: 96 },
                ],
                12,
                C.silverDark,
            )
            stroke(
                g,
                [
                    { x: 164, y: 140 },
                    { x: 196, y: 172 },
                ],
                12,
                C.silverDark,
            )
            box(g, 98, 196, 22, 38, 4, C.silverDark)
            box(g, 136, 196, 22, 38, 4, C.silverDark)
            box(g, 92, 120, 72, 80, 14, C.silver)
            disc(g, 128, 82, 40, C.silver)
            disc(g, 112, 80, 9, C.cyanDark, 3)
            disc(g, 144, 80, 9, C.cyanDark, 3)
            stroke(
                g,
                [
                    { x: 128, y: 42 },
                    { x: 128, y: 24 },
                ],
                5,
            )
            disc(g, 128, 22, 8, C.pink, 3)
            break
        case 2:
            ;[70, 186].forEach(x => {
                disc(g, x, 168, 44, C.white)
                disc(g, x, 168, 10, C.ink, 0)
            })
            stroke(
                g,
                [
                    { x: 70, y: 168 },
                    { x: 116, y: 106 },
                    { x: 166, y: 106 },
                    { x: 186, y: 168 },
                ],
                8,
                C.cyan,
            )
            stroke(
                g,
                [
                    { x: 116, y: 106 },
                    { x: 128, y: 168 },
                    { x: 70, y: 168 },
                ],
                8,
                C.cyan,
            )
            noteMark(g, 50, 90, 1, C.white)
            noteMark(g, 204, 80, 0.9, C.white)
            break
        case 3:
            disc(g, 168, 92, 62, C.lemonLight)
            g.fillStyle(C.space, 1)
            g.fillRect(4, 214, 248, 38)
            ;[24, 98, 172].forEach((x, k) => {
                box(g, x, 168, 64, 46, 8, [C.red, C.cyan, C.lemon][k])
                disc(g, x + 16, 216, 10, C.ink, 3)
                disc(g, x + 48, 216, 10, C.ink, 3)
            })
            box(g, 196, 138, 28, 30, 4, C.red)
            break
        case 4:
            for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2
                disc(g, 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92, 18, [C.pink, C.white, C.violetLight, C.cyanLight][k % 4])
                disc(g, 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92, 7, C.orange, 2)
            }
            disc(g, 128, 128, 52, C.orange)
            arc(g, 128, 132, 22, 20, 160, 5)
            disc(g, 112, 116, 6, C.eye, 0)
            disc(g, 144, 116, 6, C.eye, 0)
            break
        case 5:
            ;[62, 194].forEach(x => {
                poly(
                    g,
                    [
                        { x: x - 22, y: 232 },
                        { x, y: 180 },
                        { x: x + 22, y: 232 },
                    ],
                    C.orange,
                )
                g.fillStyle(C.white, 1)
                g.fillRect(x - 10, 206, 20, 6)
            })
            g.save()
            g.translateCanvas(128, 110)
            g.rotateCanvas(-0.3)
            disc(g, -52, 22, 12, C.white)
            disc(g, 52, 22, 12, C.white)
            box(g, -84, -14, 168, 28, 14, C.pink)
            g.restore()
            break
        case 6:
            stroke(
                g,
                [
                    { x: 10, y: 190 },
                    { x: 246, y: 170 },
                ],
                12,
                0x7a4a2a,
            )
            ;[
                [36, 210],
                [216, 206],
                [52, 58],
            ].forEach(([x, y]) => oval(g, x, y, 80, 40, C.mint))
            poly(
                g,
                [
                    { x: 116, y: 170 },
                    { x: 128, y: 246 },
                    { x: 140, y: 170 },
                ],
                C.lemon,
                4,
            )
            oval(g, 128, 120, 70, 110, C.red)
            disc(g, 128, 70, 30, C.red)
            poly(
                g,
                [
                    { x: 152, y: 64 },
                    { x: 178, y: 76 },
                    { x: 152, y: 88 },
                ],
                C.lemon,
                4,
            )
            disc(g, 134, 64, 6, C.eye, 0)
            poly(
                g,
                [
                    { x: 102, y: 108 },
                    { x: 72, y: 168 },
                    { x: 120, y: 158 },
                ],
                C.cyan,
                4,
            )
            break
        case 7:
            ;[86, 170].forEach((x, k) => {
                stroke(
                    g,
                    [
                        { x: x - 20, y: 190 + k * 12 },
                        { x: x - 46, y: 242 },
                    ],
                    6,
                    C.pink,
                )
                stroke(
                    g,
                    [
                        { x: x + 20, y: 190 + k * 12 },
                        { x: x + 46, y: 242 },
                    ],
                    6,
                    C.pink,
                )
                oval(g, x, 140 + k * 12, 64, 120, C.pinkLight)
                oval(g, x, 120 + k * 12, 36, 52, C.cream, 3)
            })
            star4(g, 40, 50, 14, C.white)
            star4(g, 214, 44, 12, C.white)
            break
        case 8:
            rainbow(g, 128, 236, 120, 12)
            for (let k = 0; k < 12; k++) star4(g, 20 + ((k * 61) % 220), 18 + ((k * 37) % 110), 6 + (k % 3) * 3, k % 2 ? C.lemon : C.white, 0)
            for (let k = 0; k < 4; k++) box(g, 84 + k * 22, 196, 14, 40, 4, C.white, 4)
            stroke(
                g,
                [
                    { x: 70, y: 166 },
                    { x: 34, y: 190 },
                ],
                12,
                C.violetLight,
            )
            oval(g, 128, 176, 120, 64, C.white)
            disc(g, 182, 136, 30, C.white)
            poly(
                g,
                [
                    { x: 184, y: 110 },
                    { x: 196, y: 62 },
                    { x: 204, y: 112 },
                ],
                C.lemon,
                4,
            )
            disc(g, 190, 132, 5, C.eye, 0)
            stroke(
                g,
                [
                    { x: 162, y: 112 },
                    { x: 142, y: 146 },
                    { x: 158, y: 176 },
                ],
                12,
                C.pink,
            )
            break
        case 9:
            burst(g, 50, 50, C.pink)
            burst(g, 210, 40, C.lemon)
            burst(g, 206, 120, C.cyan)
            burst(g, 40, 140, C.mint)
            poly(
                g,
                [
                    { x: 80, y: 150 },
                    { x: 40, y: 104 },
                    { x: 70, y: 184 },
                ],
                C.mintDark,
                4,
            )
            oval(g, 120, 184, 110, 96, C.mint)
            disc(g, 120, 112, 42, C.mint)
            disc(g, 106, 106, 8, C.eye, 0)
            disc(g, 134, 106, 8, C.eye, 0)
            poly(
                g,
                [
                    { x: 102, y: 76 },
                    { x: 108, y: 52 },
                    { x: 118, y: 72 },
                ],
                C.lemon,
                3,
            )
            poly(
                g,
                [
                    { x: 124, y: 72 },
                    { x: 134, y: 52 },
                    { x: 140, y: 78 },
                ],
                C.lemon,
                3,
            )
            stroke(
                g,
                [
                    { x: 150, y: 200 },
                    { x: 236, y: 140 },
                ],
                8,
                0x7a4a2a,
            )
            oval(g, 156, 202, 70, 52, C.red)
            break
        case 10:
            rainbow(g, 128, 150, 118, 10)
            box(g, 50, 140, 156, 100, 6, C.pinkLight)
            ;[50, 108, 166].forEach(x => {
                box(g, x, 100, 40, 60, 4, C.lemonLight)
                poly(
                    g,
                    [
                        { x: x - 4, y: 100 },
                        { x: x + 20, y: 66 },
                        { x: x + 44, y: 100 },
                    ],
                    C.pink,
                    4,
                )
            })
            box(g, 108, 196, 40, 44, { tl: 20, tr: 20, bl: 0, br: 0 }, C.violet)
            ;[24, 232].forEach(x => {
                stroke(
                    g,
                    [
                        { x, y: 246 },
                        { x, y: 186 },
                    ],
                    5,
                    C.white,
                )
                disc(g, x, 172, 18, C.cyan)
            })
            break
    }
}

// ───────────────────────────────────────────── as batidas e o dono desconhecido

function ui2(g: G, i: number) {
    const c = 128
    switch (i) {
        case 0:
            disc(g, c, c, 104, C.pink, 6)
            disc(g, c, c, 80, C.cream, 5)
            disc(g, c, c, 18, C.pinkLight, 4)
            for (let k = 0; k < 6; k++) {
                const a = (k / 6) * Math.PI * 2
                disc(g, c + Math.cos(a) * 92, c + Math.sin(a) * 92, 7, C.silver, 3)
            }
            break
        case 1:
            stroke(
                g,
                [
                    { x: 50, y: 30 },
                    { x: 170, y: 120 },
                ],
                12,
                0xd9a066,
            )
            stroke(
                g,
                [
                    { x: 206, y: 30 },
                    { x: 86, y: 120 },
                ],
                12,
                0xd9a066,
            )
            box(g, 30, 124, 196, 90, 20, C.cyan, 6)
            oval(g, c, 124, 196, 46, C.cream, 6)
            break
        case 2:
            ;[-1, 1].forEach(s => {
                g.save()
                g.translateCanvas(c + s * 26, c + 20)
                g.rotateCanvas(s * 0.35)
                oval(g, 0, 0, 74, 132, 0xf2c8a8, 6)
                g.restore()
            })
            ;[-1, 0, 1].forEach(k =>
                stroke(
                    g,
                    [
                        { x: c + k * 34, y: 52 + Math.abs(k) * 10 },
                        { x: c + k * 50, y: 18 + Math.abs(k) * 10 },
                    ],
                    7,
                ),
            )
            break
        case 3:
            stroke(
                g,
                [
                    { x: c, y: 110 },
                    { x: c, y: 236 },
                ],
                10,
                C.silverDark,
            )
            ;[-1, 1].forEach(s =>
                stroke(
                    g,
                    [
                        { x: c, y: 226 },
                        { x: c + s * 50, y: 248 },
                    ],
                    8,
                    C.silverDark,
                ),
            )
            oval(g, c, 100, 210, 54, C.lemon, 6)
            oval(g, c, 94, 60, 18, C.orange, 4)
            ;[-1, 1].forEach(s =>
                stroke(
                    g,
                    [
                        { x: c + s * 108, y: 40 },
                        { x: c + s * 88, y: 62 },
                    ],
                    7,
                ),
            )
            break
        case 4:
            box(g, 30, 172, 196, 84, { tl: 80, tr: 80, bl: 0, br: 0 }, C.indigoDark, 6)
            disc(g, c, 96, 74, C.indigoDark, 6)
            arc(g, c, 76, 26, 180, 420, 14, C.white)
            stroke(
                g,
                [
                    { x: c + 4, y: 100 },
                    { x: c, y: 122 },
                ],
                14,
                C.white,
            )
            disc(g, c, 146, 10, C.white, 0)
            break
    }
}
