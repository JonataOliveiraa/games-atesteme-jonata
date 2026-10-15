import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG, COMPUTER_ART, PIECE, cellKey } from '../data/files'
import { CHIP, COMPUTER, DEPTH, GOAL, H, W, WINDOW } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { PROCESSING } from '../data/words'
import type { InfoId } from '../types'
import { infoImage, pieceImage } from './art'

type Rect = { x: number; y: number; w: number; h: number }

export interface Computer {
    slot(i: number): { x: number; y: number }
    fill(i: number, info: InfoId): void
    work(on: boolean): void
    /** acende uma luz e apaga de novo (demonstração) */
    blink(i: number): Promise<void>
    rect(): Rect
    goalRect(): Rect
    windowRect(): Rect
    destroy(): void
}

export function createComputer(scene: Phaser.Scene, slots: number): Computer {
    const bg = scene.add.image(W / 2, H / 2, BG).setDepth(DEPTH.bg)
    bg.setScale(Math.max(W / bg.width, H / bg.height))

    const art = scene.add.image(COMPUTER.x, COMPUTER.bottom, COMPUTER_ART).setOrigin(0.5, 1).setDepth(DEPTH.computer)
    art.setScale(Math.min(COMPUTER.w / art.width, COMPUTER.h / art.height))

    const chip = pieceImage(scene, PIECE.chipOff, CHIP.size).setPosition(CHIP.x, CHIP.y).setDepth(DEPTH.chip)
    const label = scene.add
        .text(CHIP.x, CHIP.labelY, PROCESSING, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.processing}px`,
            color: CSS.process,
            backgroundColor: '#ffffffee',
            padding: { x: 10, y: 4 },
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.fx)
        .setVisible(false)

    const x0 = COMPUTER.x - ((slots - 1) * GOAL.gap) / 2
    const slotAt = (i: number) => ({ x: x0 + i * GOAL.gap, y: GOAL.y })
    const lights = scene.add.graphics().setDepth(DEPTH.goal)
    for (let i = 0; i < slots; i++) {
        const { x, y } = slotAt(i)
        lights.fillStyle(C.screenOff, 1)
        lights.fillCircle(x, y, GOAL.r)
        lights.lineStyle(3, C.ink, 1)
        lights.strokeCircle(x, y, GOAL.r)
    }
    const filled: Phaser.GameObjects.GameObject[] = []

    return {
        slot: slotAt,
        fill(i, info) {
            const { x, y } = slotAt(i)
            const ring = scene.add.circle(x, y, GOAL.r, C.glow, 1).setStrokeStyle(3, C.ink).setDepth(DEPTH.goal + 0.1)
            const icon = infoImage(scene, info, 'happy', GOAL.icon).setPosition(x, y + GOAL.icon / 2 - 2).setDepth(DEPTH.goal + 0.2)
            filled.push(ring, icon)
            void FX.impact(scene, ring, 0.3)
            void FX.ping(scene, x, y, C.star, { radius: 44, duration: 480, depth: DEPTH.fx })
        },
        async blink(i) {
            const { x, y } = slotAt(i)
            const ring = scene.add.circle(x, y, GOAL.r, C.glow, 1).setStrokeStyle(3, C.ink).setDepth(DEPTH.goal + 0.1)
            void FX.ping(scene, x, y, C.star, { radius: 44, duration: 480, depth: DEPTH.fx })
            await FX.wait(scene, 700)
            await FX.to(scene, ring, { alpha: 0 }, { duration: 300 })
            ring.destroy()
        },
        work(on) {
            const scale = chip.scale
            chip.setFrame(cellKey(on ? PIECE.chipOn : PIECE.chipOff)).setScale(scale)
            label.setVisible(on)
            if (on) void FX.impact(scene, chip, 0.14)
        },
        rect() {
            return { x: COMPUTER.x, y: COMPUTER.bottom - COMPUTER.h / 2, w: COMPUTER.w + 40, h: COMPUTER.h + 10 }
        },
        goalRect() {
            return { x: COMPUTER.x, y: GOAL.y, w: (slots - 1) * GOAL.gap + GOAL.r * 2 + 40, h: GOAL.r * 2 + 30 }
        },
        windowRect() {
            return { x: WINDOW.x, y: WINDOW.y, w: WINDOW.w + 30, h: WINDOW.h + 30 }
        },
        destroy() {
            filled.forEach(f => f.destroy())
            lights.destroy()
            label.destroy()
            chip.destroy()
            art.destroy()
            bg.destroy()
        },
    }
}
