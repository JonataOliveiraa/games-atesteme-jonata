import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { TraitId } from '../types'
import { iconImage } from './art'

export interface Chip {
    readonly trait: TraitId
    readonly box: Phaser.GameObjects.Container
    solved(): void
    useless(): void
    shake(): Promise<void>
    destroy(): void
}

/** A ficha de um dado: o objeto e a palavra, desenhados em torno de (0,0). */
export function makeChip(scene: Phaser.Scene, trait: TraitId, w: number, h: number): Chip {
    const bg = scene.add.graphics()
    bg.fillStyle(C.shadow, 0.16)
    bg.fillRoundedRect(-w / 2 + 2, -h / 2 + 4, w, h, 14)
    bg.fillStyle(C.chip, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
    bg.lineStyle(3, C.ink, 1)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14)

    const iconSize = h * 0.8
    const icon = iconImage(scene, trait, iconSize).setPosition(-w / 2 + 8 + iconSize / 2, 0)
    const textLeft = -w / 2 + 14 + iconSize
    const room = w / 2 - 10 - textLeft
    const label = scene.add
        .text(textLeft + room / 2, 1, LABEL[trait], {
            fontFamily: FONT.black,
            fontSize: `${Math.round((SIZE.chip * h) / 66)}px`,
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    if (label.width > room) label.setScale(room / label.width)

    const badge = scene.add.graphics().setVisible(false)
    badge.fillStyle(C.yes, 1)
    badge.fillCircle(w / 2 - 6, -h / 2 + 4, 14)
    badge.lineStyle(3, C.ink, 1)
    badge.strokeCircle(w / 2 - 6, -h / 2 + 4, 14)
    badge.lineStyle(4, C.white, 1)
    badge.beginPath()
    badge.moveTo(w / 2 - 13, -h / 2 + 4)
    badge.lineTo(w / 2 - 8, -h / 2 + 10)
    badge.lineTo(w / 2 + 2, -h / 2 - 3)
    badge.strokePath()

    const box = scene.add.container(0, 0, [bg, icon, label, badge])

    return {
        trait,
        box,
        solved() {
            badge.setVisible(true).setScale(0.3)
            void FX.to(scene, badge, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        useless() {
            badge.setVisible(false)
            icon.setAlpha(0.45)
            label.setAlpha(0.45)
        },
        async shake() {
            await FX.shake(scene, box, { amount: 7, times: 4 })
        },
        destroy() {
            box.destroy()
        },
    }
}
