import Phaser from 'phaser'
import { CAMERA, DEPTH, STEP } from '../data/layout'
import { TIMING } from '../data/timing'
import type { Rect, Vec } from '../types'

export interface View {
    readonly root: Phaser.GameObjects.Container
    add<T extends Phaser.GameObjects.GameObject & { setDepth(d: number): T }>(obj: T, depth: number): T
    restack(): void
    sort(): void
    readonly k: number
    setK(k: number): void
    scrollTo(k: number, ms?: number): Promise<void>
    close(at: Vec, ms?: number): Promise<void>
    open(ms?: number): Promise<void>
    toScreen(x: number, y: number): Vec
    toScreenRect(r: Rect): Rect
    destroy(): void
}

export function createView(scene: Phaser.Scene): View {
    const root = scene.add.container(0, 0).setDepth(DEPTH.world)
    let k = 0
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

    const go = (to: { x: number; y: number; s: number }, ms: number, ease = 'Sine.easeInOut') => {
        stop()
        const from = { x: root.x, y: root.y, s: root.scale }
        const t = { v: 0 }
        return new Promise<void>(resolve => {
            done = resolve
            tween = scene.tweens.add({
                targets: t,
                v: 1,
                duration: ms,
                ease,
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
        get k() {
            return k
        },
        setK(next) {
            stop()
            k = next
            root.setPosition(-STEP * k, 0).setScale(1)
        },
        scrollTo(next, ms = TIMING.scroll) {
            k = next
            return go({ x: -STEP * k, y: 0, s: 1 }, ms)
        },
        close(at, ms = TIMING.lean) {
            const s = CAMERA.closeZoom
            return go({ x: CAMERA.closeAt.x - at.x * s, y: CAMERA.closeAt.y - at.y * s, s }, ms)
        },
        open(ms = TIMING.lean) {
            return go({ x: -STEP * k, y: 0, s: 1 }, ms)
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
