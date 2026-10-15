import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HAND } from '../data/files'
import { DEPTH, PHONE, SCREEN, STATUS } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { T } from '../data/timing'
import type { Rect } from '../types'
import { paintImage } from './art'

export interface Phone {
    setClock(value: string): void
    clock(): string
    swap<T extends { layer: Phaser.GameObjects.Container; dark: boolean; destroy(): void }>(make: () => T): Promise<T>
    current(): { destroy(): void } | null
    screenRect(): Rect
    rect(): Rect
    powerOff(): void
    powerOn(): Promise<void>
    nudge(): Promise<void>
    showHand(on: boolean): void
    destroy(): void
}

export function createPhone(scene: Phaser.Scene, clockValue: string): Phone {
    const left = PHONE.cx - PHONE.w / 2
    const layer = (key: string, depth: number) =>
        scene.add.image(PHONE.artX, PHONE.artY, key).setOrigin(0, 0).setScale(PHONE.scale).setDepth(depth)

    const shadow = paintImage(scene, PHONE.w, PHONE.h, g => {
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(0, 0, PHONE.w, PHONE.h, 44)
    })
        .setPosition(left + 12, PHONE.top + 14)
        .setDepth(DEPTH.phone - 2)
    const palm = layer(HAND.back, DEPTH.phone - 1)
    const case_ = layer(HAND.body, DEPTH.phone)
    const hand = layer(HAND.front, DEPTH.hand)

    const status = scene.add.container(SCREEN.x, SCREEN.y).setDepth(DEPTH.screenUi)
    const time = scene.add
        .text(22, STATUS.h / 2 + 2, clockValue, { fontFamily: FONT.black, fontSize: `${SIZE.status}px`, color: CSS.status })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const drawIcons = (ink: number) => (icons: Phaser.GameObjects.Graphics) => {
        const y = STATUS.h / 2 + 2
        const right = SCREEN.w - 22
        icons.lineStyle(2, ink, 1)
        icons.strokeRoundedRect(right - 26, y - 7, 24, 14, 4)
        icons.fillStyle(ink, 1)
        icons.fillRoundedRect(right - 23, y - 4, 16, 8, 2)
        icons.fillRect(right - 1, y - 3, 3, 6)
        for (let k = 0; k < 4; k++) icons.fillRoundedRect(right - 72 + k * 6, y + 6 - (k + 1) * 3.5, 4, (k + 1) * 3.5, 1)
        icons.beginPath()
        icons.arc(right - 40, y + 6, 12, Phaser.Math.DegToRad(225), Phaser.Math.DegToRad(315), false)
        icons.strokePath()
        icons.beginPath()
        icons.arc(right - 40, y + 6, 7, Phaser.Math.DegToRad(225), Phaser.Math.DegToRad(315), false)
        icons.strokePath()
        icons.fillCircle(right - 40, y + 5, 2)
    }
    const lightIcons = paintImage(scene, SCREEN.w, STATUS.h, drawIcons(C.statusInk))
    const darkIcons = paintImage(scene, SCREEN.w, STATUS.h, drawIcons(C.white))
    status.add([time, lightIcons, darkIcons])
    let dark = false
    const paintIcons = () => {
        lightIcons.setVisible(!dark)
        darkIcons.setVisible(dark)
        time.setColor(dark ? CSS.white : CSS.status)
    }
    paintIcons()

    const off = paintImage(scene, SCREEN.w, SCREEN.h, g => {
        g.fillStyle(C.screenOff, 1)
        g.fillRoundedRect(0, 0, SCREEN.w, SCREEN.h, SCREEN.r)
    })
        .setPosition(SCREEN.x, SCREEN.y)
        .setDepth(DEPTH.screenUi + 1)
        .setAlpha(0)

    let screen: { layer: Phaser.GameObjects.Container; dark: boolean; destroy(): void } | null = null
    let clock = clockValue
    let fade: Phaser.Tweens.Tween | null = null

    return {
        setClock(value) {
            clock = value
            time.setText(value)
        },
        clock: () => clock,
        async swap(make) {
            const old = screen
            const next = make()
            screen = next
            dark = next.dark
            paintIcons()
            next.layer.setAlpha(0)
            if (old) old.layer.setDepth(DEPTH.screen - 0.5)
            next.layer.setPosition(SCREEN.x, SCREEN.y + 14)
            await FX.to(scene, next.layer, { alpha: 1, y: SCREEN.y }, { duration: T.swap })
            old?.destroy()
            return next
        },
        current: () => screen,
        screenRect: () => ({ x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2, w: SCREEN.w, h: SCREEN.h }),
        rect: () => ({ x: PHONE.cx, y: PHONE.top + PHONE.h / 2, w: PHONE.w + 20, h: PHONE.h + 10 }),
        powerOff() {
            off.setAlpha(1)
            status.setAlpha(0)
        },
        async powerOn() {
            await FX.to(scene, off, { alpha: 0 }, { duration: 500 })
            await FX.to(scene, status, { alpha: 1 }, { duration: 200 })
        },
        async nudge() {
            const parts: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Container> = [palm, case_, hand, status]
            if (screen) parts.push(screen.layer)
            const xs = parts.map(p => p.x)
            await FX.to(scene, parts, { x: '+=4' }, { duration: 45, yoyo: true, repeat: 3 })
            parts.forEach((p, i) => p.active && p.setX(xs[i]))
        },
        showHand(on) {
            fade?.stop()
            fade = scene.tweens.add({ targets: [palm, hand], alpha: on ? 1 : 0, duration: T.lean, ease: 'Sine.easeInOut' })
        },
        destroy() {
            screen?.destroy()
            screen = null
            off.destroy()
            status.destroy()
            hand.destroy()
            palm.destroy()
            case_.destroy()
            shadow.destroy()
        },
    }
}
