import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { INFO } from '../data/devices'
import { DEPTH, FIN, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { FINALE } from '../data/words'
import type { InfoId } from '../types'
import { deviceImage, infoImage } from './art'

export interface Finale {
    show(infos: InfoId[], onPop: (i: number) => void): Promise<void>
    destroy(): void
}

export function createFinale(scene: Phaser.Scene): Finale {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        parts.push(obj)
        return obj
    }

    return {
        async show(infos, onPop) {
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
                .text(0, -FIN.h / 2 + 44, FINALE.title, { fontFamily: FONT.black, fontSize: `${SIZE.boardTitle}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const board = keep(scene.add.container(FIN.x, FIN.y, [panel, title]).setDepth(DEPTH.finale + 1))
            await FX.popIn(scene, board, { from: 0.7, duration: 400 })

            for (let i = 0; i < infos.length; i++) {
                const id = infos[i]
                const y = FIN.rowY0 + i * FIN.rowGap
                const g = scene.add.graphics()
                g.fillStyle(C.input, 0.16)
                g.fillRoundedRect(-150, y - 46, 100, 92, 20)
                g.lineStyle(4, C.input, 1)
                g.strokeRoundedRect(-150, y - 46, 100, 92, 20)
                g.fillStyle(C.ink, 0.6)
                g.fillRect(-250, y - 5, 56, 10)
                g.fillTriangle(-196, y - 15, -196, y + 15, -176, y)
                const line = scene.add
                    .text(-20, y, FINALE.lines[id], { fontFamily: FONT.black, fontSize: `${SIZE.boardLine + 5}px`, color: CSS.ink })
                    .setOrigin(0, 0.5)
                    .setResolution(2)
                const row = keep(
                    scene.add
                        .container(FIN.x, FIN.y, [
                            g,
                            infoImage(scene, id, 'happy', FIN.iconSize).setPosition(-320, y + FIN.iconSize / 2),
                            deviceImage(scene, INFO[id].door, FIN.iconSize * 0.9).setPosition(-100, y),
                            line,
                        ])
                        .setDepth(DEPTH.finale + 2)
                        .setAlpha(0),
                )
                onPop(i)
                await FX.to(scene, row, { alpha: 1 }, { duration: 280 })
                await FX.wait(scene, 160)
            }

            const synth = keep(
                scene.add
                    .text(FIN.x, FIN.y + FIN.h / 2 - 50, FINALE.synth, {
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
