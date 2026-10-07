import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, PIECE_FRAME, PIECES_SHEET, frameKey } from '../data/files'
import { DEPTH, SWITCH } from '../data/layout'
import { C } from '../data/theme'
import type { Rect } from './guide'

export interface Switch {
    setOn(on: boolean): void
    press(): void
    ok(): void
    hint(on: boolean): void
    rect(): Rect
    contains(x: number, y: number): boolean
    destroy(): void
}

type State = 'switchOff' | 'switchOn'

export function createSwitch(scene: Phaser.Scene): Switch {
    const s = SWITCH.scale
    const boxW = ART.switchBoxW * s

    const image = scene.add.image(0, 0, PIECES_SHEET, frameKey('switchOff')).setScale(s)
    const lamp = scene.add.graphics()
    const arrow = scene.add.graphics().setVisible(false)
    const ax = boxW / 2 + 24
    const ay = -boxW / 2
    arrow.fillStyle(C.yellow, 1)
    arrow.fillTriangle(ax, ay, ax + 44, ay - 24, ax + 44, ay + 24)
    arrow.fillRect(ax + 40, ay - 9, 34, 18)
    arrow.lineStyle(4, C.ink, 1)
    arrow.strokeTriangle(ax, ay, ax + 44, ay - 24, ax + 44, ay + 24)
    arrow.strokeRect(ax + 44, ay - 9, 30, 18)

    const container = scene.add.container(SWITCH.x, SWITCH.bottom, [image, lamp, arrow]).setDepth(DEPTH.switch)
    let hintTween: Phaser.Tweens.Tween | undefined

    const show = (state: State, on: boolean) => {
        const [, , w, h] = PIECE_FRAME[state]
        const anchor = ART.switchBox[state]
        image.setFrame(frameKey(state)).setOrigin(anchor.x / w, anchor.bottom / h)
        const at = ART.switchLamp[state]
        const lx = (at.x - anchor.x) * s
        const ly = (at.y - anchor.bottom) * s
        const r = ART.switchLampR * s
        lamp.clear()
        if (!on) return
        lamp.fillStyle(C.lampOn, 0.35)
        lamp.fillCircle(lx, ly, r + 10)
        lamp.fillStyle(C.lampOn, 1)
        lamp.fillCircle(lx, ly, r)
        lamp.lineStyle(3, C.ink, 1)
        lamp.strokeCircle(lx, ly, r)
        lamp.fillStyle(C.white, 0.85)
        lamp.fillCircle(lx - r * 0.35, ly - r * 0.35, r * 0.3)
    }

    const setOn = (on: boolean) => show(on ? 'switchOn' : 'switchOff', on)
    setOn(false)

    return {
        setOn,
        press() {
            void FX.press(scene, container)
        },
        ok() {
            const g = scene.add.graphics({ x: SWITCH.x + boxW / 2, y: SWITCH.bottom - boxW }).setDepth(DEPTH.fx)
            g.fillStyle(C.yes, 1)
            g.fillCircle(0, 0, 24)
            g.lineStyle(4, C.ink, 1)
            g.strokeCircle(0, 0, 24)
            g.lineStyle(6, C.white, 1)
            g.beginPath()
            g.moveTo(-10, 1)
            g.lineTo(-3, 9)
            g.lineTo(11, -8)
            g.strokePath()
            g.setScale(0.2)
            void FX.to(scene, g, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
                .then(() => FX.wait(scene, 500))
                .then(() => FX.to(scene, g, { alpha: 0, y: g.y - 20 }, { duration: 260 }))
                .then(() => g.destroy())
        },
        hint(on) {
            if (on === arrow.visible) return
            hintTween?.remove()
            hintTween = undefined
            arrow.setVisible(on).setX(0)
            if (on) hintTween = scene.tweens.add({ targets: arrow, x: 14, duration: 380, yoyo: true, repeat: -1 })
        },
        rect() {
            return { x: SWITCH.x, y: SWITCH.bottom - boxW / 2 - 8, w: boxW + 40, h: boxW + 50 }
        },
        contains(x, y) {
            return Math.abs(x - SWITCH.x) <= SWITCH.hitW / 2 && Math.abs(y - SWITCH.y) <= SWITCH.hitH / 2
        },
        destroy() {
            hintTween?.remove()
            container.destroy()
        },
    }
}
