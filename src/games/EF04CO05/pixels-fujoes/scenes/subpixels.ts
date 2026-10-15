import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, U } from '../data/layout'
import { C } from '../data/theme'
import { ptext } from './art'
import type { Rect } from './guide'
import { bakePanel } from './pixelart'

/**
 * A lupa do N2: um pixel amarelo de perto se abre em três luzinhas — vermelha e verde acesas, azul apagada —
 * e cada uma ganha o seu número (1 1 0). É assim que uma tela de verdade faz cor.
 */
export interface Subpixels {
    show(): Promise<void>
    hide(): Promise<void>
    /** o 1 1 0 pula um por um, junto com os números do cartão do amarelo */
    wave(): Promise<void>
    rect(): Rect
    destroy(): void
}

const X = 640
const Y = 352
const PANEL = { w: 480, h: 260 }
const SQUARE = 96
const BAR = { w: 40, h: 96, gap: 16 }
const DIGIT_Y = 72
const WAVE_GAP = 260

export function createSubpixels(scene: Phaser.Scene): Subpixels {
    const plate = scene.add.image(0, 0, bakePanel(scene, 'lupa', PANEL.w / U, PANEL.h / U, { fill: C.panel, light: C.panelLight, shade: C.panelDark, inner: C.rim })).setScale(U)
    const square = scene.add.image(-PANEL.w / 2 + 110, -14, bakePanel(scene, 'lupa-pixel', SQUARE / U, SQUARE / U, { fill: C.lit, light: C.litLight, shade: C.litShade })).setScale(U)
    const arrow = ptext(scene, -PANEL.w / 2 + 196, -14, '=', 4, 'soft')
    const lights = [
        { fill: C.red, light: 0xff9a9a, shade: 0xc43a3a, on: '1', tone: 'red' as const },
        { fill: C.green, light: 0xa6f2ae, shade: 0x2fa842, on: '1', tone: 'green' as const },
        { fill: 0x1d2650, light: 0x2b3870, shade: 0x141a38, on: '0', tone: 'soft' as const },
    ]
    const left0 = -PANEL.w / 2 + 250
    const bars = lights.map((l, i) => {
        const x = left0 + i * (BAR.w + BAR.gap) + BAR.w / 2
        const bar = scene.add.image(x, -14, bakePanel(scene, `lupa-luz-${i}`, BAR.w / U, BAR.h / U, { fill: l.fill, light: l.light, shade: l.shade })).setScale(U)
        const digit = ptext(scene, x, DIGIT_Y, l.on, 5, l.tone)
        return { bar, digit, x }
    })
    const root = scene.add
        .container(X, Y, [plate, square, arrow, ...bars.flatMap(b => [b.bar, b.digit])])
        .setDepth(DEPTH.banner)
        .setVisible(false)

    return {
        async show() {
            root.setVisible(true).setAlpha(1)
            ;[square, arrow, ...bars.flatMap(b => [b.bar, b.digit])].forEach(o => o.setAlpha(0))
            await FX.popIn(scene, root, { from: 0.7, duration: 320 })
            await FX.to(scene, square, { alpha: 1 }, { duration: 200 })
            await FX.wait(scene, 350)
            arrow.setAlpha(1)
            await FX.all(
                ...bars.map((b, i) => {
                    b.bar.setX(square.x).setAlpha(1)
                    return FX.to(scene, b.bar, { x: b.x }, { duration: 420, delay: i * 120 })
                }),
            )
            await FX.all(...bars.map((b, i) => FX.wait(scene, i * 160).then(() => FX.popIn(scene, b.digit, { from: 0.4, duration: 260 }))))
        },
        async hide() {
            await FX.to(scene, root, { alpha: 0 }, { duration: 220 })
            root.setVisible(false)
        },
        async wave() {
            await FX.all(
                ...bars.map((b, i) =>
                    FX.wait(scene, i * WAVE_GAP).then(() =>
                        FX.to(scene, b.digit, { y: DIGIT_Y - 14, scale: 1.3 }, { duration: 170, yoyo: true, ease: 'Sine.easeOut' }),
                    ),
                ),
            )
        },
        rect: () => ({ x: X, y: Y, w: PANEL.w + 20, h: PANEL.h + 20 }),
        destroy() {
            root.destroy()
        },
    }
}
