import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CHIPS, DEPTH, NOTE } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { ruleWord } from '../data/words'
import type { Collection, Note, Rule } from '../types'
import { createGlyph, createToyArt, SIZE_SCALE } from './toy'

export interface Builder {
    showNote(note: Note): Promise<void>
    hideNote(): Promise<void>
    pulseNote(): Promise<void>
    ask(options: Rule[], collection: Collection): Promise<number>
    send(index: number, to: { x: number; y: number }): Promise<void>
    cancel(): void
    readonly noteRect: { x: number; y: number; w: number; h: number }
    readonly chipsRect: { x: number; y: number; w: number; h: number }
    destroy(): void
}

export function createBuilder(scene: Phaser.Scene): Builder {
    let note: Phaser.GameObjects.Container | undefined
    let chips: Phaser.GameObjects.Container[] = []
    let pending: ((index: number) => void) | undefined

    const clearChips = () => {
        chips.forEach(chip => chip.destroy())
        chips = []
    }

    const onKey = (event: KeyboardEvent) => {
        const index = ['Digit1', 'Digit2', 'Digit3'].indexOf(event.code)
        if (index >= 0 && index < chips.length && pending) {
            const done = pending
            pending = undefined
            done(index)
        }
    }
    scene.input.keyboard?.on('keydown', onKey)

    const chipX = (i: number, count: number) => CHIPS.x + (i - (count - 1) / 2) * CHIPS.gap

    return {
        async showNote(data) {
            note?.destroy()
            const paper = scene.add.graphics()
            paper.fillStyle(C.shadow, 0.16)
            paper.fillRoundedRect(-NOTE.w / 2 + 4, -NOTE.h / 2 + 6, NOTE.w, NOTE.h, 18)
            paper.fillStyle(C.cream, 1)
            paper.fillRoundedRect(-NOTE.w / 2, -NOTE.h / 2, NOTE.w, NOTE.h, 18)
            paper.lineStyle(4, C.ink, 1)
            paper.strokeRoundedRect(-NOTE.w / 2, -NOTE.h / 2, NOTE.w, NOTE.h, 18)
            paper.fillStyle(C.ribbon, 1)
            paper.fillCircle(0, -NOTE.h / 2 + 4, 12)
            paper.strokeCircle(0, -NOTE.h / 2 + 4, 12)
            const text = scene.add
                .text(0, -NOTE.h / 2 + 22, data.text, {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.note}px`,
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: NOTE.w - 34 },
                    lineSpacing: 4,
                })
                .setOrigin(0.5, 0)
                .setResolution(2)
            const drawing = createToyArt(scene, data.drawing)
            drawing.setPosition(0, NOTE.h / 2 - 20).setScale(NOTE.drawing * SIZE_SCALE[data.drawing.size])
            note = scene.add.container(NOTE.x, NOTE.y, [paper, text, drawing]).setDepth(DEPTH.marks - 2).setAngle(-3)
            note.setY(NOTE.y - 40)
            note.setAlpha(0)
            await FX.to(scene, note, { y: NOTE.y, alpha: 1 }, { duration: 420, ease: 'Back.easeOut' })
        },
        async hideNote() {
            if (!note) return
            const old = note
            note = undefined
            await FX.to(scene, old, { alpha: 0, x: old.x - 60 }, { duration: 280 })
            old.destroy()
        },
        async pulseNote() {
            if (!note) return
            void FX.ping(scene, note.x, note.y, C.glow, { radius: 150, depth: DEPTH.marks })
            await FX.impact(scene, note, 0.1)
        },
        ask(options, collection) {
            clearChips()
            chips = options.map((rule, i) => {
                const bg = scene.add.graphics()
                bg.fillStyle(C.shadow, 0.16)
                bg.fillRoundedRect(-CHIPS.w / 2 + 3, -CHIPS.h / 2 + 5, CHIPS.w, CHIPS.h, 20)
                bg.fillStyle(C.cream, 1)
                bg.fillRoundedRect(-CHIPS.w / 2, -CHIPS.h / 2, CHIPS.w, CHIPS.h, 20)
                bg.lineStyle(4, C.ink, 1)
                bg.strokeRoundedRect(-CHIPS.w / 2, -CHIPS.h / 2, CHIPS.w, CHIPS.h, 20)
                const glyph = createGlyph(scene, rule, collection).setPosition(0, -16).setScale(1.15)
                const word = scene.add
                    .text(0, CHIPS.h / 2 - 20, ruleWord(rule), { fontFamily: FONT.black, fontSize: `${SIZE.chip}px`, color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2)
                const chip = scene.add.container(chipX(i, options.length), CHIPS.y, [bg, glyph, word]).setDepth(DEPTH.marks - 1)
                chip.setSize(CHIPS.w, CHIPS.h).setInteractive({ useHandCursor: true })
                chip.on('pointerdown', () => {
                    if (!pending) return
                    void FX.press(scene, chip)
                    const done = pending
                    pending = undefined
                    done(i)
                })
                void FX.popIn(scene, chip, { from: 0.5, delay: i * 80, duration: 320 })
                return chip
            })
            return new Promise<number>(resolve => {
                pending = resolve
            })
        },
        async send(index, to) {
            const chosen = chips[index]
            chips.forEach((chip, i) => {
                chip.disableInteractive()
                if (i !== index) void FX.to(scene, chip, { alpha: 0, scale: 0.7 }, { duration: 200 })
            })
            if (chosen) await FX.to(scene, chosen, { x: to.x, y: to.y, scale: 0.45, alpha: 0.2 }, { duration: 380 })
            clearChips()
        },
        cancel() {
            pending = undefined
            clearChips()
        },
        noteRect: { x: NOTE.x, y: NOTE.y, w: NOTE.w + 20, h: NOTE.h + 20 },
        chipsRect: { x: CHIPS.x, y: CHIPS.y, w: CHIPS.gap * 2 + CHIPS.w + 20, h: CHIPS.h + 20 },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            pending = undefined
            clearChips()
            note?.destroy()
        },
    }
}
