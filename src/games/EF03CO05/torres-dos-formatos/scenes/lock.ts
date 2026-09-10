import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, LANE, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { createWindow } from './window'
import type { Payload } from '../types'

/**
 * A trava. O cadeado abraça o arquivo e a faixa diz O QUE ele guarda — nunca
 * em qual caixa ele vai. Ao lado da frase, a estrutura real do dado é
 * desenhada: é o único momento do jogo em que ela aparece por inteiro, e é
 * justamente o momento em que a criança precisa dela.
 */
export function createLock(scene: Phaser.Scene) {
    const padlock = scene.add.graphics().setDepth(DEPTH.lock).setAlpha(0)
    padlock.lineStyle(11, C.ink, 1)
    padlock.beginPath()
    padlock.arc(0, -18, 18, Math.PI, 0)
    padlock.strokePath()
    padlock.fillStyle(C.ink, 1)
    padlock.fillRoundedRect(-29, -20, 58, 48, 11)
    padlock.fillStyle(C.warn, 1)
    padlock.fillRoundedRect(-24, -15, 48, 38, 9)
    padlock.fillStyle(C.ink, 1)
    padlock.fillCircle(0, 2, 7)

    const band = scene.add.container(W / 2, LANE.top + 62).setDepth(DEPTH.lock).setAlpha(0)
    const bandG = scene.add.graphics()
    const bandText = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.white,
            align: 'center',
            wordWrap: { width: 760 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    band.add([bandG, bandText])

    let card: Phaser.GameObjects.Container | null = null

    return {
        show(x: number, y: number) {
            padlock.setPosition(x, y).setAlpha(1).setScale(0.5)
            scene.tweens.killTweensOf(padlock)
            scene.tweens.add({ targets: padlock, scale: 1, duration: 280, ease: 'Back.easeOut' })
        },

        say(text: string, payload?: Payload) {
            card?.destroy(true)
            card = null

            bandText.setText(text)
            const cardW = payload ? 132 : 0
            const w = Math.min(920, bandText.width + 68 + cardW)
            const h = Math.max(bandText.height + 32, payload ? 84 : 0)

            if (payload) {
                card = createWindow(scene, payload, 120, 60)
                card.setPosition(-w / 2 + 74, 0)
                band.add(card)
                bandText.setX(38)
            } else {
                bandText.setX(0)
            }
            bandG.clear()
            bandG.fillStyle(C.ink, 0.3)
            bandG.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, h / 2)
            bandG.fillStyle(C.warnDark, 1)
            bandG.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            bandG.fillStyle(C.warn, 1)
            bandG.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, h / 2 - 5)

            scene.tweens.killTweensOf(band)
            band.setAlpha(1).setScale(0.9)
            scene.tweens.add({ targets: band, scale: 1, duration: 260, ease: 'Back.easeOut' })
        },

        hide() {
            scene.tweens.killTweensOf(padlock)
            scene.tweens.killTweensOf(band)
            card?.destroy(true)
            card = null
            void FX.to(scene, padlock, { alpha: 0, scale: 1.4 }, { duration: 240 })
            void FX.to(scene, band, { alpha: 0 }, { duration: 220 })
        },

        destroy() {
            scene.tweens.killTweensOf(padlock)
            scene.tweens.killTweensOf(band)
            padlock.destroy()
            band.destroy(true)
        },
    }
}

export type Lock = ReturnType<typeof createLock>
