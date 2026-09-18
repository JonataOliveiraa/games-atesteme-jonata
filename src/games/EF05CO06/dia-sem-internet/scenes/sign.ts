import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { ASK, BTN, DEPTH, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Sign {
    show(text: string, x: number, y: number): Promise<void>
    cheer(text: string, x: number, y: number): Promise<void>
    destroy(): void
}

const PAD = 24
const MAX_W = 470

/**
 * O pedido manda em cima, os botões mandam embaixo.
 *
 * A plaquinha recebe coordenadas de TELA (a GameScene converte o ponto do
 * mundo), e tem de caber na faixa livre entre os dois.
 */
const TOP_LIMIT = ASK.cy + ASK.h / 2 + 14
const BOTTOM_LIMIT = BTN.cy - BTN.h / 2 - 14

export function createSign(scene: Phaser.Scene): Sign {
    const root = scene.add.container(0, 0).setScrollFactor(0)
.setDepth(DEPTH.sign).setAlpha(0)
    const back = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.sign}px`,
            color: CSS.amberInk,
            align: 'center',
            wordWrap: { width: MAX_W },
            lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add([back, label])

    const paint = (color: number, ink: string, tailDown: boolean) => {
        const w = Math.max(230, label.width + PAD * 2)
        const h = label.height + PAD * 1.4
        label.setColor(ink)
        back.clear()
        back.fillStyle(C.shadow, 0.22)
        back.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 15)
        back.fillStyle(C.navy, 1)
        back.fillRoundedRect(-w / 2, -h / 2, w, h, 15)
        back.fillStyle(color, 1)
        back.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 11)
        const ty = tailDown ? h / 2 : -h / 2
        const dir = tailDown ? 1 : -1
        back.fillStyle(color, 1)
        back.fillTriangle(-15, ty - dir * 2, 15, ty - dir * 2, 0, ty + dir * 16)
        return h
    }

    const pop = async (text: string, x: number, y: number, color: number, ink: string, hold: number) => {
        label.setText(text)
        const tailDown = y > 400
        const h = paint(color, ink, tailDown)
        const half = Math.max(230, label.width + PAD * 2) / 2
        const cy = y + (tailDown ? -h / 2 - 96 : h / 2 + 96)
        root.setPosition(
            Phaser.Math.Clamp(x, half + 20, W - half - 20),
            Phaser.Math.Clamp(cy, TOP_LIMIT + h / 2, BOTTOM_LIMIT - h / 2),
        )

        root.setAlpha(0).setScale(0.8)
        await FX.to(scene, fx(root), { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
        await FX.wait(scene, hold)
        await FX.to(scene, fx(root), { alpha: 0, scale: 0.92 }, { duration: 190 })
    }

    return {
        show: (text, x, y) => pop(text, x, y, C.amber, CSS.amberInk, 1800),
        cheer: (text, x, y) => pop(text, x, y, C.cream, CSS.navy, 1400),
        destroy: () => {
            FX.kill(scene, fx(root))
            root.destroy()
        },
    }
}
