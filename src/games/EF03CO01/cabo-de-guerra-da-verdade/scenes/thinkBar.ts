import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, THINK } from '../data/layout'
import { C } from '../data/theme'

export interface ThinkBarOptions {
    onFull: () => void
}

export function createThinkBar(scene: Phaser.Scene, options: ThinkBarOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.cards)

    const track = scene.add.graphics()
    track.fillStyle(C.ink, 0.22)
    track.fillRoundedRect(THINK.x, THINK.y, THINK.w, THINK.h, THINK.h / 2)

    const fill = scene.add.graphics()
    root.add([track, fill])

    let elapsed = 0
    let limit = 0
    let running = false

    const paint = () => {
        const ratio = limit ? Phaser.Math.Clamp(elapsed / limit, 0, 1) : 0
        fill.clear()
        if (ratio <= 0) return
        fill.fillStyle(C.robotDark, 1)
        fill.fillRoundedRect(THINK.x, THINK.y, THINK.w * ratio, THINK.h, THINK.h / 2)
        fill.fillStyle(C.robot, 1)
        fill.fillRoundedRect(THINK.x, THINK.y, THINK.w * ratio, THINK.h - 5, THINK.h / 2)
    }

    return {
        start(seconds: number) {
            limit = seconds * 1000
            elapsed = 0
            running = true
            paint()
        },

        stop() {
            running = false
            elapsed = 0
            paint()
        },

        pause() {
            running = false
        },

        resume() {
            running = limit > 0
        },

        tick(delta: number) {
            if (!running || !limit) return
            elapsed += delta
            paint()
            if (elapsed < limit) return
            elapsed = 0
            void FX.to(scene, fill, { alpha: 0.3 }, { duration: 120, yoyo: true })
            options.onFull()
        },

        destroy() {
            scene.tweens.killTweensOf(fill)
            root.destroy(true)
        },
    }
}

export type ThinkBar = ReturnType<typeof createThinkBar>
