import Phaser from 'phaser'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'

export const LAB_TEXTURE = 'bg-laboratorio'

/** Laboratório de traço, para quando o PNG não estiver junto. */
function drawFallback(g: Phaser.GameObjects.Graphics) {
    const floorY = 470

    g.fillStyle(0xdcefff, 1)
    g.fillRect(0, 0, W, floorY)
    g.fillStyle(0xc3e2fb, 1)
    g.fillRect(0, floorY - 120, W, 120)

    g.fillStyle(0xf7dfa8, 1)
    g.fillRect(0, floorY, W, H - floorY)
    g.fillStyle(0xefd191, 1)
    for (let x = -60; x < W; x += 120) {
        g.fillTriangle(x, floorY, x + 60, floorY, x - 40, H)
    }

    g.fillStyle(0xb9d7ef, 1)
    g.fillRoundedRect(60, 250, 300, 26, 8)
    g.fillRoundedRect(920, 250, 300, 26, 8)
    for (let i = 0; i < 4; i++) {
        g.fillStyle([0x7dd3fc, 0xa78bfa, 0x86efac, 0xfcd34d][i], 1)
        g.fillRoundedRect(96 + i * 62, 200, 34, 50, 10)
        g.fillRoundedRect(956 + i * 62, 200, 34, 50, 10)
    }

    g.fillStyle(C.steelDark, 1)
    g.fillEllipse(W / 2, 500, 760, 120)
    g.fillStyle(C.steel, 1)
    g.fillEllipse(W / 2, 486, 760, 120)
}

/**
 * O cenário e o véu.
 *
 * Quem faz o fundo virar fundo é o véu, não o blur: a arte do laboratório é
 * cheia de bancada, prateleira e vidraria, e sem escurecer as pontas o cartão
 * grande do meio some no meio das cores.
 */
export function createLab(scene: Phaser.Scene) {
    const base = scene.add.rectangle(W / 2, H / 2, W, H, C.creamDeep).setDepth(DEPTH.scene - 1)

    let art: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

    if (scene.textures.exists(LAB_TEXTURE)) {
        const image = scene.add.image(W / 2, H / 2, LAB_TEXTURE).setDepth(DEPTH.scene)
        const source = image.texture.getSourceImage() as { width: number; height: number }
        const scale = Math.max(W / source.width, H / source.height)
        image.setDisplaySize(source.width * scale, source.height * scale)
        image.preFX?.addBlur(1, 2, 2, 0.4)
        art = image
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.scene)
        drawFallback(g)
        art = g
    }

    /*
     * O véu escurece as duas pontas, não o meio.
     *
     * A arte do laboratório é cheia de bancada, vidraria e estante; sem
     * abaixar o topo e o rodapé, a prateleira das máquinas e o rack somem no
     * meio das cores. O centro fica claro porque é onde o chassi mora.
     */
    const scrim = scene.add.graphics().setDepth(DEPTH.veil)
    scrim.fillStyle(C.ink, 0.22)
    scrim.fillRect(0, 0, W, H)
    scrim.fillGradientStyle(C.ink, C.ink, C.ink, C.ink, 0.56, 0.56, 0, 0)
    scrim.fillRect(0, 0, W, 230)
    scrim.fillGradientStyle(C.ink, C.ink, C.ink, C.ink, 0, 0, 0.5, 0.5)
    scrim.fillRect(0, 470, W, 250)

    /* O chão de luz sob o chassi: ele precisa estar POUSADO em alguma coisa. */
    const pool = scene.add.graphics().setDepth(DEPTH.veil + 1)
    pool.fillStyle(C.light, 0.16)
    pool.fillEllipse(640, 586, 620, 116)
    pool.fillStyle(C.ink, 0.3)
    pool.fillEllipse(640, 594, 400, 62)

    return {
        destroy() {
            base.destroy()
            art.destroy()
            scrim.destroy()
            pool.destroy()
        },
    }
}
