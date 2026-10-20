import Phaser from 'phaser'
import { C } from '../data/theme'

export const STREAK = 'vnf-streak'

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
    const key = baked(scene, `vnf-paint-${++serial}`, w, h, paint)
    const image = scene.add.image(0, 0, key)
    image.once(Phaser.GameObjects.Events.DESTROY, () => {
        if (scene.textures.exists(key)) scene.textures.remove(key)
    })
    return image
}

export function ensureBits(scene: Phaser.Scene) {
    baked(scene, STREAK, 360, 40, g => {
        const pts: { x: number; y: number }[] = []
        for (let i = 0; i <= 24; i++) {
            const t = i / 24
            pts.push({ x: 10 + t * 340, y: 20 + Math.sin(t * Math.PI * 2) * 9 })
        }
        g.lineStyle(7, C.wind, 0.85)
        g.strokePoints(pts, false)
        g.lineStyle(3, C.wind, 1)
        g.strokePoints(pts.slice(4, 20), false)
    })
}
