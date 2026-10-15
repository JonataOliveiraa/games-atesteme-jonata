import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PRINT_OF, PRINT_SHEET, UI, UI_SHEET } from '../data/files'
import { ASK as BOARD, DEPTH, STAMPS, TAGS } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { ASK, TAG } from '../data/words'
import type { Fig, Question } from '../types'
import { fit, sliced } from './art'
import type { Rect } from './guide'

export interface Answers {
    /** a pergunta entra num papel por cima da esteira e as 3 etiquetas sobem */
    ask(question: Question): Promise<void>
    onPick(fn: (index: number) => void): void
    setEnabled(on: boolean): void
    /** o anel da demonstração */
    ring(index: number): Promise<void>
    press(index: number): void
    /** acende a escolhida (certa) ou faz ela tremer (errada) */
    mark(index: number, ok: boolean): Promise<void>
    /** o papel da pergunta sai para o varal aparecer; as etiquetas ficam */
    fold(): Promise<void>
    hide(): Promise<void>
    rect(): Rect
    boardRect(): Rect
    destroy(): void
}

const SLOP = 24

export function createAnswers(scene: Phaser.Scene): Answers {
    const board = scene.add.container(BOARD.x, BOARD.y).setDepth(DEPTH.ask).setVisible(false)
    const paper = sliced(scene, UI_SHEET, UI.paper, BOARD.w, BOARD.h, 22)
    board.add(paper.piece)
    let boardParts: Phaser.GameObjects.GameObject[] = []

    let tags: Phaser.GameObjects.Container[] = []
    let enabled = false
    let picked: ((index: number) => void) | undefined
    let downOn = -1

    const zones = STAMPS.xs.map((x, i) => {
        const zone = scene.add
            .zone(x, TAGS.y, TAGS.size + 10, TAGS.size + 10)
            .setDepth(DEPTH.stamps + 2)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            downOn = i
        })
        zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const was = downOn
            downOn = -1
            if (!enabled || was !== i || pointer.getDistance() > SLOP) return
            picked?.(i)
        })
        zone.on('pointerout', () => {
            downOn = -1
        })
        if (zone.input) zone.input.enabled = false
        return zone
    })

    const icon = (fig: Fig, size: number, x: number, y: number) => fit(scene, PRINT_SHEET, PRINT_OF[fig], size).setPosition(x, y)
    const word = (text: string, size: number, y: number) =>
        scene.add.text(0, y, text, { fontFamily: FONT.black, fontSize: `${size}px`, color: CSS.ink }).setOrigin(0.5).setResolution(2)

    const tagContent = (q: Question, i: number): Phaser.GameObjects.GameObject[] => {
        if (q.kind === 'count') return [word(`${q.options[i]}`, SIZE.tagNumber, 4)]
        if (i < 2) return [icon(i ? q.b : q.a, 88, 0, -20), word(TAG.more, SIZE.tagWord, 52)]
        return [icon(q.a, 52, -30, -30), icon(q.b, 52, 30, -30), word(TAG.same, SIZE.tagWord + 4, 34)]
    }

    const clearTags = () => {
        tags.forEach(t => t.destroy())
        tags = []
    }

    return {
        async ask(q) {
            boardParts.forEach(p => p.destroy())
            const text = scene.add
                .text(0, 0, ASK(q), {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.ask}px`,
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: BOARD.w - (q.kind === 'count' ? 170 : 60) },
                })
                .setOrigin(0.5)
                .setResolution(2)
            boardParts = [text]
            if (q.kind === 'count') {
                const mark = icon(q.fig, BOARD.icon, -BOARD.w / 2 + 66, 0)
                text.setX(42)
                boardParts.push(mark)
            }
            board.add(boardParts)
            board.setVisible(true).setAlpha(0).setY(BOARD.y + 30)
            const enter = FX.to(scene, board, { alpha: 1, y: BOARD.y }, { duration: 320, ease: 'Back.easeOut' })

            clearTags()
            tags = STAMPS.xs.map((x, i) => {
                const patch = fit(scene, UI_SHEET, UI.tag, TAGS.size)
                const tag = scene.add.container(x, TAGS.y, [patch, ...tagContent(q, i)]).setDepth(DEPTH.stamps)
                tag.setScale(0)
                return tag
            })
            await FX.all(enter, ...tags.map((t, i) => FX.to(scene, t, { scale: 1 }, { duration: 320, delay: 120 + i * 90, ease: 'Back.easeOut' })))
        },
        onPick(fn) {
            picked = fn
        },
        setEnabled(on) {
            enabled = on
            if (!on) downOn = -1
            zones.forEach(z => {
                if (z.input) z.input.enabled = on
            })
        },
        async ring(i) {
            void FX.ping(scene, STAMPS.xs[i], TAGS.y, C.glow, { radius: 110, duration: 560, depth: DEPTH.fx })
            await FX.wait(scene, 420)
        },
        press(i) {
            const t = tags[i]
            if (t) void FX.press(scene, t, 0.9)
        },
        async mark(i, ok) {
            const t = tags[i]
            if (!t) return
            const ringG = scene.add.graphics()
            ringG.lineStyle(10, ok ? C.yes : 0xff9b4a, 1)
            ringG.strokeCircle(0, 0, TAGS.size / 2 + 4)
            t.add(ringG)
            if (ok) await FX.impact(scene, t, 0.18)
            else await FX.shake(scene, t, { amount: 12, times: 4 })
        },
        async fold() {
            if (!board.visible) return
            await FX.to(scene, board, { alpha: 0, y: BOARD.y + 30 }, { duration: 220 })
            board.setVisible(false)
        },
        async hide() {
            const parts = boardParts
            boardParts = []
            const old = tags
            tags = []
            await FX.all(
                FX.to(scene, board, { alpha: 0, y: BOARD.y + 30 }, { duration: 260 }),
                ...old.map((t, i) => FX.to(scene, t, { scale: 0 }, { duration: 220, delay: i * 50, ease: 'Back.easeIn' })),
            )
            board.setVisible(false)
            parts.forEach(p => p.destroy())
            old.forEach(t => t.destroy())
        },
        rect() {
            const w = STAMPS.xs[2] - STAMPS.xs[0] + TAGS.size + 20
            return { x: STAMPS.xs[1], y: TAGS.y, w, h: TAGS.size + 20 }
        },
        boardRect() {
            return { x: BOARD.x, y: BOARD.y, w: BOARD.w + 16, h: BOARD.h + 16 }
        },
        destroy() {
            zones.forEach(z => z.destroy())
            clearTags()
            board.destroy()
        },
    }
}
