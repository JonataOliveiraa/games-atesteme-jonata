import Phaser from 'phaser'
import { ANT_SHEET, BG_KEY, DIRT_SHEET, FRIEND_SHEET, FRUIT_SHEET, GIANT_KEY, LEAF_SHEET, PROPS_SHEET, QUEEN_SHEET, type Sheet } from '../data/files'
import { ITEMS, itemPoly } from '../data/fruits'
import { contains } from '../data/geometry'
import { GIANT, H, W } from '../data/layout'
import { C } from '../data/theme'
import type { FruitKind, LeafKind } from '../types'
import { starPoints } from './art'

/**
 * A ARTE DE RESERVA. Desenha em Graphics as mesmas folhas, grades e ordem de
 * células do TEXTURAS.md. Um PNG com o mesmo nome em
 * `src/assets/games/EF15CO04/operacao-formiga/` toma o lugar dela.
 */

type G = Phaser.GameObjects.Graphics
type P = { x: number; y: number }

const INK = C.line
const LW = 5

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
    bakeSheet(scene, ANT_SHEET, antCell)
    bakeSheet(scene, QUEEN_SHEET, queenCell)
    bakeSheet(scene, FRUIT_SHEET, fruitCell)
    bakeSheet(scene, PROPS_SHEET, propCell)
    bakeImage(scene, BG_KEY, W, H, background)
    bakeSheet(scene, LEAF_SHEET, leafCell)
    bakeImage(scene, GIANT_KEY, GIANT.imageW, GIANT.imageH, giantLeaf)
    bakeSheet(scene, DIRT_SHEET, dirtCell)
    bakeSheet(scene, FRIEND_SHEET, friendCell)
}

/** Um sorteio que dá sempre a mesma sequência (a arte não muda de uma carga para outra). */
function rng(seed: number) {
    let s = seed >>> 0
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0
        return s / 0x100000000
    }
}

function blob(cx: number, cy: number, rx: number, ry: number, wobble: number, seed: number, n = 14): P[] {
    const r = rng(seed)
    const pts: P[] = []
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        const k = 1 + (r() - 0.5) * wobble
        pts.push({ x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k })
    }
    return smooth(pts)
}

/** Arredonda um polígono pelos pontos médios (duas passadas de Chaikin). */
function smooth(pts: P[], passes = 2): P[] {
    let out = pts
    for (let p = 0; p < passes; p++) {
        const next: P[] = []
        for (let i = 0; i < out.length; i++) {
            const a = out[i]
            const b = out[(i + 1) % out.length]
            next.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 })
            next.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 })
        }
        out = next
    }
    return out
}

function shape(g: G, pts: P[], fill: number, line = LW) {
    if (line > 0) {
        g.lineStyle(line * 2, INK, 1)
        g.strokePoints(pts, true, true)
    }
    g.fillStyle(fill, 1)
    g.fillPoints(pts, true, true)
}

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LW) {
    if (line > 0) {
        g.lineStyle(line * 2, INK, 1)
        g.strokeEllipse(x, y, w, h)
    }
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
}

function stroke(g: G, pts: P[], width: number, color: number) {
    g.lineStyle(width, color, 1)
    g.strokePoints(pts, false)
    g.fillStyle(color, 1)
    pts.forEach(p => g.fillCircle(p.x, p.y, width / 2))
}

function limb(g: G, pts: P[], color: number, width = 8) {
    stroke(g, pts, width + LW * 2 - 2, INK)
    stroke(g, pts, width, color)
}

function arc(g: G, x: number, y: number, r: number, from: number, to: number, width: number, color: number) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to, false)
    g.strokePath()
}

function eye(g: G, x: number, y: number, w: number, h: number, look = 2) {
    g.fillStyle(C.white, 1)
    g.fillEllipse(x, y, w, h)
    g.lineStyle(3, INK, 1)
    g.strokeEllipse(x, y, w, h)
    g.fillStyle(C.eye, 1)
    g.fillEllipse(x + look, y + 2, w * 0.66, h * 0.7)
    g.fillStyle(C.white, 1)
    g.fillCircle(x + look - w * 0.12, y - h * 0.12, w * 0.16)
    g.fillCircle(x + look + w * 0.14, y + h * 0.16, w * 0.07)
}

function closedEye(g: G, x: number, y: number, r: number) {
    arc(g, x, y + r * 0.5, r, Math.PI * 1.15, Math.PI * 1.85, 4, INK)
}

// ───────────────────────────────────────────── a formiga (virada para a direita)

type Legs = { near: [number, number, number]; far: [number, number, number]; raise: boolean }
type Face = 'open' | 'happy' | 'push' | 'sleep' | 'yawn'
type Pal = { body: number; light: number; dark: number }

const STILL: Legs = { near: [0, 0, 0], far: [0, 0, 0], raise: false }
const STEP_A: Legs = { near: [12, -12, 12], far: [-12, 12, -12], raise: false }
const STEP_B: Legs = { near: [-12, 12, -12], far: [12, -12, 12], raise: false }
const HOLD: Legs = { near: [0, 0, 0], far: [0, 0, 0], raise: true }
const HOLD_A: Legs = { near: [12, -12, 0], far: [-12, 12, 0], raise: true }
const HOLD_B: Legs = { near: [-12, 12, 0], far: [12, -12, 0], raise: true }
const LEAN: Legs = { near: [-16, -8, 6], far: [-20, -10, 4], raise: false }

const RED: Pal = { body: C.ant, light: C.antLight, dark: C.antDark }
const OLIVE: Pal = { body: C.friend, light: C.friendLight, dark: C.friendDark }

const ANT_LOOK: [Legs, Face][] = [
    [STILL, 'open'],
    [STEP_A, 'open'],
    [STEP_B, 'open'],
    [HOLD, 'open'],
    [HOLD_A, 'open'],
    [HOLD_B, 'open'],
    [HOLD, 'happy'],
    [LEAN, 'push'],
]

const FRIEND_LOOK: [Legs, Face][] = [
    [STILL, 'sleep'],
    [STILL, 'yawn'],
    [STEP_A, 'open'],
    [STEP_B, 'open'],
    [HOLD_A, 'open'],
    [HOLD_B, 'open'],
    [HOLD, 'happy'],
    [LEAN, 'push'],
]

function antCell(g: G, i: number) {
    const [legs, face] = ANT_LOOK[i]
    antFigure(g, legs, face, RED, false)
}

function friendCell(g: G, i: number) {
    const [legs, face] = FRIEND_LOOK[i]
    antFigure(g, legs, face, OLIVE, true)
}

function antFigure(g: G, pose: Legs, face: Face, pal: Pal, bow: boolean) {
    const push = face === 'push'
    const sleep = face === 'sleep'
    g.save()
    if (push) {
        g.translateCanvas(96, 182)
        g.rotateCanvas(0.14)
        g.translateCanvas(-96, -182)
    }
    if (sleep) {
        // deitada: o corpo encosta no chão e as perninhas se encolhem
        g.translateCanvas(96, 182)
        g.rotateCanvas(-0.08)
        g.translateCanvas(-96, -166)
    }
    const hips = [92, 103, 114]
    const feet = [66, 103, 140]
    const tuck = sleep ? 0.45 : 1
    const footY = (y: number) => 142 + (y - 142) * tuck

    // as pernas de trás (o outro lado), mais escuras
    hips.forEach((hx, k) => {
        if (pose.raise && k === 2) {
            limb(g, [{ x: hx + 8, y: 128 }, { x: hx + 18, y: 82 }, { x: 122, y: 44 }], pal.dark, 7)
            return
        }
        const fx = hx + 8 + (feet[k] + pose.far[k] - hx) * tuck
        limb(g, [{ x: hx + 8, y: 140 }, { x: (hx + fx) / 2 + 6, y: footY(150) }, { x: fx, y: footY(176) }], pal.dark, 7)
    })

    // o corpo, numa silhueta só: contorno de tudo, depois o recheio
    const parts: [number, number, number, number, number][] = [
        [54, 132, 86, 70, pal.body],
        [86, 136, 20, 18, pal.dark],
        [105, 130, 46, 38, pal.body],
        [140, 102, 78, 76, pal.body],
    ]
    g.lineStyle(LW * 2, INK, 1)
    parts.forEach(([x, y, w, h]) => g.strokeEllipse(x, y, w, h))
    parts.forEach(([x, y, w, h, c]) => {
        g.fillStyle(c, 1)
        g.fillEllipse(x, y, w, h)
    })
    // brilhos
    g.fillStyle(pal.light, 1)
    g.fillEllipse(44, 116, 34, 18)
    g.fillEllipse(128, 80, 30, 18)
    g.fillStyle(C.white, 0.7)
    g.fillEllipse(40, 112, 12, 7)
    g.fillEllipse(124, 76, 10, 6)
    // listrinhas do abdômen
    arc(g, 54, 132, 30, -0.9, 0.9, 3, pal.dark)
    arc(g, 54, 132, 18, -0.8, 0.8, 3, pal.dark)

    // antenas
    limb(g, [{ x: 130, y: 70 }, { x: 140, y: 44 }, { x: 160, y: 30 }], pal.dark, 5)
    limb(g, [{ x: 150, y: 70 }, { x: 166, y: 48 }, { x: 180, y: 42 }], pal.dark, 5)
    oval(g, 162, 28, 14, 14, pal.body, 3)
    oval(g, 181, 40, 12, 12, pal.body, 3)
    if (bow) {
        // o laço amarelo na antena
        shape(g, [{ x: 166, y: 50 }, { x: 150, y: 40 }, { x: 152, y: 60 }], C.bow, 2)
        shape(g, [{ x: 166, y: 50 }, { x: 182, y: 58 }, { x: 176, y: 70 }], C.bow, 2)
        oval(g, 166, 51, 10, 10, C.bowDark, 2)
    }

    // o rosto
    if (face === 'happy') {
        closedEye(g, 136, 98, 9)
        closedEye(g, 160, 100, 11)
        g.fillStyle(C.mouth, 1)
        g.fillEllipse(156, 120, 22, 16)
        g.fillStyle(C.cheek, 1)
        g.fillEllipse(171, 116, 10, 7)
    } else if (push) {
        g.lineStyle(4, INK, 1)
        g.strokePoints([{ x: 128, y: 92 }, { x: 138, y: 98 }, { x: 128, y: 104 }], false)
        g.strokePoints([{ x: 166, y: 92 }, { x: 154, y: 98 }, { x: 166, y: 104 }], false)
        arc(g, 156, 128, 8, Math.PI * 1.1, Math.PI * 1.9, 4, INK)
        // a gotinha
        g.fillStyle(C.sky, 1)
        g.fillTriangle(116, 62, 110, 76, 122, 76)
        g.fillCircle(116, 78, 6)
        g.lineStyle(2, INK, 1)
        g.strokeCircle(116, 78, 6)
    } else if (sleep || face === 'yawn') {
        arc(g, 134, 94, 8, 0.2, Math.PI - 0.2, 4, INK)
        arc(g, 160, 96, 10, 0.2, Math.PI - 0.2, 4, INK)
        g.fillStyle(C.cheek, 1)
        g.fillEllipse(173, 114, 12, 8)
        g.fillEllipse(124, 112, 10, 7)
        if (sleep) arc(g, 156, 120, 6, 0.3, Math.PI - 0.3, 3, INK)
        else {
            g.fillStyle(C.mouth, 1)
            g.fillEllipse(154, 124, 16, 20)
            g.lineStyle(3, INK, 1)
            g.strokeEllipse(154, 124, 16, 20)
        }
    } else {
        eye(g, 134, 98, 16, 24, 2)
        eye(g, 160, 100, 22, 28, 3)
        arc(g, 158, 116, 9, 0.2, Math.PI - 0.2, 4, INK)
        g.fillStyle(C.cheek, 1)
        g.fillEllipse(173, 116, 10, 7)
    }

    // as pernas da frente (deste lado)
    hips.forEach((hx, k) => {
        if (pose.raise && k === 2) {
            limb(g, [{ x: hx, y: 130 }, { x: hx - 6, y: 84 }, { x: 104, y: 46 }], pal.body, 8)
            return
        }
        if (face === 'yawn' && k === 2) {
            // a patinha esfregando o olho
            limb(g, [{ x: hx, y: 130 }, { x: hx + 10, y: 112 }, { x: 128, y: 98 }], pal.body, 8)
            return
        }
        const fx = hx + (feet[k] + pose.near[k] - hx) * tuck
        limb(g, [{ x: hx, y: 142 }, { x: (hx + fx) / 2 - 4, y: footY(156) }, { x: fx, y: footY(180) }], pal.body, 8)
    })
    g.restore()
}

// ───────────────────────────────────────────── a rainha (virada para a esquerda)

function queenCell(g: G, i: number) {
    const ask = i === 1
    const happy = i === 2
    // pernas do outro lado
    ;[
        [140, 190, 170],
        [128, 190, 134],
        [116, 188, 98],
    ].forEach(([hx, hy, fx]) => limb(g, [{ x: hx + 10, y: hy }, { x: (hx + fx) / 2 + 14, y: 210 }, { x: fx + 10, y: 242 }], C.queenDark, 9))

    const parts: [number, number, number, number, number][] = [
        [182, 174, 120, 98, C.queen],
        [148, 178, 22, 20, C.queenDark],
        [128, 172, 58, 46, C.queen],
        [86, 130, 102, 98, C.queen],
    ]
    g.lineStyle(LW * 2, INK, 1)
    parts.forEach(([x, y, w, h]) => g.strokeEllipse(x, y, w, h))
    parts.forEach(([x, y, w, h, c]) => {
        g.fillStyle(c, 1)
        g.fillEllipse(x, y, w, h)
    })
    g.fillStyle(C.queenLight, 1)
    g.fillEllipse(196, 152, 56, 26)
    g.fillEllipse(74, 104, 40, 22)
    g.fillStyle(C.white, 0.65)
    g.fillEllipse(204, 148, 16, 8)
    arc(g, 182, 174, 40, Math.PI - 0.9, Math.PI + 0.9, 3, C.queenDark)
    arc(g, 182, 174, 24, Math.PI - 0.8, Math.PI + 0.8, 3, C.queenDark)

    // a capinha
    shape(g, smooth([{ x: 108, y: 150 }, { x: 160, y: 148 }, { x: 176, y: 204 }, { x: 140, y: 214 }, { x: 104, y: 198 }], 1), C.cape, 3)
    g.fillStyle(C.capeDark, 1)
    g.fillEllipse(150, 202, 40, 10)

    // antenas e coroa
    limb(g, [{ x: 70, y: 90 }, { x: 52, y: 62 }, { x: 34, y: 54 }], C.queenDark, 6)
    limb(g, [{ x: 104, y: 88 }, { x: 118, y: 58 }, { x: 136, y: 48 }], C.queenDark, 6)
    oval(g, 32, 52, 16, 16, C.queen, 3)
    oval(g, 138, 46, 14, 14, C.queen, 3)
    const crown: P[] = [
        { x: 60, y: 92 },
        { x: 58, y: 60 },
        { x: 72, y: 74 },
        { x: 86, y: 52 },
        { x: 100, y: 74 },
        { x: 114, y: 60 },
        { x: 112, y: 92 },
    ]
    shape(g, crown, C.crown, 3)
    g.fillStyle(C.crownDark, 1)
    g.fillRect(60, 84, 52, 6)
    g.fillStyle(C.cape, 1)
    g.fillCircle(86, 74, 5)
    g.fillStyle(C.white, 0.8)
    g.fillCircle(70, 72, 3)

    // o rosto (olhando para a esquerda)
    if (happy) {
        closedEye(g, 70, 128, 12)
        closedEye(g, 100, 124, 9)
        g.fillStyle(C.mouth, 1)
        g.fillEllipse(70, 154, 30, 22)
    } else {
        eye(g, 68, 128, 26, 32, -3)
        eye(g, 98, 124, 18, 26, -2)
        if (ask) {
            g.fillStyle(C.mouth, 1)
            g.fillEllipse(66, 156, 18, 16)
        } else arc(g, 68, 148, 10, 0.25, Math.PI - 0.25, 4, INK)
    }
    g.fillStyle(C.cheek, 1)
    g.fillEllipse(52, 146, 14, 9)

    // pernas deste lado
    ;[
        [146, 196, 166],
        [132, 196, 130],
    ].forEach(([hx, hy, fx]) => limb(g, [{ x: hx, y: hy }, { x: (hx + fx) / 2 - 8, y: 214 }, { x: fx, y: 244 }], C.queen, 10))
    if (ask) limb(g, [{ x: 116, y: 190 }, { x: 84, y: 186 }, { x: 50, y: 172 }], C.queen, 10)
    else if (happy) {
        limb(g, [{ x: 116, y: 186 }, { x: 96, y: 176 }, { x: 80, y: 196 }], C.queen, 10)
        limb(g, [{ x: 150, y: 160 }, { x: 166, y: 120 }, { x: 160, y: 92 }], C.queen, 10)
    } else limb(g, [{ x: 118, y: 196 }, { x: 102, y: 214 }, { x: 94, y: 244 }], C.queen, 10)
}

// ───────────────────────────────────────────── as frutas (vistas de cima)

const FRUIT_ORDER: FruitKind[] = ['morango', 'laranja', 'maca']

function fruitCell(g: G, i: number) {
    const kind = FRUIT_ORDER[i]
    if (!kind) return
    const def = ITEMS[kind]
    const poly = itemPoly(def)
    const pts = poly.map(p => ({ x: 256 + p.x, y: 256 + p.y }))
    const inside = (x: number, y: number, pad = 0) =>
        contains(poly, { x: x - 256, y: y - 256 }) &&
        contains(poly, { x: x - 256 + pad, y: y - 256 }) &&
        contains(poly, { x: x - 256 - pad, y: y - 256 }) &&
        contains(poly, { x: x - 256, y: y - 256 + pad }) &&
        contains(poly, { x: x - 256, y: y - 256 - pad })

    g.fillStyle(def.skin, 1)
    g.fillPoints(pts, true, true)
    // sombra de um lado, brilho do outro
    const shade = pts.map(p => ({ x: 256 + (p.x - 256) * 0.9 + 14, y: 256 + (p.y - 256) * 0.9 + 16 }))
    g.fillStyle(def.pulpDark, 0.35)
    g.fillPoints(shade, true, true)
    g.fillStyle(def.skin, 1)
    g.fillPoints(
        pts.map(p => ({ x: 256 + (p.x - 256) * 0.86 - 6, y: 256 + (p.y - 256) * 0.86 - 6 })),
        true,
        true,
    )

    const r = rng(17 + i * 31)
    if (kind === 'morango') {
        for (let y = 90; y < 470; y += 40) {
            for (let x = 70 + ((y / 40) % 2) * 22; x < 450; x += 44) {
                const jx = x + (r() - 0.5) * 8
                const jy = y + (r() - 0.5) * 8
                if (!inside(jx, jy, 22) || jy < 150) continue
                g.fillStyle(C.seed, 1)
                g.fillEllipse(jx, jy, 9, 14)
                g.lineStyle(2, def.pulpDark, 1)
                g.strokeEllipse(jx, jy, 9, 14)
            }
        }
        const cap = starPoints(256, 112, 64, 26)
        shape(g, smooth(cap, 1), C.sepal, 3)
        g.fillStyle(C.sepalDark, 1)
        g.fillCircle(256, 112, 14)
        g.fillStyle(C.leafDark, 1)
        g.fillRect(250, 92, 12, 22)
        g.fillStyle(C.white, 0.75)
        g.fillEllipse(176, 196, 34, 18)
    } else if (kind === 'laranja') {
        for (let k = 0; k < 140; k++) {
            const x = 40 + r() * 432
            const y = 40 + r() * 432
            if (!inside(x, y, 14)) continue
            g.fillStyle(def.pulpDark, 0.45)
            g.fillCircle(x, y, 2.5 + r() * 1.5)
        }
        g.fillStyle(def.pulpDark, 1)
        g.fillCircle(256, 256, 14)
        g.fillStyle(def.skin, 1)
        g.fillCircle(256, 256, 7)
        const leaf = smooth([{ x: 230, y: 92 }, { x: 266, y: 64 }, { x: 318, y: 66 }, { x: 288, y: 98 }], 2)
        shape(g, leaf, C.leaf, 3)
        g.lineStyle(3, C.leafDark, 1)
        g.lineBetween(236, 90, 304, 72)
        g.fillStyle(C.white, 0.7)
        g.fillEllipse(170, 160, 54, 26)
    } else {
        for (let k = 0; k < 40; k++) {
            const x = 60 + r() * 392
            const y = 60 + r() * 392
            if (!inside(x, y, 20)) continue
            g.fillStyle(def.pulpDark, 0.5)
            g.fillCircle(x, y, 2.5)
        }
        g.fillStyle(def.pulpDark, 0.7)
        g.fillEllipse(256, 222, 50, 30)
        stroke(g, [{ x: 256, y: 226 }, { x: 262, y: 186 }], 12, INK)
        stroke(g, [{ x: 256, y: 226 }, { x: 262, y: 186 }], 7, 0x8a5a2b)
        const leaf = smooth([{ x: 266, y: 192 }, { x: 300, y: 164 }, { x: 346, y: 168 }, { x: 314, y: 198 }], 2)
        shape(g, leaf, C.leaf, 3)
        g.fillStyle(C.white, 0.75)
        g.fillEllipse(170, 168, 60, 30)
        g.fillEllipse(208, 140, 16, 9)
    }
    // contorno por dentro da silhueta (o recorte do pedaço guarda a metade de dentro)
    g.lineStyle(12, INK, 1)
    g.strokePoints(pts, true, true)
}

// ───────────────────────────────────────────── o cenário

function propCell(g: G, i: number) {
    if (i === 0) mound(g)
    else if (i === 1) stone(g, 128, 171, 200, 150, 11)
    else if (i === 2) stone(g, 128, 156, 170, 180, 23)
    else if (i === 3) stone(g, 128, 181, 210, 130, 37)
    else if (i === 4) plate(g)
    else if (i === 5) bush(g)
    else if (i === 6) tuft(g, 128, 220, 1.4)
    else puff(g)
}

function mound(g: G) {
    shape(g, blob(128, 196, 114, 52, 0.08, 5, 18), C.moundDark)
    shape(g, smooth([{ x: 22, y: 210 }, { x: 52, y: 128 }, { x: 128, y: 100 }, { x: 204, y: 128 }, { x: 234, y: 210 }], 3), C.mound)
    g.fillStyle(C.moundLight, 1)
    g.fillEllipse(110, 138, 90, 34)
    oval(g, 128, 150, 76, 38, C.moundDark, 3)
    g.fillStyle(C.hole, 1)
    g.fillEllipse(128, 154, 62, 28)
    const r = rng(9)
    for (let k = 0; k < 9; k++) {
        const x = 40 + r() * 176
        const y = 182 + r() * 40
        oval(g, x, y, 10 + r() * 6, 7 + r() * 4, C.moundLight, 2)
    }
}

function stone(g: G, cx: number, cy: number, w: number, h: number, seed: number) {
    shape(g, blob(cx, cy, w / 2, h / 2, 0.16, seed, 12), C.stone)
    g.fillStyle(C.stoneDark, 0.55)
    g.fillPoints(blob(cx + w * 0.08, cy + h * 0.16, w * 0.4, h * 0.3, 0.2, seed + 1, 10), true, true)
    g.fillStyle(C.stoneLight, 1)
    g.fillPoints(blob(cx - w * 0.1, cy - h * 0.14, w * 0.3, h * 0.2, 0.2, seed + 2, 10), true, true)
    g.fillStyle(C.moss, 1)
    g.fillPoints(blob(cx + w * 0.16, cy - h * 0.3, w * 0.18, h * 0.1, 0.3, seed + 3, 10), true, true)
    g.fillStyle(C.white, 0.6)
    g.fillEllipse(cx - w * 0.18, cy - h * 0.22, w * 0.1, h * 0.06)
}

function plate(g: G) {
    shape(g, blob(128, 128, 116, 112, 0.06, 41, 16), C.plate)
    g.fillStyle(C.plateLight, 1)
    g.fillPoints(blob(118, 116, 88, 78, 0.08, 42, 14), true, true)
    g.lineStyle(4, C.plateDark, 1)
    g.lineBetween(28, 150, 228, 106)
    ;[60, 100, 140, 180].forEach((x, k) => {
        const y = 150 - ((x - 28) / 200) * 44
        g.lineBetween(x, y, x + 22, y - 34 + (k % 2) * 4)
        g.lineBetween(x, y, x + 20, y + 30)
    })
}

function bush(g: G) {
    const balls: [number, number, number][] = [
        [80, 170, 56],
        [176, 170, 56],
        [128, 140, 66],
        [100, 112, 46],
        [160, 110, 46],
    ]
    g.lineStyle(LW * 2, INK, 1)
    balls.forEach(([x, y, r]) => g.strokeCircle(x, y, r))
    balls.forEach(([x, y, r], k) => {
        g.fillStyle(k % 2 ? C.bush : C.bushDark, 1)
        g.fillCircle(x, y, r)
    })
    balls.forEach(([x, y, r]) => {
        g.fillStyle(C.bushLight, 1)
        g.fillEllipse(x - r * 0.25, y - r * 0.35, r * 0.8, r * 0.45)
    })
}

function tuft(g: G, x: number, y: number, k: number) {
    const blades: P[][] = [
        [{ x: x - 30 * k, y }, { x: x - 22 * k, y: y - 52 * k }, { x: x - 10 * k, y }],
        [{ x: x - 12 * k, y }, { x: x, y: y - 70 * k }, { x: x + 12 * k, y }],
        [{ x: x + 10 * k, y }, { x: x + 26 * k, y: y - 48 * k }, { x: x + 30 * k, y }],
    ]
    blades.forEach(b => shape(g, b, C.grassDark, 3))
    ;[
        [x - 46 * k, y - 10 * k],
        [x + 44 * k, y - 6 * k],
    ].forEach(([cx, cy]) => {
        ;[0, 2.1, 4.2].forEach(a => oval(g, cx + Math.cos(a) * 9 * k, cy + Math.sin(a) * 9 * k, 16 * k, 16 * k, C.leaf, 2))
    })
}

function puff(g: G) {
    stroke(g, [{ x: 128, y: 246 }, { x: 124, y: 196 }, { x: 128, y: 150 }], 10, INK)
    stroke(g, [{ x: 128, y: 246 }, { x: 124, y: 196 }, { x: 128, y: 150 }], 5, C.grassLine)
    g.fillStyle(C.white, 0.95)
    g.fillCircle(128, 112, 52)
    g.lineStyle(3, C.stoneDark, 0.8)
    g.strokeCircle(128, 112, 52)
    g.lineStyle(2, C.stoneLight, 1)
    for (let k = 0; k < 18; k++) {
        const a = (k / 18) * Math.PI * 2
        g.lineBetween(128, 112, 128 + Math.cos(a) * 46, 112 + Math.sin(a) * 46)
    }
    g.fillStyle(C.stoneDark, 1)
    g.fillCircle(128, 112, 6)
}

// ───────────────────────────────────────────── o jardim

function background(g: G) {
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 0, W, H)
    const r = rng(101)
    for (let k = 0; k < 26; k++) {
        g.fillStyle(r() > 0.5 ? C.grassLight : C.grassDark, 0.35)
        g.fillEllipse(r() * W, 100 + r() * (H - 100), 120 + r() * 160, 50 + r() * 60)
    }
    // a trilha: entra à esquerda, passa pela fresta e chega ao formigueiro
    const curve = new Phaser.Curves.Spline([0, 324, 300, 362, 640, 432, 980, 500, 1280, 540])
    const path = curve.getPoints(80)
    path.forEach(p => {
        g.fillStyle(C.dirtDark, 1)
        g.fillCircle(p.x, p.y, 50)
    })
    path.forEach(p => {
        g.fillStyle(C.dirt, 1)
        g.fillCircle(p.x, p.y, 43)
    })
    path.forEach((p, k) => {
        if (k % 3) return
        g.fillStyle(C.dirtLight, 1)
        g.fillEllipse(p.x + (r() - 0.5) * 30, p.y + (r() - 0.5) * 24, 22, 10)
    })
    // folhinhas de grama
    g.lineStyle(3, C.grassLine, 0.5)
    for (let k = 0; k < 260; k++) {
        const x = r() * W
        const y = 100 + r() * (H - 100)
        const near = path.some(p => Math.abs(p.x - x) < 60 && Math.abs(p.y - y) < 60)
        if (near) continue
        g.lineBetween(x, y, x + (r() - 0.5) * 6, y - 8 - r() * 6)
    }
    // pedrinhas e cogumelos nas bordas
    for (let k = 0; k < 18; k++) {
        const edge = k % 4
        const x = edge === 0 ? 14 + r() * 40 : edge === 1 ? W - 14 - r() * 40 : 60 + r() * (W - 120)
        const y = edge === 2 ? H - 14 - r() * 20 : edge === 3 ? 108 + r() * 18 : 120 + r() * (H - 160)
        if (r() > 0.6) {
            oval(g, x, y + 6, 16, 12, 0xf4ead8, 2)
            oval(g, x, y, 26, 16, 0xc4683a, 2)
            g.fillStyle(C.white, 1)
            g.fillCircle(x - 5, y - 2, 2.5)
            g.fillCircle(x + 5, y - 3, 2)
        } else oval(g, x, y, 14 + r() * 10, 9 + r() * 6, C.stoneLight, 2)
    }
}

// ───────────────────────────────────────────── as folhas do N2 (vistas de cima, cabinho à esquerda)

const LEAF_ORDER: LeafKind[] = ['folha', 'folhaGrande']

function veins(g: G, cx: number, cy: number, a: number, b: number, color: number, width: number, wave = 0) {
    // a nervura central, de ponta a ponta, e as nervurinhas que saem dela em diagonal
    g.lineStyle(width, color, 1)
    g.lineBetween(cx - a * 0.94, cy, cx + a * 0.9, cy)
    for (let k = -3; k <= 3; k++) {
        const x = cx + k * a * 0.24
        const span = b * Math.sqrt(Math.max(0, 1 - ((x - cx) / a) ** 2)) * 0.72
        ;[-1, 1].forEach(side => {
            const tip = { x: x + a * 0.2, y: cy + side * span }
            g.lineStyle(width * 0.55, color, 1)
            g.lineBetween(x, cy, tip.x, tip.y + Math.sin(k + side) * wave)
        })
    }
}

function leafCell(g: G, i: number) {
    const kind = LEAF_ORDER[i]
    if (!kind) return
    const def = ITEMS[kind]
    const cx = LEAF_SHEET.cellW / 2
    const cy = LEAF_SHEET.cellH / 2
    const pts = itemPoly(def).map(p => ({ x: cx + p.x, y: cy + p.y }))
    g.fillStyle(def.skin, 1)
    g.fillPoints(pts, true, true)
    g.fillStyle(def.pulpDark, 0.4)
    g.fillPoints(pts.map(p => ({ x: cx + (p.x - cx) * 0.9 + 16, y: cy + (p.y - cy) * 0.88 + 18 })), true, true)
    g.fillStyle(def.skin, 1)
    g.fillPoints(pts.map(p => ({ x: cx + (p.x - cx) * 0.86 - 8, y: cy + (p.y - cy) * 0.84 - 8 })), true, true)
    veins(g, cx, cy, def.a, def.b, def.pulp, 10)
    // o cabinho, dentro da silhueta, na base
    stroke(g, [{ x: cx - def.a + 18, y: cy + 4 }, { x: cx - def.a + 92, y: cy }], 18, INK)
    stroke(g, [{ x: cx - def.a + 18, y: cy + 4 }, { x: cx - def.a + 92, y: cy }], 10, 0x8a6a2b)
    g.fillStyle(C.white, 0.7)
    g.fillEllipse(cx - def.a * 0.4, cy - def.b * 0.5, def.a * 0.3, def.b * 0.12)
    g.lineStyle(14, INK, 1)
    g.strokePoints(pts, true, true)
}

function giantLeaf(g: G) {
    const cx = GIANT.imageW / 2
    const cy = GIANT.imageH / 2
    const a = GIANT.leafW / 2
    const b = GIANT.leafH / 2
    const pts: P[] = []
    for (let k = 0; k < 120; k++) {
        const t = (k / 120) * Math.PI * 2
        const wave = 1 - 0.025 * (1 + Math.sin(t * 14))
        // a ponta à direita um pouco mais fina, a base à esquerda mais cheia
        const fat = 0.96 + 0.06 * Math.cos(t)
        pts.push({ x: cx - a * Math.cos(t) * wave, y: cy + b * Math.sin(t) * wave * fat })
    }
    shape(g, pts, C.giant, 6)
    g.fillStyle(C.giantDark, 0.35)
    g.fillPoints(pts.map(p => ({ x: cx + (p.x - cx) * 0.9 + 18, y: cy + (p.y - cy) * 0.86 + 20 })), true, true)
    g.fillStyle(C.giant, 1)
    g.fillPoints(pts.map(p => ({ x: cx + (p.x - cx) * 0.86 - 8, y: cy + (p.y - cy) * 0.82 - 8 })), true, true)
    g.fillStyle(C.giantLight, 0.6)
    g.fillEllipse(cx - a * 0.35, cy - b * 0.45, a * 0.7, b * 0.3)
    veins(g, cx, cy, a, b, C.vein, 14, 10)
    stroke(g, [{ x: cx - a + 10, y: cy + 4 }, { x: cx - a + 110, y: cy }], 24, INK)
    stroke(g, [{ x: cx - a + 10, y: cy + 4 }, { x: cx - a + 110, y: cy }], 14, 0x8a6a2b)
    ;[
        [cx - a * 0.55, cy - b * 0.55],
        [cx + a * 0.4, cy - b * 0.4],
        [cx + a * 0.1, cy + b * 0.55],
    ].forEach(([x, y]) => {
        g.fillStyle(C.white, 0.9)
        g.fillRect(x - 3, y - 14, 6, 28)
        g.fillRect(x - 14, y - 3, 28, 6)
    })
}

// ───────────────────────────────────────────── a sujeira (vista de cima)

function dirtCell(g: G, i: number) {
    const c = 64
    if (i === 0) {
        oval(g, c, c + 4, 80, 76, C.dew, 3)
        g.fillStyle(C.dewDark, 0.45)
        g.fillEllipse(c + 8, c + 14, 54, 40)
        g.fillStyle(C.dew, 1)
        g.fillEllipse(c - 2, c + 2, 60, 54)
        g.fillStyle(C.white, 0.95)
        g.fillEllipse(c - 16, c - 14, 22, 14)
        g.fillCircle(c + 16, c + 18, 4)
    } else if (i === 1) {
        shape(g, blob(c, c + 4, 40, 34, 0.35, 61, 12), C.soil, 3)
        g.fillStyle(C.soilDark, 1)
        g.fillPoints(blob(c + 8, c + 12, 22, 16, 0.4, 62, 10), true, true)
        ;[
            [c - 26, c - 22, 7],
            [c + 30, c - 24, 6],
            [c + 34, c + 30, 5],
        ].forEach(([x, y, r]) => oval(g, x, y, r * 2, r * 1.6, C.soil, 2))
        g.fillStyle(C.white, 0.35)
        g.fillEllipse(c - 12, c - 8, 18, 9)
    } else if (i === 2) {
        const main = [{ x: 18, y: 104 }, { x: 64, y: 62 }, { x: 110, y: 22 }]
        stroke(g, main, 14, INK)
        stroke(g, [{ x: 58, y: 68 }, { x: 40, y: 34 }], 11, INK)
        stroke(g, [{ x: 84, y: 46 }, { x: 108, y: 58 }], 11, INK)
        stroke(g, main, 8, C.twig)
        stroke(g, [{ x: 58, y: 68 }, { x: 40, y: 34 }], 6, C.twig)
        stroke(g, [{ x: 84, y: 46 }, { x: 108, y: 58 }], 6, C.twig)
        g.lineStyle(2, C.twigDark, 1)
        g.lineBetween(30, 96, 54, 74)
    } else {
        const petal = smooth(
            [
                { x: c - 40, y: c + 10 },
                { x: c - 20, y: c - 34 },
                { x: c + 22, y: c - 38 },
                { x: c + 42, y: c - 6 },
                { x: c + 18, y: c + 36 },
                { x: c - 16, y: c + 34 },
            ],
            2,
        )
        shape(g, petal, C.petal, 3)
        g.lineStyle(3, C.petalDark, 1)
        g.lineBetween(c - 30, c + 8, c + 30, c - 10)
        g.lineBetween(c - 14, c - 20, c + 6, c + 24)
        g.fillStyle(C.white, 0.35)
        g.fillEllipse(c - 6, c - 22, 22, 9)
    }
}
