import Phaser from 'phaser'
import {
    CIDA_SHEET,
    COW_SHEET,
    DASH_KEY,
    DOG_SHEET,
    HOUSE_SHEET,
    HOUSE_WINDOW,
    ICON2_SHEET,
    ICON_SHEET,
    MAP_KEY,
    PROP2_SHEET,
    PROP_SHEET,
    SIZES,
    SKY2_KEY,
    SKY_KEY,
    TOW_SHEET,
    VILLAGE_SHEET,
    WHEEL_KEY,
    WIPER_KEY,
    type HouseKind,
    type Sheet,
} from '../data/files'
import { CONSOLE, DASH, MAP, SIGNAL, VILLAGE } from '../data/layout'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics
type P = [number, number]

export const HALO_KEY = 'halo'
export const DROP_KEY = 'gota'
export const ENVELOPE_KEY = 'envelope'
export const KEY_FACE = 'tecla'
export const KEY_FACE_ON = 'tecla-ligada'
export const SCREEN_KEY = 'central'
export const KEY_FACE_NARROW = 'tecla-estreita'
export const KEY_FACE_NARROW_ON = 'tecla-estreita-ligada'
export const SPLAT_KEY = 'lama-gota'

const rr = (g: G, x: number, y: number, w: number, h: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

const dot = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillCircle(x, y, r)
}

const ell = (g: G, x: number, y: number, w: number, h: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillEllipse(x, y, w, h)
}

const poly = (g: G, pts: P[], color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillPoints(
        pts.map(([x, y]) => ({ x, y })),
        true,
    )
}

const stick = (g: G, x1: number, y1: number, x2: number, y2: number, width: number, color: number) => {
    g.lineStyle(width, color, 1)
    g.lineBetween(x1, y1, x2, y2)
    dot(g, x1, y1, width / 2, color)
    dot(g, x2, y2, width / 2, color)
}

const arc = (g: G, x: number, y: number, r: number, from: number, to: number, width: number, color: number) => {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
    dot(g, x + Math.cos(from) * r, y + Math.sin(from) * r, width / 2, color)
    dot(g, x + Math.cos(to) * r, y + Math.sin(to) * r, width / 2, color)
}

function bake(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

function bakeSheet(scene: Phaser.Scene, sheet: Sheet, paint: (g: G, i: number) => void) {
    if (scene.textures.exists(sheet.key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    const ch = sheet.cellH ?? sheet.cell
    for (let i = 0; i < sheet.cols * sheet.rows; i++) {
        g.save()
        g.translateCanvas((i % sheet.cols) * sheet.cell, Math.floor(i / sheet.cols) * ch)
        paint(g, i)
        g.restore()
    }
    g.generateTexture(sheet.key, sheet.cols * sheet.cell, sheet.rows * ch)
    g.destroy()
}

function seeded(seed: number) {
    let s = seed
    return () => {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
    }
}

function sky(g: G) {
    rr(g, 0, 0, 1280, 300, 0, C.skyTop)
    rr(g, 0, 170, 1280, 80, 0, 0x2a2760)
    rr(g, 0, 236, 1280, 64, 0, C.skyLow)
    const rnd = seeded(7)
    for (let i = 0; i < 70; i++) dot(g, rnd() * 1280, 100 + rnd() * 140, rnd() < 0.2 ? 2.6 : 1.6, C.star, 0.5 + rnd() * 0.5)
    dot(g, 1040, 150, 46, C.moonDark)
    dot(g, 1034, 145, 42, C.moon)
    dot(g, 1020, 134, 9, C.crater)
    dot(g, 1050, 162, 7, C.crater)
    dot(g, 1052, 128, 5, C.crater)
    ;[[220, 250, 520, 70], [700, 246, 640, 80], [1150, 252, 420, 70]].forEach(([x, y, w, h]) => ell(g, x, y + h / 2, w, h * 2, C.hillBack))
    ;[[60, 276, 420, 50], [480, 270, 560, 60], [960, 278, 600, 50]].forEach(([x, y, w, h]) => ell(g, x, y + h / 2, w, h * 2, C.hillFront))
    rr(g, 0, 288, 1280, 12, 0, C.hillFront)
}

const lipY = (x: number) => DASH.lip - 14 * Math.sin((Math.PI * x) / 1280)

function dash(g: G) {
    const top: P[] = []
    for (let x = 0; x <= 1280; x += 32) top.push([x, lipY(x)])
    poly(g, [...top, [1280, 200], [0, 200]], C.dash)
    poly(g, [...top, ...top.map(([x, y]) => [x, y + 16] as P).reverse()], C.dashDark)
    poly(g, [...top.map(([x, y]) => [x, y + 16] as P), ...top.map(([x, y]) => [x, y + 21] as P).reverse()], C.dashTrim)
}

function wheel(g: G) {
    g.lineStyle(38, C.wheel, 1)
    g.strokeCircle(192, 192, 156)
    g.lineStyle(10, C.wheelDark, 1)
    g.beginPath()
    g.arc(192, 192, 170, 0.2, Math.PI - 0.2, false)
    g.strokePath()
    stick(g, 192, 192, 48, 178, 30, C.wheel)
    stick(g, 192, 192, 336, 178, 30, C.wheel)
    stick(g, 192, 192, 192, 336, 30, C.wheel)
    dot(g, 192, 192, 64, C.hubDark)
    dot(g, 192, 186, 60, C.hub)
    hornIcon(g, 192, 186, 0.62, C.white)
}

function hornIcon(g: G, x: number, y: number, s: number, color: number) {
    rr(g, x - 52 * s, y - 14 * s, 34 * s, 28 * s, 8 * s, color)
    poly(
        g,
        [
            [x - 22 * s, y - 12 * s],
            [x + 18 * s, y - 34 * s],
            [x + 18 * s, y + 34 * s],
            [x - 22 * s, y + 12 * s],
        ],
        color,
    )
    rr(g, x + 12 * s, y - 38 * s, 14 * s, 76 * s, 7 * s, color)
}

function wiper(g: G) {
    dot(g, 30, 32, 22, C.wiper)
    dot(g, 30, 32, 9, 0x3a4270)
    rr(g, 30, 27, 300, 10, 5, C.wiper)
    rr(g, 170, 24, 334, 16, 8, C.wiper)
    rr(g, 176, 36, 322, 5, 2.5, 0x2c335c)
}

function icon(g: G, i: number) {
    const cx = 96
    const cy = 96
    if (i === 0) {
        hornIcon(g, cx - 14, cy, 1.05, C.icon)
        arc(g, cx + 22, cy, 34, -0.7, 0.7, 9, C.iconWarm)
        arc(g, cx + 22, cy, 56, -0.6, 0.6, 9, C.iconWarm)
        return
    }
    if (i === 1) {
        g.fillStyle(C.icon, 1)
        g.beginPath()
        g.arc(cx - 18, cy, 44, Math.PI / 2, Math.PI * 1.5, false)
        g.closePath()
        g.fillPath()
        rr(g, cx - 22, cy - 44, 18, 88, 8, C.icon)
        ;[-30, 0, 30].forEach(dy => rr(g, cx + 6, cy + dy - 7, 62, 14, 7, C.iconWarm))
        return
    }
    if (i === 2) {
        rr(g, cx - 66, cy - 50, 108, 76, 26, C.icon)
        poly(g, [[cx - 44, cy + 18], [cx - 26, cy + 18], [cx - 50, cy + 44]], C.icon)
        poly(g, [[cx + 6, cy + 6], [cx + 74, cy - 34], [cx + 44, cy + 34]], C.iconWarm)
        poly(g, [[cx + 34, cy + 10], [cx + 74, cy - 34], [cx + 44, cy + 34], [cx + 38, cy + 20]], 0xe8b93a)
        return
    }
    g.fillStyle(0x9fd2ff, 1)
    g.beginPath()
    g.arc(cx, cy + 40, 78, Math.PI * 1.08, Math.PI * 1.92, false)
    g.lineTo(cx + 40, cy + 40)
    g.lineTo(cx - 40, cy + 40)
    g.closePath()
    g.fillPath()
    stick(g, cx, cy + 38, cx + 44, cy - 22, 9, C.icon)
    ;[[cx - 40, cy - 6], [cx - 14, cy - 26]].forEach(([x, y]) => {
        poly(g, [[x - 9, y + 2], [x, y - 14], [x + 9, y + 2]], C.iconWarm)
        dot(g, x, y + 4, 9.5, C.iconWarm)
    })
}

function prop(g: G, i: number) {
    const c = 192
    if (i === 0) {
        rr(g, c - 10, 70, 20, 314, 10, C.pole)
        rr(g, c - 22, 360, 44, 24, 10, C.poleDark)
        rr(g, c - 4, 58, 72, 16, 8, C.pole)
        ell(g, c + 62, 76, 56, 24, C.poleDark)
        ell(g, c + 62, 84, 40, 16, C.lamp)
        return
    }
    if (i === 1) {
        rr(g, c - 16, 240, 32, 144, 12, C.trunk)
        dot(g, c - 62, 210, 72, C.leafDark)
        dot(g, c + 62, 210, 72, C.leafDark)
        dot(g, c, 150, 98, C.leaf)
        dot(g, c - 58, 196, 66, C.leaf)
        dot(g, c + 58, 196, 66, C.leaf)
        return
    }
    ell(g, c - 70, 330, 160, 110, C.leafDark)
    ell(g, c + 70, 330, 160, 110, C.leafDark)
    ell(g, c, 300, 220, 160, C.bush)
    rr(g, c - 150, 330, 300, 54, 20, C.bush)
}

function house(g: G, i: number) {
    const kind = i % 3
    const lit = i >= 3
    const glass = (on: boolean) => (on ? C.windowLit : C.window)
    const at = (kind: HouseKind) => ({ x: 192 + HOUSE_WINDOW[kind].x, y: 384 + HOUSE_WINDOW[kind].y })
    if (kind === 0) {
        const w = at('a')
        rr(g, 60, 200, 265, 184, 14, C.houseA)
        rr(g, 60, 344, 265, 40, 10, C.houseADark)
        poly(g, [[44, 214], [192, 138], [340, 214]], C.roofA)
        rr(g, w.x - 19, w.y - 26, 38, 52, 8, glass(lit))
        rr(g, w.x + 42, w.y - 26, 37, 52, 8, glass(false))
        rr(g, 240, 296, 58, 88, 12, C.door)
        dot(g, 288, 344, 5, C.butter)
        return
    }
    if (kind === 1) {
        const w = at('b')
        rr(g, 44, 180, 296, 204, 14, C.houseB)
        rr(g, 44, 346, 296, 38, 10, C.houseBDark)
        rr(g, 31, 139, 323, 52, 18, C.roofB)
        rr(g, 62, 280, 66, 104, 12, C.door)
        dot(g, 114, 334, 5, C.butter)
        rr(g, w.x - 62, w.y - 30, 124, 61, 12, glass(lit))
        rr(g, w.x - 4, w.y - 30, 8, 61, 4, C.houseBDark)
        return
    }
    const w = at('cida')
    rr(g, 78, 184, 228, 200, 14, C.houseC)
    rr(g, 78, 344, 228, 40, 10, C.houseCDark)
    poly(g, [[62, 200], [192, 108], [322, 200]], C.roofC)
    dot(g, w.x, w.y, 34, C.houseCDark)
    dot(g, w.x, w.y, 29.5, glass(lit))
    rr(g, 100, 290, 72, 94, 12, C.door)
    dot(g, 160, 340, 5, C.butter)
    rr(g, 90, 372, 92, 12, 6, C.mat)
}

function dog(g: G, i: number) {
    if (i === 0) {
        ell(g, 132, 206, 186, 96, C.dog)
        ell(g, 150, 220, 120, 52, C.dogLight)
        ell(g, 196, 214, 60, 30, C.dogDark)
        dot(g, 74, 196, 46, C.dog)
        ell(g, 52, 170, 30, 52, C.dogDark)
        ell(g, 98, 168, 30, 52, C.dogDark)
        ell(g, 70, 214, 40, 26, C.dogLight)
        dot(g, 70, 206, 7, C.ink)
        rr(g, 54, 192, 16, 5, 2.5, C.ink)
        rr(g, 80, 192, 16, 5, 2.5, C.ink)
        return
    }
    if (i === 1) {
        ell(g, 128, 202, 120, 110, C.dog)
        ell(g, 128, 214, 74, 72, C.dogLight)
        rr(g, 98, 214, 22, 42, 10, C.dog)
        rr(g, 136, 214, 22, 42, 10, C.dog)
        ell(g, 168, 236, 50, 22, C.dogDark)
        dot(g, 128, 118, 56, C.dog)
        ell(g, 76, 108, 34, 70, C.dogDark)
        ell(g, 180, 108, 34, 70, C.dogDark)
        ell(g, 128, 140, 54, 36, C.dogLight)
        rr(g, 100, 96, 22, 24, 7, C.white)
        rr(g, 134, 96, 22, 24, 7, C.white)
        rr(g, 107, 102, 10, 14, 5, C.ink)
        rr(g, 141, 102, 10, 14, 5, C.ink)
        ell(g, 128, 130, 18, 12, C.ink)
        return
    }
    ell(g, 124, 180, 170, 76, C.dog)
    ell(g, 116, 196, 110, 36, C.dogLight)
    stick(g, 70, 200, 40, 236, 18, C.dogDark)
    stick(g, 96, 206, 110, 244, 18, C.dog)
    stick(g, 160, 204, 196, 236, 18, C.dogDark)
    stick(g, 178, 196, 160, 244, 18, C.dog)
    stick(g, 46, 168, 18, 128, 16, C.dogDark)
    dot(g, 208, 142, 44, C.dog)
    ell(g, 232, 156, 36, 26, C.dogLight)
    ell(g, 184, 112, 30, 54, C.dogDark)
    rr(g, 210, 128, 16, 18, 6, C.white)
    rr(g, 216, 132, 8, 11, 4, C.ink)
    ell(g, 246, 150, 12, 10, C.ink)
}

function cida(g: G, i: number) {
    poly(g, [[98, 130], [158, 130], [178, 238], [78, 238]], C.cida)
    rr(g, 78, 216, 100, 22, 10, C.cidaDark)
    ell(g, 104, 246, 34, 14, C.cidaDark)
    ell(g, 152, 246, 34, 14, C.cidaDark)
    dot(g, 128, 92, 36, C.skin)
    g.fillStyle(C.hair, 1)
    g.beginPath()
    g.arc(128, 90, 38, Math.PI, Math.PI * 2, false)
    g.closePath()
    g.fillPath()
    dot(g, 128, 46, 18, C.hair)
    dot(g, 114, 98, 11, C.glasses)
    dot(g, 142, 98, 11, C.glasses)
    dot(g, 114, 98, 6, C.white)
    dot(g, 142, 98, 6, C.white)
    rr(g, 118, 114, 20, 6, 3, 0xd9826b)
    if (i === 0) {
        stick(g, 160, 150, 196, 92, 16, C.cida)
        dot(g, 200, 84, 12, C.skin)
        stick(g, 98, 150, 86, 200, 16, C.cida)
        dot(g, 86, 206, 11, C.skin)
        return
    }
    stick(g, 100, 150, 108, 182, 16, C.cida)
    stick(g, 156, 150, 148, 182, 16, C.cida)
    rr(g, 92, 160, 72, 56, 8, C.box)
    rr(g, 92, 160, 72, 14, 6, C.boxDark)
    rr(g, 122, 160, 12, 56, 4, C.tape)
    dot(g, 100, 190, 10, C.skin)
    dot(g, 156, 190, 10, C.skin)
}

function halo(g: G) {
    for (let r = 64; r > 0; r -= 8) dot(g, 64, 64, r, C.lampGlow, 0.07)
}

function drop(g: G) {
    dot(g, 16, 18, 12, C.drop, 0.55)
    dot(g, 12, 13, 4, C.white, 0.8)
}

function envelope(g: G) {
    rr(g, 2, 2, 76, 52, 10, C.envelope)
    poly(g, [[4, 6], [40, 34], [76, 6]], C.envelopeDark)
    poly(g, [[8, 8], [40, 30], [72, 8]], C.envelope)
}

function keyFace(g: G, on: boolean, w: number) {
    const h = CONSOLE.keyH
    rr(g, 0, 8, w, h, 22, on ? C.keyOnDark : C.keyDark)
    rr(g, 0, 0, w, h, 22, on ? C.keyOn : C.key)
    rr(g, 10, 6, w - 20, 10, 5, C.white, on ? 0.45 : 0.18)
}

function splat(g: G) {
    dot(g, 24, 26, 15, C.splat)
    dot(g, 10, 14, 6, C.splat)
    dot(g, 40, 12, 5, C.splat)
    dot(g, 38, 38, 4, C.splat)
    dot(g, 19, 21, 5, C.mudShine, 0.7)
}

function screen(g: G) {
    rr(g, 0, 0, CONSOLE.w, CONSOLE.h, 26, C.screenEdge)
    rr(g, 6, 6, CONSOLE.w - 12, CONSOLE.h - 12, 22, C.screen)
}

function skySerra(g: G) {
    rr(g, 0, 0, 1280, 300, 0, C.skyTop)
    rr(g, 0, 190, 1280, 110, 0, C.skyLow)
    const rnd = seeded(11)
    for (let i = 0; i < 80; i++) dot(g, rnd() * 1280, 20 + rnd() * 190, rnd() < 0.2 ? 2.6 : 1.6, C.star, 0.5 + rnd() * 0.5)
    dot(g, 210, 92, 40, C.moon)
    dot(g, 232, 80, 38, C.skyTop)
    const peak = (x: number, top: number, half: number, color: number) => {
        poly(g, [[x - half, 300], [x - 26, top + 18], [x + 26, top + 18], [x + half, 300]], color)
        dot(g, x, top + 28, 30, color)
    }
    ;[[90, 170, 230], [420, 150, 260], [760, 180, 240], [1100, 156, 270]].forEach(([x, t, h]) => peak(x, t, h, C.mtBack))
    ;[[250, 214, 230], [600, 226, 210], [930, 210, 240], [1260, 228, 200]].forEach(([x, t, h]) => peak(x, t, h, C.mtFront))
}

function icon2(g: G, i: number) {
    const cx = 96
    const cy = 96
    if (i === 0) {
        ;[-46, -20, 6].forEach((dx, k) => dot(g, cx + dx, cy + 62 - k * 4, 8, C.iconWarm))
        dot(g, cx + 22, cy - 22, 44, C.icon)
        poly(g, [[cx - 14, cy], [cx + 58, cy], [cx + 22, cy + 56]], C.icon)
        dot(g, cx + 22, cy - 22, 17, 0x2f5a8f)
        return
    }
    if (i === 1) {
        rr(g, cx - 76, cy - 18, 30, 36, 8, C.icon)
        poly(g, [[cx - 50, cy - 16], [cx + 4, cy - 46], [cx + 4, cy + 46], [cx - 50, cy + 16]], C.icon)
        ;[26, 50, 74].forEach(r => arc(g, cx + 4, cy, r, -0.8, 0.8, 10, C.iconWarm))
        return
    }
    if (i === 2) {
        poly(g, [[cx - 74, cy - 52], [cx - 26, cy - 64], [cx - 26, cy + 54], [cx - 74, cy + 66]], C.icon)
        poly(g, [[cx - 26, cy - 64], [cx + 26, cy - 52], [cx + 26, cy + 66], [cx - 26, cy + 54]], 0xdfe6f7)
        poly(g, [[cx + 26, cy - 52], [cx + 74, cy - 64], [cx + 74, cy + 54], [cx + 26, cy + 66]], C.icon)
        stick(g, cx - 60, cy + 40, cx - 20, cy, 9, C.iconWarm)
        stick(g, cx - 20, cy, cx + 20, cy + 12, 9, C.iconWarm)
        stick(g, cx + 20, cy + 12, cx + 60, cy - 36, 9, C.iconWarm)
        return
    }
    stick(g, cx - 18, cy - 40, cx - 18, cy - 80, 9, C.icon)
    rr(g, cx - 40, cy - 46, 80, 124, 20, C.icon)
    rr(g, cx - 28, cy - 32, 56, 30, 10, 0x2f5a8f)
    ;[0, 1, 2].forEach(r => [0, 1, 2].forEach(c => dot(g, cx - 18 + c * 18, cy + 18 + r * 16, 5, 0x2f5a8f)))
    arc(g, cx - 18, cy - 80, 24, -0.9, 0.2, 7, C.iconWarm)
    arc(g, cx - 18, cy - 80, 42, -0.8, 0.1, 7, C.iconWarm)
}

function prop2(g: G, i: number) {
    const c = 192
    if (i === 0) {
        rr(g, c - 14, 320, 28, 64, 8, C.trunk)
        ;[[330, 150], [250, 120], [172, 90]].forEach(([y, half], k) => {
            poly(g, [[c - half, y], [c - 18, y - 120], [c + 18, y - 120], [c + half, y]], k % 2 ? C.pineDark : C.pine)
            dot(g, c, y - 112, 20, k % 2 ? C.pineDark : C.pine)
        })
        return
    }
    if (i === 1) {
        rr(g, c - 10, 170, 20, 214, 10, C.towerDark)
        rr(g, c - 120, 70, 240, 120, 30, C.signBoard)
        stick(g, c - 10, 160, c - 70, 100, 16, C.signArrow)
        poly(g, [[c - 92, 84], [c - 46, 86], [c - 88, 128]], C.signArrow)
        stick(g, c + 10, 160, c + 70, 100, 16, C.signArrow)
        poly(g, [[c + 92, 84], [c + 46, 86], [c + 88, 128]], C.signArrow)
        return
    }
    if (i === 2) {
        stick(g, c - 60, 380, c - 10, 40, 12, C.tower)
        stick(g, c + 60, 380, c + 10, 40, 12, C.tower)
        for (let y = 340; y > 70; y -= 60) {
            const half = 10 + ((y - 40) / 340) * 50
            const half2 = 10 + ((y - 100 - 40) / 340) * 50
            stick(g, c - half, y, c + half2, y - 60, 6, C.towerDark)
            stick(g, c + half, y, c - half2, y - 60, 6, C.towerDark)
        }
        rr(g, c - 38, 70, 18, 52, 8, C.towerDark)
        rr(g, c + 20, 70, 18, 52, 8, C.towerDark)
        dot(g, c, 34, 10, C.beacon)
        return
    }
    rr(g, c - 120, 260, 18, 124, 8, C.plank)
    rr(g, c + 102, 260, 18, 124, 8, C.plank)
    rr(g, c - 150, 230, 300, 70, 16, C.barrierLight)
    for (let k = 0; k < 5; k++) poly(g, [[c - 140 + k * 64, 296], [c - 110 + k * 64, 234], [c - 84 + k * 64, 234], [c - 114 + k * 64, 296]], C.barrier)
    dot(g, c, 212, 20, C.amber)
}

function village(g: G, i: number) {
    const lit = i === 1
    VILLAGE.windows.forEach((w, k) => {
        const cx = w.x + w.w / 2
        if (k === 7) {
            rr(g, cx - 24, w.y - 30, 48, 140, 10, C.villageHouse)
            poly(g, [[cx - 32, w.y - 26], [cx, w.y - 70], [cx + 32, w.y - 26]], C.villageRoof)
        } else if (k % 2 === 0 || k === 8) {
            rr(g, cx - 14, w.y - 24, 56, 70, 8, C.villageHouse)
            poly(g, [[cx - 22, w.y - 18], [cx + 14, w.y - 50], [cx + 50, w.y - 18]], C.villageRoof)
        }
    })
    ell(g, 384, 384, 640, 180, C.villageHill)
    VILLAGE.windows.forEach(w => rr(g, w.x, w.y, w.w, w.h, 3, lit ? C.windowLit : C.window))
}

function cow(g: G, i: number) {
    if (i === 2) {
        ell(g, 124, 160, 170, 90, C.cow)
        ell(g, 100, 150, 54, 40, C.cowPatch)
        ell(g, 150, 176, 40, 30, C.cowPatch)
        ;[[64, 0], [92, 1], [158, 0], [184, 1]].forEach(([x, k]) => rr(g, x - 9, 186, 18, 66 - k * 6, 8, C.cow))
        stick(g, 40, 140, 22, 196, 7, C.cow)
        dot(g, 22, 200, 8, C.cowPatch)
        ell(g, 222, 128, 70, 62, C.cow)
        ell(g, 244, 144, 36, 28, C.muzzle)
        ell(g, 204, 100, 26, 14, C.cowPatch)
        rr(g, 220, 112, 10, 12, 5, C.ink)
        return
    }
    const startled = i === 1
    const lift = startled ? 12 : 0
    rr(g, 70, 112 - lift, 116, 112, 40, C.cow)
    ell(g, 104, 150 - lift, 46, 40, C.cowPatch)
    ;[80, 108, 148, 176].forEach(x => rr(g, x - 10, 200 - lift, 20, 54 - (startled ? 10 : 0), 8, C.cow))
    dot(g, 128, 96 - lift, 52, C.cow)
    ell(g, 92, 70 - lift, 28, 20, C.cowPatch)
    poly(g, [[94, 52 - lift], [84, 26 - lift], [104, 46 - lift]], C.hornCow)
    poly(g, [[162, 52 - lift], [172, 26 - lift], [152, 46 - lift]], C.hornCow)
    ell(g, 70, startled ? 56 - lift : 76, 34, 18, C.cow)
    ell(g, 186, startled ? 56 - lift : 76, 34, 18, C.cow)
    ell(g, 128, 124 - lift, 64, 40, C.muzzle)
    dot(g, 116, 124 - lift, 5, 0xd9826b)
    dot(g, 140, 124 - lift, 5, 0xd9826b)
    if (startled) {
        rr(g, 98, 76 - lift, 22, 24, 7, C.white)
        rr(g, 136, 76 - lift, 22, 24, 7, C.white)
        rr(g, 105, 82 - lift, 10, 12, 5, C.ink)
        rr(g, 143, 82 - lift, 10, 12, 5, C.ink)
    } else {
        rr(g, 100, 86, 20, 6, 3, C.ink)
        rr(g, 136, 86, 20, 6, 3, C.ink)
    }
    dot(g, 128, 156 - lift, 10, C.bell)
}

function tow(g: G, i: number) {
    const c = 256
    rr(g, c - 150, 400, 70, 100, 24, C.tire)
    rr(g, c + 80, 400, 70, 100, 24, C.tire)
    if (i === 0) {
        rr(g, c - 170, 270, 340, 170, 40, C.tow)
        rr(g, c - 130, 170, 260, 130, 40, C.towDark)
        rr(g, c - 110, 186, 220, 90, 28, C.glassCab)
        rr(g, c - 26, 140, 52, 30, 12, C.amber)
        dot(g, c - 110, 350, 34, C.windowLit)
        dot(g, c + 110, 350, 34, C.windowLit)
        rr(g, c - 54, 320, 108, 70, 18, C.towDark)
        ;[336, 356, 376].forEach(y => rr(g, c - 42, y - 4, 84, 8, 4, C.tow))
        return
    }
    rr(g, c - 170, 260, 340, 180, 40, C.tow)
    rr(g, c - 130, 170, 260, 110, 40, C.towDark)
    rr(g, c - 26, 140, 52, 30, 12, C.amber)
    rr(g, c - 16, 200, 32, 170, 14, C.towerDark)
    rr(g, c - 4, 360, 8, 70, 4, C.tire)
    arc(g, c + 10, 444, 16, 0, Math.PI, 7, C.tire)
    rr(g, c - 160, 300, 40, 30, 12, C.rearLight)
    rr(g, c + 120, 300, 40, 30, 12, C.rearLight)
}


function paperMap(g: G) {
    const tones = [C.paper, C.paperDark, C.paper, C.paperDark]
    tones.forEach((t, k) => rr(g, 40 + k * 172, 26, 172, 460, k === 0 || k === 3 ? 24 : 0, t))
    ell(g, 170, 380, 220, 120, C.hillMap)
    ell(g, 600, 120, 200, 110, C.hillMap)
    g.lineStyle(26, C.river, 1)
    g.beginPath()
    g.moveTo(40, 300)
    g.lineTo(220, 250)
    g.lineTo(560, 330)
    g.lineTo(728, 280)
    g.strokePath()
    ;[[110, 120], [640, 400]].forEach(([x, y]) => [-20, 0, 20].forEach(dx => poly(g, [[x + dx - 14, y + 20], [x + dx, y - 16], [x + dx + 14, y + 20]], C.pine)))
    ;[[620, 380], [660, 360], [680, 410]].forEach(([x, y]) => rr(g, x - 10, y - 10, 20, 20, 5, C.roofC))
    ;[MAP.left, MAP.right].forEach(path => {
        const pts = [...MAP.trunk, ...path]
        for (let i = 0; i < pts.length - 1; i++) stick(g, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, 18, C.mapRoad)
    })
}

export function ensureArt(scene: Phaser.Scene) {
    const size = (key: string) => SIZES[key]
    bake(scene, SKY_KEY, size(SKY_KEY).w, size(SKY_KEY).h, sky)
    bake(scene, DASH_KEY, size(DASH_KEY).w, size(DASH_KEY).h, dash)
    bake(scene, WHEEL_KEY, size(WHEEL_KEY).w, size(WHEEL_KEY).h, wheel)
    bake(scene, WIPER_KEY, size(WIPER_KEY).w, size(WIPER_KEY).h, wiper)
    bakeSheet(scene, ICON_SHEET, icon)
    bakeSheet(scene, PROP_SHEET, prop)
    bakeSheet(scene, HOUSE_SHEET, house)
    bakeSheet(scene, DOG_SHEET, dog)
    bakeSheet(scene, CIDA_SHEET, cida)
    bake(scene, SKY2_KEY, size(SKY2_KEY).w, size(SKY2_KEY).h, skySerra)
    bake(scene, MAP_KEY, size(MAP_KEY).w, size(MAP_KEY).h, paperMap)
    bakeSheet(scene, ICON2_SHEET, icon2)
    bakeSheet(scene, PROP2_SHEET, prop2)
    bakeSheet(scene, VILLAGE_SHEET, village)
    bakeSheet(scene, COW_SHEET, cow)
    bakeSheet(scene, TOW_SHEET, tow)
    bake(scene, HALO_KEY, 128, 128, halo)
    bake(scene, DROP_KEY, 32, 32, drop)
    bake(scene, ENVELOPE_KEY, 80, 58, envelope)
    bake(scene, KEY_FACE, CONSOLE.keyW, CONSOLE.keyH + 8, g => keyFace(g, false, CONSOLE.keyW))
    bake(scene, KEY_FACE_ON, CONSOLE.keyW, CONSOLE.keyH + 8, g => keyFace(g, true, CONSOLE.keyW))
    bake(scene, KEY_FACE_NARROW, SIGNAL.keyW, CONSOLE.keyH + 8, g => keyFace(g, false, SIGNAL.keyW))
    bake(scene, KEY_FACE_NARROW_ON, SIGNAL.keyW, CONSOLE.keyH + 8, g => keyFace(g, true, SIGNAL.keyW))
    bake(scene, SPLAT_KEY, 48, 48, splat)
    bake(scene, SCREEN_KEY, CONSOLE.w, CONSOLE.h, screen)
}
