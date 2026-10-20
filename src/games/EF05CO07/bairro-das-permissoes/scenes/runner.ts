import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { KID_FOOT, KID_FRAME, cellKey } from '../data/files'
import { DEPTH, FENCE, KID, RUN } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Solid, Vec } from '../types'
import { sortDepth } from './town'
import type { View } from './view'

export interface Step {
    bumped: number
    stride: boolean
    skidding: boolean
}

export interface Runner {
    readonly at: Vec
    readonly speed: number
    steer(dir: Vec | null): void
    update(dt: number, solids: Solid[]): Step
    brake(): void
    stop(): void
    place(at: Vec): void
    visible(on: boolean): void
    drop(): Promise<void>
    cheer(): void
    destroy(): void
}

type Facing = 'down' | 'up' | 'side'

export function createRunner(scene: Phaser.Scene, view: View, start: Vec, world: { w: number; h: number }): Runner {
    const pos = { ...start }
    const vel = { x: 0, y: 0 }
    let want: Vec | null = null
    let braking = false
    let facing: Facing = 'down'
    let flip = false
    let travelled = 0
    let lastStride = 0
    let dustClock = 0

    const shadow = view.world(scene.add.ellipse(pos.x, pos.y, KID.shadowW, KID.shadowH, C.shade, 0.22).setDepth(DEPTH.shade + 0.6))
    const sprite = view.world(
        scene.add
            .image(pos.x, pos.y, 'crianca', cellKey(KID_FRAME.idle.down))
            .setOrigin(0.5, KID_FOOT)
            .setDisplaySize(KID.size, KID.size)
            .setDepth(sortDepth(pos.y)),
    )
    const base = sprite.scaleX

    const minX = FENCE.inset + RUN.radius + 8
    const minY = FENCE.inset + RUN.radius + 8
    const maxX = world.w - minX
    const maxY = world.h - minY

    const collide = (solids: Solid[]): number => {
        let hit = 0
        solids.forEach(s => {
            let nx = 0
            let ny = 0
            let depth = 0
            if (s.kind === 'circle') {
                const dx = pos.x - s.x
                const dy = pos.y - s.y
                const d = Math.hypot(dx, dy)
                const reach = s.r + RUN.radius
                if (d >= reach) return
                nx = d ? dx / d : 0
                ny = d ? dy / d : 1
                depth = reach - d
            } else {
                const cx = Phaser.Math.Clamp(pos.x, s.x - s.w / 2, s.x + s.w / 2)
                const cy = Phaser.Math.Clamp(pos.y, s.y - s.h / 2, s.y + s.h / 2)
                const dx = pos.x - cx
                const dy = pos.y - cy
                const d = Math.hypot(dx, dy)
                if (d >= RUN.radius) return
                if (d > 0) {
                    nx = dx / d
                    ny = dy / d
                    depth = RUN.radius - d
                } else {
                    const left = pos.x - (s.x - s.w / 2)
                    const right = s.x + s.w / 2 - pos.x
                    const upper = pos.y - (s.y - s.h / 2)
                    const lower = s.y + s.h / 2 - pos.y
                    const m = Math.min(left, right, upper, lower)
                    if (m === lower) ny = 1
                    else if (m === upper) ny = -1
                    else if (m === left) nx = -1
                    else nx = 1
                    depth = m + RUN.radius
                }
            }
            pos.x += nx * depth
            pos.y += ny * depth
            const into = vel.x * nx + vel.y * ny
            if (into < 0) {
                vel.x -= (1 + RUN.bounce) * into * nx
                vel.y -= (1 + RUN.bounce) * into * ny
                hit = Math.max(hit, -into)
            }
        })
        if (pos.x < minX || pos.x > maxX) {
            hit = Math.max(hit, Math.abs(vel.x))
            vel.x = -vel.x * RUN.bounce
            pos.x = Phaser.Math.Clamp(pos.x, minX, maxX)
        }
        if (pos.y < minY || pos.y > maxY) {
            hit = Math.max(hit, Math.abs(vel.y))
            vel.y = -vel.y * RUN.bounce
            pos.y = Phaser.Math.Clamp(pos.y, minY, maxY)
        }
        return hit
    }

    const dust = () => {
        const p = view.world(scene.add.circle(pos.x - Math.sign(vel.x || 1) * 16, pos.y - 4, Phaser.Math.Between(8, 13), C.dust, 0.9).setDepth(DEPTH.shade + 0.7))
        scene.tweens.add({ targets: p, scale: 2, alpha: 0, y: p.y - 14, duration: 460, onComplete: () => p.destroy() })
    }

    const paint = (speed: number, skidding: boolean) => {
        if (Math.abs(vel.x) > Math.abs(vel.y) * 1.1 && speed > RUN.idleSpeed) {
            facing = 'side'
            flip = vel.x < 0
        } else if (speed > RUN.idleSpeed) {
            facing = vel.y < 0 ? 'up' : 'down'
        }
        let frame: number
        if (skidding && facing === 'side') frame = KID_FRAME.skid
        else if (speed <= RUN.idleSpeed || (!want && speed < RUN.skidSpeed)) frame = KID_FRAME.idle[facing]
        else frame = KID_FRAME.run[facing] + (Math.floor(travelled / RUN.stride) % 4)
        sprite.setFrame(cellKey(frame)).setFlipX(flip)
        sprite.setPosition(pos.x, pos.y).setDepth(sortDepth(pos.y))
        shadow.setPosition(pos.x, pos.y)
    }

    const runner: Runner = {
        get at() {
            return { ...pos }
        },
        get speed() {
            return Math.hypot(vel.x, vel.y)
        },
        steer(dir) {
            want = dir
            if (dir) braking = false
        },
        update(dt, solids) {
            const s = dt / 1000
            if (want && !braking) {
                vel.x += want.x * RUN.accel * s
                vel.y += want.y * RUN.accel * s
            }
            const k = braking ? RUN.brake : want ? RUN.drag : RUN.glide
            const keep = Math.exp(-k * s)
            vel.x *= keep
            vel.y *= keep
            let speed = Math.hypot(vel.x, vel.y)
            if (speed > RUN.maxSpeed) {
                vel.x *= RUN.maxSpeed / speed
                vel.y *= RUN.maxSpeed / speed
                speed = RUN.maxSpeed
            }
            if (speed < 4 && !want) {
                vel.x = 0
                vel.y = 0
                speed = 0
            }
            pos.x += vel.x * s
            pos.y += vel.y * s
            travelled += speed * s
            const bumped = collide(solids)
            speed = Math.hypot(vel.x, vel.y)
            const turning = want ? vel.x * want.x + vel.y * want.y < speed * 0.55 : false
            const skidding = speed > RUN.skidSpeed && (!want || turning || braking)
            dustClock += dt
            if (skidding && dustClock > TIMING.dust) {
                dustClock = 0
                dust()
            }
            const strideNow = Math.floor(travelled / RUN.stride)
            const stride = strideNow !== lastStride && speed > RUN.skidSpeed && Boolean(want)
            lastStride = strideNow
            if (bumped > 120) {
                scene.tweens.killTweensOf(sprite)
                sprite.setScale(base)
                scene.tweens.add({ targets: sprite, scaleX: base * 1.18, scaleY: base * 0.84, duration: 90, yoyo: true })
            }
            paint(speed, skidding)
            return { bumped, stride, skidding }
        },
        brake() {
            braking = true
            want = null
        },
        stop() {
            vel.x = 0
            vel.y = 0
            want = null
            braking = false
            paint(0, false)
        },
        place(at) {
            pos.x = at.x
            pos.y = at.y
            runner.stop()
        },
        visible(on) {
            sprite.setVisible(on)
            shadow.setVisible(on)
        },
        async drop() {
            runner.visible(true)
            sprite.setPosition(pos.x, pos.y - 260).setAlpha(0)
            await FX.to(scene, sprite, { y: pos.y, alpha: 1 }, { duration: 420, ease: 'Quad.easeIn' })
            scene.tweens.add({ targets: sprite, scaleX: base * 1.2, scaleY: base * 0.8, duration: 110, yoyo: true })
            paint(0, false)
        },
        cheer() {
            facing = 'down'
            flip = false
            sprite.setFrame(cellKey(KID_FRAME.run.down)).setFlipX(false)
            scene.tweens.killTweensOf(sprite)
            sprite.setScale(base)
            const y = sprite.y
            scene.tweens.add({
                targets: sprite,
                y: y - 36,
                duration: 200,
                yoyo: true,
                repeat: 1,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    sprite.setY(y)
                    paint(0, false)
                },
            })
        },
        destroy() {
            scene.tweens.killTweensOf(sprite)
            sprite.destroy()
            shadow.destroy()
        },
    }
    paint(0, false)
    return runner
}
