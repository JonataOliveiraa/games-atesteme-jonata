import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FILE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { DEPTH, ORDER } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { KIND_WORD, ORDER_WORD } from '../data/words'
import type { FileId, Kind } from '../types'

export interface Order {
    set(file: FileId, want: Kind): Promise<void>
    rect(): { x: number; y: number; w: number; h: number }
    pulse(): void
    destroy(): void
}

const CHIP_H = 52
const CHIP_PAD = 22

export function createOrder(scene: Phaser.Scene): Order {
    const { w, h } = ORDER
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.16)
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillStyle(C.cream, 1)
    g.fillCircle(-w / 2 + h / 2, 0, h / 2 - 8)
    const icon = scene.add.image(-w / 2 + h / 2, 0, PIECE_SHEET.key, cellKey(0))
    const words = scene.add
        .text(-w / 2 + h + 10, 1, ORDER_WORD, { fontFamily: FONT.black, fontSize: `${SIZE.order}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const chipG = scene.add.graphics()
    const chipText = scene.add
        .text(0, 1, '', { fontFamily: FONT.black, fontSize: `${SIZE.order}px`, color: CSS.white, stroke: CSS.ink, strokeThickness: 6 })
        .setOrigin(0.5)
        .setResolution(2)
    const chip = scene.add.container(0, 0, [chipG, chipText])
    const root = scene.add.container(ORDER.x, ORDER.y, [g, icon, words, chip]).setDepth(DEPTH.hud).setScrollFactor(0).setAlpha(0)

    return {
        async set(file, want) {
            icon.setFrame(cellKey(FILE_CELL[file]))
            icon.setScale(ORDER.icon / Math.max(icon.frame.width, icon.frame.height))
            chipText.setText(KIND_WORD[want])
            const cw = chipText.width + CHIP_PAD * 2
            const tone = want === 'remoto' ? C.remote : C.local
            chipG.clear()
            chipG.fillStyle(tone, 1)
            chipG.fillRoundedRect(-cw / 2, -CHIP_H / 2, cw, CHIP_H, CHIP_H / 2)
            chipG.lineStyle(4, C.ink, 1)
            chipG.strokeRoundedRect(-cw / 2, -CHIP_H / 2, cw, CHIP_H, CHIP_H / 2)
            chip.setX(words.x + words.width + 14 + cw / 2)
            root.setAlpha(1)
            await FX.popIn(scene, root, { from: 0.7, duration: 320 })
            void FX.impact(scene, chip, 0.18)
        },
        rect: () => ({ x: ORDER.x, y: ORDER.y, w: ORDER.w + 20, h: ORDER.h + 16 }),
        pulse() {
            void FX.impact(scene, chip, 0.15)
        },
        destroy() {
            root.destroy()
        },
    }
}
