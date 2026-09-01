import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { createCard } from './symbols'
import type { LevelDef } from '../types'

const CARD = 50
const PITCH = 56
const ROW_H = 104

/**
 * A REPRISE — as três mensagens do nível, cada uma nos dois códigos, uma em
 * cima da outra. É a frase-chave do jogo dita sem palavra nenhuma.
 */
export function createRecap(scene: Phaser.Scene) {
    let objects: Phaser.GameObjects.GameObject[] = []

    return {
        async play(level: LevelDef, onEachRow?: () => void) {
            const rows = level.chests.length
            const panelH = 130 + rows * ROW_H
            const panelW = 660

            const overlay = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.62)
                .setDepth(DEPTH.overlay)
                .setInteractive()

            const panel = scene.add.graphics().setDepth(DEPTH.overlay + 1)
            panel.fillStyle(C.ink, 0.3)
            panel.fillRoundedRect(W / 2 - panelW / 2, H / 2 - panelH / 2 + 9, panelW, panelH, 34)
            panel.fillStyle(C.cream, 1)
            panel.fillRoundedRect(W / 2 - panelW / 2, H / 2 - panelH / 2, panelW, panelH, 34)
            panel.lineStyle(7, C.woodDark, 1)
            panel.strokeRoundedRect(W / 2 - panelW / 2, H / 2 - panelH / 2, panelW, panelH, 34)

            const title = scene.add.text(W / 2, H / 2 - panelH / 2 + 52, 'A mesma coisa, dois códigos!', {
                fontFamily: FONT.black,
                fontSize: '30px',
                color: CSS.ink,
                align: 'center',
            }).setOrigin(0.5).setDepth(DEPTH.overlay + 2).setResolution(2)

            objects = [overlay, panel, title]
            FX.popIn(scene, title, { duration: 300 })

            for (let r = 0; r < rows; r++) {
                const message = level.chests[r].message
                const y = H / 2 - panelH / 2 + 122 + r * ROW_H
                const half = (message.length - 1) / 2
                const leftCx = W / 2 - 150
                const rightCx = W / 2 + 150

                const line: Phaser.GameObjects.GameObject[] = []

                message.forEach((word, i) => {
                    const from = createCard(scene, word, level.from, CARD)
                    from.container.setPosition(leftCx + (i - half) * PITCH, y)
                        .setDepth(DEPTH.overlay + 2)
                    const to = createCard(scene, word, level.to, CARD)
                    to.container.setPosition(rightCx + (i - half) * PITCH, y)
                        .setDepth(DEPTH.overlay + 2)
                    line.push(from.container, to.container)
                })

                const equals = scene.add.text(W / 2, y, '=', {
                    fontFamily: FONT.black,
                    fontSize: '34px',
                    color: CSS.inkSoft,
                }).setOrigin(0.5).setDepth(DEPTH.overlay + 2).setResolution(2)
                line.push(equals)

                objects.push(...line)
                line.forEach(obj => FX.popIn(scene, obj as never, { from: 0.7, duration: 260 }))
                onEachRow?.()
                await FX.wait(scene, 620)
            }

            await FX.wait(scene, 700)
            objects.forEach(obj => obj.destroy())
            objects = []
        },

        destroy() {
            objects.forEach(obj => obj.destroy())
            objects = []
        },
    }
}
