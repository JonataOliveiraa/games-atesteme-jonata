import Phaser from 'phaser'
import { cellKey, type Piece, type Sheet } from '../data/files'

export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export function refit(image: Phaser.GameObjects.Image, index: number, size: number) {
    image.setFrame(cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export function piece(scene: Phaser.Scene, p: Piece, size: number) {
    return fit(scene, p.sheet, p.cell, size)
}

/** peça esticada pelo meio; a escala encolhe os cantos da arte grande para o tamanho da tela */
export function slice(scene: Phaser.Scene, x: number, y: number, p: Piece, w: number, h: number, corner: number, scale: number) {
    return scene.add.nineslice(x, y, p.sheet.key, cellKey(p.cell), w / scale, h / scale, corner, corner, corner, corner).setScale(scale)
}
