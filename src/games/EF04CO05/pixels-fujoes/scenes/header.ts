import Phaser from 'phaser'
import { DEPTH, HEADER, U, W } from '../data/layout'
import { C } from '../data/theme'
import { Pix, bakePix } from './pixelart'

/**
 * O cabeçalho de ponta a ponta, em pixel art: duas faixas roxas (nível, ordem e ?; depois o combinado),
 * separadas por um sulco, com um aro roxo-claro embaixo e a sombra em degraus. Assado uma vez.
 */
export function createHeader(scene: Phaser.Scene) {
    const w = W / U
    const h = HEADER.height / U
    const row = HEADER.row / U
    const p = new Pix(w, h)
    p.rect(0, 0, w, row, C.panelTop)
    p.rect(0, row, w, h - row, C.panel)
    p.rect(0, 0, w, 1, C.panelLight)
    p.rect(0, row - 1, w, 1, C.outline)
    p.rect(0, row, w, 1, C.panelLight)
    p.rect(0, h - 2, w, 1, C.rim)
    p.rect(0, h - 1, w, 1, C.outline)
    for (let x = 2; x < w; x += 4) p.set(x, row - 2, C.panelDark)
    const key = bakePix(scene, 'pixel-header', p)
    const bg = scene.add.image(0, 0, key).setOrigin(0).setScale(U).setDepth(DEPTH.header)
    const shade = scene.add.graphics().setDepth(DEPTH.header)
    shade.fillStyle(C.shadow, 0.45)
    shade.fillRect(0, HEADER.height, W, U)
    shade.fillStyle(C.shadow, 0.2)
    shade.fillRect(0, HEADER.height + U, W, U)
    return {
        destroy() {
            bg.destroy()
            shade.destroy()
        },
    }
}
