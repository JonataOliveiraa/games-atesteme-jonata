import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICE_ART, DEVICE_CELL, DEVICE_CELL_SIZE, DEVICES, PIECE_CELL, PIECE_SIZE, PIECES, TABLET_SCREEN } from '../data/files'
import { DEVICE } from '../data/layout'
import { C, PARTY } from '../data/theme'
import type { DeviceId } from '../types'
import type { Audio } from './audio'
import { note, rr } from './paint'

export interface DeviceView {
    readonly container: Phaser.GameObjects.Container
    readonly id: DeviceId
    readonly performing: boolean
    perform(): Promise<void>
    stop(): void
    destroy(): void
}

const ART_SCALE = DEVICE.size / 300

export function deviceScale(): number {
    return ART_SCALE
}

export function createDeviceView(scene: Phaser.Scene, id: DeviceId, audio: Audio): DeviceView {
    const image = scene.add.image(0, 0, DEVICES, DEVICE_CELL[DEVICE_ART[id]]).setScale(ART_SCALE)
    const container = scene.add.container(0, 0, [image])
    const fx: Phaser.GameObjects.GameObject[] = []
    const signature: Phaser.GameObjects.GameObject[] = []
    let token = 0
    let running: Promise<void> | null = null

    const half = (DEVICE_CELL_SIZE * ART_SCALE) / 2

    const add = <T extends Phaser.GameObjects.GameObject>(obj: T, keep = false): T => {
        container.add(obj)
        ;(keep ? signature : fx).push(obj)
        return obj
    }

    const clearList = (list: Phaser.GameObjects.GameObject[]) => {
        list.forEach(obj => {
            scene.tweens.killTweensOf(obj)
            obj.destroy()
        })
        list.length = 0
    }

    const resetImage = () => {
        scene.tweens.killTweensOf(image)
        image.setAngle(0).setPosition(0, 0).setScale(ART_SCALE)
    }

    const live = (t: number) => t === token && container.active

    const wave = (side: -1 | 1, k: number) => {
        const g = add(scene.add.graphics())
        g.lineStyle(7, C.gold, 1)
        g.beginPath()
        g.arc(0, -half * 0.3, half * 0.9 + k * 22, side < 0 ? Math.PI * 0.8 : -Math.PI * 0.2, side < 0 ? Math.PI * 1.2 : Math.PI * 0.2)
        g.strokePath()
        g.setAlpha(0)
        void FX.to(scene, g, { alpha: 1 }, { duration: 120, yoyo: true, delay: k * 110 }).then(() => {
            if (g.active) g.setAlpha(0)
        })
    }

    const floatingNote = (x: number, y: number, color: number, slow: boolean) => {
        const g = add(scene.add.graphics({ x, y }))
        note(g, 0, 0, 34, color, Math.random() < 0.3)
        g.setScale(0.2)
        const rise = slow ? 130 : 90
        const drift = Phaser.Math.Between(-40, 40)
        void FX.to(scene, g, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
        void FX.to(scene, g, { y: y - rise, x: x + drift, alpha: 0 }, { duration: slow ? 1500 : 900, ease: 'Sine.easeOut', delay: 120 })
    }

    const pieceImage = (frame: number, x: number, y: number, size: number, keep: boolean) =>
        add(scene.add.image(x, y, PIECES, frame).setScale(size / PIECE_SIZE), keep)

    const acts: Record<DeviceId, (t: number) => Promise<void>> = {
        clock: async t => {
            for (let r = 0; r < 2; r++) {
                if (!live(t)) return
                audio.ring()
                for (let k = 0; k < 3; k++) {
                    wave(-1, k)
                    wave(1, k)
                }
                await FX.to(scene, image, { angle: 9 }, { duration: 45, yoyo: true, repeat: 9 })
                image.setAngle(0)
                await FX.wait(scene, 380)
            }
            if (!live(t)) return
            for (const s of [-1, 1] as const) {
                const g = add(scene.add.graphics(), true)
                g.lineStyle(6, C.gold, 1)
                for (let k = 0; k < 2; k++) {
                    g.beginPath()
                    g.arc(0, -half * 0.3, half * 0.9 + k * 20, s < 0 ? Math.PI * 0.85 : -Math.PI * 0.15, s < 0 ? Math.PI * 1.15 : Math.PI * 0.15)
                    g.strokePath()
                }
            }
        },
        lullaby: async t => {
            audio.lullaby()
            const moon = pieceImage(PIECE_CELL.notesLullaby, -half * 0.95, -half * 0.9, 120, true)
            void FX.popIn(scene, moon, { from: 0.3 })
            void FX.to(scene, image, { angle: 4 }, { duration: 600, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' })
            for (let k = 0; k < 4; k++) {
                if (!live(t)) return
                floatingNote(half * 0.5, -half * 0.5, C.lilacDark, true)
                await FX.wait(scene, 560)
            }
            await FX.wait(scene, 400)
        },
        dance: async t => {
            audio.dance()
            const notes = pieceImage(PIECE_CELL.notesParty, half * 0.95, -half * 0.9, 120, true)
            void FX.popIn(scene, notes, { from: 0.3 })
            for (let k = 0; k < 8; k++) {
                if (!live(t)) return
                floatingNote(Phaser.Math.Between(-60, 60), -half * 0.6, PARTY[k % PARTY.length], false)
                await FX.to(scene, image, { scaleY: ART_SCALE * 0.9, scaleX: ART_SCALE * 1.06 }, { duration: 110, yoyo: true })
                image.setScale(ART_SCALE)
                await FX.wait(scene, 40)
            }
        },
        phone: async t => {
            for (let r = 0; r < 2; r++) {
                if (!live(t)) return
                audio.phoneRing()
                wave(-1, 0)
                wave(1, 0)
                await FX.to(scene, image, { y: -16 }, { duration: 80, yoyo: true, repeat: 3 })
                image.setY(0)
                await FX.wait(scene, 240)
            }
            if (!live(t)) return
            const bubble = add(scene.add.container(0, -half - 70), true)
            const bg = scene.add.graphics()
            bg.fillStyle(C.shadow, 0.15)
            bg.fillRoundedRect(-66, -62, 136, 128, 34)
            rr(bg, -70, -68, 140, 128, 34, C.white, 5)
            bg.fillStyle(C.white, 1)
            bg.fillTriangle(-16, 56, 16, 56, 0, 84)
            bg.lineStyle(5, C.ink, 1)
            bg.lineBetween(-16, 60, 0, 84)
            bg.lineBetween(16, 60, 0, 84)
            const grandma = scene.add.image(0, -4, PIECES, PIECE_CELL.grandmaFace).setScale(112 / PIECE_SIZE)
            bubble.add([bg, grandma])
            audio.plim()
            await FX.popIn(scene, bubble, { from: 0.2, duration: 420 })
            void FX.to(scene, grandma, { angle: 6 }, { duration: 260, yoyo: true, repeat: 2 })
            await FX.wait(scene, 800)
        },
        tablet: async t => {
            await cartoon(t, 3)
        },
        'tablet-call': async t => {
            const bunny = await cartoon(t, 2)
            if (!bunny || !live(t)) return
            const { sx, sy, sw, sh } = screenBox()
            await FX.to(scene, bunny, { x: sx, y: sy - sh * 0.24, scale: bunny.scale * 0.62 }, { duration: 300 })
            if (!live(t)) return
            audio.phoneRing()
            wave(-1, 0)
            wave(1, 0)
            const grandma = pieceImage(PIECE_CELL.grandmaFace, sx, sy + sh * 0.2, sw * 0.7, true)
            await FX.popIn(scene, grandma, { from: 0.2, duration: 380 })
            if (!live(t)) return
            audio.plim()
            await FX.to(scene, grandma, { angle: 6 }, { duration: 260, yoyo: true, repeat: 2 })
            await FX.wait(scene, 500)
        },
    }

    function screenBox() {
        const s = ART_SCALE
        return {
            sw: TABLET_SCREEN.w * s,
            sh: TABLET_SCREEN.h * s,
            sx: (TABLET_SCREEN.x - DEVICE_CELL_SIZE / 2) * s,
            sy: (TABLET_SCREEN.y - DEVICE_CELL_SIZE / 2) * s,
        }
    }

    async function cartoon(t: number, hops: number): Promise<Phaser.GameObjects.Image | null> {
        const { sx, sy, sw, sh } = screenBox()
        const screen = add(scene.add.graphics(), true)
        screen.fillStyle(C.screenLit, 1)
        screen.fillRoundedRect(sx - sw / 2, sy - sh / 2, sw, sh, 8)
        screen.fillStyle(C.grass, 1)
        screen.fillRoundedRect(sx - sw / 2, sy + sh / 2 - sh * 0.22, sw, sh * 0.22, { tl: 0, tr: 0, bl: 8, br: 8 })
        screen.setAlpha(0)
        await FX.to(scene, screen, { alpha: 1 }, { duration: 260 })
        if (!live(t)) return null
        const bunnyY = sy + sh * 0.12
        const bunny = pieceImage(PIECE_CELL.bunny, sx, bunnyY, sw * 0.95, true)
        void FX.popIn(scene, bunny, { from: 0.4 })
        for (let k = 0; k < hops; k++) {
            if (!live(t)) return null
            audio.boing()
            await FX.to(scene, bunny, { y: bunnyY - sh * 0.22 }, { duration: 230, yoyo: true, ease: 'Sine.easeOut' })
            await FX.wait(scene, 180)
        }
        return bunny
    }

    const view: DeviceView = {
        container,
        id,
        get performing() {
            return running !== null
        },
        perform() {
            if (running) return running
            const t = ++token
            clearList(signature)
            resetImage()
            running = acts[id](t).finally(() => {
                if (t !== token) return
                running = null
                clearList(fx)
                if (container.active) resetImage()
            })
            return running
        },
        stop() {
            token++
            running = null
            clearList(fx)
            clearList(signature)
            if (container.active) resetImage()
        },
        destroy() {
            view.stop()
            container.destroy()
        },
    }
    return view
}
