import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { BALLOON, DEPTH, H, W } from '../data/layout'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * O balão curto e a moldura da tela. A moldura pisca nas BORDAS, onde não há
 * nada para ler — é o que faz o acerto parecer grande sem tirar o olho do meio.
 */
export function createTalk(scene: Phaser.Scene) {
    const edgeG = scene.add.graphics().setDepth(DEPTH.edge)
    let edge = 0
    let edgeColor = C.ok

    const balloon = scene.add.container(BALLOON.x, BALLOON.y)
        .setDepth(DEPTH.balloon)
        .setAlpha(0)
        .setScale(0.8)
    const balloonG = scene.add.graphics()
    const text = scene.add.text(0, 0, '', {
        fontFamily: FONT.black,
        fontSize: '30px',
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: BALLOON.w - 60 },
        lineSpacing: 4,
    }).setOrigin(0.5).setResolution(2)
    balloon.add([balloonG, text])

    function paint(accent: number) {
        const w = Math.max(300, text.width + 72)
        const h = text.height + 50
        balloonG.clear()
        balloonG.fillStyle(C.ink, 0.25)
        balloonG.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 28)
        balloonG.fillStyle(C.ink, 1)
        balloonG.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
        balloonG.fillStyle(accent, 1)
        balloonG.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 24)
        balloonG.fillStyle(C.cream, 1)
        balloonG.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 18, 24)
    }

    return {
        update(dtMs: number) {
            if (edge <= 0) {
                if (edgeG.commandBuffer.length) edgeG.clear()
                return
            }
            edge = Math.max(0, edge - dtMs)
            const t = edge / 520
            edgeG.clear()
            for (let i = 0; i < 5; i++) {
                edgeG.lineStyle(10 + i * 16, edgeColor, 0.26 * t * (1 - i / 5))
                edgeG.strokeRoundedRect(6 + i * 6, 6 + i * 6, W - 12 - i * 12, H - 12 - i * 12, 40)
            }
        },

        flash(color: number) {
            edge = 520
            edgeColor = color
        },

        async say(value: string, accent = C.warn) {
            text.setText(value)
            paint(accent)
            FX.kill(scene, fx(balloon))
            await FX.to(scene, fx(balloon), { alpha: 1, scale: 1 },
                { duration: 210, ease: 'Back.easeOut' })
        },

        hush() {
            FX.kill(scene, fx(balloon))
            void FX.to(scene, fx(balloon), { alpha: 0, scale: 0.85 }, { duration: 170 })
        },

        destroy() {
            FX.kill(scene, fx(balloon))
            balloon.destroy()
            edgeG.destroy()
        },
    }
}
