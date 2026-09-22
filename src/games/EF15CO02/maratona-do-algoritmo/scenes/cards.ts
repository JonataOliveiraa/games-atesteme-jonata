import Phaser from 'phaser'
import { C, CSS, FONT, TRICK_COLOR, TRICK_LABEL } from '../data/theme'
import type { TrickKind } from '../types'

/**
 * A pose que cada carta mostra, direto da folha do skatista. É contrato com
 * o TEXTURAS.md: 1 empurrando, 2 agachado na subida, 3 no ar.
 */
export const POSE: Record<TrickKind, number> = { empurrar: 1, subir: 2, pular: 3 }

/**
 * O ícone da FITA: só o skatista fazendo a manobra, grande, sobre um fundo
 * da cor daquela manobra. Sem palavra e sem moldura — a fita é a ordem do
 * programa, e ela precisa ser lida de longe, num relance. A palavra fica na
 * paleta, que é o menu.
 */
export function createPoseIcon(scene: Phaser.Scene, kind: TrickKind, size: number) {
    const container = scene.add.container(0, 0)
    const tone = TRICK_COLOR[kind]
    const half = size / 2
    const g = scene.add.graphics()

    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-half, -half, size, size, size * 0.2)
    g.fillStyle(tone.main, 1)
    g.fillRoundedRect(-half, -half, size, size - size * 0.06, size * 0.2)
    g.fillStyle(C.white, 0.24)
    g.fillRoundedRect(-half + size * 0.1, -half + size * 0.09, size * 0.8, size * 0.13, size * 0.06)
    container.add(g)

    if (scene.textures.exists('skatista')) {
        const pose = scene.add.sprite(0, size * 0.02, 'skatista', POSE[kind])
        pose.setDisplaySize(size * 0.96, size * 0.96)
        container.add(pose)
    }

    return container
}

/**
 * A carta da paleta. Ela é DESENHADA — não existe arte de carta a produzir.
 * Dentro dela vai o próprio quadro do skatista fazendo a manobra, porque é o
 * desenho que uma criança de 6 anos lê primeiro; a palavra vem junto, curta,
 * só para amarrar as duas coisas.
 */
export function createTrickCard(scene: Phaser.Scene, kind: TrickKind, w: number, h: number) {
    const container = scene.add.container(0, 0)
    const tone = TRICK_COLOR[kind]
    const g = scene.add.graphics()
    const r = Math.min(w, h) * 0.18

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, r - 4)
    g.fillStyle(tone.main, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 16, r - 4)
    g.fillStyle(C.white, 0.26)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 14, w - 32, h * 0.15, h * 0.075)
    container.add(g)

    if (scene.textures.exists('skatista')) {
        const pose = scene.add.sprite(0, -h * 0.08, 'skatista', POSE[kind])
        const size = h * 0.7
        pose.setDisplaySize(size, size)
        container.add(pose)
    }

    const label = scene.add.text(0, h / 2 - h * 0.16, TRICK_LABEL[kind], {
        fontFamily: FONT.black,
        fontSize: `${Math.round(h * 0.145)}px`,
        color: CSS.white,
        align: 'center',
    }).setOrigin(0.5).setResolution(2)
    label.setStroke(CSS.ink, Math.max(3, h * 0.032))
    container.add(label)

    return container
}
