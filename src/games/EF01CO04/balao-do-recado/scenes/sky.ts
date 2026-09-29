import Phaser from 'phaser'
import { BG } from '../data/files'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'

export interface Sky {
    update(dtMs: number, speedPxPerS: number): void
    destroy(): void
}

const FALLBACK = 'balao-do-recado-bg-fallback'

function makeFallback(scene: Phaser.Scene) {
    if (scene.textures.exists(FALLBACK)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(C.cloud, 0.7)
    for (const [x, y, r] of [
        [180, 220, 34],
        [520, 330, 28],
        [860, 200, 38],
        [1120, 420, 30],
    ]) {
        g.fillCircle(x, y, r)
        g.fillCircle(x + r, y + 6, r * 0.8)
        g.fillCircle(x - r, y + 8, r * 0.7)
    }
    g.fillStyle(C.leaf, 1)
    g.fillRect(0, 640, W, 80)
    const colors = [C.coral, C.sun, C.mint, C.lilac]
    for (let i = 0; i < 8; i++) {
        const x = 20 + i * 160
        g.fillStyle(colors[i % colors.length], 1)
        g.fillRect(x, 590, 110, 90)
        g.fillStyle(C.roof, 1)
        g.fillTriangle(x - 10, 590, x + 120, 590, x + 55, 560)
        g.fillStyle(C.cream, 1)
        g.fillRect(x + 40, 620, 30, 30)
    }
    g.generateTexture(FALLBACK, W, H)
    g.destroy()
}

export function createSky(scene: Phaser.Scene): Sky {
    const hasArt = scene.textures.exists(BG)
    if (!hasArt) makeFallback(scene)
    const key = hasArt ? BG : FALLBACK
    const frame = scene.textures.getFrame(key)
    const tile = scene.add
        .tileSprite(0, 0, W, H, key)
        .setOrigin(0)
        .setDepth(DEPTH.sky)
    tile.setTileScale(H / frame.height)

    return {
        update(dtMs, speed) {
            tile.tilePositionX += (speed * dtMs) / 1000 / tile.tileScaleX
        },
        destroy() {
            tile.destroy()
        },
    }
}
