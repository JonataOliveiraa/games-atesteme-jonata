import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, HINT, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export type Tone = 'good' | 'bad'

const TONE = {
    good: { edge: C.ok, fill: C.okSoft, border: C.okDark, text: CSS.ok },
    bad: { edge: C.coral, fill: C.warnSoft, border: C.warn, text: CSS.warn },
}

export function createHint(scene: Phaser.Scene) {
    const edge = scene.add.graphics().setDepth(DEPTH.fx).setAlpha(0)

    const band = scene.add.container(HINT.x, HINT.y).setDepth(DEPTH.hint).setAlpha(0)
    const bandG = scene.add.graphics()
    const text = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '25px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: HINT.w - 80 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    band.add([bandG, text])

    const flash = (color: number) => {
        edge.clear()
        edge.lineStyle(18, color, 1)
        edge.strokeRoundedRect(9, 9, W - 18, H - 18, 26)
        edge.setAlpha(0.9)
        return FX.to(scene, edge, { alpha: 0 }, { duration: 460 })
    }

    return {
        say(line: string, tone: Tone) {
            const look = TONE[tone]
            void flash(look.edge)
            text.setText(line).setColor(look.text)
            const w = Math.min(HINT.w, text.width + 80)
            const h = text.height + 26
            bandG.clear()
            bandG.fillStyle(C.ink, 0.25)
            bandG.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, h / 2)
            bandG.fillStyle(look.border, 1)
            bandG.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            bandG.fillStyle(look.fill, 1)
            bandG.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, h / 2 - 5)

            scene.tweens.killTweensOf(band)
            band.setAlpha(1).setScale(0.9)
            return FX.to(scene, band, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        },

        hush() {
            scene.tweens.killTweensOf(band)
            void FX.to(scene, band, { alpha: 0 }, { duration: 200 })
        },

        destroy() {
            scene.tweens.killTweensOf(band)
            scene.tweens.killTweensOf(edge)
            band.destroy(true)
            edge.destroy()
        },
    }
}

export type Hint = ReturnType<typeof createHint>
