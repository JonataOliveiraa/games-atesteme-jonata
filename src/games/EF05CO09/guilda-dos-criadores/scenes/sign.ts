import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Sign {
    show(text: string, y?: number): Promise<void>
    hide(): void
    destroy(): void
}

/**
 * A PLAQUINHA ÂMBAR — QUE DIZ QUAL PEÇA FALHOU, NUNCA QUAL É A CERTA
 *
 * Âmbar, e não vermelho: acerto é verde e erro é âmbar em todo o catálogo. Ela
 * nomeia o problema em uma linha e aponta para o VERSO, que é onde a resposta
 * está escrita — não para a bandeja, que é onde ela seria dada.
 */
export function createSign(scene: Phaser.Scene): Sign {
    const container = scene.add.container(W / 2, 250).setDepth(DEPTH.sign).setAlpha(0)
    const g = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', {
            fontFamily: FONT,
            fontSize: `${SIZE.sign}px`,
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: 560 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    container.add([g, label])

    const paint = () => {
        const w = Math.max(label.width + 56, 260)
        const h = label.height + 34
        g.clear()
        g.fillStyle(C.shadow, 0.18)
        g.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, 14)
        g.fillStyle(C.amberSoft, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
        g.lineStyle(4, C.amber, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14)
    }

    return {
        async show(text, y = 250) {
            label.setText(text)
            paint()
            container.setPosition(W / 2, y).setAlpha(0).setScale(0.86)
            await FX.to(scene, fx(container), { alpha: 1, scale: 1 },
                { duration: 280, ease: 'Back.easeOut' })
        },

        hide() {
            void FX.to(scene, fx(container), { alpha: 0, scale: 0.9 }, { duration: 200 })
        },

        destroy() {
            container.destroy()
        },
    }
}
