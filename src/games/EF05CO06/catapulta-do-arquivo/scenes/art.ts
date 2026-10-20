import Phaser from 'phaser'
import { cellKey, cellScale, type Sheet } from '../data/files'

/** célula recortada, cabendo num quadrado de `size` */
export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

/** célula inteira, na escala de contrato (folhas sem recorte) */
export function cell(scene: Phaser.Scene, sheet: Sheet, index: number, scale: number) {
    return scene.add.image(0, 0, sheet.key, cellKey(index)).setScale(cellScale(scene, sheet, scale))
}
