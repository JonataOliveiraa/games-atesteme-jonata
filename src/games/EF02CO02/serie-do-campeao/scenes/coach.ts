import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { COACH, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { Move } from '../types'
import { createIcon, moveIcon, type Icon } from './icons'

export const COACH_SHEET = 'treinadora'
export const COACH_COLUMNS = 3

export type CoachPose = 'idle' | 'call' | 'cheer'

const FRAME: Record<CoachPose, number> = { idle: 0, call: 1, cheer: 2 }

/** Só entra em cena se a folha não tiver carregado: um boneco de traço. */
function drawFallback(g: Phaser.GameObjects.Graphics, h: number) {
    const bodyW = 0.32 * h
    const bodyTop = -0.66 * h
    const bodyH = 0.34 * h
    const headR = 0.13 * h

    g.fillStyle(C.inkSoft, 1)
    g.fillRoundedRect(-0.13 * h, -0.34 * h, 0.11 * h, 0.34 * h, 0.05 * h)
    g.fillRoundedRect(0.02 * h, -0.34 * h, 0.11 * h, 0.34 * h, 0.05 * h)
    g.fillStyle(C.shoes, 1)
    g.fillEllipse(-0.075 * h, -0.01 * h, 0.15 * h, 0.07 * h)
    g.fillEllipse(0.075 * h, -0.01 * h, 0.15 * h, 0.07 * h)

    g.fillStyle(C.skin, 1)
    g.fillRoundedRect(0.1 * h, -0.86 * h, 0.075 * h, 0.28 * h, 0.04 * h)
    g.fillRoundedRect(-0.19 * h, -0.6 * h, 0.075 * h, 0.24 * h, 0.04 * h)

    g.fillStyle(C.teal, 1)
    g.fillRoundedRect(-bodyW / 2, bodyTop, bodyW, bodyH, 0.07 * h)

    g.fillStyle(C.skin, 1)
    g.fillCircle(0, -0.79 * h, headR)
    g.fillStyle(C.hair, 1)
    g.fillEllipse(0, -0.86 * h, headR * 2.1, headR * 1.1)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-headR * 0.34, -0.78 * h, headR * 0.15)
    g.fillCircle(headR * 0.34, -0.78 * h, headR * 0.15)
}

export function createCoach(scene: Phaser.Scene) {
    const h = COACH.h
    const root = scene.add.container(COACH.x, COACH.feetY).setDepth(DEPTH.coach)

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, 0.22)
    shadow.fillEllipse(0, 6, h * 0.44, h * 0.1)

    const body = scene.add.container(0, 0)

    const sheetOk =
        scene.textures.exists(COACH_SHEET) && scene.textures.get(COACH_SHEET).has('0')

    let sprite: Phaser.GameObjects.Sprite | null = null

    if (sheetOk) {
        const source = scene.textures.get(COACH_SHEET).get(0)
        const ratio = source.width / source.height
        sprite = scene.add.sprite(0, 0, COACH_SHEET, 0)
            .setOrigin(0.5, 1)
            .setDisplaySize(h * ratio, h)
        body.add(sprite)
    } else {
        const art = scene.add.graphics()
        drawFallback(art, h)
        body.add(art)
    }

    /* ── a plaquinha: é ela que diz QUAL movimento é a vez ─────────────── */
    const s = COACH.sign
    const sign = scene.add.container(COACH.signDX, COACH.signDY)

    const board = scene.add.graphics()
    board.fillStyle(C.ink, 0.24)
    board.fillRoundedRect(-s / 2 - 7, -s / 2 - 1, s + 14, s + 14, 20)
    board.fillStyle(C.ink, 1)
    board.fillRoundedRect(-s / 2 - 7, -s / 2 - 7, s + 14, s + 14, 20)
    board.fillStyle(C.cream, 1)
    board.fillRoundedRect(-s / 2, -s / 2, s, s, 14)
    board.fillStyle(C.white, 0.7)
    board.fillRoundedRect(-s / 2 + 10, -s / 2 + 7, s - 20, 10, 5)
    board.fillStyle(C.ink, 1)
    board.fillTriangle(-s * 0.34, s / 2 + 5, -s * 0.06, s / 2 + 5, -s * 0.3, s / 2 + 26)
    sign.add(board)

    let mark: Icon | null = null

    sign.setVisible(false)
    root.add([shadow, body, sign])

    const setPose = (pose: CoachPose) => {
        if (!sprite) return
        const w = sprite.displayWidth
        const height = sprite.displayHeight
        sprite.setFrame(FRAME[pose])
        sprite.setDisplaySize(w, height)
    }

    return {
        get container() {
            return root
        },

        setPose,

        setMove(move: Move) {
            mark?.destroy()
            mark = createIcon(scene, moveIcon(move), s * 0.76)
            sign.add(mark)
            sign.setVisible(true)
            setPose('call')
        },

        clearMove() {
            mark?.destroy()
            mark = null
            sign.setVisible(false)
            setPose('idle')
        },

        async cheer() {
            setPose('cheer')
            await FX.to(scene, body, { y: -18 }, { duration: 190, yoyo: true })
            body.setY(0)
        },

        raise() {
            return FX.to(scene, sign, { y: COACH.signDY - 14, angle: -6 },
                { duration: 220, yoyo: true })
        },

        destroy() {
            scene.tweens.killTweensOf(sign)
            scene.tweens.killTweensOf(body)
            root.destroy(true)
        },
    }
}
