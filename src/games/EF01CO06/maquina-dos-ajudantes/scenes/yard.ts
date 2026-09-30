import Phaser from 'phaser'
import { BG } from '../data/files'
import { DEPTH, H, W } from '../data/layout'

export interface Yard {
    destroy(): void
}

export function createYard(scene: Phaser.Scene): Yard {
    const image = scene.add.image(0, 0, BG).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.bg)
    return {
        destroy() {
            image.destroy()
        },
    }
}
