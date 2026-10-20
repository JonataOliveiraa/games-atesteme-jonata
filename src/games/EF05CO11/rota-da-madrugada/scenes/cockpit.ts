import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICES } from '../data/devices'
import { DASH_KEY, ICON_CELL, WHEEL_KEY, cellKey } from '../data/files'
import { CONSOLE, DASH, DEPTH, GLASS, HEADER, SIGNAL, W, WHEEL } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { DeviceId, Rect, Vec } from '../types'
import { KEY_FACE, KEY_FACE_NARROW, KEY_FACE_NARROW_ON, KEY_FACE_ON, SCREEN_KEY } from './art'

export interface Cockpit {
    offer(free: DeviceId[] | null): void
    setOn(id: DeviceId, on: boolean): void
    isOn(id: DeviceId): boolean
    press(id: DeviceId): Promise<void>
    ring(id: DeviceId): void
    honk(): void
    keyRect(id: DeviceId): Rect
    consoleRect(): Rect
    boxOf(id: DeviceId): Phaser.GameObjects.Container
    keyCenter(id: DeviceId): Vec
    hub(): Vec
    destroy(): void
}

interface Key {
    id: DeviceId
    box: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Image
    icon: Phaser.GameObjects.Image
    label: Phaser.GameObjects.Text
    tag: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    on: boolean
    free: boolean
}

const FRAME_KEY = 'colunas'

function bakeFrame(scene: Phaser.Scene) {
    if (scene.textures.exists(FRAME_KEY)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    const h = GLASS.bottom + 10
    g.fillStyle(C.pillar, 1)
    g.fillPoints(
        [
            { x: 0, y: HEADER.h },
            { x: 54, y: HEADER.h },
            { x: 118, y: h },
            { x: 0, y: h },
        ],
        true,
    )
    g.fillPoints(
        [
            { x: W - 54, y: HEADER.h },
            { x: W, y: HEADER.h },
            { x: W, y: h },
            { x: W - 118, y: h },
        ],
        true,
    )
    g.fillStyle(C.pillar, 1)
    g.fillRoundedRect(W / 2 - 6, HEADER.h, 12, 18, 4)
    g.fillRoundedRect(W / 2 - 96, HEADER.h + 14, 192, 40, 16)
    g.fillStyle(0x4b5f8c, 1)
    g.fillRoundedRect(W / 2 - 86, HEADER.h + 20, 172, 28, 12)
    g.generateTexture(FRAME_KEY, W, h)
    g.destroy()
}

export function createCockpit(scene: Phaser.Scene, devices: DeviceId[], narrow: boolean, onPick: (id: DeviceId) => void): Cockpit {
    const keyW = narrow ? SIGNAL.keyW : CONSOLE.keyW
    const gap = narrow ? SIGNAL.gap : CONSOLE.gap
    const area = CONSOLE.w - (narrow ? SIGNAL.reserve : 0)
    const faceOff = narrow ? KEY_FACE_NARROW : KEY_FACE
    const faceOn = narrow ? KEY_FACE_NARROW_ON : KEY_FACE_ON
    bakeFrame(scene)
    const frame = scene.add.image(0, 0, FRAME_KEY).setOrigin(0).setDepth(DEPTH.pillar)
    const dash = scene.add.image(0, DASH.y, DASH_KEY).setOrigin(0).setDepth(DEPTH.dash)
    const wheel = scene.add.image(WHEEL.x, WHEEL.y, WHEEL_KEY).setDepth(DEPTH.wheel)
    wheel.setScale(WHEEL.size / wheel.width)
    const wheelScale = wheel.scale
    const screen = scene.add.image(CONSOLE.x, CONSOLE.y, SCREEN_KEY).setOrigin(0).setDepth(DEPTH.console)

    const centerX = (i: number) => CONSOLE.x + (area - (devices.length * keyW + (devices.length - 1) * gap)) / 2 + keyW / 2 + i * (keyW + gap)

    const keys: Key[] = devices.map((id, i) => {
        const x = centerX(i)
        const face = scene.add.image(0, 4, faceOff)
        const icon = scene.add.image(0, CONSOLE.iconY, ICON_CELL[id].sheet.key, cellKey(ICON_CELL[id].cell))
        icon.setScale(CONSOLE.iconSize / icon.height)
        const label = scene.add
            .text(0, CONSOLE.labelY, DEVICES[id].label, { fontFamily: FONT.black, fontSize: `${SIZE.key}px`, color: CSS.key })
            .setOrigin(0.5)
            .setResolution(2)
        if (label.width > keyW - 16) label.setScale((keyW - 16) / label.width)
        const tagText = scene.add
            .text(0, 0, LABEL.on, { fontFamily: FONT.black, fontSize: `${SIZE.keyTag}px`, color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2)
        const tagBg = scene.add.graphics()
        const tw = tagText.width + 22
        tagBg.fillStyle(C.yesDark, 1)
        tagBg.fillRoundedRect(-tw / 2, -13 + 3, tw, 26, 13)
        tagBg.fillStyle(C.yes, 1)
        tagBg.fillRoundedRect(-tw / 2, -13, tw, 26, 13)
        const tag = scene.add.container(0, -CONSOLE.keyH / 2 - 4, [tagBg, tagText]).setVisible(false)
        const box = scene.add.container(x, CONSOLE.keyY, [face, icon, label, tag]).setDepth(DEPTH.key)
        const zone = scene.add
            .zone(x, CONSOLE.keyY, keyW, CONSOLE.keyH + 8)
            .setDepth(DEPTH.key + 1)
            .setInteractive({ useHandCursor: true })
        const key: Key = { id, box, face, icon, label, tag, zone, on: false, free: false }
        zone.on('pointerdown', () => {
            if (!key.free || key.on) return
            onPick(id)
        })
        zone.on('pointerover', () => {
            if (key.free && !key.on) face.setTint(0xdde8ff)
        })
        zone.on('pointerout', () => face.clearTint())
        return key
    })

    const paint = (key: Key) => {
        key.face.setTexture(key.on ? faceOn : faceOff)
        key.label.setColor(key.on ? CSS.keyOn : CSS.key)
        key.icon.setTint(key.on ? 0x6a4a00 : 0xffffff)
        key.tag.setVisible(key.on)
        key.box.setAlpha(key.on || key.free ? 1 : 0.55)
        if (key.zone.input) key.zone.input.enabled = key.free && !key.on
        if (!key.free || key.on) key.face.clearTint()
    }
    keys.forEach(paint)

    const find = (id: DeviceId) => keys.find(k => k.id === id)!

    const onKey = (event: KeyboardEvent) => {
        const slot = Number(event.key) - 1
        const key = keys[slot]
        if (!key || !key.free || key.on) return
        onPick(key.id)
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        offer(free) {
            keys.forEach(k => {
                k.free = !!free && free.includes(k.id)
                paint(k)
            })
        },
        setOn(id, on) {
            const key = find(id)
            key.on = on
            paint(key)
            if (on) void FX.popIn(scene, key.tag, { from: 0.4, duration: 260 })
        },
        isOn: id => find(id).on,
        async press(id) {
            const key = find(id)
            scene.tweens.killTweensOf(key.box)
            key.box.setScale(1)
            await FX.to(scene, key.box, { scale: 0.9, y: CONSOLE.keyY + 6 }, { duration: 90, yoyo: true })
            key.box.setScale(1).setY(CONSOLE.keyY)
        },
        ring(id) {
            const key = find(id)
            const ring = scene.add.graphics().setDepth(DEPTH.key + 2)
            ring.lineStyle(8, C.pulse, 1)
            ring.strokeRoundedRect(-keyW / 2 - 8, -CONSOLE.keyH / 2 - 8, keyW + 16, CONSOLE.keyH + 24, 28)
            ring.setPosition(key.box.x, CONSOLE.keyY + 4)
            scene.tweens.add({ targets: ring, alpha: 0.2, duration: 320, yoyo: true, repeat: 2, onComplete: () => ring.destroy() })
        },
        honk() {
            scene.tweens.killTweensOf(wheel)
            wheel.setScale(wheelScale)
            scene.tweens.add({ targets: wheel, scale: wheelScale * 1.05, duration: 90, yoyo: true, repeat: 1 })
            const ring = scene.add.circle(WHEEL.x, WHEEL.y - 6, WHEEL.hubR).setDepth(DEPTH.wheel + 1)
            ring.setStrokeStyle(7, C.pulse, 1)
            scene.tweens.add({ targets: ring, scale: 1.8, alpha: 0, duration: 480, onComplete: () => ring.destroy() })
        },
        keyRect(id) {
            const key = find(id)
            return { x: key.box.x, y: CONSOLE.keyY + 4, w: keyW + 16, h: CONSOLE.keyH + 24 }
        },
        consoleRect: () => ({ x: CONSOLE.x + CONSOLE.w / 2, y: CONSOLE.y + CONSOLE.h / 2, w: CONSOLE.w + 20, h: CONSOLE.h + 20 }),
        boxOf: id => find(id).box,
        keyCenter: id => ({ x: find(id).box.x, y: CONSOLE.keyY }),
        hub: () => ({ x: WHEEL.x, y: WHEEL.y - 6 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            keys.forEach(k => {
                scene.tweens.killTweensOf(k.box)
                k.zone.destroy()
                k.box.destroy()
            })
            scene.tweens.killTweensOf(wheel)
            screen.destroy()
            wheel.destroy()
            dash.destroy()
            frame.destroy()
        },
    }
}
