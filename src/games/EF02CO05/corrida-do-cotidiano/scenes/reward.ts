import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import { TECH } from '../data/tech'
import type { TechId } from '../types'

export function rewardPop(
    scene: Phaser.Scene,
    tech: TechId,
    from: { x: number; y: number; size: number },
) {
    const ring = scene.add
        .circle(from.x, from.y, from.size * 0.42, C.ok, 0.34)
        .setDepth(DEPTH.reward - 1)
    scene.tweens.add({
        targets: ring,
        scale: 1.9,
        alpha: 0,
        duration: 520,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy(),
    })

    void FX.stars(scene, from.x, from.y, { count: 9 })

    if (!scene.textures.exists('tecnologias')) return

    const icon = scene.add
        .image(from.x, from.y, 'tecnologias', TECH[tech].frame)
        .setDisplaySize(from.size * 0.72, from.size * 0.72)
        .setDepth(DEPTH.reward)

    scene.tweens.add({
        targets: icon,
        y: from.y - 130,
        displayWidth: from.size * 1.05,
        displayHeight: from.size * 1.05,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
            scene.tweens.add({
                targets: icon,
                y: from.y - 230,
                alpha: 0,
                displayWidth: from.size * 0.5,
                displayHeight: from.size * 0.5,
                duration: 460,
                ease: 'Cubic.easeIn',
                onComplete: () => icon.destroy(),
            })
        },
    })
}
