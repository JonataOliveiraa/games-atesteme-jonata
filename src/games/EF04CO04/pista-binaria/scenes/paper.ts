import Phaser from 'phaser'
import { C } from '../data/theme'

/**
 * Os três pincéis de papel do jogo.
 *
 * O quadradinho CHEIO e o BURACO são desenhados pelo MESMO par de funções no
 * bloco, nos botões e na tela da máquina. É isso que sustenta a única
 * instrução do jogo: o botão é igual ao que está dentro do bloco.
 */

export function paintPanel(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    radius = 28,
    body: number = C.cream,
) {
    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(x - w / 2 + 4, y - h / 2 + 12, w, h, radius)
    g.fillStyle(C.creamShade, 1)
    g.fillRoundedRect(x - w / 2, y - h / 2 + 6, w, h, radius)
    g.fillStyle(body, 1)
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius)
    g.fillStyle(C.white, 0.3)
    g.fillRoundedRect(x - w / 2 + 14, y - h / 2 + 10, w - 28, h * 0.22, radius * 0.5)
}

/** O `1`: um pedaço de papel coral colado, com sombra curta. */
export function paintFilled(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
    const r = Math.max(8, size * 0.16)
    g.fillStyle(C.ink, 0.28)
    g.fillRoundedRect(x - size / 2 + 3, y - size / 2 + 7, size, size, r)
    g.fillStyle(C.coralDeep, 1)
    g.fillRoundedRect(x - size / 2, y - size / 2 + 4, size, size, r)
    g.fillStyle(C.coral, 1)
    g.fillRoundedRect(x - size / 2, y - size / 2, size, size, r)
    g.fillStyle(C.white, 0.22)
    g.fillRoundedRect(x - size / 2 + size * 0.12, y - size / 2 + size * 0.1, size * 0.4, size * 0.2, r * 0.5)
}

/** O `0`: o buraco que a tesoura deixou. Fundo fundo, e luz só na borda. */
export function paintHole(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    fill: number = C.navyDeep,
) {
    const r = Math.max(8, size * 0.16)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x - size / 2, y - size / 2, size, size, r)
    g.fillStyle(C.ink, 0.45)
    g.fillRoundedRect(x - size / 2, y - size / 2, size, size * 0.3, r)
    g.lineStyle(3, C.cream, 0.28)
    g.strokeRoundedRect(x - size / 2 + 2, y - size / 2 + 2, size - 4, size - 4, r)
}
