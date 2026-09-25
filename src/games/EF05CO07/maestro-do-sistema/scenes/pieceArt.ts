import Phaser from 'phaser'
import { C } from '../data/theme'
import { PIECES } from '../data/cast'
import type { Piece } from '../types'
import { TEX } from './BootScene'

/**
 * A PEÇA, EM SPRITE OU EM `Graphics`.
 *
 * Quando `pecas.png` existe, a peça é o recorte de papel da folha — cada uma
 * inteira e centrada na própria célula, então o meio da célula é o meio do
 * desenho. Sem a folha, o mesmo objeto
 * nasce em `Graphics` — é o que mantém a promessa de o jogo abrir com zero PNG.
 * `cell` é a altura da célula de 256 na tela, e não o tamanho do desenho: é
 * isso que preserva a proporção entre as quatro peças.
 */
export function makePiece(
    scene: Phaser.Scene,
    piece: Piece,
    cell: number,
): Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics {
    if (scene.textures.exists(TEX.pieces)) {
        const sprite = scene.add.sprite(0, 0, TEX.pieces, PIECES[piece].frame)
        sprite.setDisplaySize(cell, cell)
        return sprite
    }
    const g = scene.add.graphics()
    drawPiece(g, piece, 0, 0, cell * 0.72)
    return g
}

/** Acinzenta a peça quando o balão está apagado. */
export function flatPiece(
    art: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics,
    flat: boolean,
    piece: Piece,
) {
    if (!(art instanceof Phaser.GameObjects.Sprite)) {
        const g = art as Phaser.GameObjects.Graphics
        g.clear()
        drawPiece(g, piece, 0, 0, 78, { flat })
        return
    }
    if (flat) art.setTint(0xa79fa9)
    else art.clearTint()
    art.setAlpha(flat ? 0.75 : 1)
}

/**
 * As quatro peças em papel recortado, desenhadas numa caixa de 100 × 100.
 * O que a criança reconhece a 54 px reais é o FORMATO — quadrado, círculo,
 * retângulo deitado e retângulo em pé —, e é por isso que cada uma tem a sua
 * silhueta antes de ter o seu pictograma.
 */
export function drawPiece(
    g: Phaser.GameObjects.Graphics,
    kind: Piece,
    cx: number,
    cy: number,
    size: number,
    { flat = false } = {},
) {
    const u = size / 100
    const info = PIECES[kind]
    const body = flat ? C.gray : info.color
    const light = flat ? 0xe6e0e6 : C.cream

    const shade = (draw: (dx: number, dy: number) => void) => {
        if (flat) return
        g.fillStyle(C.ink, 0.22)
        draw(3 * u, 5 * u)
    }

    if (info.shape === 'square') {
        const s = 76 * u
        g.fillStyle(C.ink, 0.22)
        if (!flat) g.fillRoundedRect(cx - s / 2 + 3 * u, cy - s / 2 + 5 * u, s, s, 12 * u)
        g.fillStyle(flat ? C.gray : C.goldDeep, 1)
        for (let i = -1; i <= 1; i++) {
            g.fillRect(cx + i * 22 * u - 5 * u, cy - s / 2 - 8 * u, 10 * u, 10 * u)
            g.fillRect(cx + i * 22 * u - 5 * u, cy + s / 2 - 2 * u, 10 * u, 10 * u)
            g.fillRect(cx - s / 2 - 8 * u, cy + i * 22 * u - 5 * u, 10 * u, 10 * u)
            g.fillRect(cx + s / 2 - 2 * u, cy + i * 22 * u - 5 * u, 10 * u, 10 * u)
        }
        g.fillStyle(body, 1)
        g.fillRoundedRect(cx - s / 2, cy - s / 2, s, s, 12 * u)
        g.lineStyle(7 * u, light, 1)
        g.strokeRoundedRect(cx - 24 * u, cy - 24 * u, 48 * u, 48 * u, 8 * u)
        g.lineStyle(7 * u, light, 1)
        g.beginPath()
        g.moveTo(cx - 10 * u, cy - 10 * u)
        g.lineTo(cx + 10 * u, cy - 10 * u)
        g.lineTo(cx + 10 * u, cy + 10 * u)
        g.strokePath()
        return
    }

    if (info.shape === 'circle') {
        const r = 42 * u
        shade((dx, dy) => g.fillCircle(cx + dx, cy + dy, r))
        g.fillStyle(body, 1)
        g.fillCircle(cx, cy, r)
        g.fillStyle(C.ink, 0.18)
        g.fillCircle(cx - 4 * u, cy, r * 0.62)
        g.fillStyle(light, 1)
        g.fillCircle(cx - 4 * u, cy, r * 0.26)
        g.lineStyle(6 * u, light, 0.95)
        for (let i = 1; i <= 2; i++) {
            g.beginPath()
            g.arc(cx + 16 * u, cy, (10 + i * 12) * u, -0.9, 0.9, false)
            g.strokePath()
        }
        return
    }

    if (info.shape === 'wide') {
        const w = 92 * u
        const h = 58 * u
        shade((dx, dy) => g.fillRoundedRect(cx - w / 2 + dx, cy - h / 2 + dy, w, h, 10 * u))
        g.fillStyle(flat ? C.gray : C.woodDark, 1)
        g.fillRoundedRect(cx - 16 * u, cy + h / 2 - 4 * u, 32 * u, 14 * u, 5 * u)
        g.fillStyle(body, 1)
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 10 * u)
        g.fillStyle(light, 1)
        g.fillRoundedRect(cx - w / 2 + 9 * u, cy - h / 2 + 9 * u, w - 18 * u, h - 18 * u, 6 * u)
        g.fillStyle(body, 0.28)
        g.fillRoundedRect(cx - w / 2 + 9 * u, cy - h / 2 + 9 * u, (w - 18 * u) * 0.45, h - 18 * u, 6 * u)
        return
    }

    const w = 46 * u
    const h = 92 * u
    shade((dx, dy) => g.fillRoundedRect(cx - w / 2 + dx, cy - h / 2 + dy, w, h, 8 * u))
    g.fillStyle(body, 1)
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8 * u)
    g.fillStyle(flat ? 0xb8b0b8 : C.gold, 1)
    for (let i = 0; i < 4; i++) {
        g.fillRect(cx - w / 2 + (4 + i * 11) * u, cy + h / 2 - 12 * u, 7 * u, 8 * u)
    }
    g.fillStyle(light, 1)
    g.fillPoints([
        new Phaser.Geom.Point(cx + 4 * u, cy - 30 * u),
        new Phaser.Geom.Point(cx - 12 * u, cy + 4 * u),
        new Phaser.Geom.Point(cx - 1 * u, cy + 4 * u),
        new Phaser.Geom.Point(cx - 6 * u, cy + 30 * u),
        new Phaser.Geom.Point(cx + 13 * u, cy - 6 * u),
        new Phaser.Geom.Point(cx + 1 * u, cy - 6 * u),
    ], true, true)
}
