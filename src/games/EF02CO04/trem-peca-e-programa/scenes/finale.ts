import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, FINALE, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { BOARD } from '../data/words'
import type { ItemId } from '../types'
import { createItemArt } from './item'

export interface Finale {
    order(program: ItemId, part: ItemId, onNote: (i: number) => void): Promise<void>
    board(parts: ItemId[], programs: ItemId[]): Promise<void>
    destroy(): void
}

export function createFinale(scene: Phaser.Scene): Finale {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        parts.push(obj)
        return obj
    }

    const veil = keep(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.finale))

    const note = (x: number, y: number) => {
        const g = scene.add.graphics({ x, y }).setDepth(DEPTH.finale + 3)
        g.fillStyle(C.lilacDark, 1)
        g.fillEllipse(0, 0, 18, 13)
        g.fillRect(6, -30, 4, 30)
        g.fillTriangle(10, -30, 10, -20, 22, -24)
        g.setScale(0.4)
        const dx = Phaser.Math.Between(-60, 60)
        void FX.to(scene, g, { x: x + dx, y: y - 120, scale: 1.2, alpha: 0 }, { duration: 1100 }).then(() => g.destroy())
    }

    const wave = async (from: number, to: number, y: number) => {
        const g = scene.add.graphics({ x: from, y }).setDepth(DEPTH.finale + 2)
        g.lineStyle(6, C.glow, 1)
        for (const r of [16, 30, 44]) {
            g.beginPath()
            g.arc(0, 0, r, -0.35 * Math.PI, 0.35 * Math.PI)
            g.strokePath()
        }
        await FX.to(scene, g, { x: to }, { duration: 420, ease: 'Sine.easeIn' })
        g.destroy()
    }

    return {
        async order(program, part, onNote) {
            await FX.to(scene, veil, { fillAlpha: 0.45 }, { duration: 260 })
            const app = keep(createItemArt(scene, program).setPosition(FINALE.left, FINALE.y).setDepth(DEPTH.finale + 1))
            const box = keep(createItemArt(scene, part).setPosition(FINALE.right, FINALE.y).setDepth(DEPTH.finale + 1))
            await Promise.all([FX.popIn(scene, app, { from: 0.3 }), FX.popIn(scene, box, { from: 0.3, delay: 120 })])
            for (let i = 0; i < 3; i++) {
                await wave(FINALE.left + 70, FINALE.right - 70, FINALE.y)
                onNote(i)
                note(FINALE.right, FINALE.y - 60)
                await FX.impact(scene, box, 0.14)
            }
            await FX.wait(scene, 500)
            await FX.to(scene, [app, box], { alpha: 0 }, { duration: 240 })
        },
        async board(partIds, programIds) {
            const b = FINALE.board
            const panel = scene.add.graphics()
            panel.fillStyle(C.shadow, 0.2)
            panel.fillRoundedRect(-b.w / 2 + 5, -b.h / 2 + 8, b.w, b.h, 30)
            panel.fillStyle(C.cream, 1)
            panel.fillRoundedRect(-b.w / 2, -b.h / 2, b.w, b.h, 30)
            panel.lineStyle(5, C.ink, 1)
            panel.strokeRoundedRect(-b.w / 2, -b.h / 2, b.w, b.h, 30)
            panel.lineStyle(4, C.creamDark, 1)
            panel.lineBetween(0, -b.h / 2 + 30, 0, b.h / 2 - 110)
            const items: Phaser.GameObjects.GameObject[] = [panel]
            const column = (ids: ItemId[], cx: number, title: string) => {
                items.push(
                    scene.add
                        .text(cx, -b.h / 2 + 48, title, { fontFamily: FONT.black, fontSize: `${SIZE.board}px`, color: CSS.ink })
                        .setOrigin(0.5)
                        .setResolution(2),
                )
                ids.forEach((id, i) => {
                    const art = createItemArt(scene, id).setScale(0.62)
                    const col = i % 2
                    const row = Math.floor(i / 2)
                    art.setPosition(cx + (col - 0.5) * 120, -b.h / 2 + 140 + row * 110)
                    items.push(art)
                })
            }
            column(partIds, -b.w / 4, BOARD.part)
            column(programIds, b.w / 4, BOARD.program)
            items.push(
                scene.add
                    .text(0, b.h / 2 - 54, BOARD.line, {
                        fontFamily: FONT.black,
                        fontSize: `${SIZE.boardSub}px`,
                        color: CSS.ink,
                        align: 'center',
                        wordWrap: { width: b.w - 80 },
                    })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
            const container = keep(scene.add.container(b.x, b.y, items).setDepth(DEPTH.finale + 1))
            await FX.popIn(scene, container, { from: 0.7, duration: 420 })
        },
        destroy() {
            parts.forEach(p => p.destroy())
            parts.length = 0
        },
    }
}
