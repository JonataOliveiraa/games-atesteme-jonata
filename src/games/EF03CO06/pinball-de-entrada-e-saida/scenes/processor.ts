import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE, cellKey } from '../data/files'
import { DEPTH, PROCESSOR } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { PROCESSING } from '../data/words'
import { pieceImage } from './art'

export interface Processor {
    work(ms: number): Promise<void>
    hold(on: boolean): void
    fail(): Promise<void>
    rect(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

export function createProcessor(scene: Phaser.Scene): Processor {
    const chip = pieceImage(scene, PIECE.chipOff, PROCESSOR.size).setPosition(PROCESSOR.x, PROCESSOR.y).setDepth(DEPTH.processor)
    const label = scene.add
        .text(PROCESSOR.x, PROCESSOR.labelY, PROCESSING, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.processing}px`,
            color: CSS.process,
            backgroundColor: '#ffffffdd',
            padding: { x: 10, y: 4 },
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.fx)
        .setVisible(false)

    const set = (on: boolean) => {
        const scale = chip.scale
        chip.setFrame(cellKey(on ? PIECE.chipOn : PIECE.chipOff))
        chip.setScale(scale)
    }

    return {
        async work(ms) {
            set(true)
            label.setVisible(true).setAlpha(1)
            void FX.impact(scene, chip, 0.12)
            await FX.wait(scene, ms)
            set(false)
            label.setVisible(false)
        },
        hold(on) {
            set(on)
            label.setVisible(on).setAlpha(1)
        },
        async fail() {
            label.setVisible(false)
            for (let k = 0; k < 2; k++) {
                chip.setTint(C.asleep)
                await FX.wait(scene, 140)
                chip.clearTint()
                await FX.wait(scene, 140)
            }
        },
        rect() {
            return { x: PROCESSOR.x, y: PROCESSOR.y - 20, w: PROCESSOR.size + 120, h: PROCESSOR.size + 110 }
        },
        destroy() {
            label.destroy()
            chip.destroy()
        },
    }
}
