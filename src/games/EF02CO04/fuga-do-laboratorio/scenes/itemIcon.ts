import Phaser from 'phaser'
import { C } from '../data/theme'
import type { LabItem } from '../types'

export const ITEM_SHEET = 'itens'
export const ITEM_COLUMNS = 4
export const ITEM_ROWS = 5

export type ItemIcon = Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics

/**
 * O desenho de reserva não tenta imitar o objeto: ele diz a CATEGORIA. Sem a
 * folha, uma caixa azul com botão continua sendo peça e uma ficha roxa com
 * engrenagem continua sendo programa — o jogo permanece jogável.
 */
function drawHardware(g: Phaser.GameObjects.Graphics, size: number) {
    const u = size / 100
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-42 * u, -36 * u, 84 * u, 62 * u, 12 * u)
    g.fillStyle(C.hardDark, 1)
    g.fillRoundedRect(-38 * u, -32 * u, 76 * u, 54 * u, 9 * u)
    g.fillStyle(C.hard, 1)
    g.fillRoundedRect(-38 * u, -32 * u, 76 * u, 44 * u, 9 * u)
    g.fillStyle(C.white, 0.5)
    g.fillRoundedRect(-28 * u, -25 * u, 56 * u, 12 * u, 6 * u)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-12 * u, 26 * u, 24 * u, 12 * u, 5 * u)
    g.fillRoundedRect(-30 * u, 36 * u, 60 * u, 10 * u, 5 * u)
}

function drawSoftware(g: Phaser.GameObjects.Graphics, size: number) {
    const u = size / 100
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-42 * u, -42 * u, 84 * u, 84 * u, 20 * u)
    g.fillStyle(C.softDark, 1)
    g.fillRoundedRect(-37 * u, -37 * u, 74 * u, 74 * u, 16 * u)
    g.fillStyle(C.soft, 1)
    g.fillRoundedRect(-37 * u, -37 * u, 74 * u, 66 * u, 16 * u)

    g.fillStyle(C.white, 1)
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        g.fillCircle(Math.cos(a) * 21 * u, Math.sin(a) * 21 * u, 7 * u)
    }
    g.fillCircle(0, 0, 20 * u)
    g.fillStyle(C.softDark, 1)
    g.fillCircle(0, 0, 9 * u)
}

/**
 * As peças vêm com mais margem vazia dentro do quadro que os tiles de
 * programa, que ocupam a célula inteira. Desenhadas na mesma caixa, ficavam
 * visivelmente menores — e sem a carta atrás para igualar, a fileira do rack
 * saía desalinhada. O empurrão iguala o que o olho vê, não o que a caixa mede.
 */
const HARDWARE_BOOST = 1.15

export function createItemIcon(
    scene: Phaser.Scene,
    target: LabItem,
    size: number,
): ItemIcon {
    const frame = String(target.frame)
    if (scene.textures.exists(ITEM_SHEET) && scene.textures.get(ITEM_SHEET).has(frame)) {
        const box = target.kind === 'hardware' ? size * HARDWARE_BOOST : size
        return scene.add.sprite(0, 0, ITEM_SHEET, frame).setDisplaySize(box, box)
    }
    const g = scene.add.graphics()
    if (target.kind === 'hardware') drawHardware(g, size)
    else drawSoftware(g, size)
    return g
}
