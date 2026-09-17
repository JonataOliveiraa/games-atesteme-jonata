import Phaser from 'phaser'
import { COUNTER_Y, DEPTH, H, W } from '../data/layout'
import { A, C } from '../data/theme'
import { TEX } from './BootScene'

export interface Counter {
    destroy(): void
}

/** O fundo e o véu. O véu é quem faz o fundo virar fundo nesta paleta neon. */
export function createCounter(scene: Phaser.Scene): Counter {
    const root = scene.add.container(0, 0).setDepth(DEPTH.scene)

    if (scene.textures.exists(TEX.bg)) {
        const bg = scene.add.image(W / 2, H / 2, TEX.bg)
        const cover = Math.max(W / bg.width, H / bg.height)
        bg.setScale(cover)
        bg.preFX?.addBlur(1, 2, 2, 0.25)
        root.add(bg)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.sky, 1)
        g.fillRect(0, 0, W, COUNTER_Y - 46)
        g.fillStyle(C.band, 1)
        g.fillRect(0, 96, W, 52)
        g.fillStyle(C.pavement, 1)
        g.fillRect(0, COUNTER_Y - 46, W, 46)
        g.fillStyle(C.counter, 1)
        g.fillRect(0, COUNTER_Y, W, 64)
        g.fillStyle(C.counterDeep, 1)
        g.fillRect(0, COUNTER_Y + 64, W, H - COUNTER_Y - 64)
        root.add(g)
    }

    // O véu é quem faz o fundo virar fundo, e nesta paleta ele precisa de mão
    // pesada: casinha neon atrás de plaquinha neon briga de igual para igual.
    const veil = scene.add.graphics()
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
    veil.fillStyle(C.ink, 0.22)
    veil.fillRect(0, 0, W, COUNTER_Y)
    root.add(veil)

    return {
        destroy: () => root.destroy(true),
    }
}
