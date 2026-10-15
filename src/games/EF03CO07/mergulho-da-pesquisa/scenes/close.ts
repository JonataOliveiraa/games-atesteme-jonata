import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { H, W, WORLD } from '../data/layout'

export interface Shot {
    x: number
    y: number
    zoom: number
}

type Fading = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.AlphaSingle & Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Depth

const onScreen = (o: Phaser.GameObjects.GameObject) => (o as unknown as Phaser.GameObjects.Components.ScrollFactor).scrollFactorX === 0

export function framed(shot: Shot): Shot {
    const halfW = W / 2 / shot.zoom
    const halfH = H / 2 / shot.zoom
    return {
        x: Phaser.Math.Clamp(shot.x, halfW, WORLD.w - halfW),
        y: Phaser.Math.Clamp(shot.y, halfH, WORLD.h - halfH),
        zoom: shot.zoom,
    }
}

export function moveCamera(scene: Phaser.Scene, to: Shot, ms: number): Promise<void> {
    const cam = scene.cameras.main
    cam.stopFollow()
    scene.tweens.killTweensOf(cam)
    const a = framed({ x: cam.scrollX + W / 2, y: cam.scrollY + H / 2, zoom: cam.zoom })
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

export function resetCamera(scene: Phaser.Scene) {
    const cam = scene.cameras.main
    scene.tweens.killTweensOf(cam)
    cam.setZoom(1)
}

export async function hideScreen(scene: Phaser.Scene, ms = 260): Promise<() => Promise<void>> {
    const items = scene.children.list.filter(o => onScreen(o) && !(o instanceof Phaser.GameObjects.Zone) && (o as Fading).alpha > 0) as Fading[]
    const before = items.map(o => o.alpha)
    await FX.all(...items.map(o => FX.to(scene, o, { alpha: 0 }, { duration: ms })))
    return async () => {
        await FX.all(...items.map((o, i) => (o.active ? FX.to(scene, o, { alpha: before[i] }, { duration: ms }) : Promise.resolve())))
    }
}
