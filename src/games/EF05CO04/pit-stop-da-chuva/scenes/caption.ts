import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAPTION, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'

/** A legenda: uma a três palavras grandes ("CHOVEU!", "PARE", "SUA VEZ!"). Some sozinha se tiver `ms`. */
export interface Caption {
    say(text: string, tone?: number, ms?: number, size?: number): void
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
    let timer: Phaser.Time.TimerEvent | undefined

    const hide = () => {
        timer?.remove()
        timer = undefined
        scene.tweens.killTweensOf(box)
        box.setVisible(false)
    }

    return {
        say(text, tone = C.white, ms, size = SIZE.caption) {
            hide()
            label.setFontSize(size).setText(text).setColor(inkOn(tone))
            const w = label.width + 70
            const h = label.height + 26
            g.clear()
            g.fillStyle(C.shadow, 0.22)
            g.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, h / 2)
            g.fillStyle(tone, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.lineStyle(4, C.line, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            box.setVisible(true).setAlpha(1).setScale(1)
            void FX.popIn(scene, box, { from: 0.5, duration: 340 })
            if (ms)
                timer = scene.time.delayedCall(ms, () => {
                    void FX.to(scene, box, { alpha: 0 }, { duration: 240 }).then(() => box.setVisible(false))
                })
        },
        hide,
        destroy() {
            hide()
            box.destroy()
        },
    }
}
