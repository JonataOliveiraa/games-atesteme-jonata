import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'
import { drawCodeIcon } from './codeIcon'
import { createStrip } from './symbols'
import type { LevelDef } from '../types'

const TILE = 48
const PITCH = 54
const ROW_H = 84
const HEAD_ICON = 34
const PANEL_W = 560

export function createRecap(scene: Phaser.Scene) {
    let objects: Phaser.GameObjects.GameObject[] = []

    return {
        async play(level: LevelDef, onEachRow?: () => void) {
            const rows = level.chests.length
            const panelH = 150 + rows * ROW_H
            const top = H / 2 - panelH / 2
            const side = (level.chests[0].message.length - 1) * PITCH + TILE
            const offset = side / 2 + 70
            const leftCx = W / 2 - offset
            const rightCx = W / 2 + offset

            const overlay = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.62)
                .setDepth(DEPTH.overlay)
                .setInteractive()

            const panel = scene.add.graphics().setDepth(DEPTH.overlay + 1)
            panel.fillStyle(C.ink, 0.3)
            panel.fillRoundedRect(W / 2 - PANEL_W / 2, top + 10, PANEL_W, panelH, 36)
            panel.fillStyle(C.cream, 1)
            panel.fillRoundedRect(W / 2 - PANEL_W / 2, top, PANEL_W, panelH, 36)
            panel.fillStyle(C.white, 0.65)
            panel.fillRoundedRect(W / 2 - PANEL_W / 2 + 18, top + 11, PANEL_W - 36, 20, 10)
            panel.lineStyle(7, C.woodDark, 1)
            panel.strokeRoundedRect(W / 2 - PANEL_W / 2, top, PANEL_W, panelH, 36)

            const marks = scene.add.graphics().setDepth(DEPTH.overlay + 2)

            const headLeft = scene.add.graphics()
                .setPosition(leftCx, top + 62)
                .setDepth(DEPTH.overlay + 2)
            drawCodeIcon(headLeft, level.from, HEAD_ICON)

            const headRight = scene.add.graphics()
                .setPosition(rightCx, top + 62)
                .setDepth(DEPTH.overlay + 2)
            drawCodeIcon(headRight, level.to, HEAD_ICON)

            const arrow = scene.add.graphics().setDepth(DEPTH.overlay + 2)
            arrow.fillStyle(C.warnDark, 1)
            arrow.fillRoundedRect(W / 2 - 26, top + 56, 38, 11, 5)
            arrow.fillTriangle(W / 2 + 6, top + 48, W / 2 + 6, top + 76, W / 2 + 28, top + 62)

            objects = [overlay, panel, marks, headLeft, headRight, arrow]
            ;[headLeft, headRight, arrow].forEach(o => FX.popIn(scene, o, { duration: 300 }))

            for (let r = 0; r < rows; r++) {
                const message = level.chests[r].message
                const y = top + 128 + r * ROW_H

                const a = createStrip(scene, message, level.from, TILE, PITCH)
                a.container.setPosition(leftCx, y).setDepth(DEPTH.overlay + 2)
                const b = createStrip(scene, message, level.to, TILE, PITCH)
                b.container.setPosition(rightCx, y).setDepth(DEPTH.overlay + 2)

                marks.fillStyle(C.inkSoft, 1)
                marks.fillRoundedRect(W / 2 - 17, y - 13, 34, 9, 4)
                marks.fillRoundedRect(W / 2 - 17, y + 4, 34, 9, 4)

                objects.push(a.container, b.container)
                FX.popIn(scene, a.container, { from: 0.7, duration: 260 })
                FX.popIn(scene, b.container, { from: 0.7, duration: 260 })
                onEachRow?.()
                await FX.wait(scene, 620)
            }

            await FX.wait(scene, 900)
            objects.forEach(obj => obj.destroy())
            objects = []
        },

        destroy() {
            objects.forEach(obj => obj.destroy())
            objects = []
        },
    }
}
