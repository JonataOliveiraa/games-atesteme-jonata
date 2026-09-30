import Phaser from 'phaser'
import { H, W } from '../data/layout'

export interface Shot {
    x: number
    y: number
    zoom: number
}

export const WIDE: Shot = { x: W / 2, y: H / 2, zoom: 1 }

export function framed(shot: Shot): Shot {
    const halfW = W / 2 / shot.zoom
    const halfH = H / 2 / shot.zoom
    return {
        x: Phaser.Math.Clamp(shot.x, halfW, W - halfW),
        y: Phaser.Math.Clamp(shot.y, halfH, H - halfH),
        zoom: shot.zoom,
    }
}

export function resetCamera(scene: Phaser.Scene) {
    const cam = scene.cameras.main
    scene.tweens.killTweensOf(cam)
    cam.setBounds(0, 0, W, H)
    cam.setZoom(1)
    cam.centerOn(W / 2, H / 2)
}

export interface UiCamera {
    own(objects: Phaser.GameObjects.GameObject[]): void
    destroy(): void
}

export function createUiCamera(scene: Phaser.Scene): UiCamera {
    const ui = scene.cameras.add(0, 0, W, H)
    const skip = (obj: Phaser.GameObjects.GameObject) => ui.ignore(obj)
    scene.children.list.forEach(skip)
    scene.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, skip)

    const own = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter &= ~ui.id
        scene.cameras.main.ignore(obj)
        if (obj instanceof Phaser.GameObjects.Container) obj.list.forEach(own)
    }

    return {
        own(objects) {
            objects.forEach(own)
        },
        destroy() {
            scene.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, skip)
            scene.cameras.remove(ui)
        },
    }
}

export function moveCamera(scene: Phaser.Scene, from: Shot, to: Shot, ms: number): Promise<void> {
    const cam = scene.cameras.main
    const a = framed(from)
    const b = framed(to)
    const p = { k: 0 }
    return new Promise(resolve =>
        scene.tweens.add({
            targets: p,
            k: 1,
            duration: ms,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                cam.setZoom(Phaser.Math.Linear(a.zoom, b.zoom, p.k))
                cam.centerOn(Phaser.Math.Linear(a.x, b.x, p.k), Phaser.Math.Linear(a.y, b.y, p.k))
            },
            onComplete: () => resolve(),
            onStop: () => resolve(),
        }),
    )
}
