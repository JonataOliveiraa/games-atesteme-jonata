import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { objectArt } from '../data/files'
import { DEPTH, H, RECIPE } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import type { ObjectId, Rect } from '../types'
import { ARROW, CARD, CARD_LIT, CHECK } from './art'

export interface Recipe {
    show(objects: ObjectId[], instant?: boolean): Promise<void>
    offer(strips: ObjectId[][]): Promise<void>
    armOffer(onPick: (index: number) => void): void
    disarmOffer(): void
    shakeOffer(index: number): Promise<void>
    commit(index: number, objects: ObjectId[]): Promise<void>
    offerRect(index?: number): Rect
    light(index: number): void
    done(index: number): Promise<void>
    bump(index: number): Promise<void>
    shake(index: number): Promise<void>
    clear(): void
    rect(): Rect
    visible(on: boolean): void
    dim(on: boolean): void
    destroy(): void
}

interface Card {
    box: Phaser.GameObjects.Container
    lit: Phaser.GameObjects.Image
    icon: Phaser.GameObjects.Image
    check: Phaser.GameObjects.Image
}

const widthOf = (count: number) => count * RECIPE.cardW + (count - 1) * RECIPE.gap
const slotX = (i: number, total: number) => -total / 2 + RECIPE.cardW / 2 + i * (RECIPE.cardW + RECIPE.gap)

export function createRecipe(scene: Phaser.Scene): Recipe {
    const layer = scene.add.container(RECIPE.x, RECIPE.y).setDepth(DEPTH.recipe)
    const string = scene.add.rectangle(0, -RECIPE.cardH / 2 - 8, 10, 4, C.headerLine).setVisible(false)
    layer.add(string)
    let cards: Card[] = []
    let arrows: Phaser.GameObjects.Image[] = []
    let total = 0
    let strips: Phaser.GameObjects.Container[] = []
    let stripZones: Phaser.GameObjects.Zone[] = []

    const makeCard = (id: ObjectId, i: number, width: number): Card => {
        const paper = scene.add.image(0, 3, CARD)
        const lit = scene.add.image(0, 0, CARD_LIT).setVisible(false)
        const art = objectArt(id)
        const icon = scene.add.image(0, 8, art.key, art.frame)
        icon.setScale(RECIPE.icon / Math.max(icon.frame.width, icon.frame.height))
        const number = scene.add
            .text(-RECIPE.cardW / 2 + 17, -RECIPE.cardH / 2 + 17, `${i + 1}`, { fontFamily: FONT.black, fontSize: `${SIZE.number}px`, color: CSS.inkSoft })
            .setOrigin(0.5)
            .setResolution(2)
        const check = scene.add.image(RECIPE.cardW / 2 - 8, -RECIPE.cardH / 2 + 8, CHECK).setVisible(false)
        const box = scene.add.container(slotX(i, width), 0, [lit, paper, icon, number, check])
        return { box, lit, icon, check }
    }

    const makeArrow = (i: number, width: number) =>
        scene.add.image(slotX(i, width) + RECIPE.cardW / 2 + RECIPE.gap / 2, 2, ARROW)

    const fit = (count: number) => {
        const wide = count >= RECIPE.wide.from
        layer.setScale(wide ? RECIPE.wide.scale : 1).setX(wide ? RECIPE.wide.x : RECIPE.x)
    }

    const clearStrips = () => {
        stripZones.forEach(zone => zone.destroy())
        stripZones = []
        strips.forEach(strip => {
            scene.tweens.killTweensOf(strip)
            strip.destroy()
        })
        strips = []
    }

    const recipe: Recipe = {
        async show(objects, instant = false) {
            recipe.clear()
            total = widthOf(objects.length)
            fit(objects.length)
            string.setSize(total + 60, 4).setVisible(true)
            string.setDisplaySize(total + 60, 4)
            cards = objects.map((id, i) => {
                const card = makeCard(id, i, total)
                layer.add(card.box)
                return card
            })
            arrows = objects.slice(1).map((_, i) => {
                const arrow = makeArrow(i, total).setAlpha(instant ? 1 : 0)
                layer.add(arrow)
                return arrow
            })
            if (instant) return
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i]
                card.box.setScale(0.3).setAlpha(0).setY(-30)
                if (i > 0) void FX.to(scene, arrows[i - 1], { alpha: 1 }, { duration: TIMING.cardIn })
                await FX.to(scene, card.box, { scale: 1, alpha: 1, y: 0 }, { duration: TIMING.cardIn, ease: 'Back.easeOut' })
                await FX.wait(scene, TIMING.cardGap)
            }
        },
        async offer(lists) {
            recipe.clear()
            clearStrips()
            strips = lists.map((objects, row) => {
                const width = widthOf(objects.length)
                const pad = RECIPE.offerPad
                const paper = scene.add.graphics()
                paper.fillStyle(C.softShadow, 0.22)
                paper.fillRoundedRect(-width / 2 - pad, -RECIPE.cardH / 2 - pad + 6, width + pad * 2, RECIPE.cardH + pad * 2, 22)
                paper.fillStyle(C.headerSoft, 1)
                paper.fillRoundedRect(-width / 2 - pad, -RECIPE.cardH / 2 - pad, width + pad * 2, RECIPE.cardH + pad * 2, 22)
                const parts: Phaser.GameObjects.GameObject[] = [paper]
                objects.forEach((id, i) => parts.push(makeCard(id, i, width).box))
                objects.slice(1).forEach((_, i) => parts.push(makeArrow(i, width)))
                return scene.add.container(RECIPE.offerX, RECIPE.offerY[row], parts).setDepth(DEPTH.recipe).setScale(0.6).setAlpha(0)
            })
            total = widthOf(lists[0].length)
            await FX.all(
                ...strips.map((strip, i) =>
                    FX.to(scene, strip, { scale: 1, alpha: 1 }, { duration: TIMING.cardIn, delay: i * 180, ease: 'Back.easeOut' }),
                ),
            )
        },
        armOffer(onPick) {
            recipe.disarmOffer()
            stripZones = strips.map((strip, i) => {
                const area = recipe.offerRect(i)
                const zone = scene.add.zone(area.x, area.y, area.w, area.h).setDepth(DEPTH.zones).setInteractive({ useHandCursor: true })
                zone.on('pointerover', () => strip.setScale(1.03))
                zone.on('pointerout', () => strip.setScale(1))
                zone.on('pointerdown', () => {
                    strip.setScale(1)
                    onPick(i)
                })
                return zone
            })
        },
        disarmOffer() {
            stripZones.forEach(zone => zone.destroy())
            stripZones = []
        },
        async shakeOffer(index) {
            const strip = strips[index]
            if (!strip) return
            await FX.shake(scene, strip, { amount: 9, times: 5 })
            strip.setX(RECIPE.offerX)
        },
        async commit(index, objects) {
            recipe.disarmOffer()
            const picked = strips[index]
            const other = strips[1 - index]
            total = widthOf(objects.length)
            await FX.all(
                FX.to(scene, other, { y: H + 120, angle: 12, alpha: 0 }, { duration: TIMING.offerOut, ease: 'Sine.easeIn' }),
                FX.to(scene, picked, { x: RECIPE.x, y: RECIPE.y }, { duration: TIMING.offerOut, ease: 'Sine.easeInOut' }),
            )
            clearStrips()
            await recipe.show(objects, true)
        },
        offerRect(index) {
            const height = RECIPE.cardH + RECIPE.offerPad * 2 + 8
            const w = total + RECIPE.offerPad * 2 + 8
            if (index === undefined) {
                const top = RECIPE.offerY[0] - height / 2
                const bottom = RECIPE.offerY[1] + height / 2
                return { x: RECIPE.offerX, y: (top + bottom) / 2, w, h: bottom - top }
            }
            return { x: RECIPE.offerX, y: RECIPE.offerY[index], w, h: height }
        },
        light(index) {
            cards.forEach((card, i) => {
                const on = i === index
                card.lit.setVisible(on)
                scene.tweens.killTweensOf(card.box)
                card.box.setScale(on ? RECIPE.lit : 1).setX(slotX(i, total))
                if (on) layer.bringToTop(card.box)
            })
            const card = cards[index]
            if (card) void FX.popIn(scene, card.box, { from: 0.86, duration: 260 })
        },
        async done(index) {
            const card = cards[index]
            if (!card) return
            card.lit.setVisible(false)
            card.check.setVisible(true).setScale(1)
            card.icon.setAlpha(0.55)
            scene.tweens.killTweensOf(card.box)
            card.box.setAlpha(1).setScale(1)
            await FX.popIn(scene, card.check, { from: 0.3, duration: 260 })
        },
        async bump(index) {
            const card = cards[index]
            if (!card) return
            const base = card.box.scale
            await FX.to(scene, card.box, { scale: base * 1.2 }, { duration: 140, yoyo: true })
            card.box.setScale(base)
        },
        async shake(index) {
            const card = cards[index]
            if (!card) return
            await FX.shake(scene, card.box, { amount: 9, times: 5 })
        },
        clear() {
            cards.forEach(card => {
                scene.tweens.killTweensOf(card.box)
                card.box.destroy()
            })
            arrows.forEach(arrow => {
                scene.tweens.killTweensOf(arrow)
                arrow.destroy()
            })
            cards = []
            arrows = []
            total = 0
            string.setVisible(false)
        },
        rect: () => ({ x: layer.x, y: RECIPE.y, w: Math.max(total * layer.scaleX + 44, 160), h: RECIPE.cardH + 40 }),
        visible(on) {
            layer.setVisible(on)
        },
        dim(on) {
            scene.tweens.killTweensOf(layer)
            scene.tweens.add({ targets: layer, alpha: on ? RECIPE.dim : 1, duration: 260 })
        },
        destroy() {
            recipe.clear()
            clearStrips()
            layer.destroy()
        },
    }
    return recipe
}
