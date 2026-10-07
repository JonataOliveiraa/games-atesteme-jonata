import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG } from '../data/files'
import { BELT, DEPTH, FUNNEL, VIEW } from '../data/layout'
import { C } from '../data/theme'

export interface Factory {
    setOffset(offset: number): void
    shake(): Promise<void>
    shakeFunnel(): void
    destroy(): void
}

export function createFactory(scene: Phaser.Scene): Factory {
    const bg = scene.add.image(VIEW.x, VIEW.y, BG).setOrigin(0).setScale(VIEW.scale).setDepth(DEPTH.bg)
    const marks = scene.add.graphics().setDepth(DEPTH.belt + 1)

    const setOffset = (offset: number) => {
        marks.clear()
        marks.lineStyle(3, C.slat, 0.55)
        const shift = ((offset % BELT.slat) + BELT.slat) % BELT.slat
        for (let x = BELT.left + 22 + shift; x < BELT.right - 22; x += BELT.slat) {
            marks.lineBetween(x, BELT.top + 3, x, BELT.top + BELT.h - 3)
        }
        const angle = offset / (BELT.hubR * 2.2)
        marks.lineStyle(3, C.ink, 0.8)
        BELT.hubs.forEach(hub => {
            for (let i = 0; i < 2; i++) {
                const a = angle + i * Math.PI
                marks.lineBetween(hub.x, hub.y, hub.x + Math.cos(a) * BELT.hubR, hub.y + Math.sin(a) * BELT.hubR)
            }
        })
    }
    setOffset(0)

    return {
        setOffset,
        async shake() {
            scene.cameras.main.shake(320, 0.004)
            await FX.wait(scene, 320)
        },
        shakeFunnel() {
            const puff = scene.add.graphics({ x: FUNNEL.x, y: FUNNEL.mouth + 6 }).setDepth(DEPTH.fx)
            puff.fillStyle(C.dough, 0.9)
            puff.fillCircle(-8, 0, 7)
            puff.fillCircle(8, 2, 6)
            void FX.to(scene, puff, { y: puff.y + 14, alpha: 0, scale: 1.4 }, { duration: 320 }).then(() => puff.destroy())
        },
        destroy() {
            marks.destroy()
            bg.destroy()
        },
    }
}
