import Phaser from 'phaser'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { Rect } from '../types'

const TEXT_SIZE = 32

export const spot = (r: Rect, pad = 0): Pick<TutorialStep, 'shape' | 'x' | 'y' | 'w' | 'h'> => ({
    shape: 'rect',
    x: r.x,
    y: r.y,
    w: r.w + pad * 2,
    h: r.h + pad * 2,
})

export function teach(scene: Phaser.Scene, key: string, steps: TutorialStep[]): Promise<void> {
    return new Promise(resolve => {
        createTutorial(scene, {
            key,
            steps,
            once: false,
            textSize: TEXT_SIZE,
            accent: C.accent,
            safeTop: 84,
            onFinish: () => resolve(),
        })
    })
}

function ripple(scene: Phaser.Scene, x: number, y: number, delay = 0) {
    const ring = scene.add.circle(x, y, 18).setStrokeStyle(5, C.line, 1).setDepth(DEPTH.dot)
    const state = { r: 18 }
    scene.tweens.add({
        targets: state,
        r: 62,
        duration: 520,
        delay,
        ease: 'Sine.easeOut',
        onUpdate: () => {
            ring.setRadius(state.r)
            ring.setStrokeStyle(5, C.line, 1 - (state.r - 18) / 44)
        },
        onComplete: () => ring.destroy(),
    })
}

function makeDot(scene: Phaser.Scene, x: number, y: number) {
    return scene.add.circle(x, y, 22, C.butter).setStrokeStyle(5, C.line, 1).setDepth(DEPTH.dot + 1)
}

export const fingerDot = (scene: Phaser.Scene, x: number, y: number) => makeDot(scene, x, y).setScale(0.72)

export async function tapAt(scene: Phaser.Scene, x: number, y: number) {
    const dot = makeDot(scene, x, y).setAlpha(0)
    await FX.to(scene, dot, { alpha: 1 }, { duration: 200 })
    await FX.wait(scene, 240)
    await FX.to(scene, dot, { scale: 0.68 }, { duration: 130 })
    ripple(scene, x, y)
    ripple(scene, x, y, 120)
    await FX.to(scene, dot, { scale: 1 }, { duration: 130 })
    await FX.to(scene, dot, { alpha: 0 }, { duration: 160 })
    dot.destroy()
}

export function hint(scene: Phaser.Scene, x: number, y: number): () => void {
    const dot = makeDot(scene, x, y).setAlpha(0)
    let beat: Phaser.Time.TimerEvent | undefined
    const press = () => {
        scene.tweens.add({ targets: dot, scale: 0.68, duration: 130, yoyo: true })
        ripple(scene, x, y)
    }
    const start = scene.time.delayedCall(450, () => {
        dot.setAlpha(1)
        press()
        beat = scene.time.addEvent({ delay: 900, loop: true, callback: press })
    })
    return () => {
        start.remove()
        beat?.remove()
        scene.tweens.killTweensOf(dot)
        dot.destroy()
    }
}
