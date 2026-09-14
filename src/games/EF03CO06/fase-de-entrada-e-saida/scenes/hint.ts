import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, HINT, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export function createHint(scene: Phaser.Scene) {
    const edge = scene.add.graphics().setDepth(DEPTH.fx).setAlpha(0)

    const band = scene.add.container(HINT.x, HINT.y).setDepth(DEPTH.hint).setAlpha(0)
    const bandG = scene.add.graphics()
    const text = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '24px',
            color: CSS.warnInk,
            align: 'center',
            wordWrap: { width: HINT.w - 70 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    band.add([bandG, text])

    const flash = (color: number) => {
        scene.tweens.killTweensOf(edge)
        edge.clear()
        edge.lineStyle(18, color, 1)
        edge.strokeRoundedRect(9, 9, W - 18, H - 18, 26)
        edge.setAlpha(0.9)
        return FX.to(scene, edge, { alpha: 0 }, { duration: 480 })
    }

    return {
        good() {
            return flash(C.ok)
        },

        bad(line: string) {
            void flash(C.warn)
            text.setText(line)
            const w = Math.min(HINT.w, text.width + 70)
            const h = text.height + 22
            bandG.clear()
            bandG.fillStyle(C.ink, 0.25)
            bandG.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, h / 2)
            bandG.fillStyle(C.ink, 1)
            bandG.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, h / 2 + 3)
            bandG.fillStyle(C.warn, 1)
            bandG.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            scene.tweens.killTweensOf(band)
            band.setAlpha(1).setScale(0.9)
            return FX.to(scene, band, { scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
        },

        hush() {
            scene.tweens.killTweensOf(band)
            void FX.to(scene, band, { alpha: 0 }, { duration: 180 })
        },

        destroy() {
            scene.tweens.killTweensOf([band, edge])
            band.destroy(true)
            edge.destroy()
        },
    }
}

export type Hint = ReturnType<typeof createHint>
