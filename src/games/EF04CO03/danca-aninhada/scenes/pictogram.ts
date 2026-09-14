import Phaser from 'phaser'
import { C } from '../data/theme'
import type { Move } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS TRÊS PICTOGRAMAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Aparecem em quatro tamanhos — pedido, ficha, bandeja e a legenda do ensaio
 * — e em duas cores. Por isso `moveIcon` devolve um objeto pronto e ninguém
 * mais sabe como o desenho é feito.
 *
 * ── SILHUETA TINGIDA, NÃO UM PNG POR COR ─────────────────────────────────
 *
 * Quando `icone-dos-movimentos.png` existir, cada quadro é uma silhueta CHAPADA
 * em preto sobre alfa real, e quem dá a cor é o `setTint`. Um PNG por cor
 * seriam seis arquivos que precisariam concordar entre si; um PNG preto e um
 * tint são um arquivo e uma linha.
 *
 * Enquanto a folha não chega, o desenho vetorial abaixo ocupa a mesma caixa.
 * A silhueta tem de resolver sozinha: a palavra embaixo é reforço e, num
 * celular a 0,30, ela fica pequena demais para carregar o significado.
 */

export const ICON_SHEET = 'dance-move-icons'

/** A ordem dos quadros na folha, fixada aqui e conferida no BootScene. */
export const ICON_FRAME: Record<Move, string> = {
    step: 'step',
    clap: 'clap',
    spin: 'spin',
}

export type MoveIcon = Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

/** Um pictograma centrado na origem, cabendo num quadrado de lado `size`. */
export function moveIcon(scene: Phaser.Scene, move: Move, size: number, face = C.ink, deep = C.inkSoft): MoveIcon {
    if (scene.textures.exists(ICON_SHEET)) {
        const image = scene.add.image(0, 0, ICON_SHEET, ICON_FRAME[move])
        image.setTint(face)
        image.setDisplaySize(size, size)
        return image
    }
    const g = scene.add.graphics()
    drawMove(g, move, size, face, deep)
    return g
}

export function drawMove(
    g: Phaser.GameObjects.Graphics,
    move: Move,
    s: number,
    face = C.ink,
    deep = C.inkSoft,
) {
    if (move === 'step') drawStep(g, s, face, deep)
    else if (move === 'clap') drawClap(g, s, face, deep)
    else drawSpin(g, s, face, deep)
}

/** PASSO: uma pegada, com os dedos à frente e o calcanhar atrás. */
function drawStep(g: Phaser.GameObjects.Graphics, s: number, face: number, deep: number) {
    g.fillStyle(deep, 1)
    g.fillEllipse(0, -0.06 * s, 0.50 * s, 0.62 * s)
    g.fillEllipse(0.01 * s, 0.31 * s, 0.34 * s, 0.30 * s)
    g.fillStyle(face, 1)
    g.fillEllipse(0, -0.09 * s, 0.44 * s, 0.56 * s)
    g.fillEllipse(0.01 * s, 0.29 * s, 0.28 * s, 0.24 * s)

    g.fillStyle(deep, 1)
    for (let i = 0; i < 4; i++) {
        const x = (-0.18 + i * 0.12) * s
        const y = (-0.40 - (i === 0 ? 0.03 : 0)) * s
        g.fillCircle(x, y, (i === 0 ? 0.072 : 0.056) * s)
    }
}

/** PALMA: as duas mãos se encontrando, com o estalo saindo do encontro. */
function drawClap(g: Phaser.GameObjects.Graphics, s: number, face: number, deep: number) {
    const hand = (dir: number) => {
        const x = dir * 0.05 * s
        g.fillStyle(deep, 1)
        g.fillRoundedRect(x - (dir > 0 ? 0 : 0.27 * s), -0.22 * s, 0.27 * s, 0.50 * s, 0.11 * s)
        g.fillStyle(face, 1)
        g.fillRoundedRect(x - (dir > 0 ? 0 : 0.27 * s), -0.25 * s, 0.27 * s, 0.47 * s, 0.11 * s)
        // o polegar, que é o que separa uma mão de um retângulo
        g.fillStyle(deep, 1)
        g.fillCircle(x + dir * 0.235 * s, -0.10 * s, 0.085 * s)
    }
    hand(1)
    hand(-1)

    g.lineStyle(Math.max(2, 0.05 * s), face, 1)
    for (const a of [-118, -90, -62]) {
        const r = Phaser.Math.DegToRad(a)
        g.lineBetween(Math.cos(r) * 0.32 * s, Math.sin(r) * 0.32 * s, Math.cos(r) * 0.46 * s, Math.sin(r) * 0.46 * s)
    }
}

/** GIRO: a volta inteira, com a ponta mostrando para onde ela vai. */
function drawSpin(g: Phaser.GameObjects.Graphics, s: number, face: number, deep: number) {
    const r = 0.34 * s
    g.lineStyle(Math.max(3, 0.135 * s), deep, 1)
    g.beginPath()
    g.arc(0, 0, r, Phaser.Math.DegToRad(-58), Phaser.Math.DegToRad(232), false)
    g.strokePath()
    g.lineStyle(Math.max(2, 0.085 * s), face, 1)
    g.beginPath()
    g.arc(0, 0, r, Phaser.Math.DegToRad(-58), Phaser.Math.DegToRad(232), false)
    g.strokePath()

    const tip = Phaser.Math.DegToRad(232)
    const cx = Math.cos(tip) * r
    const cy = Math.sin(tip) * r
    const h = 0.17 * s
    g.fillStyle(deep, 1)
    g.beginPath()
    g.moveTo(cx - h * 0.9, cy - h * 0.2)
    g.lineTo(cx + h * 0.5, cy - h * 1.0)
    g.lineTo(cx + h * 0.6, cy + h * 0.8)
    g.closePath()
    g.fillPath()
}
