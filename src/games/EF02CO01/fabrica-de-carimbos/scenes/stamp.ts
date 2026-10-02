import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, STAMP_SHEET } from '../data/files'
import { BALLOON, DEPTH, STAMP } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { ruleWord } from '../data/words'
import type { Collection, Rule } from '../types'
import { badge, createGlyph, type ToyView } from './toy'

export interface Stamp {
    show(rules: Rule[], collection: Collection): Promise<void>
    showEmpty(count: number, collection: Collection): Promise<void>
    focus(index: number): void
    fill(index: number, rule: Rule, ok: boolean): void
    clearMarks(): void
    windowPoint(index: number): { x: number; y: number }
    pulse(): Promise<void>
    press(toy: ToyView, results: boolean[], onMark?: (ok: boolean) => void): Promise<void>
    approve(toy: ToyView): Promise<void>
    blink(index: number): Promise<void>
    say(text: string): void
    lift(): Promise<void>
    hide(): Promise<void>
    update(): void
    readonly rect: { x: number; y: number; w: number; h: number }
    destroy(): void
}

interface Window {
    container: Phaser.GameObjects.Container
    frame: Phaser.GameObjects.Graphics
    content: Phaser.GameObjects.Container
    rule: Rule | null
}

type FrameState = 'idle' | 'ok' | 'no' | 'lit'

const S = STAMP.scale
const HEIGHT = (ART.stamp.bottom - ART.stamp.top) * S
const HALF_W = (ART.stamp.w / 2) * S
const WIN_W = ART.stamp.window.w * S
const WIN_H = ART.stamp.window.h * S

export function createStamp(scene: Phaser.Scene): Stamp {
    const hasArt = scene.textures.exists(STAMP_SHEET)
    const rod = scene.add.graphics().setDepth(DEPTH.stamp - 1)
    const head = scene.add.container(STAMP.x, STAMP.hiddenTop).setDepth(DEPTH.stamp)

    let body: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    if (hasArt) {
        body = scene.add.image(0, 0, STAMP_SHEET, 0).setOrigin(ART.stamp.cx / 512, ART.stamp.top / 386).setScale(S)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(-HALF_W * 0.7, HEIGHT - 50, HALF_W * 1.4, 50, 18)
        g.lineStyle(4, C.ink, 1)
        g.strokeRoundedRect(-HALF_W * 0.7, HEIGHT - 50, HALF_W * 1.4, 50, 18)
        g.fillStyle(C.mint, 1)
        g.fillRoundedRect(-HALF_W, 50, HALF_W * 2, HEIGHT - 110, 24)
        g.strokeRoundedRect(-HALF_W, 50, HALF_W * 2, HEIGHT - 110, 24)
        g.fillStyle(C.lilac, 1)
        g.fillRoundedRect(-50, 0, 100, 54, 12)
        g.strokeRoundedRect(-50, 0, 100, 54, 12)
        body = g
    }
    head.add(body)

    let windows: Window[] = []
    let badges: Phaser.GameObjects.Graphics[] = []

    const balloonBg = scene.add.graphics()
    const balloonText = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.balloon}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const balloon = scene.add.container(0, 0, [balloonBg, balloonText]).setDepth(DEPTH.balloon).setAlpha(0)

    const paintFrame = (g: Phaser.GameObjects.Graphics, state: FrameState) => {
        g.clear()
        if (!hasArt) {
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(-WIN_W / 2, -WIN_H / 2, WIN_W, WIN_H, 12)
        }
        if (state === 'idle') {
            if (!hasArt) {
                g.lineStyle(4, C.steelDark, 1)
                g.strokeRoundedRect(-WIN_W / 2, -WIN_H / 2, WIN_W, WIN_H, 12)
            }
            return
        }
        const color = state === 'ok' ? C.yes : state === 'no' ? C.no : C.glow
        g.lineStyle(7, color, 1)
        g.strokeRoundedRect(-WIN_W / 2 - 2, -WIN_H / 2 - 2, WIN_W + 4, WIN_H + 4, 12)
    }

    const paintRod = () => {
        rod.clear()
        const bottom = head.y + 12
        if (bottom <= STAMP.rodTop) return
        rod.fillStyle(C.steel, 1)
        rod.fillRect(STAMP.x - STAMP.rodW / 2, STAMP.rodTop, STAMP.rodW, bottom - STAMP.rodTop)
        rod.lineStyle(3, C.ink, 1)
        rod.strokeRect(STAMP.x - STAMP.rodW / 2, STAMP.rodTop, STAMP.rodW, bottom - STAMP.rodTop)
    }

    const clearBadges = () => {
        badges.forEach(g => g.destroy())
        badges = []
    }

    let collection: Collection = 'robot'
    let three = false

    const paintContent = (w: Window) => {
        w.content.removeAll(true)
        if (!w.rule) {
            const mark = scene.add
                .text(0, 2, '?', { fontFamily: FONT.black, fontSize: '40px', color: CSS.inkSoft })
                .setOrigin(0.5)
                .setResolution(2)
            w.content.add(mark)
            return
        }
        const glyph = createGlyph(scene, w.rule, collection).setPosition(0, -9).setScale(three ? 0.85 : 1)
        const word = scene.add
            .text(0, WIN_H / 2 - 12, ruleWord(w.rule), {
                fontFamily: FONT.black,
                fontSize: `${three ? SIZE.window3 : SIZE.window}px`,
                color: CSS.ink,
            })
            .setOrigin(0.5)
            .setResolution(2)
        w.content.add([glyph, word])
    }

    const build = (slots: (Rule | null)[], kind: Collection) => {
        windows.forEach(w => w.container.destroy())
        clearBadges()
        collection = kind
        three = slots.length === 3
        const layout = ART.stamp.windows[three ? 1 : 0]
        if (body instanceof Phaser.GameObjects.Image) body.setFrame(three ? 1 : 0)
        windows = slots.map((rule, k) => {
            const spot = layout[k]
            const frame = scene.add.graphics()
            paintFrame(frame, 'idle')
            const content = scene.add.container(0, 0)
            const container = scene.add.container((spot.x - ART.stamp.cx) * S, (spot.y - ART.stamp.top) * S, [frame, content])
            head.add(container)
            const w = { container, frame, content, rule }
            paintContent(w)
            return w
        })
    }

    const drop = async () => {
        head.y = STAMP.hiddenTop
        paintRod()
        await moveHead(STAMP.upTop, 620, 'Bounce.easeOut')
    }

    const windowWorld = (index: number) => {
        const w = windows[index]
        return { x: head.x + w.container.x, y: head.y + w.container.y }
    }

    const moveHead = (y: number, duration: number, ease = 'Sine.easeInOut') =>
        new Promise<void>(resolve => {
            scene.tweens.killTweensOf(head)
            scene.tweens.add({ targets: head, y, duration, ease, onUpdate: paintRod, onComplete: () => resolve() })
        })

    const beam = async (from: { x: number; y: number }, to: { x: number; y: number }) => {
        const g = scene.add.graphics().setDepth(DEPTH.marks)
        const steps = 8
        g.fillStyle(C.glow, 1)
        g.lineStyle(3, C.ink, 0.6)
        for (let i = 0; i <= steps; i++) {
            const t = i / steps
            const x = Phaser.Math.Linear(from.x, to.x, t)
            const y = Phaser.Math.Linear(from.y, to.y, t)
            g.fillCircle(x, y, 5)
            g.strokeCircle(x, y, 5)
        }
        g.setAlpha(0)
        await FX.to(scene, g, { alpha: 1 }, { duration: 120 })
        await FX.wait(scene, 160)
        await FX.to(scene, g, { alpha: 0 }, { duration: 160 })
        g.destroy()
    }

    return {
        async showEmpty(count, kind) {
            build(new Array<Rule | null>(count).fill(null), kind)
            await drop()
        },
        focus(index) {
            windows.forEach((w, k) => paintFrame(w.frame, k === index ? 'lit' : 'idle'))
            const w = windows[index]
            if (w) void FX.impact(scene, w.container, 0.14)
        },
        fill(index, rule, ok) {
            const w = windows[index]
            if (!w) return
            w.rule = rule
            paintContent(w)
            paintFrame(w.frame, ok ? 'ok' : 'no')
            void FX.impact(scene, w.container, 0.2)
            const mark = badge(scene, WIN_W / 2 - 6, -WIN_H / 2 + 6, ok, 0, 0.7)
            w.container.add(mark)
            badges.push(mark)
        },
        clearMarks() {
            clearBadges()
            windows.forEach(w => paintFrame(w.frame, 'idle'))
        },
        windowPoint(index) {
            return windowWorld(index)
        },
        async show(rules, kind) {
            build(rules, kind)
            await drop()
            for (const w of windows) {
                paintFrame(w.frame, 'lit')
                const p = { x: head.x + w.container.x, y: head.y + w.container.y }
                void FX.ping(scene, p.x, p.y, C.glow, { radius: 70, depth: DEPTH.marks })
                await FX.impact(scene, w.container, 0.18)
                paintFrame(w.frame, 'idle')
            }
        },
        async pulse() {
            for (const w of windows) {
                paintFrame(w.frame, 'lit')
                await FX.impact(scene, w.container, 0.2)
                await FX.wait(scene, 160)
                paintFrame(w.frame, 'idle')
            }
        },
        async press(toy, results, onMark) {
            const target = Math.max(STAMP.upTop + 14, toy.top() - HEIGHT - 4)
            await moveHead(target, STAMP.pressMs, 'Quad.easeIn')
            void FX.impact(scene, toy.container, 0.08)
            for (let k = 0; k < windows.length; k++) {
                const w = windows[k]
                if (!w.rule) continue
                const from = windowWorld(k)
                const to = toy.point(w.rule.attribute)
                paintFrame(w.frame, 'lit')
                await beam({ x: from.x, y: from.y + WIN_H / 2 }, to)
                void FX.ping(scene, to.x, to.y, results[k] ? C.yes : C.no, { radius: 50, depth: DEPTH.marks })
                paintFrame(w.frame, results[k] ? 'ok' : 'no')
                onMark?.(results[k])
                const mark = badge(scene, WIN_W / 2 - 6, -WIN_H / 2 + 6, results[k], 0, 0.7)
                w.container.add(mark)
                badges.push(mark)
                await FX.wait(scene, 260)
            }
        },
        async approve(toy) {
            const y = head.y
            await moveHead(y + 10, 90, 'Quad.easeIn')
            void FX.impact(scene, toy.container, 0.16)
            const label = scene.add
                .text(0, (toy.top() - toy.container.y) / 2, 'APROVADO', {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.approved}px`,
                    color: CSS.stampInk,
                    backgroundColor: '#fff6e4',
                    padding: { x: 8, y: 2 },
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setAngle(-10)
                .setAlpha(0.95)
            toy.container.add(label)
            label.setScale(1.6)
            void FX.to(scene, label, { scale: 1 }, { duration: 160, ease: 'Back.easeOut' })
            await moveHead(y, 160)
        },
        async blink(index) {
            const w = windows[index]
            if (!w) return
            for (let i = 0; i < 3; i++) {
                paintFrame(w.frame, 'idle')
                await FX.wait(scene, 110)
                paintFrame(w.frame, 'no')
                await FX.wait(scene, 130)
            }
        },
        say(text) {
            balloonText.setText(text)
            const w = Math.max(BALLOON.w, balloonText.width + 48)
            const h = BALLOON.h
            balloonBg.clear()
            balloonBg.fillStyle(C.shadow, 0.16)
            balloonBg.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
            balloonBg.fillStyle(C.white, 1)
            balloonBg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            balloonBg.fillTriangle(-w / 2 + 6, -10, -w / 2 + 6, 14, -w / 2 - 22, 2)
            balloonBg.lineStyle(4, C.ink, 1)
            balloonBg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            balloon.setPosition(STAMP.x + HALF_W + 30 + w / 2, head.y + BALLOON.dy).setAlpha(0).setScale(0.8)
            void FX.to(scene, balloon, { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        async lift() {
            clearBadges()
            windows.forEach(w => paintFrame(w.frame, 'idle'))
            scene.tweens.killTweensOf(balloon)
            balloon.setAlpha(0)
            await moveHead(STAMP.upTop, STAMP.liftMs)
        },
        async hide() {
            clearBadges()
            balloon.setAlpha(0)
            await moveHead(STAMP.hiddenTop, 420, 'Sine.easeIn')
        },
        update: paintRod,
        rect: { x: STAMP.x, y: STAMP.upTop + HEIGHT / 2, w: HALF_W * 2 + 20, h: HEIGHT + 20 },
        destroy() {
            scene.tweens.killTweensOf([head, balloon])
            clearBadges()
            rod.destroy()
            balloon.destroy()
            head.destroy()
        },
    }
}
