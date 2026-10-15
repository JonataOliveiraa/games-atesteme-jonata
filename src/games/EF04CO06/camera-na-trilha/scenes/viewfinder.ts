import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, FRAME } from '../data/layout'
import { C } from '../data/theme'
import type { Rect } from '../types'
import { baked } from './art'
import type { View } from './view'

export interface Viewfinder {
    readonly parts: Phaser.GameObjects.GameObject[]
    place(rect: Rect, focused: boolean): void
    recording(on: boolean): void
    blink(): Promise<void>
    show(on: boolean): void
    destroy(): void
}

const PAD = 14
const ARM = 54

function corners(g: Phaser.GameObjects.Graphics, w: number, h: number, width: number) {
    const x0 = PAD
    const y0 = PAD
    const x1 = PAD + w
    const y1 = PAD + h
    const paint = (color: number, thick: number) => {
        g.lineStyle(thick, color, 1)
        g.beginPath()
        g.moveTo(x0, y0 + ARM)
        g.lineTo(x0, y0)
        g.lineTo(x0 + ARM, y0)
        g.moveTo(x1 - ARM, y0)
        g.lineTo(x1, y0)
        g.lineTo(x1, y0 + ARM)
        g.moveTo(x1, y1 - ARM)
        g.lineTo(x1, y1)
        g.lineTo(x1 - ARM, y1)
        g.moveTo(x0 + ARM, y1)
        g.lineTo(x0, y1)
        g.lineTo(x0, y1 - ARM)
        g.strokePath()
    }
    paint(C.ink, width + 6)
    paint(C.white, width)
}

export function createViewfinder(scene: Phaser.Scene, view: View): Viewfinder {
    const w = FRAME.w
    const h = FRAME.h
    const plain = baked(scene, 'cnt-frame', w + PAD * 2, h + PAD * 2, g => corners(g, w, h, 6))
    const sharp = baked(scene, 'cnt-frame-on', w + PAD * 2, h + PAD * 2, g => corners(g, w, h, 11))
    const frame = view.world(scene.add.image(0, 0, plain).setDepth(DEPTH.frame))
    const glass = view.world(scene.add.rectangle(0, 0, w, h, C.white, 0).setDepth(DEPTH.frame - 0.5))
    const rec = view.world(scene.add.circle(0, 0, 11, C.red).setStrokeStyle(4, C.ink).setDepth(DEPTH.frame + 0.5).setVisible(false))
    let on = false
    let shown = true
    let recTween: Phaser.Tweens.Tween | undefined

    return {
        parts: [frame, glass, rec],
        place(rect, focused) {
            const k = rect.w / FRAME.w
            frame.setPosition(rect.x, rect.y).setScale(k)
            glass.setPosition(rect.x, rect.y).setScale(k)
            rec.setPosition(rect.x - rect.w / 2 + 30 * k, rect.y - rect.h / 2 + 30 * k).setScale(k)
            if (focused !== on) {
                on = focused
                frame.setTexture(on ? sharp : plain)
            }
        },
        recording(active) {
            recTween?.remove()
            recTween = undefined
            rec.setVisible(active && shown).setAlpha(1)
            if (active) recTween = scene.tweens.add({ targets: rec, alpha: 0.25, duration: 380, yoyo: true, repeat: -1 })
        },
        async blink() {
            glass.setFillStyle(C.white, 0.85)
            await FX.to(scene, glass, { fillAlpha: 0 }, { duration: 260 })
            glass.setFillStyle(C.white, 0)
        },
        show(visible) {
            shown = visible
            frame.setVisible(visible)
            glass.setVisible(visible)
            if (!visible) rec.setVisible(false)
        },
        destroy() {
            recTween?.remove()
            scene.tweens.killTweensOf(glass)
            frame.destroy()
            glass.destroy()
            rec.destroy()
        },
    }
}
