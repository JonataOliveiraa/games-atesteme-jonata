import Phaser from 'phaser'
import { C } from '../data/theme'

export const SPARK = 'of-spark'
export const DOT = 'of-dot'

let serial = 0

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

/** Uma imagem desenhada na hora, com textura própria que some junto com ela. */
export function paintImage(
    scene: Phaser.Scene,
    w: number,
    h: number,
    paint: (g: Phaser.GameObjects.Graphics) => void,
): Phaser.GameObjects.Image {
    const key = baked(scene, `of-paint-${++serial}`, w, h, paint)
    const image = scene.add.image(0, 0, key)
    image.once(Phaser.GameObjects.Events.DESTROY, () => {
        if (scene.textures.exists(key)) scene.textures.remove(key)
    })
    return image
}

export function starPoints(cx: number, cy: number, outer: number, inner: number, turn = -Math.PI / 2) {
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner
        const a = turn + (i * Math.PI) / 5
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
    }
    return pts
}

export function ensureBits(scene: Phaser.Scene) {
    baked(scene, SPARK, 24, 24, g => {
        const pts = starPoints(12, 12, 11, 5)
        g.fillStyle(C.accentYellow, 1)
        g.fillPoints(pts, true)
        g.lineStyle(2, C.line, 1)
        g.strokePoints(pts, true)
    })
    baked(scene, DOT, 12, 12, g => {
        g.fillStyle(C.white, 1)
        g.fillCircle(6, 6, 6)
    })
}
