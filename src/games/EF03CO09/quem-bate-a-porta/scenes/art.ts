import Phaser from 'phaser'
import { INFO_CELL, INFO_SHEET, PEOPLE_SHEET, PIECES_SHEET, cellKey, personCell, type Sheet } from '../data/files'
import type { DoorId, InfoId, PersonPose } from '../types'

const refOf = (scene: Phaser.Scene, sheet: Sheet) =>
    (scene.textures.get(sheet.key).customData as { ref?: number }).ref ?? sheet.cellH

/** Figura em pé: origem no pé, escala comum à folha. */
export function figure(scene: Phaser.Scene, sheet: Sheet, index: number, height: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index)).setOrigin(0.5, 1)
    return image.setScale(height / refOf(scene, sheet))
}

/** Em pé, com a altura exata da própria célula. */
export function tall(scene: Phaser.Scene, sheet: Sheet, index: number, height: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index)).setOrigin(0.5, 1)
    return image.setScale(height / image.frame.height)
}

/** Peça solta: origem no centro, cabe num quadrado de `size`. */
export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export const personImage = (scene: Phaser.Scene, who: DoorId, pose: PersonPose, height: number) =>
    figure(scene, PEOPLE_SHEET, personCell(who, pose), height)
export const setPersonPose = (image: Phaser.GameObjects.Image, who: DoorId, pose: PersonPose) => image.setFrame(cellKey(personCell(who, pose)))
export const infoImage = (scene: Phaser.Scene, info: InfoId, size: number) => fit(scene, INFO_SHEET, INFO_CELL[info], size)
export const pieceImage = (scene: Phaser.Scene, index: number, size: number) => fit(scene, PIECES_SHEET, index, size)
