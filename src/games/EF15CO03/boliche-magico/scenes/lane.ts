import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG_KEY } from '../data/files'
import { H, RAKE, W, WD } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import { paintImage } from './art'
import type { View } from './view'

export interface Lane {
    sweep(push: (x: number) => void): Promise<void>
    destroy(): void
}

export function createLane(scene: Phaser.Scene, view: View): Lane {
    const bg = view.add(scene.add.image(0, 0, BG_KEY).setOrigin(0, 0), WD.bg)
    bg.setDisplaySize(W, H)

    const h = RAKE.bottom - RAKE.top
    const plate = paintImage(scene, RAKE.w + 40, h + 10, g => {
        g.fillStyle(C.rakeDark, 1)
        g.fillRect(20, 0, RAKE.w, h)
        g.fillStyle(C.rake, 1)
        g.fillRect(20, 0, RAKE.w - 8, h)
        for (let y = 30; y < h - 20; y += 46) {
            g.fillStyle(C.rakeDark, 1)
            g.fillRect(20, y, RAKE.w, 6)
        }
        g.fillStyle(C.machineTeal, 1)
        g.fillRoundedRect(0, h - 26, RAKE.w + 40, 30, 10)
        g.fillStyle(C.machineTealDark, 1)
        g.fillRect(0, h - 4, RAKE.w + 40, 6)
        g.lineStyle(4, C.line, 1)
        g.strokeRoundedRect(0, h - 26, RAKE.w + 40, 30, 10)
        g.strokeRect(20, 0, RAKE.w, h - 26)
    }).setOrigin(0.5, 0)
    const rake = view.add(scene.add.container(RAKE.from, RAKE.top - h, [plate]), WD.rake).setVisible(false)

    return {
        async sweep(push) {
            scene.tweens.killTweensOf(rake)
            rake.setPosition(RAKE.from, RAKE.top - h).setVisible(true)
            await FX.to(scene, rake, { y: RAKE.top }, { duration: 320, ease: 'Quad.easeOut' })
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: rake,
                    x: RAKE.to,
                    duration: FX.ms(scene, TIMING.sweep),
                    ease: 'Sine.easeIn',
                    onUpdate: () => push(rake.x + RAKE.w / 2 + 20),
                    onComplete: () => resolve(),
                })
            })
            rake.setVisible(false)
        },
        destroy() {
            scene.tweens.killTweensOf(rake)
            rake.destroy()
            bg.destroy()
        },
    }
}
