import Phaser from 'phaser'
import { BOX_KEY, CREW_SHEET, KART_SHEET, PIECE_SHEET, TRACK_KEY, type Sheet } from '../data/files'
import { C, CROWD } from '../data/theme'

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

function bakeImage(scene: Phaser.Scene, key: string, w: number, h: number, line: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    lw = line
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, KART_SHEET, 5, kart)
    bakeSheet(scene, CREW_SHEET, 5, crew)
    bakeSheet(scene, PIECE_SHEET, 5, piece)
    bakeImage(scene, TRACK_KEY, 1280, 520, 4, track)
    bakeImage(scene, BOX_KEY, 800, 400, 5, garage)
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

function rbox(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = lw) {
    const rr = Math.min(r, w / 2, h / 2)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, rr)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeRoundedRect(x, y, w, h, rr)
    }
}

function poly(g: G, pts: P[], fill: number, line = lw) {
    g.fillStyle(fill, 1)
    g.fillPoints(pts, true)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokePoints(pts, true)
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

function arc(g: G, x: number, y: number, r: number, from: number, to: number, width = 4, color: number = INK) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

function eye(g: G, x: number, y: number, s = 1) {
    g.fillStyle(C.eye, 1)
    g.fillEllipse(x, y, 11 * s, 16 * s)
    g.fillStyle(C.white, 1)
    g.fillCircle(x + 2 * s, y - 4 * s, 3 * s)
}

function closedEye(g: G, x: number, y: number, s = 1) {
    arc(g, x, y - 3 * s, 7 * s, Math.PI * 0.15, Math.PI * 0.85, 4)
}

function spiral(g: G, x: number, y: number) {
    g.lineStyle(3, INK, 1)
    g.strokeCircle(x, y, 9)
    g.strokeCircle(x, y, 4)
}

function cheek(g: G, x: number, y: number) {
    g.fillStyle(C.cheek, 0.7)
    g.fillEllipse(x, y, 16, 9)
}

function smile(g: G, x: number, y: number, r = 9) {
    arc(g, x, y - r * 0.6, r, Math.PI * 0.18, Math.PI * 0.82, 4)
}

function openMouth(g: G, x: number, y: number, w = 18, h = 14) {
    oval(g, x, y, w, h, 0x8a3b3b, 3)
    g.fillStyle(0xf28a8a, 1)
    g.fillEllipse(x, y + h * 0.2, w * 0.6, h * 0.4)
}

function shoe(g: G, x: number, y: number, flip = false) {
    oval(g, x, y, 46, 22, C.shoe)
    g.fillStyle(C.shoeDark, 1)
    g.fillEllipse(x + (flip ? -8 : 8), y + 5, 26, 7)
}

// ───────────────────────────────────────────── karts (384 × 256, sem rodas)

const WHEELS = [
    { x: 94, y: 205 },
    { x: 303, y: 205 },
]

function kart(g: G, i: number) {
    const rival = i === 5
    const body = rival ? C.rival : C.team
    const dark = rival ? C.rivalDark : C.teamDark
    const stripe = rival ? C.white : C.yellow
    const lean = i === 1 || i === 5 ? 10 : 0

    rbox(g, 30, 132, 60, 40, 8, C.metal)
    rbox(g, 14, 150, 24, 12, 5, C.metalDark)
    rbox(g, 118, 98, 28, 70, 10, dark)

    poly(
        g,
        [
            { x: 28, y: 214 },
            { x: 34, y: 178 },
            { x: 84, y: 166 },
            { x: 150, y: 160 },
            { x: 262, y: 158 },
            { x: 320, y: 166 },
            { x: 362, y: 180 },
            { x: 374, y: 200 },
            { x: 366, y: 218 },
            { x: 28, y: 220 },
        ],
        body,
    )
    g.fillStyle(stripe, 1)
    g.fillRect(64, 184, 286, 9)
    WHEELS.forEach(w => disc(g, w.x, w.y, 47, C.garageInsideDark))

    limb(g, { x: 262, y: 160 }, { x: 246, y: 124 }, 7, C.metalDark)
    oval(g, 246, 118, 14, 36, C.rubber, 4)

    driver(g, i, body, lean)
}

function driver(g: G, i: number, suit: number, lean: number) {
    const rival = i === 5
    const hx = 180 + lean
    const hy = 66 + lean * 0.4

    poly(
        g,
        [
            { x: 140, y: 164 },
            { x: 210, y: 164 },
            { x: 208 + lean, y: 112 },
            { x: 160 + lean, y: 106 },
        ],
        suit,
    )
    g.fillStyle(rival ? C.white : C.yellow, 1)
    g.fillRect(168 + lean, 122, 36, 8)

    if (i === 2) {
        limb(g, { x: 190 + lean, y: 118 }, { x: 214, y: 34 }, 15, suit)
        disc(g, 216, 28, 13, C.skinKika)
        limb(g, { x: 198 + lean, y: 124 }, { x: 240, y: 124 }, 14, suit)
        disc(g, 242, 124, 9, C.skinKika)
    } else {
        limb(g, { x: 198 + lean, y: 122 }, { x: 240, y: 126 }, 14, suit)
        disc(g, 242, 124, 9, rival ? C.rivalDark : C.skinKika)
    }

    if (!rival) {
        const back = i === 1 ? 22 : 0
        disc(g, hx - 56 - back, hy - 2, 20, C.hairBlack)
        disc(g, hx - 70 - back, hy + 14, 16, C.hairBlack)
        disc(g, hx - 62 - back, hy + 30, 12, C.hairBlack)
        if (i === 1) {
            g.lineStyle(3, C.white, 0.9)
            g.lineBetween(hx - 120, hy - 6, hx - 96, hy - 6)
            g.lineBetween(hx - 126, hy + 12, hx - 98, hy + 12)
        }
    }

    g.save()
    g.translateCanvas(hx, hy)
    if (i === 3) g.rotateCanvas(-0.22)
    disc(g, 0, 0, 48, suit)
    if (rival) {
        rbox(g, -6, -18, 56, 30, 12, 0x3a4566)
        g.fillStyle(C.white, 0.6)
        g.fillRect(6, -12, 22, 5)
        smile(g, 22, 30, 7)
    } else {
        oval(g, 12, 10, 64, 60, C.skinKika, 4)
        rbox(g, -30, -50, 74, 16, 8, C.yellow, 4)
        face(g, i)
    }
    g.restore()

    const scarf = rival ? C.white : C.yellow
    rbox(g, 158 + lean, 104, 50, 14, 7, scarf, 4)
    if (i === 1 || i === 5) poly(g, [{ x: 160 + lean, y: 108 }, { x: 108, y: 100 }, { x: 116, y: 114 }, { x: 160 + lean, y: 118 }], scarf, 4)
    else poly(g, [{ x: 162, y: 112 }, { x: 150, y: 140 }, { x: 166, y: 140 }, { x: 172, y: 116 }], scarf, 4)
}

function face(g: G, i: number) {
    if (i === 3) {
        spiral(g, 2, 8)
        spiral(g, 28, 8)
        openMouth(g, 16, 30, 16, 10)
        g.fillStyle(0xf28a8a, 1)
        g.fillEllipse(20, 38, 10, 10)
        return
    }
    if (i === 4) {
        eye(g, 4, 8, 0.9)
        eye(g, 30, 8, 0.9)
        g.lineStyle(3, INK, 1)
        g.lineBetween(-4, -8, 10, -4)
        g.lineBetween(38, -8, 24, -4)
        g.lineBetween(8, 30, 26, 30)
        g.fillStyle(C.drop, 1)
        g.fillTriangle(44, -18, 38, -4, 50, -4)
        g.fillCircle(44, -4, 6)
        cheek(g, -6, 22)
        return
    }
    eye(g, 4, 6)
    eye(g, 30, 6)
    cheek(g, -6, 22)
    cheek(g, 40, 22)
    if (i === 2) openMouth(g, 18, 28, 20, 14)
    else smile(g, 18, 30, 9)
}

// ───────────────────────────────────────────── equipe (320 × 400)

function crew(g: G, i: number) {
    if (i < 4) return beto(g, i)
    const davi = i >= 6
    const work = i === 5 || i === 7
    if (!work) return kid(g, davi)
    if (davi) {
        g.save()
        g.translateCanvas(320, 0)
        g.scaleCanvas(-1, 1)
        crouch(g, true)
        g.restore()
        return
    }
    crouch(g, false)
}

function beto(g: G, i: number) {
    const cx = 160
    rbox(g, 122, 330, 30, 58, 10, 0x34405e)
    rbox(g, 170, 330, 30, 58, 10, 0x34405e)
    shoe(g, 134, 390, true)
    shoe(g, 190, 390)

    oval(g, cx, 290, 156, 118, C.team)
    g.fillStyle(C.yellow, 1)
    g.fillTriangle(cx - 22, 238, cx + 22, 238, cx, 262)
    g.lineStyle(4, INK, 1)
    g.strokeTriangle(cx - 22, 238, cx + 22, 238, cx, 262)

    const hand = (p: P) => disc(g, p.x, p.y, 13, C.skinBeto)
    if (i === 0) {
        limb(g, { x: 100, y: 268 }, { x: 128, y: 300 }, 22, C.team)
        limb(g, { x: 222, y: 268 }, { x: 196, y: 300 }, 22, C.team)
        clipboard(g, 128, 262, 68, 82)
        hand({ x: 130, y: 300 })
        hand({ x: 194, y: 300 })
    } else if (i === 1) {
        limb(g, { x: 98, y: 270 }, { x: 84, y: 318 }, 22, C.team)
        clipboard(g, 46, 296, 52, 64)
        hand({ x: 86, y: 318 })
        limb(g, { x: 222, y: 266 }, { x: 262, y: 214 }, 22, C.team)
        hand({ x: 266, y: 208 })
        g.lineStyle(4, INK, 1)
        g.lineBetween(258, 196, 254, 184)
        g.lineBetween(270, 194, 272, 182)
    } else if (i === 2) {
        limb(g, { x: 100, y: 262 }, { x: 70, y: 150 }, 22, C.team)
        hand({ x: 68, y: 146 })
        limb(g, { x: 220, y: 262 }, { x: 246, y: 150 }, 22, C.team)
        g.lineStyle(6, C.metalDark, 1)
        g.lineBetween(250, 160, 262, 14)
        hand({ x: 248, y: 148 })
        flag(g, 262, 14, 52, 42)
    } else {
        limb(g, { x: 98, y: 270 }, { x: 84, y: 318 }, 22, C.team)
        clipboard(g, 46, 296, 52, 64)
        hand({ x: 86, y: 318 })
        limb(g, { x: 222, y: 266 }, { x: 196, y: 128 }, 22, C.team)
    }

    disc(g, 82, 176, 15, C.skinBeto)
    disc(g, 238, 176, 15, C.skinBeto)
    disc(g, cx, 170, 80, C.skinBeto)
    g.fillStyle(C.team, 1)
    g.beginPath()
    g.arc(cx, 160, 82, Math.PI, Math.PI * 2, false)
    g.closePath()
    g.fillPath()
    g.lineStyle(lw, INK, 1)
    g.beginPath()
    g.arc(cx, 160, 82, Math.PI, Math.PI * 2, false)
    g.closePath()
    g.strokePath()
    oval(g, 236, 156, 92, 20, C.teamDark)
    disc(g, cx + 6, 116, 16, C.yellow, 4)

    if (i === 3) {
        closedEye(g, 138, 182)
        closedEye(g, 184, 182)
        disc(g, 192, 128, 13, C.skinBeto)
    } else {
        eye(g, 138, 180)
        eye(g, 184, 180)
    }
    cheek(g, 122, 202)
    cheek(g, 202, 202)
    disc(g, 162, 196, 9, C.skinBetoDark, 0)
    oval(g, 144, 212, 46, 22, C.hairGray, 4)
    oval(g, 180, 212, 46, 22, C.hairGray, 4)
    if (i === 1 || i === 2) openMouth(g, 162, 234, 22, 14)
    else if (i === 3) oval(g, 162, 232, 10, 10, 0x8a3b3b, 3)
}

function clipboard(g: G, x: number, y: number, w: number, h: number) {
    rbox(g, x, y, w, h, 6, C.clip)
    rbox(g, x + 6, y + 10, w - 12, h - 16, 3, C.paper, 3)
    rbox(g, x + w / 2 - 12, y - 6, 24, 12, 4, C.metal, 3)
    g.lineStyle(3, C.inkSoft, 0.6)
    for (let k = 0; k < 3; k++) g.lineBetween(x + 12, y + 26 + k * 12, x + w - 12, y + 26 + k * 12)
}

function flag(g: G, x: number, y: number, w: number, h: number) {
    const n = 4
    const m = 3
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            g.fillStyle((r + c) % 2 ? C.white : C.flagDark, 1)
            g.fillRect(x + (c * w) / n, y + (r * h) / m, w / n, h / m)
        }
    g.lineStyle(4, INK, 1)
    g.strokeRect(x, y, w, h)
}

function kid(g: G, davi: boolean) {
    const cx = 160
    const skin = davi ? C.skinDavi : C.skinLua
    rbox(g, 126, 320, 28, 64, 10, C.teamDark)
    rbox(g, 166, 320, 28, 64, 10, C.teamDark)
    shoe(g, 136, 390, true)
    shoe(g, 186, 390)
    rbox(g, 108, 236, 104, 104, 30, C.team)
    rbox(g, 130, 252, 60, 46, 10, C.teamLight, 4)
    g.fillStyle(C.yellow, 1)
    g.fillRect(122, 236, 10, 30)
    g.fillRect(188, 236, 10, 30)
    limb(g, { x: 108, y: 254 }, { x: 92, y: 318 }, 20, C.team)
    limb(g, { x: 212, y: 254 }, { x: 228, y: 318 }, 20, C.team)
    disc(g, 92, 322, 12, skin)
    disc(g, 228, 322, 12, skin)
    head(g, cx, 156, davi)
}

function head(g: G, cx: number, cy: number, davi: boolean) {
    const skin = davi ? C.skinDavi : C.skinLua
    if (!davi) {
        disc(g, cx - 54, cy + 22, 26, C.hairGinger)
        disc(g, cx + 54, cy + 22, 26, C.hairGinger)
    }
    disc(g, cx, cy, 72, skin)
    if (davi) {
        g.fillStyle(C.hairBlack, 1)
        g.beginPath()
        g.arc(cx, cy, 72, Math.PI * 1.02, Math.PI * 1.98, false)
        g.closePath()
        g.fillPath()
        g.lineStyle(lw, INK, 1)
        g.strokeCircle(cx, cy, 72)
    } else {
        g.fillStyle(C.hairGinger, 1)
        g.beginPath()
        g.arc(cx, cy - 4, 72, Math.PI * 1.05, Math.PI * 1.95, false)
        g.closePath()
        g.fillPath()
        g.fillStyle(C.team, 1)
        g.beginPath()
        g.arc(cx, cy - 30, 60, Math.PI, Math.PI * 2, false)
        g.closePath()
        g.fillPath()
        g.lineStyle(lw, INK, 1)
        g.beginPath()
        g.arc(cx, cy - 30, 60, Math.PI, Math.PI * 2, false)
        g.closePath()
        g.strokePath()
        oval(g, cx - 66, cy - 32, 46, 14, C.teamDark)
        g.lineStyle(lw, INK, 1)
        g.strokeCircle(cx, cy, 72)
    }
    eye(g, cx - 22, cy + 10)
    eye(g, cx + 22, cy + 10)
    cheek(g, cx - 38, cy + 32)
    cheek(g, cx + 38, cy + 32)
    smile(g, cx, cy + 40, 10)
    if (!davi) {
        g.fillStyle(0xd9895a, 1)
        ;[-44, -36, 36, 44].forEach((dx, k) => g.fillCircle(cx + dx, cy + 22 + (k % 2) * 6, 2.5))
    }
}

function crouch(g: G, davi: boolean) {
    const skin = davi ? C.skinDavi : C.skinLua
    shoe(g, 92, 388, true)
    limb(g, { x: 140, y: 318 }, { x: 116, y: 376 }, 26, C.teamDark)
    limb(g, { x: 116, y: 376 }, { x: 94, y: 382 }, 22, C.teamDark)
    limb(g, { x: 150, y: 318 }, { x: 210, y: 326 }, 26, C.teamDark)
    limb(g, { x: 210, y: 326 }, { x: 214, y: 378 }, 24, C.teamDark)
    shoe(g, 220, 388)
    limb(g, { x: 146, y: 316 }, { x: 160, y: 250 }, 64, C.team)
    g.fillStyle(C.yellow, 1)
    g.fillRect(146, 252, 9, 40)
    limb(g, { x: 172, y: 262 }, { x: 222, y: 300 }, 18, C.team)
    rbox(g, 214, 286, 64, 30, 10, C.wrench)
    rbox(g, 276, 294, 30, 14, 4, C.metal, 4)
    rbox(g, 226, 312, 18, 30, 6, C.wrenchDark, 4)
    disc(g, 224, 302, 12, skin)
    head(g, 168, 194, davi)
}

// ───────────────────────────────────────────── peças (256)

function piece(g: G, i: number) {
    const c = 128
    if (i <= 2) return tire(g, c, c, 100, i)
    if (i === 3) return flatTire(g)
    if (i <= 6) return cart(g, i - 4)
    if (i === 7) return hay(g)
    if (i === 8) return rainCloud(g)
    if (i === 9) return cloud(g, c, 132, C.cloud, C.cloudDark, 1)
    if (i === 10) return sun(g)
    return puddle(g)
}

const STRIPE = [C.slick, C.wetTire, C.inter]

function tire(g: G, x: number, y: number, r: number, kind: number) {
    if (kind === 0) disc(g, x, y, r, C.rubber)
    else {
        const deep = kind === 1
        const teeth = 18
        const pts: P[] = []
        for (let k = 0; k < teeth * 2; k++) {
            const a = (k * Math.PI) / teeth
            const rr = k % 2 ? r * (deep ? 0.88 : 0.95) : r
            pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr })
        }
        poly(g, pts, C.rubber)
    }
    g.lineStyle(r * 0.13, STRIPE[kind], 1)
    g.strokeCircle(x, y, r * 0.7)
    disc(g, x, y, r * 0.5, C.rim, lw - 1)
    disc(g, x, y, r * 0.2, C.rimDark, lw - 2)
    g.fillStyle(C.white, 0.7)
    g.fillEllipse(x - r * 0.2, y - r * 0.25, r * 0.22, r * 0.12)
}

function flatTire(g: G) {
    poly(
        g,
        [
            { x: 60, y: 120 },
            { x: 92, y: 92 },
            { x: 128, y: 84 },
            { x: 164, y: 92 },
            { x: 196, y: 120 },
            { x: 222, y: 168 },
            { x: 240, y: 196 },
            { x: 232, y: 206 },
            { x: 24, y: 206 },
            { x: 16, y: 196 },
            { x: 34, y: 168 },
        ],
        C.rubber,
    )
    g.lineStyle(12, C.wetTire, 1)
    g.strokeEllipse(128, 150, 150, 88)
    oval(g, 128, 148, 96, 58, C.rim, 4)
    oval(g, 128, 148, 36, 22, C.rimDark, 3)
    g.lineStyle(4, C.rubberLight, 1)
    g.lineBetween(40, 196, 216, 196)
}

function cart(g: G, kind: number) {
    limb(g, { x: 38, y: 210 }, { x: 30, y: 96 }, 10, C.metalDark)
    limb(g, { x: 30, y: 96 }, { x: 50, y: 92 }, 10, C.metalDark)
    disc(g, 66, 226, 18, C.rubber)
    disc(g, 196, 226, 18, C.rubber)
    disc(g, 66, 226, 7, C.rim, 3)
    disc(g, 196, 226, 7, C.rim, 3)
    rbox(g, 30, 194, 200, 24, 8, C.cart)
    g.fillStyle(C.cartDark, 1)
    g.fillRect(36, 210, 188, 6)
    tire(g, 96, 128, 64, kind)
    tire(g, 166, 128, 64, kind)
}

function hay(g: G) {
    rbox(g, 26, 66, 204, 140, 46, C.hay)
    g.lineStyle(3, C.hayDark, 1)
    for (let k = 0; k < 6; k++) g.lineBetween(46, 90 + k * 18, 210, 92 + k * 18)
    g.lineStyle(6, 0xb5583a, 1)
    g.lineBetween(86, 68, 86, 204)
    g.lineBetween(170, 68, 170, 204)
}

function cloud(g: G, x: number, y: number, fill: number, dark: number, s: number) {
    const blobs = [
        { dx: -62, dy: 18, r: 40 },
        { dx: -22, dy: -14, r: 52 },
        { dx: 28, dy: -6, r: 46 },
        { dx: 66, dy: 20, r: 36 },
        { dx: 0, dy: 26, r: 44 },
    ]
    blobs.forEach(b => {
        g.fillStyle(INK, 1)
        g.fillCircle(x + b.dx * s, y + b.dy * s, b.r * s + lw)
    })
    blobs.forEach(b => {
        g.fillStyle(fill, 1)
        g.fillCircle(x + b.dx * s, y + b.dy * s, b.r * s)
    })
    g.fillStyle(dark, 1)
    g.fillEllipse(x, y + 46 * s, 150 * s, 16 * s)
    g.fillStyle(C.white, 0.6)
    g.fillEllipse(x - 30 * s, y - 34 * s, 36 * s, 12 * s)
}

function rainCloud(g: G) {
    ;[
        { x: 84, y: 196 },
        { x: 128, y: 214 },
        { x: 172, y: 196 },
    ].forEach(d => {
        g.fillStyle(INK, 1)
        g.fillTriangle(d.x, d.y - 26, d.x - 13, d.y + 2, d.x + 13, d.y + 2)
        g.fillCircle(d.x, d.y + 4, 15)
        g.fillStyle(C.drop, 1)
        g.fillTriangle(d.x, d.y - 20, d.x - 9, d.y + 2, d.x + 9, d.y + 2)
        g.fillCircle(d.x, d.y + 4, 10)
    })
    cloud(g, 128, 106, C.rainCloud, C.rainCloudDark, 1)
}

function sun(g: G) {
    for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6
        limb(g, { x: 128 + Math.cos(a) * 82, y: 128 + Math.sin(a) * 82 }, { x: 128 + Math.cos(a) * 108, y: 128 + Math.sin(a) * 108 }, 14, C.sun)
    }
    disc(g, 128, 128, 70, C.sun)
    g.fillStyle(C.white, 0.5)
    g.fillEllipse(104, 100, 40, 22)
}

function puddle(g: G) {
    oval(g, 128, 128, 236, 50, C.puddle, 4)
    g.fillStyle(C.puddleLight, 0.9)
    g.fillEllipse(96, 120, 90, 12)
    g.fillEllipse(170, 136, 40, 7)
}

// ───────────────────────────────────────────── autódromo (1280 × 520, céu transparente)

function track(g: G) {
    const W = 1280
    const rnd = new Phaser.Math.RandomDataGenerator(['autodromo'])
    g.fillStyle(C.stand, 1)
    g.fillRect(0, 96, W, 168)
    for (let r = 0; r < 5; r++) {
        g.fillStyle(r % 2 ? C.stand : C.standDark, 1)
        g.fillRect(0, 118 + r * 28, W, 14)
    }
    for (let r = 0; r < 5; r++) {
        const y = 112 + r * 28
        for (let x = 14 + (r % 2) * 10; x < W - 12; x += 21) {
            const color = CROWD[rnd.between(0, CROWD.length - 1)]
            g.fillStyle(color, 1)
            g.fillRoundedRect(x - 8, y + 2, 16, 14, 5)
            g.fillStyle(rnd.frac() < 0.5 ? C.skinLua : rnd.frac() < 0.5 ? C.skinKika : C.skinDavi, 1)
            g.fillCircle(x, y - 4, 7)
            if (rnd.frac() < 0.12) {
                g.lineStyle(3, color, 1)
                g.lineBetween(x + 6, y, x + 10, y - 16)
            }
        }
    }
    g.fillStyle(C.roof, 1)
    g.fillRect(0, 60, W, 34)
    for (let x = 0; x < W; x += 64) {
        g.fillStyle(C.roof, 1)
        g.fillCircle(x + 32, 94, 32)
        g.fillStyle(C.roofDark, 1)
        g.fillCircle(x + 32, 94, 26)
        g.fillStyle(C.roof, 1)
        g.fillCircle(x + 32, 90, 26)
    }
    g.lineStyle(4, C.roofDark, 1)
    g.lineBetween(0, 60, W, 60)
    for (let x = 32; x < W; x += 160) {
        g.fillStyle(C.metalDark, 1)
        g.fillRect(x - 4, 120, 8, 144)
    }

    g.fillStyle(C.wall, 1)
    g.fillRect(0, 260, W, 40)
    g.fillStyle(C.wallDark, 1)
    g.fillRect(0, 294, W, 6)
    for (let x = 0; x < W; x += 160) g.fillRect(x, 262, 4, 32)
    g.lineStyle(3, C.wallDark, 1)
    g.lineBetween(0, 260, W, 260)

    g.fillStyle(C.asphalt, 1)
    g.fillRect(0, 300, W, 150)
    g.fillStyle(C.asphaltDark, 1)
    g.fillRect(0, 300, W, 26)
    for (let x = 0; x < W; x += 80) {
        g.fillStyle(C.lane, 0.75)
        g.fillRect(x + 10, 372, 40, 6)
    }
    for (let x = 0; x < W; x += 40) {
        g.fillStyle((x / 40) % 2 ? C.kerbWhite : C.kerbRed, 1)
        g.fillRect(x, 300, 40, 12)
        g.fillRect(x, 438, 40, 12)
    }

    g.fillStyle(C.grass, 1)
    g.fillRect(0, 450, W, 70)
    for (let x = 0; x < W; x += 160) {
        g.fillStyle(C.grassDark, 0.5)
        g.fillRect(x, 450, 80, 70)
    }
}

// ───────────────────────────────────────────── box (800 × 400)

function garage(g: G) {
    rbox(g, 40, 96, 720, 304, 10, C.garage)
    rbox(g, 150, 160, 500, 240, 8, C.garageInside)
    g.fillStyle(C.garageInsideDark, 1)
    g.fillRect(156, 166, 488, 40)
    g.lineStyle(3, C.garageInsideDark, 1)
    for (let x = 200; x < 620; x += 36)
        for (let y = 220; y < 320; y += 28) g.strokeCircle(x, y, 3)
    ;[
        { x: 230, y: 250, w: 60, h: 10 },
        { x: 330, y: 236, w: 10, h: 54 },
        { x: 470, y: 254, w: 70, h: 10 },
        { x: 560, y: 232, w: 12, h: 48 },
    ].forEach(t => {
        g.fillStyle(C.metal, 1)
        g.fillRoundedRect(t.x, t.y, t.w, t.h, 4)
    })
    ;[190, 610].forEach(x => {
        for (let k = 0; k < 3; k++) {
            g.fillStyle(C.rubber, 1)
            g.fillRoundedRect(x - 30, 380 - (k + 1) * 26, 60, 24, 10)
            g.fillStyle(C.rubberLight, 1)
            g.fillRect(x - 22, 380 - (k + 1) * 26 + 9, 44, 4)
        }
    })
    g.lineStyle(3, C.metalDark, 1)
    g.lineBetween(400, 166, 400, 196)
    oval(g, 400, 204, 50, 22, C.lamp, 4)
    g.fillStyle(C.lamp, 0.18)
    g.fillTriangle(400, 210, 300, 380, 500, 380)

    for (let k = 0; k < 13; k++) {
        const x = 20 + k * 58
        g.fillStyle(k % 2 ? C.yellow : C.team, 1)
        g.fillRect(x, 60, 58, 50)
        g.fillCircle(x + 29, 110, 29)
    }
    g.lineStyle(lw, INK, 1)
    g.strokeRect(20, 60, 754, 50)
    ;[70, 730].forEach(x => {
        g.lineStyle(4, C.metalDark, 1)
        g.lineBetween(x, 60, x, 10)
        poly(g, [{ x, y: 12 }, { x: x + 44, y: 24 }, { x, y: 38 }], C.team, 4)
    })
    g.lineStyle(lw, INK, 1)
    g.strokeRoundedRect(150, 160, 500, 240, 8)
    g.lineBetween(40, 398, 760, 398)
}
