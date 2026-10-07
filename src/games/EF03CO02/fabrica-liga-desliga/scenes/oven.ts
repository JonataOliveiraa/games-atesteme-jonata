import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, OVEN_BACK_SHEET, OVEN_FRAME, OVEN_SHEET, frameKey } from '../data/files'
import { DEPTH, OVEN } from '../data/layout'
import { C } from '../data/theme'
import type { Rect } from './guide'

export interface Oven {
    setLit(on: boolean, animate?: boolean): void
    spark(): void
    readonly lit: boolean
    rect(): Rect
    windowPoint(): { x: number; y: number }
    destroy(): void
}

export function createOven(scene: Phaser.Scene): Oven {
    const [, , fw, fh] = OVEN_FRAME.ovenLit
    const w = fw * OVEN.scale
    const h = fh * OVEN.scale
    const win = { x: OVEN.x + (ART.ovenWindow.x - fw / 2) * OVEN.scale, y: OVEN.top + ART.ovenWindow.y * OVEN.scale }

    const glow = scene.add.graphics().setDepth(DEPTH.glow)
    glow.fillStyle(C.glow, 0.55)
    glow.fillEllipse(win.x, win.y, w + 60, h * 0.9)
    glow.fillStyle(C.glow, 0.5)
    glow.fillCircle(win.x, win.y, 120)

    const image = scene.add
        .image(OVEN.x, OVEN.top, OVEN_SHEET, frameKey('ovenOut'))
        .setOrigin(0.5, 0)
        .setScale(OVEN.scale)
        .setDepth(DEPTH.oven)

    const back = scene.textures.exists(OVEN_BACK_SHEET)
        ? scene.add
              .image(OVEN.x, OVEN.top, OVEN_BACK_SHEET, frameKey('ovenOut'))
              .setOrigin(0.5, 0)
              .setScale(OVEN.scale)
              .setDepth(DEPTH.ovenBack)
        : undefined

    let lit = false
    let breathe: Phaser.Tweens.Tween | undefined

    const setLit = (on: boolean, animate = true) => {
        lit = on
        image.setFrame(frameKey(on ? 'ovenLit' : 'ovenOut'))
        back?.setFrame(frameKey(on ? 'ovenLit' : 'ovenOut'))
        breathe?.remove()
        breathe = undefined
        scene.tweens.killTweensOf(glow)
        if (on) {
            glow.setAlpha(animate ? 0 : 1)
            if (animate) {
                void FX.to(scene, glow, { alpha: 1 }, { duration: 320 })
                void FX.impact(scene, image, 0.05)
                if (back) void FX.impact(scene, back, 0.05)
            }
            breathe = scene.tweens.add({ targets: glow, alpha: 0.6, duration: 520, yoyo: true, repeat: -1, delay: 340 })
        } else if (animate) {
            void FX.to(scene, glow, { alpha: 0 }, { duration: 260 })
        } else glow.setAlpha(0)
    }
    setLit(false, false)

    return {
        setLit,
        spark() {
            for (let i = 0; i < 10; i++) {
                const g = scene.add.graphics({ x: win.x, y: win.y }).setDepth(DEPTH.fx)
                g.fillStyle(C.spark, 1)
                g.fillPoints(
                    [
                        { x: 0, y: -12 },
                        { x: 3, y: -3 },
                        { x: 12, y: 0 },
                        { x: 3, y: 3 },
                        { x: 0, y: 12 },
                        { x: -3, y: 3 },
                        { x: -12, y: 0 },
                        { x: -3, y: -3 },
                    ],
                    true,
                )
                g.lineStyle(2, C.ink, 0.8)
                g.strokeCircle(0, 0, 3)
                const a = (i / 10) * Math.PI * 2
                const r = Phaser.Math.Between(90, 140)
                g.setScale(0.4)
                void FX.to(
                    scene,
                    g,
                    { x: win.x + Math.cos(a) * r, y: win.y + Math.sin(a) * r, scale: 1.2, alpha: 0, angle: 90 },
                    { duration: 700, delay: i * 30, ease: 'Quad.easeOut' },
                ).then(() => g.destroy())
            }
            void FX.shake(scene, image, { amount: 5, times: 3 })
            if (back) void FX.shake(scene, back, { amount: 5, times: 3 })
        },
        get lit() {
            return lit
        },
        rect() {
            return { x: OVEN.x, y: OVEN.top + h / 2, w: w + 30, h: h + 30 }
        },
        windowPoint() {
            return win
        },
        destroy() {
            breathe?.remove()
            glow.destroy()
            back?.destroy()
            image.destroy()
        },
    }
}
