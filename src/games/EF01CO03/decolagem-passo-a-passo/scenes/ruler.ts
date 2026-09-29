import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { BANNER as BANNER_TEX, CARD_CELL, CARDS } from '../data/files'
import { BANNER, BENCH, DEPTH, RULER } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { sound } from './audio'
import type { CardView } from './bench'

export interface Ruler {
    readonly cardScale: number
    reset(slots: number): void
    place(card: CardView, slot: number): Promise<void>
    slotRect(slot: number): GuideRect
    replay(text: string): Promise<void>
    swap(a: number, b: number): Promise<void>
    clear(): void
    destroy(): void
}

function createBanner(scene: Phaser.Scene) {
    const art = scene.add.image(0, 0, BANNER_TEX)
    const text = scene.add
        .text(BANNER.midX - BANNER.texW / 2, BANNER.midY - BANNER.texH / 2, '', {
            fontFamily: FONT.black,
            fontSize: `${BANNER.fontSize}px`,
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setStroke(CSS.ink, 10)
    const container = scene.add
        .container(BANNER.x, BANNER.fromY, [art, text])
        .setScale(BANNER.w / BANNER.texW)
        .setDepth(DEPTH.banner)
        .setVisible(false)
    const say = (value: string) => {
        text.setText(value).setScale(1)
        text.setScale(
            Math.min(
                1,
                (BANNER.safeW * BANNER.fitW) / Math.max(1, text.width),
                (BANNER.safeH * BANNER.fitH) / Math.max(1, text.height),
            ),
        )
    }
    return { container, say }
}

export function createRuler(scene: Phaser.Scene): Ruler {
    let slots: Phaser.GameObjects.Container[] = []
    let placed: CardView[] = []
    let row = RULER.rows[3]
    const banner = createBanner(scene)

    const cardScale = () => row.h / BENCH.h

    const clear = () => {
        placed.forEach(card => card.container.active && card.container.destroy())
        placed = []
        slots.forEach(s => s.destroy())
        slots = []
        scene.tweens.killTweensOf(banner.container)
        banner.container.setVisible(false).setY(BANNER.fromY)
    }

    const slotRect = (i: number): GuideRect => ({ x: RULER.x, y: row.ys[i], w: RULER.w, h: row.h })

    const light = async () => {
        for (let i = 0; i < slots.length; i++) {
            const lit = slots[i].getData('lit') as Phaser.GameObjects.Graphics
            lit.clear()
            lit.fillStyle(C.gold, 0.55)
            lit.fillRoundedRect(-RULER.w / 2 - 12, -row.h / 2 - 12, RULER.w + 24, row.h + 24, 30)
            lit.setAlpha(0)
            sound()?.snap(i)
            const card = placed[i]
            await FX.all(
                FX.to(scene, lit, { alpha: 1 }, { duration: 220 }),
                card
                    ? FX.to(scene, card.container, { scale: cardScale() * 1.1 }, { duration: 200, yoyo: true })
                    : Promise.resolve(),
            )
            await FX.wait(scene, 240)
        }
    }

    return {
        get cardScale() {
            return cardScale()
        },
        reset(count) {
            clear()
            row = RULER.rows[count] ?? RULER.rows[3]
            for (let i = 0; i < count; i++) {
                const art = scene.add.image(0, 0, CARDS, CARD_CELL.slot).setScale(cardScale())
                const lit = scene.add.graphics()
                const slot = scene.add.container(RULER.x, row.ys[i], [lit, art]).setDepth(DEPTH.ruler)
                slot.setData('lit', lit)
                slots.push(slot)
            }
        },
        async place(card, slot) {
            const c = card.container
            const from = { x: c.x, y: c.y, scale: c.scale }
            const to = { x: RULER.x, y: row.ys[slot] }
            const control = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - RULER.arc }
            const state = { t: 0 }
            const target = cardScale()
            c.setDepth(DEPTH.flying)
            await FX.to(scene, c, { angle: 8 }, { duration: 120, ease: 'Sine.easeOut' })
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: state,
                    t: 1,
                    duration: RULER.flyMs,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const t = state.t
                        const u = 1 - t
                        c.x = u * u * from.x + 2 * u * t * control.x + t * t * to.x
                        c.y = u * u * from.y + 2 * u * t * control.y + t * t * to.y
                        c.setScale(Phaser.Math.Linear(from.scale, target, t)).setAngle(8 * u)
                    },
                    onComplete: () => resolve(),
                }),
            )
            c.setDepth(DEPTH.ruler + 1)
            placed[slot] = card
            await FX.to(scene, c, { scale: target * 1.08 }, { duration: 90, ease: 'Quad.easeOut' })
            await FX.to(scene, c, { scale: target }, { duration: 160, ease: 'Back.easeOut' })
            void FX.stars(scene, to.x, to.y, { count: 6, rise: 50, duration: 600, depth: DEPTH.ruler + 2 })
        },
        slotRect,
        async replay(text) {
            banner.say(text)
            banner.container.setVisible(true).setY(BANNER.fromY)
            void FX.to(scene, banner.container, { y: BANNER.y }, { duration: 620, ease: 'Bounce.easeOut' })
            await light()
            await FX.wait(scene, 1000)
        },
        async swap(a, b) {
            const first = placed[a]
            const second = placed[b]
            if (!first || !second) return
            const out = RULER.w * 0.35
            sound()?.swap()
            await FX.all(
                FX.to(scene, first.container, { x: RULER.x - out }, { duration: 220, ease: 'Sine.easeOut' }),
                FX.to(scene, second.container, { x: RULER.x + out }, { duration: 220, ease: 'Sine.easeOut' }),
            )
            await FX.all(
                FX.to(scene, first.container, { y: row.ys[b] }, { duration: 360, ease: 'Sine.easeInOut' }),
                FX.to(scene, second.container, { y: row.ys[a] }, { duration: 360, ease: 'Sine.easeInOut' }),
            )
            await FX.all(
                FX.to(scene, first.container, { x: RULER.x }, { duration: 220, ease: 'Back.easeOut' }),
                FX.to(scene, second.container, { x: RULER.x }, { duration: 220, ease: 'Back.easeOut' }),
            )
            placed[a] = second
            placed[b] = first
        },
        clear,
        destroy() {
            clear()
            banner.container.destroy()
        },
    }
}
