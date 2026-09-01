import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

const BALLOON_Y = 176
const MAX_W = 620

/**
 * O balão diz QUAL e POR QUÊ — nunca "tente de novo", nunca a resposta. Quem
 * diz a resposta é a legenda, que a criança escolhe abrir.
 */
export function createTalk(scene: Phaser.Scene) {
    const container = scene.add.container(W / 2, BALLOON_Y).setDepth(DEPTH.balloon).setAlpha(0)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, 0, '', {
        fontFamily: FONT.black,
        fontSize: SIZE.balloon,
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: MAX_W - 64 },
        lineSpacing: 4,
    }).setOrigin(0.5).setResolution(2)
    container.add([bg, text])

    let hideTimer: Phaser.Time.TimerEvent | null = null

    const paint = (accent: number) => {
        const w = Math.min(MAX_W, text.width + 64)
        const h = text.height + 40
        bg.clear()
        bg.fillStyle(C.ink, 0.24)
        bg.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, 24)
        bg.fillStyle(C.cream, 0.98)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 24)
        bg.lineStyle(6, accent, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 24)
    }

    return {
        say(message: string, accent = C.woodDark, ms = 2600) {
            hideTimer?.remove()
            text.setText(message)
            paint(accent)
            container.setAlpha(1)
            FX.popIn(scene, container, { from: 0.9, duration: 240 })
            hideTimer = scene.time.delayedCall(FX.ms(scene, ms), () => {
                scene.tweens.add({
                    targets: container,
                    alpha: 0,
                    duration: FX.ms(scene, 260),
                })
            })
        },

        hide() {
            hideTimer?.remove()
            hideTimer = null
            container.setAlpha(0)
        },

        destroy() {
            hideTimer?.remove()
            container.destroy()
        },
    }
}
