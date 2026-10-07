import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { FINDS } from '../data/files'
import { CARD, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { SAY } from '../data/words'
import type { FindDef, Rect, Vec } from '../types'

export type Choice = 'deliver' | 'back'

export interface Card {
    open(find: FindDef, from: Vec): Promise<void>
    choose(allowed?: Choice[]): Promise<Choice>
    flyTo(to: Vec, scale: number): Promise<void>
    close(): Promise<void>
    rect(): Rect
    deliverRect(): Rect
    destroy(): void
}

const BUTTON = { w: 230, h: 66, y: CARD.h / 2 - 58, gap: 26 } as const

export function createCard(scene: Phaser.Scene): Card {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.45).setDepth(DEPTH.card - 1).setVisible(false).setScrollFactor(0).setInteractive()
    let box: Phaser.GameObjects.Container | undefined
    let art: Phaser.GameObjects.Sprite | undefined
    let zones: Phaser.GameObjects.Zone[] = []
    let pick: ((c: Choice) => void) | undefined

    const button = (x: number, text: string, fill: number, color: string) => {
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(x - BUTTON.w / 2 + 3, BUTTON.y - BUTTON.h / 2 + 6, BUTTON.w, BUTTON.h, BUTTON.h / 2)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(x - BUTTON.w / 2, BUTTON.y - BUTTON.h / 2, BUTTON.w, BUTTON.h, BUTTON.h / 2)
        g.lineStyle(4, C.ink, 1)
        g.strokeRoundedRect(x - BUTTON.w / 2, BUTTON.y - BUTTON.h / 2, BUTTON.w, BUTTON.h, BUTTON.h / 2)
        const t = scene.add
            .text(x, BUTTON.y + 1, text, { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color })
            .setOrigin(0.5)
            .setResolution(2)
        return [g, t]
    }

    const clearZones = () => {
        zones.forEach(z => z.destroy())
        zones = []
    }

    const deliverX = BUTTON.w / 2 + BUTTON.gap / 2
    const backX = -deliverX

    return {
        async open(find, from) {
            box?.destroy()
            const { w, h } = CARD
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.3)
            g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 34)
            g.fillStyle(C.paper, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 34)
            g.lineStyle(5, C.ink, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 34)
            art = scene.add.sprite(0, -62, FINDS, find.frame).setScale(CARD.art)
            const caption = scene.add
                .text(0, h / 2 - 128, find.caption, { fontFamily: FONT.black, fontSize: `${SIZE.caption}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            box = scene.add
                .container(from.x, from.y, [g, art, caption, ...button(backX, SAY.back, C.white, CSS.ink), ...button(deliverX, SAY.deliver, C.pink, CSS.white)])
                .setDepth(DEPTH.card)
                .setScrollFactor(0)
                .setScale(0.2)
                .setAlpha(0)
            veil.setVisible(true).setAlpha(0)
            void FX.to(scene, veil, { alpha: 1 }, { duration: 200 })
            await FX.to(scene, box, { x: CARD.x, y: CARD.y, scale: 1, alpha: 1 }, { duration: 360, ease: Ease.back(1.4) })
        },
        choose(allowed = ['deliver', 'back']) {
            clearZones()
            return new Promise(resolve => {
                pick = resolve
                ;([
                    ['back', backX],
                    ['deliver', deliverX],
                ] as [Choice, number][]).forEach(([choice, x]) => {
                    const z = scene.add
                        .zone(CARD.x + x, CARD.y + BUTTON.y, BUTTON.w, BUTTON.h + 10)
                        .setDepth(DEPTH.card + 2)
                        .setScrollFactor(0)
                        .setInteractive({ useHandCursor: true })
                    z.on('pointerdown', () => {
                        if (!allowed.includes(choice) || !pick) return
                        const done = pick
                        pick = undefined
                        clearZones()
                        done(choice)
                    })
                    zones.push(z)
                })
            })
        },
        async flyTo(to, scale) {
            if (!box || !art) return
            clearZones()
            void FX.to(scene, veil, { alpha: 0 }, { duration: 200 }).then(() => veil.setVisible(false))
            box.list.forEach(o => {
                if (o !== art) (o as Phaser.GameObjects.Components.Visible & Phaser.GameObjects.GameObject).setVisible?.(false)
            })
            await FX.to(scene, box, { x: to.x, y: to.y + 40 * scale, scale }, { duration: 520, ease: Ease.smooth })
        },
        async close() {
            clearZones()
            pick = undefined
            const b = box
            box = undefined
            art = undefined
            void FX.to(scene, veil, { alpha: 0 }, { duration: 180 }).then(() => veil.setVisible(false))
            if (b) {
                await FX.to(scene, b, { scale: 0.3, alpha: 0 }, { duration: 200 })
                b.destroy()
            }
        },
        rect() {
            return { x: CARD.x, y: CARD.y, w: CARD.w + 20, h: CARD.h + 20 }
        },
        deliverRect() {
            return { x: CARD.x + deliverX, y: CARD.y + BUTTON.y, w: BUTTON.w + 20, h: BUTTON.h + 20 }
        },
        destroy() {
            clearZones()
            box?.destroy()
            veil.destroy()
        },
    }
}
