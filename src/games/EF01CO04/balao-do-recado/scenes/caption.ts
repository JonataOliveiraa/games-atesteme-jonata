import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAPTION, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface Caption {
    show(text: string): Promise<void>
    hide(): void
    destroy(): void
}

export function createCaption(scene: Phaser.Scene): Caption {
    const bg = scene.add.graphics()
    const label = scene.add
        .text(0, 1, '', { fontFamily: FONT.black, fontSize: `${CAPTION.size}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const container = scene.add.container(CAPTION.x, CAPTION.y, [bg, label]).setDepth(DEPTH.card).setVisible(false)

    const paint = () => {
        label.setFontSize(CAPTION.size)
        const room = CAPTION.maxW - CAPTION.pad * 2
        if (label.width > room) label.setFontSize(Math.max(20, Math.floor((CAPTION.size * room) / label.width)))
        const w = Math.min(CAPTION.maxW, label.width + CAPTION.pad * 2)
        const h = CAPTION.h
        bg.clear()
        bg.fillStyle(C.shadow, 0.16)
        bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
        bg.fillStyle(C.white, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        bg.lineStyle(4, C.ink, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    return {
        async show(text) {
            FX.kill(scene, container)
            label.setText(text)
            paint()
            container.setVisible(true).setAlpha(1).setScale(1)
            await FX.popIn(scene, container, { from: 0.6 })
        },
        hide() {
            if (!container.visible) return
            FX.kill(scene, container)
            void FX.to(scene, container, { alpha: 0, scale: 0.85 }, { duration: 180 }).then(() => {
                if (container.active) container.setVisible(false).setAlpha(1).setScale(1)
            })
        },
        destroy() {
            FX.kill(scene, container)
            container.destroy()
        },
    }
}
