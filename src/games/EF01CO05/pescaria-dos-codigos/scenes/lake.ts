import Phaser from 'phaser'
import { BG } from '../data/files'
import { DEPTH, H, PIER, W, WATER } from '../data/layout'
import { C } from '../data/theme'

export interface Lake {
    destroy(): void
}

const FALLBACK = 'pescaria-dos-codigos-bg-fallback'

function paintSky(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(C.skyDeep, 1)
    g.fillRect(0, 0, W, WATER.y)
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 120, W, WATER.y - 120)
    g.fillStyle(C.cloud, 0.75)
    for (const [x, y, r] of [
        [470, 120, 30],
        [700, 70, 24],
        [1010, 150, 34],
    ]) {
        g.fillCircle(x, y, r)
        g.fillCircle(x + r, y + 6, r * 0.8)
        g.fillCircle(x - r, y + 8, r * 0.7)
        g.fillRect(x - r * 1.5, y + 4, r * 3.1, r * 0.8)
    }
}

function paintHills(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(C.hillDark, 1)
    g.fillEllipse(20, WATER.y, 250, 120)
    g.fillEllipse(1180, WATER.y, 360, 130)
    g.fillStyle(C.hill, 1)
    g.fillEllipse(-10, WATER.y + 4, 300, 100)
    g.fillEllipse(1040, WATER.y + 4, 260, 110)
    g.fillEllipse(1240, WATER.y + 6, 240, 90)
}

function paintWater(g: Phaser.GameObjects.Graphics) {
    const bands: [number, number, number][] = [
        [WATER.y, 440, C.water],
        [440, 480, C.waterMid],
        [480, 690, C.waterMid],
        [690, H, C.waterDeep],
    ]
    for (const [top, bottom, tone] of bands) {
        g.fillStyle(tone, 1)
        g.fillRect(0, top, W, bottom - top)
    }
    g.fillStyle(C.water, 1)
    g.fillRect(0, 474, W, 6)
    g.fillStyle(C.waterLine, 1)
    g.fillRect(0, WATER.y, W, 5)
    g.fillStyle(C.waterLine, 0.7)
    for (const [x, y, w] of [
        [60, 420, 70],
        [620, 428, 90],
        [900, 418, 60],
        [1140, 452, 80],
    ]) {
        g.fillRoundedRect(x, y, w, 4, 2)
    }
}

function paintPier(g: Phaser.GameObjects.Graphics) {
    const posts = [PIER.x + 26, PIER.x + 118, PIER.x + 210]
    for (const x of posts) {
        g.fillStyle(C.woodDark, 1)
        g.fillRect(x - 9, PIER.y, 18, 80)
        g.lineStyle(4, C.ink, 1)
        g.strokeRect(x - 9, PIER.y, 18, 80)
        g.fillStyle(C.waterLine, 0.8)
        g.fillEllipse(x, WATER.y + 40, 44, 8)
    }
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(PIER.x, PIER.y, PIER.w, PIER.h, 6)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(PIER.x, PIER.y, PIER.w, PIER.h, 6)
    g.lineStyle(2, C.woodDark, 1)
    for (let x = PIER.x + 40; x < PIER.x + PIER.w - 10; x += 40) {
        g.lineBetween(x, PIER.y + 4, x, PIER.y + PIER.h - 4)
    }
}

function paintPlants(g: Phaser.GameObjects.Graphics) {
    for (const x of [30, 190, 470, 760, 1010, 1220]) {
        g.fillStyle(C.hillDark, 1)
        g.fillEllipse(x, H - 8, 18, 40)
        g.fillEllipse(x + 16, H - 6, 14, 30)
        g.fillStyle(C.hill, 1)
        g.fillEllipse(x - 14, H - 4, 12, 26)
    }
}

function makeFallback(scene: Phaser.Scene) {
    if (scene.textures.exists(FALLBACK)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paintSky(g)
    paintHills(g)
    paintWater(g)
    paintPier(g)
    paintPlants(g)
    g.generateTexture(FALLBACK, W, H)
    g.destroy()
}

export function createLake(scene: Phaser.Scene): Lake {
    const hasArt = scene.textures.exists(BG)
    if (!hasArt) makeFallback(scene)
    const image = scene.add
        .image(0, 0, hasArt ? BG : FALLBACK)
        .setOrigin(0)
        .setDisplaySize(W, H)
        .setDepth(DEPTH.bg)

    return {
        destroy() {
            image.destroy()
        },
    }
}
