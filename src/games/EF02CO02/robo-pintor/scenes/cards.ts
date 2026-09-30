import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { PIECE, PIECES } from '../data/files'
import { CARDS, DEPTH, cardRect } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Rect } from '../types'

export interface Cards {
    show(values: number[]): Promise<void>
    onPick(cb: (index: number) => void): void
    setEnabled(on: boolean): void
    fly(index: number, to: { x: number; y: number }): Promise<void>
    rect(index: number): Rect
    nod(index: number): void
    clear(): Promise<void>
    destroy(): void
}

export function createCards(scene: Phaser.Scene): Cards {
    let cards: Phaser.GameObjects.Container[] = []
    let zones: Phaser.GameObjects.Zone[] = []
    let enabled = false
    let pick: (index: number) => void = () => undefined

    const wipe = () => {
        cards.forEach(c => {
            scene.tweens.killTweensOf(c)
            c.destroy()
        })
        zones.forEach(z => z.destroy())
        cards = []
        zones = []
    }

    const make = (value: number, x: number) => {
        const base = scene.add.image(0, 0, PIECES, PIECE.card).setScale(CARDS.scale)
        const number = scene.add
            .text(0, CARDS.numberDY, String(value), { fontFamily: FONT.black, fontSize: `${SIZE.card}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const dots = scene.add.graphics()
        const x0 = -((value - 1) * CARDS.dotGap) / 2
        dots.fillStyle(C.orange, 1)
        for (let i = 0; i < value; i++) dots.fillCircle(x0 + i * CARDS.dotGap, CARDS.dotsDY, CARDS.dotR)
        return scene.add.container(x, CARDS.y, [base, number, dots]).setDepth(DEPTH.cards)
    }

    return {
        async show(values) {
            wipe()
            values.forEach((value, i) => {
                const card = make(value, CARDS.xs[i])
                card.setScale(0)
                cards.push(card)
                const zone = scene.add
                    .zone(CARDS.xs[i], CARDS.y, CARDS.w + 16, CARDS.h + 16)
                    .setDepth(DEPTH.cards + 1)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (enabled) pick(i)
                })
                zones.push(zone)
            })
            await Promise.all(cards.map((c, i) => FX.wait(scene, i * 90).then(() => FX.to(scene, c, { scale: 1 }, { duration: 320, ease: Ease.back(2) }))))
        },
        onPick(cb) {
            pick = cb
        },
        setEnabled(on) {
            enabled = on
            zones.forEach(z => {
                if (z.input) z.input.cursor = on ? 'pointer' : 'default'
            })
        },
        async fly(index, to) {
            const card = cards[index]
            if (!card) return
            card.setDepth(DEPTH.flying)
            await FX.press(scene, card)
            await Promise.all([
                FX.arcTo(scene, card, to, { height: 80, duration: 460 }),
                FX.to(scene, card, { scale: 0.55 }, { duration: 460 }),
            ])
            await FX.to(scene, card, { alpha: 0 }, { duration: 140 })
            cards.forEach((c, i) => {
                if (i !== index) void FX.to(scene, c, { alpha: 0.35 }, { duration: 200 })
            })
        },
        rect: cardRect,
        nod(index) {
            const card = cards[index]
            if (card) void FX.shake(scene, card, { amount: 4, times: 1 })
        },
        async clear() {
            await Promise.all(cards.map(c => FX.to(scene, c, { scale: 0, alpha: 0 }, { duration: 220 })))
            wipe()
        },
        destroy() {
            wipe()
        },
    }
}
