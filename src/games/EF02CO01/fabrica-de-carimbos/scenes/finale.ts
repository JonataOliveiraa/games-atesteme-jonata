import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, FINALE, SIGN, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { ruleWord } from '../data/words'
import type { PhaseDef, Toy } from '../types'
import { createGlyph, createToyArt, SIZE_SCALE } from './toy'

export interface Finale {
    play(entries: { phase: PhaseDef; toys: Toy[] }[]): Promise<void>
    destroy(): void
}

export function createFinale(scene: Phaser.Scene): Finale {
    const parts: Phaser.GameObjects.GameObject[] = []

    const card = (phase: PhaseDef, toys: Toy[], x: number) => {
        const bg = scene.add.graphics()
        bg.fillStyle(C.shadow, 0.18)
        bg.fillRoundedRect(-FINALE.w / 2 + 4, -FINALE.h / 2 + 8, FINALE.w, FINALE.h, 28)
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-FINALE.w / 2, -FINALE.h / 2, FINALE.w, FINALE.h, 28)
        bg.lineStyle(5, C.ink, 1)
        bg.strokeRoundedRect(-FINALE.w / 2, -FINALE.h / 2, FINALE.w, FINALE.h, 28)
        bg.fillStyle(C.mint, 1)
        bg.fillRoundedRect(-FINALE.w / 2 + 16, -FINALE.h / 2 + 16, FINALE.w - 32, 118, 18)
        bg.lineStyle(3, C.ink, 1)
        bg.strokeRoundedRect(-FINALE.w / 2 + 16, -FINALE.h / 2 + 16, FINALE.w - 32, 118, 18)

        const items: Phaser.GameObjects.GameObject[] = [bg]
        const three = phase.stamp.length === 3
        const winW = three ? 100 : 140
        const gap = three ? 108 : 160
        phase.stamp.forEach((rule, k) => {
            const wx = (k - (phase.stamp.length - 1) / 2) * gap
            const frame = scene.add.graphics()
            frame.fillStyle(C.cream, 1)
            frame.fillRoundedRect(wx - winW / 2, -FINALE.h / 2 + 26, winW, 98, 14)
            frame.lineStyle(4, C.yes, 1)
            frame.strokeRoundedRect(wx - winW / 2, -FINALE.h / 2 + 26, winW, 98, 14)
            const glyph = createGlyph(scene, rule, phase.collection).setPosition(wx, -FINALE.h / 2 + 62).setScale(three ? 0.95 : 1.1)
            const word = scene.add
                .text(wx, -FINALE.h / 2 + 108, ruleWord(rule), { fontFamily: FONT.black, fontSize: three ? '14px' : '17px', color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            items.push(frame, glyph, word)
        })
        toys.forEach((toy, i) => {
            const art = createToyArt(scene, toy)
            art.setPosition((i - (toys.length - 1) / 2) * 104, FINALE.h / 2 - 22).setScale(0.76 * SIZE_SCALE[toy.size])
            items.push(art)
        })
        const container = scene.add.container(x, FINALE.y, items).setDepth(DEPTH.finale)
        parts.push(container)
        return container
    }

    return {
        async play(entries) {
            const start = W / 2 - ((entries.length - 1) / 2) * FINALE.gap
            for (let i = 0; i < entries.length; i++) {
                const c = card(entries[i].phase, entries[i].toys, start + i * FINALE.gap)
                await FX.popIn(scene, c, { from: 0.6, duration: 380 })
            }
            const sign = scene.add
                .text(SIGN.x, SIGN.y, 'SÓ O QUE IMPORTA!', {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.sign}px`,
                    color: CSS.white,
                    stroke: CSS.ink,
                    strokeThickness: 10,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.finale + 1)
            parts.push(sign)
            await FX.popIn(scene, sign, { from: 0.4, duration: 420 })
        },
        destroy() {
            parts.forEach(p => p.destroy())
            parts.length = 0
        },
    }
}
