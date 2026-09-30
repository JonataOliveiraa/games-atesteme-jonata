import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_CELL, PIECE_SIZE, PIECES } from '../data/files'
import { DEPTH, DEVICE, GIFT, PRESENT_HIT } from '../data/layout'
import { C, PARTY } from '../data/theme'
import type { DeviceId, Point, Rect } from '../types'
import type { Audio } from './audio'
import { createDeviceView, type DeviceView } from './device'

export type PresentState = 'none' | 'closed' | 'open'

export interface Present {
    readonly state: PresentState
    readonly rect: Rect
    readonly device: DeviceView | null
    deliver(from: Point): Promise<void>
    placeClosed(): void
    open(device: DeviceId): Promise<void>
    placeOpen(device: DeviceId): void
    perform(): Promise<void>
    stop(): void
    flyTo(to: Point, scale: number): Promise<void>
    flyBack(): Promise<void>
    vanish(): Promise<void>
    clear(): Promise<void>
    onTap(cb: () => void): void
    destroy(): void
}

const GIFT_SCALE = GIFT.size / PIECE_SIZE

export function createPresent(scene: Phaser.Scene, audio: Audio): Present {
    const gift = scene.add
        .image(GIFT.x, GIFT.y, PIECES, PIECE_CELL.gift)
        .setScale(GIFT_SCALE)
        .setDepth(DEPTH.present)
        .setVisible(false)
    let state: PresentState = 'none'
    let device: DeviceView | null = null
    let wobble: Phaser.Time.TimerEvent | undefined
    let tap: () => void = () => undefined

    const zone = scene.add
        .zone(PRESENT_HIT.x, PRESENT_HIT.y, PRESENT_HIT.w, PRESENT_HIT.h)
        .setDepth(60)
        .setInteractive({ useHandCursor: true })
    zone.on('pointerdown', () => {
        if (state !== 'none') tap()
    })

    const stopWobble = () => {
        wobble?.remove()
        wobble = undefined
        scene.tweens.killTweensOf(gift)
        gift.setAngle(0).setScale(GIFT_SCALE).setPosition(GIFT.x, GIFT.y)
    }

    const startWobble = () => {
        stopWobble()
        wobble = scene.time.addEvent({
            delay: 1800,
            loop: true,
            callback: () => {
                if (state === 'closed') void FX.to(scene, gift, { angle: 7 }, { duration: 90, yoyo: true, repeat: 2 })
            },
        })
    }

    const dropDevice = () => {
        device?.destroy()
        device = null
    }

    const makeDevice = (id: DeviceId) => {
        dropDevice()
        device = createDeviceView(scene, id, audio)
        device.container.setPosition(DEVICE.x, DEVICE.y).setDepth(DEPTH.present)
        return device
    }

    const burst = () => {
        const colors = [C.coral, C.turquoise, ...PARTY]
        for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2
            const bit = scene.add
                .rectangle(GIFT.x, GIFT.y, Phaser.Math.Between(10, 16), Phaser.Math.Between(6, 10), colors[i % colors.length])
                .setDepth(DEPTH.flying)
                .setAngle(Phaser.Math.Between(0, 180))
            const reach = Phaser.Math.Between(90, 150)
            scene.tweens.add({
                targets: bit,
                x: GIFT.x + Math.cos(a) * reach,
                y: GIFT.y + Math.sin(a) * reach + 30,
                angle: bit.angle + 240,
                alpha: 0,
                duration: 650,
                ease: 'Quad.easeOut',
                onComplete: () => bit.destroy(),
            })
        }
    }

    return {
        get state() {
            return state
        },
        get rect() {
            return state === 'open'
                ? { x: DEVICE.x, y: DEVICE.y, w: DEVICE.size + 10, h: DEVICE.size + 10 }
                : { x: GIFT.x, y: GIFT.y - 6, w: GIFT.size * 0.72, h: GIFT.size * 0.66 }
        },
        get device() {
            return device
        },
        async deliver(from) {
            dropDevice()
            stopWobble()
            state = 'none'
            gift.setVisible(true).setAlpha(1).setPosition(from.x, from.y).setScale(GIFT_SCALE * 0.3)
            await FX.to(scene, gift, { x: from.x + 30, y: from.y + 6, scale: GIFT_SCALE * 0.8 }, { duration: 240, ease: 'Back.easeOut' })
            void FX.to(scene, gift, { angle: 360 }, { duration: 700 })
            void FX.to(scene, gift, { scale: GIFT_SCALE }, { duration: 700 })
            await FX.arcTo(scene, gift, { x: GIFT.x, y: GIFT.y }, { height: 120, duration: 700 })
            gift.setAngle(0)
            audio.toc()
            await FX.impact(scene, gift, 0.18)
            state = 'closed'
            startWobble()
        },
        placeClosed() {
            dropDevice()
            gift.setVisible(true).setAlpha(1)
            state = 'closed'
            startWobble()
        },
        async open(id) {
            stopWobble()
            state = 'none'
            await FX.to(scene, gift, { scale: GIFT_SCALE * 1.15 }, { duration: 160, ease: 'Quad.easeOut' })
            audio.pof()
            burst()
            void FX.sparks(scene, GIFT.x, GIFT.y, { color: C.gold, count: 16, spread: 160, depth: DEPTH.flying })
            gift.setVisible(false)
            const view = makeDevice(id)
            await FX.popIn(scene, view.container, { from: 0.3, duration: 360 })
            state = 'open'
        },
        placeOpen(id) {
            stopWobble()
            gift.setVisible(false)
            makeDevice(id)
            state = 'open'
        },
        perform() {
            return device ? device.perform() : Promise.resolve()
        },
        stop() {
            device?.stop()
        },
        async flyTo(to, scale) {
            if (!device) return
            device.stop()
            device.container.setDepth(DEPTH.flying)
            audio.fiu()
            await Promise.all([
                FX.arcTo(scene, device.container, to, { height: 170, duration: 720 }),
                FX.to(scene, device.container, { scale }, { duration: 720 }),
            ])
        },
        async flyBack() {
            if (!device) return
            device.stop()
            audio.fiu()
            await Promise.all([
                FX.arcTo(scene, device.container, { x: DEVICE.x, y: DEVICE.y }, { height: 140, duration: 620 }),
                FX.to(scene, device.container, { scale: 1 }, { duration: 620 }),
            ])
            device?.container.setDepth(DEPTH.present)
        },
        async vanish() {
            if (!device) return
            device.stop()
            await FX.to(scene, device.container, { scale: device.container.scale * 0.2, alpha: 0 }, { duration: 320 })
            dropDevice()
            state = 'none'
        },
        async clear() {
            stopWobble()
            state = 'none'
            const targets = [gift, ...(device ? [device.container] : [])]
            await FX.to(scene, targets, { alpha: 0 }, { duration: 220 })
            dropDevice()
            gift.setVisible(false).setAlpha(1)
        },
        onTap(cb) {
            tap = cb
        },
        destroy() {
            stopWobble()
            dropDevice()
            zone.destroy()
            gift.destroy()
        },
    }
}
