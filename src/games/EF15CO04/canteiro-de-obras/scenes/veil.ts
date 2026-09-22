import type Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { H, NEAR, W } from '../data/layout'
import { A, C } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Spot {
    x: number
    y: number
    w: number
    h: number
}

export interface Veil {
    /** Escurece a sala. Sem alvo, o escuro é inteiro. */
    open(spot?: Spot): Promise<void>
    /** A luz ESCORREGA até o alvo novo. Nunca corta. */
    focus(spot: Spot): Promise<void>
    close(): Promise<void>
    destroy(): void
}

const PAD = 18
const RADIUS = 18

/**
 * O escuro do guia, com o toque passando no meio: um `Graphics` sem
 * `setInteractive` é pintura, não porta. São quatro faixas em volta do buraco,
 * e não uma máscara — mesmo resultado, sem textura e sem segunda câmera.
 */
export function createVeil(
    scene: Phaser.Scene,
    { depth, alpha = A.veil }: { depth: number; alpha?: number },
): Veil {
    const dark = scene.add.graphics().setDepth(depth).setAlpha(0)
    const rim = scene.add.graphics().setDepth(depth + 1).setAlpha(0)

    const hole = { x: NEAR.cx, y: NEAR.cy, w: 10, h: 10 }

    const paint = () => {
        const { x, y, w, h } = hole
        const l = x - w / 2
        const r = x + w / 2
        const t = y - h / 2
        const b = y + h / 2

        dark.clear()
        dark.fillStyle(C.shadow, 1)
        dark.fillRect(0, 0, W, Math.max(0, t))
        dark.fillRect(0, Math.min(H, b), W, Math.max(0, H - b))
        dark.fillRect(0, t, Math.max(0, l), Math.max(0, h))
        dark.fillRect(r, t, Math.max(0, W - r), Math.max(0, h))

        rim.clear()
        if (w < 4 || h < 4) return
        rim.lineStyle(3, C.gold, 0.55)
        rim.strokeRoundedRect(l, t, w, h, RADIUS)
    }

    const measure = (spot: Spot) => ({
        x: spot.x,
        y: spot.y,
        w: spot.w + PAD * 2,
        h: spot.h + PAD * 2,
    })

    paint()

    return {
        async open(spot) {
            Object.assign(hole, spot ? measure(spot) : { x: NEAR.cx, y: NEAR.cy, w: 0, h: 0 })
            paint()
            await FX.all(
                FX.to(scene, fx(dark), { alpha }, { duration: 320 }),
                FX.to(scene, fx(rim), { alpha: 1 }, { duration: 320 }),
            )
        },

        focus(spot) {
            const target = measure(spot)
            return new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: hole,
                    ...target,
                    duration: FX.ms(scene, 460),
                    ease: 'Sine.easeInOut',
                    onUpdate: paint,
                    onComplete: () => {
                        paint()
                        resolve()
                    },
                })
            })
        },

        async close() {
            await FX.all(
                FX.to(scene, fx(dark), { alpha: 0 }, { duration: 260 }),
                FX.to(scene, fx(rim), { alpha: 0 }, { duration: 260 }),
            )
        },

        destroy() {
            dark.destroy()
            rim.destroy()
        },
    }
}
