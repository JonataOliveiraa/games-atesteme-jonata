import Phaser from 'phaser'
import { CONTROL_SHEET, CREW_SHEET, HAND_KEY, KART_SHEET, MOTO_SHEET, MUD_KEY, PIECE_SHEET, TENT_KEY, TRACK_KEY, type Sheet } from '../data/files'
import { C, CROWD } from '../data/theme'

/**
 * A arte de reserva: as mesmas folhas, grades e ordem de células do TEXTURAS,
 * desenhadas em Graphics. Um PNG com o mesmo nome substitui cada uma.
 */

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
    bakeSheet(scene, MOTO_SHEET, 5, moto)
    bakeSheet(scene, CREW_SHEET, 5, crew)
    bakeSheet(scene, PIECE_SHEET, 5, piece)
    bakeSheet(scene, CONTROL_SHEET, 6, control)
    bakeImage(scene, TRACK_KEY, 1280, 520, 4, track)
    bakeImage(scene, MUD_KEY, 1280, 204, 4, mudStrip)
    bakeImage(scene, TENT_KEY, 600, 360, 5, tent)
    bakeImage(scene, HAND_KEY, 256, 256, 0, hand)
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

// ───────────────────────────────────────────── pilotos

type Who = 'kika' | 'rivalA' | 'rivalB'

const whoOf = (i: number): Who | null => (i === 7 ? null : i === 5 ? 'rivalA' : i === 6 ? 'rivalB' : 'kika')

const SUIT: Record<Who, { body: number; dark: number; stripe: number; scarf: number }> = {
    kika: { body: C.team, dark: C.teamDark, stripe: C.yellow, scarf: C.yellow },
    rivalA: { body: C.rival, dark: C.rivalDark, stripe: C.white, scarf: C.white },
    rivalB: { body: C.rivalB, dark: C.rivalBDark, stripe: C.cream, scarf: C.cream },
}

/** O piloto sentado, com as mãos em (hand). `i` é a cara (0 a 4); rivais ficam inclinados. */
function driver(g: G, i: number, who: Who, hand: P) {
    const suit = SUIT[who]
    const rival = who !== 'kika'
    const lean = i === 1 || rival ? 10 : 0
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
        suit.body,
    )
    g.fillStyle(suit.stripe, 1)
    g.fillRect(168 + lean, 122, 36, 8)

    if (i === 2 && !rival) {
        limb(g, { x: 190 + lean, y: 118 }, { x: 214, y: 34 }, 15, suit.body)
        disc(g, 216, 28, 13, C.skinKika)
        limb(g, { x: 198 + lean, y: 124 }, hand, 14, suit.body)
        disc(g, hand.x + 2, hand.y, 9, C.skinKika)
    } else {
        limb(g, { x: 198 + lean, y: 122 }, hand, 14, suit.body)
        disc(g, hand.x + 2, hand.y - 2, 9, rival ? suit.dark : C.skinKika)
    }

    const back = i === 1 || rival ? 22 : 0
    const hair = who === 'rivalB' ? 0x6b3f2a : C.hairBlack
    if (who !== 'rivalA') {
        disc(g, hx - 56 - back, hy - 2, 20, hair)
        disc(g, hx - 70 - back, hy + 14, 16, hair)
        disc(g, hx - 62 - back, hy + 30, 12, hair)
    }
    if (i === 1 && !rival) {
        g.lineStyle(3, C.white, 0.9)
        g.lineBetween(hx - 120, hy - 6, hx - 96, hy - 6)
        g.lineBetween(hx - 126, hy + 12, hx - 98, hy + 12)
    }

    g.save()
    g.translateCanvas(hx, hy)
    if (i === 3 && !rival) g.rotateCanvas(-0.22)
    disc(g, 0, 0, 48, suit.body)
    if (rival) {
        oval(g, 12, 10, 64, 60, who === 'rivalA' ? C.skinLua : C.skinBeto, 4)
        rbox(g, -30, -50, 74, 16, 8, suit.stripe, 4)
        eye(g, 4, 6, 0.85)
        eye(g, 30, 6, 0.85)
        g.lineStyle(3, INK, 1)
        g.lineBetween(-4, -8, 12, -4)
        g.lineBetween(38, -8, 22, -4)
        smile(g, 18, 30, 7)
    } else {
        oval(g, 12, 10, 64, 60, C.skinKika, 4)
        rbox(g, -30, -50, 74, 16, 8, C.yellow, 4)
        face(g, i)
    }
    g.restore()

    rbox(g, 158 + lean, 104, 50, 14, 7, suit.scarf, 4)
    if (i === 1 || rival) poly(g, [{ x: 160 + lean, y: 108 }, { x: 108, y: 100 }, { x: 116, y: 114 }, { x: 160 + lean, y: 118 }], suit.scarf, 4)
    else poly(g, [{ x: 162, y: 112 }, { x: 150, y: 140 }, { x: 166, y: 140 }, { x: 172, y: 116 }], suit.scarf, 4)
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

// ───────────────────────────────────────────── karts (384 × 256, sem rodas)

/** Centros dos arcos das rodas: KART em `data/layout.ts` (0,245 / 0,79 · 0,8 · r 0,16). */
const KART_WHEELS = [
    { x: 94, y: 205 },
    { x: 303, y: 205 },
]

function kart(g: G, i: number) {
    const who = whoOf(i)
    const suit = SUIT[who ?? 'kika']
    rbox(g, 30, 132, 60, 40, 8, C.metal)
    rbox(g, 14, 150, 24, 12, 5, C.metalDark)
    rbox(g, 118, 98, 28, 70, 10, suit.dark)
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
        suit.body,
    )
    g.fillStyle(suit.stripe, 1)
    g.fillRect(64, 184, 286, 9)
    KART_WHEELS.forEach(w => disc(g, w.x, w.y, 47, C.garageInsideDark))
    limb(g, { x: 262, y: 160 }, { x: 246, y: 124 }, 7, C.metalDark)
    oval(g, 246, 118, 14, 36, C.rubber, 4)
    if (who) driver(g, i, who, { x: 240, y: 126 })
}

// ───────────────────────────────────────────── motos (384 × 256, sem rodas)

/** Centros das rodas da moto: MOTO em `data/layout.ts` (0,21 / 0,8 · 0,75 · r 0,21). */
const MOTO_WHEELS = [
    { x: 81, y: 192 },
    { x: 307, y: 192 },
]

function moto(g: G, i: number) {
    const who = whoOf(i)
    const suit = SUIT[who ?? 'kika']
    MOTO_WHEELS.forEach(w => disc(g, w.x, w.y, 58, C.garageInsideDark))
    limb(g, { x: 81, y: 192 }, { x: 176, y: 172 }, 12, C.metalDark)
    limb(g, { x: 307, y: 192 }, { x: 282, y: 104 }, 11, C.metal)
    limb(g, { x: 268, y: 100 }, { x: 292, y: 92 }, 8, C.metalDark)
    limb(g, { x: 196, y: 196 }, { x: 64, y: 172 }, 10, C.metalDark)
    rbox(g, 170, 158, 70, 44, 10, C.metal)
    g.fillStyle(C.metalDark, 1)
    g.fillRect(180, 170, 50, 6)
    g.fillRect(180, 184, 50, 6)
    poly(
        g,
        [
            { x: 40, y: 132 },
            { x: 132, y: 128 },
            { x: 160, y: 144 },
            { x: 150, y: 158 },
            { x: 48, y: 150 },
        ],
        suit.body,
    )
    poly(
        g,
        [
            { x: 150, y: 144 },
            { x: 236, y: 112 },
            { x: 286, y: 116 },
            { x: 290, y: 140 },
            { x: 246, y: 166 },
            { x: 160, y: 166 },
        ],
        suit.body,
    )
    g.fillStyle(suit.stripe, 1)
    g.fillRect(176, 146, 92, 8)
    rbox(g, 120, 130, 110, 16, 8, C.rubber, 4)
    poly(g, [{ x: 288, y: 132 }, { x: 344, y: 138 }, { x: 330, y: 150 }, { x: 290, y: 146 }], suit.body, 4)
    oval(g, 300, 110, 22, 30, C.lamp, 4)
    if (!who) return
    limb(g, { x: 212, y: 150 }, { x: 258, y: 168 }, 18, suit.dark)
    limb(g, { x: 258, y: 168 }, { x: 240, y: 204 }, 16, suit.dark)
    rbox(g, 228, 198, 34, 16, 6, C.shoe, 4)
    g.save()
    g.translateCanvas(30, -14)
    driver(g, i, who, { x: 250, y: 112 })
    g.restore()
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

// ───────────────────────────────────────────── peças (256, 6 × 3)

function piece(g: G, i: number) {
    const c = 128
    switch (i) {
        case 0:
        case 1:
        case 2:
            return tire(g, c, c, 100, i)
        case 3:
            return flatTire(g)
        case 4:
        case 5:
            return motoTire(g, c, c, 108, i - 4)
        case 6:
        case 7:
        case 8:
            return cart(g, (x, y) => tire(g, x, y, 60, i - 6))
        case 9:
        case 10:
            return cart(g, (x, y) => motoTire(g, x, y - 10, 70, i - 9), true)
        case 11:
            return hay(g)
        case 12:
            return rainCloud(g)
        case 13:
            return cloud(g, c, 132, C.cloud, C.cloudDark, 1)
        case 14:
            return sun(g)
        case 15:
            return puddle(g)
        case 16:
            return mudPuddle(g)
        default:
            return checkered(g)
    }
}

const STRIPE = [C.slick, C.wetTire, C.knobby]

/** Pneu de carro: 0 liso, 1 chuva (sulcos fundos), 2 cravos (blocos grandes). */
function tire(g: G, x: number, y: number, r: number, kind: number) {
    if (kind === 0) disc(g, x, y, r, C.rubber)
    else {
        const teeth = kind === 1 ? 18 : 11
        const depth = kind === 1 ? 0.88 : 0.8
        const pts: P[] = []
        for (let k = 0; k < teeth * 4; k++) {
            const a = (k * Math.PI) / (teeth * 2)
            const out = kind === 1 ? k % 2 === 0 : k % 4 < 2
            const rr = out ? r : r * depth
            pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr })
        }
        poly(g, pts, C.rubber)
    }
    g.lineStyle(r * 0.13, STRIPE[kind], 1)
    g.strokeCircle(x, y, r * 0.64)
    disc(g, x, y, r * 0.46, C.rim, lw - 1)
    disc(g, x, y, r * 0.18, C.rimDark, lw - 2)
    g.fillStyle(C.white, 0.7)
    g.fillEllipse(x - r * 0.18, y - r * 0.22, r * 0.2, r * 0.11)
}

/** Pneu de moto: borracha fina, aro grande e raios. 0 liso, 1 chuva. */
function motoTire(g: G, x: number, y: number, r: number, kind: number) {
    if (kind === 0) disc(g, x, y, r, C.rubber)
    else {
        const teeth = 26
        const pts: P[] = []
        for (let k = 0; k < teeth * 2; k++) {
            const a = (k * Math.PI) / teeth
            const rr = k % 2 ? r * 0.92 : r
            pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr })
        }
        poly(g, pts, C.rubber)
    }
    g.lineStyle(r * 0.08, STRIPE[kind], 1)
    g.strokeCircle(x, y, r * 0.8)
    disc(g, x, y, r * 0.72, C.rim, lw - 1)
    g.lineStyle(3, C.spoke, 1)
    for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 8
        g.lineBetween(x + Math.cos(a) * r * 0.68, y + Math.sin(a) * r * 0.68, x - Math.cos(a) * r * 0.68, y - Math.sin(a) * r * 0.68)
    }
    disc(g, x, y, r * 0.14, C.rimDark, lw - 2)
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

/** O mesmo carrinho nas cinco células: só muda o pneu. */
function cart(g: G, draw: (x: number, y: number) => void, tall = false) {
    limb(g, { x: 38, y: 210 }, { x: 30, y: 96 }, 10, C.metalDark)
    limb(g, { x: 30, y: 96 }, { x: 50, y: 92 }, 10, C.metalDark)
    disc(g, 66, 226, 18, C.rubber)
    disc(g, 196, 226, 18, C.rubber)
    disc(g, 66, 226, 7, C.rim, 3)
    disc(g, 196, 226, 7, C.rim, 3)
    rbox(g, 30, 194, 200, 24, 8, C.cart)
    g.fillStyle(C.cartDark, 1)
    g.fillRect(36, 210, 188, 6)
    const y = tall ? 126 : 134
    draw(tall ? 92 : 98, y)
    draw(tall ? 168 : 164, y)
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

/** A poça de lama: é também o desenho da condição "lama" na regra. */
function mudPuddle(g: G) {
    const blobs = [
        { x: 70, y: 150, r: 46 },
        { x: 128, y: 134, r: 58 },
        { x: 186, y: 150, r: 44 },
        { x: 128, y: 168, r: 50 },
    ]
    blobs.forEach(b => disc(g, b.x, b.y, b.r + lw, INK, 0))
    blobs.forEach(b => disc(g, b.x, b.y, b.r, C.mud, 0))
    g.fillStyle(C.mudDark, 1)
    g.fillEllipse(128, 160, 120, 40)
    g.fillStyle(C.mudLight, 1)
    g.fillEllipse(96, 118, 40, 14)
    ;[
        { x: 40, y: 96, r: 12 },
        { x: 216, y: 100, r: 10 },
        { x: 190, y: 74, r: 8 },
    ].forEach(d => disc(g, d.x, d.y, d.r, C.mud, 4))
}

function checkered(g: G) {
    g.lineStyle(8, C.metalDark, 1)
    g.lineBetween(56, 236, 56, 28)
    disc(g, 56, 24, 9, C.yellow, 4)
    const x = 60
    const y = 34
    const w = 160
    const h = 112
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 5; c++) {
            g.fillStyle((r + c) % 2 ? C.white : C.flagDark, 1)
            g.fillRect(x + (c * w) / 5, y + (r * h) / 4 + Math.sin(c * 1.3) * 4, w / 5, h / 4)
        }
    g.lineStyle(lw, INK, 1)
    g.strokeRect(x, y, w, h)
}

// ───────────────────────────────────────────── controles (256, 3 × 1)

function control(g: G, i: number) {
    if (i === 2) return wrench(g)
    const gas = i === 0
    const w = gas ? 110 : 170
    const h = gas ? 190 : 130
    g.save()
    g.translateCanvas(128, 128)
    g.rotateCanvas(-0.18)
    rbox(g, -w / 2, -h / 2 + 8, w, h, 26, C.metalDark)
    rbox(g, -w / 2, -h / 2, w, h, 26, C.metal)
    g.fillStyle(C.metalDark, 1)
    const n = gas ? 6 : 4
    for (let k = 0; k < n; k++) g.fillRoundedRect(-w / 2 + 16, -h / 2 + 20 + k * ((h - 40) / (n - 1)) - 5, w - 32, 10, 5)
    g.restore()
}

function wrench(g: G) {
    tire(g, 150, 136, 78, 1)
    g.save()
    g.translateCanvas(110, 130)
    g.rotateCanvas(-0.75)
    rbox(g, -16, -10, 32, 150, 14, C.metal)
    g.fillStyle(INK, 1)
    g.fillCircle(0, -26, 44)
    g.fillStyle(C.metal, 1)
    g.fillCircle(0, -26, 38)
    g.fillStyle(C.white, 1)
    g.fillRect(-14, -78, 28, 44)
    g.lineStyle(lw, INK, 1)
    g.lineBetween(-14, -70, -14, -40)
    g.lineBetween(14, -70, 14, -40)
    g.restore()
}

// ───────────────────────────────────────────── autódromo (1280 × 520, céu transparente)

function track(g: G) {
    const W = 1280
    const rnd = new Phaser.Math.RandomDataGenerator(['autodromo'])
    g.fillStyle(C.stand, 1)
    g.fillRect(0, 96, W, 124)
    for (let r = 0; r < 4; r++) {
        g.fillStyle(r % 2 ? C.stand : C.standDark, 1)
        g.fillRect(0, 118 + r * 26, W, 13)
    }
    for (let r = 0; r < 4; r++) {
        const y = 112 + r * 26
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
        g.fillRect(x - 4, 120, 8, 100)
    }

    g.fillStyle(C.wall, 1)
    g.fillRect(0, 216, W, 20)
    g.fillStyle(C.wallDark, 1)
    g.fillRect(0, 232, W, 4)
    for (let x = 0; x < W; x += 160) g.fillRect(x, 218, 4, 16)

    g.fillStyle(C.pitLane, 1)
    g.fillRect(0, 236, W, 54)
    g.fillStyle(C.pitLaneDark, 1)
    g.fillRect(0, 236, W, 10)
    for (let x = 0; x < W; x += 64) {
        g.fillStyle(C.lane, 0.55)
        g.fillRect(x + 12, 266, 30, 4)
    }
    g.fillStyle(C.white, 1)
    g.fillRect(0, 290, W, 10)

    g.fillStyle(C.asphalt, 1)
    g.fillRect(0, 300, W, 140)
    g.fillStyle(C.asphaltDark, 1)
    g.fillRect(0, 310, W, 18)
    for (let x = 0; x < W; x += 80) {
        g.fillStyle(C.lane, 0.75)
        g.fillRect(x + 10, 384, 40, 6)
    }
    for (let x = 0; x < W; x += 40) {
        g.fillStyle((x / 40) % 2 ? C.kerbWhite : C.kerbRed, 1)
        g.fillRect(x, 300, 40, 10)
        g.fillRect(x, 430, 40, 10)
    }

    g.fillStyle(C.grass, 1)
    g.fillRect(0, 440, W, 80)
    for (let x = 0; x < W; x += 160) {
        g.fillStyle(C.grassDark, 0.5)
        g.fillRect(x, 440, 80, 80)
    }
}

/** A lama (1280 × 204): o mesmo desenho da faixa do box e da pista, só que de terra. */
function mudStrip(g: G) {
    const W = 1280
    const rnd = new Phaser.Math.RandomDataGenerator(['lama'])
    g.fillStyle(C.mudLight, 1)
    g.fillRect(0, 0, W, 56)
    g.fillStyle(C.mud, 1)
    g.fillRect(0, 0, W, 8)
    for (let x = 0; x < W; x += 80) {
        g.fillStyle(C.mud, 0.7)
        g.fillEllipse(x + 40, 30, 44, 8)
    }
    g.fillStyle(C.tentDark, 1)
    g.fillRect(0, 54, W, 10)
    for (let x = 0; x < W; x += 64) {
        g.fillStyle(C.clipDark, 1)
        g.fillRect(x + 4, 50, 10, 18)
    }
    g.fillStyle(C.mud, 1)
    g.fillRect(0, 64, W, 140)
    g.fillStyle(C.mudDark, 1)
    ;[92, 118, 150, 178].forEach(y => g.fillRect(0, y, W, 6))
    for (let k = 0; k < 40; k++) {
        const x = rnd.between(0, W)
        const y = rnd.between(76, 196)
        const w = rnd.between(40, 110)
        g.fillStyle(rnd.frac() < 0.5 ? C.mudWet : C.mudLight, rnd.frac() < 0.5 ? 0.8 : 0.6)
        g.fillEllipse(x, y, w, w * 0.18)
        if (x + w > W) g.fillEllipse(x - W, y, w, w * 0.18)
        if (x - w < 0) g.fillEllipse(x + W, y, w, w * 0.18)
    }
}

// ───────────────────────────────────────────── tenda da equipe (600 × 360)

function tent(g: G) {
    rbox(g, 70, 120, 460, 236, 6, C.garageInside)
    g.fillStyle(C.garageInsideDark, 1)
    g.fillRect(76, 126, 448, 34)
    g.lineStyle(3, C.garageInsideDark, 1)
    for (let x = 120; x < 480; x += 36)
        for (let y = 180; y < 270; y += 28) g.strokeCircle(x, y, 3)
    ;[
        { x: 150, y: 196, w: 60, h: 10 },
        { x: 250, y: 184, w: 10, h: 54 },
        { x: 360, y: 200, w: 70, h: 10 },
    ].forEach(t => {
        g.fillStyle(C.metal, 1)
        g.fillRoundedRect(t.x, t.y, t.w, t.h, 4)
    })
    ;[120, 480].forEach(x => {
        for (let k = 0; k < 3; k++) {
            g.fillStyle(C.rubber, 1)
            g.fillRoundedRect(x - 30, 350 - (k + 1) * 26, 60, 24, 10)
            g.fillStyle(C.rubberLight, 1)
            g.fillRect(x - 22, 350 - (k + 1) * 26 + 9, 44, 4)
        }
    })
    g.lineStyle(3, C.metalDark, 1)
    g.lineBetween(300, 126, 300, 150)
    oval(g, 300, 156, 46, 20, C.lamp, 4)
    g.fillStyle(C.lamp, 0.18)
    g.fillTriangle(300, 162, 210, 352, 390, 352)
    ;[52, 548].forEach(x => rbox(g, x - 9, 96, 18, 262, 6, C.metal, 4))
    poly(
        g,
        [
            { x: 20, y: 110 },
            { x: 120, y: 30 },
            { x: 480, y: 30 },
            { x: 580, y: 110 },
        ],
        C.tent,
    )
    for (let k = 0; k < 10; k++) {
        const x = 40 + k * 52
        g.fillStyle(k % 2 ? C.yellow : C.team, 1)
        g.fillRect(x, 108, 52, 26)
        g.fillCircle(x + 26, 134, 26)
    }
    g.lineStyle(lw, INK, 1)
    g.strokeRect(40, 108, 520, 26)
    g.fillStyle(C.team, 1)
    g.fillTriangle(240, 30, 300, 4, 360, 30)
    g.lineStyle(lw, INK, 1)
    g.strokeTriangle(240, 30, 300, 4, 360, 30)
    g.lineStyle(lw, INK, 1)
    g.lineBetween(64, 356, 536, 356)
}

// ───────────────────────────────────────────── mãozinha (256 × 256)

/** Dedo indicador em pé, ponta em (87, 18): é o HAND_TIP. Borda branca para aparecer sobre tudo. */
function hand(g: G) {
    const rr = (x: number, y: number, w: number, h: number, r: number, fill: number) => {
        g.fillStyle(fill, 1)
        g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
    }
    const paint = (grow: number, tone: number, dark: number) => {
        rr(68 - grow, 10 - grow, 38 + grow * 2, 130 + grow, 19 + grow, tone)
        rr(104 - grow, 92 - grow, 34 + grow * 2, 70 + grow, 17 + grow, tone)
        rr(134 - grow, 102 - grow, 32 + grow * 2, 64 + grow, 16 + grow, tone)
        rr(162 - grow, 114 - grow, 28 + grow * 2, 56 + grow, 14 + grow, tone)
        rr(30 - grow, 128 - grow, 70 + grow * 2, 34 + grow * 2, 17 + grow, tone)
        rr(64 - grow, 120 - grow, 128 + grow * 2, 110 + grow * 2, 40 + grow, tone)
        if (dark >= 0) rr(76, 196, 104, 12, 6, dark)
    }
    paint(14, INK, -1)
    paint(10, C.white, -1)
    paint(0, C.skinHand, C.skinHandDark)
    rr(76, 22, 22, 18, 9, C.white)
}
