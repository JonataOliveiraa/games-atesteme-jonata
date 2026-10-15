import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { KART_CELL, KART_SHEET, PIECE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { DEPTH, KART } from '../data/layout'
import { TIMING } from '../data/timing'
import { TIRES } from '../data/weather'
import type { Rect, TireId, Vec } from '../types'
import { SHADOW } from './art'
import type { View } from './view'

export interface Kart {
    readonly x: number
    readonly ground: number
    readonly tire: TireId
    place(x: number, ground?: number): void
    pose(cell: number): void
    setTire(tire: TireId): void
    swapTires(tire: TireId): Promise<void>
    roll(dd: number): void
    jiggle(t: number, amount: number): void
    spin(dx: number, dy: number, ms: number): Promise<void>
    melt(): Promise<void>
    reset(): void
    wheel(i: 0 | 1): Vec
    head(): Vec
    rect(): Rect
    destroy(): void
}

export interface KartOptions {
    rival?: boolean
    scale?: number
    depth?: number
}

export function createKart(scene: Phaser.Scene, view: View, x: number, ground: number, opts: KartOptions = {}): Kart {
    const scale = (KART.w / KART.cellW) * (opts.scale ?? 1)
    const dispW = KART.cellW * scale
    const dispH = KART.cellH * scale
    const half = (KART.bottomFY - 0.5) * dispH
    const r = KART.wheelFR * dispH
    const axle = (KART.axleFY - KART.bottomFY) * dispH + half
    const spots = [(KART.rearFX - 0.5) * dispW, (KART.frontFX - 0.5) * dispW]
    const depth = opts.depth ?? DEPTH.kart

    const shadow = view.world(scene.add.image(x, ground + 4, SHADOW).setDisplaySize(dispW * 0.9, 24).setAlpha(0.22).setDepth(depth - 1))
    const body = view.world(
        scene.add.image(0, half, KART_SHEET.key, cellKey(opts.rival ? KART_CELL.rival : KART_CELL.idle)).setOrigin(0.5, KART.bottomFY).setScale(scale),
    )
    const makeWheel = (sx: number) => view.world(scene.add.image(sx, axle, PIECE_SHEET.key, cellKey(PIECE_CELL.liso)))
    let wheels = spots.map(makeWheel)
    const inner = view.world(scene.add.container(0, -half, [body, ...wheels]))
    const root = view.world(scene.add.container(x, ground, [inner]).setDepth(depth))

    let tire: TireId = 'liso'
    let px = x
    let pg = ground
    let spin = 0
    let flat = false

    const fitWheel = (w: Phaser.GameObjects.Image) => w.setScale((r * 2) / Math.max(w.frame.width, w.frame.height))
    wheels.forEach(fitWheel)

    const kart: Kart = {
        get x() {
            return px
        },
        get ground() {
            return pg
        },
        get tire() {
            return tire
        },
        place(nx, ng = pg) {
            px = nx
            pg = ng
            root.setPosition(px, pg)
            shadow.setPosition(px, pg + 4)
        },
        pose(cell) {
            body.setFrame(cellKey(cell))
        },
        setTire(next) {
            tire = next
            wheels.forEach(w => fitWheel(w.setFrame(cellKey(TIRES[next].cell))))
        },
        async swapTires(next) {
            const old = wheels
            old.forEach((w, i) => {
                const copy = view.world(scene.add.image(0, 0, w.texture.key, w.frame.name))
                copy.setScale(w.scaleX).setAngle(w.angle).setDepth(depth + 1)
                const m = inner.getWorldTransformMatrix()
                const p = m.transformPoint(w.x, w.y)
                copy.setPosition(p.x, p.y)
                const dir = i === 0 ? -1 : 1
                void FX.arcTo(scene, copy, { x: p.x + dir * 120, y: p.y + 30 }, { height: 120, duration: TIMING.wheel * 1.6 }).then(() => copy.destroy())
                void FX.to(scene, copy, { angle: copy.angle + dir * 220, alpha: 0 }, { duration: TIMING.wheel * 1.6 })
            })
            old.forEach(w => w.setVisible(false))
            kart.setTire(next)
            await FX.wait(scene, TIMING.wheel * 0.6)
            wheels.forEach(w => w.setVisible(true).setScale(w.scaleX * 0.3))
            const base = wheels[0].scaleX / 0.3
            await FX.to(scene, wheels, { scale: base }, { duration: TIMING.wheel, ease: 'Back.easeOut' })
        },
        roll(dd) {
            if (flat) return
            spin += dd / r
            wheels.forEach(w => w.setRotation(spin))
        },
        jiggle(t, amount) {
            body.setY(half + Math.sin(t * 0.045) * amount)
        },
        spin(dx, dy, ms) {
            return new Promise<void>(resolve => {
                const from = { x: px, y: pg }
                const k = { t: 0 }
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Cubic.easeOut',
                    onUpdate: () => {
                        kart.place(from.x + dx * k.t, from.y + dy * k.t)
                        inner.setAngle(720 * k.t)
                        shadow.setAlpha(0.22 * (1 - k.t * 0.5))
                    },
                    onComplete: () => resolve(),
                })
            })
        },
        async melt() {
            flat = true
            wheels.forEach(w => {
                w.setFrame(cellKey(PIECE_CELL.flat))
                const s = (r * 2.5) / Math.max(w.frame.width, w.frame.height)
                w.setScale(s).setRotation(0).setOrigin(0.5, 1)
                w.setY(axle + r)
            })
            await FX.to(scene, body, { y: half + r * 0.45 }, { duration: 260, ease: 'Back.easeOut' })
        },
        reset() {
            flat = false
            scene.tweens.killTweensOf([inner, body, ...wheels])
            inner.setAngle(0)
            body.setY(half)
            shadow.setAlpha(0.22)
            wheels.forEach(w => w.setOrigin(0.5).setY(axle).setVisible(true))
            kart.setTire(tire)
            if (!opts.rival) kart.pose(KART_CELL.idle)
        },
        wheel(i) {
            return { x: px + spots[i], y: pg - r }
        },
        head() {
            return { x: px - dispW * 0.03, y: pg - dispH * 0.72 }
        },
        rect() {
            return { x: px, y: pg - dispH * 0.45, w: dispW * 0.95, h: dispH * 0.95 }
        },
        destroy() {
            scene.tweens.killTweensOf([inner, body, root, ...wheels])
            root.destroy()
            shadow.destroy()
            wheels = []
        },
    }
    return kart
}
