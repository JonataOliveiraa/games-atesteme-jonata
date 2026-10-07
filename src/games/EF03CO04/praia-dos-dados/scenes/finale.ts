import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, FIN, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { FINALE } from '../data/words'
import type { Solved } from '../types'
import { batherImage, dogImage } from './art'
import { makeChip } from './chip'

export interface Finale {
    show(rows: Solved[], onPop: (i: number) => void): Promise<void>
    destroy(): void
}

export function createFinale(scene: Phaser.Scene): Finale {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        parts.push(obj)
        return obj
    }

    return {
        async show(rows, onPop) {
            const veil = keep(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.finale))
            await FX.to(scene, veil, { fillAlpha: 0.45 }, { duration: 260 })

            const panel = scene.add.graphics()
            panel.fillStyle(C.shadow, 0.2)
            panel.fillRoundedRect(-FIN.w / 2 + 5, -FIN.h / 2 + 8, FIN.w, FIN.h, 30)
            panel.fillStyle(C.cream, 1)
            panel.fillRoundedRect(-FIN.w / 2, -FIN.h / 2, FIN.w, FIN.h, 30)
            panel.lineStyle(5, C.ink, 1)
            panel.strokeRoundedRect(-FIN.w / 2, -FIN.h / 2, FIN.w, FIN.h, 30)

            const text = (x: number, y: number, value: string, size: number, color: string = CSS.ink) =>
                scene.add.text(x, y, value, { fontFamily: FONT.black, fontSize: `${size}px`, color }).setOrigin(0.5).setResolution(2)

            const dataCenter = FIN.chipX0 + (3 * FIN.chipW + 2 * 10) / 2
            const board = keep(
                scene.add
                    .container(FIN.x, FIN.y, [
                        panel,
                        text(0, -FIN.h / 2 + 40, FINALE.title, SIZE.boardTitle),
                        text(dataCenter, FIN.headY, FINALE.data, SIZE.boardLabel, CSS.inkSoft),
                        text(FIN.portraitX + 20, FIN.headY, FINALE.info, SIZE.boardLabel, CSS.inkSoft),
                    ])
                    .setDepth(DEPTH.finale + 1),
            )
            await FX.popIn(scene, board, { from: 0.7, duration: 400 })

            for (let r = 0; r < rows.length; r++) {
                const row = rows[r]
                const y = FIN.rowY0 + r * FIN.rowGap
                const items: Phaser.GameObjects.GameObject[] = []
                row.data.forEach((trait, i) => {
                    const chip = makeChip(scene, trait, FIN.chipW, FIN.chipH)
                    if (row.useless.includes(trait)) chip.useless()
                    chip.box.setPosition(FIN.chipX0 + FIN.chipW / 2 + i * (FIN.chipW + 10), y)
                    items.push(chip.box)
                })
                const arrow = scene.add.graphics()
                arrow.fillStyle(C.accent, 1)
                arrow.fillRect(FIN.arrowX - 40, y - 7, 56, 14)
                arrow.fillTriangle(FIN.arrowX + 14, y - 20, FIN.arrowX + 14, y + 20, FIN.arrowX + 42, y)
                const feet = y + FIN.portraitH / 2 + 4
                items.push(
                    arrow,
                    batherImage(scene, row.owner, FIN.portraitH).setPosition(FIN.portraitX, feet),
                    dogImage(scene, row.dog, 'sit', 84).setPosition(FIN.portraitX + 96, feet),
                )
                const line = scene.add.container(FIN.x, FIN.y, items).setDepth(DEPTH.finale + 2).setAlpha(0)
                keep(line)
                onPop(r)
                await FX.to(scene, line, { alpha: 1 }, { duration: 300 })
                await FX.wait(scene, 160)
            }

            const synth = keep(text(FIN.x, FIN.y + FIN.lineY, FINALE.line, SIZE.cardLine, CSS.accent).setDepth(DEPTH.finale + 2).setAlpha(0))
            await FX.to(scene, synth, { alpha: 1 }, { duration: 320 })
        },
        destroy() {
            parts.forEach(p => p.destroy())
        },
    }
}
