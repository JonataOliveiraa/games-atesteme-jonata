import Phaser from 'phaser'
import { cellKey, type Sheet } from '../data/files'
import { C } from '../data/theme'

export const SHADOW = 'cnt-shadow'
export const RIPPLE = 'cnt-ripple'
export const GLINT = 'cnt-glint'
export const DASH = 'cnt-dash'
export const DOT = 'cnt-dot'

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

export function ensureBits(scene: Phaser.Scene) {
    baked(scene, SHADOW, 128, 48, g => {
        g.fillStyle(C.shadow, 1)
        g.fillEllipse(64, 24, 124, 44)
    })
    baked(scene, RIPPLE, 128, 56, g => {
        g.lineStyle(5, C.white, 1)
        g.strokeEllipse(64, 28, 118, 46)
    })
    baked(scene, GLINT, 32, 32, g => {
        g.fillStyle(C.white, 1)
        g.fillRect(14, 2, 4, 28)
        g.fillRect(2, 14, 28, 4)
        g.fillCircle(16, 16, 5)
    })
    baked(scene, DASH, 40, 12, g => {
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(0, 0, 40, 12, 6)
    })
    baked(scene, DOT, 16, 16, g => {
        g.fillStyle(C.white, 1)
        g.fillCircle(8, 8, 8)
    })
}

const refOf = (scene: Phaser.Scene, sheet: Sheet) =>
    (scene.textures.get(sheet.key).customData as { ref?: number }).ref ?? sheet.cellH

export function figure(scene: Phaser.Scene, sheet: Sheet, index: number, height: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index)).setOrigin(0.5, 1)
    return image.setScale(height / refOf(scene, sheet))
}

export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export function tall(scene: Phaser.Scene, sheet: Sheet, index: number, height: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index)).setOrigin(0.5, 1)
    return image.setScale(height / image.frame.height)
}
