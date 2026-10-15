import Phaser from 'phaser'
import { cellKey, SLICE, type Sheet } from '../data/files'

/** peça solta, origem no centro, cabendo num quadrado de `size` */
export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export function fitHeight(scene: Phaser.Scene, sheet: Sheet, index: number, height: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(height / image.frame.height)
}

export function refit(image: Phaser.GameObjects.Image, index: number, size: number) {
    image.setFrame(cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

/**
 * Papel e moldura esticados sem deformar o canto: `corner` é o tamanho do canto na tela.
 * Devolve uma função para mudar o tamanho depois.
 */
export function sliced(scene: Phaser.Scene, sheet: Sheet, index: number, w: number, h: number, corner: number) {
    const frame = scene.textures.getFrame(sheet.key, cellKey(index))
    const inset = Math.max(4, Math.round(Math.min(frame.width, frame.height) * (SLICE[index] ?? 0.2)))
    const scale = corner / inset
    const piece = scene.add.nineslice(0, 0, sheet.key, cellKey(index), w / scale, h / scale, inset, inset, inset, inset)
    piece.setScale(scale)
    const resize = (nw: number, nh: number) => piece.setSize(Math.max(nw / scale, inset * 2), Math.max(nh / scale, inset * 2))
    return { piece, resize }
}

export const has = (scene: Phaser.Scene, sheet: Sheet) => scene.textures.exists(sheet.key)
