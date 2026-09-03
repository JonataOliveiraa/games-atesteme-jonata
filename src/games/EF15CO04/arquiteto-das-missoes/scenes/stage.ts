import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'
import type { MissionDef } from '../types'

function cover(image: Phaser.GameObjects.Image) {
    const src = image.texture.getSourceImage() as { width: number; height: number }
    const scale = Math.max(W / src.width, H / src.height)
    image.setDisplaySize(src.width * scale, src.height * scale)
    image.setPosition(W / 2, H / 2)
}

export function createStage(scene: Phaser.Scene, mission: MissionDef) {
    const sky = scene.add.rectangle(W / 2, H / 2, W, H, C.creamDeep).setDepth(DEPTH.scene - 1)

    let before: Phaser.GameObjects.Image | null = null
    let after: Phaser.GameObjects.Image | null = null

    if (scene.textures.exists(mission.before)) {
        before = scene.add.image(W / 2, H / 2, mission.before).setDepth(DEPTH.scene)
        cover(before)
    }
    if (scene.textures.exists(mission.after)) {
        after = scene.add.image(W / 2, H / 2, mission.after).setDepth(DEPTH.scene + 1).setAlpha(0)
        cover(after)
    }

    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.58).setDepth(DEPTH.veil)

    return {
        dim(alpha: number, ms = 320) {
            scene.tweens.add({
                targets: veil,
                fillAlpha: alpha,
                duration: FX.ms(scene, ms),
            })
        },

        async reveal() {
            scene.tweens.add({
                targets: veil,
                fillAlpha: 0,
                duration: FX.ms(scene, 520),
            })
            if (!after) {
                await FX.wait(scene, 560)
                return
            }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: after,
                    alpha: 1,
                    duration: FX.ms(scene, 900),
                    ease: 'Sine.easeInOut',
                    onComplete: () => resolve(),
                })
            })
        },

        destroy() {
            sky.destroy()
            before?.destroy()
            after?.destroy()
            veil.destroy()
        },
    }
}
