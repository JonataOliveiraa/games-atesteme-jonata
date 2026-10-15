import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BANNER, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { pin } from './art'

const PAD = 80

type Spot = { x: number; y: number; w: number; h: number }

export function showBanner(scene: Phaser.Scene, text: string, at: Spot = BANNER) {
    const w = at.w
    const label = scene.add
        .text(0, 0, text, {
            fontFamily: FONT.black,
            fontSize: '38px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: w - PAD, useAdvancedWrap: true },
        })
        .setOrigin(0.5)
        .setResolution(2)
    const h = Math.max(at.h, label.height + 32)
    const r = Math.min(h / 2, 48)
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 9, w, h, r)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    g.lineStyle(6, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
    const y = Math.min(at.y, 720 - h / 2 - 12)
    const box = pin(scene.add.container(at.x, y, [g, label]).setDepth(DEPTH.banner))
    void FX.popIn(scene, box, { from: 0.6, duration: 360 })
    return box
}
