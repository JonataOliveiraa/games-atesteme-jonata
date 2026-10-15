import Phaser from 'phaser'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { W } from '../data/layout'
import { C } from '../data/theme'
import type { Rect } from '../types'

const TEXT_SIZE = 30
const BALLOON_W = 300

export const spot = (r: Rect, pad = 0): Pick<TutorialStep, 'shape' | 'x' | 'y' | 'w' | 'h'> => ({
    shape: 'rect',
    x: r.x,
    y: r.y,
    w: r.w + pad * 2,
    h: r.h + pad * 2,
})

export function beside(r: Rect, pad = 0): Pick<TutorialStep, 'balloonX' | 'balloonY'> {
    const left = r.x - r.w / 2 - pad
    const right = r.x + r.w / 2 + pad
    const toRight = W - right >= left
    return { balloonX: toRight ? (right + W) / 2 : left / 2, balloonY: r.y - 40 }
}

export const around = (r: Rect, pad = 10) => ({ ...spot(r, pad), ...beside(r, pad) })

export function teach(scene: Phaser.Scene, key: string, steps: TutorialStep[]): Promise<void> {
    return new Promise(resolve => {
        createTutorial(scene, {
            key,
            steps,
            once: false,
            textSize: TEXT_SIZE,
            balloonWidth: BALLOON_W,
            accent: C.accentDark,
            safeTop: 100,
            onFinish: () => resolve(),
        })
    })
}
