import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, H, SIGN, W, XRAY } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Sign {
    /** Mostra a fala da peça e só resolve quando ela sai — por toque ou por tempo. */
    show(text: string, at: number): Promise<void>
    destroy(): void
}

export function createSign(scene: Phaser.Scene): Sign {
    const root = scene.add.container(W / 2, SIGN.cy).setDepth(DEPTH.sign).setAlpha(0).setVisible(false)

    const plate = scene.add.graphics()
    root.add(plate)

    const label = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.sign}px`,
            color: CSS.amber,
            align: 'center',
            wordWrap: { width: SIGN.maxW },
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(label)

    const catcher = scene.add
        .zone(W / 2, H / 2, W, H)
        .setOrigin(0.5)
        .setDepth(DEPTH.sign - 1)
        .setInteractive()
    if (catcher.input) catcher.input.enabled = false

    let close: (() => void) | undefined

    catcher.on('pointerdown', () => close?.())

    let plateW: number = SIGN.maxW

    function paint() {
        const w = Math.min(SIGN.maxW, label.width) + SIGN.padX * 2
        const h = Math.max(SIGN.h, label.height + 32)
        plateW = w
        plate.clear()
        plate.fillStyle(C.shadow, 0.34)
        plate.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 22)
        plate.fillStyle(C.amber, 1)
        plate.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        plate.fillStyle(C.white, 0.24)
        plate.fillRoundedRect(-w / 2 + 7, -h / 2 + 6, w - 14, h * 0.32, 16)
    }

    return {
        show: (text, at) => {
            label.setText(text)
            paint()

            const half = plateW / 2 + 12
            const x = Phaser.Math.Clamp(at, XRAY.x + half, XRAY.x + XRAY.w - half)

            root.setVisible(true).setAlpha(0).setScale(0.84).setPosition(x, SIGN.cy - 46)
            if (catcher.input) catcher.input.enabled = true

            void FX.to(scene, root, { alpha: 1, scale: 1, y: SIGN.cy }, { duration: 300, ease: Ease.back(2) })

            return new Promise<void>(resolve => {
                let done = false
                const timer = scene.time.delayedCall(SIGN.holdMs, () => close?.())

                close = () => {
                    if (done) return
                    done = true
                    close = undefined
                    timer.remove()
                    if (catcher.input) catcher.input.enabled = false
                    void FX.to(scene, root, { alpha: 0, scale: 0.9 }, { duration: 220 }).then(() => {
                        root.setVisible(false)
                        resolve()
                    })
                }

                scene.events.once('shutdown', () => {
                    if (!done) {
                        done = true
                        timer.remove()
                        resolve()
                    }
                })
            })
        },

        destroy: () => {
            close?.()
            FX.kill(scene, root)
            FX.kill(scene, fx(label))
            catcher.destroy()
            root.destroy(true)
        },
    }
}
