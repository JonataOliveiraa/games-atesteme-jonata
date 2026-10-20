import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAPTION, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'

export interface Caption {
    say(text: string, tone?: number): void
    hide(): void
    destroy(): void
}

export function createCaption(scene: Phaser.Scene): Caption {
    const g = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.caption}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const box = scene.add.container(CAPTION.x, CAPTION.y, [g, label]).setDepth(DEPTH.caption).setVisible(false)

    const hide = () => {
        scene.tweens.killTweensOf(box)
        box.setVisible(false)
    }

    return {
        say(text, tone = C.white) {
            hide()
            label.setText(text).setColor(inkOn(tone))
            const w = label.width + 70
            const h = label.height + 26
            g.clear()
            g.fillStyle(C.shadow, 0.22)
            g.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, h / 2)
            g.fillStyle(tone, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            box.setVisible(true).setAlpha(1).setScale(1)
            void FX.popIn(scene, box, { from: 0.5, duration: 340 })
        },
        hide,
        destroy() {
            hide()
            box.destroy()
        },
    }
}
