import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { COUNTER, DEPTH, W } from '../data/layout'
import type { Vec } from '../types'
import { DOT, HEART, PUFF, SPLAT } from './art'

export interface Mess {
    stream(from: Vec, to: Vec, color: number, count: number, size: number): Promise<void>
    roll(from: Vec, color: number, count: number, size: number): Promise<void>
    spray(from: Vec, targets: Vec[], color: number, size: number): Promise<void>
    splat(x: number, y: number, color: number, scale: number, depth?: number): void
    crumb(x: number, y: number, color: number, size: number): void
    puff(x: number, y: number): void
    hearts(x: number, y: number): void
    clear(): void
    destroy(): void
}

export function createMess(scene: Phaser.Scene): Mess {
    let bits: Phaser.GameObjects.Image[] = []

    const add = (x: number, y: number, key: string, depth: number = DEPTH.fx) => {
        const image = scene.add.image(x, y, key).setDepth(depth)
        bits.push(image)
        return image
    }

    const drop = (image: Phaser.GameObjects.Image) => {
        bits = bits.filter(bit => bit !== image)
        FX.kill(scene, image)
        image.destroy()
    }

    const dot = (x: number, y: number, color: number, size: number) => add(x, y, DOT).setTint(color).setScale(size / 28)

    const mess: Mess = {
        async stream(from, to, color, count, size) {
            await FX.all(
                ...Array.from({ length: count }, (_, i) => {
                    const bit = dot(from.x, from.y, color, size).setAlpha(0)
                    return FX.to(
                        scene,
                        bit,
                        { x: to.x + Phaser.Math.Between(-22, 22), y: to.y + Phaser.Math.Between(-4, 8), alpha: 1 },
                        { duration: 300, delay: i * 42, ease: 'Quad.easeIn' },
                    ).then(() => drop(bit))
                }),
            )
        },
        async roll(from, color, count, size) {
            await FX.all(
                ...Array.from({ length: count }, (_, i) => {
                    const side = i % 2 ? 1 : -1
                    const landX = from.x + side * Phaser.Math.Between(20, 90)
                    const landY = COUNTER.top + Phaser.Math.Between(46, 92)
                    const bit = dot(from.x, from.y, color, size)
                    const away = i % 3 === 0 ? landX + side * Phaser.Math.Between(90, 220) : side > 0 ? W + 40 : -40
                    return FX.to(scene, bit, { x: landX, y: landY }, { duration: 300, delay: i * 40, ease: 'Bounce.easeOut' }).then(() =>
                        FX.to(scene, bit, { x: away, angle: side * 360 }, { duration: i % 3 === 0 ? 520 : 900, ease: 'Sine.easeIn' }),
                    )
                }),
            )
        },
        async spray(from, targets, color, size) {
            await FX.all(
                ...targets.map((to, i) => {
                    const bit = dot(from.x, from.y, color, size)
                    return FX.arcTo(scene, bit, to, { height: Phaser.Math.Between(50, 130), duration: 420 + (i % 4) * 50 }).then(() => {
                        drop(bit)
                        mess.splat(to.x, to.y, color, Phaser.Math.FloatBetween(0.28, 0.6), DEPTH.fx)
                    })
                }),
            )
        },
        splat(x, y, color, scale, depth = DEPTH.stain) {
            const image = add(x, y, SPLAT, depth).setTint(color).setAngle(Phaser.Math.Between(0, 359)).setScale(scale * 0.3)
            void FX.to(scene, image, { scale }, { duration: 170, ease: 'Back.easeOut' })
        },
        crumb(x, y, color, size) {
            add(x, y, DOT, DEPTH.stain).setTint(color).setScale(size / 28)
        },
        puff(x, y) {
            const image = add(x, y, PUFF).setScale(0.4).setAlpha(0.95)
            void FX.to(scene, image, { scale: 1, alpha: 0, y: y - 34 }, { duration: 420 }).then(() => drop(image))
        },
        hearts(x, y) {
            for (let i = 0; i < 3; i++) {
                const heart = add(x - 40 + i * 40, y, HEART).setScale(0.7)
                void FX.to(scene, heart, { y: y - 80 - i * 14, alpha: 0 }, { duration: 1100, delay: i * 140 }).then(() => drop(heart))
            }
        },
        clear() {
            ;[...bits].forEach(drop)
        },
        destroy() {
            mess.clear()
        },
    }
    return mess
}
