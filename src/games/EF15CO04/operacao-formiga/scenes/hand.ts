import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HAND } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'

/**
 * O dedo da demonstração: uma bolinha que afunda e solta ondinhas. Mora na
 * tela (não no mundo), porque o que ela aperta são o joystick e o ✓, e o
 * traço do corte é desenhado em coordenadas de tela.
 */
export interface Hand {
    press(at: Vec, hold?: boolean): Promise<void>
    /** Desce em `from`, arrasta até `to` e sobe. `onMove` recebe a ponta a cada quadro. */
    swipe(from: Vec, to: Vec, ms: number, onMove?: (at: Vec) => void): Promise<void>
    moveTo(at: Vec, ms: number): Promise<void>
    lift(): Promise<void>
    hide(): void
    destroy(): void
}

export function createHand(scene: Phaser.Scene): Hand {
    const shade = scene.add.circle(3, 5, HAND.r, C.shadow, 0.22)
    const face = scene.add.circle(0, 0, HAND.r, C.white, 0.92).setStrokeStyle(HAND.stroke, C.accent, 1)
    const core = scene.add.circle(0, 0, HAND.r * 0.42, C.accent, 1)
    const dot = scene.add.container(0, 0, [shade, face, core]).setDepth(DEPTH.hand).setVisible(false)
    let ring: Phaser.Time.TimerEvent | undefined

    const ripple = (at: Vec) => {
        const g = scene.add.circle(at.x, at.y, HAND.r, C.white, 0).setDepth(DEPTH.hand - 1)
        g.setStrokeStyle(HAND.wave, C.white, 0.95)
        scene.tweens.add({ targets: g, scale: HAND.spread, alpha: 0, duration: 720, ease: 'Sine.easeOut', onComplete: () => g.destroy() })
    }

    const tap = () => {
        scene.tweens.killTweensOf(dot)
        dot.setScale(1)
        scene.tweens.add({ targets: dot, scale: 0.82, duration: 110, yoyo: true })
        ripple({ x: dot.x, y: dot.y })
    }

    const hide = () => {
        ring?.remove()
        ring = undefined
        scene.tweens.killTweensOf(dot)
        dot.setVisible(false).setScale(1).setAlpha(1)
    }

    const appear = async (at: Vec) => {
        hide()
        dot.setPosition(at.x, at.y).setVisible(true).setAlpha(0).setScale(1.4)
        await FX.to(scene, dot, { alpha: 1, scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
    }

    const hand: Hand = {
        async press(at, hold = false) {
            await appear(at)
            tap()
            if (hold) {
                ring = scene.time.addEvent({ delay: 620, loop: true, callback: tap })
                return
            }
            await FX.wait(scene, 360)
            await hand.lift()
        },
        async swipe(from, to, ms, onMove) {
            await appear(from)
            await FX.to(scene, dot, { scale: 0.82 }, { duration: 110 })
            const t = { v: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: t,
                    v: 1,
                    duration: ms,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const at = { x: from.x + (to.x - from.x) * t.v, y: from.y + (to.y - from.y) * t.v }
                        dot.setPosition(at.x, at.y)
                        onMove?.(at)
                    },
                    onComplete: () => resolve(),
                })
            })
            await FX.to(scene, dot, { scale: 1 }, { duration: 110 })
            await hand.lift()
        },
        async moveTo(at, ms) {
            if (!dot.visible) {
                await appear(at)
                return
            }
            await FX.to(scene, dot, { x: at.x, y: at.y }, { duration: ms, ease: 'Sine.easeInOut' })
        },
        async lift() {
            ring?.remove()
            ring = undefined
            if (!dot.visible) return
            scene.tweens.killTweensOf(dot)
            await FX.to(scene, dot, { alpha: 0, scale: 1.3 }, { duration: 220 })
            dot.setVisible(false).setScale(1)
        },
        hide,
        destroy() {
            hide()
            dot.destroy()
        },
    }
    return hand
}
