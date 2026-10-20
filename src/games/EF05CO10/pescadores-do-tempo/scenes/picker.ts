import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, PICKER, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Rect } from '../types'
import type { Audio } from './audio'

export interface PickOption {
    art: { key: string; frame: string }
    label: string
}

export interface Picker {
    show(title: string, options: PickOption[]): Promise<void>
    choose(): Promise<number>
    rect(): Rect
    hide(): Promise<void>
    destroy(): void
}

interface Item {
    box: Phaser.GameObjects.Container
    g: Phaser.GameObjects.Graphics
    label: Phaser.GameObjects.Text
    zone: Phaser.GameObjects.Zone
}

const xs = [W / 2 - PICKER.w - PICKER.gap, W / 2, W / 2 + PICKER.w + PICKER.gap]

export function createPicker(scene: Phaser.Scene, audio: Audio): Picker {
    const shade = scene.add.rectangle(0, 0, W, H, C.veil, 0.62).setOrigin(0).setDepth(DEPTH.cards).setVisible(false)
    const title = scene.add
        .text(W / 2, PICKER.titleY, '', { fontFamily: FONT.black, fontSize: '46px', color: CSS.white, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
        .setStroke('#2b2440', 8)
        .setDepth(DEPTH.cards + 1)
        .setVisible(false)
    let items: Item[] = []
    let answer: ((index: number) => void) | null = null

    const paintCard = (g: Phaser.GameObjects.Graphics, face: number, edge: number) => {
        const { w, h } = PICKER
        g.clear()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 12, w, h, 28)
        g.fillStyle(edge, 1)
        g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 28)
        g.fillStyle(face, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
    }

    const clear = () => {
        items.forEach(it => {
            it.zone.destroy()
            it.box.destroy()
        })
        items = []
    }

    const pick = async (index: number) => {
        if (!answer || !items[index]) return
        const done = answer
        answer = null
        items.forEach(it => it.zone.input && (it.zone.input.enabled = false))
        const it = items[index]
        void FX.press(scene, it.box)
        audio.cheer()
        paintCard(it.g, C.yes, C.fishBtnDark)
        it.label.setColor(CSS.white)
        void FX.sparks(scene, it.box.x, it.box.y, { color: C.butter, count: 18, spread: 170, size: 10, duration: 650, depth: DEPTH.cards + 4 })
        items.forEach(o => o !== it && FX.to(scene, o.box, { alpha: 0.35 }, { duration: 260 }))
        await FX.wait(scene, 900)
        done(index)
    }

    const onKey = (event: KeyboardEvent) => {
        if (!answer) return
        const n = Number(event.key)
        if (n >= 1 && n <= items.length) void pick(n - 1)
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        async show(text, options) {
            clear()
            shade.setVisible(true).setAlpha(0)
            title.setText(text).setVisible(true).setAlpha(0)
            void FX.to(scene, shade, { alpha: 1 }, { duration: 260 })
            void FX.to(scene, title, { alpha: 1 }, { duration: 260 })
            items = options.slice(0, xs.length).map((o, i) => {
                const g = scene.add.graphics()
                paintCard(g, C.white, C.creamDark)
                const art = scene.add.image(0, -PICKER.h / 2 + 22 + PICKER.art / 2, o.art.key, o.art.frame)
                art.setScale(PICKER.art / Math.max(art.width, art.height))
                const label = scene.add
                    .text(0, PICKER.h / 2 - 44, o.label, {
                        fontFamily: FONT.black,
                        fontSize: '30px',
                        color: CSS.ink,
                        align: 'center',
                        wordWrap: { width: PICKER.w - 36, useAdvancedWrap: true },
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                const box = scene.add.container(xs[i], PICKER.y, [g, art, label]).setDepth(DEPTH.cards + 2).setScale(0.6).setAlpha(0)
                const zone = scene.add
                    .zone(xs[i], PICKER.y, PICKER.w, PICKER.h + 12)
                    .setDepth(DEPTH.cards + 3)
                    .setInteractive({ useHandCursor: true })
                if (zone.input) zone.input.enabled = false
                zone.on('pointerdown', () => void pick(i))
                return { box, g, label, zone }
            })
            await FX.all(
                ...items.map((it, i) =>
                    FX.wait(scene, i * 160).then(() => {
                        audio.plop()
                        return FX.to(scene, it.box, { scale: 1, alpha: 1 }, { duration: TIMING.cards, ease: 'Back.easeOut' })
                    }),
                ),
            )
        },
        choose() {
            items.forEach(it => it.zone.input && (it.zone.input.enabled = true))
            return new Promise<number>(resolve => (answer = resolve))
        },
        rect: () => ({ x: xs[0] - PICKER.w / 2 - 14, y: PICKER.y - PICKER.h / 2 - 14, w: xs[2] - xs[0] + PICKER.w + 28, h: PICKER.h + 36 }),
        async hide() {
            answer = null
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
            answer = null
            clear()
            shade.destroy()
            title.destroy()
        },
    }
}
