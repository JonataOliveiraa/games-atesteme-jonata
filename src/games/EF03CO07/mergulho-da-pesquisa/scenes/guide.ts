import Phaser from 'phaser'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

export type Rect = { x: number; y: number; w: number; h: number }

const TEXT_SIZE = 30

export const spot = (r: Rect): Pick<TutorialStep, 'shape' | 'x' | 'y' | 'w' | 'h'> => ({
    shape: 'rect',
    x: r.x,
    y: r.y,
    w: r.w,
    h: r.h,
})

export const union = (a: Rect, b: Rect): Rect => {
    const left = Math.min(a.x - a.w / 2, b.x - b.w / 2)
    const right = Math.max(a.x + a.w / 2, b.x + b.w / 2)
    const top = Math.min(a.y - a.h / 2, b.y - b.h / 2)
    const bottom = Math.max(a.y + a.h / 2, b.y + b.h / 2)
    return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
}

export function teach(scene: Phaser.Scene, key: string, steps: TutorialStep[]): Promise<void> {
    return new Promise(resolve => {
        createTutorial(scene, {
            key,
            steps,
            once: false,
            textSize: TEXT_SIZE,
            accent: C.blueDark,
            safeTop: 90,
            onFinish: () => resolve(),
        })
    })
}

export function beckon(scene: Phaser.Scene, r: Rect, round = false): () => void {
    const radius = round ? Math.min(r.w, r.h) / 2 : 24
    const g = scene.add.graphics({ x: r.x, y: r.y }).setScrollFactor(0).setDepth(DEPTH.controls + 5)
    g.lineStyle(7, C.lemon, 1)
    g.strokeRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, radius)
    const pulse = scene.tweens.add({ targets: g, scale: 1.08, alpha: 0.5, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    return () => {
        pulse.stop()
        g.destroy()
    }
}
