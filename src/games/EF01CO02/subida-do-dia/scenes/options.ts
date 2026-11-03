import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, OPTIONS, RUNG } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Art, Point, Rect } from '../types'
import { cardImage, createArtView, type ArtView } from './art'

export interface Options {
    show(arts: Art[]): Promise<void>
    onTap(handler: (slot: number) => void): void
    setEnabled(on: boolean): void
    press(slot: number): void
    fly(slot: number, to: Point): Promise<void>
    clear(): Promise<void>
    point(slot: number): Point
    rect(slot: number): Rect
    readonly allRect: Rect
    destroy(): void
}

interface Card {
    container: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Graphics
    pic: ArtView
    zone: Phaser.GameObjects.Zone
    art: Art
}

export function createOptions(scene: Phaser.Scene, count: 2 | 3): Options {
    const spec = count === 3 ? OPTIONS.three : OPTIONS.two
    let cards: Card[] = []
    let enabled = false
    let handler: ((slot: number) => void) | undefined
    let pulse: Phaser.Tweens.Tween | undefined
    const flying = new Set<ArtView>()

    const stopPulse = () => {
        pulse?.remove()
        pulse = undefined
        cards.forEach(c => c.ring.setVisible(false).setAlpha(1))
    }

    const startPulse = () => {
        stopPulse()
        if (!cards.length) return
        cards.forEach(c => c.ring.setVisible(true).setAlpha(0.35))
        pulse = scene.tweens.add({
            targets: cards.map(c => c.ring),
            alpha: 1,
            duration: 520,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    const drop = (card: Card) => {
        FX.kill(scene, card.container)
        card.zone.destroy()
        card.pic.destroy()
        card.container.destroy()
    }

    const clearNow = () => {
        stopPulse()
        cards.forEach(drop)
        cards = []
    }

    const setEnabled = (on: boolean) => {
        enabled = on
        cards.forEach(c => {
            if (c.zone.input) c.zone.input.enabled = on
        })
        if (on) startPulse()
        else stopPulse()
    }

    const onKey = (event: KeyboardEvent) => {
        const n = Number(event.key)
        if (!enabled || !Number.isInteger(n) || n < 1 || n > cards.length) return
        handler?.(n - 1)
    }
    scene.input.keyboard?.on('keydown', onKey)

    const y = (slot: number) => spec.ys[slot] ?? spec.ys[0]
    const s = spec.card

    return {
        async show(arts) {
            clearNow()
            cards = arts.map((art, slot) => {
                const ring = scene.add.graphics()
                ring.lineStyle(9, C.gold, 1)
                ring.strokeRoundedRect(-s / 2 - 9, -s / 2 - 9, s + 18, s + 24, 32)
                ring.setVisible(false)
                const pic = createArtView(scene, 0, 0, spec.art)
                pic.set(art)
                const container = scene.add
                    .container(OPTIONS.x, y(slot), [ring, cardImage(scene, `sdd-option-${s}`, s, s, 28), pic.container])
                    .setScrollFactor(0)
                    .setDepth(DEPTH.options)
                const zone = scene.add
                    .zone(OPTIONS.x, y(slot), s + 30, s + 22)
                    .setScrollFactor(0)
                    .setDepth(DEPTH.options + 1)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (enabled) handler?.(slot)
                })
                if (zone.input) zone.input.enabled = false
                return { container, ring, pic, zone, art }
            })
            await FX.all(...cards.map((c, i) => FX.popIn(scene, c.container, { from: 0.5, delay: i * 160 })))
            setEnabled(enabled)
        },
        onTap(fn) {
            handler = fn
        },
        setEnabled,
        press(slot) {
            const card = cards[slot]
            if (!card) return
            stopPulse()
            FX.kill(scene, card.container)
            card.container.setScale(1)
            void FX.press(scene, card.container, 0.9)
        },
        async fly(slot, to) {
            const card = cards[slot]
            if (!card) return
            const from = { x: card.container.x, y: card.container.y }
            const view = createArtView(scene, from.x, from.y, spec.art)
            view.set(card.art)
            view.container.setScrollFactor(0).setDepth(DEPTH.flying + 40)
            flying.add(view)
            card.pic.container.setVisible(false)
            void FX.to(scene, card.container, { alpha: 0.35, scale: 0.9 }, { duration: 200 })
            const target = view.container
            const peak = Math.min(from.y, to.y) - 90
            const end = RUNG.art / spec.art
            await new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: FX.ms(scene, TIMING.fly),
                    ease: 'Sine.easeInOut',
                    onUpdate: tween => {
                        if (!target.active) return
                        const t = tween.getValue() ?? 0
                        const x = Phaser.Math.Linear(from.x, to.x, t)
                        const yy = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * peak + t * t * to.y
                        target.setPosition(x, yy).setScale(Phaser.Math.Linear(1, end, t)).setAngle(Math.sin(t * Math.PI) * -12)
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            flying.delete(view)
            view.destroy()
        },
        async clear() {
            stopPulse()
            const leaving = cards
            cards = []
            leaving.forEach(c => c.zone.destroy())
            await FX.all(...leaving.map(c => FX.to(scene, c.container, { alpha: 0, scale: 0.7 }, { duration: 220 })))
            leaving.forEach(c => {
                c.pic.destroy()
                c.container.destroy()
            })
        },
        point(slot) {
            return { x: OPTIONS.x, y: y(slot) }
        },
        rect(slot) {
            return { x: OPTIONS.x, y: y(slot), w: s + 20, h: s + 20 }
        },
        allRect: {
            x: OPTIONS.x,
            y: (spec.ys[0] + spec.ys[spec.ys.length - 1]) / 2,
            w: s + 40,
            h: spec.ys[spec.ys.length - 1] - spec.ys[0] + s + 40,
        },
        destroy() {
            handler = undefined
            scene.input.keyboard?.off('keydown', onKey)
            flying.forEach(v => v.destroy())
            flying.clear()
            clearNow()
        },
    }
}
