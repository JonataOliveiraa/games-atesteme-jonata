import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { PIECE, PIECES, PIECE_SIZE } from '../data/files'
import { BOARD, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export interface Board {
    readonly slot: { x: number; y: number }
    reset(): void
    write(n: number): void
    lightDot(k: number): void
    flash(step: 'brush' | 'step'): void
    reveal(n: number): Promise<void>
    destroy(): void
}

export function createBoard(scene: Phaser.Scene): Board {
    const icon = (frame: number, x: number, size: number) =>
        scene.add.image(x, BOARD.cy, PIECES, frame).setDepth(DEPTH.board + 1).setScale(size / PIECE_SIZE)

    const loop = icon(PIECE.loop, BOARD.loopX, BOARD.loopSize)
    const brush = icon(PIECE.brush, BOARD.brushX, BOARD.iconSize)
    const step = icon(PIECE.step, BOARD.stepX, BOARD.iconSize)
    const times = scene.add
        .text(BOARD.timesX, BOARD.cy, '×', { fontFamily: FONT.black, fontSize: `${SIZE.times}px`, color: CSS.chalk })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.board + 1)

    const slotBox = scene.add.graphics().setDepth(DEPTH.board + 1)
    const paintSlot = (filled: boolean) => {
        const s = BOARD.slotSize
        slotBox.clear()
        slotBox.fillStyle(filled ? C.white : C.boardDark, 1)
        slotBox.fillRoundedRect(BOARD.slotX - s / 2, BOARD.cy - s / 2, s, s, 22)
        if (!filled) {
            slotBox.lineStyle(5, C.dotOff, 1)
            slotBox.strokeRoundedRect(BOARD.slotX - s / 2, BOARD.cy - s / 2, s, s, 22)
        }
    }
    const slotText = scene.add
        .text(BOARD.slotX, BOARD.cy + 2, '?', { fontFamily: FONT.black, fontSize: `${SIZE.slot}px`, color: CSS.chalk })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.board + 2)

    const dots = scene.add.graphics().setDepth(DEPTH.board + 1)
    let count = 0
    let lit = 0
    const paintDots = () => {
        dots.clear()
        const x0 = BOARD.x + BOARD.w / 2 - ((count - 1) * BOARD.dotGap) / 2
        for (let i = 0; i < count; i++) {
            dots.fillStyle(i < lit ? C.hint : C.dotOff, 1)
            dots.fillCircle(x0 + i * BOARD.dotGap, BOARD.dotsY, BOARD.dotR)
        }
    }

    const reset = () => {
        count = 0
        lit = 0
        paintDots()
        paintSlot(false)
        slotText.setText('?').setColor(CSS.chalk).setScale(1)
        ;[brush, step].forEach(i => i.setScale(BOARD.iconSize / PIECE_SIZE))
    }
    reset()

    return {
        slot: { x: BOARD.slotX, y: BOARD.cy },
        reset,
        write(n) {
            count = n
            lit = 0
            paintDots()
            paintSlot(true)
            slotText.setText(String(n)).setColor(CSS.ink)
            void FX.impact(scene, slotText, 0.3)
            void FX.to(scene, loop, { angle: 360 }, { duration: 500, ease: Ease.smooth }).then(() => loop.setAngle(0))
        },
        lightDot(k) {
            lit = k + 1
            paintDots()
        },
        flash(which) {
            const target = which === 'brush' ? brush : step
            const base = BOARD.iconSize / PIECE_SIZE
            scene.tweens.killTweensOf(target)
            target.setScale(base * 1.35)
            void FX.to(scene, target, { scale: base }, { duration: 320, ease: Ease.smooth })
        },
        async reveal(n) {
            slotText.setText(String(n)).setColor(CSS.ink)
            paintSlot(true)
            await FX.to(scene, slotText, { scale: 1.35 }, { duration: 260, yoyo: true, repeat: 2 })
            slotText.setScale(1)
        },
        destroy() {
            ;[loop, brush, step, times, slotBox, slotText, dots].forEach(o => o.destroy())
        },
    }
}
