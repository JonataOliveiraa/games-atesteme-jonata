import Phaser from 'phaser'
import { SHEET } from '../data/art'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'

/** O pátio. Fundo e nada mais: tudo que se toca é desenhado por cima. */
export function createYard(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []

    if (scene.textures.exists(SHEET.courtyard)) {
        const bg = scene.add
            .image(W / 2, H / 2, SHEET.courtyard)
            .setDisplaySize(W, H + 2)
            .setDepth(DEPTH.bg)
        // o borrão é fraco de propósito: forte demais lê como defeito de arte.
        // quem manda o fundo para trás é o véu, logo abaixo
        bg.preFX?.addBlur(1, 2, 2, 0.4)
        parts.push(bg)
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.bg)
        g.fillStyle(C.sky, 1)
        g.fillRect(0, 0, W, 150)
        g.fillStyle(C.leaf, 1)
        g.fillCircle(120, 120, 96)
        g.fillCircle(1160, 108, 84)
        g.fillStyle(C.wall, 1)
        g.fillRect(0, 130, W, 500)
        g.fillStyle(C.wallDeep, 1)
        g.fillRect(0, 618, W, 14)
        g.fillStyle(C.floor, 1)
        g.fillRect(0, 630, W, H - 630)
        parts.push(g)
    }

    const veil = scene.add.graphics().setDepth(DEPTH.veil)
    veil.fillStyle(C.wall, 0.32)
    veil.fillRect(0, 0, W, H)
    parts.push(veil)

    return {
        destroy() {
            parts.forEach(p => p.destroy())
        },
    }
}

export type Yard = ReturnType<typeof createYard>
