import Phaser from 'phaser'
import { ACTION_COLOR, ACTION_LABEL, C, CSS, FONT } from '../data/theme'
import type { ActionKind } from '../types'

/** A pose do coelho que cada carta mostra. */
const POSE: Record<ActionKind, number> = { andar: 0, pular: 1, abaixar: 2 }

/**
 * O ícone da TRILHA: só o coelho fazendo a ação, grande, sobre um fundo da
 * cor daquela ação. Sem palavra e sem moldura de carta — a trilha é a ordem
 * do programa, e ela precisa ser lida de longe, num relance. A palavra fica
 * na paleta, que é o menu.
 */
export function createPoseIcon(scene: Phaser.Scene, kind: ActionKind, size: number) {
    const container = scene.add.container(0, 0)
    const tone = ACTION_COLOR[kind]
    const half = size / 2
    const g = scene.add.graphics()

    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-half, -half, size, size, size * 0.2)
    g.fillStyle(tone.main, 1)
    g.fillRoundedRect(-half, -half, size, size - size * 0.06, size * 0.2)
    g.fillStyle(C.white, 0.26)
    g.fillRoundedRect(-half + size * 0.1, -half + size * 0.09, size * 0.8, size * 0.13, size * 0.06)
    container.add(g)

    if (scene.textures.exists('coelho')) {
        const pose = scene.add.sprite(0, size * 0.02, 'coelho', POSE[kind])
        pose.setDisplaySize(size * 0.94, size * 0.94)
        container.add(pose)
    }

    return container
}

/**
 * A carta de ação. Ela é DESENHADA — não existe arte de carta a produzir.
 * Dentro dela vai o próprio quadro do coelho fazendo a ação, porque é o
 * desenho que uma criança de 6 anos lê primeiro; a palavra vem junto para
 * amarrar as duas coisas.
 */
export function createActionIcon(scene: Phaser.Scene, kind: ActionKind, w: number, h: number) {
    const container = scene.add.container(0, 0)
    const tone = ACTION_COLOR[kind]
    const g = scene.add.graphics()
    const r = Math.min(w, h) * 0.18

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, r - 4)
    g.fillStyle(tone.main, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 16, r - 4)
    g.fillStyle(C.white, 0.28)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 14, w - 32, h * 0.16, h * 0.08)
    container.add(g)

    const label = scene.add.text(0, h / 2 - h * 0.17, ACTION_LABEL[kind], {
        fontFamily: FONT.black,
        fontSize: `${Math.round(h * 0.16)}px`,
        color: CSS.white,
        align: 'center',
    }).setOrigin(0.5).setResolution(2)
    label.setStroke(CSS.ink, Math.max(3, h * 0.035))

    if (scene.textures.exists('coelho')) {
        const pose = scene.add.sprite(0, -h * 0.09, 'coelho', POSE[kind])
        const size = h * 0.66
        pose.setDisplaySize(size, size)
        container.add(pose)
    } else {
        const arrow = scene.add.graphics()
        arrow.fillStyle(C.white, 1)
        const a = h * 0.18
        if (kind === 'pular') arrow.fillTriangle(0, -a - h * 0.1, a, a - h * 0.1, -a, a - h * 0.1)
        else if (kind === 'abaixar') arrow.fillTriangle(0, a - h * 0.1, a, -a - h * 0.1, -a, -a - h * 0.1)
        else arrow.fillTriangle(a, -h * 0.1, -a, a - h * 0.1, -a, -a - h * 0.1)
        container.add(arrow)
    }

    container.add(label)
    return container
}
