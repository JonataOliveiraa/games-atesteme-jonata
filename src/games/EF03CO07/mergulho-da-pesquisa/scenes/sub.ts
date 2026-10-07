import Phaser from 'phaser'
import { SUB_FRAME, SUBS } from '../data/files'
import { DEPTH, FLOOR, SUB, SURFACE, WORLD } from '../data/layout'
import { SUB_RADIUS } from '../data/maps'
import type { Vec } from '../types'

export interface Sub {
    readonly sprite: Phaser.GameObjects.Sprite
    reset(): void
    step(dt: number, stick: Vec, boosting: boolean): void
    stop(): void
    bounce(from: Vec): void
    at(): Vec
    moved(): number
    destroy(): void
}

export type Push = (x: number, y: number, r: number) => Vec

export function createSub(scene: Phaser.Scene, push: Push, skin: keyof typeof SUB_FRAME = 'yellow'): Sub {
    const frames = SUB_FRAME[skin]
    const sprite = scene.add.sprite(SUB.start.x, SUB.start.y, SUBS, frames.idle).setScale(SUB.scale).setDepth(DEPTH.sub)
    const vel = { x: 0, y: 0 }
    let travelled = 0

    return {
        sprite,
        reset() {
            scene.tweens.killTweensOf(sprite)
            vel.x = 0
            vel.y = 0
            travelled = 0
            sprite.setPosition(SUB.start.x, SUB.start.y).setFrame(frames.idle).setFlipX(false).setAngle(0).setAlpha(1).setScale(SUB.scale)
        },
        step(dt, stick, boosting) {
            const max = SUB.speed * (boosting ? SUB.boost : 1)
            const k = Math.min(1, dt * SUB.steer)
            vel.x += (stick.x * max - vel.x) * k
            vel.y += (stick.y * max - vel.y) * k
            const free = push(sprite.x + vel.x * dt, sprite.y + vel.y * dt, SUB_RADIUS)
            const x = Phaser.Math.Clamp(free.x, 60, WORLD.w - 60)
            const y = Phaser.Math.Clamp(free.y, SURFACE + 40, FLOOR - 40)
            const cx = free.x - (sprite.x + vel.x * dt)
            const cy = free.y - (sprite.y + vel.y * dt)
            const c = Math.hypot(cx, cy)
            if (c > 0.01) {
                const into = (vel.x * cx + vel.y * cy) / c
                if (into < 0) {
                    vel.x -= (into * cx) / c
                    vel.y -= (into * cy) / c
                }
            }
            travelled += Math.hypot(x - sprite.x, y - sprite.y)
            sprite.setPosition(x, y)
            const speed = Math.hypot(vel.x, vel.y)
            sprite.setFrame(speed > 30 ? frames.move : frames.idle)
            if (Math.abs(vel.x) > 20) sprite.setFlipX(vel.x < 0)
            sprite.setAngle(Phaser.Math.Clamp((vel.y / SUB.speed) * 12 * (sprite.flipX ? -1 : 1), -14, 14))
        },
        stop() {
            vel.x = 0
            vel.y = 0
            sprite.setFrame(frames.idle).setAngle(0)
        },
        bounce(from) {
            const a = Math.atan2(sprite.y - from.y, sprite.x - from.x)
            vel.x = Math.cos(a) * 220
            vel.y = Math.sin(a) * 220
        },
        at() {
            return { x: sprite.x, y: sprite.y }
        },
        moved() {
            return travelled
        },
        destroy() {
            scene.tweens.killTweensOf(sprite)
            sprite.destroy()
        },
    }
}
