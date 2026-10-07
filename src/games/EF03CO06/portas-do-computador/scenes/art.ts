import Phaser from 'phaser'
import { DEVICES_SHEET, DEVICE_CELL, INFO_SHEET, KID_SHEET, PIECES_SHEET, POSE_CELL, cellKey, infoCell, type Sheet } from '../data/files'
import type { DeviceId, InfoId, InfoPose, PoseId } from '../types'

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
export const kidImage = (scene: Phaser.Scene, pose: PoseId, height: number) => figure(scene, KID_SHEET, POSE_CELL[pose], height)
export const setKidPose = (image: Phaser.GameObjects.Image, pose: PoseId) => image.setFrame(cellKey(POSE_CELL[pose]))
export const infoImage = (scene: Phaser.Scene, info: InfoId, pose: InfoPose, height: number) =>
    figure(scene, INFO_SHEET, infoCell(info, pose), height)
export const setInfoPose = (image: Phaser.GameObjects.Image, info: InfoId, pose: InfoPose) => image.setFrame(cellKey(infoCell(info, pose)))
