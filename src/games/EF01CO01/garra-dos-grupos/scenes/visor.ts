import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG } from '../data/files'
import { DEPTH, VISOR } from '../data/layout'
import { C, CSS, FONT, SIZE, ruleWord } from '../data/theme'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import type { Rule } from '../types'
import { CROSS, createRuleIcon, paintCross } from './icons'

export interface Visor {
    readonly container: Phaser.GameObjects.Container
    readonly rect: GuideRect
    readonly drop: Phaser.GameObjects.Container
    drawNot(): Promise<void>
    show(rule: Rule): Promise<void>
    destroy(): void
}

export function createVisor(scene: Phaser.Scene): Visor {
    const frame = scene.add.graphics()
    const onArt = scene.textures.exists(BG)
    const paintFrame = (rim: number) => {
        frame.clear()
        if (onArt) return
        frame.fillStyle(C.shadow, 0.25)
        frame.fillRoundedRect(-VISOR.w / 2 + 3, -VISOR.h / 2 + 6, VISOR.w, VISOR.h, 22)
        frame.fillStyle(rim, 1)
        frame.fillRoundedRect(-VISOR.w / 2, -VISOR.h / 2, VISOR.w, VISOR.h, 22)
        frame.fillStyle(C.visor, 1)
        frame.fillRoundedRect(-VISOR.w / 2 + 8, -VISOR.h / 2 + 8, VISOR.w - 16, VISOR.h - 16, 16)
        frame.fillStyle(C.white, 0.08)
        frame.fillRoundedRect(-VISOR.w / 2 + 16, -VISOR.h / 2 + 12, VISOR.w - 32, 14, 7)
    }
    paintFrame(C.visorRim)

    const drop = scene.add.container(VISOR.dropX - VISOR.cx, 6)
    const word = scene.add
        .text(VISOR.wordX - VISOR.cx, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.visor}px`,
            color: CSS.visorText,
        })
        .setOrigin(0.5)
        .setResolution(2)

    const container = scene.add.container(VISOR.cx, VISOR.cy, [frame, drop, word]).setDepth(DEPTH.visor)

    return {
        container,
        rect: { x: VISOR.cx, y: VISOR.cy, w: VISOR.w, h: VISOR.h },
        drop,
        async show(rule) {
            await FX.to(scene, [drop, word], { alpha: 0 }, { duration: 140 })
            drop.removeAll(true)
            drop.add(createRuleIcon(scene, rule, VISOR.dropR))
            word.setText(ruleWord(rule))
            word.setScale(Math.min(1, VISOR.wordRoom / Math.max(1, word.width)))
            drop.setScale(0.4)
            await FX.all(
                FX.to(scene, drop, { alpha: 1, scale: 1 }, { duration: 320, ease: 'Back.easeOut' }),
                FX.to(scene, word, { alpha: 1 }, { duration: 260, delay: 80 }),
            )
        },
        async drawNot() {
            const icon = drop.list[0]
            const cross = icon instanceof Phaser.GameObjects.Container ? icon.getByName(CROSS) : null
            if (!(cross instanceof Phaser.GameObjects.Graphics)) return
            const state = { p: 0 }
            paintCross(cross, VISOR.dropR, 0)
            await FX.wait(scene, 250)
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: state,
                    p: 1,
                    duration: 700,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => paintCross(cross, VISOR.dropR, state.p),
                    onComplete: () => resolve(),
                }),
            )
        },
        destroy() {
            container.destroy()
        },
    }
}
