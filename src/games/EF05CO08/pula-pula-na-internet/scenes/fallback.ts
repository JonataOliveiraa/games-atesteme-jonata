import Phaser from 'phaser'
import {
    CLUE_SHEET,
    GROUND_TOP,
    ITEM_SHEET,
    PANEL_KEY,
    PHONE_SHEET,
    PHOTOS,
    PHOTO_SIZE,
    PLATFORM_SHEET,
    STARS_KEY,
    SUMMIT_KEY,
    groundKey,
    photoKey,
    type Sheet,
} from '../data/files'
import { COLUMN, H } from '../data/layout'
import { SKIES } from '../data/scenery'
import { C } from '../data/theme'
import type { PhotoId } from '../types'

type G = Phaser.GameObjects.Graphics
type P = [number, number]

const rr = (g: G, x: number, y: number, w: number, h: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

const top = (g: G, x: number, y: number, w: number, h: number, r: number, color: number) => {
    g.fillStyle(color, 1)
    g.fillRoundedRect(x, y, w, h, { tl: r, tr: r, bl: 0, br: 0 })
}

const dot = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillCircle(x, y, r)
}

const ell = (g: G, x: number, y: number, w: number, h: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillEllipse(x, y, w, h)
}

const half = (g: G, x: number, y: number, r: number, from: number, to: number, color: number) => {
    g.fillStyle(color, 1)
    g.beginPath()
    g.slice(x, y, r, from, to, false)
    g.closePath()
    g.fillPath()
}

const band = (g: G, x: number, y: number, r: number, from: number, to: number, width: number, color: number, alpha = 1) => {
    g.lineStyle(width, color, alpha)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

const stick = (g: G, x1: number, y1: number, x2: number, y2: number, width: number, color: number) => {
    g.lineStyle(width, color, 1)
    g.lineBetween(x1, y1, x2, y2)
    dot(g, x1, y1, width / 2, color)
    dot(g, x2, y2, width / 2, color)
}

function roundPoly(g: G, pts: P[], r: number, color: number, alpha = 1) {
    const out: Phaser.Types.Math.Vector2Like[] = []
    const n = pts.length
    for (let i = 0; i < n; i++) {
        const [px, py] = pts[i]
        const [ax, ay] = pts[(i - 1 + n) % n]
        const [bx, by] = pts[(i + 1) % n]
        const la = Math.hypot(ax - px, ay - py)
        const lb = Math.hypot(bx - px, by - py)
        const u = { x: (ax - px) / la, y: (ay - py) / la }
        const v = { x: (bx - px) / lb, y: (by - py) / lb }
        const theta = Math.acos(Phaser.Math.Clamp(u.x * v.x + u.y * v.y, -1, 1))
        if (r <= 0 || theta < 0.02 || theta > Math.PI - 0.02) {
            out.push({ x: px, y: py })
            continue
        }
        const d = Math.min(r / Math.tan(theta / 2), la / 2, lb / 2)
        const radius = d * Math.tan(theta / 2)
        const bis = { x: u.x + v.x, y: u.y + v.y }
        const bl = Math.hypot(bis.x, bis.y)
        const dist = radius / Math.sin(theta / 2)
        const c = { x: px + (bis.x / bl) * dist, y: py + (bis.y / bl) * dist }
        const a1 = Math.atan2(py + u.y * d - c.y, px + u.x * d - c.x)
        let da = Math.atan2(py + v.y * d - c.y, px + v.x * d - c.x) - a1
        while (da > Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        for (let s = 0; s <= 6; s++) {
            const a = a1 + (da * s) / 6
            out.push({ x: c.x + Math.cos(a) * radius, y: c.y + Math.sin(a) * radius })
        }
    }
    g.fillStyle(color, alpha)
    g.fillPoints(out, true)
}

const ellipseArc = (cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps = 28) =>
    Array.from({ length: steps + 1 }, (_, i) => {
        const a = from + ((to - from) * i) / steps
        return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry }
    })

const star = (g: G, x: number, y: number, outer: number, inner: number, color: number, alpha = 1) => {
    const pts: Phaser.Types.Math.Vector2Like[] = []
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        const r = i % 2 ? inner : outer
        pts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r })
    }
    g.fillStyle(color, alpha)
    g.fillPoints(pts, true)
}

const sparkle = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillTriangle(x - r * 0.26, y, x, y - r, x + r * 0.26, y)
    g.fillTriangle(x - r * 0.26, y, x, y + r, x + r * 0.26, y)
    g.fillTriangle(x, y - r * 0.26, x - r, y, x, y + r * 0.26)
    g.fillTriangle(x, y - r * 0.26, x + r, y, x, y + r * 0.26)
}

const drop = (g: G, x: number, y: number, s = 1) => {
    g.fillStyle(C.sweat, 1)
    g.fillTriangle(x - 8 * s, y, x, y - 18 * s, x + 8 * s, y)
    g.fillCircle(x, y + 2 * s, 8.5 * s)
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

function bake(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

function gradient(scene: Phaser.Scene, key: string, from: number, to: number) {
    if (scene.textures.exists(key)) return
    const tex = scene.textures.createCanvas(key, 4, 256)
    if (!tex) return
    const ctx = tex.getContext()
    const grad = ctx.createLinearGradient(0, 0, 0, 256)
    const css = (c: number) => `#${c.toString(16).padStart(6, '0')}`
    grad.addColorStop(0, css(from))
    grad.addColorStop(1, css(to))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 4, 256)
    tex.refresh()
}

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, PHONE_SHEET, phone)
    bakeSheet(scene, ITEM_SHEET, item)
    bakeSheet(scene, CLUE_SHEET, clue)
    PHOTOS.forEach(id => bake(scene, photoKey(id), PHOTO_SIZE.w, PHOTO_SIZE.h, PHOTO_ART[id]))
    bakeSheet(scene, PLATFORM_SHEET, platform)
    bake(scene, SUMMIT_KEY, 400, 320, summit)
    bake(scene, PANEL_KEY, COLUMN.left, H, panel)
    bake(scene, groundKey('floresta'), 1280, 300, groundForest)
    bake(scene, groundKey('nuvem'), 1280, 300, groundCloud)
    bake(scene, groundKey('lua'), 1280, 300, groundMoon)
    SKIES.forEach(s => gradient(scene, s.key, s.top, s.bottom))
    bake(scene, STARS_KEY, 256, 256, stars)
    bake(scene, 'pinheiro-longe', 260, 700, g => pine(g, 260, 700, 4, C.farTree, C.farTreeDark, C.farTreeDark))
    bake(scene, 'pinheiro-perto', 300, 1000, g => pine(g, 300, 1000, 6, C.pine, C.pineDark, C.trunkDark))
    bake(scene, 'arvore-longe', 300, 700, g => roundTree(g, 300, 700, C.farTree, C.farTreeDark, C.farTreeDark, C.farTreeDark, 0))
    bake(scene, 'arvore-perto', 340, 1100, g => roundTree(g, 340, 1100, C.leaf, C.leafDark, C.trunk, C.trunkDark, 3))
    bake(scene, 'montanhas', 1280, 760, mountains)
    bake(scene, 'nuvem-a', 300, 140, g => cloud(g, 300, 140, [[70, 92, 50], [140, 64, 62], [222, 84, 52]]))
    bake(scene, 'nuvem-b', 220, 110, g => cloud(g, 220, 110, [[64, 70, 40], [124, 52, 50], [176, 72, 34]]))
    bake(scene, 'nuvem-c', 360, 150, g => cloud(g, 360, 150, [[66, 100, 44], [132, 72, 58], [212, 60, 64], [290, 96, 46]]))
    bake(scene, 'passaros', 170, 80, birds)
    bake(scene, 'balao', 160, 240, balloon)
    bake(scene, 'aviao', 240, 100, plane)
    bake(scene, 'terra', 1280, 520, earth)
    bake(scene, 'lua', 240, 240, moon)
    bake(scene, 'planeta-a', 140, 140, g => planet(g, 70, 70, 60, C.planetRed, C.planetRedDark, false))
    bake(scene, 'planeta-b', 180, 180, g => planet(g, 90, 90, 80, C.planetTeal, C.planetTealDark, true))
    bake(scene, 'planeta-anel', 340, 220, ringed)
    bake(scene, 'satelite', 230, 120, satellite)
    bake(scene, 'nebulosa', 700, 420, nebula)
    bake(scene, 'asteroide', 130, 110, asteroid)
    bake(scene, 'foguete', 130, 250, rocket)
    bake(scene, 'cometa', 280, 80, comet)
}

function phone(g: G, i: number) {
    const cx = 120
    const hand = (x: number, y: number) => dot(g, x, y, 13, C.phoneHand)
    const hands: Record<number, [P, P]> = {
        0: [[46, 118], [210, 118]],
        1: [[38, 52], [214, 52]],
        2: [[50, 172], [206, 172]],
        3: [[32, 36], [222, 36]],
        4: [[48, 200], [210, 200]],
        5: [[44, 128], [212, 112]],
    }
    hands[i].forEach(([x, y]) => hand(x, y))

    rr(g, 82, 222, 36, 17, 8.5, C.footDark)
    rr(g, 82, 220, 36, 14, 7, C.foot)
    rr(g, 128, 222, 36, 17, 8.5, C.footDark)
    rr(g, 128, 220, 36, 14, 7, C.foot)

    rr(g, 64, 34, 128, 172, 34, C.phoneDark)
    rr(g, 64, 34, 112, 172, 34, C.phone)
    rr(g, 104, 42, 32, 7, 3.5, C.phoneDark)
    rr(g, 76, 56, 88, 132, 22, C.screen)
    rr(g, 82, 62, 18, 40, 9, C.screenLight, 0.7)
    dot(g, cx, 197, 4.5, C.phoneDark)

    const eye = (x: number, y: number, w: number, h: number, px: number, py: number, pupil = 1) => {
        rr(g, x - w / 2, y - h / 2, w, h, Math.min(w, h) * 0.42, C.white)
        const pw = 12 * pupil
        const ph = 16 * pupil
        rr(g, x - pw / 2 + px, y - ph / 2 + py, pw, ph, pw / 2, C.eye)
        dot(g, x - 2 + px, y - 4 + py, 2.6 * pupil, C.white)
    }
    const cheeks = () => {
        ell(g, 90, 142, 16, 9, C.cheek, 0.9)
        ell(g, 150, 142, 16, 9, C.cheek, 0.9)
    }

    switch (i) {
        case 0:
            eye(102, 108, 24, 30, 1, -4)
            eye(138, 108, 24, 30, 1, -4)
            cheeks()
            half(g, cx, 140, 11, 0, Math.PI, C.mouth)
            return
        case 1:
            eye(102, 106, 28, 34, 0, 0, 0.75)
            eye(138, 106, 28, 34, 0, 0, 0.75)
            ell(g, cx, 152, 18, 22, C.mouth)
            ell(g, cx, 155, 10, 12, C.eye)
            drop(g, 186, 34)
            return
        case 2:
            eye(102, 112, 24, 28, 0, 5)
            eye(138, 112, 24, 28, 0, 5)
            rr(g, 88, 94, 28, 13, 3, C.screen)
            rr(g, 124, 94, 28, 13, 3, C.screen)
            cheeks()
            rr(g, 113, 146, 14, 6, 3, C.mouth)
            rr(g, 88, 166, 64, 6, 3, C.screenLight)
            rr(g, 88, 176, 44, 6, 3, C.screenLight)
            return
        case 3:
            band(g, 102, 116, 10, Math.PI * 1.1, Math.PI * 1.9, 7, C.white)
            band(g, 138, 116, 10, Math.PI * 1.1, Math.PI * 1.9, 7, C.white)
            cheeks()
            half(g, cx, 134, 17, 0, Math.PI, C.mouth)
            rr(g, 111, 134, 18, 5, 2.5, C.white)
            sparkle(g, 30, 96, 13, C.spark)
            sparkle(g, 226, 92, 11, C.spark)
            sparkle(g, 214, 158, 8, C.spark)
            return
        case 4:
            eye(102, 114, 22, 26, -1, 5)
            eye(138, 114, 22, 26, 1, 5)
            g.fillStyle(C.screen, 1)
            g.fillTriangle(88, 98, 116, 98, 116, 110)
            g.fillTriangle(152, 98, 124, 98, 124, 110)
            half(g, cx, 160, 10, Math.PI, Math.PI * 2, C.mouth)
            drop(g, 182, 40)
            return
        default:
            ;[102, 138].forEach(x => {
                stick(g, x - 8, 100, x + 8, 116, 6, C.white)
                stick(g, x - 8, 116, x + 8, 100, 6, C.white)
            })
            ell(g, cx, 150, 14, 16, C.mouth)
            star(g, 92, 18, 11, 5, C.star)
            star(g, 150, 10, 9, 4, C.star)
            star(g, 186, 22, 7, 3, C.star)
            return
    }
}

function item(g: G, i: number) {
    if (i === 0) {
        rr(g, 50, 34, 118, 126, 14, C.paperDark)
        rr(g, 26, 44, 118, 126, 14, C.paper)
        top(g, 26, 44, 118, 30, 14, C.newsBand)
        rr(g, 40, 54, 62, 10, 5, C.white, 0.9)
        rr(g, 108, 54, 22, 10, 5, C.white, 0.5)
        rr(g, 38, 86, 46, 40, 8, C.photoSky)
        dot(g, 72, 98, 6, C.sun)
        roundPoly(g, [[38, 126], [54, 108], [70, 126]], 3, C.grass)
        ;[88, 102, 116].forEach(y => rr(g, 92, y, 42, 8, 4, C.line))
        rr(g, 38, 138, 96, 8, 4, C.line)
        rr(g, 38, 152, 70, 8, 4, C.line)
        return
    }
    if (i === 1) {
        roundPoly(g, [[46, 120], [86, 128], [36, 172]], 6, C.chatDark)
        rr(g, 24, 34, 144, 112, 42, C.chatDark)
        rr(g, 24, 26, 144, 110, 42, C.chat)
        roundPoly(g, [[52, 112], [86, 120], [42, 160]], 6, C.chat)
        rr(g, 40, 40, 22, 36, 11, C.white, 0.5)
        rr(g, 86, 46, 22, 56, 11, C.ink)
        dot(g, 97, 118, 12, C.ink)
        return
    }
    g.save()
    g.translateCanvas(96, 100)
    g.rotateCanvas(-0.12)
    rr(g, -66, -56, 136, 134, 12, C.frameDark)
    rr(g, -70, -64, 136, 134, 12, C.frame)
    rr(g, -58, -52, 112, 88, 6, C.photoSky)
    dot(g, 28, -28, 13, C.sun)
    ell(g, -18, 32, 80, 44, C.grass)
    ell(g, 28, 34, 54, 32, C.grassDark)
    rr(g, -58, 36, 112, 30, 0, C.frame)
    rr(g, -44, 48, 56, 8, 4, C.frameDark)
    g.restore()
}

function clue(g: G, i: number) {
    const dark = 0x56698a
    if (i === 0) {
        dot(g, 48, 30, 17, C.clue)
        rr(g, 22, 54, 52, 32, 16, C.clue)
        rr(g, 22, 70, 52, 16, 8, dark)
        dot(g, 42, 24, 5, C.clueLight, 0.6)
        return
    }
    if (i === 1) {
        rr(g, 16, 22, 64, 62, 12, C.clue)
        top(g, 16, 22, 64, 18, 12, dark)
        rr(g, 28, 12, 10, 20, 5, C.ink)
        rr(g, 58, 12, 10, 20, 5, C.ink)
        ;[52, 68].forEach(y => [32, 48, 64].forEach(x => dot(g, x, y, 4.5, C.clueLight)))
        dot(g, 64, 68, 5.5, C.sun)
        return
    }
    roundPoly(g, [[24, 46], [72, 46], [48, 88]], 6, dark)
    dot(g, 48, 38, 26, C.clue)
    roundPoly(g, [[28, 50], [68, 50], [48, 84]], 6, C.clue)
    dot(g, 48, 38, 10, C.clueLight)
}

function kid(g: G, x: number, y: number, skin: number, hair: number, shirt: number, reach: number) {
    rr(g, x - 13, y + 18, 26, 28, 10, shirt)
    rr(g, x - 11, y + 44, 9, 14, 4, C.ink)
    rr(g, x + 2, y + 44, 9, 14, 4, C.ink)
    dot(g, x, y, 13, skin)
    half(g, x, y - 1, 14, Math.PI, Math.PI * 2, hair)
    dot(g, x - 20, y + 30 + reach, 5.5, skin)
    dot(g, x + 20, y + 30 - reach, 5.5, skin)
}

function saucer(g: G, x: number, y: number, s: number, alien: boolean) {
    ell(g, x, y + 6 * s, 150 * s, 34 * s, 0x9aa5bd)
    ell(g, x, y, 150 * s, 34 * s, 0xd5def0)
    half(g, x, y - 8 * s, 34 * s, Math.PI, Math.PI * 2, 0xbfe6ff)
    if (alien) {
        dot(g, x, y - 22 * s, 14 * s, 0x7fd38a)
        dot(g, x - 5 * s, y - 24 * s, 4 * s, C.eye)
        dot(g, x + 5 * s, y - 24 * s, 4 * s, C.eye)
        dot(g, x + 18 * s, y - 32 * s, 5 * s, 0x7fd38a)
    }
    ;[-48, -16, 16, 48].forEach((dx, k) => dot(g, x + dx * s, y + 8 * s, 5 * s, [0xff6b6b, 0xffd84a, 0x4fd18b, 0x8fd0ff][k]))
}

function photoAliens(g: G) {
    rr(g, 0, 0, 400, 260, 0, 0x6a4fb0)
    rr(g, 0, 110, 400, 70, 0, 0xc06aa8)
    rr(g, 0, 150, 400, 40, 0, 0xff9a6b)
    ;[[30, 24], [96, 54], [356, 30], [250, 20]].forEach(([x, y]) => dot(g, x, y, 2.5, C.white))
    rr(g, 0, 182, 400, 78, 0, 0xd9c6a8)
    rr(g, 0, 182, 400, 8, 0, 0xc2ad8c)
    g.fillStyle(0xb8ff9e, 0.35)
    g.fillTriangle(210, 96, 150, 224, 270, 224)
    ell(g, 210, 224, 120, 26, 0x8fd0ff)
    rr(g, 158, 206, 104, 22, 10, 0xb0a08a)
    rr(g, 202, 186, 16, 24, 6, 0xb0a08a)
    saucer(g, 210, 92, 1, true)
    saucer(g, 74, 60, 0.6, false)
    saucer(g, 338, 46, 0.5, false)
    ;[[30, 150], [376, 150]].forEach(([x, y]) => {
        rr(g, x - 3, y, 6, 50, 3, 0x4b4470)
        dot(g, x, y - 4, 9, 0xffe28a)
    })
    kid(g, 62, 196, C.skin, 0x3a2a24, 0x4f8ff0, -14)
    kid(g, 334, 198, C.skinDark, 0x1f1a24, 0xff8a5c, -12)
}

function photoCapybaras(g: G) {
    rr(g, 0, 0, 400, 260, 0, C.photoSky)
    dot(g, 352, 40, 24, C.sun)
    rr(g, 0, 70, 400, 40, 0, C.grass)
    rr(g, 0, 92, 400, 30, 0, 0x5aa9f0)
    rr(g, 0, 92, 400, 6, 0, 0x8fd0ff)
    ;[[40, 66], [150, 60], [300, 64]].forEach(([x, y]) => {
        rr(g, x - 4, y - 8, 8, 20, 4, C.trunk)
        dot(g, x, y - 20, 20, C.leaf)
    })
    rr(g, 0, 122, 400, 18, 0, C.grass)
    rr(g, 0, 140, 400, 90, 0, 0x8a8fa8)
    ;[150, 186, 222, 258].forEach(x => rr(g, x, 146, 22, 78, 8, C.white))
    rr(g, 0, 230, 400, 30, 0, C.grass)
    const capy = (x: number, y: number, s: number) => {
        ell(g, x, y, 70 * s, 40 * s, 0xa0703f)
        ell(g, x - 4 * s, y - 10 * s, 56 * s, 16 * s, 0x7f552e)
        ell(g, x + 36 * s, y - 6 * s, 34 * s, 26 * s, 0xa0703f)
        dot(g, x + 30 * s, y - 20 * s, 5 * s, 0x7f552e)
        dot(g, x + 42 * s, y - 10 * s, 3 * s, C.eye)
        rr(g, x - 26 * s, y + 10 * s, 10 * s, 16 * s, 4 * s, 0x7f552e)
        rr(g, x + 16 * s, y + 10 * s, 10 * s, 16 * s, 4 * s, 0x7f552e)
    }
    capy(90, 176, 0.55)
    capy(130, 182, 0.55)
    capy(178, 180, 1)
    capy(250, 184, 1)
    capy(320, 178, 1)
}

function photoDinosaur(g: G) {
    rr(g, 0, 0, 400, 260, 0, C.photoSky)
    dot(g, 50, 40, 22, C.sun)
    ;[[0, 120, 90, 0xf4cfa6], [96, 104, 100, 0xd9c6f0], [300, 112, 100, 0xc6e3d6]].forEach(([x, y, w, c]) => {
        rr(g, x, y, w, 200 - y, 8, c)
        rr(g, x + 14, y + 20, 26, 24, 5, 0xbfe6ff)
        rr(g, x + w - 40, y + 20, 26, 24, 5, 0xbfe6ff)
    })
    rr(g, 0, 196, 400, 64, 0, 0x8a8fa8)
    rr(g, 0, 196, 400, 8, 0, 0xc2c6d6)
    ;[40, 76, 112].forEach(x => rr(g, x, 214, 22, 40, 8, C.white))
    rr(g, 362, 40, 10, 160, 5, C.trunk)
    dot(g, 366, 40, 34, C.leaf)
    dot(g, 350, 56, 22, C.leafDark)
    stick(g, 260, 170, 330, 200, 26, 0x34b29a)
    stick(g, 196, 150, 322, 60, 30, 0x34b29a)
    ;[[170, 180], [200, 184], [236, 182], [258, 178]].forEach(([x, y]) => rr(g, x - 10, y, 22, 40, 9, 0x2a9683))
    ell(g, 214, 160, 140, 80, 0x34b29a)
    ell(g, 206, 176, 100, 34, 0x7fd6c0)
    ell(g, 336, 54, 52, 32, 0x34b29a)
    dot(g, 344, 48, 4, C.eye)
    band(g, 346, 58, 8, 0.2, 1.4, 3, C.eye)
    rr(g, 300, 210, 64, 26, 12, 0xffd84a)
    rr(g, 310, 196, 40, 20, 8, 0xffd84a)
    ;[312, 352].forEach(x => dot(g, x, 238, 7, C.ink))
    kid(g, 30, 180, C.skin, 0x3a2a24, 0xff8a5c, -10)
    kid(g, 136, 186, C.skinBrown, 0x1f1a24, 0x4f8ff0, -12)
}

function photoPool(g: G) {
    rr(g, 0, 0, 400, 260, 0, C.photoSky)
    dot(g, 60, 44, 24, C.sun)
    rr(g, 0, 92, 400, 168, 0, 0xf1dcb0)
    rr(g, 28, 124, 344, 118, 18, 0x2aa3cf)
    rr(g, 28, 136, 344, 106, 18, 0x47c3ea)
    ;[[62, 168, 74], [186, 204, 96], [290, 160, 56], [118, 220, 50]].forEach(([x, y, w]) => rr(g, x, y, w, 8, 4, C.white, 0.55))
    ;[328, 352].forEach(x => rr(g, x, 108, 7, 54, 3.5, C.metalDark))
    ;[122, 138].forEach(y => rr(g, 328, y, 31, 5, 2.5, C.metalDark))
    rr(g, 150, 46, 6, 56, 3, C.metalDark)
    half(g, 153, 50, 50, Math.PI, Math.PI * 2, 0xff6b6b)
    half(g, 153, 50, 22, Math.PI, Math.PI * 2, C.white)
    rr(g, 194, 96, 78, 12, 6, C.white)
    rr(g, 252, 80, 22, 22, 8, C.white)
}

function photoFlood(g: G) {
    rr(g, 0, 0, 400, 260, 0, 0xb7c0d4)
    ell(g, 90, 34, 150, 44, 0x9aa5bd)
    ell(g, 300, 24, 180, 40, 0x9aa5bd)
    const house = (x: number, y: number, w: number, h: number, body: number, roof: number) => {
        roundPoly(g, [[x - 10, y + 6], [x + w / 2, y - 46], [x + w + 10, y + 6]], 8, roof)
        rr(g, x, y, w, h, 8, body)
        rr(g, x + 14, y + 22, 26, 24, 5, 0xbfe6ff)
        rr(g, x + w - 40, y + 22, 26, 24, 5, 0xbfe6ff)
        rr(g, x + w / 2 - 14, y + h - 46, 28, 46, 6, 0x9b6b52)
    }
    house(28, 108, 104, 110, 0xf2d2b6, 0xd27b62)
    house(156, 92, 112, 126, 0xd9c6f0, 0x9a7fd6)
    house(292, 112, 96, 106, 0xc6e3d6, 0x5fa88a)
    rr(g, 0, 176, 400, 84, 0, 0xa08a6c)
    rr(g, 0, 176, 400, 10, 0, 0x8b765b)
    ;[[30, 200, 80], [150, 224, 110], [290, 204, 70], [70, 240, 60], [250, 246, 90]].forEach(([x, y, w]) =>
        rr(g, x, y, w, 7, 3.5, 0xc7b393),
    )
}

function photoMoon(g: G) {
    rr(g, 0, 0, 400, 260, 0, 0x23285a)
    ;[[40, 30], [120, 60], [210, 22], [250, 90], [370, 40], [70, 110], [180, 120]].forEach(([x, y], k) => dot(g, x, y, k % 3 ? 2 : 3, C.white))
    sparkle(g, 140, 30, 7, C.white)
    dot(g, 298, 76, 42, C.moonDark)
    dot(g, 292, 70, 38, C.moon)
    dot(g, 278, 60, 8, C.crater)
    dot(g, 304, 88, 6, C.crater)
    dot(g, 310, 58, 4, C.crater)
    const roof = 0x171a3d
    roundPoly(g, [[-10, 260], [-10, 196], [60, 150], [130, 196], [130, 260]], 8, roof)
    roundPoly(g, [[120, 260], [120, 206], [200, 168], [280, 206], [280, 260]], 8, roof)
    rr(g, 270, 186, 140, 80, 10, roof)
    ;[[40, 214], [176, 222], [306, 210]].forEach(([x, y]) => rr(g, x, y, 22, 20, 4, 0xffd36b))
    rr(g, 352, 150, 12, 50, 5, 0x10122c)
    dot(g, 358, 140, 34, 0x1b3a3a)
}

const PHOTO_ART: Record<PhotoId, (g: G) => void> = {
    alienigenas: photoAliens,
    enchente: photoFlood,
    capivaras: photoCapybaras,
    piscina: photoPool,
    lua: photoMoon,
    dinossauro: photoDinosaur,
}

function platform(g: G, row: number) {
    const tones = [
        { body: C.tab, top: C.tabTop, dark: C.tabShade, bar: C.tabBar },
        { body: C.night, top: C.nightTop, dark: C.nightShade, bar: C.nightBar },
        { body: C.gold, top: C.goldLight, dark: C.goldDark, bar: C.goldLight },
        { body: C.summit, top: C.summitLight, dark: C.summitDark, bar: C.summitLight },
    ][row]
    rr(g, 8, 22, 368, 44, 18, C.shadowSoft, 0.2)
    rr(g, 0, 8, 384, 48, 18, tones.dark)
    rr(g, 0, 8, 384, 40, 18, tones.body)
    top(g, 0, 8, 384, 16, 16, tones.top)
    if (row <= 1) {
        dot(g, 14, 16, 4, C.dotRed)
        dot(g, 26, 16, 4, C.dotYellow)
        dot(g, 38, 16, 4, C.dotGreen)
        rr(g, 56, 30, 272, 10, 5, tones.bar)
        rr(g, 346, 30, 26, 10, 5, tones.bar)
        return
    }
    if (row === 2) {
        star(g, 24, 32, 11, 5, C.white)
        star(g, 360, 32, 11, 5, C.white)
        rr(g, 56, 30, 272, 10, 5, C.white, 0.45)
        return
    }
    sparkle(g, 24, 32, 10, C.white)
    sparkle(g, 360, 32, 10, C.white)
}

function summit(g: G) {
    const y0 = 320
    roundPoly(g, [[150, y0], [188, 112], [212, 112], [250, y0]], 8, C.tower)
    roundPoly(g, [[200, y0], [200, 112], [212, 112], [250, y0]], 8, C.towerDark)
    rr(g, 160, 236, 80, 12, 6, C.towerDark)
    rr(g, 172, 180, 56, 10, 5, C.towerDark)
    rr(g, 184, 134, 32, 8, 4, C.towerDark)
    ;[54, 84, 114].forEach((r, k) => {
        band(g, 200, 74, r, -0.85, -0.15, 9 - k * 2, C.wave, 0.85 - k * 0.22)
        band(g, 200, 74, r, Math.PI + 0.15, Math.PI + 0.85, 9 - k * 2, C.wave, 0.85 - k * 0.22)
    })
    star(g, 200, 78, 46, 21, C.starDark)
    star(g, 200, 72, 44, 20, C.star)
    dot(g, 188, 60, 7, C.white, 0.8)
}

function panel(g: G) {
    g.fillStyle(C.panel, 0.34)
    g.fillRect(0, 0, COLUMN.left, H)
    g.fillStyle(C.white, 0.8)
    g.fillRect(COLUMN.left - 5, 0, 5, H)
}

function groundForest(g: G) {
    const y = GROUND_TOP
    ;[[300, 30, 46], [352, 24, 36], [880, 28, 44], [930, 36, 34], [1010, 26, 40], [470, 34, 30]].forEach(([x, dy, r]) => {
        dot(g, x, y - dy + 26, r + 6, C.leafDark)
        dot(g, x, y - dy + 20, r, C.leaf)
        dot(g, x - r * 0.4, y - dy + 6, r * 0.3, C.leafLight, 0.8)
    })
    ;[[420, C.flowerPink], [560, C.flowerYellow], [760, C.flowerPink], [820, C.flowerYellow], [660, C.white]].forEach(([x, c]) => {
        rr(g, x - 2, y - 26, 4, 28, 2, C.grassDark)
        ;[0, 1, 2, 3, 4].forEach(k => dot(g, x + Math.cos((k * Math.PI * 2) / 5) * 7, y - 30 + Math.sin((k * Math.PI * 2) / 5) * 7, 5, c))
        dot(g, x, y - 30, 4, C.sun)
    })
    ;[[700, 1], [980, 0.8]].forEach(([x, s]) => {
        rr(g, x - 6 * s, y - 22 * s, 12 * s, 24 * s, 5 * s, C.white)
        half(g, x, y - 20 * s, 20 * s, Math.PI, Math.PI * 2, C.mushroom)
        dot(g, x - 8 * s, y - 30 * s, 3.5 * s, C.white)
        dot(g, x + 6 * s, y - 34 * s, 3 * s, C.white)
    })
    rr(g, 0, y + 10, 1280, 290, 0, C.soil)
    rr(g, 0, y - 6, 1280, 30, 0, C.grass)
    for (let x = 0; x <= 1280; x += 34) dot(g, x, y - 4, 14, C.grass)
    rr(g, 0, y + 18, 1280, 10, 0, C.grassDark)
    ;[[120, 120, 60], [400, 170, 80], [700, 130, 50], [960, 190, 70], [1180, 140, 56], [560, 240, 64], [260, 250, 50]].forEach(([x, yy, w]) =>
        ell(g, x, y + yy - 60, w, w * 0.5, C.soilDark),
    )
}

function groundCloud(g: G) {
    const y = GROUND_TOP
    rr(g, 0, y + 20, 1280, 280, 0, C.cloudShade)
    for (let x = 0; x <= 1280; x += 70) dot(g, x, y + 30 + ((x / 70) % 2) * 10, 52, C.cloudShade)
    rr(g, 0, y + 12, 1280, 280, 0, C.cloud)
    for (let x = 30; x <= 1300; x += 90) dot(g, x, y + 22 + ((x / 90) % 2) * 8, 40, C.cloud)
    ;[[200, 140], [560, 190], [930, 150], [1150, 220]].forEach(([x, yy]) => ell(g, x, yy, 160, 36, C.cloudShade, 0.8))
}

function groundMoon(g: G) {
    const y = GROUND_TOP
    rr(g, 0, y, 1280, 300, 0, C.lunar)
    for (let x = 0; x <= 1280; x += 60) dot(g, x, y + 8, 22, C.lunar)
    rr(g, 0, y + 24, 1280, 10, 0, C.lunarDark)
    ;[[150, 90, 90], [470, 130, 60], [760, 100, 110], [1060, 150, 70], [300, 210, 80], [900, 230, 60]].forEach(([x, yy, w]) => {
        ell(g, x, y + yy, w, w * 0.36, C.lunarDark)
        ell(g, x, y + yy - 4, w * 0.8, w * 0.24, C.crater)
    })
    rr(g, 960, y - 92, 6, 96, 3, C.metalDark)
    roundPoly(g, [[966, y - 90], [1020, y - 76], [966, y - 60]], 4, C.no)
}

function stars(g: G) {
    const pts: [number, number, number][] = [
        [20, 30, 2], [70, 90, 1.5], [130, 20, 2.5], [200, 60, 1.5], [240, 140, 2], [160, 170, 1.5], [90, 220, 2.5],
        [30, 160, 1.5], [210, 230, 2], [120, 120, 1.5], [60, 250, 1.5], [180, 100, 1],
    ]
    pts.forEach(([x, y, r], k) => dot(g, x, y, r, k % 4 === 0 ? C.star : C.starWhite, 0.55 + (k % 3) * 0.15))
    sparkle(g, 100, 60, 7, C.starWhite, 0.85)
    sparkle(g, 220, 190, 6, C.star, 0.8)
}

function pine(g: G, w: number, h: number, tiers: number, body: number, dark: number, trunk: number) {
    const cx = w / 2
    rr(g, cx - 14, h - 110, 28, 110, 10, trunk)
    const step = (h - 120) / (tiers + 0.8)
    for (let i = 0; i < tiers; i++) {
        const apex = 16 + i * step
        const base = apex + step * 1.8
        const spread = w * (0.24 + (0.24 * i) / Math.max(1, tiers - 1))
        roundPoly(g, [[cx, apex], [cx + spread, base], [cx - spread, base]], 14, body)
        roundPoly(g, [[cx, apex + 6], [cx + spread, base], [cx + 2, base]], 12, dark)
    }
}

function roundTree(g: G, w: number, h: number, body: number, dark: number, trunk: number, trunkDark: number, branches: number) {
    const cx = w / 2
    rr(g, cx - 22, 260, 44, h - 260, 22, trunk)
    rr(g, cx + 4, 260, 18, h - 260, 9, trunkDark)
    for (let b = 0; b < branches; b++) {
        const side = b % 2 ? -1 : 1
        const y = 420 + b * 200
        const x = cx + side * 96
        stick(g, cx, y + 40, x, y, 16, trunk)
        dot(g, x, y - 14, 50, dark)
        dot(g, x - side * 10, y - 24, 44, body)
    }
    dot(g, cx + 50, 250, 88, dark)
    dot(g, cx - 60, 220, 84, body)
    dot(g, cx, 150, 112, body)
    dot(g, cx + 70, 200, 70, body)
    dot(g, cx - 30, 110, 26, 0xffffff, 0.14)
}

function mountains(g: G) {
    const back: P[] = [[0, 320], [110, 170], [250, 270], [410, 90], [590, 250], [760, 130], [930, 250], [1090, 96], [1280, 260], [1280, 470], [0, 470]]
    roundPoly(g, back, 26, C.mountBack)
    ;[[410, 90], [1090, 96], [760, 130]].forEach(([x, y]) => {
        roundPoly(g, [[x, y], [x + 46, y + 56], [x + 16, y + 48], [x - 8, y + 62], [x - 40, y + 50]], 10, C.snow)
    })
    const front: P[] = [[0, 360], [180, 236], [340, 340], [520, 214], [700, 350], [880, 246], [1060, 340], [1200, 250], [1280, 300], [1280, 520], [0, 520]]
    roundPoly(g, front, 28, C.mountFront)
    roundPoly(g, [[180, 236], [340, 340], [180, 380]], 20, C.mountFrontDark)
    roundPoly(g, [[520, 214], [700, 350], [520, 390]], 20, C.mountFrontDark)
    roundPoly(g, [[880, 246], [1060, 340], [880, 390]], 20, C.mountFrontDark)
    rr(g, 0, 440, 1280, 320, 0, C.field)
    ;[[60, 480, 300], [420, 520, 360], [860, 470, 320], [200, 600, 420], [700, 640, 380], [1040, 580, 240]].forEach(([x, y, w]) =>
        rr(g, x, y, w, 26, 13, C.fieldDark),
    )
    roundPoly(g, [[600, 440], [660, 440], [700, 560], [640, 760], [560, 760], [610, 560]], 20, C.river)
}

function cloud(g: G, w: number, h: number, puffs: [number, number, number][]) {
    puffs.forEach(([x, y, r]) => dot(g, x, y + 8, r, C.cloudShade))
    rr(g, 20, h - 52, w - 40, 44, 22, C.cloudShade)
    puffs.forEach(([x, y, r]) => dot(g, x, y, r, C.cloud))
    rr(g, 20, h - 60, w - 40, 40, 20, C.cloud)
}

function birds(g: G) {
    ;[[40, 40, 1], [96, 24, 0.8], [138, 50, 0.9]].forEach(([x, y, s]) => {
        stick(g, x - 16 * s, y - 8 * s, x, y + 2 * s, 6 * s, C.bird)
        stick(g, x, y + 2 * s, x + 16 * s, y - 8 * s, 6 * s, C.bird)
    })
}

function balloon(g: G) {
    dot(g, 80, 84, 68, C.balloonRed)
    ell(g, 80, 84, 54, 136, C.balloonYellow)
    ell(g, 80, 84, 18, 136, C.balloonRed)
    roundPoly(g, [[24, 112], [136, 112], [100, 170], [60, 170]], 14, C.balloonRed)
    rr(g, 50, 40, 16, 40, 8, C.white, 0.35)
    g.lineStyle(3, C.trunkDark, 1)
    g.lineBetween(64, 168, 66, 196)
    g.lineBetween(96, 168, 94, 196)
    rr(g, 60, 194, 40, 32, 8, C.trunk)
    rr(g, 60, 194, 40, 8, 4, C.trunkDark)
}

function plane(g: G) {
    roundPoly(g, [[28, 44], [18, 8], [54, 8], [74, 44]], 8, C.tabTop)
    rr(g, 16, 38, 200, 34, 17, C.planeShade)
    rr(g, 16, 36, 200, 26, 13, C.plane)
    roundPoly(g, [[100, 58], [156, 58], [126, 96], [98, 96]], 8, C.planeShade)
    ;[120, 140, 160, 180].forEach(x => dot(g, x, 48, 5, C.tabTop))
    dot(g, 202, 48, 6, C.tabTop)
}

function earth(g: G) {
    const cx = 640
    const cy = 1290
    dot(g, cx, cy, 1250, C.atmosphere, 0.35)
    dot(g, cx, cy, 1220, C.oceanDark)
    dot(g, cx - 30, cy + 10, 1200, C.ocean)
    const land = (pts: [number, number, number, number][]) => pts.forEach(([x, y, w, h]) => ell(g, x, y, w, h, C.land))
    land([[420, 200, 240, 90], [520, 240, 160, 70], [360, 250, 120, 60]])
    land([[800, 170, 190, 70], [860, 210, 120, 60]])
    land([[1040, 290, 200, 90], [960, 330, 140, 60]])
    land([[200, 360, 220, 90]])
    ell(g, 450, 230, 70, 30, C.landDark)
    ell(g, 1060, 310, 60, 26, C.landDark)
    ;[[600, 180, 140], [300, 300, 120], [900, 290, 160], [700, 330, 110]].forEach(([x, y, w]) => rr(g, x - w / 2, y, w, 14, 7, C.white, 0.6))
}

function moon(g: G) {
    dot(g, 120, 120, 100, C.moonDark)
    dot(g, 108, 110, 92, C.moon)
    ;[[78, 86, 18], [140, 152, 14], [150, 78, 10], [86, 150, 10], [118, 118, 7]].forEach(([x, y, r]) => dot(g, x, y, r, C.crater))
}

function planet(g: G, x: number, y: number, r: number, body: number, dark: number, stripes: boolean) {
    dot(g, x, y, r, dark)
    dot(g, x - r * 0.1, y - r * 0.1, r * 0.9, body)
    if (stripes) {
        rr(g, x - r * 0.7, y - r * 0.35, r * 1.2, r * 0.16, r * 0.08, C.white, 0.28)
        rr(g, x - r * 0.62, y + r * 0.12, r * 1.05, r * 0.14, r * 0.07, C.white, 0.22)
    } else {
        dot(g, x - r * 0.35, y - r * 0.2, r * 0.18, dark, 0.7)
        dot(g, x + r * 0.2, y + r * 0.3, r * 0.12, dark, 0.7)
    }
    dot(g, x - r * 0.45, y - r * 0.45, r * 0.12, C.white, 0.5)
}

function ringed(g: G) {
    g.lineStyle(16, C.ringedDark, 1)
    g.strokePoints(ellipseArc(170, 110, 150, 34, Math.PI, Math.PI * 2), false)
    planet(g, 170, 110, 72, C.ringed, C.ringedDark, true)
    g.lineStyle(16, C.ring, 1)
    g.strokePoints(ellipseArc(170, 110, 150, 34, 0, Math.PI), false)
}

function satellite(g: G) {
    stick(g, 84, 60, 146, 60, 6, C.metalDark)
    ;[8, 150].forEach(x => {
        rr(g, x, 38, 72, 44, 6, C.panelBlue)
        ;[0, 1, 2].forEach(c => [0, 1].forEach(r => rr(g, x + 6 + c * 22, 44 + r * 18, 18, 14, 3, C.panelBlueLight)))
    })
    rr(g, 92, 30, 46, 60, 10, C.metalDark)
    rr(g, 92, 30, 36, 60, 10, C.metal)
    half(g, 115, 30, 18, Math.PI, Math.PI * 2, C.metal)
    stick(g, 115, 16, 115, 4, 4, C.metalDark)
    dot(g, 115, 4, 4, C.no)
}

function nebula(g: G) {
    ;[[260, 200, 190, C.nebulaA, 0.22], [430, 230, 170, C.nebulaB, 0.2], [340, 150, 130, C.nebulaC, 0.18], [520, 170, 110, C.nebulaA, 0.18], [180, 260, 120, C.nebulaB, 0.16]].forEach(
        ([x, y, r, c, a]) => dot(g, x, y, r, c, a),
    )
    ;[[300, 190, 90, C.nebulaB, 0.2], [420, 210, 80, C.nebulaC, 0.2]].forEach(([x, y, r, c, a]) => dot(g, x, y, r, c, a))
    ;[[340, 200, 12], [260, 140, 7], [470, 260, 8], [560, 150, 6], [200, 230, 6]].forEach(([x, y, r]) => sparkle(g, x, y, r, C.white, 0.9))
}

function asteroid(g: G) {
    roundPoly(g, [[20, 50], [44, 16], [92, 12], [116, 46], [100, 92], [48, 98]], 16, C.rockDark)
    roundPoly(g, [[20, 46], [44, 14], [88, 10], [108, 40], [92, 82], [44, 88]], 16, C.rock)
    dot(g, 56, 42, 10, C.rockDark)
    dot(g, 84, 64, 7, C.rockDark)
    dot(g, 48, 70, 5, C.rockDark)
}

function rocket(g: G) {
    roundPoly(g, [[44, 196], [65, 246], [86, 196]], 10, C.flame)
    roundPoly(g, [[54, 196], [65, 228], [76, 196]], 8, C.star)
    roundPoly(g, [[30, 150], [14, 200], [44, 196]], 8, C.rocketRed)
    roundPoly(g, [[100, 150], [116, 200], [86, 196]], 8, C.rocketRed)
    rr(g, 34, 60, 62, 142, 26, C.metalDark)
    rr(g, 34, 60, 52, 142, 26, C.rocket)
    roundPoly(g, [[34, 76], [65, 10], [96, 76]], 14, C.rocketRed)
    dot(g, 65, 112, 18, C.metalDark)
    dot(g, 63, 110, 13, C.newsBand)
    dot(g, 59, 106, 4, C.white, 0.8)
}

function comet(g: G) {
    roundPoly(g, [[0, 40], [230, 18], [230, 62]], 6, C.atmosphere, 0.35)
    roundPoly(g, [[80, 40], [234, 26], [234, 54]], 6, C.white, 0.5)
    dot(g, 240, 40, 22, C.atmosphere, 0.5)
    dot(g, 240, 40, 15, C.white)
}
