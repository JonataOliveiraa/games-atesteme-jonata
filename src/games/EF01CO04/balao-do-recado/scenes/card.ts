import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { PIECES } from '../data/files'
import { CARD, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Message, RecipientId } from '../types'
import { createPic } from './pic'

export interface Card {
    set(message: Message, recipient: RecipientId): void
    readonly rect: GuideRect
    readonly container: Phaser.GameObjects.Container
    destroy(): void
}

export function createCard(scene: Phaser.Scene): Card {
    const bg = scene.add.graphics()
    const drawing = createPic(scene, 0, 0, CARD.art)
    const text = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.card}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const container = scene.add.container(CARD.cx, CARD.cy, [bg, drawing.container, text]).setDepth(DEPTH.card)
    const rect: GuideRect = { x: CARD.cx, y: CARD.cy, w: CARD.w, h: CARD.h }

    const layout = () => {
        const room = CARD.w - CARD.art - CARD.gap * 3
        text.setFontSize(SIZE.card)
        if (text.width > room) text.setFontSize(Math.max(20, Math.floor((SIZE.card * room) / text.width)))
        const w = Math.min(CARD.w, CARD.art + CARD.gap * 3 + text.width)
        const h = CARD.h
        bg.clear()
        bg.fillStyle(C.shadow, 0.16)
        bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2)
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        bg.lineStyle(4, C.ink, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        drawing.container.setX(-w / 2 + CARD.gap + CARD.art / 2)
        text.setX(-w / 2 + CARD.gap * 2 + CARD.art)
        rect.w = w
    }

    return {
        set(message) {
            drawing.set(PIECES, message.icon, message.id)
            text.setText(message.text)
            layout()
            void FX.popIn(scene, container, { from: 0.85 })
        },
        rect,
        container,
        destroy() {
            FX.kill(scene, container)
            container.destroy()
        },
    }
}
