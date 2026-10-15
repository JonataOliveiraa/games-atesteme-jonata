import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BANNER, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export interface Banner {
    say(text: string, tone: 'oops' | 'soft', ms?: number): void
    clear(): void
    destroy(): void
}

export function createBanner(scene: Phaser.Scene): Banner {
    const g = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.banner}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const box = scene.add.container(BANNER.x, BANNER.y, [g, label]).setDepth(DEPTH.banner).setVisible(false)
    let timer: Phaser.Time.TimerEvent | undefined

    const paint = (tone: 'oops' | 'soft') => {
        const { w, h } = BANNER
        g.clear()
        g.fillStyle(C.shadow, 0.22)
        g.fillRoundedRect(-w / 2 + 6, -h / 2 + 9, w, h, h / 2)
        g.fillStyle(tone === 'oops' ? C.oops : C.paper, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.lineStyle(6, C.ink, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    const hide = () => {
        timer?.remove()
        timer = undefined
        scene.tweens.killTweensOf(box)
        box.setVisible(false)
    }

    return {
        say(text, tone, ms) {
            hide()
            paint(tone)
            label.setText(text).setScale(1)
            label.setFontSize(tone === 'oops' ? SIZE.banner : SIZE.banner - 6)
            if (label.width > BANNER.w - 70) label.setScale((BANNER.w - 70) / label.width)
            box.setVisible(true).setScale(1).setAlpha(1)
            void FX.popIn(scene, box, { from: 0.6, duration: 320 })
            if (ms)
                timer = scene.time.delayedCall(ms, () => {
                    void FX.to(scene, box, { alpha: 0 }, { duration: 260 }).then(() => box.setVisible(false))
                })
        },
        clear: hide,
        destroy() {
            hide()
            box.destroy()
        },
    }
}
