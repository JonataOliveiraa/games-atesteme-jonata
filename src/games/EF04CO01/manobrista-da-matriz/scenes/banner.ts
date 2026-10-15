import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BANNER, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/** A faixa grande do motivo do erro, antes do `lose()`. */
export function showBanner(scene: Phaser.Scene, text: string) {
    const { w, h } = BANNER
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 9, w, h, h / 2)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.lineStyle(6, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    const label = scene.add
        .text(0, 0, text, { fontFamily: FONT.black, fontSize: '44px', color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    if (label.width > w - 80) label.setScale((w - 80) / label.width)
    const box = scene.add.container(BANNER.x, BANNER.y, [g, label]).setDepth(DEPTH.banner).setScrollFactor(0)
    void FX.popIn(scene, box, { from: 0.6, duration: 360 })
    return box
}
