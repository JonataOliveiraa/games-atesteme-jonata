import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BOARD, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { FINALE } from '../data/words'
import type { Mark, Track } from '../types'
import { piece } from './art'

export interface Finale {
    show(tracks: Track[], cookies: number, topLabel: string, onPop: (i: number) => void): Promise<void>
    destroy(): void
}

function bar(g: Phaser.GameObjects.Graphics, marks: Mark[], end: number, y: number, on: number, off: number) {
    const x0 = BOARD.barLeft
    const scale = BOARD.barW / Math.max(end, 1)
    marks.forEach((mark, i) => {
        const next = i + 1 < marks.length ? marks[i + 1].t : end
        if (next <= mark.t) return
        g.fillStyle(mark.on ? on : off, 1)
        g.fillRect(x0 + mark.t * scale, y - BOARD.barH / 2, (next - mark.t) * scale, BOARD.barH)
    })
    g.lineStyle(3, C.ink, 1)
    g.strokeRoundedRect(x0, y - BOARD.barH / 2, BOARD.barW, BOARD.barH, 6)
}

export function createFinale(scene: Phaser.Scene): Finale {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        parts.push(obj)
        return obj
    }

    return {
        async show(tracks, cookies, topLabel, onPop) {
            const veil = keep(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.finale))
            await FX.to(scene, veil, { fillAlpha: 0.4 }, { duration: 260 })

            const panel = scene.add.graphics()
            panel.fillStyle(C.shadow, 0.2)
            panel.fillRoundedRect(-BOARD.w / 2 + 5, -BOARD.h / 2 + 8, BOARD.w, BOARD.h, 30)
            panel.fillStyle(C.cream, 1)
            panel.fillRoundedRect(-BOARD.w / 2, -BOARD.h / 2, BOARD.w, BOARD.h, 30)
            panel.lineStyle(5, C.ink, 1)
            panel.strokeRoundedRect(-BOARD.w / 2, -BOARD.h / 2, BOARD.w, BOARD.h, 30)

            const text = (x: number, y: number, value: string, size: number, originX = 0.5) =>
                scene.add
                    .text(x, y, value, { fontFamily: FONT.black, fontSize: `${size}px`, color: CSS.ink, align: 'center' })
                    .setOrigin(originX, 0.5)
                    .setResolution(2)

            const items: Phaser.GameObjects.GameObject[] = [panel, text(0, -BOARD.h / 2 + 40, FINALE.title, SIZE.boardTitle)]
            const board = keep(scene.add.container(BOARD.x, BOARD.y, items).setDepth(DEPTH.finale + 1))
            await FX.popIn(scene, board, { from: 0.7, duration: 400 })

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i]
                const y = -BOARD.h / 2 + 120 + i * BOARD.phaseGap
                const g = scene.add.graphics()
                bar(g, track.rule, track.end, y, C.ovenOn, C.ovenOff)
                bar(g, track.belt, track.end, y + BOARD.rowGap, C.beltOn, C.beltOff)
                const row = scene.add.container(0, 0, [
                    g,
                    text(BOARD.barLeft - 16, y, topLabel, SIZE.boardLabel, 1),
                    text(BOARD.barLeft - 16, y + BOARD.rowGap, FINALE.belt, SIZE.boardLabel, 1),
                ])
                board.add(row)
                onPop(i)
                await FX.popIn(scene, row, { from: 0.85, duration: 300 })
            }

            const shown = Math.min(cookies, 16)
            const cy = -BOARD.h / 2 + 120 + tracks.length * BOARD.phaseGap + 20
            for (let i = 0; i < shown; i++) {
                const g = piece(scene, 'cookie', 40).setPosition((i - (shown - 1) / 2) * 44, cy)
                board.add(g)
                if (i % 2 === 0) onPop(i)
                await FX.popIn(scene, g, { from: 0.2, duration: 160 })
            }

            const line = text(0, BOARD.h / 2 - 44, FINALE.line, SIZE.boardLine)
            line.setWordWrapWidth(BOARD.w - 80)
            board.add(line)
            await FX.popIn(scene, line, { from: 0.8, duration: 260 })
        },
        destroy() {
            parts.forEach(p => p.destroy())
            parts.length = 0
        },
    }
}
