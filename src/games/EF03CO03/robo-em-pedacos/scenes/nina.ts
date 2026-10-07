import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { NINA, NINA_CELL, NINA_FOOT, NINA_FRAME } from '../data/files'
import { DEPTH, NINA_SPOT } from '../data/layout'
import type { Vec } from '../types'

export type NinaPose = keyof typeof NINA_FRAME

export interface Nina {
    pose(p: NinaPose): void
    mouth(): Vec
    destroy(): void
}

export function createNina(scene: Phaser.Scene): Nina {
    const sprite = scene.add
        .sprite(NINA_SPOT.x, NINA_SPOT.footY, NINA, NINA_FRAME.idle)
        .setOrigin(0.5, NINA_FOOT / NINA_CELL.h)
        .setScale(NINA_SPOT.scale)
        .setDepth(DEPTH.nina)
    let idle: Phaser.Tweens.Tween | undefined
    const breathe = () => {
        idle?.stop()
        sprite.setScale(NINA_SPOT.scale)
        idle = scene.tweens.add({ targets: sprite, scaleY: NINA_SPOT.scale * 1.02, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
    breathe()
    return {
        pose(p) {
            idle?.stop()
            sprite.setScale(NINA_SPOT.scale).setFrame(NINA_FRAME[p])
            void FX.impact(scene, sprite, 0.08).then(breathe)
        },
        mouth: () => ({ x: NINA_SPOT.x + 110, y: NINA_SPOT.footY - 320 }),
        destroy() {
            idle?.stop()
            scene.tweens.killTweensOf(sprite)
            sprite.destroy()
        },
    }
}
