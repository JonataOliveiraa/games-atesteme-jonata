import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BOARD, CARD, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { CARD as WORDS } from '../data/words'
import type { BatherId, DogId } from '../types'
import { batherImage, dogImage } from './art'
import type { Chip } from './chip'

export interface OwnerCard {
    show(dog: DogId, owner: BatherId, chips: Chip[]): Promise<void>
    hide(): Promise<void>
    press(): void
    destroy(): void
}

export function createOwnerCard(scene: Phaser.Scene, onPop: (i: number) => void): OwnerCard {
    let parts: Phaser.GameObjects.GameObject[] = []
    let chips: Chip[] = []
    let zone: Phaser.GameObjects.Zone | undefined
    let release: (() => void) | undefined

    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        parts.push(obj)
        return obj
    }
    const done = () => {
        const r = release
        release = undefined
        r?.()
    }

    return {
        async show(dog, owner, taken) {
            chips = taken
            const veil = keep(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.veil))
            void FX.to(scene, veil, { fillAlpha: 0.45 }, { duration: 260 })

            const panel = scene.add.graphics()
            panel.fillStyle(C.shadow, 0.22)
            panel.fillRoundedRect(-CARD.w / 2 + 5, -CARD.h / 2 + 8, CARD.w, CARD.h, 30)
            panel.fillStyle(C.cream, 1)
            panel.fillRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 30)
            panel.lineStyle(5, C.ink, 1)
            panel.strokeRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 30)
            panel.fillStyle(C.sand, 1)
            panel.fillEllipse(0, CARD.feetY - 4, 300, 44)

            const title = scene.add
                .text(0, CARD.titleY, WORDS.title(dog), { fontFamily: FONT.black, fontSize: `${SIZE.cardTitle}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const person = batherImage(scene, owner, CARD.portraitH).setPosition(-46, CARD.feetY)
            const pet = dogImage(scene, dog, 'jump', 120).setPosition(76, CARD.feetY + 4)
            const line = scene.add
                .text(0, CARD.lineY, WORDS.line, { fontFamily: FONT.black, fontSize: `${SIZE.cardLine}px`, color: CSS.accent })
                .setOrigin(0.5)
                .setResolution(2)
                .setAlpha(0)

            const card = keep(scene.add.container(CARD.x, CARD.y, [panel, title, person, pet, line]).setDepth(DEPTH.card))
            await FX.popIn(scene, card, { from: 0.7, duration: 380 })

            const gap = BOARD.chipGap
            const total = chips.length * BOARD.chipW + (chips.length - 1) * gap
            for (let i = 0; i < chips.length; i++) {
                const chip = chips[i].box.setDepth(DEPTH.card + 2)
                const x = CARD.x - total / 2 + BOARD.chipW / 2 + i * (BOARD.chipW + gap)
                onPop(i)
                await FX.to(scene, chip, { x, y: CARD.y + CARD.chipsY }, { duration: 380, ease: 'Back.easeOut' })
            }
            await FX.to(scene, line, { alpha: 1 }, { duration: 260 })

            const bw = CARD.buttonW
            const bh = CARD.buttonH
            const btn = scene.add.graphics()
            btn.fillStyle(C.shadow, 0.2)
            btn.fillRoundedRect(-bw / 2 + 2, -bh / 2 + 4, bw, bh, bh / 2)
            btn.fillStyle(C.accent, 1)
            btn.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
            btn.lineStyle(3, C.ink, 1)
            btn.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
            const label = scene.add
                .text(0, 0, WORDS.next, { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color: inkOn(C.accent) })
                .setOrigin(0.5)
                .setResolution(2)
            const button = keep(scene.add.container(CARD.x, CARD.y + CARD.buttonY, [btn, label]).setDepth(DEPTH.card + 3))
            await FX.popIn(scene, button, { from: 0.6, duration: 260 })

            await new Promise<void>(resolve => {
                release = resolve
                zone = scene.add
                    .zone(CARD.x, CARD.y + CARD.buttonY, bw + 20, bh + 20)
                    .setDepth(DEPTH.card + 4)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    void FX.press(scene, button)
                    done()
                })
            })
        },
        async hide() {
            zone?.destroy()
            zone = undefined
            const all = [...parts, ...chips.map(c => c.box)]
            await FX.to(scene, all as unknown as Phaser.GameObjects.Container[], { alpha: 0 }, { duration: 240 })
            parts.forEach(p => p.destroy())
            chips.forEach(c => c.destroy())
            parts = []
            chips = []
        },
        press() {
            done()
        },
        destroy() {
            done()
            zone?.destroy()
            parts.forEach(p => p.destroy())
            chips.forEach(c => c.destroy())
        },
    }
}
