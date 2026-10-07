import Phaser from 'phaser'
import { batherCell } from '../data/cast'
import {
    BATHERS_SHEET,
    DOGS_SHEET,
    LIFEGUARD_SHEET,
    PIECES_SHEET,
    cellKey,
    dogCell,
    iconCell,
    type DogPose,
    type Sheet,
} from '../data/files'
import type { BatherId, DogId, TraitId } from '../types'

const refOf = (scene: Phaser.Scene, sheet: Sheet) =>
    (scene.textures.get(sheet.key).customData as { ref?: number }).ref ?? sheet.cellH

/** Figura em pé: origem no pé, escala comum à folha (a figura de referência fica com `height`). */
export function figure(scene: Phaser.Scene, sheet: Sheet, index: number, height: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index)).setOrigin(0.5, 1)
    return image.setScale(height / refOf(scene, sheet))
}

/** Peça solta: origem no centro, cabe num quadrado de `size`. */
export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export const batherImage = (scene: Phaser.Scene, id: BatherId, height: number) =>
    figure(scene, BATHERS_SHEET, batherCell(id), height)

export const dogImage = (scene: Phaser.Scene, dog: DogId, pose: DogPose, height: number) =>
    figure(scene, DOGS_SHEET, dogCell(dog, pose), height)

export function setDogPose(image: Phaser.GameObjects.Image, dog: DogId, pose: DogPose) {
    return image.setFrame(cellKey(dogCell(dog, pose)))
}

export const iconImage = (scene: Phaser.Scene, trait: TraitId, size: number) => fit(scene, PIECES_SHEET, iconCell(trait), size)

export const ninaImage = (scene: Phaser.Scene, index: number, height: number) => figure(scene, LIFEGUARD_SHEET, index, height)
