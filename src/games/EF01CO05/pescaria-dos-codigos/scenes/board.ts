import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { BOARD_ART_W, PIECE_CELL, PIECES } from '../data/files'
import { BOARD, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { Mark } from '../types'
import { createMarkView, type MarkView } from './marks'

export interface Board {
    readonly rect: GuideRect
    readonly container: Phaser.GameObjects.Container
    show(clue: Mark): Promise<void>
    lift(): Promise<void>
    play(onBeat: () => void): Promise<void>
    compare(answer: Mark, ok: boolean, onBeat: () => void): Promise<void>
    reset(): void
    onTap(handler: () => void): void
    setEnabled(on: boolean): void
    readonly playing: boolean
    destroy(): void
}

const COMPARE_SCALE = 0.5
const COMPARE_LEFT = -76
const SIGN_X = 14
const ANSWER_X = 80
const ANSWER_SIZE = 60

function paintBoard(g: Phaser.GameObjects.Graphics) {
    const w = BOARD.w
    const h = BOARD.h
    g.lineStyle(4, C.ink, 0.8)
    g.lineBetween(-w * 0.3, -h / 2 + 6, -w * 0.18, BOARD.ropeTop - BOARD.y)
    g.lineBetween(w * 0.3, -h / 2 + 6, w * 0.18, BOARD.ropeTop - BOARD.y)
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 22)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
    g.lineStyle(5, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
    g.fillStyle(C.board, 1)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 14)
    g.fillStyle(C.boardDark, 1)
    g.fillRoundedRect(-w / 2 + 16, h / 2 - 30, w - 32, 14, { tl: 0, tr: 0, bl: 14, br: 14 })
    g.lineStyle(3, C.ink, 1)
    g.strokeRoundedRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 14)
}

function paintSign(g: Phaser.GameObjects.Graphics, ok: boolean) {
    const color = ok ? C.white : C.coral
    for (const [width, tone] of [[14, C.ink], [8, color]] as const) {
        g.lineStyle(width, tone, 1)
        g.lineBetween(-20, -10, 20, -10)
        g.lineBetween(-20, 10, 20, 10)
        if (!ok) g.lineBetween(-12, 26, 12, -26)
    }
}

export function createBoard(scene: Phaser.Scene): Board {
    const frame: Phaser.GameObjects.GameObject[] = []
    const ropes = scene.add.graphics()
    if (scene.textures.exists(PIECES)) {
        ropes.lineStyle(4, C.ink, 0.8)
        ropes.lineBetween(-BOARD.w * 0.3, -BOARD.h / 2 + 6, -BOARD.w * 0.18, BOARD.ropeTop - BOARD.y)
        ropes.lineBetween(BOARD.w * 0.3, -BOARD.h / 2 + 6, BOARD.w * 0.18, BOARD.ropeTop - BOARD.y)
        frame.push(ropes, scene.add.image(0, 0, PIECES, PIECE_CELL.board).setScale(BOARD.w / BOARD_ART_W))
    } else {
        paintBoard(ropes)
        frame.push(ropes)
    }

    const content = scene.add.container(0, 0)
    const container = scene.add.container(BOARD.x, BOARD.y, [...frame, content]).setDepth(DEPTH.board).setVisible(false)

    let clueView: MarkView | undefined
    let answerView: MarkView | undefined
    let sign: Phaser.GameObjects.Graphics | undefined
    let clue: Mark | undefined
    let playing = false
    let enabled = false
    let handler: (() => void) | undefined

    const zone = scene.add
        .zone(BOARD.x, BOARD.y, BOARD.w + BOARD.hit * 2, BOARD.h + BOARD.hit * 2)
        .setDepth(DEPTH.board + 5)
        .setInteractive({ useHandCursor: true })
    zone.input!.enabled = false
    zone.on('pointerdown', () => {
        if (!enabled) return
        void FX.to(scene, container, { scale: 1.05 }, { duration: 90, yoyo: true })
        handler?.()
    })

    const clearCompare = () => {
        answerView?.destroy()
        answerView = undefined
        sign?.destroy()
        sign = undefined
    }

    const reset = () => {
        clearCompare()
        if (!clueView) return
        FX.kill(scene, clueView.container)
        clueView.container.setPosition(0, 0).setScale(1)
    }

    const play = async (onBeat: () => void) => {
        if (!clueView || playing) return
        playing = true
        const view = clueView
        const count = view.parts.length
        for (let i = 0; i < count; i++) {
            if (!view.container.active) break
            onBeat()
            void view.beat(i)
            if (answerView) void answerView.beat(0)
            await FX.wait(scene, BOARD.beatMs)
        }
        playing = false
    }

    return {
        rect: { x: BOARD.x, y: BOARD.y, w: BOARD.w, h: BOARD.h },
        container,
        async show(next) {
            clearCompare()
            clueView?.destroy()
            clue = next
            clueView = createMarkView(scene, next, BOARD.drum, BOARD.drumGap)
            content.add(clueView.container)
            FX.kill(scene, container)
            container.setVisible(true).setAngle(0).setY(BOARD.dropFrom)
            await FX.to(scene, container, { y: BOARD.y }, { duration: 520, ease: 'Back.easeOut' })
            await FX.to(scene, container, { angle: 2 }, { duration: 160, yoyo: true, ease: 'Sine.easeInOut' })
        },
        async lift() {
            FX.kill(scene, container)
            await FX.to(scene, container, { y: BOARD.dropFrom }, { duration: 360, ease: 'Sine.easeIn' })
            container.setVisible(false)
        },
        play,
        async compare(answer, ok, onBeat) {
            if (!clueView || !clue) return
            clearCompare()
            await FX.to(scene, clueView.container, { x: COMPARE_LEFT, scale: COMPARE_SCALE }, { duration: 260 })
            sign = scene.add.graphics({ x: SIGN_X, y: 0 })
            paintSign(sign, ok)
            answerView = createMarkView(scene, answer, ANSWER_SIZE)
            answerView.container.setPosition(ANSWER_X, 0)
            content.add([sign, answerView.container])
            void FX.popIn(scene, sign)
            await FX.popIn(scene, answerView.container)
            await play(onBeat)
        },
        reset,
        onTap(next) {
            handler = next
        },
        setEnabled(on) {
            enabled = on
            if (zone.input) zone.input.enabled = on
        },
        get playing() {
            return playing
        },
        destroy() {
            FX.kill(scene, container)
            clearCompare()
            clueView?.destroy()
            zone.destroy()
            container.destroy()
        },
    }
}
