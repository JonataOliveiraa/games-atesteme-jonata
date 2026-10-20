import Phaser from 'phaser'
import {
    CLOUD_SHEET,
    CLUE_SHEET,
    HAND_KEY,
    ITEM_SHEET,
    NET_KEY,
    PHONE_SHEET,
    PHOTO_SHEET,
    PLATFORM_SHEET,
    SKY_KEY,
    SUMMIT_KEY,
    type Sheet,
} from '../data/files'
import { H, W } from '../data/layout'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics

const rr = (g: G, x: number, y: number, w: number, h: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

const dot = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillCircle(x, y, r)
}

const arc = (g: G, x: number, y: number, r: number, from: number, to: number, width: number, color: number, alpha = 1) => {
    g.lineStyle(width, color, alpha)
    g.beginPath()
    g.arc(x, y, r, from * Math.PI, to * Math.PI, false)
    g.strokePath()
}

const star = (g: G, x: number, y: number, outer: number, inner: number, color: number) => {
    const pts: Phaser.Types.Math.Vector2Like[] = []
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        const r = i % 2 ? inner : outer
        pts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r })
    }
    g.fillStyle(color, 1)
    g.fillPoints(pts, true)
}

const sparkle = (g: G, x: number, y: number, r: number, color: number) => {
    g.fillStyle(color, 1)
    g.fillTriangle(x - r * 0.28, y, x, y - r, x + r * 0.28, y)
    g.fillTriangle(x - r * 0.28, y, x, y + r, x + r * 0.28, y)
    g.fillTriangle(x, y - r * 0.28, x - r, y, x, y + r * 0.28)
    g.fillTriangle(x, y - r * 0.28, x + r, y, x, y + r * 0.28)
}

const drop = (g: G, x: number, y: number) => {
    g.fillStyle(C.sweat, 1)
    g.fillTriangle(x - 8, y, x, y - 18, x + 8, y)
    g.fillCircle(x, y + 2, 8.5)
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
    bakeSheet(scene, PHONE_SHEET, phone)
    bakeSheet(scene, ITEM_SHEET, item)
    bakeSheet(scene, CLUE_SHEET, clue)
    bakeSheet(scene, PHOTO_SHEET, photo)
    bakeSheet(scene, PLATFORM_SHEET, platform)
    bakeSheet(scene, CLOUD_SHEET, (g, i) => cloudHalf(g, i === 1))
    bakeImage(scene, SUMMIT_KEY, 400, 300, summit)
    bakeImage(scene, SKY_KEY, W, H, sky)
    bakeImage(scene, NET_KEY, 256, 256, net)
    bakeImage(scene, HAND_KEY, 256, 256, hand)
}

function phone(g: G, i: number) {
    rr(g, 58, 36, 140, 192, 36, C.phoneDark)
    rr(g, 58, 28, 140, 192, 36, C.phone)
    rr(g, 64, 32, 24, 60, 12, C.phoneLight, 0.6)
    rr(g, 72, 50, 112, 156, 22, C.screen)
    dot(g, 128, 40, 4.5, C.phoneDark)
    g.fillStyle(C.footDark, 1)
    g.fillEllipse(100, 231, 44, 20)
    g.fillEllipse(156, 231, 44, 20)
    g.fillStyle(C.foot, 1)
    g.fillEllipse(100, 228, 42, 18)
    g.fillEllipse(156, 228, 42, 18)

    const cheeks = () => {
        g.fillStyle(C.cheek, 0.8)
        g.fillEllipse(90, 140, 20, 11)
        g.fillEllipse(166, 140, 20, 11)
    }
    const eye = (x: number, y: number, r: number, look = 0) => {
        dot(g, x, y, r, C.eye)
        dot(g, x - r * 0.32, y - r * 0.38 + look, r * 0.36, C.white)
        dot(g, x + r * 0.35, y + r * 0.3 + look, r * 0.15, C.white)
    }

    switch (i) {
        case 0:
            eye(104, 112, 15, -2)
            eye(152, 112, 15, -2)
            cheeks()
            arc(g, 128, 140, 12, 0.15, 0.85, 5, C.eye)
            return
        case 1:
            dot(g, 104, 112, 17, C.white)
            dot(g, 152, 112, 17, C.white)
            g.lineStyle(3, C.eye, 1)
            g.strokeCircle(104, 112, 17)
            g.strokeCircle(152, 112, 17)
            dot(g, 104, 112, 7, C.eye)
            dot(g, 152, 112, 7, C.eye)
            g.fillStyle(C.eye, 1)
            g.fillEllipse(128, 156, 16, 22)
            drop(g, 194, 66)
            return
        case 2:
            eye(104, 122, 13, 3)
            eye(152, 122, 13, 3)
            rr(g, 86, 100, 36, 14, 4, C.screen)
            rr(g, 134, 100, 36, 14, 4, C.screen)
            g.lineStyle(4, C.eye, 1)
            g.lineBetween(88, 114, 120, 114)
            g.lineBetween(136, 114, 168, 114)
            cheeks()
            rr(g, 116, 152, 24, 5, 2.5, C.eye)
            rr(g, 88, 176, 80, 6, 3, C.line, 0.6)
            rr(g, 88, 188, 56, 6, 3, C.line, 0.6)
            return
        case 3:
            arc(g, 104, 120, 13, 1.1, 1.9, 6, C.eye)
            arc(g, 152, 120, 13, 1.1, 1.9, 6, C.eye)
            cheeks()
            g.fillStyle(C.eye, 1)
            g.beginPath()
            g.arc(128, 140, 20, 0, Math.PI, false)
            g.closePath()
            g.fillPath()
            g.fillStyle(C.cheek, 1)
            g.fillEllipse(128, 152, 18, 9)
            sparkle(g, 40, 60, 16, C.spark)
            sparkle(g, 216, 48, 12, C.spark)
            sparkle(g, 222, 150, 9, C.spark)
            return
        case 4:
            eye(104, 124, 12, 2)
            eye(152, 124, 12, 2)
            g.lineStyle(5, C.eye, 1)
            g.lineBetween(88, 98, 116, 106)
            g.lineBetween(168, 98, 140, 106)
            arc(g, 128, 168, 13, 1.15, 1.85, 5, C.eye)
            drop(g, 192, 70)
            return
        default:
            g.lineStyle(4, C.eye, 1)
            ;[104, 152].forEach(x => {
                g.beginPath()
                g.arc(x, 114, 14, 0, Math.PI * 1.6, false)
                g.strokePath()
                g.beginPath()
                g.arc(x, 114, 7, Math.PI, Math.PI * 2.6, false)
                g.strokePath()
            })
            g.lineStyle(4, C.eye, 1)
            g.beginPath()
            g.moveTo(108, 154)
            ;[116, 124, 132, 140, 148].forEach((x, k) => g.lineTo(x, k % 2 ? 154 : 146))
            g.strokePath()
            star(g, 92, 18, 11, 5, C.star)
            star(g, 168, 14, 9, 4, C.star)
            return
    }
}

function item(g: G, i: number) {
    if (i === 0) {
        rr(g, 40, 48, 120, 120, 12, C.paperDark)
        rr(g, 34, 38, 120, 120, 12, C.paper)
        g.fillStyle(C.newsBand, 1)
        g.fillRoundedRect(34, 38, 120, 26, { tl: 12, tr: 12, bl: 0, br: 0 })
        rr(g, 46, 74, 38, 34, 6, C.tabTop)
        ;[78, 90, 102].forEach(y => rr(g, 92, y, 50, 7, 3.5, C.line))
        ;[118, 130, 142].forEach((y, k) => rr(g, 46, y, k === 2 ? 64 : 96, 7, 3.5, C.line))
        g.lineStyle(3, C.paperDark, 1)
        g.lineBetween(94, 66, 94, 156)
        return
    }
    if (i === 1) {
        g.fillStyle(C.chatDark, 1)
        g.fillTriangle(58, 132, 44, 172, 96, 136)
        rr(g, 26, 34, 140, 110, 40, C.chatDark)
        rr(g, 26, 28, 140, 110, 40, C.chat)
        g.fillStyle(C.chat, 1)
        g.fillTriangle(60, 126, 48, 164, 92, 130)
        rr(g, 86, 46, 20, 56, 10, C.ink)
        dot(g, 96, 118, 11, C.ink)
        rr(g, 44, 42, 22, 40, 11, C.white, 0.45)
        return
    }
    g.save()
    g.translateCanvas(96, 98)
    g.rotateCanvas(-0.12)
    rr(g, -70, -56, 140, 118, 10, C.frameDark)
    rr(g, -70, -62, 140, 118, 10, C.frame)
    rr(g, -58, -50, 116, 80, 6, C.photoSky)
    g.fillStyle(C.hill, 1)
    g.fillEllipse(-20, 34, 120, 60)
    g.fillStyle(C.hillDark, 1)
    g.fillEllipse(34, 38, 90, 44)
    rr(g, -58, 22, 116, 8, 0, C.frame)
    dot(g, 28, -24, 14, C.sun)
    g.restore()
}

function clue(g: G, i: number) {
    if (i === 0) {
        dot(g, 48, 32, 17, C.clue)
        rr(g, 20, 54, 56, 32, 16, C.clue)
        dot(g, 42, 26, 5, C.clueLight, 0.7)
        return
    }
    if (i === 1) {
        rr(g, 16, 22, 64, 60, 12, C.clue)
        rr(g, 24, 42, 48, 32, 6, C.clueLight)
        rr(g, 30, 12, 10, 20, 5, C.ink)
        rr(g, 56, 12, 10, 20, 5, C.ink)
        rr(g, 32, 50, 12, 9, 3, C.clue, 0.5)
        return
    }
    dot(g, 48, 48, 34, C.clue)
    g.lineStyle(5, C.clueLight, 1)
    g.strokeEllipse(48, 48, 30, 68)
    g.lineBetween(14, 48, 82, 48)
    g.lineBetween(20, 30, 76, 30)
    g.lineBetween(20, 66, 76, 66)
}

function photo(g: G, i: number) {
    if (i === 0) {
        rr(g, 0, 0, 400, 260, 0, C.photoSky)
        dot(g, 340, 56, 30, C.sun)
        rr(g, 0, 170, 400, 90, 0, C.hill)
        rr(g, 0, 170, 400, 10, 0, C.hillDark)
        ;[80, 200, 320].forEach((x, k) => {
            rr(g, x - 7, 120 - k * 6, 14, 64 + k * 6, 5, C.shadowSoft)
            dot(g, x, 108 - k * 6, 34, C.hillDark)
            dot(g, x - 10, 100 - k * 6, 22, C.hill)
        })
        ;[140, 262].forEach(x => {
            dot(g, x, 168, 13, C.skin)
            rr(g, x - 14, 180, 28, 40, 12, C.newsBand)
        })
        rr(g, 300, 200, 40, 28, 8, C.tabTop)
        return
    }
    if (i === 1) {
        rr(g, 0, 0, 400, 260, 0, C.photoSky)
        rr(g, 0, 90, 400, 170, 0, C.paperDark)
        rr(g, 30, 110, 340, 130, 10, C.newsBand)
        ;[140, 175, 210].forEach(y => rr(g, 60, y, 280, 6, 3, C.white, 0.35))
        return
    }
    if (i === 2) {
        rr(g, 0, 0, 400, 260, 0, 0xa9b4c6)
        ;[40, 150, 260].forEach((x, k) => rr(g, x, 70 + k * 8, 90, 110, 6, k === 1 ? C.home : C.tabShade))
        rr(g, 0, 170, 400, 90, 0, 0x7f97b5)
        ;[195, 225].forEach(y => rr(g, 40, y, 320, 6, 3, C.white, 0.3))
        return
    }
    rr(g, 0, 0, 400, 260, 0, 0x2b2f5c)
    dot(g, 300, 70, 36, 0xfff3c2)
    ;[60, 140, 230, 350].forEach((x, k) => dot(g, x, 40 + (k % 2) * 30, 3, C.white))
    g.fillStyle(0x1b1e3d, 1)
    g.fillTriangle(0, 260, 90, 170, 180, 260)
    g.fillTriangle(140, 260, 250, 160, 360, 260)
    g.fillTriangle(300, 260, 380, 190, 460, 260)
}

function platform(g: G, row: number) {
    const tones = [
        { body: C.tab, top: C.tabTop, dark: C.tabShade },
        { body: C.gold, top: C.goldLight, dark: C.goldDark },
        { body: C.home, top: C.summitLight, dark: C.homeDark },
        { body: C.summit, top: C.summitLight, dark: C.summitDark },
    ][row]
    rr(g, 4, 18, 376, 46, 18, C.shadowSoft, 0.22)
    rr(g, 0, 8, 384, 48, 18, tones.dark)
    rr(g, 0, 8, 384, 40, 18, tones.body)
    g.fillStyle(tones.top, 1)
    g.fillRoundedRect(0, 8, 384, 16, { tl: 16, tr: 16, bl: 0, br: 0 })
    if (row === 0) {
        dot(g, 16, 16, 4, C.dotRed)
        dot(g, 28, 16, 4, C.dotYellow)
        dot(g, 40, 16, 4, C.dotGreen)
        return
    }
    if (row === 1) {
        star(g, 24, 34, 11, 5, C.white)
        star(g, 360, 34, 11, 5, C.white)
        return
    }
    if (row === 2) {
        ;[10, 28].forEach(x => rr(g, x, 28, 12, 12, 4, C.white, 0.7))
        ;[344, 362].forEach(x => rr(g, x, 28, 12, 12, 4, C.white, 0.7))
        return
    }
    sparkle(g, 24, 34, 10, C.white)
    sparkle(g, 360, 34, 10, C.white)
}

function cloudHalf(g: G, mirror: boolean) {
    const m = (x: number) => (mirror ? 400 - x : x)
    const blobs: [number, number, number][] = [
        [70, 122, 46],
        [140, 96, 58],
        [232, 78, 70],
        [330, 86, 66],
    ]
    const paint = (dy: number, color: number) => {
        g.fillStyle(color, 1)
        blobs.forEach(([x, y, r]) => g.fillCircle(m(x), y + dy, r))
        g.fillRect(mirror ? 0 : 60, 112 + dy, 340, 58 - dy)
        g.fillRect(mirror ? 0 : 300, 60 + dy, 100, 110 - dy)
    }
    paint(8, C.cloudShade)
    paint(0, C.cloud)
    g.fillStyle(C.cloudShade, 1)
    g.fillRect(mirror ? 0 : 60, 158, 340, 12)
    dot(g, m(210), 64, 16, C.white)
    g.fillStyle(C.white, 0.9)
    g.fillEllipse(m(120), 82, 34, 16)
}

function summit(g: G) {
    g.fillStyle(C.towerDark, 1)
    g.fillTriangle(176, 300, 200, 92, 224, 300)
    g.fillStyle(C.tower, 1)
    g.fillTriangle(150, 300, 196, 96, 176, 300)
    g.fillTriangle(224, 300, 204, 96, 250, 300)
    rr(g, 162, 200, 76, 10, 5, C.towerDark)
    rr(g, 174, 150, 52, 9, 4.5, C.towerDark)
    ;[50, 78, 106].forEach((r, k) => {
        arc(g, 200, 70, r, -0.28, 0.28, 8 - k, C.wave, 0.85 - k * 0.2)
        arc(g, 200, 70, r, 0.72, 1.28, 8 - k, C.wave, 0.85 - k * 0.2)
    })
    star(g, 200, 66, 44, 20, C.starDark)
    star(g, 200, 62, 42, 19, C.star)
    dot(g, 190, 52, 6, C.white, 0.8)
}

function sky(g: G) {
    const bands = 36
    const from = Phaser.Display.Color.ValueToColor(C.skyHigh)
    const to = Phaser.Display.Color.ValueToColor(C.skyLow)
    for (let i = 0; i < bands; i++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(from, to, bands - 1, i)
        g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1)
        g.fillRect(0, Math.floor((i * H) / bands), W, Math.ceil(H / bands) + 1)
    }
    ;[
        [120, 160, 70],
        [1150, 120, 90],
        [90, 520, 60],
        [1200, 470, 70],
        [640, 300, 140],
        [420, 620, 80],
        [880, 110, 60],
    ].forEach(([x, y, r]) => dot(g, x, y, r, C.bubble, 0.16))
}

function net(g: G) {
    const pts: [number, number][] = [
        [30, 40],
        [110, 22],
        [200, 60],
        [70, 120],
        [160, 140],
        [228, 170],
        [40, 210],
        [130, 228],
    ]
    const links: [number, number][] = [
        [0, 1],
        [1, 2],
        [0, 3],
        [3, 4],
        [2, 4],
        [4, 5],
        [3, 6],
        [6, 7],
        [4, 7],
    ]
    g.lineStyle(2, C.white, 0.45)
    links.forEach(([a, b]) => g.lineBetween(pts[a][0], pts[a][1], pts[b][0], pts[b][1]))
    pts.forEach(([x, y], k) => dot(g, x, y, k % 3 ? 4 : 6, C.white, 0.7))
}

function hand(g: G) {
    const paint = (grow: number, tone: number, dark: number) => {
        rr(g, 68 - grow, 10 - grow, 38 + grow * 2, 130 + grow, 19 + grow, tone)
        rr(g, 104 - grow, 92 - grow, 34 + grow * 2, 70 + grow, 17 + grow, tone)
        rr(g, 134 - grow, 102 - grow, 32 + grow * 2, 64 + grow, 16 + grow, tone)
        rr(g, 162 - grow, 114 - grow, 28 + grow * 2, 56 + grow, 14 + grow, tone)
        rr(g, 30 - grow, 128 - grow, 70 + grow * 2, 34 + grow * 2, 17 + grow, tone)
        rr(g, 64 - grow, 120 - grow, 128 + grow * 2, 110 + grow * 2, 40 + grow, tone)
        if (dark >= 0) rr(g, 76, 196, 104, 12, 6, dark)
    }
    paint(10, C.white, -1)
    paint(0, C.skin, C.skinDark)
    rr(g, 76, 22, 22, 18, 9, C.white)
}
