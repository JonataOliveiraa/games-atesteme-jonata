import Phaser from 'phaser'
import { C } from '../data/theme'
import type { Move } from '../types'

export const ICON_SHEET = 'icones-serie'
export const ICON_COLUMNS = 3

export type IconName = 'jump' | 'spin' | 'repeat' | 'ready'

/** O selo de pronto saiu da folha: ele é desenhado aqui, sempre. */
const SHEET_FRAME: Partial<Record<IconName, number>> = { jump: 0, spin: 1, repeat: 2 }

export const moveIcon = (move: Move): IconName => move

function arrowHead(
    g: Phaser.GameObjects.Graphics,
    angleDeg: number,
    radius: number,
    size: number,
) {
    const a = Phaser.Math.DegToRad(angleDeg)
    const px = Math.cos(a) * radius
    const py = Math.sin(a) * radius
    const tx = -Math.sin(a)
    const ty = Math.cos(a)
    const nx = Math.cos(a)
    const ny = Math.sin(a)
    g.fillTriangle(
        px + tx * size, py + ty * size,
        px - nx * size - tx * size * 0.35, py - ny * size - ty * size * 0.35,
        px + nx * size - tx * size * 0.35, py + ny * size - ty * size * 0.35,
    )
}

function drawJump(g: Phaser.GameObjects.Graphics, size: number) {
    const u = size / 100
    g.fillStyle(C.ink, 1)
    g.fillTriangle(0, -46 * u, -31 * u, -8 * u, 31 * u, -8 * u)
    g.fillRoundedRect(-11 * u, -10 * u, 22 * u, 40 * u, 8 * u)
    g.lineStyle(10 * u, C.blue, 1)
    g.beginPath()
    g.arc(0, 24 * u, 36 * u, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false)
    g.strokePath()
}

function drawRing(g: Phaser.GameObjects.Graphics, size: number, color: number) {
    const u = size / 100
    g.lineStyle(13 * u, color, 1)
    g.beginPath()
    g.arc(0, 0, 33 * u, Phaser.Math.DegToRad(50), Phaser.Math.DegToRad(340), false)
    g.strokePath()
    g.fillStyle(color, 1)
    arrowHead(g, 50, 33 * u, 15 * u)
}

function drawSpin(g: Phaser.GameObjects.Graphics, size: number) {
    const u = size / 100
    drawRing(g, size, C.ink)
    g.fillStyle(C.amber, 1)
    g.fillCircle(0, 0, 11 * u)
}

function drawRepeat(g: Phaser.GameObjects.Graphics, size: number) {
    const u = size / 100
    drawRing(g, size, C.teal)
    g.fillStyle(C.amber, 1)
    for (let i = -1; i <= 1; i++) g.fillCircle(i * 15 * u, 0, 6 * u)
}

/**
 * A medalha de etapa cumprida.
 *
 * Era um círculo verde com um tique dentro, que na tela do cartão lia como
 * "botão". Virou roseta: as pontas do recorte e a fita dizem prêmio, e prêmio
 * é o que a etapa fechada significa.
 */
function drawReady(g: Phaser.GameObjects.Graphics, size: number) {
    const u = size / 100
    const petals = 12
    const outer = 44 * u
    const inner = 37 * u

    g.fillStyle(C.goldDark, 1)
    for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2
        g.fillCircle(Math.cos(a) * inner, Math.sin(a) * inner, 9 * u)
    }
    g.fillCircle(0, 0, outer)

    g.fillStyle(C.gold, 1)
    g.fillCircle(0, -2 * u, outer - 7 * u)
    g.fillStyle(C.white, 0.34)
    g.fillEllipse(-9 * u, -20 * u, 46 * u, 20 * u)

    g.fillStyle(C.okDark, 1)
    g.fillCircle(0, -2 * u, 27 * u)
    g.fillStyle(C.ok, 1)
    g.fillCircle(0, -4 * u, 24 * u)

    g.lineStyle(10 * u, C.white, 1)
    g.beginPath()
    g.moveTo(-12 * u, -4 * u)
    g.lineTo(-3 * u, 6 * u)
    g.lineTo(14 * u, -15 * u)
    g.strokePath()
    g.fillStyle(C.white, 1)
    g.fillCircle(-12 * u, -4 * u, 5 * u)
    g.fillCircle(14 * u, -15 * u, 5 * u)
}

const PAINTER: Record<IconName, (g: Phaser.GameObjects.Graphics, size: number) => void> = {
    jump: drawJump,
    spin: drawSpin,
    repeat: drawRepeat,
    ready: drawReady,
}

export type Icon = Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics

export function createIcon(scene: Phaser.Scene, name: IconName, size: number): Icon {
    const frame = SHEET_FRAME[name]
    if (
        frame !== undefined &&
        scene.textures.exists(ICON_SHEET) &&
        scene.textures.get(ICON_SHEET).has(String(frame))
    ) {
        return scene.add.sprite(0, 0, ICON_SHEET, frame).setDisplaySize(size, size)
    }
    const g = scene.add.graphics()
    PAINTER[name](g, size)
    return g
}
