import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface Prompt {
    show(text: string, at: { left: number; top: number; zoom: number }, font: number, below: number): Promise<void>
    hide(): void
    destroy(): void
}

const PAD_X = 26
const PAD_Y = 14
const MARGIN = 16

export function createPrompt(scene: Phaser.Scene): Prompt {
    let box: Phaser.GameObjects.Container | null = null

    const hide = () => {
        if (!box) return
        const old = box
        box = null
        void FX.to(scene, old, { alpha: 0 }, { duration: 200 }).then(() => old.destroy())
    }

    return {
        async show(text, at, font, below) {
            hide()
            const label = scene.add
                .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${font}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const w = label.width + PAD_X * 2
            const h = label.height + PAD_Y * 2
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.25)
            g.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2)
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.lineStyle(5, C.yellow, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.lineStyle(3, C.ink, 1)
            g.strokeRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, h / 2 + 3)
            const scale = 1 / at.zoom
            box = scene.add
                .container(at.left + (w / 2 + MARGIN) * scale, at.top + (h / 2 + below) * scale, [g, label])
                .setDepth(DEPTH.balloon + 3)
                .setScale(scale)
            await FX.popIn(scene, box, { from: 0.5 })
        },
        hide,
        destroy() {
            box?.destroy()
            box = null
        },
    }
}
