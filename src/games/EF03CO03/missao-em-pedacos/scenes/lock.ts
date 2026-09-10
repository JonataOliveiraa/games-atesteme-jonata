import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const padlock = (g: Phaser.GameObjects.Graphics, x: number, y: number, scale = 1) => {
    const w = 46 * scale
    const h = 40 * scale
    g.lineStyle(9 * scale, C.warnDark, 1)
    g.beginPath()
    g.arc(x, y - h * 0.44, w * 0.32, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 0.25)
    g.fillRoundedRect(x - w / 2 + 3, y - h * 0.2 + 5, w, h, 10)
    g.fillStyle(C.warn, 1)
    g.fillRoundedRect(x - w / 2, y - h * 0.2, w, h, 10)
    g.lineStyle(4 * scale, C.warnDark, 1)
    g.strokeRoundedRect(x - w / 2, y - h * 0.2, w, h, 10)
    g.fillStyle(C.ink, 1)
    g.fillCircle(x, y + h * 0.04, 5 * scale)
}

/** A TRAVA: o mundo para, o item ganha cadeado e a frase diz por quê. */
export function createLock(scene: Phaser.Scene) {
    const veil = scene.add
        .rectangle(W / 2, H / 2, W, H, C.ink, 0.44)
        .setDepth(DEPTH.lock)
        .setScrollFactor(0)
        .setVisible(false)

    const art = scene.add.graphics().setDepth(DEPTH.lock + 2).setScrollFactor(0).setVisible(false)

    const plaque = scene.add
        .container(640, 250)
        .setDepth(DEPTH.lock + 3)
        .setScrollFactor(0)
        .setVisible(false)
    const plaqueBg = scene.add.graphics()
    const plaqueText = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: 680 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    plaque.add([plaqueBg, plaqueText])

    const paintPlaque = () => {
        const w = 740
        const h = 92
        plaqueBg.clear()
        plaqueBg.fillStyle(C.ink, 1)
        plaqueBg.fillRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 26)
        plaqueBg.fillStyle(C.card, 1)
        plaqueBg.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        plaqueBg.fillStyle(C.warn, 1)
        plaqueBg.fillRoundedRect(-w / 2, -h / 2, w, 14, 7)
    }
    paintPlaque()

    let blink: Phaser.Tweens.Tween | null = null

    const stop = () => {
        blink?.remove()
        blink = null
    }

    return {
        /** `at` já vem em coordenadas de TELA. */
        show(at: { x: number; y: number }, line: string) {
            stop()
            art.clear()
            padlock(art, at.x, at.y, 1.2)
            art.setVisible(true).setAlpha(1)
            veil.setVisible(true).setAlpha(0)
            plaqueText.setText(line)
            plaque.setVisible(true)

            void FX.to(scene, veil, { alpha: 1 }, { duration: 180 })
            void FX.popIn(scene, plaque, { from: 0.78 })
            blink = scene.tweens.add({
                targets: art,
                alpha: 0.45,
                duration: FX.ms(scene, 420),
                yoyo: true,
                repeat: -1,
            })
        },

        hide() {
            stop()
            art.clear()
            art.setVisible(false)
            veil.setVisible(false)
            plaque.setVisible(false)
        },

        destroy() {
            stop()
            scene.tweens.killTweensOf(plaque)
            scene.tweens.killTweensOf(veil)
            art.destroy()
            veil.destroy()
            plaque.destroy(true)
        },
    }
}

export type Lock = ReturnType<typeof createLock>
