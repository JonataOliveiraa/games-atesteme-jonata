import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FILE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { DEPTH, HEADER, ORDER, ORDER_COMPACT } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { ORDER_WORD, WANT_WORD } from '../data/words'
import type { Round, Want } from '../types'

export interface Order {
    set(round: Round): Promise<void>
    rect(): { x: number; y: number; w: number; h: number }
    pulse(): void
    /** com o cabeçalho recolhido, o pedido sobe, encolhe e a pílula fica justa no conteúdo */
    setCompact(on: boolean): void
    destroy(): void
}

const CHIP_H = 52
const CHIP_PAD = 22
const WORDS_X = ORDER.h + 10
const CHIP_GAP = 14

const TONE: Record<Want, number> = {
    local: C.local,
    remoto: C.remote,
    removivel: C.remote,
    internet: C.internet,
}

export function createOrder(scene: Phaser.Scene): Order {
    const { h } = ORDER
    const g = scene.add.graphics()
    const icon = scene.add.image(0, 0, PIECE_SHEET.key, cellKey(0))
    const words = scene.add
        .text(0, 1, '', { fontFamily: FONT.black, fontSize: `${SIZE.order}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const story = scene.add
        .text(0, 1, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.situation}px`,
            color: CSS.ink,
            lineSpacing: 2,
            wordWrap: { width: ORDER.storyW - WORDS_X - 28 },
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const chipG = scene.add.graphics()
    const chipText = scene.add
        .text(0, 1, '', { fontFamily: FONT.black, fontSize: `${SIZE.order}px`, color: CSS.white, stroke: CSS.ink, strokeThickness: 6 })
        .setOrigin(0.5)
        .setResolution(2)
    const chip = scene.add.container(0, 0, [chipG, chipText])
    const body = scene.add.container(0, 0, [g, icon, words, story, chip]).setAlpha(0)
    const root = scene.add.container(ORDER.x, ORDER.y, [body]).setDepth(DEPTH.hud).setScrollFactor(0)

    let w: number = ORDER.w
    let chipW = 0
    let tightW: number = ORDER.w
    let telling = false
    const state = { k: 0 }

    const layout = () => {
        const k = state.k
        const pw = Phaser.Math.Linear(w, tightW, k)
        const left = -pw / 2
        g.clear()
        g.fillStyle(C.shadow, 0.16)
        g.fillRoundedRect(left + 3, -h / 2 + 5, pw, h, h / 2)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(left, -h / 2, pw, h, h / 2)
        g.lineStyle(4, C.ink, 1)
        g.strokeRoundedRect(left, -h / 2, pw, h, h / 2)
        g.fillStyle(C.cream, 1)
        g.fillCircle(left + h / 2, 0, h / 2 - 8)
        icon.setX(left + h / 2)
        words.setX(left + WORDS_X)
        story.setX(left + WORDS_X)
        chip.setX(words.x + words.width + CHIP_GAP + chipW / 2)
        root
            .setPosition(Phaser.Math.Linear(ORDER.x, ORDER_COMPACT.x, k), Phaser.Math.Linear(ORDER.y, ORDER_COMPACT.y, k))
            .setScale(Phaser.Math.Linear(1, ORDER_COMPACT.scale, k))
    }
    layout()

    return {
        async set(round) {
            icon.setFrame(cellKey(FILE_CELL[round.file]))
            icon.setScale(ORDER.icon / Math.max(icon.frame.width, icon.frame.height))
            telling = !!round.situation
            words.setVisible(!telling)
            chip.setVisible(!telling)
            story.setVisible(telling)
            if (telling) {
                story.setText(round.situation ?? '')
                w = ORDER.storyW
                chipW = 0
                tightW = w
            } else {
                words.setText(ORDER_WORD[round.want])
                chipText.setText(WANT_WORD[round.want])
                chipW = chipText.width + CHIP_PAD * 2
                w = ORDER.w
                tightW = Math.min(w, WORDS_X + words.width + CHIP_GAP + chipW + ORDER_COMPACT.padRight)
                chipG.clear()
                chipG.fillStyle(TONE[round.want], 1)
                chipG.fillRoundedRect(-chipW / 2, -CHIP_H / 2, chipW, CHIP_H, CHIP_H / 2)
                chipG.lineStyle(4, C.ink, 1)
                chipG.strokeRoundedRect(-chipW / 2, -CHIP_H / 2, chipW, CHIP_H, CHIP_H / 2)
            }
            layout()
            body.setAlpha(1)
            await FX.popIn(scene, body, { from: 0.7, duration: 320 })
            void FX.impact(scene, telling ? icon : chip, 0.18)
        },
        rect: () => ({ x: ORDER.x, y: ORDER.y, w: w + 20, h: ORDER.h + 16 }),
        pulse() {
            void FX.impact(scene, telling ? icon : chip, 0.15)
        },
        setCompact(on) {
            const k = on ? 1 : 0
            scene.tweens.killTweensOf(state)
            const duration = FX.ms(scene, HEADER.slideMs)
            if (duration <= 0 || state.k === k) {
                state.k = k
                layout()
                return
            }
            scene.tweens.add({ targets: state, k, duration, ease: 'Sine.easeOut', onUpdate: layout })
        },
        destroy() {
            scene.tweens.killTweensOf(state)
            root.destroy()
        },
    }
}
