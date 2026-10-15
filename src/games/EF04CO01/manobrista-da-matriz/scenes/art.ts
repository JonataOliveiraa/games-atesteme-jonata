import Phaser from 'phaser'
import { CAR_SHEET, CONTROL_SHEET, PIECES_SHEET, cellKey, type Sheet } from '../data/files'

/** Peça solta: origem no centro, cabe num quadrado de `size`. */
export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

/** O carro visto de cima, nariz para cima, com o comprimento dado. */
export function carImage(scene: Phaser.Scene, color: number, length: number) {
    const image = scene.add.image(0, 0, CAR_SHEET.key, cellKey(color))
    return image.setScale(length / image.frame.height)
}

export const controlImage = (scene: Phaser.Scene, index: number, size: number) => fit(scene, CONTROL_SHEET, index, size)
export const pieceImage = (scene: Phaser.Scene, index: number, size: number) => fit(scene, PIECES_SHEET, index, size)

/** troca a célula mantendo o tamanho de encaixe */
export function refit(image: Phaser.GameObjects.Image, index: number, size: number) {
    image.setFrame(cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}
