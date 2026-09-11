import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BAND, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

type Tone = 'warn' | 'good'

export function createBand(scene: Phaser.Scene) {
    const edge = scene.add.graphics().setDepth(DEPTH.fx).setAlpha(0)

    const root = scene.add.container(BAND.cx, BAND.cy).setDepth(DEPTH.band).setAlpha(0)
    const face = scene.add.graphics()
    const text = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '24px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: BAND.w - 90 },
            lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add([face, text])

    const flash = (color: number) => {
        scene.tweens.killTweensOf(edge)
        edge.clear()
        edge.lineStyle(18, color, 1)
        edge.strokeRoundedRect(9, 9, W - 18, H - 18, 26)
        edge.setAlpha(0.85)
        return FX.to(scene, edge, { alpha: 0 }, { duration: 480 })
    }

    return {
        say(line: string, tone: Tone) {
            void flash(tone === 'warn' ? C.amber : C.green)
            text.setText(line)
            text.setColor(tone === 'warn' ? CSS.amberInk : CSS.ink)
            const w = Math.min(BAND.w, text.width + 90)
            const h = Math.max(BAND.h, text.height + 40)
            face.clear()
            face.fillStyle(C.ink, 0.26)
            face.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, h / 2)
            face.fillStyle(C.ink, 1)
            face.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4)
            face.fillStyle(tone === 'warn' ? C.amberDeep : C.greenDeep, 1)
            face.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            face.fillStyle(tone === 'warn' ? C.amber : C.green, 1)
            face.fillRoundedRect(-w / 2, -h / 2, w, h - 8, h / 2)
            face.fillStyle(C.white, 0.28)
            face.fillRoundedRect(-w / 2 + 26, -h / 2 + 10, w - 52, 11, 6)
            scene.tweens.killTweensOf(root)
            root.setAlpha(1).setScale(0.92)
            return FX.to(scene, root, { scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
        },

        hush() {
            scene.tweens.killTweensOf(root)
            return FX.to(scene, root, { alpha: 0 }, { duration: 200 })
        },

        destroy() {
            scene.tweens.killTweensOf([root, edge])
            root.destroy(true)
            edge.destroy()
        },
    }
}

export type Band = ReturnType<typeof createBand>
