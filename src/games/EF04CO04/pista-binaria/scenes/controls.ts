import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUTTON, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Bit } from '../types'
import { paintFilled, paintHole, paintPanel } from './paper'

interface ControlsOptions {
    onPick: (bit: Bit) => void
}

/**
 * Os dois botões — o jogo inteiro.
 *
 * Cada um mostra a FORMA (a mesma da caixa, pelo mesmo pincel) e o dígito ao
 * lado. É a única instrução do jogo, e ela é desenhada em vez de escrita.
 *
 * Tocar DISPARA. Não existe estado carregado: o botão pisca, a nave atira, e o
 * resultado aparece meio segundo depois.
 *
 * As zonas de toque são soltas de cena, na posição definitiva: o botão muda de
 * escala no gesto, e uma zona dentro do contêiner seria comida pela animação.
 */
export function createControls(scene: Phaser.Scene, options: ControlsOptions) {
    const zones: Phaser.GameObjects.Zone[] = []

    const build = (bit: Bit, x: number) => {
        const root = scene.add.container(x, BUTTON.y).setDepth(DEPTH.buttons)
        const face = scene.add.graphics()
        root.add(face)

        const digit = scene.add
            .text(BUTTON.digitDX, 0, String(bit), {
                fontFamily: FONT.black,
                fontSize: '70px',
                color: CSS.ink,
            })
            .setOrigin(0.5)
            .setResolution(2)
        root.add(digit)

        const paint = (hot: boolean, calling = false) => {
            face.clear()
            if (calling) {
                face.fillStyle(C.amber, 0.9)
                face.fillRoundedRect(-BUTTON.w / 2 - 12, -BUTTON.h / 2 - 12, BUTTON.w + 24, BUTTON.h + 24, 32)
            }
            paintPanel(face, 0, 0, BUTTON.w, BUTTON.h, 26, hot ? C.yellow : C.cream)
            if (bit === 1) paintFilled(face, BUTTON.shapeDX, 0, BUTTON.shape)
            else paintHole(face, BUTTON.shapeDX, 0, BUTTON.shape)
        }
        paint(false)

        const zone = scene.add
            .zone(x, BUTTON.y, BUTTON.w, BUTTON.h)
            .setOrigin(0.5)
            .setDepth(DEPTH.buttons + 1)
            .setInteractive({ useHandCursor: true })
        zones.push(zone)

        zone.on('pointerdown', () => {
            if (!zone.input?.enabled) return
            FX.press(scene, root)
            options.onPick(bit)
        })

        return { root, paint, zone }
    }

    const one = build(1, BUTTON.oneX)
    const zero = build(0, BUTTON.zeroX)
    const of = (bit: Bit) => (bit === 1 ? one : zero)

    const keys = scene.input.keyboard?.addKeys('UP,DOWN,W,S,ONE,ZERO') as
        | Record<string, Phaser.Input.Keyboard.Key>
        | undefined
    const onKey = (bit: Bit) => () => {
        if (!one.zone.input?.enabled) return
        options.onPick(bit)
    }
    keys?.UP?.on('down', onKey(1))
    keys?.W?.on('down', onKey(1))
    keys?.ONE?.on('down', onKey(1))
    keys?.DOWN?.on('down', onKey(0))
    keys?.S?.on('down', onKey(0))
    keys?.ZERO?.on('down', onKey(0))

    return {
        setEnabled(value: boolean) {
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = value
            })
        },

        /** O clarão do disparo, 120 ms. */
        flash(bit: Bit) {
            const target = of(bit)
            target.paint(true)
            scene.time.delayedCall(140, () => target.paint(false))
        },

        /** Na trava, o botão certo chama: moldura âmbar e pulso. Não se esconde. */
        pulse(bit: Bit) {
            const target = of(bit)
            target.paint(false, true)
            FX.kill(scene, target.root)
            scene.tweens.add({
                targets: target.root,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 360,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        hush() {
            FX.kill(scene, one.root)
            FX.kill(scene, zero.root)
            one.root.setScale(1)
            zero.root.setScale(1)
            one.paint(false)
            zero.paint(false)
        },

        /** Some no fim da fase: a máquina cresce e ocupa a tela. */
        async hide() {
            this.setEnabled(false)
            await FX.all(
                FX.to(scene, one.root, { alpha: 0, y: BUTTON.y + 60 }, { duration: 260 }),
                FX.to(scene, zero.root, { alpha: 0, y: BUTTON.y + 60 }, { duration: 260 }),
            )
        },

        destroy() {
            keys?.UP?.removeAllListeners()
            keys?.W?.removeAllListeners()
            keys?.ONE?.removeAllListeners()
            keys?.DOWN?.removeAllListeners()
            keys?.S?.removeAllListeners()
            keys?.ZERO?.removeAllListeners()
            zones.forEach(zone => zone.destroy())
            one.root.destroy(true)
            zero.root.destroy(true)
        },
    }
}

export type Controls = ReturnType<typeof createControls>
