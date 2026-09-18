import Phaser from 'phaser'
import { C } from '../data/theme'

/**
 * O CÉU, EM QUARENTA FAIXAS.
 *
 * Ele começou como uma reserva, à espera de um `ceu.png` — e ficou: o usuário
 * viu o degradê rodando e disse que estava bom. É o único pedaço de cenário que
 * nunca virou textura, e por um motivo honesto: um céu liso não tem nada para
 * uma folha desenhar. O que ele precisa é só **acabar em creme**, para casar com
 * a parede do quarto e com o chão do mundo do ar sem costura dura.
 *
 * Os dois mundos chamam esta mesma função, e é isso que faz o nível 3 parecer o
 * mesmo jogo depois de o cenário inteiro ter mudado.
 */
export function paintSky(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics()
    const steps = 40
    for (let i = 0; i < steps; i++) {
        const col = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0x6fb7e8),
            Phaser.Display.Color.ValueToColor(C.creamSoft),
            steps - 1,
            i,
        )
        g.fillStyle(Phaser.Display.Color.GetColor(col.r, col.g, col.b), 1)
        g.fillRect(x, y + (h / steps) * i, w, h / steps + 1)
    }
    return g
}
