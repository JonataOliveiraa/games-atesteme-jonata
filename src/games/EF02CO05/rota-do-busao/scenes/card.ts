import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CARD, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { SituationId } from '../types'
import { situationImage, type Rect } from './art'

export interface Card {
    show(id: SituationId): Promise<void>
    mark(ok: boolean): Promise<void>
    hide(): Promise<void>
    rect(): Rect
    readonly visible: boolean
    destroy(): void
}

export function createCard(scene: Phaser.Scene): Card {
    const half = CARD.size / 2
    const shadow = scene.add.graphics()
    shadow.fillStyle(C.shadow, 0.18)
    shadow.fillRoundedRect(-half + 4, -half + 8, CARD.size, CARD.size, 30)
    const box = scene.add.container(CARD.x, CARD.y, [shadow]).setDepth(DEPTH.card).setVisible(false)
    let picture: Phaser.GameObjects.Image | undefined
    let badge: Phaser.GameObjects.Container | undefined

    const clearBadge = () => {
        badge?.destroy()
        badge = undefined
    }

    return {
        async show(id) {
            clearBadge()
            picture?.destroy()
            picture = situationImage(scene, id, CARD.size)
            box.addAt(picture, 1)
            box.setVisible(true).setAlpha(1).setScale(1)
            await FX.popIn(scene, box, { from: 0.3, duration: 360 })
        },
        async mark(ok) {
            clearBadge()
            const r = 30
            const g = scene.add.graphics()
            g.fillStyle(ok ? C.yes : C.white, 1)
            g.fillCircle(0, 0, r)
            g.lineStyle(4, C.ink, 1)
            g.strokeCircle(0, 0, r)
            const parts: Phaser.GameObjects.GameObject[] = [g]
            if (ok) {
                g.lineStyle(7, C.white, 1)
                g.beginPath()
                g.moveTo(-13, 1)
                g.lineTo(-4, 11)
                g.lineTo(14, -10)
                g.strokePath()
            } else {
                parts.push(
                    scene.add
                        .text(0, 2, '?', { fontFamily: FONT.black, fontSize: `${SIZE.mark}px`, color: CSS.ink })
                        .setOrigin(0.5)
                        .setResolution(2),
                )
            }
            badge = scene.add.container(half - 18, -half + 18, parts)
            box.add(badge)
            void FX.ping(scene, CARD.x, CARD.y, ok ? C.yes : C.white, { radius: 130, depth: DEPTH.card - 1 })
            await FX.popIn(scene, badge, { from: 0.2, duration: 300 })
            if (!ok) await FX.shake(scene, box, { amount: 6, times: 3 })
        },
        async hide() {
            if (!box.visible) return
            await FX.to(scene, box, { alpha: 0, scale: 0.6 }, { duration: 220, ease: 'Quad.easeIn' })
            box.setVisible(false)
            clearBadge()
        },
        rect() {
            return { x: CARD.x, y: CARD.y, w: CARD.size + 24, h: CARD.size + 24 }
        },
        get visible() {
            return box.visible
        },
        destroy() {
            box.destroy()
        },
    }
}
