import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BANNER, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

const PAD = 80

export function showBanner(scene: Phaser.Scene, text: string, tone: number = C.white) {
    const w = BANNER.w
    const label = scene.add
        .text(0, 0, text, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.banner}px`,
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: w - PAD, useAdvancedWrap: true },
        })
        .setOrigin(0.5)
        .setResolution(2)
    const h = Math.max(BANNER.h, label.height + 32)
    const r = Math.min(h / 2, 46)
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 9, w, h, r)
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    g.lineStyle(6, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
    const box = scene.add.container(BANNER.x, BANNER.y, [g, label]).setDepth(DEPTH.banner).setScrollFactor(0)
    void FX.popIn(scene, box, { from: 0.6, duration: 360 })
    return box
}
