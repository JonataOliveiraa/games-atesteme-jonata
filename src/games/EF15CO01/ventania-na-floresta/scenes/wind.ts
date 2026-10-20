import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { OBJECT_SHEET, OBJECT_CELL, cellKey } from '../data/files'
import { DEPTH, H, W } from '../data/layout'
import { STREAK } from './art'

export interface Wind {
    gust(ms: number): Promise<void>
    destroy(): void
}

export function createWind(scene: Phaser.Scene): Wind {
    const live = new Set<Phaser.GameObjects.Image>()

    const fly = (img: Phaser.GameObjects.Image, delay: number, ms: number, toX: number, toY: number, spin = 0) => {
        live.add(img)
        scene.tweens.add({
            targets: img,
            x: toX,
            y: toY,
            angle: img.angle + spin,
            delay: FX.ms(scene, delay),
            duration: FX.ms(scene, ms),
            ease: 'Sine.easeInOut',
            onStart: () => {
                if (img.active) img.setVisible(true)
            },
            onComplete: () => {
                live.delete(img)
                img.destroy()
            },
        })
    }

    return {
        async gust(ms) {
            for (let i = 0; i < 12; i++) {
                const y = 130 + Math.random() * (H - 170)
                const streak = scene.add
                    .image(-200, y, STREAK)
                    .setDepth(DEPTH.fx)
                    .setAlpha(0.55 + Math.random() * 0.35)
                    .setScale(0.7 + Math.random() * 0.8, 0.8 + Math.random() * 0.5)
                    .setVisible(false)
                fly(streak, Math.random() * ms * 0.45, ms * (0.45 + Math.random() * 0.25), W + 220, y - 30 + Math.random() * 60)
            }
            for (let i = 0; i < 14; i++) {
                const y = 120 + Math.random() * (H - 160)
                const leaf = scene.add
                    .image(-60, y, OBJECT_SHEET.key, cellKey(OBJECT_CELL.windLeaf))
                    .setDepth(DEPTH.fx)
                    .setScale(0.3 + Math.random() * 0.25)
                    .setAngle(Math.random() * 360)
                    .setVisible(false)
                fly(leaf, Math.random() * ms * 0.5, ms * (0.5 + Math.random() * 0.3), W + 80, y + (Math.random() - 0.5) * 220, 540 + Math.random() * 360)
            }
            await FX.wait(scene, ms)
        },
        destroy() {
            live.forEach(img => {
                scene.tweens.killTweensOf(img)
                img.destroy()
            })
            live.clear()
        },
    }
}
