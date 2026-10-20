import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { COMBO, DEPTH, JUDGE } from '../data/layout'
import { CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { Grade } from '../types'

export interface Judge {
    show(grade: Grade): void
    combo(count: number): void
    reset(): void
    destroy(): void
}

export function createJudge(scene: Phaser.Scene): Judge {
    const text = scene.add
        .text(JUDGE.x, JUDGE.y, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.judge}px`,
            color: CSS.white,
            stroke: CSS.pink,
            strokeThickness: 10,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setShadow(4, 5, CSS.cyan, 0, true, true)
        .setDepth(DEPTH.judge)
        .setAlpha(0)
    const label = scene.add
        .text(COMBO.x, COMBO.labelY, LABEL.combo, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.comboLabel}px`,
            color: CSS.pink,
            stroke: CSS.ink,
            strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.judge)
        .setVisible(false)
    const count = scene.add
        .text(COMBO.x, COMBO.numY, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.combo}px`,
            color: CSS.white,
            stroke: CSS.pink,
            strokeThickness: 10,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setShadow(4, 5, CSS.cyan, 0, true, true)
        .setDepth(DEPTH.judge)
        .setVisible(false)

    return {
        show(grade) {
            scene.tweens.killTweensOf(text)
            const perfect = grade === 'perfect'
            text.setText(perfect ? LABEL.perfect : LABEL.good)
                .setColor(perfect ? CSS.white : CSS.lemon)
                .setStroke(perfect ? CSS.pink : CSS.ink, 10)
                .setAlpha(1)
                .setScale(1.35)
            void FX.to(scene, text, { scale: 1 }, { duration: 140 })
            void FX.to(scene, text, { alpha: 0 }, { duration: 260, delay: 380 })
        },
        combo(n) {
            const on = n >= 2
            label.setVisible(on)
            count.setVisible(on)
            if (!on) return
            scene.tweens.killTweensOf(count)
            count.setText(String(n)).setScale(1.25)
            void FX.to(scene, count, { scale: 1 }, { duration: 160 })
        },
        reset() {
            scene.tweens.killTweensOf(text)
            text.setAlpha(0)
            label.setVisible(false)
            count.setVisible(false)
        },
        destroy() {
            scene.tweens.killTweensOf([text, count])
            text.destroy()
            label.destroy()
            count.destroy()
        },
    }
}
