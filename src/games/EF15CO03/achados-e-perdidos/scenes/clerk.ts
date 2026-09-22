import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { A, C, CSS, FONT, SIZE } from '../data/theme'
import { CLERK as POS, DEPTH } from '../data/layout'
import { CLERK, CLERK_SHEET } from '../data/critters'
import { drawSpeech } from './art'

export type Mood = keyof typeof CLERK

export interface Clerk {
    setMood(mood: Mood): void
    /**
     * A única voz do jogo. Uma linha, e ela some sozinha — o balão não pede
     * toque, porque ele nunca segura a criança: o que ela precisa fazer já
     * está desenhado na mesa.
     */
    say(text: string, mood?: Mood): Promise<void>
    enter(): Promise<void>
    destroy(): void
}

export function createClerk(scene: Phaser.Scene): Clerk {
    const hasArt = scene.textures.exists(CLERK_SHEET.key)

    const shadow = scene.add.graphics().setDepth(DEPTH.stand - 1)
    if (hasArt) {
        const w = CLERK_SHEET.frameWidth * POS.scale * 0.42
        shadow.fillStyle(C.shadow, A.shadow)
        shadow.fillEllipse(POS.cx, POS.baseY - 2, w, w * 0.2)
    }

    const sprite = hasArt
        ? scene.add
            .sprite(POS.cx, POS.baseY + CLERK_SHEET.footPad * POS.scale, CLERK_SHEET.key, CLERK.calm)
            .setOrigin(0.5, 1)
            .setScale(POS.scale)
            .setDepth(DEPTH.stand - 1)
        : null

    const bubbleArt = scene.add.graphics()
    const bubbleText = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.hint}px`,
            color: CSS.ink,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    const bubble = scene.add
        .container(250, 490, [bubbleArt, bubbleText])
        .setDepth(DEPTH.hint)
        .setAlpha(0)

    return {
        setMood(mood) {
            sprite?.setFrame(CLERK[mood])
        },

        async say(text, mood = 'calm') {
            sprite?.setFrame(CLERK[mood])
            bubbleText.setText(text)

            const w = Math.max(260, bubbleText.width + 60)
            const h = bubbleText.height + 34
            bubbleArt.clear()
            drawSpeech(bubbleArt, w, h)

            bubble.setAlpha(0).setScale(0.82)
            await FX.to(scene, bubble, { alpha: 1, scale: 1 }, { duration: 200, ease: 'Back.easeOut' })
            await FX.wait(scene, 1250)
            await FX.to(scene, bubble, { alpha: 0 }, { duration: 200 })
            sprite?.setFrame(CLERK.calm)
        },

        async enter() {
            if (!sprite) return
            sprite.setAlpha(0)
            await FX.to(scene, sprite, { alpha: 1 }, { duration: 320 })
        },

        destroy() {
            FX.kill(scene, bubble)
            bubble.destroy()
            sprite?.destroy()
            shadow.destroy()
        },
    }
}
