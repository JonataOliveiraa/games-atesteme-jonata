import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CARDS, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Question, Rect } from '../types'
import type { Audio } from './audio'

export interface Cards {
    show(q: Question): Promise<void>
    choose(): Promise<boolean>
    rect(): Rect
    hide(): Promise<void>
    destroy(): void
}

const xs = [W / 2 - CARDS.w - CARDS.gap, W / 2, W / 2 + CARDS.w + CARDS.gap]

export function createCards(scene: Phaser.Scene, audio: Audio): Cards {
    const shade = scene.add.rectangle(0, 0, W, H, C.veil, 0.62).setOrigin(0).setDepth(DEPTH.cards).setVisible(false)
    const title = scene.add
        .text(W / 2, CARDS.titleY, '', { fontFamily: FONT.black, fontSize: '46px', color: CSS.white, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
        .setStroke('#2b2440', 8)
        .setDepth(DEPTH.cards + 1)
        .setVisible(false)
    let items: { box: Phaser.GameObjects.Container; g: Phaser.GameObjects.Graphics; zone: Phaser.GameObjects.Zone; right: boolean }[] = []
    let answer: ((ok: boolean) => void) | null = null

    const paintCard = (g: Phaser.GameObjects.Graphics, face: number, edge: number) => {
        const { w, h } = CARDS
        g.clear()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 10, w, h, 26)
        g.fillStyle(edge, 1)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 26)
        g.fillStyle(face, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
    }

    const clear = () => {
        items.forEach(it => {
            it.zone.destroy()
            it.box.destroy()
        })
        items = []
    }

    const pick = async (index: number) => {
        if (!answer) return
        const done = answer
        answer = null
        items.forEach(it => it.zone.input && (it.zone.input.enabled = false))
        const it = items[index]
        void FX.press(scene, it.box)
        if (it.right) {
            audio.cheer()
            paintCard(it.g, C.yes, 0x2c9452)
            ;(it.box.list[1] as Phaser.GameObjects.Text).setColor(CSS.white)
            void FX.sparks(scene, it.box.x, it.box.y, { color: C.butter, count: 18, spread: 160, size: 10, duration: 650, depth: DEPTH.cards + 3 })
            items.forEach(o => o !== it && FX.to(scene, o.box, { alpha: 0.35 }, { duration: 260 }))
            await FX.wait(scene, 900)
            done(true)
            return
        }
        audio.miss()
        paintCard(it.g, C.oops, 0xd9743a)
        await FX.shake(scene, it.box, { amount: 12 })
        const good = items.find(o => o.right)
        if (good) {
            paintCard(good.g, C.yes, 0x2c9452)
            ;(good.box.list[1] as Phaser.GameObjects.Text).setColor(CSS.white)
            void FX.to(scene, good.box, { scale: 1.08 }, { duration: 260, yoyo: true, repeat: 1 })
        }
        done(false)
    }

    const onKey = (event: KeyboardEvent) => {
        const n = Number(event.key)
        if (n >= 1 && n <= items.length) void pick(n - 1)
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        async show(q) {
            clear()
            const options = Phaser.Utils.Array.Shuffle([
                { text: q.right, right: true },
                { text: q.wrong[0], right: !!q.free },
                { text: q.wrong[1], right: !!q.free },
            ])
            shade.setVisible(true).setAlpha(0)
            title.setText(q.title).setVisible(true).setAlpha(0)
            void FX.to(scene, shade, { alpha: 1 }, { duration: 260 })
            void FX.to(scene, title, { alpha: 1 }, { duration: 260 })
            items = options.map((o, i) => {
                const g = scene.add.graphics()
                paintCard(g, C.white, C.creamDark)
                const text = scene.add
                    .text(0, 0, o.text, {
                        fontFamily: FONT.black,
                        fontSize: '28px',
                        color: CSS.ink,
                        align: 'center',
                        wordWrap: { width: CARDS.w - 48, useAdvancedWrap: true },
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                const box = scene.add.container(xs[i], CARDS.y, [g, text]).setDepth(DEPTH.cards + 2).setScale(0.6).setAlpha(0)
                const zone = scene.add
                    .zone(xs[i], CARDS.y, CARDS.w, CARDS.h + 12)
                    .setDepth(DEPTH.cards + 3)
                    .setInteractive({ useHandCursor: true })
                if (zone.input) zone.input.enabled = false
                zone.on('pointerdown', () => void pick(i))
                return { box, g, zone, right: o.right }
            })
            await FX.all(...items.map((it, i) => FX.wait(scene, i * 120).then(() => FX.to(scene, it.box, { scale: 1, alpha: 1 }, { duration: TIMING.cards, ease: 'Back.easeOut' }))))
        },
        choose() {
            items.forEach(it => it.zone.input && (it.zone.input.enabled = true))
            return new Promise<boolean>(resolve => (answer = resolve))
        },
        rect: () => ({ x: xs[0] - CARDS.w / 2 - 14, y: CARDS.y - CARDS.h / 2 - 14, w: xs[2] - xs[0] + CARDS.w + 28, h: CARDS.h + 34 }),
        async hide() {
            await FX.all(
                FX.to(scene, shade, { alpha: 0 }, { duration: 260 }),
                FX.to(scene, title, { alpha: 0 }, { duration: 260 }),
                ...items.map(it => FX.to(scene, it.box, { alpha: 0, scale: 0.8 }, { duration: 260 })),
            )
            shade.setVisible(false)
            title.setVisible(false)
            clear()
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            clear()
            shade.destroy()
            title.destroy()
        },
    }
}
