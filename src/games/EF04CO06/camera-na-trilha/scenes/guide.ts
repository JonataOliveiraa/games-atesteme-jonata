import Phaser from 'phaser'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
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
            accent: C.accent,
            safeTop: 90,
            onFinish: () => resolve(),
        })
    })
}
