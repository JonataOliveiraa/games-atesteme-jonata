import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, DOG } from '../data/layout'
import type { DogPose } from '../data/files'
import type { DogId } from '../types'
import { dogImage, setDogPose } from './art'

export interface Dog {
    show(dog: DogId): Promise<void>
    runTo(x: number, feet: number): Promise<void>
    jump(): Promise<void>
    cry(): void
    hide(): Promise<void>
    rect(): { x: number; y: number; w: number; h: number }
    readonly current: DogId
    destroy(): void
}

export function createDog(scene: Phaser.Scene): Dog {
    let current: DogId = 'pacoca'
    const art = dogImage(scene, current, 'sit', DOG.size)
    const body = scene.add.container(DOG.x, DOG.y, [art]).setDepth(DEPTH.dog).setVisible(false)
    const pose = (p: DogPose) => setDogPose(art, current, p)

    return {
        async show(dog) {
            current = dog
            pose('sit')
            body.setPosition(DOG.x, DOG.y).setVisible(true).setAlpha(1).setScale(0.3)
            await FX.to(scene, body, { scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },
        async runTo(x, feet) {
            pose('run')
            const hop = scene.tweens.add({ targets: art, y: -12, duration: 120, yoyo: true, repeat: -1 })
            const distance = Phaser.Math.Distance.Between(body.x, body.y, x, feet)
            await FX.to(scene, body, { x, y: feet }, { duration: Math.max(500, distance * 1.3), ease: 'Sine.easeInOut' })
            hop.remove()
            art.setY(0)
        },
        async jump() {
            pose('jump')
            await FX.to(scene, body, { y: body.y - 40 }, { duration: 200, yoyo: true, repeat: 1, ease: 'Quad.easeOut' })
        },
        cry() {
            pose('cry')
        },
        async hide() {
            if (!body.visible) return
            await FX.to(scene, body, { alpha: 0 }, { duration: 220 })
            body.setVisible(false)
        },
        rect() {
            return { x: DOG.x, y: DOG.y - DOG.size / 2, w: DOG.size + 40, h: DOG.size + 20 }
        },
        get current() {
            return current
        },
        destroy() {
            body.destroy()
        },
    }
}
