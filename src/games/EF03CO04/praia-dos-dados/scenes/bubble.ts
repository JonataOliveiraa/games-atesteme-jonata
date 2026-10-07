import Phaser from 'phaser'
import { C, CSS, FONT, SIZE } from '../data/theme'

/** Balãozinho curto acima de alguém (banhista), desenhado em torno de (0,0) com a ponta para baixo. */
export function makeBubble(scene: Phaser.Scene, text: string) {
    const label = scene.add
        .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.bubble}px`, color: CSS.ink, align: 'center', wordWrap: { width: 250 } })
        .setOrigin(0.5)
        .setResolution(2)
    const w = Math.max(120, label.width + 30)
    const h = label.height + 20
    const bg = scene.add.graphics()
    bg.fillStyle(C.shadow, 0.16)
    bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, 18)
    bg.fillStyle(C.white, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
    bg.fillTriangle(-12, h / 2 - 2, 12, h / 2 - 2, 0, h / 2 + 16)
    bg.lineStyle(3, C.ink, 1)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)
    bg.lineBetween(-12, h / 2, 0, h / 2 + 16)
    bg.lineBetween(12, h / 2, 0, h / 2 + 16)
    return { bubble: scene.add.container(0, 0, [bg, label]), h }
}
