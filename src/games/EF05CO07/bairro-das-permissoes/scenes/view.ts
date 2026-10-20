import Phaser from 'phaser'
import { H, VIEW, W } from '../data/layout'
import type { Vec } from '../types'

export interface View {
    readonly zoom: number
    world<T extends Phaser.GameObjects.GameObject>(obj: T): T
    follow(at: Vec, delta: number): void
    jump(at: Vec): void
    zoomTo(at: Vec, zoom: number, ms: number): Promise<void>
    center(): Vec
    toScreen(at: Vec): Vec
    toWorld(x: number, y: number): Vec
    inView(at: Vec, pad?: number): boolean
    onMap(x: number, y: number): boolean
    destroy(): void
}

export function createView(scene: Phaser.Scene, size: { w: number; h: number }, home: Vec): View {
    const main = scene.cameras.main
    main.setViewport(VIEW.x, VIEW.y, VIEW.w, VIEW.h)
    const ui = scene.cameras.add(0, 0, W, H)
    ui.setName('ui')

    const toUi = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter |= main.id
    }
    const onAdded = (obj: Phaser.GameObjects.GameObject) => toUi(obj)
    scene.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
    scene.children.list.forEach(toUi)

    const intoWorld = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter = ui.id
        if (obj instanceof Phaser.GameObjects.Container) obj.list.forEach(intoWorld)
    }

    const center = { x: home.x, y: home.y }
    let zoom = 1
    let tween: Phaser.Tweens.Tween | undefined

    const fit = (c: number, half: number, len: number) =>
        half * 2 >= len ? Phaser.Math.Clamp(c, len - half, half) : Phaser.Math.Clamp(c, half, len - half)
    const clamp = () => {
        center.x = fit(center.x, VIEW.w / (2 * zoom), size.w)
        center.y = fit(center.y, VIEW.h / (2 * zoom), size.h)
    }
    const apply = () => {
        clamp()
        main.setZoom(zoom)
        main.setScroll(center.x - VIEW.w / 2, center.y - VIEW.h / 2)
    }

    const view: View = {
        get zoom() {
            return zoom
        },
        world(obj) {
            intoWorld(obj)
            return obj
        },
        follow(at, delta) {
            const k = 1 - Math.exp(-delta / VIEW.follow)
            center.x += (at.x - center.x) * k
            center.y += (at.y - center.y) * k
            apply()
        },
        jump(at) {
            tween?.stop()
            center.x = at.x
            center.y = at.y
            apply()
        },
        zoomTo(at, to, ms) {
            tween?.stop()
            const from = { x: center.x, y: center.y, z: zoom }
            const k = { t: 0 }
            return new Promise<void>(resolve => {
                tween = scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: ms,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        zoom = Phaser.Math.Linear(from.z, to, k.t)
                        center.x = Phaser.Math.Linear(from.x, at.x, k.t)
                        center.y = Phaser.Math.Linear(from.y, at.y, k.t)
                        apply()
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
        },
        center: () => ({ ...center }),
        toScreen: at => ({
            x: VIEW.x + VIEW.w / 2 + (at.x - center.x) * zoom,
            y: VIEW.y + VIEW.h / 2 + (at.y - center.y) * zoom,
        }),
        toWorld: (x, y) => ({
            x: center.x + (x - VIEW.x - VIEW.w / 2) / zoom,
            y: center.y + (y - VIEW.y - VIEW.h / 2) / zoom,
        }),
        inView(at, pad = 0) {
            const s = view.toScreen(at)
            return s.x > VIEW.x + pad && s.x < VIEW.x + VIEW.w - pad && s.y > VIEW.y + VIEW.top + pad && s.y < VIEW.y + VIEW.h - pad
        },
        onMap: (x, y) => x >= VIEW.x && x <= VIEW.x + VIEW.w && y >= VIEW.y && y <= VIEW.y + VIEW.h,
        destroy() {
            tween?.stop()
            scene.sys.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
            scene.cameras.remove(ui)
            main.setViewport(0, 0, W, H).setZoom(1).setScroll(0, 0)
        },
    }
    apply()
    return view
}
