import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE } from '../data/files'
import { DEPTH, FIN, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { FINALE } from '../data/words'
import type { Mission } from '../types'
import { deviceImage, pieceImage } from './art'

export interface Finale {
    show(missions: Mission[], onPop: (i: number) => void): Promise<void>
    destroy(): void
}

export function createFinale(scene: Phaser.Scene): Finale {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        parts.push(obj)
        return obj
    }

    return {
        async show(missions, onPop) {
            const veil = keep(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.finale))
            await FX.to(scene, veil, { fillAlpha: 0.45 }, { duration: 260 })

            const panel = scene.add.graphics()
            panel.fillStyle(C.shadow, 0.2)
            panel.fillRoundedRect(-FIN.w / 2 + 5, -FIN.h / 2 + 8, FIN.w, FIN.h, 30)
            panel.fillStyle(C.cream, 1)
            panel.fillRoundedRect(-FIN.w / 2, -FIN.h / 2, FIN.w, FIN.h, 30)
            panel.lineStyle(5, C.ink, 1)
            panel.strokeRoundedRect(-FIN.w / 2, -FIN.h / 2, FIN.w, FIN.h, 30)
            const title = scene.add
                .text(0, -FIN.h / 2 + 40, FINALE.title, { fontFamily: FONT.black, fontSize: `${SIZE.boardTitle}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const board = keep(scene.add.container(FIN.x, FIN.y, [panel, title]).setDepth(DEPTH.finale + 1))
            await FX.popIn(scene, board, { from: 0.7, duration: 400 })

            const arrow = (g: Phaser.GameObjects.Graphics, x: number, y: number) => {
                g.fillStyle(C.ink, 0.6)
                g.fillRect(x - 16, y - 4, 22, 8)
                g.fillTriangle(x + 6, y - 11, x + 6, y + 11, x + 20, y)
            }

            for (let i = 0; i < missions.length; i++) {
                const m = missions[i]
                const y = FIN.rowY0 + i * FIN.rowGap
                const g = scene.add.graphics()
                const tag = (x: number, tone: number) => {
                    g.fillStyle(tone, 0.18)
                    g.fillRoundedRect(x - 44, y - 44, 88, 88, 18)
                    g.lineStyle(3, tone, 1)
                    g.strokeRoundedRect(x - 44, y - 44, 88, 88, 18)
                }
                const xs = [-490, -360, -230]
                tag(xs[0], C.input)
                tag(xs[2], C.output)
                arrow(g, -425, y)
                arrow(g, -295, y)
                const line = scene.add
                    .text(-150, y, FINALE.line(m.input, m.output, m.carries, m.becomes), {
                        fontFamily: FONT.black,
                        fontSize: `${SIZE.boardLine}px`,
                        color: CSS.ink,
                        wordWrap: { width: 680 },
                    })
                    .setOrigin(0, 0.5)
                    .setResolution(2)
                const row = keep(
                    scene.add
                        .container(FIN.x, FIN.y, [
                            g,
                            deviceImage(scene, m.input, FIN.iconSize).setPosition(xs[0], y),
                            pieceImage(scene, PIECE.chipOn, FIN.iconSize * 0.9).setPosition(xs[1], y),
                            deviceImage(scene, m.output, FIN.iconSize).setPosition(xs[2], y),
                            line,
                        ])
                        .setDepth(DEPTH.finale + 2)
                        .setAlpha(0),
                )
                onPop(i)
                await FX.to(scene, row, { alpha: 1 }, { duration: 280 })
                await FX.wait(scene, 140)
            }

            const synth = keep(
                scene.add
                    .text(FIN.x, FIN.y + FIN.h / 2 - 50, FINALE.synth, {
                        fontFamily: FONT.black,
                        fontSize: `${SIZE.synth}px`,
                        color: CSS.accent,
                        align: 'center',
                        wordWrap: { width: FIN.w - 80 },
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.finale + 2)
                    .setAlpha(0),
            )
            await FX.to(scene, synth, { alpha: 1 }, { duration: 320 })
        },
        destroy() {
            parts.forEach(p => p.destroy())
        },
    }
}
