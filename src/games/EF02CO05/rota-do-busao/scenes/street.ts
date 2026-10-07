import Phaser from 'phaser'
import { BG, SCENERY_FRAME, SCENERY_SHEET, frameKey } from '../data/files'
import { DEPTH, H, STREET, W } from '../data/layout'
import { C } from '../data/theme'
import type { SceneryId } from '../types'

export interface Street {
    setOffset(offset: number): void
    destroy(): void
}

const SPARE = 420
const MIN_LOOP = W + SPARE * 2

export function createStreet(scene: Phaser.Scene, scenery: SceneryId[]): Street {
    const bg = scene.add.image(0, 0, BG).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.bg)
    const marks = scene.add.graphics().setDepth(DEPTH.marks)
    const haze = scene.add.rectangle(W / 2, H / 2, W, H, C.haze, STREET.haze).setDepth(DEPTH.haze)

    const pieces: { image: Phaser.GameObjects.Image; base: number }[] = []
    let loop = 0
    while (loop < MIN_LOOP || pieces.length < scenery.length) {
        const id = scenery[pieces.length % scenery.length]
        const [, , w] = SCENERY_FRAME[id]
        const image = scene.add
            .image(0, STREET.sceneryFoot, SCENERY_SHEET, frameKey(id))
            .setOrigin(0, 1)
            .setScale(STREET.sceneryScale)
            .setDepth(DEPTH.scenery)
        pieces.push({ image, base: loop })
        loop += w * STREET.sceneryScale + STREET.sceneryGap
    }

    const wrap = (value: number, size: number) => ((value % size) + size) % size

    const setOffset = (offset: number) => {
        marks.clear()
        const dashPeriod = STREET.dashW + STREET.dashGap
        marks.fillStyle(C.dash, 0.75)
        for (let x = -wrap(offset, dashPeriod); x < W; x += dashPeriod) {
            marks.fillRoundedRect(x, STREET.dashY - STREET.dashH / 2, STREET.dashW, STREET.dashH, STREET.dashH / 2)
        }
        marks.lineStyle(3, C.joint, 1)
        for (let x = -wrap(offset, STREET.jointGap); x < W; x += STREET.jointGap) {
            marks.lineBetween(x, STREET.sidewalkTop + 6, x - 14, STREET.sidewalkBottom - 4)
        }
        const lag = offset * STREET.sceneryLag
        pieces.forEach(piece => piece.image.setX(wrap(piece.base - lag, loop) - SPARE))
    }
    setOffset(0)

    return {
        setOffset,
        destroy() {
            pieces.forEach(piece => piece.image.destroy())
            haze.destroy()
            marks.destroy()
            bg.destroy()
        },
    }
}
