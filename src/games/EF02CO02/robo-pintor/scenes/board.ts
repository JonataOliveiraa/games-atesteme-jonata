import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { PIECE, PIECES, PIECE_SIZE } from '../data/files'
import { BOARD, DEPTH, boardRow } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Rect } from '../types'

export interface Board {
    setProgram(colors: number[], values?: number[]): void
    slot(r: number): { x: number; y: number }
    slotRect(r: number): Rect
    write(r: number, n: number): void
    clearSlot(r: number): void
    mark(r: number | null): void
    lightDot(r: number, k: number): void
    flash(r: number, step: 'brush' | 'step'): void
    reveal(values: number[]): Promise<void>
    onSlot(cb: (r: number) => void): void
    setSlotsEnabled(on: boolean): void
    destroy(): void
}

interface Row {
    cy: number
    s: number
    x: (x: number) => number
    parts: Phaser.GameObjects.GameObject[]
    brush: Phaser.GameObjects.Image
    step: Phaser.GameObjects.Image
    loop: Phaser.GameObjects.Image
    slotBox: Phaser.GameObjects.Graphics
    slotText: Phaser.GameObjects.Text
    dots: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    count: number
    lit: number
    value: number
}

export function createBoard(scene: Phaser.Scene): Board {
    let rows: Row[] = []
    let marked: number | null = null
    let slotsOn = false
    let tapSlot: (r: number) => void = () => undefined

    const slotSize = (row: Row) => BOARD.slotSize * row.s
    const iconScale = (row: Row) => (BOARD.iconSize * row.s) / PIECE_SIZE

    const paintSlot = (row: Row, r: number) => {
        const s = slotSize(row)
        const x = row.x(BOARD.slotX)
        const filled = row.value > 0
        row.slotBox.clear()
        row.slotBox.fillStyle(filled ? C.white : C.boardDark, 1)
        row.slotBox.fillRoundedRect(x - s / 2, row.cy - s / 2, s, s, 22 * row.s)
        if (!filled || marked === r) {
            row.slotBox.lineStyle(marked === r ? 7 : 5, marked === r ? C.hint : C.dotOff, 1)
            row.slotBox.strokeRoundedRect(x - s / 2, row.cy - s / 2, s, s, 22 * row.s)
        }
        row.slotText.setText(filled ? String(row.value) : '?').setColor(filled ? CSS.ink : CSS.chalk)
    }

    const paintDots = (row: Row) => {
        row.dots.clear()
        if (rows.length === 1) {
            const x0 = BOARD.x + BOARD.w / 2 - ((row.count - 1) * BOARD.dotGap) / 2
            for (let i = 0; i < row.count; i++) {
                row.dots.fillStyle(i < row.lit ? C.hint : C.dotOff, 1)
                row.dots.fillCircle(x0 + i * BOARD.dotGap, BOARD.dotsY, BOARD.dotR)
            }
            return
        }
        for (let i = 0; i < row.count; i++) {
            row.dots.fillStyle(i < row.lit ? C.hint : C.dotOff, 1)
            row.dots.fillCircle(BOARD.rowDotsX + i * BOARD.rowDotGap, row.cy, BOARD.rowDotR)
        }
    }

    const wipe = () => {
        rows.forEach(row => {
            row.parts.forEach(p => {
                scene.tweens.killTweensOf(p)
                p.destroy()
            })
        })
        rows = []
        marked = null
    }

    const build = (colors: number[], values: number[]) => {
        wipe()
        rows = colors.map((color, r) => {
            const g = boardRow(colors.length, r)
            const icon = (frame: number, x: number, size: number) =>
                scene.add.image(g.x(x), g.cy, PIECES, frame).setDepth(DEPTH.board + 1).setScale((size * g.s) / PIECE_SIZE)
            const body = scene.add.graphics().setDepth(DEPTH.board)
            const bw = BOARD.bodyW * g.s
            const bh = BOARD.bodyH * g.s
            body.fillStyle(C.white, 1)
            body.fillRoundedRect(g.x(BOARD.bodyX) - bw / 2, g.cy - bh / 2, bw, bh, 22 * g.s)
            body.fillStyle(color, 0.45)
            body.fillRoundedRect(g.x(BOARD.bodyX) - bw / 2, g.cy - bh / 2, bw, bh, 22 * g.s)
            const loop = icon(PIECE.loop, BOARD.loopX, BOARD.loopSize)
            const brush = icon(PIECE.brush, BOARD.brushX, BOARD.iconSize)
            const step = icon(PIECE.step, BOARD.stepX, BOARD.iconSize)
            const times = scene.add
                .text(g.x(BOARD.timesX), g.cy, '×', { fontFamily: FONT.black, fontSize: `${Math.round(SIZE.times * g.s)}px`, color: CSS.chalk })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.board + 1)
            const slotBox = scene.add.graphics().setDepth(DEPTH.board + 1)
            const slotText = scene.add
                .text(g.x(BOARD.slotX), g.cy + 2, '?', { fontFamily: FONT.black, fontSize: `${Math.round(SIZE.slot * g.s)}px`, color: CSS.chalk })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.board + 2)
            const dots = scene.add.graphics().setDepth(DEPTH.board + 1)
            const s = BOARD.slotSize * g.s + 16
            const zone = scene.add.zone(g.x(BOARD.slotX), g.cy, s, s).setDepth(DEPTH.board + 3)
            zone.setInteractive({ useHandCursor: true })
            if (zone.input) zone.input.enabled = slotsOn
            zone.on('pointerdown', () => {
                if (slotsOn) tapSlot(r)
            })
            const row: Row = {
                cy: g.cy,
                s: g.s,
                x: g.x,
                parts: [body, loop, brush, step, times, slotBox, slotText, dots, zone],
                brush,
                step,
                loop,
                slotBox,
                slotText,
                dots,
                zone,
                count: values[r] ?? 0,
                lit: 0,
                value: values[r] ?? 0,
            }
            return row
        })
        rows.forEach((row, r) => {
            paintSlot(row, r)
            paintDots(row)
        })
    }

    return {
        setProgram(colors, values = []) {
            build(colors, values)
        },
        slot(r) {
            const row = rows[r]
            return { x: row.x(BOARD.slotX), y: row.cy }
        },
        slotRect(r) {
            const row = rows[r]
            const s = slotSize(row) + 12
            return { x: row.x(BOARD.slotX), y: row.cy, w: s, h: s }
        },
        write(r, n) {
            const row = rows[r]
            row.value = n
            row.count = n
            row.lit = 0
            paintSlot(row, r)
            paintDots(row)
            void FX.impact(scene, row.slotText, 0.3)
            void FX.to(scene, row.loop, { angle: 360 }, { duration: 500, ease: Ease.smooth }).then(() => row.loop.setAngle(0))
        },
        clearSlot(r) {
            const row = rows[r]
            row.value = 0
            row.count = 0
            row.lit = 0
            paintSlot(row, r)
            paintDots(row)
        },
        mark(r) {
            marked = r
            rows.forEach((row, k) => {
                scene.tweens.killTweensOf(row.slotText)
                row.slotText.setScale(1)
                paintSlot(row, k)
            })
            if (r !== null && rows[r]) void FX.to(scene, rows[r].slotText, { scale: 1.2 }, { duration: 420, yoyo: true, repeat: -1 })
        },
        lightDot(r, k) {
            const row = rows[r]
            row.lit = k + 1
            paintDots(row)
        },
        flash(r, which) {
            const row = rows[r]
            const target = which === 'brush' ? row.brush : row.step
            const base = iconScale(row)
            scene.tweens.killTweensOf(target)
            target.setScale(base * 1.35)
            void FX.to(scene, target, { scale: base }, { duration: 320, ease: Ease.smooth })
        },
        async reveal(values) {
            const changed = rows.filter((row, r) => row.value !== values[r])
            rows.forEach((row, r) => {
                row.value = values[r]
                paintSlot(row, r)
            })
            if (!changed.length) return
            await FX.to(scene, changed.map(row => row.slotText), { scale: 1.35 }, { duration: 260, yoyo: true, repeat: 2 })
            changed.forEach(row => row.slotText.setScale(1))
        },
        onSlot(cb) {
            tapSlot = cb
        },
        setSlotsEnabled(on) {
            slotsOn = on
            rows.forEach(row => {
                if (row.zone.input) row.zone.input.enabled = on
            })
        },
        destroy() {
            wipe()
        },
    }
}
