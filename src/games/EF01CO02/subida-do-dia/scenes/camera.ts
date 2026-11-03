import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { H, W, WORLD } from '../data/layout'
import type { Rect } from '../types'

export interface Cam {
    setTop(top: number): void
    set(y: number, zoom?: number, x?: number): void
    look(y: number, ms: number, zoom?: number, x?: number): Promise<void>
    screenY(worldY: number): number
    screenRect(r: Rect): Rect
    stop(): void
}

export function createCam(scene: Phaser.Scene): Cam {
    const cam = scene.cameras.main
    let top = 0
    let cx = W / 2
    let cy = WORLD.h - H / 2
    let zoom = 1
    let tween: Phaser.Tweens.Tween | undefined
    let settle: (() => void) | undefined

    const clamp = (x: number, y: number, z: number) => {
        const hw = W / 2 / z
        const hh = H / 2 / z
        return {
            x: Phaser.Math.Clamp(x, hw, W - hw),
            y: Phaser.Math.Clamp(y, top + hh, WORLD.h - hh),
        }
    }

    const apply = () => {
        const p = clamp(cx, cy, zoom)
        cam.setZoom(zoom)
        cam.centerOn(p.x, p.y)
    }

    const stop = () => {
        tween?.remove()
        tween = undefined
        const done = settle
        settle = undefined
        done?.()
    }

    cam.removeBounds()
    apply()

    return {
        setTop(next) {
            top = Math.max(0, next)
            apply()
        },
        set(y, z = 1, x = W / 2) {
            stop()
            zoom = z
            const p = clamp(x, y, z)
            cx = p.x
            cy = p.y
            apply()
        },
        look(y, ms, z = 1, x = W / 2) {
            stop()
            const from = { x: cx, y: cy, z: zoom }
            const to = clamp(x, y, z)
            return new Promise<void>(resolve => {
                settle = resolve
                tween = scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onUpdate: t => {
                        const k = t.getValue() ?? 0
                        zoom = Phaser.Math.Linear(from.z, z, k)
                        cx = Phaser.Math.Linear(from.x, to.x, k)
                        cy = Phaser.Math.Linear(from.y, to.y, k)
                        apply()
                    },
                    onComplete: () => {
                        tween = undefined
                        zoom = z
                        cx = to.x
                        cy = to.y
                        apply()
                        const done = settle
                        settle = undefined
                        done?.()
                    },
                })
            })
        },
        screenY(worldY) {
            const p = clamp(cx, cy, 1)
            return worldY - (p.y - H / 2)
        },
        screenRect(r) {
            const p = clamp(cx, cy, 1)
            return { x: r.x, y: r.y - (p.y - H / 2), w: r.w, h: r.h }
        },
        stop,
    }
}
