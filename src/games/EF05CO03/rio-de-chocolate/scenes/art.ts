import Phaser from 'phaser'
import { C } from '../data/theme'

export const FOAM = 'rdc-foam'
export const RING = 'rdc-ring'
export const YES = 'rdc-yes'
export const NO = 'rdc-no'
export const DROP = 'rdc-drop'
export const BUBBLE_DOT = 'rdc-bubble'

let serial = 0

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

export function paintImage(
    scene: Phaser.Scene,
    w: number,
    h: number,
    paint: (g: Phaser.GameObjects.Graphics) => void,
): Phaser.GameObjects.Image {
    const key = baked(scene, `rdc-paint-${++serial}`, w, h, paint)
    const image = scene.add.image(0, 0, key)
    image.once(Phaser.GameObjects.Events.DESTROY, () => {
        if (scene.textures.exists(key)) scene.textures.remove(key)
    })
    return image
}

function mark(g: Phaser.GameObjects.Graphics, fill: number, rim: number, yes: boolean) {
    g.fillStyle(C.shadow, 0.25)
    g.fillCircle(25, 28, 22)
    g.fillStyle(rim, 1)
    g.fillCircle(24, 24, 23)
    g.fillStyle(fill, 1)
    g.fillCircle(24, 24, 19)
    g.lineStyle(6, C.white, 1)
    if (yes) g.strokePoints([{ x: 14, y: 25 }, { x: 21, y: 32 }, { x: 34, y: 16 }], false)
    else {
        g.lineBetween(16, 16, 32, 32)
        g.lineBetween(32, 16, 16, 32)
    }
}

export function ensureBits(scene: Phaser.Scene) {
    baked(scene, FOAM, 220, 84, g => {
        g.fillStyle(C.riverDark, 0.45)
        g.fillEllipse(110, 46, 214, 72)
        g.fillStyle(C.foam, 0.5)
        g.fillEllipse(110, 42, 206, 66)
        g.fillStyle(C.foam, 0.4)
        g.fillEllipse(110, 40, 180, 52)
    })
    baked(scene, RING, 240, 100, g => {
        g.lineStyle(10, C.ringYellow, 1)
        g.strokeEllipse(120, 50, 224, 84)
        g.lineStyle(3, C.white, 0.9)
        g.strokeEllipse(120, 50, 206, 70)
    })
    baked(scene, YES, 50, 52, g => mark(g, C.yes, C.yesDark, true))
    baked(scene, NO, 50, 52, g => mark(g, C.oops, C.oopsDark, false))
    baked(scene, DROP, 20, 20, g => {
        g.fillStyle(C.river, 1)
        g.fillCircle(10, 10, 9)
        g.fillStyle(C.riverShine, 0.9)
        g.fillCircle(7, 7, 3)
    })
    baked(scene, BUBBLE_DOT, 20, 20, g => {
        g.lineStyle(3, C.riverShine, 1)
        g.strokeCircle(10, 10, 7)
    })
}
