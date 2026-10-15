import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { C } from '../data/theme'

type Point = { x: number; y: number }

/** Rastro de bolinhas atrás do que voa. `add` põe a bolinha no mesmo container do alvo. */
export function trail(scene: Phaser.Scene, target: Point, color: number, add: (dot: Phaser.GameObjects.Arc) => void) {
    const event = scene.time.addEvent({
        delay: 40,
        loop: true,
        callback: () => {
            const dot = scene.add.circle(target.x, target.y, 7, color).setStrokeStyle(2, C.ink, 0.5)
            add(dot)
            scene.tweens.add({ targets: dot, alpha: 0, scale: 0.2, duration: FX.ms(scene, 420), onComplete: () => dot.destroy() })
        },
    })
    return () => event.remove()
}
