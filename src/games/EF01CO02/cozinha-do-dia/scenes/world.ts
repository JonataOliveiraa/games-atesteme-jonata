import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { COUNTER_KEY, WALL_KEY } from '../data/files'
import { CLOSE, COUNTER, DEPTH, H, W } from '../data/layout'
import { TIMING } from '../data/timing'
import type { Rect } from '../types'

export interface World {
    readonly clients: Phaser.GameObjects.Container
    close(): void
    open(): Promise<void>
    toScreen(rect: Rect): Rect
    destroy(): void
}

export function createWorld(scene: Phaser.Scene): World {
    const wall = scene.add.image(0, 0, WALL_KEY).setOrigin(0, 0).setDisplaySize(W, H)
    const clients = scene.add.container(0, 0)
    const counter = scene.add.image(0, COUNTER.y, COUNTER_KEY).setOrigin(0, 0)
    counter.setDisplaySize(W, (H - COUNTER.y) * (counter.height / 335))
    const layer = scene.add.container(0, 0, [wall, clients, counter]).setDepth(DEPTH.world)

    return {
        clients,
        close() {
            scene.tweens.killTweensOf(layer)
            layer.setScale(CLOSE.scale).setPosition(CLOSE.x, CLOSE.y)
        },
        async open() {
            await FX.to(scene, layer, { scale: 1, x: 0, y: 0 }, { duration: TIMING.close, ease: 'Sine.easeInOut' })
        },
        toScreen(rect) {
            return {
                x: rect.x * layer.scale + layer.x,
                y: rect.y * layer.scale + layer.y,
                w: rect.w * layer.scale,
                h: rect.h * layer.scale,
            }
        },
        destroy() {
            layer.destroy()
        },
    }
}
