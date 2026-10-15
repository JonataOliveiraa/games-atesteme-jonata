import Phaser from 'phaser'
import { CAMERA, H, W } from '../data/layout'
import type { Rect, Vec } from '../types'

export interface View {
    readonly zoom: number
    world<T extends Phaser.GameObjects.GameObject>(obj: T): T
    update(delta: number, x: number): void
    snap(x: number): void
    lean(on: boolean, at: Vec, lookZoom?: number): Promise<void>
    toScreen(x: number, y: number): Vec
    toScreenRect(r: Rect): Rect
    destroy(): void
}

export function createView(scene: Phaser.Scene, worldW: number, baseZoom: number, baseY: number): View {
    const main = scene.cameras.main
    const ui = scene.cameras.add(0, 0, W, H)
    ui.setName('ui')

    const toUi = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter |= main.id
    }
    const onAdded = (obj: Phaser.GameObjects.GameObject) => toUi(obj)
    scene.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
    scene.children.list.forEach(toUi)

    const center = { x: W / 2, y: baseY }
    let zoom = baseZoom
    let locked = false
    let tween: Phaser.Tweens.Tween | undefined
    let done: (() => void) | undefined

    const clampX = (x: number) => {
        const hw = W / (2 * zoom)
        if (worldW <= hw * 2) return worldW / 2
        return Phaser.Math.Clamp(x, hw, worldW - hw)
    }
    const apply = () => {
        main.setZoom(zoom)
        main.centerOn(clampX(center.x), center.y)
    }

    const view: View = {
        get zoom() {
            return zoom
        },
        world(obj) {
            obj.cameraFilter = ui.id
            return obj
        },
        update(delta, x) {
            if (!locked) {
                const ease = 1 - Math.exp(-delta / CAMERA.follow)
                center.x += (x - center.x) * ease
            }
            apply()
        },
        snap(x) {
            center.x = x
            apply()
        },
        lean(on, at, lookZoom = CAMERA.lookMin) {
            tween?.stop()
            done?.()
            locked = true
            const from = { x: clampX(center.x), y: center.y, z: zoom }
            const to = on ? { x: at.x, y: at.y, z: lookZoom } : { x: at.x, y: baseY, z: baseZoom }
            const k = { t: 0 }
            return new Promise<void>(resolve => {
                const finish = () => {
                    done = undefined
                    locked = on
                    resolve()
                }
                done = finish
                tween = scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: CAMERA.lookMs,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        zoom = Phaser.Math.Linear(from.z, to.z, k.t)
                        center.x = Phaser.Math.Linear(from.x, to.x, k.t)
                        center.y = Phaser.Math.Linear(from.y, to.y, k.t)
                        apply()
                    },
                    onComplete: finish,
                    onStop: finish,
                })
            })
        },
        toScreen(x, y) {
            const left = clampX(center.x) - W / (2 * zoom)
            const top = center.y - H / (2 * zoom)
            return { x: (x - left) * zoom, y: (y - top) * zoom }
        },
        toScreenRect(r) {
            const pt = view.toScreen(r.x, r.y)
            return { x: pt.x, y: pt.y, w: r.w * zoom, h: r.h * zoom }
        },
        destroy() {
            tween?.stop()
            done?.()
            scene.sys.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
            scene.cameras.remove(ui)
            main.setZoom(1).setScroll(0, 0)
        },
    }
    apply()
    return view
}
