import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, DUDA } from '../data/layout'
import type { DudaPose } from '../types'
import { dudaImage, setDudaPose } from './art'
import type { Rect } from './guide'

/** A Duda só aparece no começo, no erro e no fim. */
export interface Duda {
    show(pose: DudaPose, at?: { x: number; feet: number; h: number }): Promise<void>
    pose(pose: DudaPose): void
    hide(): Promise<void>
    rect(): Rect
    destroy(): void
}

/** `facingLeft`: no palco ela fica à direita do telão e aponta para ele */
export function createDuda(scene: Phaser.Scene, depth: number = DEPTH.duda, facingLeft = false): Duda {
    let image: Phaser.GameObjects.Image | undefined
    let place: { x: number; feet: number; h: number } = { x: DUDA.x, feet: DUDA.feet, h: DUDA.h }

    return {
        async show(pose, at) {
            place = at ?? { x: DUDA.x, feet: DUDA.feet, h: DUDA.h }
            image?.destroy()
            image = dudaImage(scene, pose, place.h).setPosition(place.x, place.feet + 160).setDepth(depth).setAlpha(0).setFlipX(facingLeft)
            await FX.to(scene, image, { y: place.feet, alpha: 1 }, { duration: 420, ease: 'Back.easeOut' })
        },
        pose(pose) {
            if (!image) return
            setDudaPose(image, pose)
            void FX.to(scene, image, { scaleY: image.scaleY * 1.04 }, { duration: 90, yoyo: true })
        },
        async hide() {
            const leaving = image
            image = undefined
            if (!leaving) return
            await FX.to(scene, leaving, { y: place.feet + 160, alpha: 0 }, { duration: 300 })
            leaving.destroy()
        },
        rect: () => ({ x: place.x, y: place.feet - place.h / 2, w: place.h * 0.7, h: place.h + 10 }),
        destroy() {
            if (image) scene.tweens.killTweensOf(image)
            image?.destroy()
            image = undefined
        },
    }
}
