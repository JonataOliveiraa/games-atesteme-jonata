import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey } from '../data/files'
import { CAPTION, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'

export interface CaptionIcon {
    sheet: string
    cell: number
}

/** A legenda: uma a três palavras grandes ("CHOVEU!", "LAMA!", "JÁ!"), com o ícone da condição quando há. Some sozinha se tiver `ms`. */
export interface Caption {
    say(text: string, tone?: number, ms?: number, size?: number, icon?: CaptionIcon): void
    hide(): void
    destroy(): void
}

export function createCaption(scene: Phaser.Scene): Caption {
    const g = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.caption}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const pic = scene.add.image(0, 0, '__DEFAULT').setVisible(false)
    const box = scene.add.container(CAPTION.x, CAPTION.y, [g, pic, label]).setDepth(DEPTH.caption).setVisible(false)
    let timer: Phaser.Time.TimerEvent | undefined

    const hide = () => {
        timer?.remove()
        timer = undefined
        scene.tweens.killTweensOf(box)
        box.setVisible(false)
    }

    return {
        say(text, tone = C.white, ms, size = SIZE.caption, icon) {
            hide()
            label.setFontSize(size).setText(text).setColor(inkOn(tone))
            const side = icon ? CAPTION.icon + 12 : 0
            scene.tweens.killTweensOf(pic)
            pic.setVisible(!!icon)
            if (icon) {
                pic.setTexture(icon.sheet, cellKey(icon.cell))
                pic.setScale(CAPTION.icon / Math.max(pic.frame.width, pic.frame.height))
            }
            const w = label.width + 70 + side
            const h = Math.max(label.height, icon ? CAPTION.icon : 0) + 26
            label.setX(side / 2)
            pic.setX(-w / 2 + 35 + CAPTION.icon / 2)
            if (icon) void FX.to(scene, pic, { scale: pic.scale * 1.25 }, { duration: 180, yoyo: true, repeat: 1, delay: 200 })
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
