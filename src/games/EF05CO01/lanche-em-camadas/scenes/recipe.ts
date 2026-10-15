import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ING_SHEET, UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { INGREDIENTS } from '../data/ingredients'
import { DEPTH, RECIPE } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL } from '../data/words'
import type { IngredientId, Rect } from '../types'
import { fitInto } from './art'

export interface Recipe {
    show(list: IngredientId[], big: boolean): Promise<void>
    dock(): Promise<void>
    mark(index: number): Promise<void>
    shake(index: number): Promise<void>
    clear(): void
    rect(): Rect
    cardRect(index: number): Rect
    visible(on: boolean): void
    destroy(): void
}

interface Card {
    box: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Graphics
    icon: Phaser.GameObjects.Image
}

export function createRecipe(scene: Phaser.Scene): Recipe {
    const layer = scene.add.container(RECIPE.x, RECIPE.y).setDepth(DEPTH.recipe)
    let cards: Card[] = []
    let total = 0

    const slotX = (i: number) => -total / 2 + RECIPE.cardW / 2 + i * (RECIPE.cardW + RECIPE.gap)

    const make = (id: IngredientId, i: number): Card => {
        const art = fitInto(scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.card)), RECIPE.cardH)
        const ring = scene.add.graphics()
        ring.lineStyle(5, C.butter, 1)
        ring.strokeRoundedRect(-art.displayWidth / 2 - 4, -RECIPE.cardH / 2 - 4, art.displayWidth + 8, RECIPE.cardH + 8, 12)
        ring.setAlpha(0)
        const nth = scene.add
            .text(0, -RECIPE.cardH / 2 + 15, LABEL.nth(i), { fontFamily: FONT.black, fontSize: `${SIZE.nth}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const icon = fitInto(scene.add.image(0, 12, ING_SHEET.key, cellKey(INGREDIENTS[id].cell)), RECIPE.icon).setAlpha(0.9)
        const box = scene.add.container(slotX(i), 0, [ring, art, nth, icon])
        layer.add(box)
        return { box, ring, icon }
    }

    const recipe: Recipe = {
        async show(list, big) {
            recipe.clear()
            total = list.length * RECIPE.cardW + (list.length - 1) * RECIPE.gap
            if (big) layer.setPosition(RECIPE.bigX, RECIPE.bigY).setScale(RECIPE.bigScale)
            else layer.setPosition(RECIPE.x, RECIPE.y).setScale(1)
            cards = list.map(make)
            for (const card of cards) {
                card.box.setScale(0.3).setAlpha(0)
                await FX.to(scene, card.box, { scale: 1, alpha: 1 }, { duration: TIMING.cardIn, ease: 'Back.easeOut' })
                await FX.wait(scene, TIMING.cardGap)
            }
        },
        async dock() {
            await FX.to(scene, layer, { x: RECIPE.x, y: RECIPE.y, scale: 1 }, { duration: 650, ease: 'Sine.easeInOut' })
        },
        async mark(index) {
            const card = cards[index]
            if (!card) return
            card.icon.setAlpha(1)
            card.ring.setAlpha(1)
            void FX.sparks(scene, layer.x + card.box.x * layer.scale, layer.y, { color: C.butter, count: 10, spread: 40, size: 7, duration: 420, depth: DEPTH.recipe + 1 })
            await FX.to(scene, card.box, { scale: 1.18 }, { duration: 130, yoyo: true })
        },
        async shake(index) {
            const card = cards[index]
            if (!card) return
            await FX.shake(scene, card.box, { amount: 9, times: 5 })
        },
        clear() {
            cards.forEach(c => {
                scene.tweens.killTweensOf(c.box)
                c.box.destroy()
            })
            cards = []
            total = 0
        },
        rect() {
            const w = (total + 30) * layer.scale
            return { x: layer.x, y: layer.y, w: Math.max(w, 120), h: (RECIPE.cardH + 24) * layer.scale }
        },
        cardRect(index) {
            const card = cards[index]
            const x = layer.x + (card ? card.box.x : 0) * layer.scale
            return { x, y: layer.y, w: (RECIPE.cardW + 14) * layer.scale, h: (RECIPE.cardH + 16) * layer.scale }
        },
        visible(on) {
            layer.setVisible(on)
        },
        destroy() {
            recipe.clear()
            layer.destroy()
        },
    }
    return recipe
}
