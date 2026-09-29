import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_CELL, PIECES } from '../data/files'
import { BIRD, DEPTH } from '../data/layout'
import { createPic } from './pic'

export interface Bird {
    show(): void
    place(x: number, y: number): void
    hit(): Promise<void>
    hide(): void
    readonly size: number
    destroy(): void
}

export function createBird(scene: Phaser.Scene): Bird {
    const pic = createPic(scene, 0, 0, BIRD.size)
    pic.set(PIECES, PIECE_CELL.bird, 'pássaro')
    const body = scene.add.container(0, 0, [pic.container])
    const container = scene.add.container(-200, -200, [body]).setDepth(DEPTH.ringFront).setVisible(false)
    let flap: Phaser.Tweens.Tween | undefined
    let tumbling = false

    const startFlap = () => {
        flap?.remove()
        body.setScale(1).setAngle(0)
        flap = scene.tweens.add({
            targets: body,
            scaleY: 0.86,
            y: -4,
            duration: FX.ms(scene, BIRD.flapMs),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    return {
        show() {
            if (container.visible) return
            container.setVisible(true).setAlpha(1)
            startFlap()
        },
        place(x, y) {
            container.setPosition(x, y)
        },
        async hit() {
            if (tumbling) return
            tumbling = true
            flap?.remove()
            await FX.to(scene, body, { angle: 200, scale: 0.8 }, { duration: 360, ease: 'Quad.easeOut' })
            await FX.to(scene, body, { angle: 360, scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
            tumbling = false
            if (container.active && container.visible) startFlap()
        },
        hide() {
            flap?.remove()
            flap = undefined
            container.setVisible(false)
        },
        get size() {
            return BIRD.hitRadius
        },
        destroy() {
            flap?.remove()
            FX.kill(scene, body)
            container.destroy()
        },
    }
}
