import Phaser from 'phaser'
import { BAKED, BG, BELT_SHEET, PRINT_SHEET, STAMP_SHEET, UI_SHEET, type Sheet } from '../data/files'
import { H, W } from '../data/layout'
import { C, FIG_COLOR } from '../data/theme'
import type { Fig } from '../types'

type G = Phaser.GameObjects.Graphics
type P = Phaser.Types.Math.Vector2Like
type Radius = number | { tl: number; tr: number; bl: number; br: number }
const INK = C.ink

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
    ;(scene.textures.get(sheet.key).customData as Record<string, unknown>)[BAKED] = true
}

function bakeOne(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

/** a arte de reserva: as mesmas chaves e grades do TEXTURAS.md, para o PNG entrar no lugar */
export function ensureArt(scene: Phaser.Scene) {
    bakeOne(scene, BG, W, H, workshop)
    bakeSheet(scene, BELT_SHEET, (g, i) => BELT_PAINT[i]?.(g))
    bakeSheet(scene, PRINT_SHEET, (g, i) => PRINT_PAINT[i]?.(g))
    bakeSheet(scene, STAMP_SHEET, (g, i) => STAMP_PAINT[i]?.(g))
    bakeSheet(scene, UI_SHEET, (g, i) => UI_PAINT[i]?.(g))
}

// ───────────────────────────────────────────── primitivas

function disc(g: G, x: number, y: number, r: number, fill: number, line = 5, stroke: number = INK) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, stroke, 1)
        g.strokeCircle(x, y, r)
    }
}

function box(g: G, x: number, y: number, w: number, h: number, r: Radius, fill: number, line = 5, stroke: number = INK) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, stroke, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function poly(g: G, pts: P[], fill: number, line = 5, stroke: number = INK) {
    g.fillStyle(fill, 1)
    g.fillPoints(pts, true)
    if (line > 0) {
        g.lineStyle(line, stroke, 1)
        g.strokePoints(pts, true)
    }
}

function sparkle(g: G, x: number, y: number, s: number) {
    g.fillStyle(0xffffff, 1)
    g.fillRect(x - s, y - s / 4, s * 2, s / 2)
    g.fillRect(x - s / 4, y - s, s / 2, s * 2)
}

function dashes(g: G, x1: number, y1: number, x2: number, y2: number, dash: number, gap: number, width: number, color: number, alpha = 1) {
    const len = Math.hypot(x2 - x1, y2 - y1)
    const ux = (x2 - x1) / len
    const uy = (y2 - y1) / len
    g.lineStyle(width, color, alpha)
    for (let d = 0; d < len; d += dash + gap) {
        const e = Math.min(len, d + dash)
        g.lineBetween(x1 + ux * d, y1 + uy * d, x1 + ux * e, y1 + uy * e)
    }
}

function dashedRing(g: G, x: number, y: number, r: number, count: number, width: number, color: number, alpha = 1) {
    g.lineStyle(width, color, alpha)
    const step = (Math.PI * 2) / count
    for (let k = 0; k < count; k++) {
        g.beginPath()
        g.arc(x, y, r, k * step, k * step + step * 0.55)
        g.strokePath()
    }
}

/** pesponto ao redor de um retângulo, só nos lados retos */
function stitchRect(g: G, x: number, y: number, w: number, h: number, cut: number, dash: number, gap: number, width: number, color: number) {
    dashes(g, x + cut, y, x + w - cut, y, dash, gap, width, color)
    dashes(g, x + cut, y + h, x + w - cut, y + h, dash, gap, width, color)
    dashes(g, x, y + cut, x, y + h - cut, dash, gap, width, color)
    dashes(g, x + w, y + cut, x + w, y + h - cut, dash, gap, width, color)
}

function starPoints(x: number, y: number, r: number, inner = 0.5): P[] {
    const pts: P[] = []
    for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5
        const rr = k % 2 ? r * inner : r
        pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr })
    }
    return pts
}

function heartPoints(x: number, y: number, r: number): P[] {
    const pts: P[] = []
    const s = r / 16.5
    for (let k = 0; k < 48; k++) {
        const t = (k / 48) * Math.PI * 2
        const hx = 16 * Math.sin(t) ** 3
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
        pts.push({ x: x + hx * s, y: y + (hy - 2.5) * s })
    }
    return pts
}

const grow = (pts: P[], x: number, y: number, k: number): P[] => pts.map(p => ({ x: x + ((p.x ?? 0) - x) * k, y: y + ((p.y ?? 0) - y) * k }))

/** a figura em tinta de carimbo: contorno num tom mais escuro da própria tinta */
export function figure(g: G, fig: Fig, x: number, y: number, r: number, line = 7) {
    const { fill, dark } = FIG_COLOR[fig]
    if (fig === 'flower') {
        const petals = [0, 1, 2, 3, 4].map(k => {
            const a = -Math.PI / 2 + (k * Math.PI * 2) / 5
            return { x: x + Math.cos(a) * r * 0.54, y: y + Math.sin(a) * r * 0.54 }
        })
        const pr = r * 0.46
        g.fillStyle(dark, 1)
        petals.forEach(p => g.fillCircle(p.x, p.y, pr + line))
        g.fillStyle(fill, 1)
        petals.forEach(p => g.fillCircle(p.x, p.y, pr))
        disc(g, x, y, r * 0.28, C.flowerCore, line, dark)
    } else if (fig === 'star') {
        const pts = starPoints(x, y + r * 0.06, r * 1.05, 0.52)
        poly(g, grow(pts, x, y + r * 0.06, 1 + line / (r * 0.9)), dark, 0)
        poly(g, pts, fill, 0)
    } else {
        const pts = heartPoints(x, y, r)
        poly(g, grow(pts, x, y, 1 + line / r), dark, 0)
        poly(g, pts, fill, 0)
    }
}

function speckles(g: G, x: number, y: number, r: number) {
    g.fillStyle(0xffffff, 0.28)
    ;[
        [-0.3, -0.18, 0.05],
        [0.22, -0.32, 0.04],
        [0.3, 0.2, 0.05],
        [-0.12, 0.34, 0.035],
        [-0.42, 0.12, 0.03],
    ].forEach(([dx, dy, s]) => g.fillCircle(x + dx * r, y + dy * r, s * r))
}

// ───────────────────────────────────────────── o fundo

function workshop(g: G) {
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(C.wallStripe, 1)
    for (let x = 20; x < W; x += 64) g.fillRect(x, 0, 24, 300)

    // janela com sol, à esquerda
    box(g, 34, 96, 204, 196, 22, C.woodLight, 4)
    box(g, 50, 112, 172, 164, 12, C.sky, 3)
    g.fillStyle(C.skyLight, 1)
    g.fillRoundedRect(58, 120, 156, 70, 10)
    disc(g, 180, 150, 22, C.lamp, 3)
    g.lineStyle(8, C.woodLight, 1)
    g.lineBetween(136, 112, 136, 276)
    g.lineBetween(50, 194, 222, 194)
    g.lineStyle(3, INK, 1)
    g.strokeRoundedRect(50, 112, 172, 164, 12)
    box(g, 22, 284, 228, 18, 8, C.wood, 4)
    box(g, 62, 238, 44, 46, { tl: 4, tr: 4, bl: 12, br: 12 }, C.pot, 4)
    ;[
        [70, 214, 18],
        [92, 204, 20],
        [84, 226, 16],
    ].forEach(([x, y, r]) => disc(g, x, y, r, C.leaf, 3))
    g.fillStyle(C.leafDark, 1)
    g.fillCircle(90, 210, 6)

    // prateleiras à direita, com rolos de tecido liso, listrado e de bolinha
    const shelf = (y: number) => {
        box(g, 1002, y, 266, 16, 6, C.wood, 4)
        g.fillStyle(C.woodDark, 1)
        g.fillRect(1020, y + 16, 12, 18)
        g.fillRect(1238, y + 16, 12, 18)
    }
    const bolt = (x: number, y: number, w: number, h: number, base: number, kind: 'plain' | 'stripes' | 'dots') => {
        box(g, x, y, w, h, 10, base, 4)
        if (kind === 'stripes') {
            g.fillStyle(0xffffff, 0.55)
            for (let sx = x + 10; sx < x + w - 6; sx += 18) g.fillRect(sx, y + 4, 7, h - 8)
        } else if (kind === 'dots') {
            g.fillStyle(0xffffff, 0.7)
            for (let dy = y + 12; dy < y + h - 6; dy += 16) for (let dx = x + 12; dx < x + w - 6; dx += 18) g.fillCircle(dx, dy, 3.5)
        }
        g.lineStyle(4, INK, 1)
        g.strokeRoundedRect(x, y, w, h, 10)
    }
    bolt(1016, 140, 92, 36, C.mint, 'stripes')
    bolt(1016, 104, 92, 36, C.peach, 'plain')
    bolt(1116, 140, 70, 36, C.lilac, 'dots')
    ;[1200, 1236].forEach((x, k) => {
        box(g, x - 15, 126, 30, 50, 8, k ? C.lilac : C.mint, 4)
        box(g, x - 11, 116, 22, 12, 4, C.wood, 3)
    })
    shelf(176)
    bolt(1016, 232, 120, 38, C.lilac, 'stripes')
    bolt(1146, 232, 52, 38, C.peach, 'dots')
    ;[1218, 1248].forEach((x, k) => {
        box(g, x - 13, 226, 26, 44, 6, C.cream, 4)
        g.fillStyle(k ? C.outer : C.flower, 1)
        g.fillRect(x - 13, 240, 26, 14)
        g.lineStyle(4, INK, 1)
        g.strokeRoundedRect(x - 13, 226, 26, 44, 6)
    })
    shelf(270)

    // o balcão da esteira e a bancada da frente
    g.fillStyle(C.woodDark, 1)
    g.fillRect(0, 300, W, 152)
    g.fillStyle(C.woodLight, 1)
    g.fillRect(0, 300, W, 22)
    g.lineStyle(4, INK, 1)
    g.lineBetween(0, 300, W, 300)
    g.lineBetween(0, 322, W, 322)
    g.lineStyle(3, C.woodLine, 0.6)
    for (let x = 90; x < W; x += 180) g.lineBetween(x, 322, x, 452)

    g.fillStyle(C.wood, 1)
    g.fillRect(0, 452, W, H - 452)
    g.fillStyle(C.shadow, 0.12)
    g.fillRect(0, 452, W, 16)
    g.lineStyle(4, INK, 1)
    g.lineBetween(0, 452, W, 452)
    g.lineStyle(3, C.woodLine, 0.45)
    ;[530, 610, 690].forEach(y => g.lineBetween(0, y, W, y))

    // cestinha com tecidos dobrados, embaixo à direita
    box(g, 1072, 594, 176, 104, { tl: 10, tr: 10, bl: 24, br: 24 }, C.basket, 4)
    g.lineStyle(3, C.basketDark, 0.8)
    for (let x = 1086; x < 1240; x += 16) g.lineBetween(x, 600, x + 8, 692)
    ;[
        [1086, 566, C.mint],
        [1092, 544, C.peach],
        [1098, 522, C.lilac],
    ].forEach(([x, y, c]) => box(g, x, y, 136, 28, 10, c, 4))
}

// ───────────────────────────────────────────── esteira.png

const BELT_PAINT: Array<(g: G) => void> = [
    // 0 pedaço de esteira, de borda a borda
    g => {
        g.fillStyle(C.belt, 1)
        g.fillRect(0, 118, 320, 84)
        g.fillStyle(C.beltRidge, 1)
        for (let x = 13; x < 320; x += 32) g.fillRect(x, 124, 6, 72)
        g.fillStyle(0xffffff, 0.16)
        g.fillRect(0, 122, 320, 8)
        g.fillStyle(C.rail, 1)
        g.fillRect(0, 96, 320, 22)
        g.fillRect(0, 202, 320, 22)
        g.lineStyle(5, INK, 1)
        g.lineBetween(0, 98, 320, 98)
        g.lineBetween(0, 222, 320, 222)
        g.lineStyle(3, INK, 0.5)
        g.lineBetween(0, 118, 320, 118)
        g.lineBetween(0, 202, 320, 202)
    },
    // 1 janela de estampa: moldura de madeira vazada em volta do quadradinho, com a lampadinha
    g => {
        box(g, 52, 286, 46, 24, 8, C.woodDark)
        box(g, 222, 286, 46, 24, 8, C.woodDark)
        g.lineStyle(28, C.wood, 1)
        g.strokeRoundedRect(50, 58, 220, 230, 22)
        g.lineStyle(5, INK, 1)
        g.strokeRoundedRect(36, 44, 248, 258, 30)
        g.strokeRoundedRect(64, 72, 192, 202, 12)
        g.lineStyle(6, 0xffffff, 0.45)
        g.lineBetween(56, 52, 150, 52)
        box(g, 146, 28, 28, 20, 6, C.metalDark, 4)
        g.fillStyle(C.lamp, 0.35)
        g.fillCircle(160, 22, 22)
        disc(g, 160, 20, 14, C.lamp, 4)
        sparkle(g, 155, 15, 4)
    },
    // 2 rolo de tecido liso, de ponta, no suporte
    g => {
        poly(g, [{ x: 92, y: 300 }, { x: 122, y: 170 }, { x: 140, y: 170 }, { x: 118, y: 300 }], C.woodDark)
        poly(g, [{ x: 228, y: 300 }, { x: 198, y: 170 }, { x: 180, y: 170 }, { x: 202, y: 300 }], C.woodDark)
        box(g, 60, 290, 200, 18, 8, C.wood)
        disc(g, 160, 150, 120, C.linen, 6)
        g.lineStyle(4, C.linenEdge, 1)
        ;[100, 82, 64, 46].forEach((r, k) => g.strokeCircle(160 + k * 2, 150 + k * 2, r))
        disc(g, 166, 156, 26, C.wood, 5)
        disc(g, 166, 156, 9, C.woodLine, 3)
        g.fillStyle(0xffffff, 0.5)
        g.beginPath()
        g.arc(160, 150, 104, Math.PI * 1.1, Math.PI * 1.45)
        g.lineStyle(8, 0xffffff, 0.55)
        g.strokePath()
    },
    // 3 rolo fechado, de ponta, com laço lilás
    g => {
        disc(g, 160, 186, 84, C.linen, 6)
        g.lineStyle(4, C.linenEdge, 1)
        ;[64, 46, 30].forEach((r, k) => g.strokeCircle(160 + k * 2, 186 + k * 2, r))
        disc(g, 164, 190, 12, C.wood, 4)
        poly(g, [{ x: 160, y: 106 }, { x: 104, y: 76 }, { x: 98, y: 120 }], C.inner)
        poly(g, [{ x: 160, y: 106 }, { x: 216, y: 76 }, { x: 222, y: 120 }], C.inner)
        poly(g, [{ x: 152, y: 110 }, { x: 136, y: 150 }, { x: 150, y: 146 }], C.inner, 4)
        poly(g, [{ x: 168, y: 110 }, { x: 184, y: 150 }, { x: 170, y: 146 }], C.inner, 4)
        disc(g, 160, 106, 14, C.innerDark, 4)
    },
    // 4 corda do varal, de borda a borda
    g => {
        g.fillStyle(C.rope, 1)
        g.fillRect(0, 150, 320, 20)
        g.lineStyle(4, C.ropeDark, 1)
        for (let x = 0; x < 320; x += 16) g.lineBetween(x, 152, x + 10, 168)
        g.lineStyle(4, INK, 1)
        g.lineBetween(0, 150, 320, 150)
        g.lineBetween(0, 170, 320, 170)
    },
    // 5 gancho do varal
    g => {
        box(g, 92, 132, 40, 56, 10, C.woodDark)
        g.lineStyle(14, C.wood, 1)
        g.strokeCircle(150, 160, 32)
        g.lineStyle(4, INK, 1)
        g.strokeCircle(150, 160, 39)
        g.strokeCircle(150, 160, 25)
        g.fillStyle(C.rope, 1)
        g.fillRect(176, 152, 110, 16)
        g.lineStyle(4, INK, 1)
        g.strokeRect(176, 152, 110, 16)
        disc(g, 186, 160, 14, C.rope, 4)
    },
]

// ───────────────────────────────────────────── estampas.png

const smudged = (fig: Fig) => (g: G) => {
    const { fill } = FIG_COLOR[fig]
    g.fillStyle(fill, 0.45)
    g.fillEllipse(150, 140, 190, 80)
    g.save()
    g.translateCanvas(118, 124)
    g.rotateCanvas(-0.32)
    figure(g, fig, 0, 0, 76)
    g.restore()
    g.fillStyle(fill, 0.85)
    ;[
        [214, 108, 11],
        [226, 176, 8],
        [58, 200, 9],
    ].forEach(([x, y, r]) => g.fillCircle(x, y, r))
}

const LINEN_EDGE = 7

function linen(g: G, x0: number, x1: number) {
    g.fillStyle(C.linen, 1)
    g.fillRect(x0, 0, x1 - x0, 256)
    g.lineStyle(2, C.linenDark, 0.8)
    for (let y = 16; y < 256; y += 16) g.lineBetween(x0, y, x1, y)
    for (let x = x0 + 8; x < x1; x += 16) g.lineBetween(x, 0, x, 256)
    g.fillStyle(C.linenEdge, 1)
    g.fillRect(x0, 0, x1 - x0, LINEN_EDGE)
    g.fillRect(x0, 256 - LINEN_EDGE, x1 - x0, LINEN_EDGE)
}

const PRINT_PAINT: Array<(g: G) => void> = [
    g => {
        figure(g, 'flower', 128, 128, 96)
        speckles(g, 128, 128, 96)
    },
    g => {
        figure(g, 'star', 128, 128, 98)
        speckles(g, 128, 132, 70)
    },
    g => {
        figure(g, 'heart', 128, 130, 98)
        speckles(g, 128, 120, 80)
    },
    // 3 quadradinho de tecido, de borda a borda
    g => {
        linen(g, 0, 256)
        stitchRect(g, 22, 24, 212, 208, 0, 14, 10, 5, C.stitch)
    },
    smudged('flower'),
    smudged('star'),
    smudged('heart'),
    // 7 barra do tecido, encostada na borda direita
    g => {
        g.lineStyle(4, C.linenEdge, 1)
        for (let y = 14; y < 250; y += 12) g.lineBetween(156, y, 186, y + 3)
        linen(g, 184, 256)
        g.lineStyle(4, C.linenEdge, 1)
        g.lineBetween(184, 0, 184, 256)
        g.lineBetween(204, 0, 204, 256)
        dashes(g, 226, 14, 226, 242, 14, 10, 5, C.stitch)
    },
    // 8 botão de costura
    g => {
        disc(g, 128, 128, 74, C.button, 7)
        g.lineStyle(4, C.creamDark, 1)
        g.strokeCircle(128, 128, 54)
        g.lineStyle(7, C.outer, 1)
        g.lineBetween(108, 108, 148, 148)
        g.lineBetween(148, 108, 108, 148)
        ;[
            [108, 108],
            [148, 108],
            [108, 148],
            [148, 148],
        ].forEach(([x, y]) => disc(g, x, y, 9, C.creamDark, 4))
        sparkle(g, 92, 88, 9)
    },
    // 9 casa do botão: círculo de pontinhos de linha branca
    g => {
        dashedRing(g, 128, 128, 66, 14, 12, 0xffffff, 1)
    },
    // 10 agulha com linha azul
    g => {
        g.lineStyle(10, C.outer, 1)
        g.beginPath()
        g.moveTo(186, 70)
        g.lineTo(206, 120)
        g.lineTo(184, 160)
        g.lineTo(214, 206)
        g.strokePath()
        poly(g, [{ x: 50, y: 214 }, { x: 186, y: 58 }, { x: 200, y: 72 }, { x: 58, y: 222 }], C.metal, 5)
        g.fillStyle(INK, 1)
        g.fillEllipse(186, 72, 8, 16)
        sparkle(g, 120, 130, 8)
    },
    // 11 prendedor de varal, com a boca para baixo
    g => {
        box(g, 104, 40, 24, 180, { tl: 10, tr: 4, bl: 10, br: 4 }, C.woodLight)
        box(g, 128, 40, 24, 180, { tl: 4, tr: 10, bl: 4, br: 10 }, C.wood)
        g.lineStyle(8, C.metalDark, 1)
        g.strokeCircle(128, 110, 14)
        g.lineStyle(3, INK, 1)
        g.strokeCircle(128, 110, 18)
    },
]

// ───────────────────────────────────────────── carimbos.png

const stamp = (fig: Fig) => (g: G) => {
    box(g, 60, 254, 200, 26, 10, 0x5b5466)
    g.fillStyle(FIG_COLOR[fig].fill, 1)
    g.fillRect(68, 274, 184, 6)
    box(g, 138, 98, 44, 46, 8, C.woodDark)
    box(g, 50, 134, 220, 126, 28, C.wood)
    g.fillStyle(0xffffff, 0.4)
    g.fillRoundedRect(64, 142, 90, 10, 5)
    box(g, 82, 152, 156, 94, 18, C.cream, 4)
    figure(g, fig, 160, 199, 38, 5)
    disc(g, 160, 66, 44, C.woodDark)
    g.fillStyle(0xffffff, 0.45)
    g.fillEllipse(146, 50, 26, 14)
    sparkle(g, 186, 52, 7)
}

const pad = (fig: Fig) => (g: G) => {
    g.fillStyle(C.metalDark, 1)
    g.fillEllipse(160, 214, 252, 96)
    g.fillRect(34, 166, 252, 48)
    g.lineStyle(5, INK, 1)
    g.strokeEllipse(160, 214, 252, 96)
    g.lineBetween(34, 166, 34, 214)
    g.lineBetween(286, 166, 286, 214)
    g.fillStyle(C.metal, 1)
    g.fillEllipse(160, 166, 252, 96)
    g.strokeEllipse(160, 166, 252, 96)
    g.fillStyle(FIG_COLOR[fig].fill, 1)
    g.fillEllipse(160, 164, 206, 70)
    g.lineStyle(4, FIG_COLOR[fig].dark, 1)
    g.strokeEllipse(160, 164, 206, 70)
    g.fillStyle(0xffffff, 0.35)
    g.fillEllipse(130, 154, 70, 16)
}

const STAMP_PAINT: Array<(g: G) => void> = [stamp('flower'), stamp('star'), stamp('heart'), pad('flower'), pad('star'), pad('heart')]

// ───────────────────────────────────────────── ui.png

const frame = (fill: number, dark: number) => (g: G) => {
    g.lineStyle(40, fill, 1)
    g.strokeRoundedRect(36, 36, 312, 312, 40)
    g.lineStyle(5, dark, 1)
    g.strokeRoundedRect(16, 16, 352, 352, 60)
    g.strokeRoundedRect(56, 56, 272, 272, 20)
    stitchRect(g, 36, 36, 312, 312, 52, 16, 11, 5, 0xffffff)
}

const tab = (fill: number, dark: number) => (g: G) => {
    box(g, 64, 32, 256, 320, 40, fill, 7, dark)
    box(g, 98, 66, 188, 252, 18, C.paper, 4, dark)
    stitchRect(g, 81, 49, 222, 286, 30, 16, 11, 5, 0xffffff)
}

const UI_PAINT: Array<(g: G) => void> = [
    // 0 papel do pedido, com dois alfinetes nos cantos de cima
    g => {
        box(g, 16, 104, 352, 176, 22, C.paper, 5, C.paperEdge)
        g.lineStyle(3, C.paperEdge, 0.6)
        g.strokeRoundedRect(28, 116, 328, 152, 14)
        disc(g, 46, 130, 13, C.lilac, 4)
        disc(g, 338, 130, 13, C.mint, 4)
        sparkle(g, 42, 126, 4)
        sparkle(g, 334, 126, 4)
    },
    frame(C.outer, C.outerDark),
    frame(C.inner, C.innerDark),
    tab(C.outer, C.outerDark),
    tab(C.inner, C.innerDark),
    // 5 etiqueta de resposta: retalho redondo e fofinho
    g => {
        disc(g, 192, 196, 168, C.tagFill, 7, C.tagStitch)
        dashedRing(g, 192, 196, 146, 30, 6, C.tagStitch)
        g.fillStyle(0xffffff, 0.6)
        g.fillEllipse(140, 100, 90, 34)
    },
]
