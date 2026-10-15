import Phaser from 'phaser'
import { cellKey, type Sheet } from '../data/files'
import { C } from '../data/theme'

export const SHADOW = 'rdn-shadow'
export const DOT = 'rdn-dot'
export const CAL = 'rdn-cal'

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

export function ensureBits(scene: Phaser.Scene) {
    baked(scene, SHADOW, 128, 40, g => {
        g.fillStyle(C.shadow, 1)
        g.fillEllipse(64, 20, 124, 36)
    })
    baked(scene, DOT, 16, 16, g => {
        g.fillStyle(C.white, 1)
        g.fillCircle(8, 8, 8)
    })
    baked(scene, CAL, 64, 64, g => {
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(5, 11, 54, 49, 10)
        g.fillStyle(C.coral, 1)
        g.fillRoundedRect(5, 11, 54, 17, { tl: 10, tr: 10, bl: 0, br: 0 })
        g.lineStyle(4, C.line, 1)
        g.strokeRoundedRect(5, 11, 54, 49, 10)
        g.fillStyle(C.line, 1)
        g.fillRoundedRect(17, 3, 7, 15, 3)
        g.fillRoundedRect(40, 3, 7, 15, 3)
        g.fillStyle(C.inkSoft, 1)
        for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) g.fillRoundedRect(15 + c * 13, 34 + r * 12, 8, 7, 2)
    })
}

export const refOf = (scene: Phaser.Scene, sheet: Sheet) =>
    (scene.textures.get(sheet.key).customData as { ref?: number }).ref ?? sheet.cellH

export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export function fitInto(image: Phaser.GameObjects.Image, size: number) {
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}
