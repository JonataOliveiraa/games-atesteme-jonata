import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BAR, CONFIRM, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { createPillButton } from './button'

export function createPrompt(scene: Phaser.Scene, onConfirm: () => void) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.panel)
    const cy = BAR.y + BAR.h / 2 - 4

    const board = scene.add.graphics()
    board.fillStyle(C.ink, 0.3)
    board.fillRoundedRect(BAR.x, BAR.y + 9, BAR.w, BAR.h, BAR.r)
    board.fillStyle(C.woodDark, 1)
    board.fillRoundedRect(BAR.x, BAR.y, BAR.w, BAR.h, BAR.r)
    board.fillStyle(C.cream, 1)
    board.fillRoundedRect(BAR.x + 7, BAR.y + 7, BAR.w - 14, BAR.h - 20, BAR.r - 7)
    board.fillStyle(C.white, 0.7)
    board.fillRoundedRect(BAR.x + 28, BAR.y + 15, BAR.w - 56, 14, 7)
    root.add(board)

    const pip = scene.add.graphics()
    pip.fillStyle(C.ink, 1)
    pip.fillCircle(BAR.pipX, cy, 34)
    pip.fillStyle(C.tealDark, 1)
    pip.fillCircle(BAR.pipX, cy, 29)
    pip.fillStyle(C.teal, 1)
    pip.fillCircle(BAR.pipX, cy - 2, 27)
    root.add(pip)

    const pipText = scene.add.text(BAR.pipX, cy - 2, '1', {
        fontFamily: FONT.black,
        fontSize: '32px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    pipText.setStroke(CSS.ink, 6)
    root.add(pipText)

    const hint = scene.add.text(BAR.textX, cy, '', {
        fontFamily: FONT.black,
        fontSize: '32px',
        color: CSS.ink,
    }).setOrigin(0, 0.5).setResolution(2)
    root.add(hint)

    const button = createPillButton(scene, {
        x: CONFIRM.x,
        y: CONFIRM.y,
        w: CONFIRM.w,
        h: CONFIRM.h,
        label: 'CONFIRMAR',
        depth: DEPTH.panel + 2,
        onTap: onConfirm,
    })

    return {
        set(index: number, text: string) {
            pipText.setText(String(index))
            hint.setText(text)
            FX.popIn(scene, pipText, { from: 0.4, duration: 320 })
            FX.popIn(scene, hint, { from: 0.86, duration: 320 })
        },

        setReady(on: boolean) {
            button.setEnabled(on)
        },

        dismiss(ms = 280) {
            button.setEnabled(false)
            scene.tweens.add({ targets: [root, button.root], alpha: 0, duration: FX.ms(scene, ms) })
        },

        destroy() {
            button.destroy()
            scene.tweens.killTweensOf(root)
            root.destroy()
        },
    }
}
