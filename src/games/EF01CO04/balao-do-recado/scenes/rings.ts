import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_CELL, PIECES } from '../data/files'
import { BALLOON, DEPTH, RING, W } from '../data/layout'
import { C } from '../data/theme'
import { PEEK_EVENT } from './arrival'

export interface Rings {
    spawn(id: number, worldX: number, y: number): void
    update(worldX: number): void
    light(id: number): Promise<void>
    blink(id: number): void
    dotted(id: number, fromY: number): Promise<void>
    clear(): void
    destroy(): void
}

type Half = Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

interface RingView {
    worldX: number
    y: number
    back: Half
    front: Half
    glow: Phaser.GameObjects.Graphics
    blink?: Phaser.Tweens.Tween
}

const RX = RING.rx * RING.scale
const RY = RING.ry * RING.scale
const GLOW_DY = (RING.outlineY - RING.holeY) * RING.scale

function half(scene: Phaser.Scene, left: boolean): Half {
    if (scene.textures.exists(PIECES)) {
        const image = scene.add.image(0, 0, PIECES, PIECE_CELL.ring).setOrigin(0.5, RING.holeY / RING.cell).setScale(RING.scale)
        const c = RING.cell / 2
        image.setCrop(left ? 0 : c, 0, c, RING.cell)
        return image
    }
    const g = scene.add.graphics()
    const from = left ? Math.PI / 2 : -Math.PI / 2
    const to = left ? (Math.PI * 3) / 2 : Math.PI / 2
    const path = new Phaser.Curves.Ellipse(0, GLOW_DY, RX, RY, Phaser.Math.RadToDeg(from), Phaser.Math.RadToDeg(to))
    g.lineStyle(20, C.ink, 1)
    path.draw(g, 40)
    g.lineStyle(14, C.sun, 1)
    path.draw(g, 40)
    return g
}

function paintGlow(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.lineStyle(30, C.white, 0.5)
    g.strokeEllipse(0, GLOW_DY, RX * 2 + 10, RY * 2 + 10)
    g.lineStyle(12, C.sun, 0.9)
    g.strokeEllipse(0, GLOW_DY, RX * 2 + 10, RY * 2 + 10)
}

export function createRings(scene: Phaser.Scene): Rings {
    const rings = new Map<number, RingView>()
    const dots = new Set<Phaser.GameObjects.Graphics>()
    let lastWorldX = 0
    let hidden = false

    const setHidden = (on: boolean) => {
        hidden = on
        for (const view of rings.values()) {
            for (const part of [view.back, view.front]) {
                FX.kill(scene, part)
                void FX.to(scene, part, { alpha: on ? 0 : 1 }, { duration: 200 })
            }
        }
    }
    scene.events.on(PEEK_EVENT, setHidden)

    const place = (view: RingView) => {
        const x = BALLOON.x + (view.worldX - lastWorldX)
        view.back.setPosition(x, view.y)
        view.front.setPosition(x, view.y)
        view.glow.setPosition(x, view.y)
    }

    const drop = (id: number) => {
        const view = rings.get(id)
        if (!view) return
        view.blink?.remove()
        FX.kill(scene, [view.back, view.front, view.glow])
        view.back.destroy()
        view.front.destroy()
        view.glow.destroy()
        rings.delete(id)
    }

    return {
        spawn(id, worldX, y) {
            drop(id)
            const view: RingView = {
                worldX,
                y,
                back: half(scene, true).setDepth(DEPTH.ringBack).setAlpha(hidden ? 0 : 1),
                front: half(scene, false).setDepth(DEPTH.ringFront).setAlpha(hidden ? 0 : 1),
                glow: scene.add.graphics().setDepth(DEPTH.ringBack - 1).setAlpha(0),
            }
            paintGlow(view.glow)
            rings.set(id, view)
            place(view)
        },
        update(worldX) {
            lastWorldX = worldX
            for (const [id, view] of rings) {
                place(view)
                if (view.back.x < -RX * 3) drop(id)
                else if (view.back.x > W + RX * 6) {
                    view.back.setVisible(false)
                    view.front.setVisible(false)
                } else {
                    view.back.setVisible(true)
                    view.front.setVisible(true)
                }
            }
        },
        async light(id) {
            const view = rings.get(id)
            if (!view) return
            view.blink?.remove()
            view.blink = undefined
            view.back.setAlpha(1)
            view.front.setAlpha(1)
            for (const h of [view.back, view.front]) {
                if (h instanceof Phaser.GameObjects.Image) h.setTintFill(C.sun).setAlpha(0.95)
            }
            view.glow.setAlpha(1)
            void FX.sparks(scene, view.front.x, view.y, { color: C.sun, count: 16, spread: 150, depth: DEPTH.ringFront + 1 })
            await FX.to(scene, view.glow, { alpha: 0 }, { duration: RING.lightMs })
            for (const h of [view.back, view.front]) {
                if (h instanceof Phaser.GameObjects.Image && h.active) h.clearTint().setAlpha(1)
            }
        },
        blink(id) {
            const view = rings.get(id)
            if (!view || view.blink) return
            view.blink = scene.tweens.add({
                targets: view.glow,
                alpha: { from: 0, to: 0.9 },
                duration: 380,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },
        async dotted(id, fromY) {
            const view = rings.get(id)
            if (!view) return
            const g = scene.add.graphics().setDepth(DEPTH.ringFront + 1).setAlpha(0)
            const from = new Phaser.Math.Vector2(BALLOON.x + 40, fromY)
            const to = new Phaser.Math.Vector2(view.front.x, view.y)
            const count = Math.max(4, Math.round(from.distance(to) / 34))
            for (let i = 1; i <= count; i++) {
                const p = from.clone().lerp(to, i / (count + 1))
                g.fillStyle(C.ink, 0.35)
                g.fillCircle(p.x, p.y + 2, 9)
                g.fillStyle(C.white, 1)
                g.fillCircle(p.x, p.y, 8)
                g.fillStyle(C.sun, 1)
                g.fillCircle(p.x, p.y, 5)
            }
            dots.add(g)
            await FX.to(scene, g, { alpha: 1 }, { duration: 200 })
            await FX.wait(scene, RING.dottedMs - 400)
            await FX.to(scene, g, { alpha: 0 }, { duration: 200 })
            dots.delete(g)
            g.destroy()
        },
        clear() {
            ;[...rings.keys()].forEach(drop)
            dots.forEach(g => g.destroy())
            dots.clear()
        },
        destroy() {
            scene.events.off(PEEK_EVENT, setHidden)
            ;[...rings.keys()].forEach(drop)
            dots.forEach(g => g.destroy())
            dots.clear()
        },
    }
}
