import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI, UI_SHEET } from '../data/files'
import { DEPTH, SIGN, UI_ART } from '../data/layout'
import { CSS, FONT, SIZE } from '../data/theme'
import { FIELD, RULE } from '../data/words'
import type { Phase } from '../types'
import { fade, fit, pin, shadowOf } from './art'
import type { Audio } from './audio'
import { createPill, type Rect } from './board'

const GAP = 16
const PILL_W = 130
const PILL_H = 50

export interface Sign {
    set(rule: Phase['rule']): void
    /** N2: a placa balança e a pílula gira para o outro campo */
    flip(rule: Phase['rule']): Promise<void>
    pill(): { x: number; y: number }
    glow(on: boolean): void
    bump(): Promise<void>
    rect(): Rect
    /** some enquanto a criança arrasta o pátio */
    setShown(on: boolean): void
    destroy(): void
}

/** a placa da regra: "Separe pelo [PARA]" */
export function createSign(scene: Phaser.Scene, audio?: Pick<Audio, 'flip'>): Sign {
    const board = fit(scene, UI_SHEET, UI.sign, SIGN.w)
    const hang = SIGN.h / 2
    board.setY(hang - (UI_ART.signPlankY - 0.5) * board.displayHeight)
    const text = scene.add
        .text(0, hang + 4, RULE, { fontFamily: FONT.black, fontSize: `${SIZE.rule}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const pill = createPill(scene, FIELD.to, PILL_W, PILL_H)
    const swing = scene.add.container(0, -hang, [shadowOf(scene, board), board, text, pill.container])
    const box = pin(scene.add.container(SIGN.x, SIGN.y, [swing]).setDepth(DEPTH.sign))
    const total = text.width + GAP + PILL_W
    text.setX(-total / 2)
    pill.container.setPosition(-total / 2 + text.width + GAP + PILL_W / 2, hang + 4)

    return {
        set(rule) {
            pill.setText(FIELD[rule])
        },
        async flip(rule) {
            scene.tweens.killTweensOf([swing, pill.container])
            swing.setAngle(0)
            pill.container.setScale(1)
            audio?.flip()
            await FX.all(
                FX.to(scene, swing, { angle: 5 }, { duration: 140, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' }).then(() =>
                    FX.to(scene, swing, { angle: -2 }, { duration: 120, yoyo: true, ease: 'Sine.easeInOut' }),
                ),
                FX.to(scene, pill.container, { scaleX: 0 }, { duration: 180, ease: 'Sine.easeIn' }).then(() => {
                    pill.setText(FIELD[rule])
                    return FX.to(scene, pill.container, { scaleX: 1 }, { duration: 240, ease: 'Back.easeOut' })
                }),
            )
            swing.setAngle(0)
        },
        pill() {
            return { x: SIGN.x + pill.container.x, y: SIGN.y + swing.y + pill.container.y }
        },
        glow(on) {
            pill.glow(on)
        },
        async bump() {
            await FX.to(scene, pill.container, { scale: 1.2 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' })
        },
        rect() {
            return { x: SIGN.x, y: SIGN.y, w: SIGN.w + 20, h: SIGN.h + 16 }
        },
        setShown(on) {
            fade(scene, box, on ? 1 : 0)
        },
        destroy() {
            scene.tweens.killTweensOf([swing, pill.container, box])
            box.destroy()
        },
    }
}
