import Phaser from 'phaser'
import { artScale, cellKey, type Sheet } from '../data/files'
import { GLYPH_H, LINE, fontKey, glyphKey, type FontTone, type GlyphStyle } from '../data/glyphs'

/** uma célula da folha, com o lado maior do desenho em `size` px */
export function sprite(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

/** uma célula da folha com cada pixel de arte valendo `k` px (escala inteira: pixel limpo) */
export function pixel(scene: Phaser.Scene, sheet: Sheet, index: number, k: number) {
    return scene.add.image(0, 0, sheet.key, cellKey(index)).setScale(k / artScale(scene.textures, sheet))
}

export function resprite(image: Phaser.GameObjects.Image, index: number, size: number) {
    image.setFrame(cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

/** um número-imagem da fonte de pixel, com `height` px de altura (o miolo, sem o contorno) */
export function glyph(scene: Phaser.Scene, ch: string, style: GlyphStyle, height: number) {
    return scene.add.image(0, 0, glyphKey(ch, style)).setScale(height / GLYPH_H)
}

/** texto na fonte de pixel, em maiúsculas, com cada pixel de arte valendo `k` px */
export function ptext(scene: Phaser.Scene, x: number, y: number, text: string, k: number, tone: FontTone = 'white') {
    return scene.add.bitmapText(x, y, fontKey(tone), text.toUpperCase(), LINE * k).setOrigin(0.5)
}

/** o mesmo texto com uma sombra de 1 pixel de arte embaixo, para ler sobre cor */
export function ptextShadow(scene: Phaser.Scene, text: string, k: number, tone: FontTone = 'white', shadow: FontTone = 'dark') {
    const back = ptext(scene, 0, k, text, k, shadow)
    const front = ptext(scene, 0, 0, text, k, tone)
    return scene.add.container(0, 0, [back, front])
}
