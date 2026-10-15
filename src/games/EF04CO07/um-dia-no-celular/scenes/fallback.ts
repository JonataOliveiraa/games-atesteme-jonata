import Phaser from 'phaser'
import { ADULTS_SHEET, APPS_SHEET, BACKDROPS, FRIENDS_SHEET, HAND, NINA_SHEET, THINGS2_SHEET, THINGS_SHEET, type Sheet } from '../data/files'
import { H, PHONE_ART, W } from '../data/layout'
import { C } from '../data/theme'
import type { Place } from '../types'

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

function bakeBackdrop(scene: Phaser.Scene, place: Place, paint: (g: G) => void) {
    const key = BACKDROPS[place]
    if (scene.textures.exists(key)) return
    lw = 5
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, W, H)
    g.destroy()
}

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, NINA_SHEET, 5, (g, i) => kid(g, KIDS.nina, NINA_POSES[i]))
    bakeSheet(scene, FRIENDS_SHEET, 5, (g, i) => kid(g, KIDS[FRIEND_ORDER[i].who], FRIEND_ORDER[i].pose))
    bakeSheet(scene, THINGS_SHEET, 5, thing)
    bakeSheet(scene, THINGS2_SHEET, 5, thing2)
    bakePhone(scene)
    bakeSheet(scene, APPS_SHEET, 5, app)
    bakeSheet(scene, ADULTS_SHEET, 5, adult)
    bakeBackdrop(scene, 'sala', classroom)
    bakeBackdrop(scene, 'patio', playground)
    bakeBackdrop(scene, 'quarto', bedroom)
    bakeBackdrop(scene, 'festa', party)
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
    g.lineStyle(width + lw * 2, INK, 1)
    g.lineBetween(a.x, a.y, b.x, b.y)
    g.fillStyle(INK, 1)
    g.fillCircle(a.x, a.y, width / 2 + lw)
    g.fillCircle(b.x, b.y, width / 2 + lw)
    g.lineStyle(width, fill, 1)
    g.lineBetween(a.x, a.y, b.x, b.y)
    g.fillStyle(fill, 1)
    g.fillCircle(a.x, a.y, width / 2)
    g.fillCircle(b.x, b.y, width / 2)
}

function arc(g: G, x: number, y: number, r: number, from: number, to: number, width = lw, color: number = INK) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, Phaser.Math.DegToRad(from), Phaser.Math.DegToRad(to), false)
    g.strokePath()
}

function line(g: G, a: P, b: P, width = lw, color: number = INK) {
    g.lineStyle(width, color, 1)
    g.lineBetween(a.x, a.y, b.x, b.y)
}

function sparkle(g: G, x: number, y: number, s: number, color: number = C.white) {
    g.fillStyle(color, 1)
    g.fillPoints(
        [
            { x, y: y - s },
            { x: x + s * 0.28, y: y - s * 0.28 },
            { x: x + s, y },
            { x: x + s * 0.28, y: y + s * 0.28 },
            { x, y: y + s },
            { x: x - s * 0.28, y: y + s * 0.28 },
            { x: x - s, y },
            { x: x - s * 0.28, y: y - s * 0.28 },
        ],
        true,
    )
}

function heart(g: G, x: number, y: number, s: number, fill: number, outline = 0) {
    const pts: P[] = []
    for (let i = 0; i <= 40; i++) {
        const t = (i / 40) * Math.PI * 2
        pts.push({
            x: x + (s * 16 * Math.pow(Math.sin(t), 3)) / 17,
            y: y - (s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))) / 17,
        })
    }
    poly(g, pts, fill, outline)
}

function star(g: G, x: number, y: number, r: number, fill: number, outline = 0) {
    const pts: P[] = []
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        const rr = i % 2 === 0 ? r : r * 0.45
        pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr })
    }
    poly(g, pts, fill, outline)
}

function shade(color: number, amount: number): number {
    const c = Phaser.Display.Color.IntegerToColor(color)
    const f = (v: number) => Phaser.Math.Clamp(Math.round(v * (1 + amount)), 0, 255)
    return Phaser.Display.Color.GetColor(f(c.red), f(c.green), f(c.blue))
}

// ───────────────────────────────────────────────────────── crianças

type Hair = 'puffs' | 'bob' | 'ponytail' | 'curly' | 'spiky'
type Arms =
    | 'down'
    | 'peace'
    | 'cover'
    | 'hurt'
    | 'bunny'
    | 'wave'
    | 'holdOpen'
    | 'holdOut'
    | 'forehead'
    | 'hug'
    | 'fists'
    | 'clasp'
    | 'thumb'
    | 'keyUp'
    | 'eat'
    | 'palms'
    | 'halfCover'
type Eyes = 'open' | 'joy' | 'wink' | 'cross' | 'down' | 'sly' | 'wide'
type Mouth = 'smile' | 'grin' | 'pout' | 'tongue' | 'o' | 'wobble' | 'smirk'

interface KidSpec {
    skin: number
    hair: number
    shirt: number
    bottom: number
    shoe: number
    style: Hair
    long: boolean
    tie: number
}

interface KidPose {
    arms: Arms
    eyes: Eyes
    mouth: Mouth
    brows?: 'worried' | 'sad' | 'up'
    sweat?: boolean
    blush?: boolean
    sparkles?: boolean
}

const KIDS: Record<'nina' | 'duda' | 'bia' | 'caio' | 'rafa', KidSpec> = {
    nina: { skin: C.skinBrown, hair: 0x2a2128, shirt: 0xff7f6e, bottom: 0x5b7fc2, shoe: 0xffffff, style: 'puffs', long: false, tie: 0xffd23f },
    duda: { skin: C.skinLight, hair: 0xe0763a, shirt: 0x4fc387, bottom: 0xcdb38a, shoe: 0xf6f1ff, style: 'bob', long: false, tie: 0x2fa66a },
    bia: { skin: C.skinTan, hair: 0x4a2c22, shirt: 0x9b7be6, bottom: 0x9aa0b5, shoe: 0xffffff, style: 'ponytail', long: true, tie: 0xb48cf2 },
    caio: { skin: C.skinMid, hair: 0x1f1a1f, shirt: 0x4f9be8, bottom: 0x3d4a66, shoe: 0xffffff, style: 'curly', long: false, tie: 0x2b2440 },
    rafa: { skin: C.skinLight, hair: 0x7a4a2a, shirt: 0xff9a3c, bottom: 0x4a6fb0, shoe: 0xffffff, style: 'spiky', long: false, tie: 0xffd23f },
}

const NINA_POSES: KidPose[] = [
    { arms: 'down', eyes: 'open', mouth: 'smile', blush: true },
    { arms: 'peace', eyes: 'wink', mouth: 'grin', blush: true, sparkles: true },
    { arms: 'cover', eyes: 'wide', mouth: 'o', sweat: true },
    { arms: 'hurt', eyes: 'down', mouth: 'pout', brows: 'sad' },
    { arms: 'bunny', eyes: 'cross', mouth: 'tongue', blush: true },
    { arms: 'wave', eyes: 'joy', mouth: 'grin', blush: true, sparkles: true },
]

const FRIEND_ORDER: Array<{ who: keyof typeof KIDS; pose: KidPose }> = [
    { who: 'duda', pose: { arms: 'holdOpen', eyes: 'sly', mouth: 'smirk', blush: true } },
    { who: 'duda', pose: { arms: 'holdOut', eyes: 'joy', mouth: 'wobble', sweat: true, blush: true } },
    { who: 'bia', pose: { arms: 'forehead', eyes: 'open', mouth: 'o', brows: 'worried', sweat: true } },
    { who: 'bia', pose: { arms: 'hug', eyes: 'joy', mouth: 'smile', blush: true, sparkles: true } },
    { who: 'bia', pose: { arms: 'fists', eyes: 'down', mouth: 'pout', brows: 'sad' } },
    { who: 'caio', pose: { arms: 'clasp', eyes: 'open', mouth: 'smile', brows: 'up', blush: true } },
    { who: 'caio', pose: { arms: 'thumb', eyes: 'joy', mouth: 'grin', blush: true, sparkles: true } },
    { who: 'caio', pose: { arms: 'keyUp', eyes: 'sly', mouth: 'smirk' } },
    { who: 'rafa', pose: { arms: 'eat', eyes: 'joy', mouth: 'grin', blush: true } },
    { who: 'rafa', pose: { arms: 'palms', eyes: 'wide', mouth: 'wobble', sweat: true, blush: true } },
    { who: 'rafa', pose: { arms: 'thumb', eyes: 'joy', mouth: 'grin', blush: true, sparkles: true } },
    { who: 'rafa', pose: { arms: 'halfCover', eyes: 'down', mouth: 'pout', brows: 'sad' } },
]

const HEAD = { x: 160, y: 158, r: 98 }
const FACE = { x: 160, y: 182, w: 172, h: 150 }
const SHOULDER_L = { x: 112, y: 272 }
const SHOULDER_R = { x: 208, y: 272 }
const ARM_W = 26
const HAND_R = 15

function kid(g: G, spec: KidSpec, pose: KidPose) {
    legs(g, spec)
    torso(g, spec)
    if (pose.arms === 'bunny' || pose.arms === 'holdOut') armsBehind(g, spec, pose.arms)
    hairBack(g, spec)
    disc(g, HEAD.x, HEAD.y, HEAD.r, spec.hair)
    g.fillStyle(spec.skin, 1)
    g.fillEllipse(FACE.x, FACE.y, FACE.w, FACE.h)
    face(g, spec, pose)
    hairFront(g, spec)
    if (spec.style === 'spiky') cakeSmudge(g)
    armsFront(g, spec, pose.arms)
    if (pose.sweat) sweat(g, 236, 112)
    if (pose.sparkles) {
        sparkle(g, 40, 120, 14, C.butter)
        sparkle(g, 282, 92, 10, C.butter)
        sparkle(g, 270, 150, 7, C.butter)
    }
}

function legs(g: G, spec: KidSpec) {
    const top = spec.long ? 320 : 344
    box(g, 126, top, 30, 404 - top - 14, 12, spec.long ? spec.bottom : spec.skin)
    box(g, 164, top, 30, 404 - top - 14, 12, spec.long ? spec.bottom : spec.skin)
    oval(g, 138, 396, 50, 26, spec.shoe)
    oval(g, 182, 396, 50, 26, spec.shoe)
}

function torso(g: G, spec: KidSpec) {
    box(g, 100, 316, 120, 44, 18, spec.bottom)
    box(g, 102, 250, 116, 86, 30, spec.shirt)
    if (spec.style === 'bob') {
        g.fillStyle(C.white, 0.85)
        ;[272, 296].forEach(y => g.fillRoundedRect(108, y, 104, 10, 5))
    }
    if (spec.style === 'puffs') star(g, 160, 290, 15, C.white)
    if (spec.style === 'ponytail') {
        arc(g, 160, 250, 34, 20, 160, 6, shade(spec.shirt, -0.25))
        line(g, { x: 150, y: 268 }, { x: 148, y: 296 }, 4, C.white)
        line(g, { x: 170, y: 268 }, { x: 172, y: 296 }, 4, C.white)
    }
    if (spec.style === 'spiky') {
        g.fillStyle(C.white, 0.9)
        g.fillCircle(146, 286, 6)
        g.fillCircle(178, 300, 5)
        g.fillCircle(168, 276, 4)
    }
}

function hairBack(g: G, spec: KidSpec) {
    switch (spec.style) {
        case 'puffs':
            disc(g, 82, 78, 50, spec.hair)
            disc(g, 238, 78, 50, spec.hair)
            oval(g, 112, 104, 34, 20, spec.tie)
            oval(g, 208, 104, 34, 20, spec.tie)
            break
        case 'bob':
            box(g, 56, 120, 208, 136, 60, spec.hair)
            break
        case 'ponytail':
            poly(
                g,
                [
                    { x: 236, y: 110 },
                    { x: 286, y: 150 },
                    { x: 296, y: 230 },
                    { x: 270, y: 270 },
                    { x: 252, y: 220 },
                    { x: 240, y: 170 },
                ],
                spec.hair,
            )
            break
        case 'curly':
            for (let i = 0; i < 9; i++) {
                const a = Phaser.Math.DegToRad(200 + i * 17.5)
                disc(g, HEAD.x + Math.cos(a) * 92, HEAD.y + Math.sin(a) * 92, 24, spec.hair)
            }
            break
        case 'spiky':
            for (let i = 0; i < 7; i++) {
                const a = Phaser.Math.DegToRad(205 + i * 22)
                const b = a + 0.22
                const c = a - 0.22
                poly(
                    g,
                    [
                        { x: HEAD.x + Math.cos(c) * 84, y: HEAD.y + Math.sin(c) * 84 },
                        { x: HEAD.x + Math.cos(a) * 128, y: HEAD.y + Math.sin(a) * 128 },
                        { x: HEAD.x + Math.cos(b) * 84, y: HEAD.y + Math.sin(b) * 84 },
                    ],
                    spec.hair,
                )
            }
            break
    }
}

function hairFront(g: G, spec: KidSpec) {
    const dark = shade(spec.hair, 0.35)
    switch (spec.style) {
        case 'puffs':
            poly(
                g,
                [
                    { x: 72, y: 150 },
                    { x: 110, y: 118 },
                    { x: 160, y: 108 },
                    { x: 210, y: 118 },
                    { x: 248, y: 150 },
                    { x: 214, y: 132 },
                    { x: 160, y: 126 },
                    { x: 106, y: 132 },
                ],
                spec.hair,
                0,
            )
            arc(g, 130, 96, 18, 200, 300, 4, dark)
            break
        case 'bob':
            poly(
                g,
                [
                    { x: 66, y: 168 },
                    { x: 76, y: 108 },
                    { x: 160, y: 84 },
                    { x: 244, y: 108 },
                    { x: 254, y: 168 },
                    { x: 230, y: 138 },
                    { x: 160, y: 132 },
                    { x: 90, y: 138 },
                ],
                spec.hair,
                0,
            )
            arc(g, 160, 152, 104, 214, 326, 12, spec.tie)
            break
        case 'ponytail':
            poly(
                g,
                [
                    { x: 68, y: 170 },
                    { x: 90, y: 104 },
                    { x: 170, y: 82 },
                    { x: 250, y: 120 },
                    { x: 252, y: 160 },
                    { x: 200, y: 124 },
                    { x: 120, y: 140 },
                ],
                spec.hair,
                0,
            )
            heart(g, 236, 92, 30, spec.tie, lw - 1)
            break
        case 'curly':
            for (let i = 0; i < 6; i++) disc(g, 92 + i * 27, 112 - Math.sin((i / 5) * Math.PI) * 18, 20, spec.hair, 0)
            break
        case 'spiky':
            poly(
                g,
                [
                    { x: 72, y: 150 },
                    { x: 100, y: 110 },
                    { x: 130, y: 132 },
                    { x: 160, y: 100 },
                    { x: 190, y: 132 },
                    { x: 220, y: 110 },
                    { x: 248, y: 150 },
                    { x: 160, y: 124 },
                ],
                spec.hair,
                0,
            )
            partyHat(g)
            break
    }
}

function partyHat(g: G) {
    poly(
        g,
        [
            { x: 168, y: 72 },
            { x: 228, y: 4 },
            { x: 232, y: 86 },
        ],
        0xffd23f,
    )
    line(g, { x: 186, y: 64 }, { x: 222, y: 36 }, 6, 0xff7f6e)
    line(g, { x: 206, y: 80 }, { x: 228, y: 58 }, 6, 0xff7f6e)
    disc(g, 228, 8, 10, 0xff7f6e)
}

function cakeSmudge(g: G) {
    g.fillStyle(C.cake, 1)
    g.fillEllipse(110, 214, 26, 16)
    g.fillEllipse(204, 222, 22, 14)
    g.fillEllipse(160, 196, 12, 9)
    g.fillStyle(C.frosting, 1)
    g.fillCircle(118, 206, 5)
    g.fillCircle(198, 214, 4)
    g.fillCircle(150, 232, 4)
}

function face(g: G, spec: KidSpec, pose: KidPose) {
    const ly = 178
    const lx = 122
    const rx = 198
    if (pose.blush) {
        g.fillStyle(C.cheek, 0.55)
        g.fillEllipse(100, 212, 30, 16)
        g.fillEllipse(220, 212, 30, 16)
    }
    const open = (x: number, y: number, scale = 1) => {
        g.fillStyle(C.eye, 1)
        g.fillEllipse(x, y, 30 * scale, 40 * scale)
        g.fillStyle(C.white, 1)
        g.fillCircle(x - 6 * scale, y - 9 * scale, 7 * scale)
        g.fillCircle(x + 6 * scale, y + 8 * scale, 3 * scale)
    }
    const joy = (x: number, y: number) => arc(g, x, y + 10, 15, 200, 340, 6)
    switch (pose.eyes) {
        case 'open':
            open(lx, ly)
            open(rx, ly)
            break
        case 'wide':
            open(lx, ly, 1.12)
            open(rx, ly, 1.12)
            break
        case 'joy':
            joy(lx, ly)
            joy(rx, ly)
            break
        case 'wink':
            open(lx, ly)
            joy(rx, ly)
            break
        case 'cross':
            disc(g, lx, ly, 17, C.white, 4)
            disc(g, rx, ly, 17, C.white, 4)
            g.fillStyle(C.eye, 1)
            g.fillCircle(lx + 8, ly + 2, 8)
            g.fillCircle(rx - 8, ly + 2, 8)
            break
        case 'down':
            open(lx, ly + 6, 0.9)
            open(rx, ly + 6, 0.9)
            g.fillStyle(spec.skin, 1)
            g.fillRect(lx - 18, ly - 22, 36, 20)
            g.fillRect(rx - 18, ly - 22, 36, 20)
            line(g, { x: lx - 16, y: ly - 2 }, { x: lx + 16, y: ly - 2 }, 5)
            line(g, { x: rx - 16, y: ly - 2 }, { x: rx + 16, y: ly - 2 }, 5)
            break
        case 'sly':
            open(lx, ly + 4, 0.9)
            open(rx, ly + 4, 0.9)
            g.fillStyle(spec.skin, 1)
            g.fillRect(lx - 18, ly - 20, 36, 16)
            g.fillRect(rx - 18, ly - 20, 36, 16)
            line(g, { x: lx - 16, y: ly - 4 }, { x: lx + 16, y: ly - 6 }, 5)
            line(g, { x: rx - 16, y: ly - 6 }, { x: rx + 16, y: ly - 4 }, 5)
            break
    }
    if (pose.brows === 'worried' || pose.brows === 'sad') {
        line(g, { x: lx - 16, y: ly - 30 }, { x: lx + 12, y: ly - 38 }, 5)
        line(g, { x: rx + 16, y: ly - 30 }, { x: rx - 12, y: ly - 38 }, 5)
    }
    if (pose.brows === 'up') {
        arc(g, lx, ly - 30, 14, 210, 330, 5)
        arc(g, rx, ly - 30, 14, 210, 330, 5)
    }
    const my = 222
    switch (pose.mouth) {
        case 'smile':
            arc(g, 160, my - 12, 16, 30, 150, 5)
            break
        case 'grin':
            g.fillStyle(0x7a2f3a, 1)
            g.beginPath()
            g.arc(160, my - 6, 20, 0, Math.PI, false)
            g.closePath()
            g.fillPath()
            g.fillStyle(0xff8fa3, 1)
            g.fillEllipse(160, my + 8, 20, 9)
            g.lineStyle(5, INK, 1)
            g.beginPath()
            g.arc(160, my - 6, 20, 0, Math.PI, false)
            g.closePath()
            g.strokePath()
            break
        case 'pout':
            oval(g, 160, my, 16, 12, 0xd9707e, 4)
            break
        case 'o':
            oval(g, 160, my, 18, 22, 0x7a2f3a, 4)
            break
        case 'tongue':
            g.fillStyle(0x7a2f3a, 1)
            g.fillEllipse(160, my - 2, 34, 20)
            oval(g, 166, my + 12, 22, 24, 0xff8fa3, 4)
            break
        case 'wobble':
            g.lineStyle(5, INK, 1)
            g.beginPath()
            g.moveTo(140, my)
            g.lineTo(148, my - 6)
            g.lineTo(156, my)
            g.lineTo(164, my - 6)
            g.lineTo(172, my)
            g.lineTo(180, my - 6)
            g.strokePath()
            break
        case 'smirk':
            arc(g, 170, my - 16, 16, 40, 140, 5)
            break
    }
}

function hand(g: G, x: number, y: number, skin: number, r = HAND_R) {
    disc(g, x, y, r, skin)
}

function armTo(g: G, from: P, to: P, spec: KidSpec, r = HAND_R) {
    limb(g, from, to, ARM_W, spec.shirt)
    hand(g, to.x, to.y, spec.skin, r)
}

function armsBehind(g: G, spec: KidSpec, arms: Arms) {
    if (arms === 'bunny') {
        limb(g, SHOULDER_L, { x: 64, y: 210 }, ARM_W, spec.shirt)
        limb(g, { x: 64, y: 210 }, { x: 90, y: 110 }, ARM_W, spec.skin)
        limb(g, SHOULDER_R, { x: 256, y: 210 }, ARM_W, spec.shirt)
        limb(g, { x: 256, y: 210 }, { x: 230, y: 110 }, ARM_W, spec.skin)
        limb(g, { x: 108, y: 70 }, { x: 96, y: 16 }, 16, spec.skin)
        limb(g, { x: 124, y: 70 }, { x: 128, y: 14 }, 16, spec.skin)
        limb(g, { x: 212, y: 70 }, { x: 224, y: 16 }, 16, spec.skin)
        limb(g, { x: 196, y: 70 }, { x: 192, y: 14 }, 16, spec.skin)
    }
    if (arms === 'holdOut') {
        limb(g, SHOULDER_L, { x: 64, y: 200 }, ARM_W, spec.shirt)
        limb(g, { x: 64, y: 200 }, { x: 92, y: 112 }, ARM_W, spec.skin)
    }
}

function armsFront(g: G, spec: KidSpec, arms: Arms) {
    const downL = { x: 96, y: 334 }
    const downR = { x: 224, y: 334 }
    switch (arms) {
        case 'down':
            armTo(g, SHOULDER_L, downL, spec)
            armTo(g, SHOULDER_R, downR, spec)
            break
        case 'hurt':
            armTo(g, SHOULDER_L, { x: 112, y: 336 }, spec)
            armTo(g, SHOULDER_R, { x: 208, y: 336 }, spec)
            break
        case 'fists':
            armTo(g, SHOULDER_L, { x: 92, y: 340 }, spec, 17)
            armTo(g, SHOULDER_R, { x: 228, y: 340 }, spec, 17)
            break
        case 'peace':
            armTo(g, SHOULDER_L, downL, spec)
            limb(g, SHOULDER_R, { x: 252, y: 228 }, ARM_W, spec.shirt)
            limb(g, { x: 252, y: 228 }, { x: 250, y: 190 }, ARM_W - 4, spec.skin)
            limb(g, { x: 244, y: 184 }, { x: 236, y: 146 }, 12, spec.skin)
            limb(g, { x: 256, y: 184 }, { x: 266, y: 148 }, 12, spec.skin)
            hand(g, 250, 194, spec.skin, 16)
            break
        case 'cover':
            limb(g, SHOULDER_L, { x: 120, y: 236 }, ARM_W, spec.shirt)
            limb(g, SHOULDER_R, { x: 200, y: 236 }, ARM_W, spec.shirt)
            box(g, 92, 150, 58, 72, 26, spec.skin)
            box(g, 170, 150, 58, 72, 26, spec.skin)
            line(g, { x: 108, y: 160 }, { x: 108, y: 196 }, 3)
            line(g, { x: 122, y: 158 }, { x: 122, y: 196 }, 3)
            line(g, { x: 198, y: 158 }, { x: 198, y: 196 }, 3)
            line(g, { x: 212, y: 160 }, { x: 212, y: 196 }, 3)
            break
        case 'bunny':
            break
        case 'wave':
            armTo(g, SHOULDER_L, downL, spec)
            limb(g, SHOULDER_R, { x: 262, y: 220 }, ARM_W, spec.shirt)
            limb(g, { x: 262, y: 220 }, { x: 272, y: 160 }, ARM_W - 4, spec.skin)
            hand(g, 272, 152, spec.skin, 19)
            arc(g, 272, 152, 36, 300, 340, 4)
            arc(g, 272, 152, 36, 200, 240, 4)
            break
        case 'holdOpen':
            limb(g, SHOULDER_L, { x: 92, y: 300 }, ARM_W, spec.shirt)
            limb(g, SHOULDER_R, { x: 228, y: 300 }, ARM_W, spec.shirt)
            openDiary(g, 160, 300, 0.62)
            hand(g, 92, 304, spec.skin)
            hand(g, 228, 304, spec.skin)
            break
        case 'holdOut':
            limb(g, SHOULDER_R, { x: 250, y: 300 }, ARM_W, spec.shirt)
            closedDiary(g, 266, 286, 0.5)
            hand(g, 250, 304, spec.skin)
            break
        case 'forehead':
            armTo(g, SHOULDER_L, downL, spec)
            limb(g, SHOULDER_R, { x: 244, y: 214 }, ARM_W, spec.shirt)
            limb(g, { x: 244, y: 214 }, { x: 206, y: 132 }, ARM_W - 4, spec.skin)
            hand(g, 204, 128, spec.skin, 18)
            break
        case 'hug':
            closedDiary(g, 160, 300, 0.52)
            limb(g, SHOULDER_L, { x: 186, y: 300 }, ARM_W, spec.shirt)
            limb(g, SHOULDER_R, { x: 134, y: 312 }, ARM_W, spec.shirt)
            hand(g, 190, 298, spec.skin)
            hand(g, 130, 314, spec.skin)
            break
        case 'clasp':
            limb(g, SHOULDER_L, { x: 148, y: 300 }, ARM_W, spec.shirt)
            limb(g, SHOULDER_R, { x: 172, y: 300 }, ARM_W, spec.shirt)
            oval(g, 160, 290, 40, 44, spec.skin)
            line(g, { x: 160, y: 272 }, { x: 160, y: 306 }, 3)
            break
        case 'thumb':
            armTo(g, SHOULDER_L, downL, spec)
            limb(g, SHOULDER_R, { x: 240, y: 286 }, ARM_W, spec.shirt)
            disc(g, 244, 270, 18, spec.skin)
            limb(g, { x: 244, y: 258 }, { x: 244, y: 230 }, 12, spec.skin)
            break
        case 'keyUp':
            armTo(g, SHOULDER_L, downL, spec)
            limb(g, SHOULDER_R, { x: 256, y: 220 }, ARM_W, spec.shirt)
            limb(g, { x: 256, y: 220 }, { x: 262, y: 160 }, ARM_W - 4, spec.skin)
            goldKey(g, 268, 112, 0.36, -30)
            hand(g, 262, 156, spec.skin, 17)
            break
        case 'eat':
            armTo(g, SHOULDER_L, downL, spec)
            limb(g, SHOULDER_R, { x: 248, y: 286 }, ARM_W, spec.shirt)
            limb(g, { x: 248, y: 286 }, { x: 214, y: 246 }, ARM_W - 4, spec.skin)
            cakeSlice(g, 214, 226)
            hand(g, 214, 250, spec.skin)
            break
        case 'palms':
            limb(g, SHOULDER_L, { x: 92, y: 262 }, ARM_W, spec.shirt)
            limb(g, SHOULDER_R, { x: 228, y: 262 }, ARM_W, spec.shirt)
            oval(g, 92, 244, 46, 52, spec.skin)
            oval(g, 228, 244, 46, 52, spec.skin)
            line(g, { x: 80, y: 228 }, { x: 80, y: 250 }, 3)
            line(g, { x: 92, y: 224 }, { x: 92, y: 250 }, 3)
            line(g, { x: 104, y: 228 }, { x: 104, y: 250 }, 3)
            line(g, { x: 216, y: 228 }, { x: 216, y: 250 }, 3)
            line(g, { x: 228, y: 224 }, { x: 228, y: 250 }, 3)
            line(g, { x: 240, y: 228 }, { x: 240, y: 250 }, 3)
            break
        case 'halfCover':
            armTo(g, SHOULDER_L, downL, spec)
            limb(g, SHOULDER_R, { x: 230, y: 250 }, ARM_W, spec.shirt)
            box(g, 166, 150, 64, 78, 28, spec.skin)
            break
    }
}

function sweat(g: G, x: number, y: number) {
    poly(
        g,
        [
            { x, y: y - 18 },
            { x: x + 11, y: y + 2 },
            { x: x + 8, y: y + 10 },
            { x, y: y + 13 },
            { x: x - 8, y: y + 10 },
            { x: x - 11, y: y + 2 },
        ],
        0x9fe0ff,
        4,
    )
}

// ───────────────────────────────────────────────────────── objetos

function openDiary(g: G, cx: number, cy: number, s: number) {
    const w = 260 * s
    const h = 170 * s
    box(g, cx - w / 2 - 8 * s, cy - h / 2 - 6 * s, w + 16 * s, h + 14 * s, 18 * s, C.diary)
    box(g, cx - w / 2, cy - h / 2, w / 2, h, 10 * s, C.paper, Math.max(3, lw * s))
    box(g, cx, cy - h / 2, w / 2, h, 10 * s, C.paper, Math.max(3, lw * s))
    for (let i = 0; i < 4; i++) {
        const y = cy - h / 2 + 36 * s + i * 30 * s
        g.lineStyle(Math.max(2, 4 * s), C.lilacDark, 0.9)
        g.beginPath()
        g.moveTo(cx - w / 2 + 18 * s, y)
        for (let k = 1; k <= 6; k++) g.lineTo(cx - w / 2 + 18 * s + k * 15 * s, y + (k % 2 ? -5 : 4) * s)
        g.strokePath()
        g.beginPath()
        g.moveTo(cx + 18 * s, y)
        for (let k = 1; k <= 6; k++) g.lineTo(cx + 18 * s + k * 15 * s, y + (k % 2 ? 4 : -5) * s)
        g.strokePath()
    }
    heart(g, cx - w / 4, cy + h / 2 - 22 * s, 20 * s, C.pink, 0)
    heart(g, cx + w / 4 + 20 * s, cy - h / 2 + 22 * s, 16 * s, C.coral, 0)
}

function closedDiary(g: G, cx: number, cy: number, s: number) {
    const w = 190 * s
    const h = 240 * s
    box(g, cx - w / 2 + 10 * s, cy - h / 2 + 8 * s, w, h, 18 * s, C.paper, Math.max(3, lw * s))
    box(g, cx - w / 2, cy - h / 2, w, h, 18 * s, C.diary, Math.max(3, lw * s))
    g.fillStyle(C.diaryDark, 1)
    g.fillRoundedRect(cx - w / 2, cy - h / 2, 24 * s, h, { tl: 18 * s, bl: 18 * s, tr: 0, br: 0 })
    heart(g, cx + 6 * s, cy - 10 * s, 70 * s, C.pink, Math.max(2, 4 * s))
    box(g, cx + w / 2 - 14 * s, cy - 18 * s, 34 * s, 40 * s, 8 * s, C.gold, Math.max(2, 4 * s))
}

function goldKey(g: G, cx: number, cy: number, s: number, angle = 0) {
    g.save()
    g.translateCanvas(cx, cy)
    g.rotateCanvas(Phaser.Math.DegToRad(angle))
    const ring = 62 * s
    disc(g, 0, -90 * s, ring, C.gold, Math.max(3, lw * s))
    heart(g, 0, -92 * s, 46 * s, C.coral, 0)
    box(g, -14 * s, -36 * s, 28 * s, 170 * s, 10 * s, C.gold, Math.max(3, lw * s))
    box(g, 6 * s, 72 * s, 44 * s, 22 * s, 6 * s, C.gold, Math.max(3, lw * s))
    box(g, 6 * s, 108 * s, 34 * s, 22 * s, 6 * s, C.gold, Math.max(3, lw * s))
    g.restore()
}

function cakeSlice(g: G, cx: number, cy: number) {
    poly(
        g,
        [
            { x: cx - 26, y: cy + 10 },
            { x: cx + 26, y: cy + 10 },
            { x: cx + 26, y: cy - 14 },
            { x: cx - 26, y: cy - 28 },
        ],
        C.cake,
        4,
    )
    g.fillStyle(C.frosting, 1)
    g.fillRect(cx - 24, cy - 16, 48, 7)
}

function thing(g: G, i: number) {
    switch (i) {
        case 0:
            openDiary(g, 160, 170, 1.08)
            g.lineStyle(5, INK, 1)
            arc(g, 270, 252, 16, 180, 360, 5)
            heart(g, 270, 268, 24, C.gold, 4)
            break
        case 1:
            closedDiary(g, 160, 160, 1.05)
            break
        case 2:
            cake(g)
            break
        case 3:
            drawing(g)
            break
        case 4:
            goldKey(g, 160, 170, 0.95, 20)
            break
        case 5:
            trashBin(g)
            break
    }
}

function cake(g: G) {
    oval(g, 160, 270, 260, 50, C.white)
    box(g, 50, 170, 220, 96, 20, C.cake)
    box(g, 82, 100, 156, 78, 18, C.cake)
    g.fillStyle(C.frosting, 1)
    g.fillRoundedRect(54, 168, 212, 22, 10)
    g.fillRoundedRect(86, 98, 148, 20, 10)
    ;[70, 104, 140, 176, 212, 246].forEach((x, k) => g.fillEllipse(x, 194, 22, 20 + (k % 2) * 10))
    ;[100, 140, 180, 220].forEach((x, k) => g.fillEllipse(x, 122, 20, 16 + (k % 2) * 8))
    const sprinkles = [0xff7f6e, 0x4fc387, 0x4f9be8, 0xffd23f, 0xb48cf2]
    for (let k = 0; k < 18; k++) {
        g.fillStyle(sprinkles[k % 5], 1)
        g.fillRoundedRect(64 + ((k * 37) % 190), 214 + ((k * 23) % 40), 12, 5, 2)
    }
    ;[120, 160, 200].forEach((x, k) => {
        box(g, x - 7, 50, 14, 52, 5, [0xff9fc4, 0x8fd3ff, 0xffd96a][k], 4)
        oval(g, x, 36, 16, 26, C.flame, 3)
        g.fillStyle(C.white, 0.9)
        g.fillEllipse(x, 40, 6, 10)
    })
}

function drawing(g: G) {
    g.save()
    g.translateCanvas(160, 160)
    g.rotateCanvas(Phaser.Math.DegToRad(-6))
    box(g, -128, -108, 256, 216, 8, C.paper)
    const colors = [0xff6b6b, 0xffa94d, 0xffd43b, 0x69db7c, 0x4dabf7, 0x9775fa]
    colors.forEach((c, k) => arc(g, -10, 40, 96 - k * 11, 190, 350, 9, c))
    disc(g, 82, -62, 24, 0xffd43b, 4)
    g.lineStyle(4, 0xffa94d, 1)
    for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        g.lineBetween(82 + Math.cos(a) * 30, -62 + Math.sin(a) * 30, 82 + Math.cos(a) * 42, -62 + Math.sin(a) * 42)
    }
    box(g, 40, 18, 66, 56, 4, 0xfff3bf, 4)
    poly(
        g,
        [
            { x: 30, y: 22 },
            { x: 73, y: -16 },
            { x: 116, y: 22 },
        ],
        0xff6b6b,
        4,
    )
    box(g, 64, 44, 18, 30, 3, 0x8d6e63, 3)
    line(g, { x: -116, y: 84 }, { x: 116, y: 84 }, 6, 0x69db7c)
    g.restore()
}

function trashBin(g: G) {
    box(g, 92, 108, 136, 170, 22, 0xb9b2d6)
    for (let k = 0; k < 3; k++) line(g, { x: 128 + k * 32, y: 136 }, { x: 128 + k * 32, y: 250 }, 6, 0x8f86b8)
    g.save()
    g.translateCanvas(96, 100)
    g.rotateCanvas(Phaser.Math.DegToRad(-28))
    box(g, -6, -24, 150, 26, 12, 0xd2ccec)
    box(g, 56, -40, 34, 18, 8, 0xd2ccec)
    g.restore()
    box(g, 140, 270, 40, 16, 6, 0x8f86b8)
}

// ───────────────────────────────────────────────────────── celular e mão

function bakePhone(scene: Phaser.Scene) {
    const layers: Array<[string, (g: G) => void]> = [
        [HAND.back, phoneBack],
        [HAND.body, phoneBody],
        [HAND.front, phoneFront],
    ]
    layers.forEach(([key, paint]) => {
        if (scene.textures.exists(key)) return
        lw = 3
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        paint(g)
        g.generateTexture(key, PHONE_ART.w, PHONE_ART.h)
        g.destroy()
    })
}

function phoneBody(g: G) {
    const b = PHONE_ART.body
    const s = PHONE_ART.screen
    box(g, b.x, b.y, b.w, b.h, 30, C.phoneCase)
    g.fillStyle(C.phoneCaseLight, 1)
    g.fillRoundedRect(b.x + 8, b.y + 6, b.w - 16, 8, 4)
    g.fillStyle(C.screenOff, 1)
    g.fillRoundedRect(s.x, s.y, s.w, s.h, s.r)
    g.fillStyle(0x2a2540, 1)
    g.fillCircle(b.x + b.w / 2, b.y + 15, 4)
    box(g, b.x - 4, b.y + 80, 6, 34, 3, C.phoneCaseDark, 2)
    box(g, b.x + b.w - 2, b.y + 110, 6, 40, 3, C.phoneCaseDark, 2)
}

function phoneBack(g: G) {
    const skin = C.skinTan
    poly(
        g,
        [
            { x: 30, y: 300 },
            { x: 120, y: 470 },
            { x: 250, y: 450 },
            { x: 300, y: 330 },
            { x: 320, y: 470 },
            { x: 270, y: 530 },
            { x: 150, y: 520 },
            { x: 40, y: 420 },
        ],
        skin,
    )
}

function phoneFront(g: G) {
    const skin = C.skinTan
    ;[270, 300, 340].forEach(y => box(g, 24, y, 40, 34, 16, skin))
    box(g, 250, 190, 50, 150, 24, skin)
    line(g, { x: 270, y: 210 }, { x: 270, y: 240 }, 3, shade(skin, -0.2))
}

// ───────────────────────────────────────────────────────── ícones

function app(g: G, i: number) {
    const tones = [0xff8fb3, 0xffd25e, 0x6fd6b4, 0xffa24a, 0x6cc4ff, 0xb3abd1, 0x3b4a8a, 0x4fbf7a]
    const tone = tones[i]
    g.fillStyle(C.shadow, 0.16)
    g.fillRoundedRect(22, 30, 212, 212, 58)
    box(g, 20, 20, 216, 216, 58, tone)
    g.fillStyle(C.white, 0.28)
    g.fillRoundedRect(36, 32, 184, 40, 20)
    const cx = 128
    const cy = 132
    switch (i) {
        case 0:
            box(g, cx - 62, cy - 40, 124, 92, 22, C.white)
            box(g, cx - 30, cy - 58, 50, 22, 8, C.white)
            disc(g, cx, cy + 6, 32, 0x4a3f6b)
            disc(g, cx, cy + 6, 16, 0x8fd3ff, 0)
            g.fillStyle(C.white, 1)
            g.fillCircle(cx - 6, cy, 6)
            g.fillStyle(0xff8fb3, 1)
            g.fillCircle(cx + 40, cy - 20, 7)
            break
        case 1:
            box(g, cx - 66, cy - 52, 132, 104, 14, C.white)
            poly(
                g,
                [
                    { x: cx - 58, y: cy + 44 },
                    { x: cx - 18, y: cy - 4 },
                    { x: cx + 12, y: cy + 22 },
                    { x: cx + 30, y: cy + 6 },
                    { x: cx + 58, y: cy + 44 },
                ],
                0x6fd6b4,
                4,
            )
            disc(g, cx + 32, cy - 22, 15, 0xffb340, 4)
            break
        case 2:
            box(g, cx - 66, cy - 54, 100, 70, 26, C.white)
            poly(
                g,
                [
                    { x: cx - 44, y: cy + 12 },
                    { x: cx - 52, y: cy + 32 },
                    { x: cx - 26, y: cy + 14 },
                ],
                C.white,
                0,
            )
            box(g, cx - 18, cy - 8, 86, 62, 24, 0xe7fff7)
            ;[-38, -16, 6].forEach(x => g.fillStyle(0x6fd6b4, 1).fillCircle(cx + x, cy - 20, 6))
            break
        case 3:
            disc(g, cx, cy, 62, 0xffe36a)
            g.fillStyle(C.eye, 1)
            g.fillCircle(cx - 22, cy - 8, 9)
            g.fillCircle(cx + 22, cy - 8, 9)
            poly(
                g,
                [
                    { x: cx - 14, y: cy + 10 },
                    { x: cx + 14, y: cy + 10 },
                    { x: cx, y: cy + 30 },
                ],
                0xff8a3c,
                4,
            )
            g.fillStyle(C.cheek, 0.7)
            g.fillEllipse(cx - 40, cy + 14, 18, 10)
            g.fillEllipse(cx + 40, cy + 14, 18, 10)
            break
        case 4:
            box(g, cx + 10, cy - 60, 16, 100, 6, C.white)
            disc(g, cx - 6, cy + 40, 26, C.white)
            poly(
                g,
                [
                    { x: cx + 20, y: cy - 60 },
                    { x: cx + 60, y: cy - 40 },
                    { x: cx + 60, y: cy - 20 },
                    { x: cx + 20, y: cy - 36 },
                ],
                C.white,
            )
            break
        case 5:
            for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2
                g.fillStyle(C.white, 1)
                g.save()
                g.translateCanvas(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52)
                g.rotateCanvas(a)
                g.fillRoundedRect(-14, -14, 28, 28, 6)
                g.restore()
            }
            disc(g, cx, cy, 54, C.white)
            disc(g, cx, cy, 20, tone)
            break
        case 6:
            poly(
                g,
                [
                    { x: cx - 10, y: cy - 30 },
                    { x: cx + 70, y: cy - 70 },
                    { x: cx + 70, y: cy + 70 },
                    { x: cx - 10, y: cy + 30 },
                ],
                0xffe36a,
                0,
            )
            box(g, cx - 70, cy - 26, 70, 52, 12, C.white)
            break
        case 7:
            poly(
                g,
                [
                    { x: cx - 70, y: cy - 40 },
                    { x: cx - 24, y: cy - 56 },
                    { x: cx + 24, y: cy - 40 },
                    { x: cx + 70, y: cy - 56 },
                    { x: cx + 70, y: cy + 50 },
                    { x: cx + 24, y: cy + 66 },
                    { x: cx - 24, y: cy + 50 },
                    { x: cx - 70, y: cy + 66 },
                ],
                C.white,
            )
            disc(g, cx, cy - 14, 26, 0xff6b6b)
            disc(g, cx, cy - 14, 9, C.white, 0)
            break
    }
}

// ───────────────────────────────────────────────────────── adultos

function adult(g: G, i: number) {
    const specs = [
        { skin: C.skinTan, hair: 0x6b4430, shirt: 0x3fb3a5, glasses: true, bun: true, white: false },
        { skin: C.skinBrown, hair: 0x231a20, shirt: 0xf2b632, glasses: false, bun: false, white: false },
        { skin: C.skinLight, hair: 0xeeeef6, shirt: 0xf48fb1, glasses: true, bun: true, white: true },
    ]
    const s = specs[i]
    box(g, 48, 186, 160, 90, 50, s.shirt)
    if (s.bun) disc(g, 128, 40, 30, s.hair)
    if (!s.bun) for (let k = 0; k < 9; k++) disc(g, 128 + Math.cos((k / 9) * Math.PI * 2) * 70, 116 + Math.sin((k / 9) * Math.PI * 2) * 66, 26, s.hair)
    disc(g, 128, 116, 76, s.hair)
    g.fillStyle(s.skin, 1)
    g.fillEllipse(128, 134, 128, 116)
    poly(
        g,
        [
            { x: 58, y: 120 },
            { x: 80, y: 66 },
            { x: 128, y: 52 },
            { x: 176, y: 66 },
            { x: 198, y: 120 },
            { x: 170, y: 92 },
            { x: 128, y: 86 },
            { x: 86, y: 92 },
        ],
        s.hair,
        0,
    )
    if (s.white) {
        arc(g, 104, 134, 12, 200, 340, 5)
        arc(g, 152, 134, 12, 200, 340, 5)
    } else {
        g.fillStyle(C.eye, 1)
        g.fillEllipse(104, 132, 20, 26)
        g.fillEllipse(152, 132, 20, 26)
        g.fillStyle(C.white, 1)
        g.fillCircle(100, 126, 5)
        g.fillCircle(148, 126, 5)
    }
    if (s.glasses) {
        g.lineStyle(4, INK, 1)
        g.strokeCircle(104, 132, 20)
        g.strokeCircle(152, 132, 20)
        g.lineBetween(124, 132, 132, 132)
    }
    g.fillStyle(C.cheek, 0.55)
    g.fillEllipse(84, 158, 22, 12)
    g.fillEllipse(172, 158, 22, 12)
    arc(g, 128, 156, 14, 30, 150, 5)
}

// ───────────────────────────────────────────────────────── fundos

function wall(g: G, top: number, bottom: number, floorY: number, floor: number, floorDark: number) {
    g.fillGradientStyle(top, top, bottom, bottom, 1)
    g.fillRect(0, 0, W, floorY)
    g.fillStyle(floor, 1)
    g.fillRect(0, floorY, W, H - floorY)
    g.fillStyle(floorDark, 1)
    for (let x = -40; x < W; x += 120) g.fillRect(x, floorY, 4, H - floorY)
    g.fillStyle(C.shadow, 0.08)
    g.fillRect(0, floorY, W, 10)
}

function windowPane(g: G, x: number, y: number, w: number, h: number, sky: number) {
    box(g, x - 10, y - 10, w + 20, h + 20, 14, 0xffffff)
    box(g, x, y, w, h, 8, sky)
    g.fillStyle(C.white, 0.7)
    g.fillEllipse(x + w * 0.3, y + h * 0.35, w * 0.32, h * 0.14)
    g.fillEllipse(x + w * 0.42, y + h * 0.3, w * 0.24, h * 0.16)
    line(g, { x: x + w / 2, y }, { x: x + w / 2, y: y + h }, 8, 0xffffff)
    line(g, { x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }, 8, 0xffffff)
}

function classroom(g: G) {
    wall(g, 0xd9f2e8, 0xc8eadc, 520, 0xe9c99a, 0xd8b484)
    box(g, 50, 110, 420, 230, 16, 0x3f7a5c)
    g.lineStyle(10, 0xb98a5a, 1)
    g.strokeRoundedRect(50, 110, 420, 230, 16)
    g.lineStyle(5, 0xf4f4ea, 0.85)
    g.strokeCircle(130, 180, 26)
    for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        g.lineBetween(130 + Math.cos(a) * 34, 180 + Math.sin(a) * 34, 130 + Math.cos(a) * 46, 180 + Math.sin(a) * 46)
    }
    g.beginPath()
    g.moveTo(200, 280)
    for (let k = 1; k <= 10; k++) g.lineTo(200 + k * 22, 280 + (k % 2 ? -14 : 8))
    g.strokePath()
    for (let k = 0; k < 5; k++) g.strokeCircle(360 + (k % 2) * 14, 180 + k * 14, 8)
    box(g, 520, 120, 210, 160, 12, 0xd9a86c)
    const papers = [0xfff3bf, 0xd0ebff, 0xffd8e8, 0xd3f9d8]
    papers.forEach((p, k) => {
        box(g, 536 + (k % 2) * 98, 136 + Math.floor(k / 2) * 70, 84, 58, 4, p, 4)
        g.fillStyle(0xff6b6b, 1)
        g.fillCircle(578 + (k % 2) * 98, 140 + Math.floor(k / 2) * 70, 6)
    })
    windowPane(g, 790, 110, 180, 200, 0xbfe6ff)
    for (let k = 0; k < 2; k++) {
        const x = 90 + k * 380
        box(g, x, 560, 300, 30, 10, 0xf2d4a6)
        box(g, x + 20, 590, 22, 110, 6, 0x9a7a5a)
        box(g, x + 258, 590, 22, 110, 6, 0x9a7a5a)
        box(g, x + 60, 528, 110, 34, 6, k ? 0x8fd3ff : 0xff9fc4, 4)
        box(g, x + 190, 536, 70, 26, 6, 0xffd96a, 4)
    }
    box(g, 1000, 360, 240, 170, 12, 0xd8b484)
    ;[0xff9fc4, 0x8fd3ff, 0xffd96a, 0x7fdcc0, 0xc9b6f5].forEach((c, k) => box(g, 1018 + k * 42, 380, 32, 60, 4, c, 3))
}

function playground(g: G) {
    g.fillGradientStyle(0xa9dcff, 0xa9dcff, 0xd9f1ff, 0xd9f1ff, 1)
    g.fillRect(0, 0, W, 330)
    g.fillStyle(C.white, 0.85)
    ;[
        [200, 90, 140],
        [280, 80, 110],
        [900, 120, 160],
        [990, 104, 120],
    ].forEach(([x, y, w]) => g.fillEllipse(x, y, w, w * 0.42))
    box(g, -10, 250, W + 20, 260, 0, 0xfff1d6)
    const mural = [0xff9fc4, 0x8fd3ff, 0xffd96a, 0x7fdcc0]
    mural.forEach((c, k) => {
        g.fillStyle(c, 1)
        if (k % 2) g.fillCircle(470 + k * 90, 360, 34)
        else g.fillRoundedRect(436 + k * 90, 326, 68, 68, 14)
    })
    g.fillStyle(0xe9d3a6, 1)
    g.fillRect(0, 500, W, H - 500)
    g.fillStyle(0xdcc394, 1)
    for (let k = 0; k < 14; k++) g.fillEllipse((k * 97) % W, 560 + ((k * 53) % 140), 40, 12)
    const hop = [0xff9fc4, 0x8fd3ff, 0xffd96a, 0x7fdcc0, 0xc9b6f5]
    hop.forEach((c, k) => box(g, 420 + k * 70, 600 - (k % 2) * 30, 62, 54, 6, c, 4))
    box(g, 120, 160, 50, 360, 16, 0xb07a4a)
    ;[
        [80, 140, 110],
        [160, 110, 120],
        [230, 160, 100],
        [140, 190, 110],
    ].forEach(([x, y, r]) => disc(g, x, y, r, 0x6fcf8a))
    g.fillStyle(0x8fe0a2, 1)
    g.fillCircle(130, 110, 40)
    box(g, 220, 470, 280, 26, 10, 0xc98f5a)
    box(g, 236, 496, 18, 70, 6, 0x9a6a3e)
    box(g, 466, 496, 18, 70, 6, 0x9a6a3e)
    box(g, 220, 420, 280, 22, 10, 0xc98f5a)
    for (let k = 0; k < 9; k++) {
        box(g, 840 + k * 50, 430, 14, 80, 6, 0xf4e6c8, 4)
        disc(g, 847 + k * 50, 420, 12, [0xff9fc4, 0xffd96a, 0xc9b6f5][k % 3], 4)
    }
}

function bedroom(g: G) {
    wall(g, 0xeee6fd, 0xe2d8fa, 540, 0xf1d6be, 0xe2c2a5)
    windowPane(g, 90, 90, 230, 210, 0xffd9b0)
    box(g, 72, 82, 30, 260, 12, 0xff9fc4)
    box(g, 308, 82, 30, 260, 12, 0xff9fc4)
    box(g, 40, 420, 420, 150, 30, 0xf7f2ff)
    box(g, 40, 470, 420, 130, 24, 0x7c8ce0)
    for (let k = 0; k < 7; k++) star(g, 80 + k * 58, 520 + (k % 2) * 30, 12, 0xffd96a)
    box(g, 60, 400, 120, 60, 24, C.white)
    disc(g, 400, 432, 40, 0xffc6a0)
    disc(g, 376, 398, 16, 0xffc6a0)
    disc(g, 424, 398, 16, 0xffc6a0)
    g.fillStyle(C.eye, 1)
    g.fillCircle(388, 430, 5)
    g.fillCircle(412, 430, 5)
    box(g, 520, 440, 300, 30, 10, 0xd9a86c)
    box(g, 536, 470, 20, 140, 6, 0xb0834e)
    box(g, 784, 470, 20, 140, 6, 0xb0834e)
    box(g, 560, 340, 18, 100, 6, 0x8f7bd6)
    poly(
        g,
        [
            { x: 530, y: 350 },
            { x: 608, y: 350 },
            { x: 590, y: 300 },
            { x: 548, y: 300 },
        ],
        0xffd96a,
    )
    box(g, 690, 392, 50, 50, 10, 0x8fd3ff)
    ;[0xff6b6b, 0x4dabf7, 0x69db7c].forEach((c, k) => box(g, 698 + k * 14, 362, 10, 40, 4, c, 3))
    box(g, 960, 150, 150, 120, 10, 0xffffff)
    box(g, 972, 162, 126, 96, 6, 0xbfe6ff, 3)
    disc(g, 1030, 216, 20, 0xffd96a, 3)
}

function party(g: G) {
    wall(g, 0xffead2, 0xffdfc0, 540, 0xe7c09a, 0xd6aa82)
    g.lineStyle(4, INK, 1)
    g.beginPath()
    g.moveTo(0, 90)
    g.lineTo(820, 140)
    g.strokePath()
    const flags = [0xff7f6e, 0xffd96a, 0x7fdcc0, 0x8fd3ff, 0xc9b6f5, 0xff9fc4]
    for (let k = 0; k < 13; k++) {
        const x = 20 + k * 62
        const y = 92 + (x / 820) * 50
        poly(
            g,
            [
                { x, y },
                { x: x + 44, y: y + 3 },
                { x: x + 22, y: y + 46 },
            ],
            flags[k % flags.length],
            4,
        )
    }
    const balloons: Array<[number, number, number]> = [
        [90, 220, 0xff7f6e],
        [150, 180, 0x8fd3ff],
        [200, 240, 0xffd96a],
        [60, 300, 0xc9b6f5],
        [130, 290, 0x7fdcc0],
    ]
    balloons.forEach(([x, y]) => line(g, { x, y: y + 46 }, { x: 140, y: 470 }, 3))
    balloons.forEach(([x, y, c]) => {
        oval(g, x, y, 74, 90, c)
        g.fillStyle(C.white, 0.6)
        g.fillEllipse(x - 14, y - 18, 16, 24)
    })
    box(g, 30, 440, 130, 90, 10, 0x8fd3ff)
    box(g, 30, 470, 130, 16, 0, 0xff7f6e, 0)
    box(g, 88, 440, 16, 90, 0, 0xff7f6e, 0)
    box(g, 60, 380, 90, 64, 10, 0xffd96a)
    box(g, 60, 404, 90, 14, 0, 0x7fdcc0, 0)
    box(g, 300, 470, 480, 40, 14, 0xff9fc4)
    for (let k = 0; k < 8; k++) {
        g.fillStyle(C.white, 0.85)
        g.fillCircle(330 + k * 60, 492, 8)
    }
    box(g, 300, 506, 480, 70, 0, 0xffc2dc)
    box(g, 330, 576, 20, 130, 6, 0xb0834e)
    box(g, 730, 576, 20, 130, 6, 0xb0834e)
    ;[340, 720].forEach((x, k) => box(g, x, 420, 44, 52, 10, k ? 0x8fd3ff : 0xffd96a))
    oval(g, 700, 456, 90, 34, 0xffffff)
    ;[0xff7f6e, 0x7fdcc0, 0xc9b6f5].forEach((c, k) => disc(g, 682 + k * 18, 446, 9, c, 3))
}

// ───────────────────────────────────────────────────────── objetos do N2 e do N3

function thing2(g: G, i: number) {
    switch (i) {
        case 0:
            disc(g, 160, 166, 110, 0xf5b52e)
            disc(g, 160, 160, 110, C.gold)
            disc(g, 160, 160, 82, 0xffdc72, 4)
            ;[
                [130, 130],
                [190, 130],
                [112, 166],
                [208, 166],
            ].forEach(([x, y]) => disc(g, x, y, 14, 0xf5b52e, 0))
            oval(g, 160, 190, 56, 46, 0xf5b52e, 0)
            g.fillStyle(C.white, 0.7)
            g.fillEllipse(110, 100, 34, 18)
            break
        case 1:
            box(g, 50, 28, 220, 270, 10, C.paper)
            g.fillStyle(0x8fd3ff, 1)
            g.fillRect(60, 40, 200, 46)
            ;[
                [40, 22, -20],
                [244, 22, 20],
                [40, 280, 20],
                [244, 280, -20],
            ].forEach(([x, y, a]) => {
                g.save()
                g.translateCanvas(x + 18, y + 8)
                g.rotateCanvas(Phaser.Math.DegToRad(a))
                g.fillStyle(0xffd96a, 0.9)
                g.fillRect(-20, -8, 40, 16)
                g.restore()
            })
            break
        case 2:
            box(g, 50, 90, 220, 150, 14, 0xb48cf2)
            poly(
                g,
                [
                    { x: 50, y: 96 },
                    { x: 160, y: 176 },
                    { x: 270, y: 96 },
                ],
                0x9b7be6,
            )
            poly(
                g,
                [
                    { x: 196, y: 56 },
                    { x: 262, y: 30 },
                    { x: 262, y: 108 },
                    { x: 196, y: 82 },
                ],
                0xffd96a,
            )
            box(g, 178, 56, 22, 28, 6, 0xffd96a)
            sparkle(g, 60, 60, 16, 0xffd96a)
            sparkle(g, 286, 160, 12, 0xffd96a)
            break
        case 3:
            box(g, 62, 24, 214, 276, 10, C.paper)
            g.lineStyle(3, 0x8fb8e8, 1)
            for (let y = 70; y < 290; y += 28) g.lineBetween(84, y, 266, y)
            g.lineStyle(3, 0xff9fc4, 1)
            g.lineBetween(100, 30, 100, 294)
            for (let y = 44; y < 290; y += 30) {
                g.lineStyle(5, INK, 1)
                g.strokeCircle(62, y, 9)
            }
            break
        case 4:
            box(g, 70, 190, 180, 120, 60, 0x6e6890)
            disc(g, 160, 140, 74, 0x6e6890)
            disc(g, 160, 150, 50, 0x3b3654, 0)
            g.fillStyle(0x8e88a6, 1)
            g.fillEllipse(130, 112, 26, 16)
            break
    }
}
