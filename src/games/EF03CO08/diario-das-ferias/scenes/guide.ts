import Phaser from 'phaser'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { C } from '../data/theme'

export type Rect = { x: number; y: number; w: number; h: number }

const TEXT_SIZE = 30

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

/** Anel que marca onde agir enquanto a criança faz (o guia não tem dedo). */
export interface Coach {
    ring(rect: Rect | null): void
    destroy(): void
}

export function createCoach(scene: Phaser.Scene, depth: number): Coach {
    const g = scene.add.graphics().setDepth(depth)
    const state = { t: 0 }
    let target: Rect | null = null
    const paint = () => {
        g.clear()
        if (!target) return
        const grow = 8 + Math.sin(state.t * Math.PI * 2) * 6
        g.lineStyle(7, C.butter, 1)
        g.strokeRoundedRect(target.x - target.w / 2 - grow, target.y - target.h / 2 - grow, target.w + grow * 2, target.h + grow * 2, 26)
        g.lineStyle(3, C.ink, 0.8)
        g.strokeRoundedRect(
            target.x - target.w / 2 - grow - 5,
            target.y - target.h / 2 - grow - 5,
            target.w + grow * 2 + 10,
            target.h + grow * 2 + 10,
            30,
        )
    }
    const tween = scene.tweens.add({ targets: state, t: 1, duration: 900, repeat: -1, onUpdate: paint })
    return {
        ring(rect) {
            target = rect
            paint()
        },
        destroy() {
            tween.remove()
            g.destroy()
        },
    }
}
