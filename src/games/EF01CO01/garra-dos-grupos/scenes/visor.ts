import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG } from '../data/files'
import { DEPTH, VISOR } from '../data/layout'
import { C, CSS, FONT, SIZE, ruleWord } from '../data/theme'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import type { Rule } from '../types'
import { CROSS, LIT, LIT_FROM, createRuleIcon, paintCross } from './icons'

export interface Visor {
    readonly container: Phaser.GameObjects.Container
    readonly rect: GuideRect
    readonly drop: Phaser.GameObjects.Container
    explain(): Promise<boolean>
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

    const moving = () => {
        const icon = drop.list[0]
        const cross = icon instanceof Phaser.GameObjects.Container ? icon.getByName(CROSS) : null
        const lit = icon instanceof Phaser.GameObjects.Container ? icon.getByName(LIT) : null
        return {
            crossed: cross instanceof Phaser.GameObjects.Graphics ? cross : null,
            sized: lit instanceof Phaser.GameObjects.Container ? lit : null,
        }
    }

    const rewind = () => {
        const { crossed, sized } = moving()
        if (crossed) paintCross(crossed, VISOR.dropR, 0)
        sized?.setScale(sized.getData(LIT_FROM) as number)
    }

    const play = async () => {
        const { crossed, sized } = moving()
        if (!crossed && !sized) return false
        if (sized) {
            await FX.wait(scene, 200)
            await FX.to(scene, sized, { scale: 1 }, { duration: 650, ease: 'Back.easeOut' })
        }
        if (crossed) {
            const state = { p: 0 }
            await FX.wait(scene, 250)
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: state,
                    p: 1,
                    duration: 700,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => paintCross(crossed, VISOR.dropR, state.p),
                    onComplete: () => resolve(),
                }),
            )
        }
        return true
    }

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
            rewind()
            drop.setScale(0.4)
            await FX.all(
                FX.to(scene, drop, { alpha: 1, scale: 1 }, { duration: 320, ease: 'Back.easeOut' }),
                FX.to(scene, word, { alpha: 1 }, { duration: 260, delay: 80 }),
            )
            await play()
        },
        explain() {
            rewind()
            return play()
        },
        destroy() {
            container.destroy()
        },
    }
}
