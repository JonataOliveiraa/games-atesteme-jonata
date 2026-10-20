import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, TOUCH } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'
import type { View } from './view'

/**
 * O toque que o jogo mostra, sem mão: uma bolinha amarela de contorno marrom
 * (o mesmo anel do plugue solto) que afunda e solta ondinhas onde é para
 * tocar, e que leva o plugue (ou o aparelho sem cabo) quando o gesto é puxar.
 * Ela mora no mapa, então acompanha o zoom da câmera.
 */
export interface Touch {
    /** Aparece no ponto, afunda e leva até o destino; `onMove` recebe cada ponto do caminho. */
    drag(from: Vec, to: Vec, ms: number, onMove?: (at: Vec) => void): Promise<void>
    /** Toca no ponto sem parar, até `stop()`. */
    tapLoop(at: Vec): void
    stop(): void
    destroy(): void
}

export function createTouch(scene: Phaser.Scene, view: View): Touch {
    const art = scene.add.graphics()
    art.fillStyle(C.shadow, 0.22)
    art.fillCircle(2, 5, TOUCH.r + 3)
    art.fillStyle(C.headerLine, 1)
    art.fillCircle(0, 0, TOUCH.r + 3)
    art.fillStyle(C.accentYellow, 1)
    art.fillCircle(0, 0, TOUCH.r - 2)
    art.fillStyle(C.white, 0.85)
    art.fillCircle(-TOUCH.r * 0.32, -TOUCH.r * 0.32, TOUCH.r * 0.28)
    const dot = view.world(scene.add.container(0, 0, [art]).setDepth(DEPTH.touch).setVisible(false))

    const waves = new Set<Phaser.GameObjects.Graphics>()
    let loop: Phaser.Time.TimerEvent | undefined
    let loopAt: Vec | null = null

    /**
     * Uma ondinha saindo do ponto do toque: amarela com borda marrom, para ler
     * em cima de aparelho claro e de chão creme. O raio cresce e a linha não engrossa.
     */
    const ripple = (at: Vec, delay = 0, big = 1) => {
        const g = view.world(scene.add.graphics().setDepth(DEPTH.touch - 1).setPosition(at.x, at.y).setVisible(false))
        waves.add(g)
        const k = { t: 0 }
        scene.tweens.add({
            targets: k,
            t: 1,
            delay: FX.ms(scene, delay),
            duration: FX.ms(scene, 620),
            ease: 'Sine.easeOut',
            onStart: () => {
                if (g.active) g.setVisible(true)
            },
            onUpdate: () => {
                if (!g.active) return
                const r = TOUCH.r * (1 + (TOUCH.reach * big - 1) * k.t)
                const a = 1 - k.t
                g.clear()
                g.lineStyle(TOUCH.wave + 4, C.headerLine, 0.75 * a)
                g.strokeCircle(0, 0, r)
                g.lineStyle(TOUCH.wave, C.accentYellow, a)
                g.strokeCircle(0, 0, r)
            },
            onComplete: () => {
                waves.delete(g)
                g.destroy()
            },
        })
    }

    /** Afunda (a bolinha encolhe), solta duas ondinhas e volta. */
    const press = (at: Vec) => {
        scene.tweens.killTweensOf(dot)
        dot.setScale(1)
        scene.tweens.add({ targets: dot, scale: 0.68, duration: FX.ms(scene, 110), ease: 'Sine.easeIn', yoyo: true, hold: FX.ms(scene, 70) })
        ripple(at, 90)
        ripple(at, 260, 0.75)
    }

    const stop = () => {
        loop?.remove()
        loop = undefined
        loopAt = null
        scene.tweens.killTweensOf(dot)
        dot.setVisible(false).setScale(1).setAlpha(1)
        waves.forEach(w => w.destroy())
        waves.clear()
    }

    return {
        async drag(from, to, ms, onMove) {
            stop()
            // O `stop()` mata os tweens da bolinha sem resolvê-los: a espera é pelo relógio.
            dot.setPosition(from.x, from.y).setVisible(true).setAlpha(0).setScale(1.4)
            void FX.to(scene, dot, { alpha: 1, scale: 1 }, { duration: 220 })
            await FX.wait(scene, 220)
            // Afunda e fica apertada enquanto leva: é o dedo segurando.
            ripple(from)
            void FX.to(scene, dot, { scale: 0.74 }, { duration: 120, ease: 'Sine.easeIn' })
            await FX.wait(scene, 120)
            const k = { t: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const at = { x: Phaser.Math.Linear(from.x, to.x, k.t), y: Phaser.Math.Linear(from.y, to.y, k.t) }
                        dot.setPosition(at.x, at.y)
                        onMove?.(at)
                    },
                    onComplete: () => resolve(),
                })
            })
            void FX.to(scene, dot, { scale: 1 }, { duration: 160, ease: 'Back.easeOut' })
        },
        tapLoop(at) {
            if (loopAt && loopAt.x === at.x && loopAt.y === at.y) return
            stop()
            loopAt = { ...at }
            dot.setPosition(at.x, at.y).setVisible(true).setAlpha(0).setScale(0.6)
            void FX.to(scene, dot, { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
            loop = scene.time.addEvent({ delay: TOUCH.every, startAt: TOUCH.every - 420, loop: true, callback: () => press(at) })
        },
        stop,
        destroy() {
            stop()
            dot.destroy()
        },
    }
}
