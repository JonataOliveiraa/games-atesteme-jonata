import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { NICO_CELL, NICO_SHEET, cellKey } from '../data/files'
import { NICO, SD } from '../data/layout'
import type { Vec } from '../types'
import type { Stage } from './stage'

export type Pose = keyof typeof NICO_CELL

export interface Nico {
    pose(pose: Pose): void
    cheer(): Promise<void>
    oops(): Promise<void>
    hands(): Vec
    head(): Vec
    destroy(): void
}

export function createNico(scene: Phaser.Scene, stage: Stage): Nico {
    const image = stage.add(
        scene.add.image(NICO.x, NICO.y, NICO_SHEET.key, cellKey(NICO_CELL.idle)).setOrigin(0.5, 1),
        SD.nico,
    )
    const base = NICO.h / image.height
    image.setScale(base)

    const reset = () => {
        scene.tweens.killTweensOf(image)
        image.setPosition(NICO.x, NICO.y).setScale(base).setAngle(0)
    }

    return {
        pose(pose) {
            image.setFrame(cellKey(NICO_CELL[pose]))
        },
        async cheer() {
            reset()
            image.setFrame(cellKey(NICO_CELL.cheer))
            await FX.to(scene, image, { y: NICO.y - 22 }, { duration: 180, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
            image.setY(NICO.y)
        },
        async oops() {
            reset()
            image.setFrame(cellKey(NICO_CELL.oops))
            await FX.shake(scene, image, { amount: 6, times: 3 })
        },
        hands: () => ({ x: NICO.x + NICO.hands.x, y: NICO.y + NICO.hands.y }),
        head: () => ({ x: NICO.x + NICO.head.x, y: NICO.y + NICO.head.y }),
        destroy() {
            reset()
            image.destroy()
        },
    }
}
