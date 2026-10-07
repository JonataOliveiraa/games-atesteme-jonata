import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BOARD, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { DogId, TraitId } from '../types'
import { dogImage, setDogPose } from './art'
import { makeChip, type Chip } from './chip'

export interface Board {
    reset(dog: DogId): Promise<void>
    add(trait: TraitId, fromX: number, fromY: number): Promise<Chip>
    chip(index: number): Chip | undefined
    take(): Chip[]
    rect(): { x: number; y: number; w: number; h: number }
    chipRect(index: number): { x: number; y: number; w: number; h: number }
    destroy(): void
}

export const chipX = (index: number) => BOARD.x + BOARD.chipX0 + index * (BOARD.chipW + BOARD.chipGap) + BOARD.chipW / 2

export function createBoard(scene: Phaser.Scene): Board {
    const panel = scene.add.graphics()
    panel.fillStyle(C.shadow, 0.18)
    panel.fillRoundedRect(-BOARD.w / 2 + 4, -BOARD.h / 2 + 6, BOARD.w, BOARD.h, 22)
    panel.fillStyle(C.board, 1)
    panel.fillRoundedRect(-BOARD.w / 2, -BOARD.h / 2, BOARD.w, BOARD.h, 22)
    panel.lineStyle(4, C.ink, 1)
    panel.strokeRoundedRect(-BOARD.w / 2, -BOARD.h / 2, BOARD.w, BOARD.h, 22)
    panel.fillStyle(C.boardDark, 1)
    panel.fillCircle(BOARD.dogX, 0, BOARD.dogSize / 2 + 2)
    panel.lineStyle(3, C.ink, 1)
    panel.strokeCircle(BOARD.dogX, 0, BOARD.dogSize / 2 + 2)

    let dog: DogId = 'pacoca'
    const face = dogImage(scene, dog, 'sit', BOARD.dogSize * 1.25).setPosition(BOARD.dogX, BOARD.dogSize * 0.55)
    const mask = scene.make.graphics({ x: 0, y: 0 }, false)
    mask.fillStyle(0xffffff, 1)
    mask.fillCircle(BOARD.x + BOARD.dogX, BOARD.y, BOARD.dogSize / 2)
    face.setMask(mask.createGeometryMask())
    const box = scene.add.container(BOARD.x, BOARD.y, [panel, face]).setDepth(DEPTH.board)

    let chips: Chip[] = []

    return {
        async reset(next) {
            chips.forEach(c => c.destroy())
            chips = []
            dog = next
            setDogPose(face, dog, 'sit')
            await FX.impact(scene, box, 0.08)
        },
        async add(trait, fromX, fromY) {
            const index = chips.length
            const chip = makeChip(scene, trait, BOARD.chipW, BOARD.chipH)
            chips.push(chip)
            chip.box.setPosition(fromX, fromY).setDepth(DEPTH.board + 1).setScale(0.3)
            await FX.to(scene, chip.box, { x: chipX(index), y: BOARD.y, scale: 1 }, { duration: 520, ease: 'Back.easeOut' })
            return chip
        },
        chip(index) {
            return chips[index]
        },
        take() {
            const out = chips
            chips = []
            return out
        },
        rect() {
            return { x: BOARD.x, y: BOARD.y, w: BOARD.w + 16, h: BOARD.h + 16 }
        },
        chipRect(index) {
            return { x: chipX(index), y: BOARD.y, w: BOARD.chipW + 16, h: BOARD.chipH + 16 }
        },
        destroy() {
            chips.forEach(c => c.destroy())
            face.clearMask(true)
            mask.destroy()
            box.destroy()
        },
    }
}
