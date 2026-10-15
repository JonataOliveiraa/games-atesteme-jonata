import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ANIMAL_SHEET, PIGEON, cellKey } from '../data/files'
import { DEPTH, YARD } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import { hasFrame, piece } from './art'
import type { Card } from './card'

export interface Basket {
    free(): number
    cards(): Card[]
    deliver(card: Card): Promise<void>
    take(card: Card): void
    setDim(on: boolean): void
    destroy(): void
}

export function createBasket(scene: Phaser.Scene, onDrop?: () => void): Basket {
    const base = piece(scene, 'basket', YARD.basket.x, YARD.basket.y, YARD.basket.w).setDepth(DEPTH.cards - 1).setScrollFactor(0)
    const spots: (Card | null)[] = YARD.spots.map(() => null)
    const art = hasFrame(scene, ANIMAL_SHEET.key, cellKey(PIGEON.flying))
    const pigeon = art
        ? scene.add.image(0, 0, ANIMAL_SHEET.key, cellKey(PIGEON.flying))
        : scene.add.image(0, 0, '__WHITE').setTint(C.lilac).setDisplaySize(60, 40)
    if (art) pigeon.setScale(YARD.pigeon.size / pigeon.width)
    pigeon.setDepth(DEPTH.fx).setScrollFactor(0).setVisible(false).setFlipX(true)
    let dim = false

    const setPigeon = (flying: boolean) => {
        if (art) pigeon.setFrame(cellKey(flying ? PIGEON.flying : PIGEON.landed))
    }

    return {
        free: () => spots.filter(s => !s).length,
        cards: () => spots.filter((s): s is Card => !!s),
        async deliver(card) {
            const i = spots.findIndex(s => !s)
            if (i < 0) return
            spots[i] = card
            const x = YARD.spots[i]
            setPigeon(true)
            scene.tweens.killTweensOf(pigeon)
            pigeon.setPosition(YARD.pigeon.fromX, YARD.pigeon.fromY).setVisible(true).setAngle(0)
            scene.tweens.add({ targets: pigeon, angle: { from: -6, to: 6 }, duration: 160, yoyo: true, repeat: -1 })
            await FX.to(scene, pigeon, { x: x + 40, y: YARD.pigeon.perchY }, { duration: TIMING.pigeonIn, ease: 'Sine.easeOut' })
            scene.tweens.killTweensOf(pigeon)
            pigeon.setAngle(0)
            setPigeon(false)
            card.box.setScrollFactor(0).setVisible(true).setAlpha(dim ? 0.35 : 1)
            card.put(x + 18, YARD.pigeon.perchY + 26)
            onDrop?.()
            void FX.to(scene, pigeon, { x: -160, y: 70 }, { duration: 900, delay: 120, ease: 'Sine.easeIn' }).then(() => pigeon.setVisible(false))
            await card.flyTo(x, YARD.spotY, { arc: 24, ms: 360 })
        },
        take(card) {
            const i = spots.indexOf(card)
            if (i >= 0) spots[i] = null
        },
        setDim(on) {
            dim = on
            base.setAlpha(on ? 0.35 : 1)
            spots.forEach(c => c?.box.setAlpha(on ? 0.35 : 1))
        },
        destroy() {
            scene.tweens.killTweensOf(pigeon)
            pigeon.destroy()
            base.destroy()
        },
    }
}
