import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CARD, DEPTH, dotRFor, dotX } from '../data/layout'
import { C, CSS, FONT, MOVE_COLOR } from '../data/theme'
import type { RoutineStep } from '../types'
import type { FxTarget } from '../../../../shared/effects/FX'
import { createIcon, moveIcon } from './icons'

export interface CardOptions {
    step: RoutineStep
    x: number
    y: number
    h: number
}

export function createRoutineCard(scene: Phaser.Scene, options: CardOptions) {
    const { step, x, y, h } = options
    const tone = MOVE_COLOR[step.move]
    const half = { w: CARD.w / 2, h: h / 2 }
    const dotR = dotRFor(step.count)

    const root = scene.add.container(x, y).setDepth(DEPTH.card)

    const shell = scene.add.graphics()
    const dots = scene.add.graphics()
    const badge = scene.add.graphics()

    const count = scene.add.text(CARD.badgeX, 1, String(step.count), {
        fontFamily: FONT.black,
        fontSize: '46px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    count.setStroke(CSS.ink, 7)

    const icon = createIcon(scene, moveIcon(step.move), CARD.icon)
    icon.setPosition(CARD.iconX, 0)

    const seal = createIcon(scene, 'ready', 64)
    seal.setPosition(half.w - 22, -half.h + 14).setScale(0).setAlpha(0)
    const sealFx = seal as unknown as FxTarget

    const lock = scene.add.graphics().setAlpha(0)

    root.add([shell, badge, count, dots, icon, seal, lock])

    let active = true
    let filled = 0
    let sealed = false
    let extra: Phaser.GameObjects.Graphics | null = null

    const paintLock = () => {
        lock.clear()
        lock.fillStyle(C.ink, 0.34)
        lock.fillRoundedRect(-half.w, -half.h, CARD.w, h, CARD.r)
        lock.fillStyle(C.creamDeep, 1)
        lock.fillRoundedRect(-22, -6, 44, 36, 8)
        lock.lineStyle(9, C.creamDeep, 1)
        lock.beginPath()
        lock.arc(0, -6, 15, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false)
        lock.strokePath()
        lock.fillStyle(C.woodDark, 1)
        lock.fillCircle(0, 11, 6)
    }

    const paintShell = () => {
        const border = sealed ? C.okDark : active ? tone.dark : C.creamEdge
        shell.clear()
        shell.fillStyle(C.ink, 0.24)
        shell.fillRoundedRect(-half.w, -half.h + 9, CARD.w, h, CARD.r)
        shell.fillStyle(border, 1)
        shell.fillRoundedRect(-half.w, -half.h, CARD.w, h, CARD.r)
        shell.fillStyle(sealed ? 0xeafbe9 : C.cream, 1)
        shell.fillRoundedRect(-half.w + 8, -half.h + 8, CARD.w - 16, h - 20, CARD.r - 7)
        shell.fillStyle(C.white, 0.66)
        shell.fillRoundedRect(-half.w + 28, -half.h + 17, CARD.w - 56, 15, 8)
    }

    const paintBadge = () => {
        badge.clear()
        badge.fillStyle(C.ink, 1)
        badge.fillCircle(CARD.badgeX, 2, CARD.badge + 4)
        badge.fillStyle(sealed ? C.okDark : tone.dark, 1)
        badge.fillCircle(CARD.badgeX, 0, CARD.badge)
        badge.fillStyle(sealed ? C.ok : tone.base, 1)
        badge.fillCircle(CARD.badgeX, -2, CARD.badge - 3)
        badge.fillStyle(C.white, 0.3)
        badge.fillEllipse(CARD.badgeX - 8, -CARD.badge * 0.5, CARD.badge, CARD.badge * 0.42)
    }

    const paintDots = () => {
        dots.clear()
        for (let i = 0; i < step.count; i++) {
            const dx = dotX(i, step.count)
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(dx, 0, dotR + 3)
            if (i < filled) {
                dots.fillStyle(sealed ? C.okDark : tone.dark, 1)
                dots.fillCircle(dx, 0, dotR)
                dots.fillStyle(sealed ? C.ok : tone.base, 1)
                dots.fillCircle(dx, -2, dotR - 2)
            } else {
                dots.fillStyle(C.creamEdge, 1)
                dots.fillCircle(dx, 0, dotR)
                dots.fillStyle(C.creamDeep, 1)
                dots.fillCircle(dx, -2, dotR - 2)
            }
            dots.fillStyle(C.white, 0.42)
            dots.fillEllipse(dx - dotR * 0.28, -dotR * 0.55, dotR * 0.8, dotR * 0.34)
        }
    }

    const repaint = () => {
        paintShell()
        paintBadge()
        paintDots()
    }

    paintLock()
    repaint()

    return {
        get root() {
            return root
        },

        get filled() {
            return filled
        },

        setActive(on: boolean) {
            active = on
            repaint()
            scene.tweens.add({
                targets: root,
                scale: on ? 1 : CARD.idleScale,
                alpha: on || sealed ? 1 : 0.74,
                duration: FX.ms(scene, 260),
                ease: 'Back.easeOut',
            })
        },

        appear(delay: number) {
            root.setAlpha(0).setScale(0.7)
            return FX.popIn(scene, root, { from: 0.7, delay, duration: 380 })
        },

        async fill(n: number) {
            filled = Phaser.Math.Clamp(n, 0, step.count)
            paintDots()
            const dx = dotX(filled - 1, step.count)
            await FX.ping(scene, x + dx, y, tone.base, { radius: 34, duration: 380 })
        },

        async extraDot() {
            const dx = dotX(step.count - 1, step.count) + CARD.dotGap
            extra?.destroy()
            extra = scene.add.graphics().setDepth(DEPTH.card + 1)
            extra.fillStyle(C.badDark, 1)
            extra.fillCircle(0, 0, dotR + 2)
            extra.fillStyle(C.bad, 1)
            extra.fillCircle(0, -2, dotR - 1)
            extra.setPosition(x + dx, y)
            const piece = extra
            await FX.to(scene, piece, { scale: 1.5 }, { duration: 160, ease: 'Back.easeOut' })
            await FX.to(scene, piece, { y: y + 90, alpha: 0, angle: 40 }, { duration: 460 })
            piece.destroy()
            if (extra === piece) extra = null
        },

        async emptyDots() {
            await FX.shake(scene, dots, { amount: 9, times: 3 })
            filled = 0
            paintDots()
            await FX.to(scene, dots, { scale: 1.18 }, { duration: 180, yoyo: true })
            dots.setScale(1)
        },

        setLocked(on: boolean) {
            scene.tweens.add({
                targets: lock,
                alpha: on ? 1 : 0,
                duration: FX.ms(scene, 200),
            })
        },

        async seal() {
            sealed = true
            repaint()
            seal.setScale(0).setAlpha(1)
            await FX.to(scene, sealFx, { scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },

        async glow() {
            await FX.to(scene, root, { scale: 1.06 }, { duration: 180, yoyo: true })
            root.setScale(active ? 1 : CARD.idleScale)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            extra?.destroy()
            root.destroy(true)
        },
    }
}

export type RoutineCard = ReturnType<typeof createRoutineCard>
