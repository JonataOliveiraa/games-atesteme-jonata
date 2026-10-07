import Phaser from 'phaser'
import { BATHERS, NINA_LOOK } from '../data/cast'
import { BATHERS_SHEET, BG, DOGS_SHEET, LIFEGUARD_SHEET, PIECES_SHEET, type DogPose, type Sheet } from '../data/files'
import { H, SEA_Y, W } from '../data/layout'
import { C } from '../data/theme'
import type { DogId, Look, TraitId } from '../types'

type G = Phaser.GameObjects.Graphics
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

export function ensureArt(scene: Phaser.Scene) {
    if (!scene.textures.exists(BG)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        beach(g)
        g.generateTexture(BG, W, H)
        g.destroy()
    }
    bakeSheet(scene, BATHERS_SHEET, (g, i) => {
        const b = BATHERS[i]
        if (b) person(g, b.look, b.traits, 'stand')
    })
    const poses: DogPose[] = ['sit', 'run', 'jump', 'cry']
    const dogs: DogId[] = ['pacoca', 'salsicha', 'floco']
    bakeSheet(scene, DOGS_SHEET, (g, i) => dog(g, dogs[Math.floor(i / 4)], poses[i % 4]))
    bakeSheet(scene, PIECES_SHEET, (g, i) => PIECE_PAINT[i]?.(g))
    bakeSheet(scene, LIFEGUARD_SHEET, (g, i) => LIFEGUARD_PAINT[i]?.(g))
}

// ───────────────────────────────────────────── primitivas

function disc(g: G, x: number, y: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeCircle(x, y, r)
    }
}

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE, alpha = 1) {
    g.fillStyle(fill, alpha)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeEllipse(x, y, w, h)
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

function poly(g: G, flat: number[], fill: number, line = LINE) {
    const p: Phaser.Types.Math.Vector2Like[] = []
    for (let i = 0; i < flat.length; i += 2) p.push({ x: flat[i], y: flat[i + 1] })
    g.fillStyle(fill, 1)
    g.fillPoints(p, true)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokePoints(p, true)
    }
}

function limb(g: G, x1: number, y1: number, x2: number, y2: number, fill: number, width = 18) {
    g.lineStyle(width + 8, C.ink, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(C.ink, 1)
    g.fillCircle(x2, y2, (width + 8) / 2)
    g.lineStyle(width, fill, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(fill, 1)
    g.fillCircle(x2, y2, width / 2)
}

function topHalf(g: G, x: number, y: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.beginPath()
    g.arc(x, y, r, Math.PI, 0, false)
    g.closePath()
    g.fillPath()
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.beginPath()
        g.arc(x, y, r, Math.PI, 0, false)
        g.closePath()
        g.strokePath()
    }
}

function arcLine(g: G, x: number, y: number, r: number, from: number, to: number, width = 4, color: number = C.ink) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

// ───────────────────────────────────────────── os objetos-dado

export function capShape(g: G, x: number, y: number, r: number) {
    topHalf(g, x, y - r * 0.14, r * 1.06, C.cap)
    oval(g, x, y - r * 0.1, r * 1.9, r * 0.36, C.capDark)
    disc(g, x, y - r * 1.2, r * 0.1, C.white, 3)
}

export function hatShape(g: G, x: number, y: number, r: number) {
    oval(g, x, y - r * 0.32, r * 3.0, r * 0.6, C.straw)
    topHalf(g, x, y - r * 0.4, r * 0.98, C.straw)
    g.fillStyle(C.band, 1)
    g.fillRect(x - r * 0.9, y - r * 0.62, r * 1.8, r * 0.2)
    g.lineStyle(3, C.ink, 1)
    g.strokeRect(x - r * 0.9, y - r * 0.62, r * 1.8, r * 0.2)
}

export function glassesShape(g: G, x: number, y: number, dx: number, r: number) {
    g.lineStyle(Math.max(4, r * 0.28), C.lens, 1)
    g.lineBetween(x - dx + r, y - r * 0.2, x + dx - r, y - r * 0.2)
    disc(g, x - dx, y, r, C.lens, 4)
    disc(g, x + dx, y, r, C.lens, 4)
    g.fillStyle(C.white, 0.85)
    g.fillCircle(x - dx - r * 0.35, y - r * 0.35, r * 0.26)
    g.fillCircle(x + dx - r * 0.35, y - r * 0.35, r * 0.26)
}

export function bucketShape(g: G, x: number, y: number, s: number) {
    arcLine(g, x, y - 22 * s, 27 * s, Math.PI, 0, 5 * s)
    poly(g, [x - 30 * s, y - 24 * s, x + 30 * s, y - 24 * s, x + 22 * s, y + 26 * s, x - 22 * s, y + 26 * s], C.bucket, Math.max(3, 4 * s))
    oval(g, x, y - 24 * s, 60 * s, 14 * s, C.bucketDark, Math.max(3, 4 * s))
}

export function ringShape(g: G, x: number, y: number, s: number) {
    g.lineStyle(22 * s, C.ring, 1)
    g.strokeCircle(x, y, 24 * s)
    g.lineStyle(Math.max(3, 4 * s), C.ink, 1)
    g.strokeCircle(x, y, 35 * s)
    g.strokeCircle(x, y, 13 * s)
    g.lineStyle(6 * s, C.white, 0.7)
    g.beginPath()
    g.arc(x, y, 26 * s, Math.PI * 1.1, Math.PI * 1.45, false)
    g.strokePath()
}

export function ballShape(g: G, x: number, y: number, s: number) {
    const r = 32 * s
    g.fillStyle(C.white, 1)
    g.fillCircle(x, y, r)
    const colors = [C.ballRed, C.ballYellow, C.ballBlue]
    for (let k = 0; k < 3; k++) {
        g.fillStyle(colors[k], 1)
        g.slice(x, y, r, -Math.PI / 2 + (k * 2 * Math.PI) / 3, -Math.PI / 2 + (k * 2 * Math.PI) / 3 + Math.PI / 3, false)
        g.fillPath()
    }
    g.lineStyle(Math.max(3, 4 * s), C.ink, 1)
    g.strokeCircle(x, y, r)
    disc(g, x, y, r * 0.18, C.white, 3)
}

export function finShape(g: G, x: number, y: number, s: number) {
    poly(g, [x - 13 * s, y - 14 * s, x + 13 * s, y - 14 * s, x + 24 * s, y + 18 * s, x - 24 * s, y + 18 * s], C.fins, Math.max(3, 4 * s))
    g.lineStyle(Math.max(2, 3 * s), C.finsDark, 1)
    g.lineBetween(x - 8 * s, y - 4 * s, x - 13 * s, y + 14 * s)
    g.lineBetween(x + 8 * s, y - 4 * s, x + 13 * s, y + 14 * s)
}

// ───────────────────────────────────────────── gente

type Pose = 'stand' | 'talk' | 'cheer' | 'worry'

const FEET = 365
const R = 64

function person(g: G, look: Look, traits: TraitId[], pose: Pose, nina = false) {
    const cx = 128
    const total = look.build === 'adult' ? 330 : look.build === 'kid' ? 296 : 262
    const tw = look.build === 'adult' ? 92 : look.build === 'kid' ? 78 : 70
    const headY = FEET - total + R
    const neck = headY + R - 8
    const hip = neck + (FEET - neck) * 0.5
    const wears = (t: TraitId) => traits.includes(t)

    if (look.hairStyle === 'braids')
        [-1, 1].forEach(side => {
            for (let k = 0; k < 4; k++) disc(g, cx + side * (R - 4), headY + 6 + k * 20, 13, look.hair, 4)
        })
    if (look.hairStyle === 'ponytail') oval(g, cx + R + 8, headY - 4, 42, 82, look.hair)
    if (look.hairStyle === 'curlyLong') oval(g, cx, headY + 34, R * 2 + 40, R * 2 + 70, look.hair)
    if (look.hairStyle === 'afro') disc(g, cx, headY - 12, R * 1.42, look.hair)
    if (look.hairStyle === 'bun') disc(g, cx, headY - R - 8, 26, look.hair)

    const legW = look.build === 'adult' ? 24 : 20
    ;[-1, 1].forEach(side => {
        const fx = cx + side * 18
        limb(g, cx + side * 15, hip - 4, fx, FEET - 12, look.skin, legW)
        if (wears('fins')) finShape(g, fx + side * 4, FEET - 2, 1.05)
        else oval(g, fx + side * 4, FEET - 6, 34, 16, look.skin, 4)
    })

    if (look.top === 'suit') box(g, cx - tw / 2, neck, tw, hip - neck + 12, 24, look.suit)
    else {
        box(g, cx - tw / 2, neck, tw, hip - neck + 6, 24, look.top === 'tank' ? C.white : look.skin)
        const shortH = look.top === 'trunks' ? 30 : 46
        box(g, cx - tw / 2 - 3, hip - 16, tw + 6, shortH, 10, look.suit)
        if (look.top === 'tank') {
            g.fillStyle(C.white, 0.9)
            ;[
                [-22, 2],
                [6, 14],
                [26, 0],
            ].forEach(([dx, dy]) => g.fillCircle(cx + dx, hip + dy, 5))
        }
        if (look.top === 'open') {
            poly(g, [cx - tw / 2 - 4, neck + 2, cx - 10, neck + 2, cx - 16, hip - 14, cx - tw / 2 - 4, hip - 14], C.white, 4)
            poly(g, [cx + tw / 2 + 4, neck + 2, cx + 10, neck + 2, cx + 16, hip - 14, cx + tw / 2 + 4, hip - 14], C.white, 4)
        }
    }

    const sx = tw / 2 + 2
    const shoulder = neck + 16
    const hand = { left: { x: cx - sx - 16, y: hip + 4 }, right: { x: cx + sx + 16, y: hip + 4 } }
    if (pose === 'cheer') {
        hand.left = { x: cx - 92, y: headY - 46 }
        hand.right = { x: cx + 92, y: headY - 46 }
    } else if (pose === 'worry') {
        hand.left = { x: cx - R * 0.66, y: headY + 30 }
        hand.right = { x: cx + R * 0.66, y: headY + 30 }
    } else if (pose === 'talk') hand.right = { x: cx + R * 0.86, y: headY + 14 }

    const armW = look.build === 'adult' ? 18 : 16
    limb(g, cx - sx + 6, shoulder, hand.left.x, hand.left.y, look.skin, armW)
    limb(g, cx + sx - 6, shoulder, hand.right.x, hand.right.y, look.skin, armW)

    if (pose === 'stand') {
        if (wears('bucket')) bucketShape(g, hand.left.x - 2, hand.left.y + 34, 1)
        if (wears('ring')) ringShape(g, hand.left.x - 6, hand.left.y + 22, 1)
        if (wears('ball')) ballShape(g, hand.left.x - 8, hand.left.y + 22, 1)
        disc(g, hand.left.x, hand.left.y, 11, look.skin, 4)
    }

    disc(g, cx, headY, R, look.skin)
    const front = look.hairStyle
    if (front !== 'bald') topHalf(g, cx, headY - 4, R + 3, look.hair)
    if (front === 'bald')
        [-1, 1].forEach(side => oval(g, cx + side * (R - 6), headY - 4, 22, 30, look.hair, 4))
    if (front === 'bangs') box(g, cx - R + 8, headY - 14, R * 2 - 16, 22, 8, look.hair, 0)
    if (front === 'kinky' || front === 'curly' || front === 'curlyLong' || front === 'afro')
        for (let k = 0; k <= 6; k++) {
            const a = Math.PI + (k * Math.PI) / 6
            disc(g, cx + Math.cos(a) * (R + 2), headY - 4 + Math.sin(a) * (R + 2), 14, look.hair, 0)
        }
    if (front === 'spiky')
        for (let k = 0; k < 5; k++) {
            const x = cx - 44 + k * 22
            poly(g, [x - 12, headY - R + 10, x, headY - R - 22, x + 12, headY - R + 10], look.hair, 4)
        }

    const eyeY = headY + 12
    const eyeDX = 25
    if (pose === 'cheer') {
        arcLine(g, cx - eyeDX, eyeY + 4, 10, Math.PI * 1.1, Math.PI * 1.9, 5)
        arcLine(g, cx + eyeDX, eyeY + 4, 10, Math.PI * 1.1, Math.PI * 1.9, 5)
    } else if (!wears('glasses'))
        [-1, 1].forEach(side => {
            oval(g, cx + side * eyeDX, eyeY, 16, 22, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(cx + side * eyeDX - 3, eyeY - 5, 4)
        })
    g.fillStyle(C.blush, 0.65)
    g.fillEllipse(cx - 40, headY + 34, 20, 11)
    g.fillEllipse(cx + 40, headY + 34, 20, 11)

    if (look.beard !== undefined && look.top === 'open') oval(g, cx, headY + R * 0.72, R * 1.3, R * 0.72, look.beard, 4)
    if (look.beard !== undefined && look.top === 'tank') oval(g, cx, headY + 30, 40, 12, look.beard, 0)
    if (pose === 'worry' || pose === 'talk') oval(g, cx, headY + 42, 12, 14, C.eye, 0)
    else if (pose === 'cheer') topHalf(g, cx, headY + 36, 12, C.eye, 0)
    else arcLine(g, cx, headY + 32, 10, Math.PI * 0.15, Math.PI * 0.85, 4)

    if (wears('glasses')) glassesShape(g, cx, eyeY, eyeDX, 19)
    if (wears('cap')) capShape(g, cx, headY - 6, R)
    if (wears('hat')) hatShape(g, cx, headY - 2, R)

    if (nina) {
        g.lineStyle(3, C.whistle, 1)
        g.lineBetween(cx - 16, neck + 2, cx, neck + 30)
        g.lineBetween(cx + 16, neck + 2, cx, neck + 30)
        disc(g, cx, neck + 34, 8, C.whistle, 3)
        const r = hand.right
        box(g, r.x - 12, r.y - 30, 24, 46, 6, C.radio, 3)
        box(g, r.x + 4, r.y - 48, 6, 20, 2, C.radioDark, 2)
        disc(g, r.x, r.y + 4, 11, look.skin, 4)
    }
    if (pose !== 'stand') disc(g, hand.left.x, hand.left.y, 11, look.skin, 4)
}

// ───────────────────────────────────────────── cachorros

const DOG_COLOR: Record<DogId, { body: number; light: number; ear: number; long: boolean }> = {
    pacoca: { body: 0xe7a95a, light: 0xfff1dc, ear: 0xc0803a, long: false },
    salsicha: { body: 0x8a5432, light: 0xdba870, ear: 0x63391f, long: true },
    floco: { body: 0xffffff, light: 0xf3eee8, ear: 0xece6de, long: false },
}

function dogHead(g: G, dogId: DogId, x: number, y: number, r: number, face: 'sad' | 'happy' | 'joy' | 'cry', facing: 1 | 0) {
    const c = DOG_COLOR[dogId]
    ;[-1, 1].forEach(side => oval(g, x + side * r * 0.9, y + r * 0.25, r * 0.5, r * 1.1, c.ear))
    disc(g, x, y, r, c.body)
    if (dogId === 'floco') [-1, 0, 1].forEach(k => disc(g, x + k * r * 0.3, y - r * 0.9, r * 0.24, c.body, 3))
    const mx = x + facing * r * 0.35
    oval(g, mx, y + r * 0.42, r * 0.95, r * 0.62, c.light, 4)
    oval(g, mx + facing * r * 0.1, y + r * 0.26, r * 0.32, r * 0.22, C.ink, 0)
    const ex = x + facing * r * 0.15
    const eye = (sx: number) => {
        if (face === 'joy') arcLine(g, sx, y - r * 0.05, r * 0.14, Math.PI * 1.1, Math.PI * 1.9, 4)
        else {
            const big = face === 'cry' || face === 'sad' ? 1.25 : 1
            oval(g, sx, y - r * 0.08, r * 0.24 * big, r * 0.3 * big, C.eye, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(sx - r * 0.05, y - r * 0.16, r * 0.07 * big)
            if (face === 'cry' || face === 'sad') g.fillCircle(sx + r * 0.06, y, r * 0.04 * big)
        }
    }
    eye(ex - r * 0.38)
    eye(ex + r * 0.38)
    if (face === 'sad' || face === 'cry') {
        g.lineStyle(4, C.ink, 1)
        g.lineBetween(ex - r * 0.55, y - r * 0.32, ex - r * 0.2, y - r * 0.42)
        g.lineBetween(ex + r * 0.55, y - r * 0.32, ex + r * 0.2, y - r * 0.42)
    }
    if (face === 'cry') oval(g, ex - r * 0.45, y + r * 0.3, r * 0.14, r * 0.24, 0x8fd6ff, 3)
    if (face === 'joy' || face === 'happy') oval(g, mx, y + r * 0.78, r * 0.26, r * 0.32, C.heart, 3)
}

function dog(g: G, dogId: DogId, pose: DogPose) {
    const c = DOG_COLOR[dogId]
    const cx = 128
    const base = 230
    if (pose === 'sit') {
        arcLine(g, cx - 64, 176, 22, Math.PI * 0.6, Math.PI * 1.5, 9, C.ink)
        arcLine(g, cx - 64, 176, 22, Math.PI * 0.65, Math.PI * 1.45, 5, c.body)
        oval(g, cx - 6, 178, c.long ? 130 : 104, 104, c.body)
        oval(g, cx + 14, 176, 46, 62, c.light, 0)
        oval(g, cx - 34, base - 14, 64, 34, c.body)
        ;[4, 30].forEach(dx => box(g, cx + dx - 10, 184, 22, base - 184, 9, c.body, 4))
        dogHead(g, dogId, cx + 18, 104, 56, 'sad', 1)
    } else if (pose === 'run') {
        ;[
            [50, 168, 96, 212],
            [30, 172, 64, 222],
            [-58, 170, -104, 204],
            [-38, 174, -78, 222],
        ].forEach(([x1, y1, x2, y2]) => limb(g, cx + x1, y1, cx + x2, y2, c.body, 16))
        limb(g, cx - 80, 148, cx - 108, 116, c.body, 12)
        oval(g, cx - 12, 158, c.long ? 196 : 164, 76, c.body)
        oval(g, cx + 24, 98, 60, 26, c.ear)
        dogHead(g, dogId, cx + 68, 110, 48, 'happy', 1)
    } else if (pose === 'jump') {
        ;[-1, 1].forEach(side => oval(g, cx + side * 28, base - 10, 44, 30, c.body))
        g.lineStyle(4, C.ink, 1)
        g.lineBetween(cx + 66, 186, cx + 84, 176)
        g.lineBetween(cx + 68, 200, cx + 90, 198)
        oval(g, cx, 172, 96, 112, c.body)
        oval(g, cx, 176, 50, 66, c.light, 0)
        ;[-1, 1].forEach(side => {
            limb(g, cx + side * 30, 146, cx + side * 66, 96, c.body, 16)
            disc(g, cx + side * 66, 92, 13, c.light, 4)
        })
        dogHead(g, dogId, cx, 94, 58, 'joy', 0)
    } else {
        oval(g, cx - 22, base - 22, c.long ? 210 : 178, 58, c.body)
        ;[42, 74].forEach(dx => oval(g, cx + dx, base - 6, 36, 20, c.body, 4))
        dogHead(g, dogId, cx + 54, base - 50, 48, 'cry', 1)
    }
}

// ───────────────────────────────────────────── peças

const NINA_SCALE = 0.64

function nina(g: G, pose: Pose) {
    g.save()
    g.translateCanvas((256 - 256 * NINA_SCALE) / 2, 6)
    g.scaleCanvas(NINA_SCALE, NINA_SCALE)
    person(g, NINA_LOOK, [], pose, true)
    g.restore()
}

function radio(g: G) {
    const cx = 128
    box(g, cx + 18, 10, 14, 50, 4, C.radioDark, 4)
    box(g, cx - 54, 44, 108, 190, 26, C.radio)
    g.fillStyle(C.lifeguard, 1)
    g.fillRect(cx - 54, 84, 10, 120)
    g.fillRect(cx + 44, 84, 10, 120)
    g.lineStyle(5, C.radioDark, 1)
    for (let k = 0; k < 4; k++) g.lineBetween(cx - 30, 72 + k * 14, cx + 30, 72 + k * 14)
    disc(g, cx, 172, 36, C.white, 6)
    g.fillStyle(C.soft, 1)
    g.fillCircle(cx + 8, 180, 22)
    g.fillStyle(C.white, 1)
    g.fillCircle(cx - 4, 166, 26)
}

function towel(g: G) {
    const top = 112
    const bottom = 196
    poly(g, [44, top, 212, top, 238, bottom, 18, bottom], C.towel)
    g.fillStyle(C.towelStripe, 1)
    for (let k = 0; k < 4; k++) {
        const t0 = 0.12 + k * 0.22
        const t1 = t0 + 0.1
        const at = (t: number, y: number) => {
            const left = y === top ? 44 : 18
            const right = y === top ? 212 : 238
            return left + (right - left) * t
        }
        g.fillPoints(
            [
                { x: at(t0, top), y: top + 3 },
                { x: at(t1, top), y: top + 3 },
                { x: at(t1, bottom), y: bottom - 3 },
                { x: at(t0, bottom), y: bottom - 3 },
            ],
            true,
        )
    }
    g.lineStyle(LINE, C.ink, 1)
    g.strokePoints(
        [
            { x: 44, y: top },
            { x: 212, y: top },
            { x: 238, y: bottom },
            { x: 18, y: bottom },
        ],
        true,
    )
}

const LIFEGUARD_PAINT: Array<(g: G) => void> = [g => nina(g, 'talk'), g => nina(g, 'cheer'), g => nina(g, 'worry'), radio]

const PIECE_PAINT: Array<(g: G) => void> = [
    towel,
    g => capShape(g, 128, 168, 78),
    g => hatShape(g, 128, 176, 62),
    g => glassesShape(g, 128, 128, 52, 40),
    g => bucketShape(g, 128, 140, 2.6),
    g => ringShape(g, 128, 128, 2.8),
    g => ballShape(g, 128, 128, 2.9),
    g => {
        finShape(g, 84, 124, 2.2)
        finShape(g, 172, 124, 2.2)
    },
]

// ───────────────────────────────────────────── a praia

function beach(g: G) {
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, W, 100)
    g.fillStyle(C.skyLow, 1)
    g.fillRect(0, 64, W, 36)
    ;[
        [420, 40],
        [880, 28],
        [1150, 52],
    ].forEach(([x, y]) => {
        g.fillStyle(C.cloud, 0.95)
        g.fillCircle(x, y, 18)
        g.fillCircle(x + 24, y - 8, 22)
        g.fillCircle(x + 50, y, 18)
        g.fillRect(x, y, 50, 16)
    })

    g.fillStyle(C.seaDeep, 1)
    g.fillRect(0, 96, W, SEA_Y - 96)
    g.fillStyle(C.sea, 1)
    g.fillRect(0, 124, W, SEA_Y - 124)
    g.lineStyle(4, C.white, 0.55)
    for (let row = 0; row < 3; row++)
        for (let x = (row % 2) * 70; x < W; x += 140) {
            g.beginPath()
            g.arc(x + 40, 120 + row * 26, 16, Math.PI * 1.15, Math.PI * 1.85, false)
            g.strokePath()
        }

    g.fillStyle(C.sand, 1)
    g.fillRect(0, SEA_Y, W, H - SEA_Y)
    g.fillStyle(C.foam, 1)
    g.fillRect(0, SEA_Y - 8, W, 12)
    for (let x = 0; x < W + 20; x += 24) g.fillCircle(x, SEA_Y + 2, 11)
    g.fillStyle(C.sandShade, 0.55)
    for (let y = SEA_Y + 40; y < H; y += 46)
        for (let x = ((y / 46) % 2) * 60 + 20; x < W; x += 120) g.fillEllipse(x, y, 14, 5)

    g.fillStyle(C.sandShade, 1)
    g.fillEllipse(160, 664, 300, 46)
    box(g, 40, 120, 10, 250, 4, C.wood, 4)
    poly(g, [50, 124, 112, 140, 50, 158], C.lifeguard, 4)
    ;[56, 250].forEach(x => box(g, x, 380, 22, 286, 6, C.wood))
    g.lineStyle(6, C.ink, 1)
    g.lineBetween(70, 420, 254, 620)
    g.lineBetween(254, 420, 70, 620)
    g.lineStyle(10, C.wood, 1)
    g.lineBetween(70, 420, 254, 620)
    g.lineBetween(254, 420, 70, 620)
    box(g, 30, 296, 262, 14, 6, C.lifeguard)
    for (let x = 44; x < 290; x += 42) box(g, x, 306, 10, 64, 3, C.wood, 3)
    box(g, 22, 366, 278, 24, 8, C.lifeguard)
    box(g, 22, 384, 278, 10, 4, C.towerDark, 4)
    ;[290, 318].forEach(x => box(g, x, 392, 10, 272, 4, C.wood, 4))
    for (let y = 420; y < 660; y += 38) box(g, 290, y, 38, 8, 3, C.wood, 3)
}
