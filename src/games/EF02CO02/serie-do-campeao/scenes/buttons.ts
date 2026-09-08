import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BTN, DEPTH } from '../data/layout'
import { C, CSS, FONT, MOVE_COLOR, MOVE_LABEL } from '../data/theme'
import type { Move } from '../types'
import { createIcon, moveIcon } from './icons'

export interface MoveButtonOptions {
    move: Move
    x: number
    onTap: (move: Move) => void
}

export function createMoveButton(scene: Phaser.Scene, options: MoveButtonOptions) {
    const { move, x, onTap } = options
    const tone = MOVE_COLOR[move]
    const half = { w: BTN.w / 2, h: BTN.h / 2 }

    const root = scene.add.container(x, BTN.cy).setDepth(DEPTH.button)

    const shell = scene.add.graphics()
    const paint = (down: boolean) => {
        const drop = down ? 4 : 0
        shell.clear()
        shell.fillStyle(C.ink, 0.3)
        shell.fillRoundedRect(-half.w, -half.h + 16, BTN.w, BTN.h, BTN.r)
        shell.fillStyle(C.ink, 1)
        shell.fillRoundedRect(-half.w, -half.h, BTN.w, BTN.h, BTN.r)
        shell.fillStyle(tone.dark, 1)
        shell.fillRoundedRect(-half.w + 6, -half.h + 6, BTN.w - 12, BTN.h - 12, BTN.r - 6)
        shell.fillStyle(tone.base, 1)
        shell.fillRoundedRect(-half.w + 6, -half.h + 6 + drop, BTN.w - 12, BTN.h - 24, BTN.r - 6)
        shell.fillStyle(C.white, 0.28)
        shell.fillRoundedRect(-half.w + 28, -half.h + 16 + drop, BTN.w - 56, 22, 11)
    }
    paint(false)

    const icon = createIcon(scene, moveIcon(move), BTN.icon)
    icon.setPosition(BTN.iconX, -2)

    const label = scene.add.text(BTN.labelX, -2, MOVE_LABEL[move], {
        fontFamily: FONT.black,
        fontSize: '54px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    label.setStroke(CSS.ink, 8)

    root.add([shell, icon, label])

    const zone = scene.add.zone(x, BTN.cy, BTN.w, BTN.h)
        .setOrigin(0.5)
        .setDepth(DEPTH.button + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    let hint: Phaser.Tweens.Tween | null = null

    zone.on('pointerdown', () => {
        if (!enabled) return
        paint(true)
        onTap(move)
    })
    zone.on('pointerup', () => paint(false))
    zone.on('pointerout', () => paint(false))

    const stopHint = () => {
        hint?.stop()
        hint = null
        root.setScale(enabled ? 1 : 0.9)
    }

    return {
        get root() {
            return root
        },

        setEnabled(on: boolean) {
            enabled = on
            zone.input!.enabled = on
            stopHint()
            paint(false)
            scene.tweens.add({
                targets: root,
                alpha: on ? 1 : 0.38,
                scale: on ? 1 : 0.9,
                duration: FX.ms(scene, 260),
                ease: 'Quad.easeOut',
            })
        },

        setHint(on: boolean) {
            if (!on || !enabled) {
                stopHint()
                return
            }
            if (hint) return
            hint = scene.tweens.add({
                targets: root,
                scale: 1.06,
                duration: FX.ms(scene, 460),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        press() {
            paint(true)
            scene.time.delayedCall(FX.ms(scene, 120), () => paint(false))
            return FX.press(scene, root, 0.94)
        },

        destroy() {
            stopHint()
            scene.tweens.killTweensOf(root)
            zone.destroy()
            root.destroy(true)
        },
    }
}

export type MoveButton = ReturnType<typeof createMoveButton>
