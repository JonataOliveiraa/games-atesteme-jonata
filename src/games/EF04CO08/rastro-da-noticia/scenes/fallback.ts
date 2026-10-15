import Phaser from 'phaser'
import { FACADE_SHEET, HERO_SHEET, LIA_SHEET, LOGO_SHEET, PATIO_KEY, STREET_KEY, UI_SHEET, type Sheet } from '../data/files'
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
    ;(scene.textures.get(sheet.key).customData as { baked?: boolean }).baked = true
}

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, HERO_SHEET, 5, (g, i) => kidCell(g, DETECTIVE, i))
    bakeSheet(scene, LIA_SHEET, 5, (g, i) => kidCell(g, LIA, i))
    bakeSheet(scene, FACADE_SHEET, 6, facade)
    bakeSheet(scene, LOGO_SHEET, 5, logo)
    bakeSheet(scene, UI_SHEET, 6, ui)
    if (!scene.textures.exists(STREET_KEY)) {
        lw = 4
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        street(g)
        g.generateTexture(STREET_KEY, 1280, 720)
        g.destroy()
    }
    if (!scene.textures.exists(PATIO_KEY)) {
        lw = 5
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        patio(g)
        g.generateTexture(PATIO_KEY, 1280, 720)
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

function rng(seed: number) {
    let s = seed
    return () => {
        s |= 0
        s = (s + 0x6d2b79f5) | 0
        let t = Math.imul(s ^ (s >>> 15), 1 | s)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// ───────────────────────────────────────────── crianças

interface Kid {
    skin: number
    skinDark: number
    hair: number
    hairDark: number
    top: number
    topDark: number
    bottom: number
    bottomDark: number
    lace: number
    detective: boolean
}

const DETECTIVE: Kid = {
    skin: C.skinBrown,
    skinDark: C.skinBrownDark,
    hair: C.hairBlack,
    hairDark: 0x1a1620,
    top: C.vest,
    topDark: C.vestDark,
    bottom: C.shorts,
    bottomDark: C.shortsDark,
    lace: C.vest,
    detective: true,
}

const LIA: Kid = {
    skin: C.skinLight,
    skinDark: C.skinLightDark,
    hair: C.hairBrown,
    hairDark: 0x432a1f,
    top: C.hoodie,
    topDark: C.hoodieDark,
    bottom: C.jeans,
    bottomDark: C.jeansDark,
    lace: C.pink,
    detective: false,
}

type Step = 'idle' | 'a' | 'pa' | 'b' | 'pb'

interface Legs {
    near: P[]
    far: P[]
    lift: number
}

const HIP = { x: 158, y: 316 }

function legsFor(step: Step): Legs {
    const hip = (dy: number) => ({ x: HIP.x, y: HIP.y + dy })
    if (step === 'a')
        return { near: [hip(0), { x: 182, y: 348 }, { x: 196, y: 374 }], far: [hip(0), { x: 136, y: 348 }, { x: 118, y: 368 }], lift: 0 }
    if (step === 'b')
        return { near: [hip(0), { x: 136, y: 348 }, { x: 118, y: 368 }], far: [hip(0), { x: 182, y: 348 }, { x: 196, y: 374 }], lift: 0 }
    if (step === 'pa')
        return { near: [hip(-6), { x: 160, y: 346 }, { x: 160, y: 376 }], far: [hip(-6), { x: 180, y: 336 }, { x: 160, y: 352 }], lift: -6 }
    if (step === 'pb')
        return { near: [hip(-6), { x: 180, y: 336 }, { x: 160, y: 352 }], far: [hip(-6), { x: 160, y: 346 }, { x: 160, y: 376 }], lift: -6 }
    return { near: [hip(0), { x: 168, y: 346 }, { x: 170, y: 376 }], far: [hip(0), { x: 150, y: 346 }, { x: 148, y: 376 }], lift: 0 }
}

function shoe(g: G, kid: Kid, ankle: P, dark: boolean) {
    oval(g, ankle.x + 10, ankle.y + 10, 52, 28, dark ? C.shoeDark : C.shoe)
    g.fillStyle(kid.lace, 1)
    g.fillRoundedRect(ankle.x + 2, ankle.y + 1, 16, 6, 3)
}

function leg(g: G, kid: Kid, pts: P[], dark: boolean) {
    limb(g, pts, 24, dark ? kid.skinDark : kid.skin)
    shoe(g, kid, pts[pts.length - 1], dark)
}

function handProp(g: G, kid: Kid, hand: P, low: boolean) {
    if (kid.detective) {
        const ring = low ? { x: hand.x + 18, y: hand.y + 40 } : { x: hand.x + 26, y: hand.y - 26 }
        limb(g, [hand, ring], 8, C.wood)
        g.fillStyle(C.glass, 0.9)
        g.fillCircle(ring.x, ring.y, 22)
        g.lineStyle(8, C.woodDark, 1)
        g.strokeCircle(ring.x, ring.y, 22)
        g.lineStyle(lw - 1, INK, 1)
        g.strokeCircle(ring.x, ring.y, 26)
        sparkle(g, ring.x - 8, ring.y - 8, 6)
    } else {
        box(g, hand.x - 2, hand.y - 30, 24, 38, 6, C.phone)
        g.fillStyle(C.screen, 1)
        g.fillRoundedRect(hand.x + 2, hand.y - 25, 16, 26, 3)
    }
    disc(g, hand.x, hand.y, 12, kid.skin)
}

function sideTorso(g: G, kid: Kid, dy: number) {
    if (kid.detective) {
        box(g, 128, 232 + dy, 64, 90, 18, C.shirt)
        box(g, 128, 236 + dy, 40, 84, { tl: 16, tr: 4, bl: 16, br: 4 }, kid.top)
    } else {
        disc(g, 134, 244 + dy, 22, kid.topDark)
        box(g, 126, 232 + dy, 68, 94, 20, kid.top)
        g.fillStyle(C.pinkDark, 1)
        g.fillCircle(176, 268 + dy, 6)
        g.fillCircle(184, 268 + dy, 6)
        g.fillTriangle(170, 270 + dy, 190, 270 + dy, 180, 282 + dy)
    }
    box(g, 124, 300 + dy, 70, 34, 12, kid.bottom)
}

function scarfSide(g: G, dy: number) {
    poly(g, [{ x: 136, y: 228 + dy }, { x: 104, y: 262 + dy }, { x: 92, y: 290 + dy }, { x: 116, y: 276 + dy }, { x: 146, y: 244 + dy }], C.scarfDark)
    box(g, 126, 218 + dy, 80, 24, 12, C.scarf)
}

function headSide(g: G, kid: Kid, dy: number) {
    const cx = 166
    const cy = 150 + dy
    if (kid.detective) {
        ;[
            [118, 152, 34],
            [126, 116, 38],
            [150, 92, 38],
            [186, 90, 34],
            [114, 186, 26],
        ].forEach(([x, y, r]) => disc(g, x, y + dy, r, kid.hair))
    } else {
        ;[
            [120, 150, 44],
            [126, 196, 30],
            [150, 108, 46],
        ].forEach(([x, y, r]) => disc(g, x, y + dy, r, kid.hair))
        disc(g, 118, 74 + dy, 32, kid.hair)
        disc(g, 176, 58 + dy, 30, kid.hair)
    }
    disc(g, cx, cy, 76, kid.skin)
    if (kid.detective) {
        ;[
            [140, 94, 24],
            [168, 82, 24],
            [200, 90, 20],
        ].forEach(([x, y, r]) => disc(g, x, y + dy, r, kid.hair))
        poly(g, ellipsePts(166, 102 + dy, 84, 58, 180, 360), C.cap)
        g.fillStyle(C.capDark, 1)
        g.fillRect(84, 98 + dy, 164, 8)
        oval(g, 238, 104 + dy, 78, 18, C.capDark)
        disc(g, 166, 46 + dy, 7, C.capDark)
    } else {
        poly(
            g,
            [
                { x: 112, y: 120 + dy },
                { x: 150, y: 76 + dy },
                { x: 214, y: 84 + dy },
                { x: 240, y: 128 + dy },
                { x: 204, y: 116 + dy },
                { x: 184, y: 134 + dy },
                { x: 170, y: 112 + dy },
                { x: 140, y: 138 + dy },
            ],
            kid.hair,
        )
    }
    oval(g, 140, cy + 14, 24, 32, kid.skin)
    g.fillStyle(kid.skinDark, 1)
    g.fillEllipse(140, cy + 14, 10, 16)
    oval(g, 204, cy + 6, 24, 34, C.eye, 0)
    g.fillStyle(C.white, 1)
    g.fillCircle(208, cy - 2, 6)
    g.fillCircle(201, cy + 14, 3)
    g.fillStyle(C.cheek, 0.7)
    g.fillEllipse(200, cy + 38, 26, 14)
    arcLine(g, 224, cy + 40, 10, 20, 120, 4)
    arcLine(g, 202, cy - 20, 14, 220, 300, 4)
}

function sideKid(g: G, kid: Kid, step: Step) {
    const legs = legsFor(step)
    const dy = legs.lift
    const swing = step === 'a' ? -1 : step === 'b' ? 1 : 0
    const shoulder = { x: 160, y: 250 + dy }
    const farHand = { x: 160 - swing * 30, y: 304 + dy - Math.abs(swing) * 6 }
    const nearHand = { x: 162 + swing * 34, y: 306 + dy - Math.abs(swing) * 6 }
    limb(g, [shoulder, farHand], 20, kid.topDark)
    disc(g, farHand.x, farHand.y, 11, kid.skinDark)
    leg(g, kid, legs.far, true)
    sideTorso(g, kid, dy)
    leg(g, kid, legs.near, false)
    if (kid.detective) scarfSide(g, dy)
    headSide(g, kid, dy)
    limb(g, [shoulder, nearHand], 22, kid.top)
    handProp(g, kid, nearHand, true)
}

function headFront(g: G, kid: Kid, mood: 'joy' | 'oops' | 'look', dy = 0) {
    const cx = 160
    const cy = 152 + dy
    if (kid.detective) {
        ;[
            [96, 140, 30],
            [224, 140, 30],
            [104, 104, 32],
            [216, 104, 32],
        ].forEach(([x, y, r]) => disc(g, x, y + dy, r, kid.hair))
    } else {
        disc(g, 100, 84 + dy, 32, kid.hair)
        disc(g, 220, 84 + dy, 32, kid.hair)
        ;[
            [96, 160, 36],
            [224, 160, 36],
            [104, 196, 26],
            [216, 196, 26],
        ].forEach(([x, y, r]) => disc(g, x, y + dy, r, kid.hair))
    }
    disc(g, cx, cy, 76, kid.skin)
    if (kid.detective) {
        ;[
            [118, 96, 24],
            [146, 84, 24],
            [176, 84, 24],
            [204, 96, 24],
        ].forEach(([x, y, r]) => disc(g, x, y + dy, r, kid.hair))
        poly(g, ellipsePts(160, 100 + dy, 86, 58, 180, 360), C.cap)
        g.fillStyle(C.capDark, 1)
        g.fillRect(76, 96 + dy, 168, 8)
        oval(g, 160, 104 + dy, 120, 20, C.capDark)
    } else {
        poly(
            g,
            [
                { x: 88, y: 140 + dy },
                { x: 110, y: 92 + dy },
                { x: 160, y: 76 + dy },
                { x: 210, y: 92 + dy },
                { x: 232, y: 140 + dy },
                { x: 200, y: 118 + dy },
                { x: 176, y: 134 + dy },
                { x: 160, y: 112 + dy },
                { x: 144, y: 134 + dy },
                { x: 120, y: 118 + dy },
            ],
            kid.hair,
        )
    }
    if (mood === 'joy') {
        arcLine(g, 130, cy + 12, 14, 200, 340, 5)
        arcLine(g, 190, cy + 12, 14, 200, 340, 5)
        g.fillStyle(C.eye, 1)
        g.slice(160, cy + 36, 18, 0, Math.PI, false)
        g.fillPath()
    } else {
        ;[130, 190].forEach(x => {
            oval(g, x, cy + 8, 24, 34, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(x + 4, cy, 6)
        })
        if (mood === 'oops') {
            arcLine(g, 160, cy + 50, 12, 200, 340, 4)
            oval(g, 232, cy - 30, 14, 22, C.glass, 3)
        } else arcLine(g, 160, cy + 34, 12, 20, 160, 4)
    }
    g.fillStyle(C.cheek, 0.7)
    g.fillEllipse(112, cy + 34, 26, 14)
    g.fillEllipse(208, cy + 34, 26, 14)
}

function frontBody(g: G, kid: Kid, dy = 0) {
    if (kid.detective) {
        box(g, 118, 232 + dy, 84, 90, 20, C.shirt)
        box(g, 118, 236 + dy, 26, 86, { tl: 16, tr: 4, bl: 16, br: 4 }, kid.top)
        box(g, 176, 236 + dy, 26, 86, { tl: 4, tr: 16, bl: 4, br: 16 }, kid.top)
    } else {
        box(g, 114, 232 + dy, 92, 94, 22, kid.top)
        g.fillStyle(C.pinkDark, 1)
        g.fillCircle(154, 268 + dy, 6)
        g.fillCircle(166, 268 + dy, 6)
        g.fillTriangle(148, 270 + dy, 172, 270 + dy, 160, 284 + dy)
    }
    box(g, 116, 300 + dy, 88, 34, 12, kid.bottom)
    if (kid.detective) box(g, 112, 218 + dy, 96, 24, 12, C.scarf)
}

function frontLegs(g: G, kid: Kid, spread: number, dy = 0) {
    leg(g, kid, [{ x: 142, y: 320 + dy }, { x: 142 - spread, y: 376 }], false)
    leg(g, kid, [{ x: 178, y: 320 + dy }, { x: 178 + spread, y: 376 }], false)
}

function kidFront(g: G, kid: Kid, mood: 'cheer' | 'oops' | 'phone') {
    const dy = mood === 'cheer' ? -14 : 0
    frontLegs(g, kid, mood === 'cheer' ? 10 : 2, dy)
    frontBody(g, kid, dy)
    if (mood === 'cheer') {
        limb(g, [{ x: 120, y: 246 + dy }, { x: 92, y: 196 + dy }, { x: 84, y: 150 + dy }], 22, kid.top)
        limb(g, [{ x: 200, y: 246 + dy }, { x: 228, y: 196 + dy }, { x: 236, y: 150 + dy }], 22, kid.top)
        disc(g, 236, 150 + dy, 12, kid.skin)
        if (kid.detective) handProp(g, kid, { x: 84, y: 150 + dy }, false)
        else {
            disc(g, 84, 150 + dy, 12, kid.skin)
            box(g, 220, 112 + dy, 24, 38, 6, C.phone)
        }
    } else if (mood === 'oops') {
        limb(g, [{ x: 120, y: 248 }, { x: 98, y: 222 }, { x: 108, y: 186 }], 22, kid.top)
        disc(g, 108, 186, 12, kid.skin)
        if (kid.detective) {
            limb(g, [{ x: 200, y: 248 }, { x: 222, y: 222 }, { x: 212, y: 186 }], 22, kid.top)
            disc(g, 212, 186, 12, kid.skin)
        } else {
            limb(g, [{ x: 200, y: 248 }, { x: 220, y: 286 }], 22, kid.top)
            handProp(g, kid, { x: 222, y: 294 }, true)
        }
    } else {
        limb(g, [{ x: 120, y: 248 }, { x: 132, y: 290 }, { x: 150, y: 288 }], 20, kid.top)
        limb(g, [{ x: 200, y: 248 }, { x: 188, y: 290 }, { x: 170, y: 288 }], 20, kid.top)
        box(g, 140, 252, 40, 60, 8, C.phone)
        g.fillStyle(C.screen, 1)
        g.fillRoundedRect(146, 258, 28, 44, 4)
        disc(g, 148, 292, 11, kid.skin)
        disc(g, 172, 292, 11, kid.skin)
    }
    headFront(g, kid, mood === 'cheer' ? 'joy' : mood === 'oops' ? 'oops' : 'look', dy)
}

function kidBack(g: G, kid: Kid) {
    frontLegs(g, kid, 2)
    box(g, 116, 300, 88, 34, 12, kid.bottom)
    box(g, 118, 232, 84, 90, 20, kid.top)
    limb(g, [{ x: 120, y: 248 }, { x: 108, y: 300 }], 22, kid.top)
    disc(g, 108, 304, 12, kid.skin)
    limb(g, [{ x: 200, y: 246 }, { x: 226, y: 182 }, { x: 236, y: 118 }], 22, kid.top)
    box(g, 112, 218, 96, 24, 12, C.scarf)
    ;[
        [96, 150, 32],
        [224, 150, 32],
        [110, 110, 34],
        [210, 110, 34],
        [160, 168, 62],
        [128, 190, 30],
        [192, 190, 30],
    ].forEach(([x, y, r]) => disc(g, x, y, r, kid.hair))
    poly(g, ellipsePts(160, 104, 86, 60, 180, 360), C.cap)
    g.fillStyle(C.capDark, 1)
    g.fillRect(76, 100, 168, 8)
    handProp(g, kid, { x: 236, y: 118 }, false)
}

function kidCell(g: G, kid: Kid, i: number) {
    const steps: Step[] = ['idle', 'a', 'pa', 'b', 'pb']
    if (i < 5) return sideKid(g, kid, steps[i])
    if (i === 5) return kid.detective ? kidBack(g, kid) : kidFront(g, kid, 'phone')
    if (i === 6) return kidFront(g, kid, 'cheer')
    kidFront(g, kid, 'oops')
}

// ───────────────────────────────────────────── fachadas

const TONES = [
    [C.sky2, C.sky2Dark],
    [C.pink, C.pinkDark],
    [C.mint, C.mintDark],
    [C.coral, C.coralDark],
    [C.grey, C.greyDark],
    [C.butter, C.butterDark],
]

function screenParts(g: G, dark: number) {
    box(g, 70, 56, 340, 48, 14, C.cream)
    box(g, 34, 108, 412, 236, 18, C.screenFrame)
    g.fillStyle(C.screen, 1)
    g.fillRoundedRect(40, 114, 400, 224, 12)
    box(g, 196, 404, 88, 116, { tl: 40, tr: 40, bl: 0, br: 0 }, dark)
    disc(g, 264, 466, 6, C.butter, 3)
}

function sideWindows(g: G, round: boolean, fill: number) {
    ;[115, 365].forEach(x => {
        if (round) disc(g, x, 430, 32, fill)
        else box(g, x - 46, 392, 92, 72, 10, fill)
    })
}

function facade(g: G, i: number) {
    const [tone, dark] = TONES[i]
    if (i === 2) {
        poly(g, [{ x: 44, y: 470 }, { x: 14, y: 516 }, { x: 110, y: 496 }], tone)
        box(g, 24, 30, 432, 486, 60, tone)
        sideWindows(g, true, C.glass)
        screenParts(g, dark)
        box(g, 14, 506, 452, 14, 6, dark)
        return
    }
    if (i === 4) {
        box(g, 56, 60, 368, 460, 16, tone)
        poly(g, [...ellipsePts(240, 92, 222, 86, 180, 360)], dark)
        ;[110, 370].forEach(x => {
            box(g, x - 40, 384, 80, 80, 8, dark)
            g.lineStyle(4, INK, 0.5)
            for (let y = 398; y < 460; y += 12) g.lineBetween(x - 34, y, x + 34, y)
        })
        screenParts(g, dark)
        box(g, 48, 506, 384, 14, 6, dark)
        return
    }
    box(g, 24, 44, 432, 476, 18, tone)
    if (i === 0) {
        box(g, 8, 30, 464, 28, 8, C.cream)
        oval(g, 240, 16, 130, 26, C.paper)
        g.lineStyle(3, INK, 0.5)
        g.lineBetween(190, 12, 290, 12)
        g.lineBetween(190, 20, 290, 20)
        sideWindows(g, false, C.glass)
        screenParts(g, dark)
        box(g, 172, 372, 18, 148, 6, C.cream)
        box(g, 290, 372, 18, 148, 6, C.cream)
        for (let k = 0; k < 5; k++) {
            g.fillStyle(k % 2 ? C.white : dark, 1)
            g.fillRect(190 + k * 20, 380, 20, 22)
        }
        g.lineStyle(lw, INK, 1)
        g.strokeRect(190, 380, 100, 22)
    } else if (i === 1) {
        for (let x = 36; x <= 444; x += 34) disc(g, x, 48, 24, dark)
        sideWindows(g, false, C.glass)
        ;[115, 365].forEach(x => {
            box(g, x - 52, 462, 104, 22, 8, C.wood)
            ;[-30, 0, 30].forEach((dx, k) => disc(g, x + dx, 456, 10, [C.butter, C.white, C.coral][k], 3))
        })
        screenParts(g, dark)
    } else if (i === 3) {
        g.lineStyle(lw, INK, 1)
        g.lineBetween(380, 44, 410, 6)
        disc(g, 410, 8, 8, C.cream)
        g.fillStyle(C.cream, 1)
        g.slice(110, 40, 34, Math.PI, 0, false)
        g.fillPath()
        g.lineStyle(lw, INK, 1)
        g.beginPath()
        g.arc(110, 40, 34, Math.PI, 0, false)
        g.closePath()
        g.strokePath()
        disc(g, 432, 80, 12, 0xff5a5a)
        sideWindows(g, false, C.glass)
        screenParts(g, dark)
    } else {
        poly(g, [{ x: 196, y: 26 }, { x: 240, y: 2 }, { x: 284, y: 26 }], C.coral)
        box(g, 206, 24, 68, 32, 6, tone)
        disc(g, 240, 40, 9, C.butterDark, 3)
        g.lineStyle(lw, INK, 1)
        g.lineBetween(430, 44, 430, 4)
        poly(g, [{ x: 430, y: 4 }, { x: 462, y: 12 }, { x: 430, y: 22 }], C.coral)
        sideWindows(g, false, C.glass)
        screenParts(g, dark)
        box(g, 176, 502, 128, 18, 4, C.cream)
    }
    box(g, 16, 506, 448, 14, 6, dark)
}

// ───────────────────────────────────────────── logos

function questionMark(g: G, x: number, y: number, s: number, color: number) {
    arcLine(g, x, y - s * 0.4, s * 0.4, 200, 400, s * 0.22, color)
    g.lineStyle(s * 0.22, color, 1)
    g.lineBetween(x, y - s * 0.02, x, y + s * 0.2)
    g.fillStyle(color, 1)
    g.fillCircle(x, y + s * 0.5, s * 0.14)
}

function logo(g: G, i: number) {
    if (i === 0) {
        box(g, 26, 38, 108, 86, 8, C.paper)
        g.fillStyle(C.sky2, 1)
        g.fillRect(36, 50, 40, 30)
        g.lineStyle(5, C.barDark, 1)
        ;[54, 66, 78].forEach(y => g.lineBetween(84, y, 122, y))
        ;[92, 104].forEach(y => g.lineBetween(36, y, 122, y))
        g.lineStyle(lw, INK, 1)
        g.lineBetween(80, 38, 80, 124)
        return
    }
    if (i === 1) {
        g.fillStyle(C.pink, 1)
        g.fillCircle(60, 64, 30)
        g.fillCircle(100, 64, 30)
        g.fillTriangle(32, 76, 128, 76, 80, 132)
        g.lineStyle(lw, INK, 1)
        g.beginPath()
        g.arc(60, 64, 30, Math.PI * 0.75, Math.PI * 1.95, false)
        g.arc(100, 64, 30, Math.PI * 1.05, Math.PI * 0.25, false)
        g.lineTo(80, 132)
        g.closePath()
        g.strokePath()
        poly(g, [{ x: 96, y: 118 }, { x: 132, y: 36 }, { x: 146, y: 42 }, { x: 110, y: 124 }], C.butter)
        poly(g, [{ x: 96, y: 118 }, { x: 110, y: 124 }, { x: 96, y: 136 }], C.cream)
        return
    }
    if (i === 2) {
        poly(g, [{ x: 34, y: 84 }, { x: 24, y: 108 }, { x: 52, y: 92 }], C.mint)
        box(g, 16, 28, 96, 64, 26, C.mint)
        poly(g, [{ x: 126, y: 116 }, { x: 140, y: 138 }, { x: 108, y: 120 }], C.white)
        box(g, 54, 64, 90, 58, 24, C.white)
        ;[78, 98, 118].forEach(x => {
            g.fillStyle(C.inkSoft, 1)
            g.fillCircle(x, 93, 5)
        })
        return
    }
    if (i === 3) {
        box(g, 20, 34, 120, 92, 24, C.coral)
        poly(g, [{ x: 66, y: 56 }, { x: 108, y: 80 }, { x: 66, y: 104 }], C.white, 0)
        return
    }
    if (i === 4) {
        poly(g, ellipsePts(80, 142, 56, 46, 180, 360), C.grey)
        disc(g, 80, 66, 40, C.grey)
        questionMark(g, 80, 66, 46, C.white)
        return
    }
    if (i === 5) {
        box(g, 32, 68, 96, 64, 6, C.butter)
        poly(g, [{ x: 24, y: 72 }, { x: 80, y: 34 }, { x: 136, y: 72 }], C.coral)
        box(g, 68, 96, 24, 36, { tl: 12, tr: 12, bl: 0, br: 0 }, C.butterDark)
        g.lineStyle(4, INK, 1)
        g.lineBetween(80, 34, 80, 12)
        poly(g, [{ x: 80, y: 12 }, { x: 100, y: 18 }, { x: 80, y: 26 }], C.mint, 3)
        return
    }
    if (i === 6) {
        box(g, 50, 18, 60, 124, 16, C.phone)
        g.fillStyle(C.screen, 1)
        g.fillRoundedRect(57, 32, 46, 90, 6)
        disc(g, 80, 132, 4, C.phoneDark, 0)
        return
    }
    poly(g, [{ x: 40, y: 132 }, { x: 54, y: 96 }, { x: 118, y: 30 }, { x: 132, y: 44 }, { x: 66, y: 110 }], C.headerLine)
    poly(g, [{ x: 40, y: 132 }, { x: 54, y: 96 }, { x: 66, y: 110 }], C.butterDark)
}

// ───────────────────────────────────────────── interface

function ui(g: G, i: number) {
    if (i === 0) {
        disc(g, 160, 160, 120, C.cream, 8)
        g.lineStyle(10, C.creamDark, 1)
        g.strokeCircle(160, 166, 104)
        poly(
            g,
            [
                { x: 108, y: 140 },
                { x: 168, y: 140 },
                { x: 168, y: 104 },
                { x: 226, y: 160 },
                { x: 168, y: 216 },
                { x: 168, y: 180 },
                { x: 108, y: 180 },
            ],
            C.accent,
            7,
        )
        return
    }
    if (i === 1) {
        disc(g, 160, 160, 120, C.accent, 8)
        g.lineStyle(10, C.accentDark, 1)
        g.strokeCircle(160, 166, 104)
        g.lineStyle(18, C.white, 1)
        g.strokeCircle(146, 146, 44)
        g.lineStyle(22, C.white, 1)
        g.lineBetween(178, 178, 222, 222)
        return
    }
    if (i === 2) {
        box(g, 10, 110, 300, 100, 50, C.cream, 7)
        g.fillStyle(C.creamDark, 1)
        g.fillRoundedRect(24, 176, 272, 24, 12)
        g.fillStyle(C.white, 0.8)
        g.fillRoundedRect(40, 122, 150, 16, 8)
        return
    }
    if (i === 3) {
        box(g, 90, 30, 140, 260, 28, C.phone, 7)
        g.fillStyle(C.screen, 1)
        g.fillRoundedRect(102, 56, 116, 206, 12)
        g.fillStyle(C.phoneDark, 1)
        g.fillRoundedRect(140, 40, 40, 8, 4)
        return
    }
    if (i === 4) {
        box(g, 96, 150, 120, 110, 30, C.skinLight, 7)
        box(g, 112, 70, 46, 110, 23, C.skinLight, 7)
        g.lineStyle(6, INK, 0.6)
        ;[180, 210, 236].forEach(y => g.lineBetween(150, y, 206, y))
        return
    }
    if (i === 5) {
        ;[110, 144, 178, 212].forEach((x, k) => box(g, x - 16, 60 + Math.abs(k - 1.5) * 12, 32, 120, 16, C.skinLight, 7))
        box(g, 92, 150, 140, 120, 40, C.skinLight, 7)
        box(g, 60, 168, 70, 34, 17, C.skinLight, 7)
        return
    }
    if (i === 6) {
        poly(g, [{ x: 40, y: 150 }, { x: 280, y: 90 }, { x: 140, y: 230 }], C.white, 7)
        poly(g, [{ x: 140, y: 230 }, { x: 280, y: 90 }, { x: 150, y: 170 }], C.barDark, 7)
        return
    }
    disc(g, 160, 160, 84, C.paper, 7)
    g.lineStyle(6, C.barDark, 1)
    g.lineBetween(110, 130, 170, 160)
    g.lineBetween(170, 160, 150, 220)
    g.lineBetween(170, 160, 220, 120)
    g.lineBetween(120, 190, 150, 220)
}

// ───────────────────────────────────────────── rua

function street(g: G) {
    const wrap = (x: number, draw: (dx: number) => void) => {
        draw(0)
        if (x < 160) draw(1280)
        if (x > 1120) draw(-1280)
    }
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, 1280, 520)
    for (let k = 0; k < 8; k++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(C.sky),
            Phaser.Display.Color.ValueToColor(C.skyLow),
            7,
            k,
        )
        g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1)
        g.fillRect(0, 300 + k * 30, 1280, 30)
    }
    const r = rng(7)
    let x = 0
    while (x < 1280) {
        const w = 70 + r() * 90
        const h = 110 + r() * 150
        const tone = r() > 0.5 ? C.far : C.farDark
        const bx = x
        wrap(bx, dx => {
            g.fillStyle(tone, 1)
            g.fillRoundedRect(bx + dx, 520 - h, w - 10, h, 8)
            g.fillStyle(C.white, 0.35)
            for (let wy = 520 - h + 18; wy < 500; wy += 30)
                for (let wx = bx + dx + 12; wx < bx + dx + w - 26; wx += 24) g.fillRect(wx, wy, 10, 14)
        })
        x += w
    }
    for (let k = 0; k < 9; k++) {
        const tx = r() * 1280
        const tr = 30 + r() * 26
        wrap(tx, dx => {
            g.fillStyle(C.farTree, 1)
            g.fillCircle(tx + dx, 512 - tr, tr)
            g.fillCircle(tx + dx + tr * 0.8, 520 - tr * 0.7, tr * 0.8)
        })
    }
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 520, 1280, 70)
    for (let bx = 0; bx < 1280; bx += 64) {
        const s = 22 + ((bx * 37) % 13)
        wrap(bx, dx => {
            g.fillStyle(C.bush, 1)
            g.fillCircle(bx + dx + 20, 566, s)
            g.fillCircle(bx + dx + 44, 572, s * 0.8)
        })
    }
    g.fillStyle(C.grassDark, 1)
    g.fillRect(0, 582, 1280, 8)
    g.fillStyle(C.walk, 1)
    g.fillRect(0, 590, 1280, 130)
    for (let row = 0; row < 4; row++) {
        const y = 600 + row * 26
        const shift = row % 2 ? 32 : 0
        for (let cx = -64 + shift; cx < 1280 + 64; cx += 64) {
            g.fillStyle(row % 2 ? C.walkLight : C.walkDark, 0.6)
            g.fillRoundedRect(cx + 4, y, 56, 20, 8)
        }
    }
    g.fillStyle(C.curb, 1)
    g.fillRect(0, 702, 1280, 18)
    g.fillStyle(C.curbDark, 1)
    g.fillRect(0, 700, 1280, 4)
}

// ───────────────────────────────────────────── pátio (o mundo de verdade)

function patio(g: G) {
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, 1280, 720)
    g.fillStyle(C.skyLow, 1)
    g.fillRect(0, 300, 1280, 260)
    box(g, 300, 150, 1100, 430, 18, C.cream, 0)
    g.fillStyle(C.creamDark, 1)
    g.fillRect(300, 150, 1100, 26)
    g.fillRect(300, 470, 1100, 14)
    for (let x = 360; x < 1280; x += 170) {
        g.fillStyle(C.glass, 1)
        g.fillRoundedRect(x, 220, 110, 120, 12)
        g.fillStyle(C.white, 0.6)
        g.fillRect(x + 52, 220, 6, 120)
        g.fillRect(x, 276, 110, 6)
    }
    g.fillStyle(C.butterDark, 0.5)
    g.fillRoundedRect(860, 370, 150, 110, { tl: 60, tr: 60, bl: 0, br: 0 })
    ;[C.coral, C.mint, C.lilac, C.butter, C.sky2].forEach((c, i) => {
        g.fillStyle(c, 0.55)
        g.fillTriangle(380 + i * 120, 186, 440 + i * 120, 186, 410 + i * 120, 214)
    })
    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(130, 330, 44, 260, 12)
    ;[
        [150, 290, 110],
        [80, 330, 80],
        [230, 330, 84],
        [150, 220, 80],
    ].forEach(([x, y, r]) => {
        g.fillStyle(C.grassDark, 1)
        g.fillCircle(x, y, r)
    })
    ;[
        [130, 270, 60],
        [200, 300, 50],
    ].forEach(([x, y, r]) => {
        g.fillStyle(C.grass, 1)
        g.fillCircle(x, y, r)
    })
    g.fillStyle(C.walkDark, 1)
    g.fillRect(0, 560, 1280, 160)
    for (let row = 0; row < 6; row++) {
        const y = 568 + row * 26
        const shift = row % 2 ? 40 : 0
        for (let x = -80 + shift; x < 1360; x += 80) {
            g.fillStyle(row % 2 ? C.walk : C.walkLight, 0.8)
            g.fillRoundedRect(x + 4, y, 72, 20, 6)
        }
    }
    g.fillStyle(C.shadow, 0.08)
    g.fillRect(0, 560, 1280, 10)
}
