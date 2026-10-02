import Phaser from 'phaser'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { C } from '../data/theme'
import type { Rect } from '../types'

const TEXT_SIZE = 30

export const spot = (r: Rect): Pick<TutorialStep, 'shape' | 'x' | 'y' | 'w' | 'h'> => ({
    shape: 'rect',
    x: r.x,
    y: r.y,
    w: r.w,
    h: r.h,
})

export const tap = (r: Rect): TutorialStep['pointer'] => ({ fromX: r.x, fromY: r.y, toX: r.x, toY: r.y, tap: true })

export const union = (...rects: Rect[]): Rect => {
    const left = Math.min(...rects.map(r => r.x - r.w / 2))
    const right = Math.max(...rects.map(r => r.x + r.w / 2))
    const top = Math.min(...rects.map(r => r.y - r.h / 2))
    const bottom = Math.max(...rects.map(r => r.y + r.h / 2))
    return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
}

export function teach(scene: Phaser.Scene, key: string, steps: TutorialStep[]): Promise<void> {
    return new Promise(resolve => {
        createTutorial(scene, {
            key,
            steps,
            once: false,
            textSize: TEXT_SIZE,
            accent: C.pink,
            safeTop: 90,
            onFinish: () => resolve(),
        })
    })
}
