import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { FINDS } from '../data/files'
import { DEPTH, PANEL_END } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { PANEL_TITLE } from '../data/words'
import type { FindDef } from '../types'

export interface Mural {
    show(finds: FindDef[]): Promise<void>
    destroy(): void
}

export function createMural(scene: Phaser.Scene): Mural {
    let box: Phaser.GameObjects.Container | undefined
    return {
        async show(finds) {
            const { w, h } = PANEL_END
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.3)
            g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 34)
            g.fillStyle(0x8fd8d2, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 34)
            for (let x = -w / 2 + 40; x < w / 2; x += 60) {
                g.fillStyle(0x6fc4bd, 1)
                g.fillRect(x, -h / 2 + 10, 4, h - 20)
            }
            g.lineStyle(5, C.ink, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 34)
            const parts: Phaser.GameObjects.GameObject[] = [g]
            parts.push(
                scene.add
                    .text(0, -h / 2 + 46, PANEL_TITLE, { fontFamily: FONT.black, fontSize: `${SIZE.panelTitle}px`, color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
            const gap = (w - 120) / Math.max(1, finds.length)
            finds.forEach((f, i) => {
                const x = -w / 2 + 60 + gap * (i + 0.5)
                const tilt = (i - (finds.length - 1) / 2) * 3
                const card = scene.add.graphics()
                card.fillStyle(C.paper, 1)
                card.fillRoundedRect(-120, -130, 240, 280, 14)
                card.lineStyle(4, C.ink, 1)
                card.strokeRoundedRect(-120, -130, 240, 280, 14)
                card.fillStyle(C.pink, 1)
                card.fillCircle(0, -124, 10)
                const art = scene.add.sprite(0, -20, FINDS, f.frame).setScale(0.82)
                const label = scene.add
                    .text(0, 118, f.caption, { fontFamily: FONT.black, fontSize: '20px', color: CSS.ink, align: 'center', wordWrap: { width: 220 } })
                    .setOrigin(0.5)
                    .setResolution(2)
                parts.push(scene.add.container(x, 30, [card, art, label]).setAngle(tilt))
            })
            box = scene.add.container(PANEL_END.x, -h, parts).setDepth(DEPTH.finale).setScrollFactor(0)
            await FX.to(scene, box, { y: PANEL_END.y }, { duration: 640, ease: Ease.back(1.3) })
        },
        destroy() {
            box?.destroy()
            box = undefined
        },
    }
}
