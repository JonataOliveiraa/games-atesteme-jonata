import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { COMPUTER_ART, COMPUTER_FRAME, SHEET } from '../data/devices'
import { CPU, DEPTH, TABLE } from '../data/layout'
import { C } from '../data/theme'

export function createComputer(scene: Phaser.Scene) {
    const root = scene.add.container(CPU.x, TABLE.top).setDepth(DEPTH.computer)
    const hasArt = scene.textures.exists(SHEET.computer.key)
    const scale = CPU.h / (COMPUTER_ART.bottom - 51)

    let image: Phaser.GameObjects.Image | null = null
    let face: Phaser.GameObjects.Graphics | null = null

    if (hasArt) {
        image = scene.add
            .image(0, 0, SHEET.computer.key, COMPUTER_FRAME.idle)
            .setOrigin(COMPUTER_ART.cx / 400, COMPUTER_ART.bottom / 650)
            .setScale(scale)
        root.add(image)
    } else {
        const w = 150
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-w / 2 - 4, -CPU.h - 4, w + 8, CPU.h + 8, 24)
        g.fillStyle(C.plastic, 1)
        g.fillRoundedRect(-w / 2, -CPU.h, w, CPU.h, 20)
        g.fillStyle(C.input, 1)
        g.fillRoundedRect(-w / 2 - 14, -130, 16, 36, 6)
        g.fillStyle(C.output, 1)
        g.fillRoundedRect(w / 2 - 2, -130, 16, 36, 6)
        face = scene.add.graphics()
        face.fillStyle(C.ink, 1)
        face.fillRoundedRect(-50, -CPU.h + 30, 100, 64, 12)
        root.add([g, face])
    }

    const local = (p: { x: number; y: number }) => ({
        x: CPU.x + (p.x - COMPUTER_ART.cx) * scale,
        y: TABLE.top - (COMPUTER_ART.bottom - p.y) * scale,
    })

    const setFrame = (frame: number) => image?.setFrame(frame)

    return {
        inPort: () => local(COMPUTER_ART.inPort),
        outPort: () => local(COMPUTER_ART.outPort),
        face: () => local(COMPUTER_ART.face),

        idle: () => setFrame(COMPUTER_FRAME.idle),
        receive: () => setFrame(COMPUTER_FRAME.receiving),
        send: () => setFrame(COMPUTER_FRAME.sending),

        async process() {
            setFrame(COMPUTER_FRAME.processing)
            await FX.to(scene, root, { scaleY: 1.04, scaleX: 0.97 }, { duration: 130, yoyo: true, repeat: 1 })
            root.setScale(1)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Computer = ReturnType<typeof createComputer>
