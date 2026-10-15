import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICES } from '../data/devices'
import { DEPTH, FIN, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { DeviceId, InfoId, Wish } from '../types'
import { deviceImage, infoImage, wishImage } from './art'

export interface FinaleRow {
    info?: InfoId
    wish?: Wish
    devices: DeviceId[]
    text: string
}

export interface Finale {
    show(title: string, rows: FinaleRow[], synth: string, onPop: (i: number) => void): Promise<void>
    destroy(): void
}

const ICON_X = -370
const DEVICE_X0 = -240
const DEVICE_GAP = 120

export function createFinale(scene: Phaser.Scene): Finale {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        parts.push(obj)
        return obj
    }

    return {
        async show(titleText, rows, synthText, onPop) {
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
                .text(0, -FIN.h / 2 + 44, titleText, { fontFamily: FONT.black, fontSize: `${SIZE.boardTitle}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const board = keep(scene.add.container(FIN.x, FIN.y, [panel, title]).setDepth(DEPTH.finale + 1))
            await FX.popIn(scene, board, { from: 0.7, duration: 400 })

            const gap = rows.length > 3 ? 86 : FIN.rowGap
            const y0 = -((rows.length - 1) * gap) / 2 - 20
            const icon = rows.length > 3 ? FIN.iconSize * 0.8 : FIN.iconSize
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i]
                const y = y0 + i * gap
                const g = scene.add.graphics()
                const items: Phaser.GameObjects.GameObject[] = [g]
                const arrow = (x: number) => {
                    g.fillStyle(C.ink, 0.6)
                    g.fillRect(x - 22, y - 5, 28, 10)
                    g.fillTriangle(x + 6, y - 14, x + 6, y + 14, x + 22, y)
                }
                if (row.info) items.push(infoImage(scene, row.info, 'happy', icon).setPosition(ICON_X, y + icon / 2))
                else if (row.wish) items.push(wishImage(scene, row.wish, icon * 0.9).setPosition(ICON_X, y))
                arrow(ICON_X + 66)
                row.devices.forEach((d, k) => {
                    const x = DEVICE_X0 + k * DEVICE_GAP
                    const tone = DEVICES[d].side === 'input' ? C.input : C.output
                    g.fillStyle(tone, 0.16)
                    g.fillRoundedRect(x - 46, y - 42, 92, 84, 20)
                    g.lineStyle(4, tone, 1)
                    g.strokeRoundedRect(x - 46, y - 42, 92, 84, 20)
                    items.push(deviceImage(scene, d, icon * 0.85).setPosition(x, y))
                    if (k < row.devices.length - 1) arrow(x + 62)
                })
                const textX = DEVICE_X0 + row.devices.length * DEVICE_GAP - 50
                items.push(
                    scene.add
                        .text(textX, y, row.text, {
                            fontFamily: FONT.black,
                            fontSize: `${SIZE.boardLine + 4}px`,
                            color: CSS.ink,
                            wordWrap: { width: FIN.w / 2 - textX - 30 },
                        })
                        .setOrigin(0, 0.5)
                        .setResolution(2),
                )
                const line = keep(scene.add.container(FIN.x, FIN.y, items).setDepth(DEPTH.finale + 2).setAlpha(0))
                onPop(i)
                await FX.to(scene, line, { alpha: 1 }, { duration: 280 })
                await FX.wait(scene, 160)
            }

            const synth = keep(
                scene.add
                    .text(FIN.x, FIN.y + FIN.h / 2 - 50, synthText, {
                        fontFamily: FONT.black,
                        fontSize: `${SIZE.synth + 2}px`,
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
