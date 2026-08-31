import Phaser from 'phaser'
import { C, CSS, FONT } from '../data/theme'
import { FIGURE } from '../data/layout'
import type { StepDef } from '../types'

/**
 * Sempre um container: assim a figura do caminho, a miniatura do topo e a
 * peça da reprise são a mesma coisa, e escalar qualquer uma é seguro.
 *
 * Quando a textura não existe, entra um cartão com o nome do passo. Não é
 * enfeite: é o que deixa a rodada jogável antes de a arte chegar, e o que
 * impede um arquivo faltando de derrubar o jogo.
 */
export function createFigure(scene: Phaser.Scene, step: StepDef, size: number) {
    const container = scene.add.container(0, 0)

    if (scene.textures.exists(step.texture)) {
        const sprite = scene.add.image(0, 0, step.texture)
        sprite.setDisplaySize(size, size)
        container.add(sprite)
        return container
    }

    const g = scene.add.graphics()
    const half = size / 2
    g.fillStyle(C.ink, 0.25)
    g.fillRoundedRect(-half + 4, -half + 8, size, size, 26)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-half, -half, size, size, 26)
    g.lineStyle(6, C.creamEdge, 1)
    g.strokeRoundedRect(-half, -half, size, size, 26)

    const label = scene.add.text(0, 0, step.label, {
        fontFamily: FONT.black,
        fontSize: `${Math.round(size * 0.13)}px`,
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: size * 0.8 },
    }).setOrigin(0.5).setResolution(2)

    container.add([g, label])
    return container
}

/**
 * A plaquinha com o nome da tarefa, presa embaixo da figura. Ela anda junto
 * — criança de 6 anos ainda está aprendendo a ler, então o desenho é quem
 * manda; a palavra vem junto para amarrar as duas coisas.
 */
export function attachLabel(
    scene: Phaser.Scene,
    holder: Phaser.GameObjects.Container,
    step: StepDef,
) {
    const text = scene.add.text(0, 0, step.label, {
        fontFamily: FONT.black,
        fontSize: '21px',
        color: CSS.ink,
        align: 'center',
    }).setOrigin(0.5).setResolution(2)

    const w = text.width + 34
    const h = text.height + 16
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillStyle(C.creamDeep, 1)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, (h - 8) / 2)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 12, (h - 8) / 2)

    const tag = scene.add.container(0, FIGURE.labelDy, [g, text])
    holder.add(tag)
    return tag
}
