import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, RAIL, RAIL_CARD_X, railHeight, railRowY } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { createCard, type Card } from './cards'
import type { PartDef } from '../types'

export function createShelf(scene: Phaser.Scene, parts: PartDef[]) {
    const n = parts.length
    const height = railHeight(n)
    const root = scene.add.container(0, 0).setDepth(DEPTH.band).setAlpha(0).setVisible(false)

    const board = scene.add.graphics()
    board.fillStyle(C.ink, 0.32)
    board.fillRoundedRect(RAIL.x, RAIL.top + 10, RAIL.w, height, 30)
    board.fillStyle(C.woodDark, 1)
    board.fillRoundedRect(RAIL.x, RAIL.top, RAIL.w, height, 30)
    board.fillStyle(C.wood, 1)
    board.fillRoundedRect(RAIL.x + 6, RAIL.top + 6, RAIL.w - 12, height - 18, 24)
    board.fillStyle(C.white, 0.16)
    board.fillRoundedRect(RAIL.x + 20, RAIL.top + 14, RAIL.w - 40, 12, 6)
    root.add(board)

    const title = scene.add.text(RAIL.x + RAIL.w / 2, RAIL.top + 30, 'JÁ FIZ', {
        fontFamily: FONT.black,
        fontSize: '28px',
        color: CSS.cream,
    }).setOrigin(0.5).setResolution(2)
    title.setStroke(CSS.ink, 6)
    root.add(title)

    const cards: Card[] = []
    const labels: Phaser.GameObjects.Text[] = []

    parts.forEach((part, i) => {
        const y = railRowY(i)

        const slot = scene.add.graphics()
        slot.fillStyle(C.ink, 0.26)
        slot.fillRoundedRect(RAIL_CARD_X - RAIL.cardW / 2 - 5, y - RAIL.cardH / 2 - 5,
            RAIL.cardW + 10, RAIL.cardH + 10, 22)
        root.add(slot)

        const card = createCard(scene, {
            icon: part.icon,
            w: RAIL.cardW,
            h: RAIL.cardH,
            iconScale: 0.88,
        })
        card.setTone('ghost')
        card.root.setPosition(RAIL_CARD_X, y)
        root.add(card.root)
        cards.push(card)

        const label = scene.add.text(
            RAIL_CARD_X + RAIL.cardW / 2 + RAIL.labelGap,
            y,
            part.label,
            { fontFamily: FONT.black, fontSize: '18px', color: CSS.cream },
        ).setOrigin(0, 0.5).setResolution(2).setAlpha(0.4)
        label.setStroke(CSS.ink, 5)
        root.add(label)
        labels.push(label)
    })

    return {
        slotAt(i: number) {
            return { x: RAIL_CARD_X, y: railRowY(i) }
        },

        show() {
            if (root.visible) return
            root.setVisible(true)
            scene.tweens.add({ targets: root, alpha: 1, duration: FX.ms(scene, 320) })
        },

        async fill(i: number) {
            const card = cards[i]
            if (!card) return
            const at = { x: RAIL_CARD_X, y: railRowY(i) }

            card.setTone('ok')
            card.setBadge('check')
            labels[i].setAlpha(1)
            void FX.sparks(scene, at.x, at.y, {
                color: C.warn, count: 16, spread: 120, depth: DEPTH.fx,
            })
            void FX.ping(scene, at.x, at.y, C.ok, {
                radius: 82, duration: 520, depth: DEPTH.band + 1,
            })
            FX.popIn(scene, card.root, { from: 0.4, duration: 420 })
            await FX.wait(scene, 460)
        },

        dismiss(ms = 380) {
            scene.tweens.add({ targets: root, alpha: 0, duration: FX.ms(scene, ms) })
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy()
        },
    }
}
