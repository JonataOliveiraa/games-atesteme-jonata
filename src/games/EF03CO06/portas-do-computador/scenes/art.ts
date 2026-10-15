import Phaser from 'phaser'
import { DEVICES_SHEET, DEVICE_CELL, INFO_SHEET, PEOPLE_SHEET, PIECES_SHEET, WISH_CELL, WISH_SHEET, cellKey, infoCell, personCell, type Sheet } from '../data/files'
import type { DeviceId, InfoId, InfoPose, PersonId, PersonPose, Wish } from '../types'

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

export const deviceImage = (scene: Phaser.Scene, id: DeviceId, size: number) => fit(scene, DEVICES_SHEET, DEVICE_CELL[id], size)
export const pieceImage = (scene: Phaser.Scene, index: number, size: number) => fit(scene, PIECES_SHEET, index, size)
export const infoImage = (scene: Phaser.Scene, info: InfoId, pose: InfoPose, height: number) =>
    figure(scene, INFO_SHEET, infoCell(info, pose), height)
export const setInfoPose = (image: Phaser.GameObjects.Image, info: InfoId, pose: InfoPose) => image.setFrame(cellKey(infoCell(info, pose)))
export const personImage = (scene: Phaser.Scene, person: PersonId, pose: PersonPose, height: number) =>
    figure(scene, PEOPLE_SHEET, personCell(person, pose), height)
export const setPersonPose = (image: Phaser.GameObjects.Image, person: PersonId, pose: PersonPose) =>
    image.setFrame(cellKey(personCell(person, pose)))
export const wishImage = (scene: Phaser.Scene, wish: Wish, size: number) => fit(scene, WISH_SHEET, WISH_CELL[wish], size)
