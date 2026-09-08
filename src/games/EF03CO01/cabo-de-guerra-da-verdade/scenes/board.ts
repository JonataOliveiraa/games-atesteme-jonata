import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { BOARD, DEPTH, PLATE } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Statement, Token } from '../types'

export function createBoard(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.board)

    /* a placa do robô ------------------------------------------------- */
    const plate = scene.add.graphics()
    const plateText = scene.add.text(PLATE.cx, PLATE.cy, '', {
        fontFamily: FONT.black,
        fontSize: '30px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    plateText.setStroke(CSS.ink, 6)

    const paintPlate = (asked: boolean) => {
        const base = asked ? C.yes : C.no
        const dark = asked ? C.yesDark : C.noDark
        const x = PLATE.cx - PLATE.w / 2
        const y = PLATE.cy - PLATE.h / 2
        plate.clear()
        plate.fillStyle(C.ink, 0.28)
        plate.fillRoundedRect(x, y + 7, PLATE.w, PLATE.h, 22)
        plate.fillStyle(C.ink, 1)
        plate.fillRoundedRect(x, y, PLATE.w, PLATE.h, 22)
        plate.fillStyle(dark, 1)
        plate.fillRoundedRect(x + 5, y + 5, PLATE.w - 10, PLATE.h - 10, 18)
        plate.fillStyle(base, 1)
        plate.fillRoundedRect(x + 5, y + 5, PLATE.w - 10, PLATE.h - 18, 18)
    }

    /* o cartão da frase ------------------------------------------------ */
    const card = scene.add.graphics()
    const cx = BOARD.cx - BOARD.w / 2
    const cy = BOARD.cy - BOARD.h / 2
    card.fillStyle(C.ink, 0.26)
    card.fillRoundedRect(cx, cy + 8, BOARD.w, BOARD.h, 26)
    card.fillStyle(C.ink, 1)
    card.fillRoundedRect(cx, cy, BOARD.w, BOARD.h, 26)
    card.fillStyle(C.creamDeep, 1)
    card.fillRoundedRect(cx + 6, cy + 6, BOARD.w - 12, BOARD.h - 12, 21)
    card.fillStyle(C.cream, 1)
    card.fillRoundedRect(cx + 6, cy + 6, BOARD.w - 12, BOARD.h - 22, 21)

    const style = {
        fontFamily: FONT.black,
        fontSize: `${BOARD.fontSize}px`,
        color: CSS.ink,
    }

    const before = scene.add.text(0, BOARD.cy, '', style).setOrigin(1, 0.5).setResolution(2)
    const after = scene.add.text(0, BOARD.cy, '', style).setOrigin(0, 0.5).setResolution(2)

    const hole = scene.add.graphics()
    const filled = scene.add.text(0, BOARD.cy, '', {
        ...style,
        color: CSS.deny,
    }).setOrigin(0.5).setResolution(2)

    const strike = scene.add.graphics().setAlpha(0)

    root.add([plate, plateText, card, hole, before, after, filled, strike])

    let holeX = BOARD.cx
    let left = 0
    let right = 0

    const paintHole = (empty: boolean) => {
        const w = BOARD.holeW
        const h = BOARD.holeH
        hole.clear()
        if (!empty) return
        hole.fillStyle(C.ink, 0.1)
        hole.fillRoundedRect(holeX - w / 2, BOARD.cy - h / 2, w, h, 16)
        hole.lineStyle(5, C.deny, 0.9)
        hole.strokeRoundedRect(holeX - w / 2, BOARD.cy - h / 2, w, h, 16)
    }

    let pulse: Phaser.Tweens.Tween | null = null

    return {
        get container() {
            return root
        },

        show(target: Statement) {
            paintPlate(target.asked)
            plateText.setText(target.asked ? 'VERDADEIRO' : 'FALSO')

            before.setText(target.before)
            after.setText(target.after)
            filled.setText('').setAlpha(0)
            strike.clear().setAlpha(0)

            const total = before.width + BOARD.gap + BOARD.holeW + BOARD.gap + after.width
            left = BOARD.cx - total / 2
            right = left + total
            holeX = left + before.width + BOARD.gap + BOARD.holeW / 2

            before.setX(left + before.width)
            after.setX(holeX + BOARD.holeW / 2 + BOARD.gap)
            filled.setX(holeX)
            paintHole(true)

            hole.setAlpha(1)
            pulse?.stop()
            pulse = scene.tweens.add({
                targets: hole,
                alpha: 0.45,
                duration: FX.ms(scene, 700),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })

            root.setAlpha(0)
            return FX.to(scene, root, { alpha: 1 }, { duration: 240 })
        },

        async fill(label: string, token: Token, ok: boolean) {
            pulse?.stop()
            pulse = null
            hole.setAlpha(1)
            paintHole(false)

            filled.setText(label).setAlpha(1).setScale(0.5)
            filled.setColor(token === 'negated' ? CSS.deny : CSS.ink)
            await FX.to(scene, filled, { scale: 1 }, { duration: 220, ease: Ease.back(2.4) })

            if (ok) return

            strike.clear()
            strike.lineStyle(7, C.no, 1)
            strike.lineBetween(left - 10, BOARD.cy, right + 10, BOARD.cy)
            strike.setAlpha(0)
            await FX.to(scene, strike, { alpha: 1 }, { duration: 200 })
        },

        holePoint() {
            return { x: holeX, y: BOARD.cy }
        },

        destroy() {
            pulse?.stop()
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(hole)
            root.destroy(true)
        },
    }
}

export type Board = ReturnType<typeof createBoard>

export const tokenLabel = (labels: Record<Token, string>, token: Token) => labels[token]
