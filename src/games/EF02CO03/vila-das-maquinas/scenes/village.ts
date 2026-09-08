import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, SHED, STAGE, W } from '../data/layout'
import { C } from '../data/theme'

export function createVillage(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []

    if (scene.textures.exists('bg-vila')) {
        const bg = scene.add.image(W / 2, H / 2, 'bg-vila').setDepth(DEPTH.bg)
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        parts.push(bg)
    } else {
        const sky = scene.add.graphics().setDepth(DEPTH.bg)
        sky.fillStyle(0x9fe0ef, 1)
        sky.fillRect(0, 0, W, H)
        sky.fillStyle(C.grass, 1)
        sky.fillRect(0, 380, W, H - 380)
        parts.push(sky)
    }

    const veil = scene.add.graphics().setDepth(DEPTH.veil)
    veil.fillStyle(C.white, 0.16)
    veil.fillRect(0, 0, W, H)
    parts.push(veil)

    const frame = scene.add.graphics().setDepth(DEPTH.stage)
    frame.fillStyle(C.ink, 0.18)
    frame.fillRoundedRect(STAGE.left, STAGE.top + 9, STAGE.w, STAGE.h, STAGE.r)
    frame.fillStyle(C.white, 0.4)
    frame.fillRoundedRect(STAGE.left, STAGE.top, STAGE.w, STAGE.h, STAGE.r)
    frame.lineStyle(6, C.cream, 0.95)
    frame.strokeRoundedRect(STAGE.left, STAGE.top, STAGE.w, STAGE.h, STAGE.r)
    parts.push(frame)

    const stage = scene.add.graphics().setDepth(DEPTH.stage + 1)
    const groundY = STAGE.ground
    const groundH = STAGE.bottom - groundY - 7
    const inner = { x: STAGE.left + 7, w: STAGE.w - 14 }
    const corner = { tl: 0, tr: 0, bl: STAGE.r - 8, br: STAGE.r - 8 }

    stage.fillStyle(C.grass, 1)
    stage.fillRect(inner.x, groundY - 16, inner.w, 20)
    for (let x = inner.x; x < inner.x + inner.w; x += 34) {
        stage.fillStyle(C.grass, 1)
        stage.fillCircle(x + 17, groundY - 16, 15)
    }

    stage.fillStyle(C.sand, 1)
    stage.fillRoundedRect(inner.x, groundY, inner.w, groundH, corner)
    stage.fillStyle(C.sandDark, 1)
    stage.fillRect(inner.x, groundY, inner.w, 7)
    for (let i = 0; i < 14; i++) {
        stage.fillStyle(C.sandDark, 0.55)
        stage.fillEllipse(inner.x + 26 + i * 44, groundY + 20 + (i % 3) * 9, 16, 7)
    }

    parts.push(stage)

    const shed = scene.add.graphics().setDepth(DEPTH.shed)
    shed.fillStyle(C.woodDark, 1)
    shed.fillRect(0, SHED.top, W, H - SHED.top)
    for (let x = 0; x < W; x += 148) {
        shed.fillStyle(C.ink, 0.12)
        shed.fillRect(x, SHED.top + 30, 5, H)
    }
    shed.fillStyle(C.wood, 1)
    shed.fillRoundedRect(-24, SHED.top - 10, W + 48, 40, 14)
    shed.fillStyle(C.woodLight, 0.55)
    shed.fillRoundedRect(-24, SHED.top - 6, W + 48, 12, 6)
    shed.fillStyle(C.ink, 0.22)
    shed.fillRect(0, SHED.top + 30, W, 8)
    parts.push(shed)

    return {
        /**
         * O galpão e a moldura do palco somem no modo cena. O chão fica: é
         * onde a máquina se apoia, e sem ele ela passa a flutuar na vila.
         */
        fadeFrame(alpha: number, ms: number) {
            return FX.to(scene, [shed, frame], { alpha }, { duration: ms })
        },

        destroy() {
            parts.forEach(part => part.destroy())
        },
    }
}
