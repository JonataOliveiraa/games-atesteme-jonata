import Phaser from 'phaser'
import { C } from '../data/theme'
import type { IconId } from '../types'

const rad = Phaser.Math.DegToRad

const COFFEE = 0x6b4226
const BREAD = 0xe0a75c
const CRUST = 0xb4762f
const FILL = 0x7ec24f
const HAM = 0xf08c8c
const STEAM = 0xbcd7e0

function steam(g: Phaser.GameObjects.Graphics, x: number, y: number, s: number) {
    g.lineStyle(Math.max(3, s * 0.05), STEAM, 0.95)
    for (let k = -1; k <= 1; k++) {
        const pts: Phaser.Math.Vector2[] = []
        for (let i = 0; i <= 12; i++) {
            const t = i / 12
            pts.push(new Phaser.Math.Vector2(
                x + k * s * 0.16 + Math.sin(t * Math.PI * 2) * s * 0.05,
                y - t * s * 0.28,
            ))
        }
        g.strokePoints(pts, false, false)
    }
}

function mug(g: Phaser.GameObjects.Graphics, cx: number, cy: number, s: number, full: boolean) {
    const w = s * 0.46
    const h = s * 0.4
    g.lineStyle(Math.max(4, s * 0.055), C.glyph, 1)
    g.strokeCircle(cx + w * 0.62, cy, h * 0.34)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, s * 0.07)
    if (full) {
        g.fillStyle(COFFEE, 1)
        g.fillRoundedRect(cx - w / 2 + s * 0.05, cy - h / 2 + s * 0.05, w - s * 0.1, h * 0.42, s * 0.04)
    }
    g.lineStyle(Math.max(4, s * 0.055), C.glyph, 1)
    g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, s * 0.07)
}

function drawMesa(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(-s * 0.46, -s * 0.02, s * 0.92, s * 0.16, s * 0.05)
    g.fillStyle(C.woodDark, 1)
    g.fillRect(-s * 0.34, s * 0.14, s * 0.08, s * 0.24)
    g.fillRect(s * 0.26, s * 0.14, s * 0.08, s * 0.24)
    mug(g, -s * 0.2, -s * 0.16, s * 0.62, true)
    steam(g, -s * 0.22, -s * 0.32, s * 0.62)
    sandwichShape(g, s * 0.22, -s * 0.14, s * 0.56)
}

function sandwichShape(g: Phaser.GameObjects.Graphics, cx: number, cy: number, s: number) {
    const w = s * 0.62
    const h = s * 0.44
    g.fillStyle(BREAD, 1)
    g.fillTriangle(cx - w / 2, cy + h / 2, cx + w / 2, cy + h / 2, cx, cy - h / 2)
    g.fillStyle(FILL, 1)
    g.fillTriangle(cx - w * 0.3, cy + h * 0.16, cx + w * 0.3, cy + h * 0.16, cx, cy - h * 0.1)
    g.lineStyle(Math.max(3, s * 0.05), CRUST, 1)
    g.strokeTriangle(cx - w / 2, cy + h / 2, cx + w / 2, cy + h / 2, cx, cy - h / 2)
}

function drawCafe(g: Phaser.GameObjects.Graphics, s: number) {
    mug(g, -s * 0.05, s * 0.04, s * 1.05, true)
    steam(g, -s * 0.08, -s * 0.24, s)
}

function drawSanduiche(g: Phaser.GameObjects.Graphics, s: number) {
    sandwichShape(g, 0, s * 0.02, s * 1.15)
}

function drawVassoura(g: Phaser.GameObjects.Graphics, s: number) {
    g.lineStyle(Math.max(5, s * 0.08), C.wood, 1)
    g.lineBetween(-s * 0.18, -s * 0.42, s * 0.1, s * 0.06)
    g.fillStyle(BREAD, 1)
    g.fillPoints([
        new Phaser.Math.Vector2(s * 0.02, s * 0.0),
        new Phaser.Math.Vector2(s * 0.28, s * 0.16),
        new Phaser.Math.Vector2(s * 0.14, s * 0.44),
        new Phaser.Math.Vector2(-s * 0.14, s * 0.28),
    ], true)
    g.lineStyle(Math.max(3, s * 0.045), CRUST, 1)
    g.lineBetween(-s * 0.02, s * 0.16, s * 0.16, s * 0.3)
}

function drawCama(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(-s * 0.46, -s * 0.04, s * 0.92, s * 0.3, s * 0.06)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-s * 0.4, -s * 0.14, s * 0.34, s * 0.16, s * 0.05)
    g.fillStyle(0x8fc7e8, 1)
    g.fillRoundedRect(-s * 0.06, -s * 0.08, s * 0.5, s * 0.2, s * 0.05)
    g.lineStyle(Math.max(4, s * 0.05), C.woodDark, 1)
    g.strokeRoundedRect(-s * 0.46, -s * 0.04, s * 0.92, s * 0.3, s * 0.06)
    g.fillStyle(C.woodDark, 1)
    g.fillRect(-s * 0.46, s * 0.26, s * 0.08, s * 0.18)
    g.fillRect(s * 0.38, s * 0.26, s * 0.08, s * 0.18)
}

function drawAgua(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(0x9aa7b4, 1)
    g.fillRoundedRect(-s * 0.3, -s * 0.06, s * 0.6, s * 0.42, s * 0.09)
    g.fillStyle(0x6f7d8c, 1)
    g.fillRoundedRect(-s * 0.3, -s * 0.06, s * 0.6, s * 0.09, s * 0.04)
    g.lineStyle(Math.max(4, s * 0.055), 0x6f7d8c, 1)
    g.beginPath()
    g.arc(s * 0.3, s * 0.14, s * 0.12, rad(-70), rad(70), false)
    g.strokePath()
    g.fillStyle(0x6f7d8c, 1)
    g.fillRect(-s * 0.06, -s * 0.16, s * 0.12, s * 0.1)
    steam(g, 0, -s * 0.22, s)
    g.fillStyle(C.warn, 1)
    g.fillTriangle(-s * 0.16, s * 0.46, s * 0.16, s * 0.46, 0, s * 0.3)
    g.fillStyle(C.warnDark, 1)
    g.fillTriangle(-s * 0.08, s * 0.46, s * 0.08, s * 0.46, 0, s * 0.38)
}

function drawFiltro(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.white, 1)
    g.fillPoints([
        new Phaser.Math.Vector2(-s * 0.34, -s * 0.24),
        new Phaser.Math.Vector2(s * 0.34, -s * 0.24),
        new Phaser.Math.Vector2(s * 0.14, s * 0.34),
        new Phaser.Math.Vector2(-s * 0.14, s * 0.34),
    ], true)
    g.fillStyle(COFFEE, 1)
    g.fillPoints([
        new Phaser.Math.Vector2(-s * 0.28, -s * 0.16),
        new Phaser.Math.Vector2(s * 0.28, -s * 0.16),
        new Phaser.Math.Vector2(s * 0.2, s * 0.02),
        new Phaser.Math.Vector2(-s * 0.2, s * 0.02),
    ], true)
    g.lineStyle(Math.max(4, s * 0.05), C.glyph, 1)
    g.strokePoints([
        new Phaser.Math.Vector2(-s * 0.34, -s * 0.24),
        new Phaser.Math.Vector2(s * 0.34, -s * 0.24),
        new Phaser.Math.Vector2(s * 0.14, s * 0.34),
        new Phaser.Math.Vector2(-s * 0.14, s * 0.34),
    ], true, true)
}

function drawCoar(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.white, 1)
    g.fillPoints([
        new Phaser.Math.Vector2(-s * 0.3, -s * 0.44),
        new Phaser.Math.Vector2(s * 0.3, -s * 0.44),
        new Phaser.Math.Vector2(s * 0.12, -s * 0.08),
        new Phaser.Math.Vector2(-s * 0.12, -s * 0.08),
    ], true)
    g.lineStyle(Math.max(3, s * 0.045), C.glyph, 1)
    g.strokePoints([
        new Phaser.Math.Vector2(-s * 0.3, -s * 0.44),
        new Phaser.Math.Vector2(s * 0.3, -s * 0.44),
        new Phaser.Math.Vector2(s * 0.12, -s * 0.08),
        new Phaser.Math.Vector2(-s * 0.12, -s * 0.08),
    ], true, true)
    g.lineStyle(Math.max(4, s * 0.05), COFFEE, 1)
    g.lineBetween(0, -s * 0.06, 0, s * 0.1)
    mug(g, -s * 0.05, s * 0.26, s * 0.9, true)
}

function drawPao(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(BREAD, 1)
    g.fillRoundedRect(-s * 0.44, -s * 0.1, s * 0.38, s * 0.24, s * 0.08)
    g.fillRoundedRect(s * 0.06, -s * 0.1, s * 0.38, s * 0.24, s * 0.08)
    g.lineStyle(Math.max(4, s * 0.05), CRUST, 1)
    g.strokeRoundedRect(-s * 0.44, -s * 0.1, s * 0.38, s * 0.24, s * 0.08)
    g.strokeRoundedRect(s * 0.06, -s * 0.1, s * 0.38, s * 0.24, s * 0.08)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(-s * 0.5, s * 0.2, s * 1.0, s * 0.1, s * 0.05)
}

function drawRecheio(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(BREAD, 1)
    g.fillRoundedRect(-s * 0.4, s * 0.04, s * 0.8, s * 0.2, s * 0.07)
    g.fillStyle(FILL, 1)
    g.fillRoundedRect(-s * 0.36, -s * 0.06, s * 0.72, s * 0.12, s * 0.05)
    g.fillStyle(HAM, 1)
    g.fillRoundedRect(-s * 0.34, -s * 0.16, s * 0.68, s * 0.12, s * 0.05)
    g.lineStyle(Math.max(4, s * 0.05), CRUST, 1)
    g.strokeRoundedRect(-s * 0.4, s * 0.04, s * 0.8, s * 0.2, s * 0.07)
    g.fillStyle(BREAD, 1)
    g.fillRoundedRect(-s * 0.4, -s * 0.42, s * 0.8, s * 0.2, s * 0.07)
    g.lineStyle(Math.max(4, s * 0.05), CRUST, 1)
    g.strokeRoundedRect(-s * 0.4, -s * 0.42, s * 0.8, s * 0.2, s * 0.07)
}

function drawCortar(g: Phaser.GameObjects.Graphics, s: number) {
    sandwichShape(g, -s * 0.2, s * 0.06, s * 0.86)
    sandwichShape(g, s * 0.22, s * 0.06, s * 0.86)
    g.lineStyle(Math.max(4, s * 0.05), C.glyphSoft, 1)
    g.lineBetween(0, -s * 0.34, 0, s * 0.34)
}

function drawVazio(g: Phaser.GameObjects.Graphics, s: number) {
    const o = s * 0.42
    const len = s * 0.16
    g.lineStyle(Math.max(5, s * 0.06), C.cream, 0.55)
    ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
        g.lineBetween(sx * o, sy * o, sx * o - sx * len, sy * o)
        g.lineBetween(sx * o, sy * o, sx * o, sy * o - sy * len)
    })
    g.lineStyle(Math.max(7, s * 0.1), C.cream, 0.6)
    g.beginPath()
    g.arc(0, -s * 0.1, s * 0.16, rad(160), rad(20), false)
    g.strokePath()
    g.lineBetween(s * 0.16, -s * 0.02, 0, s * 0.12)
    g.fillStyle(C.cream, 0.6)
    g.fillCircle(0, s * 0.26, s * 0.055)
}

const DRAW: Record<IconId, (g: Phaser.GameObjects.Graphics, s: number) => void> = {
    vazio: drawVazio,
    mesa: drawMesa,
    cafe: drawCafe,
    sanduiche: drawSanduiche,
    vassoura: drawVassoura,
    cama: drawCama,
    agua: drawAgua,
    filtro: drawFiltro,
    coar: drawCoar,
    pao: drawPao,
    recheio: drawRecheio,
    cortar: drawCortar,
}

/** Missão sem arte ainda: um cartão neutro, nunca um crash. */
function drawFalta(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.creamEdge, 0.5)
    g.fillRoundedRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.6, s * 0.1)
    g.lineStyle(Math.max(5, s * 0.06), C.glyphSoft, 1)
    g.strokeRoundedRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.6, s * 0.1)
    g.beginPath()
    g.arc(0, -s * 0.06, s * 0.11, rad(170), rad(20), false)
    g.strokePath()
    g.lineBetween(s * 0.11, s * 0.02, 0, s * 0.1)
    g.fillStyle(C.glyphSoft, 1)
    g.fillCircle(0, s * 0.2, s * 0.04)
}

export function drawIcon(g: Phaser.GameObjects.Graphics, icon: IconId, size: number) {
    const draw = DRAW[icon as keyof typeof DRAW]
    if (draw) draw(g, size)
    else drawFalta(g, size)
}

export function createIcon(scene: Phaser.Scene, icon: IconId, size: number) {
    const g = scene.add.graphics()
    drawIcon(g, icon, size)
    return g
}
