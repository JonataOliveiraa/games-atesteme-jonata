import Phaser from 'phaser'
import { DEPTH, GROUND, H, W } from '../data/layout'
import { C } from '../data/theme'

export const ARENA_TEXTURE = 'bg-arena'

export function createArena(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.scene)

    if (scene.textures.exists(ARENA_TEXTURE)) {
        root.add(scene.add.image(W / 2, H / 2, ARENA_TEXTURE).setDisplaySize(W, H))
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.sky, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.grassDark, 1)
        g.fillRect(0, GROUND - 18, W, H - GROUND + 18)
        g.fillStyle(C.grass, 1)
        g.fillRect(0, GROUND - 18, W, 26)
        root.add(g)
    }

    const dust = scene.add.graphics().setDepth(DEPTH.crowd)
    dust.fillStyle(C.woodDark, 0.18)
    dust.fillEllipse(W / 2, GROUND + 6, 760, 30)
    root.add(dust)

    return {
        get container() {
            return root
        },

        destroy() {
            root.destroy(true)
        },
    }
}

export type Arena = ReturnType<typeof createArena>
