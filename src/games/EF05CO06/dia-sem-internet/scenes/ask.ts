import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { ASK, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * O PEDIDO — a única frase da tela, e a primeira coisa que a criança lê.
 *
 * Uma linha, 46 px, sem balão de NPC e sem parágrafo. Se a frase não couber
 * numa linha, ela está comprida demais e o dado é que precisa mudar.
 */
export interface Ask {
    say(text: string): Promise<void>
    point(): { x: number; y: number }
    nudge(): void
    /** Sai de cena quando a câmera manda — ver scenes/cinema.ts. */
    setShown(on: boolean): void
    destroy(): void
}

export function createAsk(scene: Phaser.Scene): Ask {
    const root = scene.add.container(ASK.cx, ASK.cy).setScrollFactor(0)
.setDepth(DEPTH.ask)

    const box = scene.add.graphics()
    box.fillStyle(C.shadow, 0.18)
    box.fillRoundedRect(-ASK.w / 2 + 3, -ASK.h / 2 + 7, ASK.w, ASK.h, 22)
    box.fillStyle(C.navy, 1)
    box.fillRoundedRect(-ASK.w / 2, -ASK.h / 2, ASK.w, ASK.h, 22)
    box.fillStyle(C.creamSoft, 1)
    box.fillRoundedRect(-ASK.w / 2 + 7, -ASK.h / 2 + 7, ASK.w - 14, ASK.h - 14, 16)
    root.add(box)

    const label = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.ask}px`,
            color: CSS.navy,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(label)

    return {
        say: async text => {
            label.setScale(1).setText(text)
            if (label.width > ASK.w - 60) label.setScale((ASK.w - 60) / label.width)

            // o pop vai no BOX e o fade no LABEL, nunca no root: o root é do
            // setShown, e um FX.kill dele no meio de um await trava o jogo
            label.setAlpha(0)
            void FX.to(scene, fx(box), { scaleX: 1.03, scaleY: 1.06 }, { duration: 150, yoyo: true })
            await FX.to(scene, fx(label), { alpha: 1 }, { duration: 240 })
        },

        point: () => ({ x: ASK.cx, y: ASK.cy }),

        setShown: on => {
            FX.kill(scene, fx(root))
            scene.tweens.add({ targets: root, alpha: on ? 1 : 0, duration: 260, ease: "Sine.easeInOut" })
        },

        nudge: () => {
            void FX.to(scene, fx(box), { scaleX: 1.04, scaleY: 1.08 }, { duration: 200, yoyo: true })
        },

        destroy: () => {
            FX.kill(scene, fx(root))
            root.destroy()
        },
    }
}
