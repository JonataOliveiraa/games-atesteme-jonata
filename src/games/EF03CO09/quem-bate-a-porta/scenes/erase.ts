import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE } from '../data/files'
import { DEPTH } from '../data/layout'
import { INFOS } from '../data/requests'
import { C, CSS, FONT } from '../data/theme'
import type { InfoId } from '../types'
import { infoImage, pieceImage } from './art'

const CARD = { x: 640, y: 624, w: 600, h: 124, trashDx: 222, trashR: 46 } as const

/** N3: a mensagem que a Nina mandou "ontem", com o botão APAGAR. Apagar some só daqui. */
export function createEraseCard(scene: Phaser.Scene, info: InfoId) {
    const { w, h } = CARD
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 28)
    g.fillStyle(0xe3f6ef, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
    g.lineStyle(5, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 28)
    const icon = infoImage(scene, info, 88).setPosition(-w / 2 + 70, 0)
    const sent = scene.add
        .text(-w / 2 + 130, -24, 'VOCÊ ENVIOU ONTEM', { fontFamily: FONT.black, fontSize: '20px', color: CSS.accent })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const what = scene.add
        .text(-w / 2 + 130, 16, INFOS[info].label, { fontFamily: FONT.black, fontSize: '34px', color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const disc = scene.add.circle(0, -10, CARD.trashR, C.white).setStrokeStyle(4, C.ink)
    const can = pieceImage(scene, PIECE.trash, 56).setPosition(0, -12)
    const label = scene.add
        .text(0, 46, 'APAGAR', { fontFamily: FONT.black, fontSize: '18px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const trash = scene.add.container(CARD.trashDx, 0, [disc, can, label])
    const bubble = scene.add.container(CARD.x, CARD.y, [g, icon, sent, what, trash]).setDepth(DEPTH.buttons).setVisible(false)

    const trashAt = { x: CARD.x + CARD.trashDx, y: CARD.y - 10 }

    return {
        trashAt,
        rect: () => ({ x: CARD.x, y: CARD.y, w: w + 24, h: h + 24 }),
        async show() {
            bubble.setVisible(true).setY(CARD.y + 160)
            await FX.to(scene, bubble, { y: CARD.y }, { duration: 420, ease: 'Back.easeOut' })
        },
        hitTrash(px: number, py: number) {
            return Math.hypot(px - trashAt.x, py - trashAt.y) <= CARD.trashR + 24
        },
        async wipe() {
            await FX.press(scene, trash)
            await FX.to(scene, bubble, { scale: 0.2, angle: -12, alpha: 0 }, { duration: 380, ease: 'Back.easeIn' })
            const gone = scene.add
                .text(CARD.x, CARD.y, 'Mensagem apagada', { fontFamily: FONT.body, fontSize: '28px', color: CSS.inkSoft, fontStyle: 'italic' })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.buttons)
                .setAlpha(0)
            await FX.to(scene, gone, { alpha: 1 }, { duration: 260 })
            await FX.wait(scene, 900)
            await FX.to(scene, gone, { alpha: 0 }, { duration: 260 })
            gone.destroy()
        },
        destroy() {
            if (bubble.active) bubble.destroy()
        },
    }
}

export type EraseCard = ReturnType<typeof createEraseCard>
