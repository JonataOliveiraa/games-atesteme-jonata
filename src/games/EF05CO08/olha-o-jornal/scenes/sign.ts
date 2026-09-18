import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Sign {
    show(text: string, x: number, y: number): Promise<void>
    hide(): void
    destroy(): void
}

/** A plaquinha âmbar. Fala do jornal ESCOLHIDO, nunca do outro, e nunca dá a resposta. */
export function createSign(scene: Phaser.Scene): Sign {
    const container = scene.add.container(W / 2, 0).setDepth(DEPTH.sign).setAlpha(0)
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

    let boxW = 280

    const paint = () => {
        const w = Math.max(280, label.width + 64)
        const h = label.height + 44
        boxW = w
        g.clear()
        g.fillStyle(C.shadow, 0.28)
        g.fillRect(-w / 2 + 5, -h / 2 + 7, w, h)
        g.fillStyle(C.amberSoft, 1)
        g.fillRect(-w / 2, -h / 2, w, h)
        g.lineStyle(5, C.amber, 1)
        g.strokeRect(-w / 2, -h / 2, w, h)
    }

    return {
        async show(text, x, y) {
            label.setText(text)
            paint()
            /* Clampa pela largura REAL da plaquinha — texto longo encostava na borda. */
            const margin = boxW / 2 + 24
            container
                .setPosition(Phaser.Math.Clamp(x, margin, W - margin), y)
                .setAlpha(0)
                .setScale(0.86)
            await FX.to(scene, fx(container), { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        hide() {
            void FX.to(scene, fx(container), { alpha: 0 }, { duration: 180 })
        },
        destroy() {
            container.destroy()
        },
    }
}
