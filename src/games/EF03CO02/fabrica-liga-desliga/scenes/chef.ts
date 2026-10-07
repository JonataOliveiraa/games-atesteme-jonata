import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CHEF, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { WHISTLE } from '../data/words'
import { piece } from './art'

export interface Chef {
    arrive(): Promise<void>
    whistle(): void
    shake(): Promise<void>
    leave(): Promise<void>
    readonly visible: boolean
    destroy(): void
}

export function createChef(scene: Phaser.Scene): Chef {
    const art = piece(scene, 'chef', CHEF.size)
    const label = scene.add
        .text(0, 0, WHISTLE, { fontFamily: FONT.black, fontSize: `${SIZE.balloon}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const w = label.width + 30
    const h = SIZE.balloon + 22
    const bubbleBg = scene.add.graphics()
    bubbleBg.fillStyle(C.white, 1)
    bubbleBg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    bubbleBg.fillTriangle(-10, h / 2 - 2, 10, h / 2 - 2, 14, h / 2 + 16)
    bubbleBg.lineStyle(3, C.ink, 1)
    bubbleBg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    const bubble = scene.add.container(-30, -CHEF.size / 2 - 26, [bubbleBg, label]).setVisible(false)
    const box = scene.add.container(CHEF.x, CHEF.y, [art, bubble]).setDepth(DEPTH.card - 1).setVisible(false)

    return {
        async arrive() {
            bubble.setVisible(false)
            box.setVisible(true).setAlpha(1)
            await FX.popIn(scene, box, { from: 0.2, duration: 360 })
        },
        whistle() {
            bubble.setVisible(true).setScale(0.3)
            void FX.to(scene, bubble, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
            void FX.impact(scene, art, 0.12)
        },
        async shake() {
            await FX.shake(scene, box, { amount: 6, times: 3 })
        },
        async leave() {
            if (!box.visible) return
            await FX.to(scene, box, { alpha: 0, scale: 0.6 }, { duration: 220 })
            box.setVisible(false).setScale(1)
        },
        get visible() {
            return box.visible
        },
        destroy() {
            box.destroy()
        },
    }
}
