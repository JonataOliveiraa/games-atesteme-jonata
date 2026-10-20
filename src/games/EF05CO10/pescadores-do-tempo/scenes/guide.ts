import Phaser from 'phaser'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { DEPTH, HEADER, TAP } from '../data/layout'
import { C } from '../data/theme'
import type { Rect, Vec } from '../types'

export function teach(scene: Phaser.Scene, key: string, steps: TutorialStep[]) {
    return new Promise<void>(resolve => {
        createTutorial(scene, {
            key,
            steps,
            accent: C.time,
            once: false,
            safeTop: HEADER.h + 8,
            textSize: 30,
            onFinish: () => resolve(),
        })
    })
}

export const spot = (r: Rect) => ({ shape: 'rect' as const, x: r.x + r.w / 2, y: r.y + r.h / 2, w: r.w, h: r.h })

export const union = (a: Rect, b: Rect): Rect => {
    const x = Math.min(a.x, b.x)
    const y = Math.min(a.y, b.y)
    return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }
}

export interface Tap {
    readonly on: boolean
    follow(get: () => Vec | null): void
    stop(): void
    destroy(): void
}

export function createTap(scene: Phaser.Scene): Tap {
    const shade = scene.add.circle(3, 5, TAP.r, C.shadow, 0.22)
    const face = scene.add.circle(0, 0, TAP.r, C.white, 0.92).setStrokeStyle(TAP.stroke, C.time, 1)
    const core = scene.add.circle(0, 0, TAP.r * 0.42, C.time, 1)
    const dot = scene.add.container(0, 0, [shade, face, core]).setDepth(DEPTH.tap).setVisible(false)
    let ring: Phaser.Time.TimerEvent | undefined
    let target: (() => Vec | null) | null = null

    const place = () => {
        const at = target?.()
        if (!at) return
        dot.setPosition(at.x, at.y)
    }
    scene.events.on('update', place)

    const ripple = () => {
        const g = scene.add.circle(dot.x, dot.y, TAP.r, C.white, 0).setDepth(DEPTH.tap - 1)
        g.setStrokeStyle(TAP.wave, C.white, 0.95)
        scene.tweens.add({ targets: g, scale: TAP.spread, alpha: 0, duration: 720, ease: 'Sine.easeOut', onComplete: () => g.destroy() })
    }
    const tap = () => {
        scene.tweens.killTweensOf(dot)
        dot.setScale(1)
        scene.tweens.add({ targets: dot, scale: 0.82, duration: 110, yoyo: true })
        ripple()
    }
    const stop = () => {
        ring?.remove()
        ring = undefined
        target = null
        scene.tweens.killTweensOf(dot)
        dot.setVisible(false).setScale(1)
    }
    return {
        get on() {
            return target !== null
        },
        follow(get) {
            stop()
            target = get
            place()
            dot.setVisible(true).setAlpha(1)
            tap()
            ring = scene.time.addEvent({ delay: 760, loop: true, callback: tap })
        },
        stop,
        destroy() {
            stop()
            scene.events.off('update', place)
            dot.destroy()
        },
    }
}
