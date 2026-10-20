import Phaser from 'phaser'
import { CAMERA, DEPTH } from '../data/layout'
import { TIMING } from '../data/timing'
import type { Rect, Vec } from '../types'

export interface View {
    readonly root: Phaser.GameObjects.Container
    add<T extends Phaser.GameObjects.GameObject & { setDepth(d: number): T }>(obj: T, depth: number): T
    restack(): void
    sort(): void
    close(at: Vec, ms?: number): Promise<void>
    open(ms?: number): Promise<void>
    reset(): void
    toScreen(x: number, y: number): Vec
    toScreenRect(r: Rect): Rect
    destroy(): void
}

export function createView(scene: Phaser.Scene): View {
    const root = scene.add.container(0, 0).setDepth(DEPTH.world)
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

    const view: View = {
        root,
        add(obj, depth) {
            obj.setDepth(depth)
            root.add(obj)
            dirty = true
            return obj
        },
        restack() {
            dirty = true
        },
        sort() {
            if (!dirty) return
            dirty = false
            root.sort('depth')
        },
        close(at, ms = TIMING.lean) {
            const s = CAMERA.zoom
            return go({ x: CAMERA.at.x - at.x * s, y: CAMERA.at.y - at.y * s, s }, ms)
        },
        open(ms = TIMING.lean) {
            return go({ x: 0, y: 0, s: 1 }, ms)
        },
        reset() {
            stop()
            root.setPosition(0, 0).setScale(1)
        },
        toScreen(x, y) {
            return { x: root.x + x * root.scale, y: root.y + y * root.scale }
        },
        toScreenRect(r) {
            const p = view.toScreen(r.x, r.y)
            return { x: p.x, y: p.y, w: r.w * root.scale, h: r.h * root.scale }
        },
        destroy() {
            stop()
            root.destroy()
        },
    }
    return view
}
