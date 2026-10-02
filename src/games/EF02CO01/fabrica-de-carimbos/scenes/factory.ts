import Phaser from 'phaser'
import { BG } from '../data/files'
import { BOX, DEPTH, H, STAMP, W } from '../data/layout'
import { C } from '../data/theme'

function gear(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number) {
    g.fillStyle(color, 1)
    for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8
        g.fillCircle(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.32)
    }
    g.fillCircle(x, y, r)
    g.lineStyle(3, C.ink, 0.5)
    g.strokeCircle(x, y, r)
    g.fillStyle(C.wall, 1)
    g.fillCircle(x, y, r * 0.38)
}

export function createFactory(scene: Phaser.Scene) {
    if (scene.textures.exists(BG)) {
        const image = scene.add.image(W / 2, H / 2, BG).setDepth(DEPTH.bg)
        image.setScale(Math.max(W / image.width, H / image.height))
        return { destroy: () => image.destroy() }
    }

    const g = scene.add.graphics().setDepth(DEPTH.bg)
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(C.wallDark, 1)
    for (let x = 0; x < W; x += 80) g.fillRect(x, 96, 6, 420)
    g.fillStyle(C.floor, 1)
    g.fillRect(0, 600, W, H - 600)
    g.fillStyle(C.floorDark, 1)
    g.fillRect(0, 600, W, 8)

    for (const x of [130, 1110]) {
        g.fillStyle(C.cream, 1)
        g.fillCircle(x, 200, 52)
        g.lineStyle(6, C.lilacDark, 1)
        g.strokeCircle(x, 200, 52)
        g.lineStyle(3, C.lilacDark, 0.6)
        g.lineBetween(x - 52, 200, x + 52, 200)
        g.lineBetween(x, 148, x, 252)
    }

    g.fillStyle(C.wood, 1)
    g.fillRect(820, 300, 300, 14)
    g.fillRect(40, 330, 250, 14)
    gear(g, 880, 270, 22, C.lilac)
    gear(g, 950, 262, 30, C.mint)
    gear(g, 1050, 274, 18, C.lilacDark)
    gear(g, 110, 300, 24, C.mint)
    gear(g, 200, 296, 28, C.lilac)

    const gx = STAMP.x
    g.fillStyle(C.lilac, 1)
    g.fillRoundedRect(gx - 200, STAMP.rodTop - 24, 400, 30, 14)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(gx - 200, STAMP.rodTop - 24, 400, 30, 14)
    for (const side of [-1, 1]) {
        g.fillStyle(C.mint, 1)
        g.fillRoundedRect(gx + side * 200 - 16, STAMP.rodTop - 24, 32, 470, 12)
        g.lineStyle(4, C.ink, 1)
        g.strokeRoundedRect(gx + side * 200 - 16, STAMP.rodTop - 24, 32, 470, 12)
    }
    g.fillStyle(C.steel, 1)
    g.fillRoundedRect(gx - 40, STAMP.rodTop - 14, 80, 22, 8)
    g.lineStyle(3, C.ink, 1)
    g.strokeRoundedRect(gx - 40, STAMP.rodTop - 14, 80, 22, 8)

    g.fillStyle(C.lilac, 0.55)
    g.fillEllipse(BOX.x, BOX.base + 6, 240, 40)

    for (let i = 0; i < 9; i++) {
        g.fillStyle(i % 2 ? C.mint : C.glow, 1)
        g.fillCircle(80 + i * 140, 112, 6)
    }

    return { destroy: () => g.destroy() }
}
