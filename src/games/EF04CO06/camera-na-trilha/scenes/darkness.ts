import Phaser from 'phaser'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'
import type { Circle, MapDef } from '../types'
import type { View } from './view'

export interface Darkness {
    readonly part: Phaser.GameObjects.GameObject
    update(lights: Circle[]): void
    destroy(): void
}

const SCALE = 8
const BRUSH = 'cnt-soft'
const BRUSH_SIZE = 128

function ensureBrush(scene: Phaser.Scene) {
    if (scene.textures.exists(BRUSH)) return
    const canvas = scene.textures.createCanvas(BRUSH, BRUSH_SIZE, BRUSH_SIZE)
    if (!canvas) return
    const ctx = canvas.getContext()
    const half = BRUSH_SIZE / 2
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.5, 'rgba(255,255,255,0.9)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, BRUSH_SIZE, BRUSH_SIZE)
    canvas.refresh()
}

export function createDarkness(scene: Phaser.Scene, view: View, map: MapDef): Darkness | null {
    const dark = map.dark
    if (!dark) return null
    ensureBrush(scene)
    const rw = Math.ceil(W / SCALE)
    const rh = Math.ceil(H / SCALE)
    const rt = view.world(scene.add.renderTexture(0, 0, rw, rh).setOrigin(0, 0).setDepth(DEPTH.dark))
    const brush = scene.make.image({ key: BRUSH }, false)

    return {
        part: rt,
        update(lights) {
            const wv = scene.cameras.main.worldView
            const kx = wv.width / rw
            const ky = wv.height / rh
            rt.setPosition(wv.x, wv.y).setScale(kx, ky)
            rt.clear()
            if (dark.areas) {
                brush.setTint(C.night).setAlpha(dark.alpha)
                dark.areas.forEach(a => {
                    brush.setScale((a.rx * 2.5) / kx / BRUSH_SIZE, (a.ry * 2.5) / ky / BRUSH_SIZE)
                    rt.draw(brush, (a.x - wv.x) / kx, (a.y - wv.y) / ky)
                })
                brush.clearTint().setAlpha(1)
            } else rt.fill(C.night, dark.alpha)
            lights.forEach(l => {
                brush.setScale((l.r * 2.4) / kx / BRUSH_SIZE, (l.r * 2.4) / ky / BRUSH_SIZE)
                rt.erase(brush, (l.x - wv.x) / kx, (l.y - wv.y) / ky)
            })
        },
        destroy() {
            brush.destroy()
            rt.destroy()
        },
    }
}
