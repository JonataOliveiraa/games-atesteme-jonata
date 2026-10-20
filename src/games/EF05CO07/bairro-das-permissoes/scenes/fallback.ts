import Phaser from 'phaser'
import { BAG_KEY, DECO2_SHEET, DECO_SHEET, GRASS_KEY, HOUSE_SHEET, ICON_SHEET, KID_SHEET, type Sheet } from '../data/files'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics

interface P {
    x: number
    y: number
}

const rr = (g: G, x: number, y: number, w: number, h: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, Math.max(0.5, Math.min(r, w / 2, h / 2)))
}

const dot = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillCircle(x, y, r)
}

const tri = (g: G, a: P, b: P, c: P, color: number) => {
    g.fillStyle(color, 1)
    g.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y)
}

const limb = (g: G, a: P, b: P, w: number, color: number) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    g.save()
    g.translateCanvas(a.x, a.y)
    g.rotateCanvas(Math.atan2(b.y - a.y, b.x - a.x))
    rr(g, -w / 2, -w / 2, len + w, w, w / 2, color)
    g.restore()
}

const toward = (a: P, b: P, extra: number): P => {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
    return { x: b.x + ((b.x - a.x) / len) * extra, y: b.y + ((b.y - a.y) / len) * extra }
}

const darken = (color: number, k: number) => {
    const r = Math.round(((color >> 16) & 0xff) * k)
    const gg = Math.round(((color >> 8) & 0xff) * k)
    const b = Math.round((color & 0xff) * k)
    return (r << 16) | (gg << 8) | b
}

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
    bakeSheet(scene, KID_SHEET, kidCell)
    bakeSheet(scene, HOUSE_SHEET, house)
    bakeSheet(scene, ICON_SHEET, icon)
    bakeSheet(scene, DECO_SHEET, deco)
    bakeSheet(scene, DECO2_SHEET, deco2)
    bakeImage(scene, GRASS_KEY, 512, 512, grass)
    bakeImage(scene, BAG_KEY, 128, 128, bag)
}

function bag(g: G) {
    g.lineStyle(9, C.packDark, 1)
    g.strokeRoundedRect(44, 8, 40, 34, 14)
    rr(g, 16, 30, 96, 90, 28, C.packDark)
    rr(g, 18, 26, 92, 88, 28, C.pack)
    rr(g, 18, 26, 92, 42, 21, C.packFlap)
    rr(g, 56, 52, 16, 22, 6, C.butter)
    rr(g, 34, 80, 60, 30, 13, C.packDark)
    rr(g, 42, 86, 44, 6, 3, C.pack)
}

type Facing = 'down' | 'up' | 'side'

interface Pose {
    feet: [P, P]
    hands: [P, P]
    bob: number
}

const CX = 96

const FRONT_RUN: Pose[] = [
    { feet: [{ x: CX - 16, y: 160 }, { x: CX + 15, y: 170 }], hands: [{ x: CX - 40, y: 102 }, { x: CX + 38, y: 118 }], bob: 0 },
    { feet: [{ x: CX - 15, y: 170 }, { x: CX + 15, y: 166 }], hands: [{ x: CX - 39, y: 110 }, { x: CX + 39, y: 110 }], bob: -3 },
    { feet: [{ x: CX - 15, y: 170 }, { x: CX + 16, y: 160 }], hands: [{ x: CX - 38, y: 118 }, { x: CX + 40, y: 102 }], bob: 0 },
    { feet: [{ x: CX - 15, y: 166 }, { x: CX + 15, y: 170 }], hands: [{ x: CX - 39, y: 110 }, { x: CX + 39, y: 110 }], bob: -3 },
]

const FRONT_IDLE: Pose = { feet: [{ x: CX - 15, y: 170 }, { x: CX + 15, y: 170 }], hands: [{ x: CX - 37, y: 114 }, { x: CX + 37, y: 114 }], bob: 0 }

const SIDE_RUN: Pose[] = [
    { feet: [{ x: CX - 28, y: 160 }, { x: CX + 26, y: 170 }], hands: [{ x: CX + 26, y: 100 }, { x: CX - 26, y: 110 }], bob: 0 },
    { feet: [{ x: CX - 8, y: 164 }, { x: CX + 6, y: 170 }], hands: [{ x: CX + 4, y: 114 }, { x: CX - 4, y: 114 }], bob: -3 },
    { feet: [{ x: CX + 26, y: 170 }, { x: CX - 28, y: 160 }], hands: [{ x: CX - 26, y: 110 }, { x: CX + 26, y: 100 }], bob: 0 },
    { feet: [{ x: CX + 6, y: 170 }, { x: CX - 8, y: 164 }], hands: [{ x: CX - 4, y: 114 }, { x: CX + 4, y: 114 }], bob: -3 },
]

const SIDE_IDLE: Pose = { feet: [{ x: CX - 6, y: 170 }, { x: CX + 8, y: 170 }], hands: [{ x: CX + 2, y: 116 }, { x: CX - 2, y: 116 }], bob: 0 }

const SKID: Pose = { feet: [{ x: CX - 14, y: 170 }, { x: CX + 36, y: 168 }], hands: [{ x: CX - 40, y: 74 }, { x: CX + 30, y: 70 }], bob: 0 }

function kidCell(g: G, i: number) {
    const row = Math.floor(i / 4)
    const col = i % 4
    if (row === 0) return kid(g, 'down', FRONT_RUN[col], true)
    if (row === 1) return kid(g, 'up', FRONT_RUN[col], true)
    if (row === 2) return kid(g, 'side', SIDE_RUN[col], true)
    if (col === 0) return kid(g, 'down', FRONT_IDLE, false)
    if (col === 1) return kid(g, 'up', FRONT_IDLE, false)
    if (col === 2) return kid(g, 'side', SIDE_IDLE, false)
    g.save()
    g.translateCanvas(CX, 176)
    g.rotateCanvas(-0.24)
    g.translateCanvas(-CX, -176)
    kid(g, 'side', SKID, false)
    g.restore()
    rr(g, CX - 64, 168, 20, 8, 4, C.dust)
    rr(g, CX - 88, 162, 14, 7, 3.5, C.dust)
    rr(g, CX - 54, 154, 12, 6, 3, C.dust)
}

function shoe(g: G, at: P, facing: Facing) {
    if (facing === 'side') {
        rr(g, at.x - 16, at.y - 7, 32, 13, 6.5, C.shoe)
        dot(g, at.x - 11, at.y + 5, 4.5, C.wheel)
        return
    }
    rr(g, at.x - 13, at.y - 7, 26, 13, 6.5, facing === 'up' ? C.shoeDark : C.shoe)
    dot(g, at.x, at.y + 6, 4, C.wheel)
}

function kid(g: G, facing: Facing, pose: Pose, moving: boolean) {
    const b = pose.bob
    const side = facing === 'side'
    const hips: [P, P] = side
        ? [
              { x: CX - 4, y: 130 + b },
              { x: CX + 4, y: 130 + b },
          ]
        : [
              { x: CX - 11, y: 130 + b },
              { x: CX + 11, y: 130 + b },
          ]
    const shoulders: [P, P] = side
        ? [
              { x: CX - 2, y: 76 + b },
              { x: CX + 2, y: 76 + b },
          ]
        : [
              { x: CX - 29, y: 76 + b },
              { x: CX + 29, y: 76 + b },
          ]
    const knee = (foot: P): P => ({ x: foot.x, y: foot.y - 13 })
    const elbow = (sh: P, hand: P): P => {
        const len = Math.hypot(hand.x - sh.x, hand.y - sh.y) || 1
        return { x: hand.x - ((hand.x - sh.x) / len) * 11, y: hand.y - ((hand.y - sh.y) / len) * 11 }
    }

    const leg = (k: 0 | 1) => {
        limb(g, hips[k], knee(pose.feet[k]), 13, C.skin)
        shoe(g, pose.feet[k], facing)
    }
    const arm = (k: 0 | 1, tone: number) => {
        const end = elbow(shoulders[k], pose.hands[k])
        limb(g, shoulders[k], end, 12, tone)
        const hand = toward(shoulders[k], end, 10)
        dot(g, hand.x, hand.y, 7.5, C.skin)
    }

    if (side) {
        arm(1, C.shirtDark)
        leg(0)
        rr(g, CX - 40, 70 + b, 30, 50, 12, C.pack)
        rr(g, CX - 40, 70 + b, 30, 18, 9, C.packFlap)
    } else {
        leg(0)
        leg(1)
    }

    if (side) {
        rr(g, CX - 21, 66 + b, 42, 54, 15, C.shirt)
        rr(g, CX - 21, 112 + b, 42, 22, 9, C.shorts)
        rr(g, CX - 9, 68 + b, 8, 42, 4, C.packDark)
    } else {
        rr(g, CX - 27, 66 + b, 54, 54, 15, C.shirt)
        if (facing === 'down') {
            rr(g, CX - 10, 70 + b, 20, 7, 3.5, C.shirtDark)
            rr(g, CX - 22, 68 + b, 8, 40, 4, C.packDark)
            rr(g, CX + 14, 68 + b, 8, 40, 4, C.packDark)
        }
        rr(g, CX - 25, 112 + b, 50, 22, 9, C.shorts)
        if (facing === 'up') {
            rr(g, CX - 25, 70 + b, 50, 56, 15, C.pack)
            rr(g, CX - 25, 70 + b, 50, 22, 11, C.packFlap)
            rr(g, CX - 15, 100 + b, 30, 20, 8, C.packDark)
        }
    }

    if (side) leg(1)

    const hy = 12 + b
    if (facing === 'down') {
        rr(g, CX - 29, hy, 58, 54, 18, C.skin)
        rr(g, CX - 32, hy - 5, 64, 24, 12, C.hair)
        rr(g, CX - 34, hy + 4, 14, 24, 7, C.hair)
        rr(g, CX + 20, hy + 4, 14, 24, 7, C.hair)
        rr(g, CX - 19, hy + 22, 14, 16, 5, C.eye)
        rr(g, CX + 5, hy + 22, 14, 16, 5, C.eye)
        dot(g, CX - 12, hy + 31, 5, C.pupil)
        dot(g, CX + 12, hy + 31, 5, C.pupil)
        dot(g, CX - 10.5, hy + 29, 1.6, C.eye)
        dot(g, CX + 13.5, hy + 29, 1.6, C.eye)
        if (moving) {
            rr(g, CX - 8, hy + 41, 16, 9, 4.5, C.mouth)
            rr(g, CX - 4, hy + 45, 8, 4, 2, C.tongue)
        } else rr(g, CX - 8, hy + 42, 16, 5, 2.5, C.mouth)
    } else if (facing === 'up') {
        dot(g, CX - 29, hy + 32, 6, C.skin)
        dot(g, CX + 29, hy + 32, 6, C.skin)
        rr(g, CX - 30, hy - 3, 60, 58, 19, C.hair)
        rr(g, CX - 18, hy + 42, 36, 10, 5, C.hairDark)
    } else {
        rr(g, CX - 26, hy, 54, 54, 18, C.skin)
        rr(g, CX - 30, hy - 5, 50, 24, 12, C.hair)
        rr(g, CX - 31, hy - 2, 24, 46, 11, C.hair)
        dot(g, CX - 10, hy + 32, 6, C.skinDark)
        rr(g, CX + 8, hy + 22, 13, 16, 5, C.eye)
        dot(g, CX + 15, hy + 31, 5, C.pupil)
        dot(g, CX + 16.5, hy + 29, 1.6, C.eye)
        if (moving) rr(g, CX + 12, hy + 41, 12, 8, 4, C.mouth)
        else rr(g, CX + 12, hy + 42, 12, 5, 2.5, C.mouth)
    }

    if (side) arm(0, C.shirt)
    else {
        arm(0, C.shirt)
        arm(1, C.shirt)
    }

    if (moving && side) {
        rr(g, pose.feet[0].x - 30, pose.feet[0].y - 4, 12, 6, 3, C.shade, 0.35)
        rr(g, pose.feet[0].x - 44, pose.feet[0].y - 12, 9, 5, 2.5, C.shade, 0.3)
    }
}

const LOOKS = [
    { wall: C.wallA, roof: C.roofA, door: C.doorA },
    { wall: C.wallB, roof: C.roofB, door: C.doorB },
    { wall: C.wallC, roof: C.roofC, door: C.doorC },
    { wall: C.wallD, roof: C.roofD, door: C.doorD },
    { wall: C.wallE, roof: C.roofE, door: C.doorE },
    { wall: C.wallF, roof: C.roofF, door: C.doorF },
]

function house(g: G, i: number) {
    if (i === 4 || i === 5) return workshop(g, i === 5)
    return appHouse(g, LOOKS[i < 4 ? i : i - 2])
}

function appHouse(g: G, look: { wall: number; roof: number; door: number }) {
    rr(g, 262, 70, 32, 80, 6, darken(look.roof, 0.8))
    rr(g, 64, 176, 256, 176, 16, look.wall)
    rr(g, 64, 330, 256, 22, 10, darken(look.wall, 0.88))
    tri(g, { x: 30, y: 196 }, { x: 354, y: 196 }, { x: 192, y: 34 }, look.roof)
    rr(g, 26, 182, 332, 28, 14, darken(look.roof, 0.85))
    dot(g, 192, 96, 58, C.plate)
    dot(g, 112, 256, 26, darken(look.wall, 0.8))
    dot(g, 112, 256, 20, C.window)
    dot(g, 272, 256, 26, darken(look.wall, 0.8))
    dot(g, 272, 256, 20, C.window)
    rr(g, 152, 254, 80, 98, 40, darken(look.wall, 0.82))
    rr(g, 160, 262, 64, 90, 32, look.door)
    dot(g, 210, 312, 5, C.white)
}

function workshop(g: G, open: boolean) {
    rr(g, 184, 132, 16, 52, 6, C.metal)
    dot(g, 192, 96, 64, C.shopRoof)
    dot(g, 192, 96, 58, C.plate)
    rr(g, 28, 196, 328, 156, 16, C.shop)
    rr(g, 28, 330, 328, 22, 10, C.shopDark)
    rr(g, 18, 176, 348, 36, 16, C.shopRoof)
    rr(g, 34, 188, 316, 10, 5, C.shopBand)
    rr(g, 48, 238, 58, 42, 10, C.shopDark)
    rr(g, 54, 244, 46, 30, 7, C.windowDark)
    rr(g, 278, 238, 58, 42, 10, C.shopDark)
    rr(g, 284, 244, 46, 30, 7, C.windowDark)
    rr(g, 116, 222, 152, 130, 12, C.shopDark)
    if (open) {
        rr(g, 126, 232, 132, 120, 6, C.opening)
        dot(g, 192, 270, 22, C.lamp, 0.3)
        dot(g, 192, 270, 10, C.lamp)
        rr(g, 118, 220, 148, 28, 14, C.shutterRoll)
        rr(g, 126, 228, 132, 8, 4, C.shutterLine)
        return
    }
    rr(g, 126, 232, 132, 120, 6, C.shutter)
    for (let y = 244; y <= 336; y += 16) rr(g, 130, y, 124, 5, 2.5, C.shutterLine)
    rr(g, 174, 334, 36, 9, 4.5, C.metal)
}

function icon(g: G, i: number) {
    switch (i) {
        case 0:
            rr(g, 14, 22, 100, 84, 16, C.accentBlue)
            rr(g, 24, 32, 80, 64, 8, C.sky)
            tri(g, { x: 26, y: 96 }, { x: 56, y: 52 }, { x: 86, y: 96 }, C.mountain)
            tri(g, { x: 60, y: 96 }, { x: 84, y: 66 }, { x: 104, y: 96 }, darken(C.mountain, 0.8))
            dot(g, 88, 48, 10, C.sun)
            return
        case 1:
            tri(g, { x: 84, y: 64 }, { x: 124, y: 30 }, { x: 124, y: 98 }, C.accentYellow)
            rr(g, 12, 50, 62, 28, 13, C.graphite)
            rr(g, 66, 42, 24, 44, 8, C.metalLight)
            rr(g, 30, 58, 16, 12, 6, C.accentYellow)
            return
        case 2:
            rr(g, 28, 12, 72, 104, 16, C.slate)
            rr(g, 38, 22, 52, 24, 7, C.waterLight)
            for (let r = 0; r < 2; r++)
                for (let c = 0; c < 3; c++) dot(g, 46 + c * 18, 66 + r * 26, 8, r === 1 && c === 2 ? C.accentYellow : C.white)
            return
        case 3:
            rr(g, 50, 30, 11, 60, 5, C.note)
            rr(g, 86, 22, 11, 60, 5, C.note)
            g.save()
            g.translateCanvas(50, 30)
            g.rotateCanvas(-0.18)
            rr(g, 0, -4, 47, 15, 6, C.note)
            g.restore()
            dot(g, 44, 90, 15, C.note)
            dot(g, 80, 82, 15, C.note)
            return
        case 4:
            rr(g, 16, 30, 96, 72, 10, C.waterLight)
            rr(g, 46, 30, 6, 72, 3, C.lensLight)
            rr(g, 78, 30, 6, 72, 3, C.lensLight)
            dot(g, 64, 50, 17, C.coral)
            tri(g, { x: 50, y: 58 }, { x: 78, y: 58 }, { x: 64, y: 84 }, C.coral)
            dot(g, 64, 50, 6, C.white)
            return
        case 5:
            rr(g, 14, 40, 100, 54, 27, C.graphite)
            rr(g, 30, 61, 28, 10, 4, C.white)
            rr(g, 39, 52, 10, 28, 4, C.white)
            dot(g, 86, 58, 8, C.accentPink)
            dot(g, 100, 72, 8, C.accentYellow)
            return
        case 6:
            rr(g, 36, 26, 32, 18, 6, C.graphiteDark)
            rr(g, 14, 36, 100, 70, 18, C.graphite)
            rr(g, 88, 46, 16, 11, 4, C.accentYellow)
            dot(g, 64, 72, 27, C.metalLight)
            dot(g, 64, 72, 20, C.lens)
            dot(g, 57, 65, 6, C.lensLight)
            return
        case 7:
            rr(g, 26, 12, 78, 104, 12, C.accentPink)
            rr(g, 26, 12, 16, 104, 7, darken(C.accentPink, 0.8))
            dot(g, 73, 50, 13, C.white)
            rr(g, 55, 68, 36, 26, 13, C.white)
            return
        case 8:
            rr(g, 56, 74, 16, 42, 8, C.graphite)
            rr(g, 44, 68, 40, 12, 6, C.accentYellow)
            dot(g, 64, 44, 30, C.slate)
            dot(g, 64, 42, 27, C.slateLight)
            for (let y = 26; y <= 58; y += 11) for (let x = 46; x <= 82; x += 12) if (Math.hypot(x - 64, y - 42) < 22) dot(g, x, y, 3.5, C.slate)
            return
        case 9:
            rr(g, 30, 10, 68, 108, 18, C.graphite)
            dot(g, 64, 38, 15, C.metalLight)
            dot(g, 64, 38, 7, C.graphiteDark)
            dot(g, 64, 84, 24, C.metalLight)
            dot(g, 64, 84, 12, C.graphiteDark)
            return
        case 10:
            rr(g, 12, 30, 84, 70, 14, C.accentBlue)
            dot(g, 54, 66, 20, C.skin)
            dot(g, 47, 62, 3.5, C.pupil)
            dot(g, 61, 62, 3.5, C.pupil)
            rr(g, 47, 72, 14, 5, 2.5, C.mouth)
            dot(g, 100, 32, 18, C.butter)
            tri(g, { x: 86, y: 40 }, { x: 96, y: 46 }, { x: 82, y: 56 }, C.butter)
            return
        case 11:
            dot(g, 64, 50, 30, C.coral)
            tri(g, { x: 38, y: 62 }, { x: 90, y: 62 }, { x: 64, y: 114 }, C.coral)
            dot(g, 64, 50, 12, C.white)
            return
        default:
            return
    }
}

function deco(g: G, i: number) {
    switch (i) {
        case 0:
            rr(g, 114, 166, 28, 74, 10, C.trunk)
            dot(g, 128, 112, 80, C.leafDark)
            dot(g, 124, 102, 74, C.leaf)
            dot(g, 92, 84, 18, darken(C.leaf, 1.12))
            return
        case 1:
            rr(g, 116, 200, 24, 40, 8, C.trunkDark)
            tri(g, { x: 128, y: 104 }, { x: 36, y: 214 }, { x: 220, y: 214 }, C.leafDark)
            tri(g, { x: 128, y: 58 }, { x: 52, y: 160 }, { x: 204, y: 160 }, C.leaf)
            tri(g, { x: 128, y: 16 }, { x: 70, y: 106 }, { x: 186, y: 106 }, darken(C.leaf, 1.1))
            return
        case 2:
            dot(g, 90, 196, 44, C.leafDark)
            dot(g, 166, 196, 44, C.leafDark)
            dot(g, 128, 168, 54, C.bush)
            return
        case 3:
            rr(g, 78, 196, 100, 38, 19, C.leafDark)
            dot(g, 98, 184, 17, C.flowerA)
            dot(g, 98, 184, 6, C.sun)
            dot(g, 128, 166, 19, C.accentPink)
            dot(g, 128, 166, 7, C.white)
            dot(g, 158, 184, 17, C.accentYellow)
            dot(g, 158, 184, 6, C.coral)
            return
        case 4:
            rr(g, 64, 124, 12, 116, 5, C.woodDark)
            rr(g, 180, 124, 12, 116, 5, C.woodDark)
            rr(g, 48, 128, 160, 20, 9, C.wood)
            rr(g, 48, 156, 160, 20, 9, C.wood)
            rr(g, 40, 184, 176, 24, 10, C.wood)
            return
        case 5:
            rr(g, 104, 222, 48, 18, 9, C.metal)
            rr(g, 120, 62, 16, 172, 8, C.metal)
            dot(g, 128, 52, 34, C.lamp, 0.35)
            dot(g, 128, 52, 24, C.lamp)
            rr(g, 102, 22, 52, 16, 8, C.metal)
            return
        case 6:
            g.fillStyle(C.stoneDark, 1)
            g.fillEllipse(128, 200, 236, 84)
            g.fillStyle(C.stone, 1)
            g.fillEllipse(128, 192, 226, 72)
            g.fillStyle(C.water, 1)
            g.fillEllipse(128, 190, 190, 52)
            rr(g, 116, 104, 24, 88, 9, C.stone)
            dot(g, 128, 96, 30, C.waterLight)
            dot(g, 98, 120, 14, C.waterLight)
            dot(g, 158, 120, 14, C.waterLight)
            dot(g, 80, 150, 9, C.waterLight)
            dot(g, 176, 150, 9, C.waterLight)
            return
        default:
            return
    }
}

function deco2(g: G, i: number) {
    switch (i) {
        case 0:
            g.fillStyle(C.stoneDark, 1)
            g.fillEllipse(128, 200, 240, 88)
            g.fillStyle(C.water, 1)
            g.fillEllipse(128, 196, 220, 72)
            rr(g, 70, 186, 54, 8, 4, C.waterLight)
            rr(g, 150, 208, 40, 7, 3.5, C.waterLight)
            dot(g, 168, 186, 18, C.leaf)
            tri(g, { x: 168, y: 186 }, { x: 188, y: 178 }, { x: 188, y: 194 }, C.water)
            g.fillStyle(C.stone, 1)
            g.fillEllipse(30, 214, 36, 26)
            g.fillEllipse(222, 178, 30, 22)
            return
        case 1:
            g.fillStyle(C.stoneDark, 1)
            g.fillEllipse(112, 168, 168, 148)
            g.fillStyle(C.stone, 1)
            g.fillEllipse(106, 160, 150, 132)
            g.fillStyle(C.stoneDark, 1)
            g.fillEllipse(196, 214, 72, 52)
            g.fillStyle(C.stone, 1)
            g.fillEllipse(192, 208, 60, 42)
            rr(g, 64, 118, 38, 12, 6, C.ice)
            return
        case 2:
            rr(g, 46, 70, 12, 170, 6, C.accentYellow)
            rr(g, 86, 70, 12, 170, 6, C.accentYellow)
            for (let y = 100; y <= 220; y += 30) rr(g, 50, y, 44, 9, 4.5, darken(C.accentYellow, 0.85))
            rr(g, 40, 60, 80, 22, 10, C.accentBlue)
            g.save()
            g.translateCanvas(108, 72)
            g.rotateCanvas(0.78)
            rr(g, 0, -14, 200, 34, 17, C.accentBlue)
            rr(g, 0, -14, 200, 10, 5, darken(C.accentBlue, 1.15))
            g.restore()
            return
        case 3:
            tri(g, { x: 128, y: 168 }, { x: 98, y: 236 }, { x: 158, y: 236 }, C.metal)
            g.save()
            g.translateCanvas(128, 168)
            g.rotateCanvas(-0.2)
            rr(g, -118, -12, 236, 24, 12, C.coral)
            rr(g, -110, -44, 10, 34, 5, darken(C.coral, 0.8))
            rr(g, 100, -44, 10, 34, 5, darken(C.coral, 0.8))
            rr(g, -116, -48, 22, 10, 5, darken(C.coral, 0.8))
            rr(g, 94, -48, 22, 10, 5, darken(C.coral, 0.8))
            g.restore()
            return
        case 4:
            rr(g, 124, 40, 8, 112, 4, C.metal)
            for (let k = 0; k < 6; k++) {
                g.fillStyle(k % 2 ? C.white : C.accentBlue, 1)
                g.slice(128, 70, 88, Math.PI + (k * Math.PI) / 6, Math.PI + ((k + 1) * Math.PI) / 6, false)
                g.fillPath()
            }
            rr(g, 40, 64, 176, 12, 6, darken(C.accentBlue, 0.85))
            rr(g, 52, 128, 152, 80, 18, C.ice)
            rr(g, 52, 128, 152, 22, 11, C.accentPink)
            dot(g, 92, 172, 14, C.accentYellow)
            dot(g, 128, 172, 14, C.accentPink)
            dot(g, 164, 172, 14, C.waterLight)
            dot(g, 84, 216, 22, C.graphite)
            dot(g, 84, 216, 9, C.metalLight)
            dot(g, 172, 216, 22, C.graphite)
            dot(g, 172, 216, 9, C.metalLight)
            return
        case 5:
            rr(g, 96, 224, 64, 16, 8, darken(C.accentYellow, 0.8))
            rr(g, 104, 124, 48, 104, 14, C.accentYellow)
            dot(g, 128, 124, 28, C.accentYellow)
            rr(g, 118, 88, 20, 14, 6, darken(C.accentYellow, 0.8))
            rr(g, 80, 150, 96, 22, 11, darken(C.accentYellow, 0.85))
            dot(g, 128, 186, 9, darken(C.accentYellow, 0.8))
            return
        case 6:
            rr(g, 120, 140, 16, 100, 6, C.woodDark)
            rr(g, 100, 232, 56, 10, 5, C.woodDark)
            rr(g, 70, 70, 116, 76, 36, C.accentBlue)
            rr(g, 70, 112, 116, 34, 12, C.accentBlue)
            rr(g, 70, 70, 116, 22, 11, darken(C.accentBlue, 1.15))
            rr(g, 84, 104, 50, 10, 5, darken(C.accentBlue, 0.7))
            rr(g, 176, 64, 10, 52, 5, C.metal)
            rr(g, 176, 64, 32, 20, 6, C.coral)
            return
        case 7:
            for (let k = 0; k < 7; k++) {
                const x = 44 + k * 28
                rr(g, x - 4, 150, 8, 40, 4, C.leafDark)
                dot(g, x, 146 - (k % 2) * 16, 16, [C.note, C.accentYellow, C.white][k % 3])
                dot(g, x, 146 - (k % 2) * 16, 6, k % 3 === 1 ? C.coral : C.sun)
            }
            rr(g, 20, 176, 216, 64, 14, C.woodDark)
            rr(g, 20, 176, 216, 50, 14, C.wood)
            rr(g, 34, 196, 188, 8, 4, C.woodDark)
            return
        default:
            return
    }
}

function grass(g: G) {
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 0, 512, 512)
    const rand = new Phaser.Math.RandomDataGenerator(['bairro'])
    for (let k = 0; k < 10; k++) {
        const x = rand.between(40, 472)
        const y = rand.between(40, 472)
        g.fillStyle(C.grassDark, 1)
        g.fillEllipse(x, y, 60, 26)
    }
    for (let k = 0; k < 26; k++) {
        const x = rand.between(24, 488)
        const y = rand.between(24, 488)
        rr(g, x - 6, y - 10, 5, 14, 2.5, C.grassTuft)
        rr(g, x, y - 13, 5, 17, 2.5, C.grassTuft)
        rr(g, x + 6, y - 9, 5, 13, 2.5, C.grassTuft)
    }
    for (let k = 0; k < 14; k++) {
        const x = rand.between(20, 492)
        const y = rand.between(20, 492)
        dot(g, x, y, 4, k % 2 ? C.flowerA : C.flowerB)
    }
}
