import Phaser from 'phaser'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'

export const GYM_TEXTURE = 'bg-ginasio'

function drawFallback(g: Phaser.GameObjects.Graphics) {
    const floorY = 444

    g.fillStyle(0xfbd88a, 1)
    g.fillRect(0, 0, W, floorY)
    g.fillStyle(0xf2b95c, 1)
    g.fillRect(0, floorY - 96, W, 96)

    g.fillStyle(0xe8a44e, 1)
    g.fillRect(0, floorY, W, H - floorY)
    g.fillStyle(0xf0b463, 1)
    for (let x = 0; x < W; x += 96) g.fillRect(x, floorY, 46, H - floorY)

    g.lineStyle(6, C.white, 0.85)
    g.strokeEllipse(W / 2, floorY + 40, 300, 74)
    g.beginPath()
    g.moveTo(0, floorY + 6)
    g.lineTo(W, floorY + 6)
    g.strokePath()

    g.fillStyle(0x4f7fbe, 1)
    for (let i = 0; i < 4; i++) {
        g.fillRect(0, 220 + i * 44, 430 - i * 70, 40)
    }
    g.fillStyle(0xdfe8f5, 0.85)
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 6 - i; j++) g.fillCircle(38 + j * 62, 214 + i * 44, 15)
    }

    g.fillStyle(C.white, 1)
    g.fillRoundedRect(W / 2 - 82, 60, 164, 108, 12)
    g.lineStyle(9, 0x2f6fbf, 1)
    g.strokeRoundedRect(W / 2 - 82, 60, 164, 108, 12)
    g.lineStyle(9, 0xe2622f, 1)
    g.strokeRoundedRect(W / 2 - 44, 150, 88, 8, 4)
}

export function createGym(scene: Phaser.Scene) {
    const base = scene.add.rectangle(W / 2, H / 2, W, H, C.creamDeep).setDepth(DEPTH.scene - 1)

    let art: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

    if (scene.textures.exists(GYM_TEXTURE)) {
        const image = scene.add.image(W / 2, H / 2, GYM_TEXTURE).setDepth(DEPTH.scene)
        const source = image.texture.getSourceImage() as { width: number; height: number }
        const scale = Math.max(W / source.width, H / source.height)
        image.setDisplaySize(source.width * scale, source.height * scale)
        art = image
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.scene)
        drawFallback(g)
        art = g
    }

    const scrim = scene.add.graphics().setDepth(DEPTH.veil)
    scrim.fillGradientStyle(C.ink, C.ink, C.ink, C.ink, 0.46, 0.46, 0, 0)
    scrim.fillRect(0, 0, W, 250)
    scrim.fillGradientStyle(C.ink, C.ink, C.ink, C.ink, 0, 0, 0.3, 0.3)
    scrim.fillRect(0, 470, W, 250)

    return {
        destroy() {
            base.destroy()
            art.destroy()
            scrim.destroy()
        },
    }
}
