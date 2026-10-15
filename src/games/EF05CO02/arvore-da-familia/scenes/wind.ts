import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, W } from '../data/layout'
import { piece } from './art'

export function blowWind(scene: Phaser.Scene, ms: number): Promise<void> {
    const spawn = (i: number) => {
        const gust = piece(scene, 'gust', -260, Phaser.Math.Between(130, 600), Phaser.Math.Between(170, 280))
            .setDepth(DEPTH.fx)
            .setAlpha(0.9)
        void FX.to(scene, gust, { x: W + 260 }, { duration: Phaser.Math.Between(650, 900), ease: 'Sine.easeIn' }).then(() => gust.destroy())
        for (let k = 0; k < 2; k++) {
            const leaf = piece(scene, 'leaf', -40, Phaser.Math.Between(120, 620), 34)
                .setDepth(DEPTH.fx)
                .setAngle(Phaser.Math.Between(0, 360))
            const y = leaf.y + Phaser.Math.Between(-90, 90)
            void FX.to(scene, leaf, { x: W + 60, y, angle: leaf.angle + 540 }, { duration: Phaser.Math.Between(900, 1400), delay: k * 120 + (i % 2) * 60, ease: 'Sine.easeInOut' }).then(() => leaf.destroy())
        }
    }
    const count = Math.floor(ms / 140)
    const jobs: Promise<void>[] = []
    for (let i = 0; i < count; i++) jobs.push(FX.wait(scene, i * 140).then(() => spawn(i)))
    return FX.all(...jobs, FX.wait(scene, ms))
}
