import Phaser from 'phaser'
import { DEPTH, HEADER, W } from '../data/layout'
import { C } from '../data/theme'

/**
 * O cabeçalho de ponta a ponta, em duas faixas: em cima o nível, a ordem e o `?`; embaixo o
 * combinado. Tudo o que fica no alto mora dentro dele, alinhado ao meio de cada faixa.
 */
export function createHeader(scene: Phaser.Scene) {
    const g = scene.add.graphics().setDepth(DEPTH.header)
    g.fillStyle(C.shadow, 0.12)
    g.fillRect(0, HEADER.height, W, 8)
    g.fillStyle(C.headerCream, 1)
    g.fillRect(0, 0, W, HEADER.height)
    g.fillStyle(C.headerRim, 1)
    g.fillRect(0, HEADER.row - 2, W, 4)
    g.fillRect(0, HEADER.height - 6, W, 6)
    g.fillStyle(C.headerLine, 1)
    g.fillRect(0, HEADER.height, W, 3)
    return { destroy: () => g.destroy() }
}
