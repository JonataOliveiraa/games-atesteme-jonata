import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { BALLOON, BOARD, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { BOARD_TITLE, sentenceWords } from '../data/words'
import type { Rect, Sentence, Vec } from '../types'
import { layoutWords } from './sign'

export interface Balloon {
    say(at: Vec, text: string, tone?: 'ok' | 'oops'): Promise<void>
    hide(): void
    destroy(): void
}

export function createBalloon(scene: Phaser.Scene): Balloon {
    let box: Phaser.GameObjects.Container | undefined
    const hide = () => {
        if (!box) return
        scene.tweens.killTweensOf(box)
        box.destroy()
        box = undefined
    }
    return {
        say(at, text, tone = 'ok') {
            hide()
            const edge = tone === 'oops' ? C.noDark : C.ink
            const label = scene.add
                .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.balloon}px`, color: tone === 'oops' ? CSS.noDark : CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const w = Math.max(BALLOON.minW, label.width + 48)
            const h = BALLOON.h
            const x = Phaser.Math.Clamp(at.x, w / 2 + 14, W - w / 2 - 14)
            const y = Phaser.Math.Clamp(at.y, h / 2 + 100, H - h / 2 - 30)
            const tail = Phaser.Math.Clamp(at.x - x, -w / 2 + 40, w / 2 - 40)
            const bg = scene.add.graphics()
            bg.fillStyle(C.shadow, 0.18)
            bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2)
            bg.fillStyle(C.white, 1)
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            bg.fillTriangle(tail - 14, h / 2 - 2, tail + 14, h / 2 - 2, tail + 6, h / 2 + 22)
            bg.lineStyle(4, edge, 1)
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            bg.lineBetween(tail - 14, h / 2, tail + 6, h / 2 + 22)
            bg.lineBetween(tail + 14, h / 2, tail + 6, h / 2 + 22)
            box = scene.add.container(x, y, [bg, label]).setDepth(DEPTH.balloon).setScale(0.7).setAlpha(0)
            return FX.to(scene, box, { alpha: 1, scale: 1 }, { duration: 240, ease: Ease.back(1.8) })
        },
        hide,
        destroy: hide,
    }
}

export interface Coach {
    show(hole: Rect, tap: Vec): void
    demo(tap: Vec): Promise<void>
    hide(): void
    destroy(): void
}

export function createCoach(scene: Phaser.Scene): Coach {
    const veil = scene.add.graphics().setDepth(DEPTH.veil)
    const hand = scene.add.graphics().setDepth(DEPTH.hand)
    hand.fillStyle(C.cream, 1)
    hand.lineStyle(4, C.ink, 1)
    hand.fillRoundedRect(-12, -2, 30, 40, 12)
    hand.strokeRoundedRect(-12, -2, 30, 40, 12)
    hand.fillRoundedRect(-8, -40, 14, 44, 7)
    hand.strokeRoundedRect(-8, -40, 14, 44, 7)
    hand.fillRoundedRect(-24, 8, 16, 14, 7)
    hand.strokeRoundedRect(-24, 8, 16, 14, 7)
    hand.setVisible(false)
    let tap: Phaser.Tweens.Tween | undefined
    let ring: Phaser.Time.TimerEvent | undefined

    const hide = () => {
        veil.clear()
        tap?.stop()
        ring?.remove()
        scene.tweens.killTweensOf(hand)
        hand.setVisible(false).setAlpha(1)
    }

    return {
        show(hole, at) {
            hide()
            const l = hole.x - hole.w / 2
            const t = hole.y - hole.h / 2
            veil.fillStyle(C.shadow, 0.5)
            veil.fillRect(0, 0, W, t)
            veil.fillRect(0, t + hole.h, W, H - t - hole.h)
            veil.fillRect(0, t, l, hole.h)
            veil.fillRect(l + hole.w, t, W - l - hole.w, hole.h)
            veil.lineStyle(4, C.yellow, 0.9)
            veil.strokeRoundedRect(l, t, hole.w, hole.h, 14)
            hand.setPosition(at.x + 6, at.y + 44).setVisible(true).setAngle(-12)
            tap = scene.tweens.add({ targets: hand, y: at.y + 30, duration: 360, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            ring = scene.time.addEvent({
                delay: 720,
                loop: true,
                callback: () => void FX.ping(scene, at.x, at.y, C.yellow, { radius: 46, duration: 480, depth: DEPTH.hand - 1 }),
            })
        },
        async demo(at) {
            hide()
            hand.setPosition(at.x + 70, at.y + 120).setVisible(true).setAngle(-12).setAlpha(0)
            await FX.to(scene, hand, { x: at.x + 6, y: at.y + 44, alpha: 1 }, { duration: 420, ease: Ease.smooth })
            await FX.to(scene, hand, { y: at.y + 28 }, { duration: 140 })
            void FX.ping(scene, at.x, at.y, C.yellow, { radius: 50, duration: 420, depth: DEPTH.hand - 1 })
            await FX.to(scene, hand, { y: at.y + 44 }, { duration: 140 })
            void FX.to(scene, hand, { alpha: 0 }, { duration: 260 }).then(() => hand.setVisible(false))
        },
        hide,
        destroy() {
            hide()
            veil.destroy()
            hand.destroy()
        },
    }
}

export interface Board {
    show(sentences: Sentence[]): Promise<void>
    destroy(): void
}

export function createBoard(scene: Phaser.Scene): Board {
    let box: Phaser.GameObjects.Container | undefined
    return {
        async show(sentences) {
            const { w, h, cardW } = BOARD
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.3)
            g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 30)
            g.fillStyle(C.lavender, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 30)
            g.fillStyle(C.pink, 1)
            g.fillRoundedRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 22)
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(-w / 2 + 20, -h / 2 + 20, w - 40, h - 40, 18)
            g.lineStyle(5, C.ink, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 30)
            const title = scene.add
                .text(0, -h / 2 + 62, BOARD_TITLE, { fontFamily: FONT.black, fontSize: `${SIZE.board}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const top = -h / 2 + 140
            const rows = sentences.map((s, i) => {
                const y = top + i * BOARD.row
                const card = scene.add.graphics()
                card.fillStyle(C.white, 1)
                card.fillRoundedRect(-cardW / 2, -BOARD.row / 2 + 8, cardW, BOARD.row - 16, 16)
                card.lineStyle(3, C.lavenderDark, 1)
                card.strokeRoundedRect(-cardW / 2, -BOARD.row / 2 + 8, cardW, BOARD.row - 16, 16)
                const block = layoutWords(scene, sentenceWords(s), cardW - 60, SIZE.boardLine)
                const words = scene.add.container(0, 0, block.objects)
                return scene.add.container(0, y, [card, words]).setAlpha(0)
            })
            box = scene.add.container(BOARD.x, -h, [g, title, ...rows]).setDepth(DEPTH.finale)
            await FX.to(scene, box, { y: BOARD.y }, { duration: 620, ease: Ease.back(1.3) })
            for (const row of rows) {
                await FX.to(scene, row, { alpha: 1 }, { duration: 260 })
                await FX.wait(scene, 160)
            }
        },
        destroy() {
            box?.destroy()
            box = undefined
        },
    }
}
