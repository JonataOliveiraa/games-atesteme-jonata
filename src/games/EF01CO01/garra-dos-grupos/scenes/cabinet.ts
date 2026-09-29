import Phaser from 'phaser'
import { BG } from '../data/files'
import { DEPTH, H, RAIL, SHOWCASE, VISOR, W } from '../data/layout'
import { A, C } from '../data/theme'

export interface Cabinet {
    readonly container: Phaser.GameObjects.Container
    destroy(): void
}

function paintCabinet(g: Phaser.GameObjects.Graphics) {
    g.fillGradientStyle(C.cabinetLight, C.cabinetLight, C.cabinet, C.cabinet, 1)
    g.fillRect(0, 0, W, H)

    g.fillStyle(C.cabinetDark, 1)
    g.fillRoundedRect(SHOWCASE.x - 14, SHOWCASE.y - 14, SHOWCASE.w + 28, SHOWCASE.h + 20, 34)
    g.fillStyle(C.glassDark, 1)
    g.fillRoundedRect(SHOWCASE.x, SHOWCASE.y, SHOWCASE.w, SHOWCASE.h - 6, 26)
    g.fillStyle(C.glass, A.glass)
    g.fillRoundedRect(SHOWCASE.x, SHOWCASE.y, SHOWCASE.w, SHOWCASE.h - 6, 26)
    g.fillStyle(C.white, 0.08)
    g.fillTriangle(SHOWCASE.x + 30, SHOWCASE.y + 20, SHOWCASE.x + 150, SHOWCASE.y + 20, SHOWCASE.x + 30, SHOWCASE.y + 200)

    g.fillStyle(C.railDark, 1)
    g.fillRoundedRect(RAIL.minX - 40, RAIL.y - 9, RAIL.maxX - RAIL.minX + 80, 18, 9)
    g.fillStyle(C.rail, 1)
    g.fillRoundedRect(RAIL.minX - 36, RAIL.y - 7, RAIL.maxX - RAIL.minX + 72, 10, 5)

    g.fillStyle(C.cabinetDark, 1)
    g.fillRoundedRect(VISOR.x - 16, VISOR.y - 6, VISOR.w + 32, VISOR.h + 12, 28)

    g.fillStyle(C.cabinetDark, 0.6)
    g.fillRoundedRect(920, 200, 330, 500, 34)
    g.fillStyle(C.cabinetLight, 0.35)
    g.fillRoundedRect(940, 610, 290, 26, 13)

    const bulbs = [C.gold, C.white, C.amber]
    for (let i = 0; i < 14; i++) {
        g.fillStyle(bulbs[i % bulbs.length], 0.85)
        g.fillCircle(SHOWCASE.x + 20 + i * 63, SHOWCASE.y - 26, 6)
    }
}

export function createCabinet(scene: Phaser.Scene): Cabinet {
    const art = scene.textures.exists(BG)
        ? scene.add.image(0, 0, BG).setOrigin(0).setDisplaySize(W, H)
        : (() => {
              const g = scene.add.graphics()
              paintCabinet(g)
              return g
          })()
    const container = scene.add.container(0, 0, [art]).setDepth(DEPTH.bg)
    return {
        container,
        destroy() {
            container.destroy()
        },
    }
}
