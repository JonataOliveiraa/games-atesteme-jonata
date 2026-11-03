import Phaser from 'phaser'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Art } from '../types'

export function baked(
    scene: Phaser.Scene,
    key: string,
    w: number,
    h: number,
    paint: (g: Phaser.GameObjects.Graphics) => void,
): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

export function paintCard(g: Phaser.GameObjects.Graphics, w: number, h: number, r: number, pad: number, fill: number = C.card) {
    g.fillStyle(C.shadow, 0.16)
    g.fillRoundedRect(pad + 4, pad + 10, w, h, r)
    g.fillStyle(C.cardLip, 1)
    g.fillRoundedRect(pad, pad + 7, w, h, r)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(pad, pad, w, h, r)
    g.lineStyle(5, C.ink, 1)
    g.strokeRoundedRect(pad, pad, w, h, r)
}

export function cardImage(scene: Phaser.Scene, key: string, w: number, h: number, r = 26): Phaser.GameObjects.Image {
    const pad = 12
    baked(scene, key, w + pad * 2 + 6, h + pad * 2 + 12, g => paintCard(g, w, h, r, pad))
    return scene.add.image(0, 0, key).setOrigin((w / 2 + pad) / (w + pad * 2 + 6), (h / 2 + pad) / (h + pad * 2 + 12))
}

export const cloudBox = (w: number, h: number) => ({ w: Math.ceil(w + h * 0.7 + 24), h: Math.ceil(h * 1.25 + 24) })

export function paintCloud(g: Phaser.GameObjects.Graphics, cx: number, cy: number, w: number, h: number, line = 5) {
    const bumps = [
        { x: -0.34, y: 0.12, r: 0.3 },
        { x: -0.14, y: -0.14, r: 0.38 },
        { x: 0.12, y: -0.18, r: 0.4 },
        { x: 0.34, y: 0.04, r: 0.32 },
        { x: 0.0, y: 0.2, r: 0.32 },
        { x: -0.2, y: 0.22, r: 0.26 },
        { x: 0.22, y: 0.22, r: 0.26 },
    ]
    const draw = (grow: number) => {
        for (const b of bumps) g.fillCircle(cx + b.x * w, cy + b.y * h, b.r * h + grow)
        g.fillRoundedRect(cx - w * 0.38 - grow, cy - h * 0.05 - grow, w * 0.76 + grow * 2, h * 0.42 + grow * 2, h * 0.2)
    }
    if (line > 0) {
        g.fillStyle(C.ink, 1)
        draw(line)
    }
    g.fillStyle(C.white, 1)
    draw(0)
}

export function paintArrowUp(g: Phaser.GameObjects.Graphics, cx: number, cy: number, s: number) {
    g.fillStyle(C.ink, 1)
    g.fillTriangle(cx - s * 0.62, cy, cx + s * 0.62, cy, cx, cy - s * 0.7)
    g.fillRoundedRect(cx - s * 0.26, cy - 2, s * 0.52, s * 0.6, 6)
    g.fillStyle(C.gold, 1)
    g.fillTriangle(cx - s * 0.42, cy - 6, cx + s * 0.42, cy - 6, cx, cy - s * 0.52)
    g.fillRoundedRect(cx - s * 0.14, cy - 8, s * 0.28, s * 0.58, 4)
}

export function paintArrowRight(g: Phaser.GameObjects.Graphics, cx: number, cy: number, s: number) {
    g.fillStyle(C.ink, 1)
    g.fillTriangle(cx, cy - s * 0.62, cx, cy + s * 0.62, cx + s * 0.7, cy)
    g.fillRoundedRect(cx - s * 0.62, cy - s * 0.26, s * 0.66, s * 0.52, 6)
    g.fillStyle(C.white, 1)
    g.fillTriangle(cx + 6, cy - s * 0.42, cx + 6, cy + s * 0.42, cx + s * 0.52, cy)
    g.fillRoundedRect(cx - s * 0.54, cy - s * 0.14, s * 0.62, s * 0.28, 4)
}

export interface ArtView {
    readonly container: Phaser.GameObjects.Container
    set(art: Art): void
    destroy(): void
}

export function createArtView(scene: Phaser.Scene, x: number, y: number, size: number): ArtView {
    const container = scene.add.container(x, y)
    const draw = (art: Art) => {
        container.removeAll(true)
        if (scene.textures.exists(art.key)) {
            const image = scene.add.image(0, 0, art.key, art.frame)
            image.setScale(size / Math.max(image.frame.width, image.frame.height))
            container.add(image)
            return
        }
        const box = scene.add.graphics()
        box.fillStyle(C.paperLight, 1)
        box.fillRoundedRect(-size / 2, -size / 2, size, size, 14)
        box.lineStyle(3, C.inkSoft, 1)
        box.strokeRoundedRect(-size / 2, -size / 2, size, size, 14)
        const label = scene.add
            .text(0, 0, art.id, {
                fontFamily: FONT.body,
                fontSize: `${SIZE.placeholder}px`,
                color: CSS.inkSoft,
                align: 'center',
                wordWrap: { width: size - 12, useAdvancedWrap: true },
            })
            .setOrigin(0.5)
            .setResolution(2)
        container.add([box, label])
    }
    return {
        container,
        set: draw,
        destroy() {
            container.destroy()
        },
    }
}
