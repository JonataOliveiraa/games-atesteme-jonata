import Phaser from 'phaser'
import { C, CSS, FONT } from '../data/theme'
import type { Situation } from '../types'

export const SITUATION_SHEET = 'situacoes'
export const SITUATION_COLUMNS = 4
export const SITUATION_ROWS = 3

export type SituationArt = Phaser.GameObjects.Sprite | Phaser.GameObjects.Container

function fallbackCard(scene: Phaser.Scene, target: Situation, size: number): Phaser.GameObjects.Container {
    const card = scene.add.container(0, 0)
    const half = size / 2

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-half, -half + 8, size, size, 22)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-half, -half, size, size, 22)
    g.fillStyle(C.creamDeep, 1)
    g.fillRoundedRect(-half + 6, -half + 6, size - 12, size - 12, 17)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-half + 6, -half + 6, size - 12, size - 24, 17)

    const label = scene.add.text(0, 0, target.label, {
        fontFamily: FONT.black,
        fontSize: '20px',
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: size - 30 },
    }).setOrigin(0.5).setResolution(2)

    card.add([g, label])
    return card
}

export function createSituationArt(
    scene: Phaser.Scene,
    target: Situation,
    size: number,
): SituationArt {
    const frame = String(target.frame)
    if (scene.textures.exists(SITUATION_SHEET) && scene.textures.get(SITUATION_SHEET).has(frame)) {
        return scene.add.sprite(0, 0, SITUATION_SHEET, frame).setDisplaySize(size, size)
    }
    return fallbackCard(scene, target, size)
}
