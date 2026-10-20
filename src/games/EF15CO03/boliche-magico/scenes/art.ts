import Phaser from 'phaser'
import { C } from '../data/theme'

export const YES = 'bm-yes'
export const NO = 'bm-no'
export const SPARK = 'bm-spark'

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
    const key = baked(scene, `bm-paint-${++serial}`, w, h, paint)
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
    baked(scene, YES, 50, 52, g => mark(g, C.yes, C.yesDark, true))
    baked(scene, NO, 50, 52, g => mark(g, C.oops, C.oopsDark, false))
    baked(scene, SPARK, 24, 24, g => {
        const pts = []
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? 11 : 5
            const a = -Math.PI / 2 + (i * Math.PI) / 5
            pts.push({ x: 12 + Math.cos(a) * r, y: 12 + Math.sin(a) * r })
        }
        g.fillStyle(C.star, 1)
        g.fillPoints(pts, true)
        g.lineStyle(2, C.line, 1)
        g.strokePoints(pts, true)
    })
}
