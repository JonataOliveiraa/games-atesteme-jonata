import Phaser from 'phaser'
import { DEPTH, SPLAT, W } from '../data/layout'
import { SPLAT_KEY } from './art'

export interface Splats {
    splash(count: number): void
    clear(): void
    destroy(): void
}

export function createSplats(scene: Phaser.Scene): Splats {
    const drops: Phaser.GameObjects.Image[] = []

    const clear = () => {
        drops.splice(0).forEach((d, i) =>
            scene.tweens.add({ targets: d, alpha: 0, y: d.y + 30, duration: 320, delay: i * 20, onComplete: () => d.destroy() }),
        )
    }

    return {
        splash(count) {
            for (let i = 0; i < count && drops.length < SPLAT.max; i++) {
                const d = scene.add
                    .image(80 + Math.random() * (W - 160), SPLAT.bottom, SPLAT_KEY)
                    .setDepth(DEPTH.drops)
                    .setScale(0.2)
                    .setAngle(Math.random() * 360)
                drops.push(d)
                scene.tweens.add({
                    targets: d,
                    y: SPLAT.top + Math.random() * (SPLAT.bottom - SPLAT.top),
                    scale: 0.8 + Math.random() * 0.9,
                    duration: 180 + Math.random() * 120,
                    delay: i * 40,
                    ease: 'Quad.easeOut',
                })
            }
        },
        clear,
        destroy() {
            drops.forEach(d => {
                scene.tweens.killTweensOf(d)
                d.destroy()
            })
            drops.length = 0
        },
    }
}
