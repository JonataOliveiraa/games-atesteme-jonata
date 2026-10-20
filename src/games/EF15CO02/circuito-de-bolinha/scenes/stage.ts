import Phaser from 'phaser'
import { DEPTH, STAGE } from '../data/layout'
import { TIMING } from '../data/timing'
import type { Rect, Vec } from '../types'

export interface Stage {
    readonly root: Phaser.GameObjects.Container
    add<T extends Phaser.GameObjects.GameObject & { setDepth(d: number): T }>(obj: T, depth: number): T
    sort(): void
    close(at: Vec, ms?: number): Promise<void>
    open(ms?: number): Promise<void>
    toScreen(x: number, y: number): Vec
    toScreenRect(r: Rect): Rect
    destroy(): void
}

export function createStage(scene: Phaser.Scene): Stage {
    const root = scene.add.container(0, 0).setDepth(DEPTH.stage)
    let tween: Phaser.Tweens.Tween | undefined
    let done: (() => void) | undefined
    let dirty = false

    const stop = () => {
        tween?.stop()
        tween = undefined
        const d = done
        done = undefined
        d?.()
    }

    const go = (to: { x: number; y: number; s: number }, ms: number) => {
        stop()
        const from = { x: root.x, y: root.y, s: root.scale }
        const t = { v: 0 }
        return new Promise<void>(resolve => {
            done = resolve
            tween = scene.tweens.add({
                targets: t,
                v: 1,
                duration: ms,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    root.setPosition(Phaser.Math.Linear(from.x, to.x, t.v), Phaser.Math.Linear(from.y, to.y, t.v))
                    root.setScale(Phaser.Math.Linear(from.s, to.s, t.v))
                },
                onComplete: () => {
                    root.setPosition(to.x, to.y).setScale(to.s)
                    tween = undefined
                    const d = done
                    done = undefined
                    d?.()
                },
            })
        })
    }

    const stage: Stage = {
        root,
        add(obj, depth) {
            obj.setDepth(depth)
            root.add(obj)
            dirty = true
            return obj
        },
        sort() {
            if (!dirty) return
            dirty = false
            root.sort('depth')
        },
        close(at, ms = TIMING.lean) {
            const s = STAGE.closeZoom
            return go({ x: STAGE.closeAt.x - at.x * s, y: STAGE.closeAt.y - at.y * s, s }, ms)
        },
        open(ms = TIMING.lean) {
            return go({ x: 0, y: 0, s: 1 }, ms)
        },
        toScreen(x, y) {
            return { x: root.x + x * root.scale, y: root.y + y * root.scale }
        },
        toScreenRect(r) {
            const p = stage.toScreen(r.x, r.y)
            return { x: p.x, y: p.y, w: r.w * root.scale, h: r.h * root.scale }
        },
        destroy() {
            stop()
            root.destroy()
        },
    }
    return stage
}
