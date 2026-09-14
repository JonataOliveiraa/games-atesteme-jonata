import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { H, W } from '../data/layout'
import { C } from '../data/theme'

const PANEL = { w: 292, h: 132, cap: 24, radius: 32 }
const DOT = { r: 17, gap: 66 }

export interface NextLevelOptions {
    done: number
    total: number
    onDone: () => void
}

export function showNextLevel(scene: Phaser.Scene, options: NextLevelOptions) {
    const { done, total } = options
    const depth = 5000

    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.ink).setAlpha(0).setDepth(depth).setInteractive()
    const panel = scene.add.container(W / 2, H / 2).setDepth(depth + 1)

    const shell = scene.add.graphics()
    shell.fillStyle(C.ink, 0.22)
    shell.fillRoundedRect(-PANEL.w / 2 - 6, -PANEL.h / 2 + 12, PANEL.w + 12, PANEL.h, PANEL.radius + 6)
    shell.fillStyle(C.ink, 1)
    shell.fillRoundedRect(-PANEL.w / 2, -PANEL.h / 2, PANEL.w, PANEL.h, PANEL.radius)
    shell.fillStyle(C.cream, 1)
    shell.fillRoundedRect(-PANEL.w / 2 + 6, -PANEL.h / 2 + 6, PANEL.w - 12, PANEL.h - 12, PANEL.radius - 6)
    shell.fillStyle(C.input, 1)
    shell.fillRoundedRect(-PANEL.w / 2 + 6, -PANEL.h / 2 + 6, PANEL.w - 12, PANEL.cap, {
        tl: PANEL.radius - 6,
        tr: PANEL.radius - 6,
        bl: 0,
        br: 0,
    })
    shell.fillStyle(C.white, 0.3)
    shell.fillRoundedRect(-PANEL.w / 2 + 28, -PANEL.h / 2 + 12, PANEL.w - 56, 6, 3)

    const dotsY = PANEL.cap / 2 + 2
    const xOf = (i: number) => (i - (total - 1) / 2) * DOT.gap

    const dots = scene.add.graphics().setPosition(0, dotsY)
    for (let i = 0; i < total; i++) {
        const x = xOf(i)
        if (i < done - 1) {
            dots.fillStyle(C.input, 1)
            dots.fillCircle(x, 0, DOT.r)
            dots.lineStyle(4, C.white, 0.9)
            dots.strokeCircle(x, 0, DOT.r)
        } else if (i === done - 1 || i === done) {
            dots.fillStyle(C.input, 0.22)
            dots.fillCircle(x, 0, DOT.r + 1)
            dots.lineStyle(5, C.input, 1)
            dots.strokeCircle(x, 0, DOT.r + 1)
        } else {
            dots.fillStyle(C.plasticDeep, 1)
            dots.fillCircle(x, 0, DOT.r - 3)
        }
    }

    const fillX = xOf(done - 1)
    const fill = scene.add.graphics().setPosition(fillX, dotsY).setScale(0)
    fill.fillStyle(C.input, 1)
    fill.fillCircle(0, 0, DOT.r)
    fill.lineStyle(4, C.white, 0.9)
    fill.strokeCircle(0, 0, DOT.r)

    panel.add([shell, dots, fill])
    panel.setScale(0.9).setAlpha(0)

    let closed = false
    const finish = () => {
        if (closed) return
        closed = true
        veil.destroy()
        panel.destroy(true)
        options.onDone()
    }

    void (async () => {
        await FX.all(
            FX.to(scene, veil, { alpha: 0.55 }, { duration: 220 }),
            FX.to(scene, panel, { scale: 1, alpha: 1 }, { duration: 280, ease: 'Back.easeOut' }),
        )
        await FX.wait(scene, 140)
        await FX.to(scene, fill, { scale: 1 }, { duration: 360, ease: 'Back.easeOut' })
        void FX.sparks(scene, W / 2 + fillX, H / 2 + dotsY, {
            color: C.gold,
            count: 14,
            spread: 130,
            depth: depth + 2,
        })
        await FX.wait(scene, 640)
        await FX.all(
            FX.to(scene, veil, { alpha: 0 }, { duration: 240 }),
            FX.to(scene, panel, { alpha: 0, scale: 0.94 }, { duration: 240 }),
        )
        finish()
    })()

    return { destroy: finish }
}
