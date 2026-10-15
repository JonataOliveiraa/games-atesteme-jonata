import Phaser from 'phaser'
import { DUDA_CELL, DUDA_SHEET, UI_SHEET, cellKey, type Sheet } from '../data/files'
import type { DudaPose } from '../types'

const refOf = (scene: Phaser.Scene, sheet: Sheet) =>
    (scene.textures.get(sheet.key).customData as { ref?: number }).ref ?? sheet.cellH

/** Figura em pé: origem no pé, escala comum à folha. */
export function figure(scene: Phaser.Scene, sheet: Sheet, index: number, height: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index)).setOrigin(0.5, 1)
    return image.setScale(height / refOf(scene, sheet))
}

/** Peça solta: origem no centro, cabe num quadrado de `size`. */
export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export const uiImage = (scene: Phaser.Scene, index: number, size: number) => fit(scene, UI_SHEET, index, size)

export const dudaImage = (scene: Phaser.Scene, pose: DudaPose, height: number) => figure(scene, DUDA_SHEET, DUDA_CELL[pose], height)
export const setDudaPose = (image: Phaser.GameObjects.Image, pose: DudaPose) => image.setFrame(cellKey(DUDA_CELL[pose]))
