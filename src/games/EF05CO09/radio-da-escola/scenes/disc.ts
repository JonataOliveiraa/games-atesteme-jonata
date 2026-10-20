import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, DISC } from '../data/layout'
import { TIMING } from '../data/timing'
import type { Vec } from '../types'
import { discKey } from './art'

export interface Disc {
    fly(cover: number, from: Vec, size: number): Promise<void>
    spin(on: boolean): void
    jam(): Promise<void>
    eject(): Promise<void>
    clear(): void
    destroy(): void
}

export function createDisc(scene: Phaser.Scene): Disc {
    let img: Phaser.GameObjects.Image | undefined
    let turn: Phaser.Tweens.Tween | undefined

    const stopSpin = () => {
        turn?.stop()
        turn = undefined
    }

    const disc: Disc = {
        async fly(cover, from, size) {
            disc.clear()
            const it = scene.add.image(from.x, from.y, discKey(scene, cover)).setDepth(DEPTH.flyer)
            it.setDisplaySize(size, size)
            img = it
            await FX.all(
                FX.arcTo(scene, it, { x: DISC.x, y: DISC.y }, { height: 120, duration: TIMING.discFly }),
                FX.to(scene, it, { scale: DISC.size / it.width }, { duration: TIMING.discFly }),
            )
            if (img !== it) return
            it.setDepth(DEPTH.disc)
        },
        spin(on) {
            stopSpin()
            if (!on || !img) return
            img.setAngle(0)
            turn = scene.tweens.add({ targets: img, angle: 360, duration: DISC.spin, repeat: -1, ease: 'Linear' })
        },
        async jam() {
            stopSpin()
            if (!img) return
            const it = img
            const a = it.angle
            await FX.to(scene, it, { angle: a + 16 }, { duration: 60, yoyo: true, repeat: 3 })
            if (it.active) it.setAngle(a + 6).setTint(0x9a90b8)
            await FX.shake(scene, it, { amount: 6, times: 3 })
        },
        async eject() {
            stopSpin()
            if (!img) return
            const it = img
            img = undefined
            await FX.to(scene, it, { scale: it.scale * 0.2, alpha: 0, angle: it.angle + 180 }, { duration: TIMING.eject })
            it.destroy()
        },
        clear() {
            stopSpin()
            img?.destroy()
            img = undefined
        },
        destroy() {
            disc.clear()
        },
    }
    return disc
}
