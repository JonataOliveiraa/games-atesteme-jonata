import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { CART_ART, OBJ, OBJ_CELL, OBJECTS, POUCH_ART, SLING_ART, SLING_CELL, SLING_FRAME, SLINGSHOT } from '../data/files'
import { anchor, type Flight } from '../data/flight'
import { CART, DEPTH, FLIGHT, FLOOR, LENS, SLING } from '../data/layout'
import { C } from '../data/theme'
import type { FileDef, Rect, Vec } from '../types'
import { createDataView, type DataView } from './data-art'

export interface Sling {
    load(file: FileDef, from: Vec): Promise<void>
    pull(d: Vec, flight: Flight): void
    rest(): void
    release(flight: Flight): Promise<void>
    swallow(to: Vec, keep?: boolean): Promise<void>
    fall(at: Vec): Promise<void>
    spit(from: Vec): Promise<void>
    clearTrail(): void
    cartRect(): Rect
    pullRect(): Rect
    destroy(): void
}

const WINDOW: Rect = {
    x: CART_ART.window.x - OBJ_CELL / 2,
    y: CART_ART.window.y - OBJ_CELL / 2,
    w: CART_ART.window.w * 0.88,
    h: CART_ART.window.h * 0.86,
}

const tip = (p: { x: number; y: number }): Vec => ({
    x: SLING.x + (p.x - SLING_CELL / 2) * SLING.scale,
    y: FLOOR - (SLING_ART.foot - p.y) * SLING.scale,
})

export function createSling(scene: Phaser.Scene): Sling {
    const origin = SLING_ART.foot / SLING_CELL
    scene.add.sprite(SLING.x, FLOOR, SLINGSHOT, SLING_FRAME.back).setOrigin(0.5, origin).setScale(SLING.scale).setDepth(DEPTH.slingBack)
    scene.add.sprite(SLING.x, FLOOR, SLINGSHOT, SLING_FRAME.front).setOrigin(0.5, origin).setScale(SLING.scale).setDepth(DEPTH.slingFront)
    const lens = createLens(scene)
    const back = scene.add.graphics().setDepth(DEPTH.bandBack)
    const front = scene.add.graphics().setDepth(DEPTH.bandFront)
    const dots = scene.add.graphics().setDepth(DEPTH.dots)
    const trail = scene.add.graphics().setDepth(DEPTH.trail)
    const a = anchor()
    const ownPouch = !(scene.textures.get(SLINGSHOT).customData as { fallback?: boolean }).fallback
    const pouch = ownPouch
        ? scene.add.sprite(a.x, a.y, SLINGSHOT, SLING_FRAME.pouch).setOrigin(SLING_ART.pouch.x / SLING_CELL, SLING_ART.pouch.y / SLING_CELL).setScale(SLING.scale * 0.5)
        : scene.add.sprite(a.x, a.y, OBJECTS, OBJ.pouch).setOrigin(POUCH_ART.x / OBJ_CELL, POUCH_ART.y / OBJ_CELL).setScale(0.3)
    pouch.setDepth(DEPTH.pouch)
    const tipBack = tip(SLING_ART.tipBack)
    const tipFront = tip(SLING_ART.tipFront)

    let cart: Phaser.GameObjects.Container | undefined
    let cartSprite: Phaser.GameObjects.Sprite | undefined
    let view: DataView | undefined
    let held: Vec = { ...a }

    const bands = (at: Vec | undefined) => {
        back.clear()
        front.clear()
        const p = at ?? a
        const grip = at ? 30 : 0
        const ang = Math.atan2(p.y - a.y, p.x - a.x)
        const gx = p.x + Math.cos(ang) * grip * 0.4
        const gy = p.y + Math.sin(ang) * grip * 0.4
        back.lineStyle(9, C.band, 1)
        back.lineBetween(tipBack.x, tipBack.y, gx, gy)
        front.lineStyle(10, C.band, 1)
        front.lineBetween(tipFront.x, tipFront.y, gx, gy)
        pouch.setPosition(gx, gy).setRotation(at && (at.x !== a.x || at.y !== a.y) ? ang : 0)
    }
    bands(undefined)

    const drop = () => {
        view?.destroy()
        cart?.destroy()
        cart = undefined
        cartSprite = undefined
        view = undefined
    }

    const drawDots = (flight: Flight) => {
        dots.clear()
        const pts = flight.points
        for (let i = FLIGHT.dotEvery; i < pts.length; i += FLIGHT.dotEvery) {
            const k = i / pts.length
            dots.fillStyle(C.white, 1 - k * 0.45)
            dots.fillCircle(pts[i].x, pts[i].y, 6.5 - k * 2)
            dots.lineStyle(2, C.ink, 0.55 - k * 0.3)
            dots.strokeCircle(pts[i].x, pts[i].y, 6.5 - k * 2)
        }
    }

    return {
        async load(file, from) {
            drop()
            trail.clear()
            cartSprite = scene.add.sprite(0, 0, OBJECTS, OBJ.cart)
            view = createDataView(scene)
            view.show(file.payload, 'structure', WINDOW)
            cart = scene.add.container(from.x, from.y, [cartSprite, view.container]).setScale(CART.queueScale).setDepth(DEPTH.cart)
            held = { ...a }
            await FX.all(
                FX.arcTo(scene, cart, a, { height: 110, duration: 520, ease: Ease.smooth }),
                FX.to(scene, cart, { scale: CART.slingScale }, { duration: 520, ease: Ease.back(1.6) }),
            )
            bands(a)
            lens.show(file)
        },
        pull(d, flight) {
            if (!cart) return
            held = { x: a.x + d.x, y: a.y + d.y }
            cart.setPosition(held.x, held.y)
            bands(held)
            drawDots(flight)
        },
        rest() {
            dots.clear()
            if (!cart) return
            void FX.to(scene, cart, { x: a.x, y: a.y }, { duration: 200, ease: Ease.back(2) })
            const t = { k: 0 }
            const from = { ...held }
            scene.tweens.add({
                targets: t,
                k: 1,
                duration: 200,
                onUpdate: () => bands({ x: Phaser.Math.Linear(from.x, a.x, t.k), y: Phaser.Math.Linear(from.y, a.y, t.k) }),
            })
            held = { ...a }
        },
        release(flight) {
            dots.clear()
            lens.hide()
            const c = cart
            if (!c) return Promise.resolve()
            cartSprite?.setFrame(OBJ.cartFly)
            const pts = flight.points
            const t = { k: 0 }
            const snap = { k: 0 }
            const from = { ...held }
            scene.tweens.add({
                targets: snap,
                k: 1,
                duration: 140,
                ease: Ease.back(3),
                onUpdate: () => bands({ x: Phaser.Math.Linear(from.x, a.x, snap.k), y: Phaser.Math.Linear(from.y, a.y, snap.k) }),
                onComplete: () => bands(undefined),
            })
            void FX.to(scene, c, { scale: CART.flyScale }, { duration: 260 })
            trail.clear()
            return new Promise(resolve =>
                scene.tweens.add({
                    targets: t,
                    k: 1,
                    duration: pts.length * FLIGHT.dt * 1000 * FLIGHT.timeScale,
                    ease: 'Linear',
                    onUpdate: () => {
                        const f = t.k * (pts.length - 1)
                        const i = Math.floor(f)
                        const p = pts[i]
                        const q = pts[Math.min(i + 1, pts.length - 1)]
                        const x = Phaser.Math.Linear(p.x, q.x, f - i)
                        const y = Phaser.Math.Linear(p.y, q.y, f - i)
                        c.setPosition(x, y).setRotation(Math.atan2(q.y - p.y, q.x - p.x) * 0.25)
                        if (i % FLIGHT.dotEvery === 0 && i > 0) {
                            trail.fillStyle(C.white, 0.5)
                            trail.fillCircle(x, y, 4)
                        }
                    },
                    onComplete: () => resolve(),
                }),
            )
        },
        async swallow(to, keep = false) {
            const c = cart
            if (!c) return
            await FX.to(scene, c, { x: to.x, y: to.y, scale: 0.05, rotation: 0 }, { duration: 130, ease: Ease.smooth })
            if (keep) c.setVisible(false)
            else drop()
        },
        async fall(at) {
            const c = cart
            if (!c) return
            cartSprite?.setFrame(OBJ.cart)
            const ground = FLOOR - 40
            await FX.to(scene, c, { x: at.x - 30, y: ground, rotation: -0.6 }, { duration: 320, ease: Ease.settle })
            await FX.wait(scene, 220)
            await FX.to(scene, c, { x: -120, rotation: -6, alpha: 0.8 }, { duration: 620, ease: Ease.smooth })
            drop()
        },
        async spit(from) {
            const c = cart
            if (!c) return
            cartSprite?.setFrame(OBJ.cartFly)
            c.setVisible(true).setPosition(from.x, from.y).setScale(0.1).setRotation(0)
            await FX.to(scene, c, { scale: CART.flyScale }, { duration: 120 })
            await FX.all(
                FX.arcTo(scene, c, { x: from.x - 110, y: FLOOR - 40 }, { height: 80, duration: 460 }),
                FX.to(scene, c, { rotation: -2.4 }, { duration: 460 }),
            )
            await FX.to(scene, c, { y: FLOOR - 70 }, { duration: 140, yoyo: true, ease: Ease.smooth })
        },
        clearTrail() {
            trail.clear()
        },
        cartRect() {
            const s = CART.slingScale
            const left = Math.min(LENS.x - LENS.w / 2, a.x - (CART_ART.w * s) / 2) - 8
            const right = Math.max(LENS.x + LENS.w / 2, a.x + (CART_ART.w * s) / 2) + 8
            const top = LENS.y - LENS.h / 2 - 8
            const bottom = a.y + (CART_ART.h * s) / 2 + 8
            return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
        },
        pullRect() {
            return { x: a.x - 60, y: a.y + 30, w: 420, h: 300 }
        },
        destroy() {
            drop()
            lens.destroy()
        },
    }
}

interface Lens {
    show(file: FileDef): void
    hide(): void
    destroy(): void
}

function createLens(scene: Phaser.Scene): Lens {
    const a = anchor()
    const g = scene.add.graphics()
    const { w, h } = LENS
    const tx = a.x - LENS.x
    const ty = a.y - LENS.y
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, 26)
    g.fillStyle(C.white, 1)
    g.fillTriangle(w / 2 - 70, h / 2 - 6, w / 2 - 28, h / 2 - 6, tx - 26, ty - 34)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 26)
    g.lineBetween(w / 2 - 70, h / 2, tx - 26, ty - 34)
    g.lineBetween(w / 2 - 28, h / 2, tx - 26, ty - 34)
    g.fillStyle(C.white, 1)
    g.fillRect(w / 2 - 68, h / 2 - 6, 38, 8)
    const view = createDataView(scene)
    const box = scene.add.container(LENS.x, LENS.y, [g, view.container]).setDepth(DEPTH.lens).setVisible(false)
    return {
        show(file) {
            view.show(file.payload, 'structure', { x: 0, y: 0, w: LENS.view.w, h: LENS.view.h })
            scene.tweens.killTweensOf(box)
            box.setVisible(true).setScale(0.6).setAlpha(0)
            scene.tweens.add({ targets: box, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' })
        },
        hide() {
            scene.tweens.killTweensOf(box)
            scene.tweens.add({ targets: box, scale: 0.7, alpha: 0, duration: 140, onComplete: () => box.setVisible(false) })
        },
        destroy() {
            view.destroy()
            box.destroy()
        },
    }
}
