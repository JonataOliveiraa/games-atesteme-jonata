import Phaser from 'phaser'
import { CAMERA, H, W } from '../data/layout'
import type { Rect, Vec } from '../types'

export interface View {
    world<T extends Phaser.GameObjects.GameObject>(obj: T): T
    update(delta: number, target: Vec): void
    snap(target: Vec): void
    close(on: boolean, at: Vec): Promise<void>
    zoomTo(z: number): Promise<void>
    toScreen(x: number, y: number): Vec
    toScreenRect(r: Rect): Rect
    destroy(): void
}

export function createView(scene: Phaser.Scene, worldW: number, worldH: number): View {
    const main = scene.cameras.main
    const ui = scene.cameras.add(0, 0, W, H)
    ui.setName('ui')

    const toUi = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter |= main.id
    }
    const onAdded = (obj: Phaser.GameObjects.GameObject) => toUi(obj)
    scene.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
    scene.children.list.forEach(toUi)

    const center = { x: W / 2, y: H / 2 }
    let zoom = 1
    let locked = false
    let tween: Phaser.Tweens.Tween | undefined
    let done: (() => void) | undefined

    const clampCenter = (x: number, y: number) => {
        const hw = W / (2 * zoom)
        const hh = H / (2 * zoom)
        return { x: Phaser.Math.Clamp(x, hw, worldW - hw), y: Phaser.Math.Clamp(y, hh, worldH - hh) }
    }
    const apply = () => {
        main.setZoom(zoom)
        const c = clampCenter(center.x, center.y)
        main.setScroll(c.x - W / 2, c.y - H / 2)
    }
    const left = () => clampCenter(center.x, center.y).x - W / (2 * zoom)
    const top = () => clampCenter(center.x, center.y).y - H / (2 * zoom)

    const view: View = {
        world(obj) {
            obj.cameraFilter = ui.id
            return obj
        },
        update(delta, target) {
            if (!locked) {
                const ease = 1 - Math.exp(-delta / CAMERA.follow)
                center.x += (target.x - center.x) * ease
                center.y += (target.y + CAMERA.biasY - center.y) * ease
            }
            apply()
        },
        snap(target) {
            center.x = target.x
            center.y = target.y + CAMERA.biasY
            apply()
        },
        close(on, at) {
            tween?.stop()
            done?.()
            locked = true
            const from = { x: center.x, y: center.y, z: zoom }
            const to = on ? { x: at.x, y: at.y, z: CAMERA.closeZoom } : { x: at.x, y: at.y + CAMERA.biasY, z: 1 }
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
                    duration: CAMERA.closeMs,
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
        zoomTo(z) {
            tween?.stop()
            done?.()
            const from = zoom
            const k = { t: 0 }
            return new Promise<void>(resolve => {
                const finish = () => {
                    done = undefined
                    resolve()
                }
                done = finish
                tween = scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: 420,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        zoom = Phaser.Math.Linear(from, z, k.t)
                    },
                    onComplete: finish,
                    onStop: finish,
                })
            })
        },
        toScreen(x, y) {
            return { x: (x - left()) * zoom, y: (y - top()) * zoom }
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
