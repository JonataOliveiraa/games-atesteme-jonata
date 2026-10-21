import Phaser from 'phaser'
import {
    ANT_SHEET,
    BEE_SHEET,
    BUG_SHEET,
    CHICK_SHEET,
    CREW_SHEET,
    FISH_SHEET,
    FLOWER_SHEET,
    GARDEN_KEY,
    NESTS_KEY,
    OBJECT2_SHEET,
    OBJECT_SHEET,
    PIPA_SHEET,
    SPIDER_SHEET,
    TRAIL_KEY,
    WEB_KEY,
    GLADE_KEY,
    NIGHT_KEY,
    POND_KEY,
    type Sheet,
} from '../data/files'
import { H, W } from '../data/layout'
import { C, COR, GLOW, TONE } from '../data/theme'
import type { Cor, Kind, Tone } from '../types'

type G = Phaser.GameObjects.Graphics
type P = { x: number; y: number }

const INK = C.line
let lw = 5

const pt = (x: number, y: number): P => ({ x, y })

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
    bakeSheet(scene, ANT_SHEET, 5, ant)
    bakeSheet(scene, BEE_SHEET, 5, bee)
    bakeSheet(scene, FLOWER_SHEET, 4, flower)
    bakeSheet(scene, PIPA_SHEET, 5, pipa)
    bakeSheet(scene, OBJECT_SHEET, 5, object)
    bakeImage(scene, TRAIL_KEY, W, H, 4, trail)
    bakeImage(scene, GARDEN_KEY, W, H, 4, garden)
    bakeSheet(scene, CHICK_SHEET, 5, chick)
    bakeSheet(scene, SPIDER_SHEET, 5, spider)
    bakeSheet(scene, BUG_SHEET, 5, bug)
    bakeSheet(scene, OBJECT2_SHEET, 5, object2)
    bakeSheet(scene, CREW_SHEET, 5, crew)
    bakeSheet(scene, FISH_SHEET, 5, fishArt)
    bakeImage(scene, NESTS_KEY, W, H, 4, nestsBg)
    bakeImage(scene, WEB_KEY, W, H, 4, webBg)
    bakeImage(scene, GLADE_KEY, W, H, 4, whirlBg)
    bakeImage(scene, POND_KEY, W, H, 4, pondBg)
    bakeImage(scene, NIGHT_KEY, W, H, 4, nightBg)
}

// ───────────────────────────────────────────── primitivas

function disc(g: G, x: number, y: number, r: number, fill: number, line = lw, ink: number = INK) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, ink, 1)
        g.strokeCircle(x, y, r)
    }
}

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = lw, ink: number = INK) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, ink, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

function box(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = lw, ink: number = INK) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, ink, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function poly(g: G, points: P[], fill: number, line = lw, ink: number = INK) {
    g.fillStyle(fill, 1)
    g.fillPoints(points, true)
    if (line > 0) {
        g.lineStyle(line, ink, 1)
        g.strokePoints(points, true)
    }
}

function limb(g: G, pts: P[], width: number, fill: number, ink: number = INK) {
    g.lineStyle(width + lw * 2, ink, 1)
    g.strokePoints(pts, false)
    pts.forEach(p => {
        g.fillStyle(ink, 1)
        g.fillCircle(p.x, p.y, (width + lw * 2) / 2)
    })
    g.lineStyle(width, fill, 1)
    g.strokePoints(pts, false)
    pts.forEach(p => {
        g.fillStyle(fill, 1)
        g.fillCircle(p.x, p.y, width / 2)
    })
}

function rotated(g: G, cx: number, cy: number, deg: number, paint: () => void) {
    g.save()
    g.translateCanvas(cx, cy)
    g.rotateCanvas(Phaser.Math.DegToRad(deg))
    g.translateCanvas(-cx, -cy)
    paint()
    g.restore()
}

function leafShape(g: G, x: number, y: number, w: number, h: number, deg: number, fill: number = C.leaf, dark: number = C.leafDark) {
    rotated(g, x, y, deg, () => {
        const pts: P[] = []
        for (let i = 0; i <= 16; i++) {
            const t = i / 16
            pts.push(pt(x - w / 2 + w * t, y - Math.sin(t * Math.PI) * h * 0.5))
        }
        for (let i = 16; i >= 0; i--) {
            const t = i / 16
            pts.push(pt(x - w / 2 + w * t, y + Math.sin(t * Math.PI) * h * 0.5))
        }
        poly(g, pts, fill, lw, dark)
        g.lineStyle(3, dark, 1)
        g.lineBetween(x - w / 2 + 6, y, x + w / 2 - 10, y)
        g.fillStyle(C.white, 0.5)
        g.fillEllipse(x - w * 0.12, y - h * 0.18, w * 0.22, h * 0.14)
    })
}

type Eyes = 'open' | 'spiral' | 'wide' | 'happy' | 'closed' | 'o'

function eye(g: G, x: number, y: number, w: number, h: number, kind: Eyes) {
    if (kind === 'happy' || kind === 'closed') {
        g.lineStyle(5, C.eye, 1)
        g.beginPath()
        if (kind === 'happy') g.arc(x, y + 4, w * 0.5, Math.PI * 1.15, Math.PI * 1.85, false)
        else g.arc(x, y - 4, w * 0.5, Math.PI * 0.15, Math.PI * 0.85, false)
        g.strokePath()
        return
    }
    if (kind === 'spiral') {
        g.lineStyle(3.5, C.eye, 1)
        const pts: P[] = []
        for (let i = 0; i <= 26; i++) {
            const a = i * 0.55
            const r = 1.5 + i * 0.42
            pts.push(pt(x + Math.cos(a) * r, y + Math.sin(a) * r))
        }
        g.strokePoints(pts, false)
        return
    }
    const s = kind === 'wide' ? 1.15 : 1
    g.fillStyle(C.eye, 1)
    g.fillEllipse(x, y, w * s, h * s)
    g.fillStyle(C.white, 1)
    g.fillCircle(x - w * 0.18, y - h * 0.2, w * 0.24)
    g.fillCircle(x + w * 0.16, y + h * 0.18, w * 0.1)
    if (kind === 'wide') {
        g.lineStyle(3, C.white, 1)
        g.strokeEllipse(x, y, w * s, h * s)
    }
}

function smile(g: G, x: number, y: number, r: number, kind: 'smile' | 'o' | 'frown' | 'open') {
    g.lineStyle(4, C.eye, 1)
    if (kind === 'o') {
        g.fillStyle(C.eye, 1)
        g.fillEllipse(x, y + 2, r * 0.9, r * 1.1)
        return
    }
    if (kind === 'open') {
        g.fillStyle(C.eye, 1)
        g.slice(x, y - 2, r, 0, Math.PI, false)
        g.fillPath()
        g.fillStyle(0xf47a7a, 1)
        g.fillEllipse(x, y + r * 0.55, r * 0.9, r * 0.45)
        return
    }
    g.beginPath()
    if (kind === 'smile') g.arc(x, y - r * 0.4, r, Math.PI * 0.2, Math.PI * 0.8, false)
    else g.arc(x, y + r * 0.9, r, Math.PI * 1.2, Math.PI * 1.8, false)
    g.strokePath()
}

function cheeks(g: G, a: P, b: P, r: number) {
    g.fillStyle(C.cheek, 0.75)
    g.fillEllipse(a.x, a.y, r * 2, r * 1.2)
    g.fillEllipse(b.x, b.y, r * 2, r * 1.2)
}

function sweat(g: G, x: number, y: number) {
    poly(g, [pt(x, y - 14), pt(x + 8, y + 2), pt(x, y + 9), pt(x - 8, y + 2)], 0x9fd8ff, 3, 0x4a90c8)
}

// ───────────────────────────────────────────── formiga (virada para a esquerda)

interface AntPose {
    lift: number
    tilt: number
    legs: 'stand' | 'a' | 'b' | 'sit' | 'spread'
    eyes: Eyes
    mouth: 'smile' | 'o' | 'frown' | 'open'
    leaf: 'up' | 'tilt' | 'high' | 'hug' | null
    antennae: 'normal' | 'up'
    sweat?: boolean
}

const ANT_POSES: AntPose[] = [
    { lift: 0, tilt: 0, legs: 'stand', eyes: 'open', mouth: 'smile', leaf: 'up', antennae: 'normal' },
    { lift: -4, tilt: -3, legs: 'a', eyes: 'open', mouth: 'smile', leaf: 'up', antennae: 'normal' },
    { lift: -4, tilt: 3, legs: 'b', eyes: 'open', mouth: 'smile', leaf: 'up', antennae: 'normal' },
    { lift: 10, tilt: 8, legs: 'sit', eyes: 'spiral', mouth: 'o', leaf: 'tilt', antennae: 'normal' },
    { lift: -20, tilt: 160, legs: 'spread', eyes: 'wide', mouth: 'o', leaf: 'hug', antennae: 'up' },
    { lift: -26, tilt: 0, legs: 'spread', eyes: 'wide', mouth: 'o', leaf: 'up', antennae: 'up', sweat: true },
    { lift: 6, tilt: -38, legs: 'spread', eyes: 'closed', mouth: 'open', leaf: null, antennae: 'up' },
    { lift: -22, tilt: 0, legs: 'spread', eyes: 'happy', mouth: 'open', leaf: 'high', antennae: 'up' },
]

function ant(g: G, i: number) {
    const p = ANT_POSES[i]
    const cx = 128
    const cy = 170
    g.save()
    g.translateCanvas(0, p.lift)
    rotated(g, cx, cy, p.tilt, () => antBody(g, p))
    g.restore()
}

function antLegs(g: G, kind: AntPose['legs']) {
    const hips = [pt(116, 204), pt(140, 210), pt(168, 214)]
    let feet: P[]
    if (kind === 'a') feet = [pt(96, 244), pt(150, 244), pt(186, 240)]
    else if (kind === 'b') feet = [pt(116, 240), pt(130, 244), pt(206, 244)]
    else if (kind === 'sit') feet = [pt(78, 232), pt(104, 240), pt(132, 242)]
    else if (kind === 'spread') feet = [pt(80, 236), pt(140, 246), pt(208, 236)]
    else feet = [pt(104, 244), pt(140, 244), pt(178, 244)]
    hips.forEach((h, k) => {
        const f = feet[k]
        const knee = pt((h.x + f.x) / 2 + (k === 0 ? -8 : 6), Math.min(h.y, f.y) + 8)
        limb(g, [h, knee, f], 7, C.antDark)
    })
}

function antBody(g: G, p: AntPose) {
    antLegs(g, p.legs)
    const sitDrop = p.legs === 'sit' ? 14 : 0
    oval(g, 178, 184 + sitDrop, 96, 80, C.ant)
    g.fillStyle(C.antLight, 0.7)
    g.fillEllipse(166, 168 + sitDrop, 40, 18)
    oval(g, 128, 190, 48, 42, C.ant)
    if (p.leaf === 'up') {
        limb(g, [pt(120, 180), pt(104, 132), pt(112, 92)], 7, C.antDark)
        leafShape(g, 128, 66, 124, 60, -12)
        limb(g, [pt(138, 184), pt(146, 136), pt(140, 96)], 7, C.antDark)
    } else if (p.leaf === 'tilt') {
        limb(g, [pt(120, 180), pt(112, 140), pt(124, 104)], 7, C.antDark)
        leafShape(g, 150, 80, 118, 56, 24)
    } else if (p.leaf === 'high') {
        limb(g, [pt(120, 180), pt(110, 120), pt(116, 62)], 7, C.antDark)
        leafShape(g, 126, 36, 122, 58, -6)
        limb(g, [pt(138, 184), pt(150, 120), pt(140, 66)], 7, C.antDark)
    } else if (p.leaf === 'hug') {
        leafShape(g, 140, 150, 120, 58, 70)
        limb(g, [pt(120, 180), pt(130, 160), pt(150, 150)], 7, C.antDark)
    } else {
        limb(g, [pt(118, 184), pt(84, 170), pt(62, 186)], 7, C.antDark)
        limb(g, [pt(136, 186), pt(160, 160), pt(186, 150)], 7, C.antDark)
    }
    const ax = p.antennae === 'up'
    limb(g, [pt(70, 96), ax ? pt(58, 50) : pt(52, 60), ax ? pt(54, 26) : pt(34, 44)], 5, C.antDark)
    disc(g, ax ? 54 : 34, ax ? 24 : 42, 9, C.antLight)
    limb(g, [pt(96, 92), ax ? pt(104, 48) : pt(104, 56), ax ? pt(106, 24) : pt(118, 38)], 5, C.antDark)
    disc(g, ax ? 106 : 118, ax ? 22 : 36, 9, C.antLight)
    disc(g, 84, 140, 56, C.ant)
    g.fillStyle(C.antLight, 0.75)
    g.fillEllipse(70, 108, 40, 18)
    eye(g, 64, 140, 22, 30, p.eyes)
    eye(g, 100, 142, 22, 30, p.eyes)
    cheeks(g, pt(52, 166), pt(110, 168), 10)
    smile(g, 82, 172, 10, p.mouth)
    if (p.sweat) sweat(g, 142, 100)
}

// ───────────────────────────────────────────── abelha

function bee(g: G, i: number) {
    const wingsUp = i !== 1
    const legsDown = i === 2
    const eyes: Eyes = i === 3 ? 'happy' : i === 4 ? 'wide' : 'open'
    const mouth = i === 3 ? 'open' : i === 4 ? 'o' : i === 5 ? 'frown' : 'smile'
    const wy = wingsUp ? 112 : 150
    rotated(g, 76, wy, wingsUp ? -24 : 14, () => oval(g, 76, wy, 78, 50, C.wing, 4, C.wingRim))
    rotated(g, 180, wy, wingsUp ? 24 : -14, () => oval(g, 180, wy, 78, 50, C.wing, 4, C.wingRim))
    if (legsDown) {
        limb(g, [pt(112, 210), pt(110, 244)], 6, C.beeStripe)
        limb(g, [pt(146, 210), pt(150, 244)], 6, C.beeStripe)
    } else {
        limb(g, [pt(112, 212), pt(106, 228)], 6, C.beeStripe)
        limb(g, [pt(146, 212), pt(152, 228)], 6, C.beeStripe)
    }
    oval(g, 130, 176, 104, 86, C.bee)
    g.lineStyle(13, C.beeStripe, 1)
    g.lineBetween(90, 168, 170, 168)
    g.lineBetween(96, 194, 164, 194)
    g.lineStyle(lw, INK, 1)
    g.strokeEllipse(130, 176, 104, 86)
    poly(g, [pt(124, 216), pt(136, 216), pt(130, 232)], C.beeStripe, 3)
    const drop = i === 5
    limb(g, [pt(108, 66), drop ? pt(86, 52) : pt(96, 36), drop ? pt(72, 56) : pt(88, 16)], 5, C.beeStripe)
    disc(g, drop ? 70 : 88, drop ? 58 : 14, 8, C.beeStripe, 3)
    limb(g, [pt(150, 66), drop ? pt(172, 52) : pt(162, 36), drop ? pt(186, 56) : pt(170, 16)], 5, C.beeStripe)
    disc(g, drop ? 188 : 170, drop ? 58 : 14, 8, C.beeStripe, 3)
    disc(g, 128, 108, 58, C.beeLight)
    eye(g, 108, 108, 24, 32, eyes)
    eye(g, 148, 108, 24, 32, eyes)
    cheeks(g, pt(92, 134), pt(164, 134), 11)
    smile(g, 128, 142, 10, mouth)
    if (i === 3) {
        limb(g, [pt(92, 160), pt(68, 128)], 6, C.beeStripe)
        limb(g, [pt(168, 160), pt(192, 128)], 6, C.beeStripe)
        sparkle(g, 40, 92, 10)
        sparkle(g, 220, 86, 10)
    }
    if (i === 4) sweat(g, 186, 76)
}

function sparkle(g: G, x: number, y: number, r: number) {
    poly(g, [pt(x, y - r * 1.6), pt(x + r * 0.4, y - r * 0.4), pt(x + r * 1.6, y), pt(x + r * 0.4, y + r * 0.4), pt(x, y + r * 1.6), pt(x - r * 0.4, y + r * 0.4), pt(x - r * 1.6, y), pt(x - r * 0.4, y - r * 0.4)], C.butter, 3, C.amarelaDark)
}

// ───────────────────────────────────────────── flores

const KINDS: Kind[] = ['margarida', 'tulipa', 'estrela']
const TONES: Tone[] = ['amarela', 'azul', 'rosa']

function flower(g: G, i: number) {
    paintFlower(g, KINDS[Math.floor(i / 3)], TONES[i % 3])
}

function paintFlower(g: G, kind: Kind, tone: Tone) {
    const { fill, dark } = TONE[tone]
    limb(g, [pt(128, 250), pt(126, 190), pt(128, 128)], 12, C.stem, C.stemDark)
    leafShape(g, 98, 196, 62, 30, -32, C.leaf, C.stemDark)
    const cx = 128
    const cy = 86
    if (kind === 'margarida') {
        for (let k = 0; k < 8; k++) {
            const a = (k / 8) * 360
            rotated(g, cx, cy, a, () => oval(g, cx, cy - 44, 46, 62, fill, 4, dark))
        }
        disc(g, cx, cy, 30, C.center, 4, C.centerDark)
        g.fillStyle(C.white, 0.7)
        g.fillCircle(cx - 10, cy - 10, 7)
    } else if (kind === 'tulipa') {
        poly(
            g,
            [pt(76, 70), pt(80, 22), pt(104, 46), pt(128, 14), pt(152, 46), pt(176, 22), pt(180, 70), pt(170, 112), pt(128, 132), pt(86, 112)],
            fill,
            4,
            dark,
        )
        g.lineStyle(4, dark, 1)
        g.beginPath()
        g.moveTo(104, 46)
        g.lineTo(112, 96)
        g.moveTo(152, 46)
        g.lineTo(144, 96)
        g.strokePath()
        g.fillStyle(C.white, 0.55)
        g.fillEllipse(96, 72, 14, 30)
    } else {
        const pts: P[] = []
        for (let k = 0; k < 10; k++) {
            const a = -Math.PI / 2 + (k * Math.PI) / 5
            const r = k % 2 === 0 ? 74 : 30
            pts.push(pt(cx + Math.cos(a) * r, cy + 4 + Math.sin(a) * r))
        }
        poly(g, pts, fill, 4, dark)
        disc(g, cx, cy + 4, 20, C.center, 4, C.centerDark)
    }
}

// ───────────────────────────────────────────── Pipa (virada um pouco para a direita)

interface PipaPose {
    lift: number
    tilt: number
    eyes: Eyes
    mouth: 'smile' | 'o' | 'frown' | 'open'
    left: P[]
    right: P[]
}

const PIPA_POSES: PipaPose[] = [
    { lift: 0, tilt: 0, eyes: 'open', mouth: 'smile', left: [pt(112, 222), pt(132, 252)], right: [pt(178, 222), pt(158, 252)] },
    { lift: 0, tilt: 0, eyes: 'happy', mouth: 'open', left: [pt(112, 222), pt(126, 258)], right: [pt(178, 214), pt(214, 170), pt(222, 128)] },
    { lift: 0, tilt: 0, eyes: 'open', mouth: 'open', left: [pt(112, 222), pt(126, 258)], right: [pt(178, 218), pt(212, 196), pt(226, 168)] },
    { lift: 8, tilt: -14, eyes: 'closed', mouth: 'frown', left: [pt(112, 222), pt(80, 214), pt(62, 196)], right: [pt(178, 222), pt(150, 190), pt(150, 170)] },
    { lift: 0, tilt: 0, eyes: 'wide', mouth: 'o', left: [pt(112, 222), pt(104, 196), pt(110, 170)], right: [pt(178, 222), pt(190, 196), pt(184, 170)] },
    { lift: 0, tilt: 4, eyes: 'open', mouth: 'smile', left: [pt(112, 222), pt(126, 258)], right: [pt(178, 216), pt(220, 210), pt(248, 200)] },
    { lift: -18, tilt: 0, eyes: 'happy', mouth: 'open', left: [pt(112, 214), pt(86, 168), pt(80, 128)], right: [pt(178, 214), pt(206, 168), pt(212, 128)] },
    { lift: -22, tilt: 12, eyes: 'happy', mouth: 'smile', left: [pt(112, 222), pt(96, 238)], right: [pt(178, 222), pt(206, 236)] },
]

function pipa(g: G, i: number) {
    const p = PIPA_POSES[i]
    g.save()
    g.translateCanvas(0, p.lift)
    rotated(g, 140, 300, p.tilt, () => pipaBody(g, p, i === 3))
    g.restore()
}

function pipaBody(g: G, p: PipaPose, blown: boolean) {
    const tx = blown ? 26 : 0
    disc(g, 70 + tx, 214, 62, C.squirrelLight, lw, C.squirrelDark)
    disc(g, 56 + tx, 142, 54, C.squirrelLight, lw, C.squirrelDark)
    disc(g, 82 + tx, 88, 42, C.squirrelLight, lw, C.squirrelDark)
    disc(g, 114 + tx, 76, 26, C.squirrelLight, lw, C.squirrelDark)
    g.fillStyle(C.squirrelLight, 1)
    g.fillCircle(70 + tx, 214, 58)
    g.fillCircle(56 + tx, 142, 50)
    g.fillCircle(82 + tx, 88, 38)
    g.fillStyle(C.belly, 0.6)
    g.fillEllipse(48 + tx, 150, 30, 50)
    oval(g, 118, 306, 50, 20, C.squirrelDark)
    oval(g, 170, 306, 50, 20, C.squirrelDark)
    oval(g, 144, 248, 116, 124, C.squirrel, lw, C.squirrelDark)
    oval(g, 150, 258, 66, 86, C.belly, 0)
    limb(g, p.left, 14, C.squirrel, C.squirrelDark)
    limb(g, p.right, 14, C.squirrel, C.squirrelDark)
    disc(g, 104, 84, 22, C.squirrel, lw, C.squirrelDark)
    disc(g, 184, 82, 22, C.squirrel, lw, C.squirrelDark)
    disc(g, 104, 84, 11, C.cheek, 0)
    disc(g, 184, 82, 11, C.cheek, 0)
    disc(g, 144, 146, 68, C.squirrel, lw, C.squirrelDark)
    leafShape(g, 92, 66, 54, 26, -40, C.leaf, C.leafDark)
    oval(g, 152, 176, 74, 46, C.belly, 0)
    eye(g, 124, 142, 24, 32, p.eyes)
    eye(g, 172, 142, 24, 32, p.eyes)
    oval(g, 152, 164, 16, 11, C.eye, 0)
    cheeks(g, pt(108, 172), pt(192, 170), 11)
    smile(g, 152, 184, 11, p.mouth)
}

// ───────────────────────────────────────────── objetos

function object(g: G, i: number) {
    if (i === 0) {
        box(g, 116, 110, 24, 136, 6, C.wood, lw, C.woodDark)
        box(g, 50, 30, 156, 112, 16, C.board, lw, C.woodDark)
        g.lineStyle(3, C.creamDark, 1)
        g.strokeRoundedRect(60, 40, 136, 92, 10)
        disc(g, 66, 46, 4, C.woodDark, 0)
        disc(g, 190, 46, 4, C.woodDark, 0)
    } else if (i === 1) {
        box(g, 116, 60, 24, 186, 6, C.wood, lw, C.woodDark)
        g.fillStyle(C.white, 0.35)
        g.fillRect(122, 70, 5, 160)
    } else if (i === 2) {
        box(g, 20, 44, 216, 172, 30, C.grassDark, 0)
        box(g, 30, 52, 196, 154, 24, C.soil, lw, C.soilDark)
        const rnd = seeded(7)
        for (let k = 0; k < 4; k++) {
            g.lineStyle(4, C.soilDark, 0.55)
            g.lineBetween(52, 82 + k * 32, 204, 82 + k * 32)
        }
        for (let k = 0; k < 18; k++) {
            g.fillStyle(C.soilLight, 0.8)
            g.fillCircle(46 + rnd() * 164, 66 + rnd() * 126, 2 + rnd() * 3)
        }
    } else if (i === 3) {
        leafShape(g, 128, 128, 190, 92, -18)
    } else if (i === 4) {
        leafShape(g, 128, 128, 96, 40, 28, C.leafLight, C.leafDark)
    } else if (i === 5) {
        oval(g, 128, 138, 120, 74, C.pebble, lw, C.pebbleDark)
        g.fillStyle(C.white, 0.6)
        g.fillEllipse(108, 124, 40, 16)
    } else if (i === 6) {
        g.fillStyle(C.dirtDark, 0.85)
        g.fillCircle(96, 144, 34)
        g.fillCircle(132, 124, 40)
        g.fillCircle(166, 146, 32)
        g.fillStyle(C.dirtLight, 0.9)
        g.fillCircle(124, 116, 18)
    } else {
        poly(g, [pt(120, 128), pt(70, 92), pt(56, 128), pt(70, 164)], C.white, 4, 0xb9bcc6)
        poly(g, [pt(136, 128), pt(186, 92), pt(200, 128), pt(186, 164)], C.white, 4, 0xb9bcc6)
        poly(g, [pt(120, 134), pt(98, 196), pt(116, 190), pt(124, 204)], C.white, 4, 0xb9bcc6)
        poly(g, [pt(136, 134), pt(158, 196), pt(140, 190), pt(132, 204)], C.white, 4, 0xb9bcc6)
        disc(g, 128, 130, 16, C.white, 4, 0xb9bcc6)
    }
}

// ───────────────────────────────────────────── fundos

function grassField(g: G, seed: number) {
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 0, W, H)
    const rnd = seeded(seed)
    for (let k = 0; k < 26; k++) {
        g.fillStyle(rnd() < 0.5 ? C.grassLight : C.grassDark, 0.28)
        g.fillEllipse(rnd() * W, rnd() * H, 120 + rnd() * 220, 50 + rnd() * 80)
    }
    for (let k = 0; k < 70; k++) {
        const x = rnd() * W
        const y = 100 + rnd() * (H - 100)
        g.lineStyle(3, C.grassDeep, 0.45)
        g.lineBetween(x, y, x - 4, y - 10)
        g.lineBetween(x + 5, y, x + 7, y - 12)
    }
}

function tuft(g: G, x: number, y: number, s = 1) {
    poly(g, [pt(x - 22 * s, y), pt(x - 12 * s, y - 30 * s), pt(x - 4 * s, y - 6 * s), pt(x + 4 * s, y - 38 * s), pt(x + 10 * s, y - 6 * s), pt(x + 20 * s, y - 28 * s), pt(x + 24 * s, y)], C.grassDeep, 3, C.stemDark)
}

function mushroom(g: G, x: number, y: number, s = 1) {
    box(g, x - 10 * s, y - 26 * s, 20 * s, 28 * s, 8 * s, C.cream, 3, C.woodDark)
    g.fillStyle(C.mushroomCap, 1)
    g.slice(x, y - 22 * s, 30 * s, Math.PI, 0, false)
    g.fillPath()
    g.lineStyle(3, C.woodDark, 1)
    g.beginPath()
    g.arc(x, y - 22 * s, 30 * s, Math.PI, 0, false)
    g.closePath()
    g.strokePath()
    disc(g, x - 10 * s, y - 36 * s, 5 * s, C.cream, 0)
    disc(g, x + 12 * s, y - 32 * s, 4 * s, C.cream, 0)
}

function pebble(g: G, x: number, y: number, w: number) {
    oval(g, x, y, w, w * 0.6, C.pebble, 3, C.pebbleDark)
}

function bush(g: G, x: number, y: number, s = 1) {
    disc(g, x - 30 * s, y, 34 * s, C.bush, 4, C.bushDark)
    disc(g, x + 26 * s, y + 4 * s, 30 * s, C.bush, 4, C.bushDark)
    disc(g, x, y - 18 * s, 38 * s, C.bush, 4, C.bushDark)
    g.fillStyle(C.bush, 1)
    g.fillCircle(x - 30 * s, y, 30 * s)
    g.fillCircle(x + 26 * s, y + 4 * s, 26 * s)
    g.fillStyle(C.grassLight, 0.6)
    g.fillEllipse(x - 8 * s, y - 32 * s, 30 * s, 14 * s)
}

function trail(g: G) {
    grassField(g, 11)
    g.fillStyle(C.dirtDark, 1)
    g.fillRoundedRect(160, 506, W, 102, 46)
    g.fillStyle(C.dirt, 1)
    g.fillRoundedRect(166, 512, W, 88, 40)
    const rnd = seeded(23)
    for (let k = 0; k < 30; k++) {
        g.fillStyle(rnd() < 0.5 ? C.dirtLight : C.dirtDark, 0.55)
        g.fillCircle(200 + rnd() * 1060, 522 + rnd() * 68, 2 + rnd() * 4)
    }
    oval(g, 140, 566, 250, 150, C.mound, 5, C.moundDark)
    oval(g, 132, 546, 170, 96, C.dirtDark, 0)
    oval(g, 126, 538, 120, 62, C.mound, 0)
    oval(g, 184, 556, 66, 42, C.hole, 4, C.moundDark)
    for (let k = 0; k < 10; k++) {
        g.fillStyle(C.moundDark, 0.8)
        g.fillCircle(60 + rnd() * 160, 600 + rnd() * 34, 3 + rnd() * 4)
    }
    tuft(g, 40, 430)
    tuft(g, 1240, 470, 0.9)
    tuft(g, 320, 700, 1.1)
    tuft(g, 760, 690)
    tuft(g, 1160, 700, 1.2)
    tuft(g, 60, 220, 0.9)
    mushroom(g, 46, 690, 1.1)
    mushroom(g, 1226, 640, 0.9)
    mushroom(g, 1236, 200, 0.8)
    pebble(g, 520, 680, 46)
    pebble(g, 980, 676, 38)
    pebble(g, 40, 330, 34)
    leafShape(g, 640, 676, 60, 28, 20, C.leaf, C.leafDark)
    leafShape(g, 1200, 380, 52, 24, -30, C.leafLight, C.leafDark)
}

function garden(g: G) {
    grassField(g, 31)
    g.fillStyle(C.grassLight, 0.22)
    g.fillRoundedRect(220, 170, 760, 500, 120)
    bush(g, 60, 300, 1.1)
    bush(g, 40, 560, 1.2)
    bush(g, 300, 700, 0.9)
    bush(g, 820, 712, 0.9)
    tuft(g, 140, 680)
    tuft(g, 560, 700, 0.9)
    mushroom(g, 150, 420, 0.9)
    mushroom(g, 930, 690, 0.8)
    pebble(g, 700, 690, 40)
    box(g, 1168, -20, 130, 470, 30, C.trunk, 5, C.trunkDark)
    g.lineStyle(4, C.trunkDark, 0.6)
    g.lineBetween(1196, 40, 1190, 400)
    g.lineBetween(1238, 80, 1244, 360)
    limb(g, [pt(1176, 170), pt(1100, 160), pt(1010, 176)], 26, C.trunk, C.trunkDark)
    disc(g, 1250, 40, 120, C.canopy, 5, C.stemDark)
    disc(g, 1120, 30, 90, C.canopy, 5, C.stemDark)
    g.fillStyle(C.canopy, 1)
    g.fillCircle(1250, 40, 115)
    g.fillStyle(C.grassLight, 0.5)
    g.fillEllipse(1150, 10, 80, 30)
    g.lineStyle(5, C.trunkDark, 1)
    g.lineBetween(1110, 172, 1110, 196)
    const hx = 1110
    const hy = 250
    oval(g, hx, hy, 120, 120, C.hive, 5, C.hiveDark)
    for (let k = -2; k <= 2; k++) {
        g.lineStyle(4, C.hiveDark, 0.8)
        g.beginPath()
        g.arc(hx, hy + k * 22 - 60, 58, Math.PI * 0.18, Math.PI * 0.82, false)
        g.strokePath()
    }
    g.lineStyle(5, C.hiveDark, 1)
    g.strokeEllipse(hx, hy, 120, 120)
    oval(g, hx, hy + 24, 26, 20, C.hole, 3, C.hiveDark)
    g.fillStyle(C.white, 0.5)
    g.fillEllipse(hx - 30, hy - 30, 26, 14)
}

// ───────────────────────────────────────────── filhotes (virados para a esquerda; linha = pena, coluna = bico)

const CORES: Cor[] = ['laranja', 'verde', 'roxo']

function chick(g: G, i: number) {
    const pena = COR[CORES[Math.floor(i / 3)]]
    const bico = COR[CORES[i % 3]]
    limb(g, [pt(112, 222), pt(108, 242)], 7, C.nestDark)
    limb(g, [pt(144, 222), pt(148, 242)], 7, C.nestDark)
    oval(g, 136, 158, 156, 150, pena.fill, lw, pena.dark)
    g.fillStyle(C.white, 0.35)
    g.fillEllipse(140, 190, 92, 60)
    rotated(g, 182, 168, 24, () => oval(g, 182, 168, 46, 70, pena.fill, lw, pena.dark))
    g.fillStyle(C.white, 0.4)
    g.fillEllipse(106, 110, 40, 18)
    poly(g, [pt(78, 132), pt(32, 146), pt(78, 160)], bico.fill, lw, bico.dark)
    poly(g, [pt(78, 150), pt(44, 156), pt(78, 168)], bico.fill, lw, bico.dark)
    eye(g, 104, 128, 22, 30, 'open')
    eye(g, 140, 126, 20, 28, 'open')
    cheeks(g, pt(96, 160), pt(152, 158), 10)
}

// ───────────────────────────────────────────── Tece (aranha)

function spiderLegs(g: G, cx: number, cy: number, spread: number, lift: number) {
    for (let k = 0; k < 4; k++) {
        const a = -0.5 + k * 0.42
        const r = 78
        for (const side of [-1, 1]) {
            const knee = pt(cx + side * Math.cos(a) * r * 0.72 * spread, cy + Math.sin(a) * r * 0.5 - 30 + lift)
            const foot = pt(cx + side * Math.cos(a) * r * spread, cy + Math.sin(a) * r * 0.7 + 18 + lift * 0.4)
            limb(g, [pt(cx + side * 22, cy + 6), knee, foot], 7, C.spiderDark)
        }
    }
}

function spiderBody(g: G, cx: number, cy: number, eyes: Eyes, mouth: 'smile' | 'o' | 'frown' | 'open', spread = 1, lift = 0) {
    spiderLegs(g, cx, cy, spread, lift)
    oval(g, cx, cy + 34, 92, 80, C.spider, lw, C.spiderDark)
    disc(g, cx, cy - 10, 54, C.spiderLight, lw, C.spiderDark)
    g.fillStyle(C.white, 0.45)
    g.fillEllipse(cx - 18, cy - 40, 30, 14)
    eye(g, cx - 20, cy - 12, 22, 30, eyes)
    eye(g, cx + 20, cy - 12, 22, 30, eyes)
    cheeks(g, pt(cx - 34, cy + 14), pt(cx + 34, cy + 14), 9)
    smile(g, cx, cy + 22, 9, mouth)
}

function spider(g: G, i: number) {
    if (i === 0) spiderBody(g, 128, 130, 'open', 'smile')
    else if (i === 1) {
        g.lineStyle(5, C.white, 1)
        g.lineBetween(128, 14, 128, 120)
        disc(g, 128, 14, 7, C.white, 3, C.creamDark)
        rotated(g, 128, 160, 180, () => spiderBody(g, 128, 160, 'open', 'smile'))
    } else if (i === 2) {
        spiderBody(g, 128, 140, 'open', 'open', 0.9)
        g.lineStyle(5, C.white, 1)
        g.lineBetween(70, 150, 20, 120)
        limb(g, [pt(104, 150), pt(78, 150), pt(62, 146)], 7, C.spiderDark)
    } else if (i === 3) {
        spiderBody(g, 128, 140, 'happy', 'open', 1.05, -30)
        sparkle(g, 36, 60, 9)
        sparkle(g, 222, 54, 9)
    } else if (i === 4) {
        rotated(g, 128, 130, -28, () => spiderBody(g, 128, 130, 'wide', 'o', 1.1, -20))
        sweat(g, 196, 62)
    } else {
        spiderBody(g, 128, 150, 'spiral', 'o', 1.15, 14)
    }
}

// ───────────────────────────────────────────── bichos da teia (em cima contentes, embaixo assustados)

function bug(g: G, i: number) {
    const scared = i >= 4
    const k = i % 4
    const eyes: Eyes = scared ? 'wide' : 'open'
    const mouth = scared ? 'o' : 'smile'
    g.save()
    if (scared) {
        g.translateCanvas(128, 140)
        g.rotateCanvas(Phaser.Math.DegToRad(-10))
        g.translateCanvas(-128, -140)
    }
    if (k === 0) {
        limb(g, [pt(92, 200), pt(78, 226)], 6, C.eye)
        limb(g, [pt(164, 200), pt(178, 226)], 6, C.eye)
        oval(g, 136, 150, 170, 140, C.ladybug, lw, C.ladybugDark)
        g.lineStyle(5, C.ladybugDark, 1)
        g.lineBetween(150, 84, 150, 218)
        ;[pt(104, 120), pt(122, 180), pt(186, 126), pt(176, 184)].forEach(p => disc(g, p.x, p.y, 13, C.eye, 0))
        g.fillStyle(C.white, 0.4)
        g.fillEllipse(110, 104, 40, 16)
        disc(g, 70, 138, 46, C.eye, lw, C.eye)
        limb(g, [pt(56, 98), pt(44, 70)], 4, C.eye)
        limb(g, [pt(82, 96), pt(92, 68)], 4, C.eye)
        g.fillStyle(C.white, 1)
        g.fillCircle(54, 132, 12)
        g.fillCircle(84, 132, 12)
        g.fillStyle(C.eye, 1)
        g.fillCircle(54, 134, scared ? 5 : 7)
        g.fillCircle(84, 134, scared ? 5 : 7)
        cheeks(g, pt(48, 156), pt(92, 156), 7)
    } else if (k === 1) {
        oval(g, 84, 104, 110, 120, C.butterfly, lw, C.butterflyDark)
        oval(g, 172, 104, 110, 120, C.butterfly, lw, C.butterflyDark)
        oval(g, 92, 178, 80, 80, C.butterfly, lw, C.butterflyDark)
        oval(g, 164, 178, 80, 80, C.butterfly, lw, C.butterflyDark)
        disc(g, 80, 100, 18, C.white, 0)
        disc(g, 176, 100, 18, C.white, 0)
        oval(g, 128, 160, 36, 120, C.spider, lw, C.spiderDark)
        disc(g, 128, 92, 34, C.spiderLight, lw, C.spiderDark)
        limb(g, [pt(116, 64), pt(100, 30)], 4, C.spiderDark)
        limb(g, [pt(140, 64), pt(156, 30)], 4, C.spiderDark)
        eye(g, 116, 90, 14, 20, eyes)
        eye(g, 140, 90, 14, 20, eyes)
        smile(g, 128, 108, 6, mouth)
    } else if (k === 2) {
        limb(g, [pt(160, 170), pt(212, 112), pt(230, 214)], 8, C.cricketDark)
        limb(g, [pt(118, 182), pt(110, 222)], 6, C.cricketDark)
        limb(g, [pt(146, 182), pt(150, 222)], 6, C.cricketDark)
        oval(g, 144, 160, 150, 80, C.cricket, lw, C.cricketDark)
        g.fillStyle(C.white, 0.35)
        g.fillEllipse(140, 140, 70, 18)
        disc(g, 72, 142, 44, C.cricket, lw, C.cricketDark)
        limb(g, [pt(58, 104), pt(30, 40), pt(14, 30)], 4, C.cricketDark)
        limb(g, [pt(80, 100), pt(84, 36), pt(100, 22)], 4, C.cricketDark)
        eye(g, 58, 136, 18, 26, eyes)
        eye(g, 88, 136, 18, 26, eyes)
        smile(g, 72, 160, 8, mouth)
    } else {
        oval(g, 128, 206, 200, 50, C.snail, lw, C.snailDark)
        disc(g, 150, 146, 64, C.shell, lw, C.shellDark)
        g.lineStyle(6, C.shellDark, 1)
        const pts: P[] = []
        for (let s = 0; s <= 30; s++) {
            const a = s * 0.42
            const r = 4 + s * 1.7
            pts.push(pt(150 + Math.cos(a) * r, 146 + Math.sin(a) * r))
        }
        g.strokePoints(pts, false)
        oval(g, 52, 170, 56, 80, C.snail, lw, C.snailDark)
        limb(g, [pt(42, 136), pt(30, 92)], 4, C.snailDark)
        limb(g, [pt(62, 136), pt(70, 92)], 4, C.snailDark)
        disc(g, 30, 90, 8, C.snailDark, 0)
        disc(g, 70, 90, 8, C.snailDark, 0)
        eye(g, 42, 164, 14, 20, eyes)
        eye(g, 64, 164, 14, 20, eyes)
        smile(g, 54, 186, 7, mouth)
    }
    g.restore()
    if (scared) sweat(g, 212, 70)
}

// ───────────────────────────────────────────── objetos2

function feather(g: G, cx: number, cy: number, s: number, fill: number, dark: number) {
    rotated(g, cx, cy, 30, () => {
        oval(g, cx, cy, 44 * s, 120 * s, fill, lw, dark)
        g.lineStyle(4, dark, 1)
        g.lineBetween(cx, cy - 56 * s, cx, cy + 74 * s)
    })
}

function beakIcon(g: G, cx: number, cy: number, s: number, fill: number, dark: number) {
    poly(g, [pt(cx + 40 * s, cy - 34 * s), pt(cx - 60 * s, cy), pt(cx + 40 * s, cy + 4 * s)], fill, lw, dark)
    poly(g, [pt(cx + 40 * s, cy + 6 * s), pt(cx - 44 * s, cy + 10 * s), pt(cx + 40 * s, cy + 34 * s)], fill, lw, dark)
}

function crestShape(g: G, cx: number, cy: number, s: number, fill: number, dark: number) {
    rotated(g, cx - 26 * s, cy, -26, () => oval(g, cx - 26 * s, cy - 30 * s, 30 * s, 80 * s, fill, lw, dark))
    rotated(g, cx + 26 * s, cy, 26, () => oval(g, cx + 26 * s, cy - 30 * s, 30 * s, 80 * s, fill, lw, dark))
    oval(g, cx, cy - 40 * s, 34 * s, 96 * s, fill, lw, dark)
}

function object2(g: G, i: number) {
    const grey = C.labelIcon
    if (i === 0) {
        oval(g, 128, 150, 226, 116, C.nest, lw, C.nestDark)
        oval(g, 128, 120, 176, 50, C.nestDark, lw, C.nestDark)
        const rnd = seeded(5)
        for (let k = 0; k < 16; k++) {
            g.lineStyle(4, k % 2 ? C.nestLight : C.nestDark, 0.9)
            const x = 40 + rnd() * 176
            const y = 140 + rnd() * 50
            g.lineBetween(x - 26, y - 6 + rnd() * 12, x + 26, y - 6 + rnd() * 12)
        }
        g.lineStyle(lw, C.nestDark, 1)
        g.strokeEllipse(128, 150, 226, 116)
    } else if (i === 1) {
        g.lineStyle(4, C.woodDark, 1)
        g.lineBetween(128, 4, 128, 34)
        box(g, 36, 20, 184, 224, 18, C.board, lw, C.woodDark)
        disc(g, 128, 34, 7, C.white, 3, C.woodDark)
    } else if (i === 2) {
        limb(g, [pt(20, 150), pt(128, 140), pt(236, 152)], 18, C.branch, C.branchDark)
        limb(g, [pt(170, 144), pt(196, 112)], 8, C.branch, C.branchDark)
        leafShape(g, 208, 98, 54, 26, -40)
    } else if (i === 3) {
        crestShape(g, 128, 190, 1.2, C.white, 0xc8c8c8)
    } else if (i === 4) {
        feather(g, 128, 128, 1.4, grey, 0x3c4146)
    } else if (i === 5) {
        beakIcon(g, 136, 128, 1.5, grey, 0x3c4146)
    } else if (i === 6) {
        disc(g, 120, 150, 66, grey, lw, 0x3c4146)
        crestShape(g, 120, 96, 0.9, grey, 0x3c4146)
        disc(g, 98, 140, 9, C.white, 0)
        poly(g, [pt(60, 140), pt(28, 152), pt(62, 162)], grey, lw, 0x3c4146)
    } else {
        const rnd = seeded(9)
        oval(g, 128, 190, 240, 80, C.dirtDark, 0)
        for (let k = 0; k < 16; k++) {
            const x = 30 + rnd() * 196
            const y = 150 + rnd() * 70
            leafShape(g, x, y, 54 + rnd() * 20, 26, rnd() * 160 - 80, k % 2 ? C.mushroomCap : C.mound, C.moundDark)
        }
    }
}

// ───────────────────────────────────────────── turma do N3

function duck(g: G, body: number, dark: number, mom: boolean) {
    limb(g, [pt(118, 216), pt(112, 240)], 7, C.beak, C.beakDark)
    limb(g, [pt(150, 216), pt(156, 240)], 7, C.beak, C.beakDark)
    poly(g, [pt(112, 241), pt(96, 246), pt(122, 246)], C.beak, 3, C.beakDark)
    poly(g, [pt(150, 241), pt(140, 246), pt(166, 246)], C.beak, 3, C.beakDark)
    poly(g, [pt(196, 150), pt(238, mom ? 104 : 118), pt(222, 170)], body, lw, dark)
    oval(g, 146, 166, 176, 118, body, lw, dark)
    rotated(g, 160, 160, -12, () => oval(g, 160, 160, 88, 54, body, lw, dark))
    g.fillStyle(C.white, 0.45)
    g.fillEllipse(124, 140, 60, 18)
    disc(g, 88, 108, mom ? 50 : 54, body, lw, dark)
    poly(g, [pt(48, 106), pt(14, 116), pt(48, 128)], C.beak, lw, C.beakDark)
    eye(g, 76, 98, 16, 22, 'open')
    cheeks(g, pt(62, 122), pt(108, 120), 8)
    if (!mom) {
        poly(g, [pt(86, 58), pt(94, 40), pt(100, 58)], body, 3, dark)
    } else {
        g.fillStyle(C.white, 0.8)
        g.fillEllipse(100, 82, 30, 12)
    }
}

function capShape(g: G, cap: 'redondo' | 'pontudo', fill: number, dark: number) {
    if (cap === 'redondo') {
        g.fillStyle(fill, 1)
        g.slice(128, 140, 98, Math.PI, 0, false)
        g.fillPath()
        g.lineStyle(lw, dark, 1)
        g.beginPath()
        g.arc(128, 140, 98, Math.PI, 0, false)
        g.closePath()
        g.strokePath()
        ;[pt(84, 102), pt(132, 72), pt(176, 106)].forEach(p => disc(g, p.x, p.y, 13, C.white, 0))
    } else {
        poly(g, [pt(26, 142), pt(128, 18), pt(230, 142)], fill, lw, dark)
        ;[pt(96, 116), pt(134, 74), pt(166, 120)].forEach(p => disc(g, p.x, p.y, 11, C.white, 0))
    }
}

function shroomArt(g: G, cap: 'redondo' | 'pontudo', fill: number, dark: number) {
    box(g, 90, 136, 76, 104, 26, C.belly, lw, C.woodDark)
    eye(g, 112, 176, 12, 18, 'open')
    eye(g, 144, 176, 12, 18, 'open')
    smile(g, 128, 198, 7, 'smile')
    capShape(g, cap, fill, dark)
}

function firefly(g: G, light: number) {
    oval(g, 86, 104, 70, 50, C.white, 3, 0xb9c6d8)
    oval(g, 170, 104, 70, 50, C.white, 3, 0xb9c6d8)
    oval(g, 128, 150, 86, 100, C.bug, lw, C.bugDark)
    disc(g, 128, 186, 38, light, lw, C.bugDark)
    g.fillStyle(C.white, 0.6)
    g.fillEllipse(118, 176, 22, 12)
    disc(g, 128, 92, 40, C.bug, lw, C.bugDark)
    limb(g, [pt(114, 60), pt(100, 30)], 4, C.bugDark)
    limb(g, [pt(142, 60), pt(156, 30)], 4, C.bugDark)
    eye(g, 114, 92, 14, 20, 'open')
    eye(g, 142, 92, 14, 20, 'open')
    cheeks(g, pt(102, 110), pt(154, 110), 7)
}

function conch(g: G) {
    const pts: P[] = []
    for (let i = 0; i <= 20; i++) {
        const a = Math.PI + (i / 20) * Math.PI
        pts.push(pt(128 + Math.cos(a) * 110, 170 + Math.sin(a) * 96))
    }
    pts.push(pt(150, 214), pt(106, 214))
    poly(g, pts, C.conch, lw, C.conchDark)
    g.lineStyle(4, C.conchDark, 1)
    for (let k = 1; k < 6; k++) {
        const a = Math.PI + (k / 6) * Math.PI
        g.lineBetween(128, 206, 128 + Math.cos(a) * 100, 170 + Math.sin(a) * 86)
    }
    g.fillStyle(C.white, 0.45)
    g.fillEllipse(96, 110, 44, 16)
}

function basket(g: G) {
    g.lineStyle(10, C.basketDark, 1)
    g.beginPath()
    g.arc(128, 128, 82, Math.PI * 1.05, Math.PI * 1.95, false)
    g.strokePath()
    box(g, 30, 120, 196, 112, 30, C.basket, lw, C.basketDark)
    g.lineStyle(4, C.basketDark, 0.8)
    for (let k = 1; k < 4; k++) g.lineBetween(34, 120 + k * 28, 222, 120 + k * 28)
    for (let k = 1; k < 7; k++) g.lineBetween(30 + k * 28, 124, 30 + k * 28, 228)
    box(g, 22, 112, 212, 26, 13, C.basket, lw, C.basketDark)
}

function crew(g: G, i: number) {
    const grey = C.labelIcon
    if (i === 0) duck(g, C.duck, C.duckDark, true)
    else if (i === 1) duck(g, C.duckling, C.ducklingDark, false)
    else if (i === 2) {
        g.translateCanvas(256, 0)
        g.scaleCanvas(-1, 1)
        bug(g, 3)
    } else if (i === 3) {
        oval(g, 128, 160, 210, 150, C.stone, lw, C.stoneDark)
        g.fillStyle(C.white, 0.4)
        g.fillEllipse(88, 116, 60, 20)
    } else if (i >= 4 && i < 8) {
        const cap = i < 6 ? 'redondo' : 'pontudo'
        const blue = (i - 4) % 2 === 1
        shroomArt(g, cap, blue ? C.capBlue : C.cap, blue ? C.capBlueDark : C.capDark)
    } else if (i >= 8 && i < 12) {
        firefly(g, [GLOW.amarelo, GLOW.verde, GLOW.azul, GLOW.rosa][i - 8])
    } else if (i === 12) conch(g)
    else if (i === 13) {
        oval(g, 120, 128, 170, 110, grey, lw, 0x3c4146)
        disc(g, 74, 116, 10, C.white, 0)
    } else if (i === 14) {
        poly(g, [pt(70, 128), pt(196, 50), pt(170, 128), pt(196, 206)], grey, lw, 0x3c4146)
    } else basket(g)
}

function fishArt(g: G, i: number) {
    const corpo = COR[CORES[Math.floor(i / 3)]]
    const rabo = COR[CORES[i % 3]]
    poly(g, [pt(178, 128), pt(244, 64), pt(226, 128), pt(244, 192)], rabo.fill, lw, rabo.dark)
    poly(g, [pt(104, 80), pt(140, 40), pt(160, 84)], corpo.fill, lw, corpo.dark)
    oval(g, 112, 128, 180, 120, corpo.fill, lw, corpo.dark)
    g.fillStyle(C.white, 0.4)
    g.fillEllipse(100, 98, 64, 18)
    eye(g, 62, 116, 20, 28, 'open')
    cheeks(g, pt(54, 146), pt(98, 146), 8)
    smile(g, 40, 140, 7, 'smile')
}

// ───────────────────────────────────────────── fundos do N2 e do N3

function canopy(g: G, seed: number, y: number) {
    const rnd = seeded(seed)
    for (let k = 0; k < 18; k++) {
        const x = (k / 17) * W + (rnd() - 0.5) * 40
        disc(g, x, y + rnd() * 30, 60 + rnd() * 40, k % 2 ? C.canopy : C.bush, 4, C.stemDark)
    }
}

function nestsBg(g: G) {
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(C.mint, 0.6)
    g.fillRect(0, 330, W, 260)
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 590, W, H - 590)
    const rnd = seeded(41)
    for (let k = 0; k < 40; k++) {
        const x = rnd() * W
        const y = 600 + rnd() * 110
        g.lineStyle(3, C.grassDeep, 0.5)
        g.lineBetween(x, y, x - 4, y - 10)
    }
    box(g, -40, -40, 120, 700, 30, C.trunk, 5, C.trunkDark)
    canopy(g, 3, 10)
    limb(g, [pt(30, 320), pt(400, 306), pt(800, 314), pt(1250, 300)], 40, C.branch, C.branchDark)
    g.fillStyle(C.branchLight, 0.6)
    g.fillRoundedRect(60, 298, 1180, 8, 4)
    leafShape(g, 1220, 270, 70, 32, -30)
    leafShape(g, 1010, 640, 60, 28, 40)
    tuft(g, 60, 700)
    tuft(g, 1220, 690, 1.1)
}

function webBg(g: G) {
    g.fillStyle(C.shade, 1)
    g.fillRect(0, 0, W, H)
    const rnd = seeded(53)
    for (let k = 0; k < 18; k++) {
        g.fillStyle(rnd() < 0.5 ? C.shadeLight : C.shadeDark, 0.3)
        g.fillEllipse(200 + rnd() * 880, 140 + rnd() * 520, 160 + rnd() * 200, 80 + rnd() * 80)
    }
    box(g, -60, -40, 230, 800, 40, C.trunk, 5, C.trunkDark)
    box(g, 1110, -40, 230, 800, 40, C.trunk, 5, C.trunkDark)
    g.lineStyle(4, C.trunkDark, 0.6)
    g.lineBetween(80, 40, 70, 680)
    g.lineBetween(1190, 60, 1200, 700)
    limb(g, [pt(160, 160), pt(250, 130), pt(330, 140)], 20, C.branch, C.branchDark)
    limb(g, [pt(1120, 600), pt(1030, 630), pt(960, 620)], 20, C.branch, C.branchDark)
    canopy(g, 7, -10)
    leafShape(g, 320, 128, 60, 28, -20)
    leafShape(g, 970, 600, 60, 28, 30)
}

function whirlBg(g: G) {
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(C.grassLight, 1)
    g.fillRect(0, 300, W, H - 300)
    g.fillStyle(C.grass, 1)
    g.fillRoundedRect(-40, 470, W + 80, 300, 60)
    canopy(g, 13, 0)
    bush(g, 80, 330, 1.2)
    bush(g, 1200, 340, 1.2)
    const rnd = seeded(61)
    for (let k = 0; k < 50; k++) {
        const x = rnd() * W
        const y = 480 + rnd() * 230
        g.lineStyle(3, C.grassDeep, 0.45)
        g.lineBetween(x, y, x - 4, y - 10)
        g.lineBetween(x + 5, y, x + 7, y - 12)
    }
    mushroom(g, 40, 700, 0.9)
    mushroom(g, 1240, 690, 0.8)
}

function pondBg(g: G) {
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, W, 130)
    canopy(g, 17, -30)
    g.fillStyle(C.water, 1)
    g.fillRect(0, 110, W, H - 110)
    g.fillStyle(C.white, 0.5)
    g.fillRect(0, 110, W, 10)
    g.fillStyle(C.waterDeep, 0.35)
    g.fillRect(0, 300, W, 200)
    g.fillStyle(C.dirtLight, 1)
    g.fillRoundedRect(-40, 470, W + 80, 300, 80)
    const rnd = seeded(71)
    for (let k = 0; k < 40; k++) {
        g.fillStyle(C.dirt, 0.6)
        g.fillCircle(rnd() * W, 500 + rnd() * 210, 3 + rnd() * 4)
    }
    for (let k = 0; k < 14; k++) {
        g.lineStyle(3, C.white, 0.5)
        g.strokeCircle(rnd() * W, 150 + rnd() * 300, 5 + rnd() * 8)
    }
    ;[pt(60, 520), pt(110, 540), pt(1180, 520), pt(1230, 540)].forEach((p, k) => leafShape(g, p.x, p.y - 60, 150, 34, 82 + (k % 2) * 14, C.leaf, C.leafDark))
}

function nightBg(g: G) {
    g.fillStyle(C.night, 1)
    g.fillRect(0, 0, W, H)
    const rnd = seeded(83)
    for (let k = 0; k < 60; k++) {
        g.fillStyle(C.white, 0.4 + rnd() * 0.5)
        g.fillCircle(rnd() * W, rnd() * 420, 1.5 + rnd() * 2)
    }
    disc(g, 1100, 120, 50, C.butter, 0)
    disc(g, 1120, 108, 44, C.night, 0)
    g.fillStyle(C.nightLight, 1)
    g.fillRoundedRect(-40, 600, W + 80, 200, 60)
    box(g, -60, -40, 200, 800, 40, C.nightDark, 0)
    box(g, 1140, -40, 200, 800, 40, C.nightDark, 0)
    for (let k = 0; k < 14; k++) disc(g, (k / 13) * W, -20 + rnd() * 40, 70 + rnd() * 40, C.nightDark, 0)
    for (let k = 0; k < 30; k++) {
        const x = rnd() * W
        const y = 620 + rnd() * 90
        g.lineStyle(3, C.nightDark, 0.7)
        g.lineBetween(x, y, x - 4, y - 12)
    }
}
