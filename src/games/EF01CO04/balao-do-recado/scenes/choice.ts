import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_CELL, PIECES } from '../data/files'
import { BALLOON, CHOICE, DEPTH, H } from '../data/layout'
import { C } from '../data/theme'
import type { Form, Message, Point } from '../types'
import type { Balloon } from './balloon'
import { createFormView, createPic } from './pic'
import type { RecipientWindow } from './window'

export interface Choice {
    show(forms: Form[], message: Message): Promise<void>
    onTap(handler: (slot: number) => void): void
    setEnabled(on: boolean): void
    fly(slot: number, to: Point, fall?: boolean): Promise<void>
    clear(): Promise<void>
    points(): Point[]
    readonly size: number
    destroy(): void
}

interface Card {
    frame: Phaser.GameObjects.Container
    form: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
}

function paintFrame(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(-s / 2 + 3, -s / 2 + 8, s, s, 30)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-s / 2, -s / 2, s, s, 30)
    g.lineStyle(5, C.ink, 1)
    g.strokeRoundedRect(-s / 2, -s / 2, s, s, 30)
}

function paintDots(g: Phaser.GameObjects.Graphics, from: Point, to: Point) {
    const a = new Phaser.Math.Vector2(from.x, from.y)
    const b = new Phaser.Math.Vector2(to.x, to.y)
    const count = Math.max(4, Math.round(a.distance(b) / 34))
    for (let i = 1; i <= count; i++) {
        const p = a.clone().lerp(b, i / (count + 1))
        g.fillStyle(C.ink, 0.3)
        g.fillCircle(p.x, p.y + 2, 8)
        g.fillStyle(C.white, 1)
        g.fillCircle(p.x, p.y, 7)
        g.fillStyle(C.gold, 1)
        g.fillCircle(p.x, p.y, 4)
    }
}


export function createChoice(scene: Phaser.Scene, deps: { balloon: Balloon; window: RecipientWindow }): Choice {
    let cards: Card[] = []
    let geo = CHOICE.sets[2]
    const slotY = (slot: number) => geo.ys[slot] ?? geo.ys[0]
    let enabled = false
    let handler: ((slot: number) => void) | undefined
    const loose = new Set<Phaser.GameObjects.Container>()
    const trails = scene.add.graphics().setDepth(DEPTH.choice - 1)

    const dropCard = (card: Card) => {
        FX.kill(scene, [card.frame, card.form])
        card.zone.destroy()
        card.frame.destroy()
        if (!loose.has(card.form)) card.form.destroy()
    }

    const setEnabled = (on: boolean) => {
        enabled = on
        cards.forEach(c => {
            if (c.zone.input) c.zone.input.enabled = on
        })
    }

    const onKey = (event: KeyboardEvent) => {
        const n = Number(event.key)
        if (!enabled || !Number.isInteger(n) || n < 1 || n > cards.length) return
        handler?.(n - 1)
    }
    scene.input.keyboard?.on('keydown', onKey)

    const split = async (from: Point, message: Message) => {
        const paper = createPic(scene, 0, 0, BALLOON.message * 1.3)
        paper.set(PIECES, PIECE_CELL.note, 'note')
        const drawing = createPic(scene, 0, 6, BALLOON.message * 0.72)
        drawing.set(PIECES, message.icon, message.id)
        const note = scene.add.container(from.x, from.y, [paper.container, drawing.container]).setDepth(DEPTH.flying)
        await FX.to(scene, note, { x: CHOICE.x - 120, y: (slotY(0) + slotY(geo.ys.length - 1)) / 2, scale: 1.4 }, { duration: 420, ease: 'Sine.easeOut' })
        await FX.impact(scene, note, 0.16)
        return note
    }

    return {
        async show(forms, message) {
            cards.forEach(dropCard)
            trails.clear()
            geo = CHOICE.sets[forms.length] ?? CHOICE.sets[2]
            const from = deps.balloon.releaseNote()
            const note = await split(from, message)
            const origin = { x: note.x, y: note.y }

            cards = forms.map((form, slot) => {
                const y = slotY(slot)
                const bg = scene.add.graphics()
                paintFrame(bg, geo.card)
                const frame = scene.add.container(origin.x, origin.y, [bg]).setDepth(DEPTH.choice).setScale(0.3)
                const view = createFormView(scene, origin.x, origin.y, geo.art, form, message)
                    .setDepth(DEPTH.choice + 1)
                    .setScale(0.3)
                const zone = scene.add
                    .zone(CHOICE.x, y, geo.card + 20, Math.min(geo.card + 20, geo.ys[1] - geo.ys[0] - 4))
                    .setDepth(DEPTH.choice + 2)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (!enabled) return
                    void FX.press(scene, frame, 0.92)
                    handler?.(slot)
                })
                if (zone.input) zone.input.enabled = false
                return { frame, form: view, zone }
            })

            void FX.to(scene, note, { alpha: 0, scale: 0.6 }, { duration: 260 }).then(() => note.destroy())
            await FX.all(
                ...cards.map((c, slot) =>
                    FX.to(scene, [c.frame, c.form], { x: CHOICE.x, y: slotY(slot), scale: 1 }, { duration: CHOICE.splitMs, ease: 'Back.easeOut' }),
                ),
            )

            const to = deps.window.target
            trails.setAlpha(0)
            cards.forEach((_, slot) => paintDots(trails, { x: CHOICE.x + geo.card / 2 + 6, y: slotY(slot) }, to))
            await FX.to(scene, trails, { alpha: 1 }, { duration: 260 })
            setEnabled(enabled)
        },
        onTap(fn) {
            handler = fn
        },
        setEnabled,
        async fly(slot, to, fall = false) {
            const card = cards[slot]
            if (!card) return
            void FX.to(scene, trails, { alpha: 0 }, { duration: 200 })
            const target = card.form
            loose.add(target)
            target.setDepth(DEPTH.flying)
            void FX.to(scene, card.frame, { alpha: 0.35, scale: 0.9 }, { duration: 200 })
            const from = { x: target.x, y: target.y }
            const peak = Math.min(from.y, to.y) - 120
            const stopAt = fall ? 0.55 : 1
            await new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: stopAt,
                    duration: FX.ms(scene, CHOICE.flyMs * stopAt),
                    ease: fall ? 'Sine.easeOut' : 'Sine.easeInOut',
                    onUpdate: tween => {
                        if (!target.active) return
                        const t = tween.getValue() ?? 0
                        const x = Phaser.Math.Linear(from.x, to.x, t)
                        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * peak + t * t * to.y
                        const shrink = fall ? 1 - t * 0.6 : 1 - t * CHOICE.flyShrink
                        target.setPosition(x, y).setScale(shrink)
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            if (fall && target.active) {
                await FX.to(scene, target, { y: H + 80, angle: 160, scale: 0.25 }, { duration: 760, ease: 'Quad.easeIn' })
            } else if (target.active) {
                await FX.to(scene, target, { scale: 0.2, alpha: 0 }, { duration: 220 })
            }
            loose.delete(target)
            target.destroy()
        },
        async clear() {
            const leaving = cards
            cards = []
            leaving.forEach(c => c.zone.destroy())
            await FX.all(
                FX.to(scene, trails, { alpha: 0 }, { duration: 200 }),
                ...leaving.flatMap(c =>
                    [c.frame, c.form]
                        .filter(o => o.active)
                        .map(o => FX.to(scene, o, { alpha: 0, scale: 0.7 }, { duration: 220 })),
                ),
            )
            if (trails.active) trails.clear()
            leaving.forEach(c => {
                c.frame.destroy()
                if (!loose.has(c.form) && c.form.active) c.form.destroy()
            })
        },
        points() {
            return geo.ys.slice(0, Math.max(cards.length, 2)).map(y => ({ x: CHOICE.x, y }))
        },
        get size() {
            return geo.card
        },
        destroy() {
            handler = undefined
            scene.input.keyboard?.off('keydown', onKey)
            cards.forEach(dropCard)
            cards = []
            loose.forEach(c => c.destroy())
            loose.clear()
            trails.destroy()
        },
    }
}
