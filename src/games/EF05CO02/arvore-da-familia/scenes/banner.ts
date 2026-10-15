import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BANNER, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export interface Banner {
    say(text: string): void
    clear(): void
    destroy(): void
}

export function createBanner(scene: Phaser.Scene): Banner {
    const g = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.banner}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const box = scene.add.container(BANNER.x, BANNER.y, [g, label]).setDepth(DEPTH.banner).setScrollFactor(0).setVisible(false)
    const { w, h } = BANNER
    g.fillStyle(C.shadow, 0.35)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 9, w, h, h / 2)
    g.fillStyle(C.oops, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.lineStyle(6, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)

    const hide = () => {
        scene.tweens.killTweensOf(box)
        box.setVisible(false)
    }

    return {
        say(text) {
            hide()
            label.setText(text).setScale(1)
            if (label.width > w - 70) label.setScale((w - 70) / label.width)
            box.setVisible(true).setScale(1).setAlpha(1)
            void FX.popIn(scene, box, { from: 0.6, duration: 320 })
        },
        clear: hide,
        destroy() {
            hide()
            box.destroy()
        },
    }
}
