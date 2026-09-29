import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { DEPTH, OPTIONS, RUNG } from '../data/layout'
import { C } from '../data/theme'
import type { Art, Point } from '../types'
import { createArtView, type ArtView } from './board'

export interface Options {
    show(arts: Art[]): Promise<void>
    onTap(handler: (slot: number) => void): void
    setEnabled(on: boolean): void
    press(slot: number): void
    fly(slot: number, to: Point): Promise<void>
    clear(): Promise<void>
    rect(slot: number): GuideRect
    destroy(): void
}

interface Card {
    container: Phaser.GameObjects.Container
    pic: ArtView
    zone: Phaser.GameObjects.Zone
    art: Art
}

function paintCard(g: Phaser.GameObjects.Graphics) {
    const s = OPTIONS.card
    g.fillStyle(C.shadow, 0.14)
    g.fillRoundedRect(-s / 2 + 3, -s / 2 + 7, s, s, 28)
    g.fillStyle(C.paperLight, 1)
    g.fillRoundedRect(-s / 2, -s / 2, s, s, 28)
    g.lineStyle(5, C.ink, 1)
    g.strokeRoundedRect(-s / 2, -s / 2, s, s, 28)
}

export function createOptions(scene: Phaser.Scene): Options {
    let cards: Card[] = []
    let enabled = false
    let handler: ((slot: number) => void) | undefined
    const flying = new Set<ArtView>()

    const drop = (card: Card) => {
        FX.kill(scene, card.container)
        card.zone.destroy()
        card.pic.destroy()
        card.container.destroy()
    }

    const clearNow = () => {
        cards.forEach(drop)
        cards = []
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

    return {
        async show(arts) {
            clearNow()
            cards = arts.map((art, slot) => {
                const y = OPTIONS.ys[slot] ?? OPTIONS.ys[0]
                const bg = scene.add.graphics()
                paintCard(bg)
                const pic = createArtView(scene, 0, 0, OPTIONS.art)
                pic.set(art)
                const container = scene.add.container(OPTIONS.x, y, [bg, pic.container]).setDepth(DEPTH.options)
                const zone = scene.add
                    .zone(OPTIONS.x, y, OPTIONS.card + 24, OPTIONS.card + 16)
                    .setDepth(DEPTH.options + 1)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (enabled) handler?.(slot)
                })
                if (zone.input) zone.input.enabled = false
                return { container, pic, zone, art }
            })
            await FX.all(...cards.map((c, i) => FX.popIn(scene, c.container, { from: 0.5, delay: i * 140 })))
            setEnabled(enabled)
        },
        onTap(fn) {
            handler = fn
        },
        setEnabled,
        press(slot) {
            const card = cards[slot]
            if (!card) return
            FX.kill(scene, card.container)
            card.container.setScale(1)
            void FX.press(scene, card.container, 0.9)
        },
        async fly(slot, to) {
            const card = cards[slot]
            if (!card) return
            const from = { x: card.container.x, y: card.container.y }
            const view = createArtView(scene, from.x, from.y, OPTIONS.art)
            view.set(card.art)
            view.container.setDepth(DEPTH.flying)
            flying.add(view)
            card.pic.container.setVisible(false)
            void FX.to(scene, card.container, { alpha: 0.35, scale: 0.9 }, { duration: 200 })
            const target = view.container
            const peak = Math.min(from.y, to.y) - 90
            const end = RUNG.art / OPTIONS.art
            await new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: FX.ms(scene, OPTIONS.flyMs),
                    ease: 'Sine.easeInOut',
                    onUpdate: tween => {
                        if (!target.active) return
                        const t = tween.getValue() ?? 0
                        const x = Phaser.Math.Linear(from.x, to.x, t)
                        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * peak + t * t * to.y
                        target.setPosition(x, y).setScale(Phaser.Math.Linear(1, end, t)).setAngle(Math.sin(t * Math.PI) * -12)
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            flying.delete(view)
            view.destroy()
        },
        async clear() {
            const leaving = cards
            cards = []
            leaving.forEach(c => c.zone.destroy())
            await FX.all(...leaving.map(c => FX.to(scene, c.container, { alpha: 0, scale: 0.7 }, { duration: 220 })))
            leaving.forEach(c => {
                c.pic.destroy()
                c.container.destroy()
            })
        },
        rect(slot) {
            const y = OPTIONS.ys[slot] ?? OPTIONS.ys[0]
            return { x: OPTIONS.x, y, w: OPTIONS.card, h: OPTIONS.card }
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
