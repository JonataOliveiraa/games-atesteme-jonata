import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ITEMS } from '../data/files'
import { DEPTH, FLIGHT, H, W } from '../data/layout'
import { PAINT } from '../data/theme'
import type { ItemView } from './tray'

export interface FlightTarget {
    x: number
    y: number
    scale: number
    depth: number
}

export async function throwInto(scene: Phaser.Scene, view: ItemView, to: FlightTarget): Promise<void> {
    const item = view.container
    const cam = scene.cameras.main
    const from = { x: item.x, y: item.y, scale: item.scale, rotation: item.rotation }
    const control = {
        x: (from.x + to.x) / 2,
        y: Math.min(from.y, to.y) - FLIGHT.arcLift,
    }
    const turns = Math.PI * 2 * FLIGHT.turns
    const focus = { x: from.x, y: from.y }
    const ghosts = new Set<Phaser.GameObjects.GameObject>()

    item.setDepth(DEPTH.carried)
    cam.setBounds(0, 0, W, H)
    cam.startFollow(focus, false, FLIGHT.follow, FLIGHT.follow)
    cam.zoomTo(FLIGHT.zoom, FLIGHT.zoomMs, 'Sine.easeOut')

    const leaveGhost = () => {
        const ghost = scene.textures.exists(ITEMS)
            ? scene.add.image(item.x, item.y, ITEMS, view.def.cell).setScale(item.scale * (120 / 256))
            : scene.add.circle(item.x, item.y, 40 * item.scale, PAINT[view.def.color])
        if (ghost instanceof Phaser.GameObjects.Image && view.def.tray === 'shapes') ghost.setTint(PAINT[view.def.color])
        ghost.setRotation(item.rotation).setAlpha(0.35).setDepth(DEPTH.carried - 1)
        ghosts.add(ghost)
        scene.tweens.add({
            targets: ghost,
            alpha: 0,
            scale: ghost.scale * 0.8,
            duration: 240,
            onComplete: () => {
                ghosts.delete(ghost)
                ghost.destroy()
            },
        })
    }

    let lastGhost = 0
    const state = { t: 0 }
    await new Promise<void>(resolve =>
        scene.tweens.add({
            targets: state,
            t: 1,
            duration: FLIGHT.ms,
            ease: 'Sine.easeIn',
            onUpdate: () => {
                const t = state.t
                const u = 1 - t
                item.x = u * u * from.x + 2 * u * t * control.x + t * t * to.x
                item.y = u * u * from.y + 2 * u * t * control.y + t * t * to.y
                item.setScale(Phaser.Math.Linear(from.scale, to.scale, t))
                item.setRotation(from.rotation + turns * t)
                if (t > FLIGHT.behindAt) item.setDepth(to.depth)
                focus.x = item.x
                focus.y = item.y
                if (scene.time.now - lastGhost > FLIGHT.ghostMs && t < 0.95) {
                    lastGhost = scene.time.now
                    leaveGhost()
                }
            },
            onComplete: () => resolve(),
        }),
    )
    item.setRotation(0).setPosition(to.x, to.y).setScale(to.scale).setDepth(to.depth)

    await FX.wait(scene, FLIGHT.holdMs)
    cam.stopFollow()
    cam.pan(W / 2, H / 2, FLIGHT.backMs, 'Sine.easeInOut')
    cam.zoomTo(1, FLIGHT.backMs, 'Sine.easeInOut')
    await FX.wait(scene, FLIGHT.backMs + 20)
    cam.setZoom(1)
    cam.centerOn(W / 2, H / 2)
    cam.removeBounds()
    ghosts.forEach(g => g.destroy())
}
