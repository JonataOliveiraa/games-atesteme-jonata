import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAR_CELL, KART_SHEET, MOTO_SHEET, PIECE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { GEOMETRY } from '../data/layout'
import { TIMING } from '../data/timing'
import { TIRES } from '../data/rules'
import type { TireId, Vec, Vehicle } from '../types'
import { SHADOW } from './art'
import type { View } from './view'

/**
 * Um veículo de lado (carro ou moto) com as rodas soltas: a folha vem SEM
 * rodas e é o código que põe o pneu escolhido. `cell` fixo = rival.
 */
export interface Car {
    readonly x: number
    readonly ground: number
    readonly vehicle: Vehicle
    readonly tire: TireId | null
    place(x: number, ground: number, scale?: number): void
    setDepth(depth: number): void
    setVehicle(vehicle: Vehicle): void
    pose(cell: number): void
    setTire(tire: TireId | null): void
    swapTires(tire: TireId): Promise<void>
    bounceOff(tire: TireId): Promise<void>
    roll(dd: number): void
    jiggle(t: number, amount: number): void
    tilt(deg: number): void
    spin(dx: number, dy: number, ms: number): Promise<void>
    melt(): Promise<void>
    sink(px: number): Promise<void>
    reset(): void
    fade(alpha: number, ms: number): Promise<void>
    setVisible(on: boolean): void
    wheel(i: 0 | 1): Vec
    head(): Vec
    destroy(): void
}

export interface CarOptions {
    vehicle: Vehicle
    cell?: number
}

export function createCar(scene: Phaser.Scene, view: View, opts: CarOptions): Car {
    let vehicle: Vehicle = opts.vehicle
    let tire: TireId | null = null
    let cell: number = opts.cell ?? CAR_CELL.idle
    let px = -2000
    let pg = 0
    let ls = 1
    let spinAngle = 0
    let flat = false

    let g = GEOMETRY[vehicle]
    let s = g.w / g.cellW
    let dispW = g.cellW * s
    let dispH = g.cellH * s
    let half = (g.bottomFY - 0.5) * dispH
    let r = g.wheelFR * dispH
    let axle = (g.axleFY - g.bottomFY) * dispH + half
    let spots = [(g.rearFX - 0.5) * dispW, (g.frontFX - 0.5) * dispW]

    const sheetOf = (v: Vehicle) => (v === 'moto' ? MOTO_SHEET : KART_SHEET)

    const shadow = view.world(scene.add.image(0, 0, SHADOW).setAlpha(0.22))
    const body = view.world(scene.add.image(0, 0, sheetOf(vehicle).key, cellKey(cell)))
    let wheels = [0, 1].map(() => view.world(scene.add.image(0, 0, PIECE_SHEET.key, cellKey(PIECE_CELL.liso))))
    const inner = view.world(scene.add.container(0, 0, [body, ...wheels]))
    const root = view.world(scene.add.container(px, pg, [inner]))

    const fitWheel = (w: Phaser.GameObjects.Image) => w.setScale((r * 2) / Math.max(w.frame.width, w.frame.height))

    const layout = () => {
        g = GEOMETRY[vehicle]
        s = g.w / g.cellW
        dispW = g.cellW * s
        dispH = g.cellH * s
        half = (g.bottomFY - 0.5) * dispH
        r = g.wheelFR * dispH
        axle = (g.axleFY - g.bottomFY) * dispH + half
        spots = [(g.rearFX - 0.5) * dispW, (g.frontFX - 0.5) * dispW]
        body.setTexture(sheetOf(vehicle).key, cellKey(cell)).setOrigin(0.5, g.bottomFY).setScale(s).setPosition(0, half)
        inner.setPosition(0, -half)
        wheels.forEach((w, i) => w.setOrigin(0.5).setPosition(spots[i], axle))
        if (tire) wheels.forEach(w => fitWheel(w.setFrame(cellKey(TIRES[tire as TireId].cell))))
        wheels.forEach(w => w.setVisible(tire !== null))
        shadow.setDisplaySize(dispW * 0.9 * ls, 22 * ls)
    }
    layout()

    const car: Car = {
        get x() {
            return px
        },
        get ground() {
            return pg
        },
        get vehicle() {
            return vehicle
        },
        get tire() {
            return tire
        },
        place(nx, ng, scale = ls) {
            px = nx
            pg = ng
            if (scale !== ls) {
                ls = scale
                root.setScale(ls)
                shadow.setDisplaySize(dispW * 0.9 * ls, 22 * ls)
            }
            root.setPosition(px, pg)
            shadow.setPosition(px, pg + 3)
        },
        setDepth(depth) {
            root.setDepth(depth)
            shadow.setDepth(depth - 0.5)
        },
        setVehicle(next) {
            vehicle = next
            if (tire && TIRES[tire].vehicle !== next) tire = null
            layout()
        },
        pose(next) {
            if (opts.cell !== undefined) return
            cell = next
            body.setFrame(cellKey(cell))
        },
        setTire(next) {
            tire = next
            layout()
        },
        async swapTires(next) {
            const p = inner.getWorldTransformMatrix()
            wheels.forEach((w, i) => {
                if (!w.visible) return
                const at = p.transformPoint(w.x, w.y)
                const copy = view.world(scene.add.image(at.x, at.y, w.texture.key, w.frame.name))
                copy.setScale(w.scaleX * ls).setAngle(w.angle).setDepth(root.depth + 1)
                const dir = i === 0 ? -1 : 1
                void FX.arcTo(scene, copy, { x: at.x + dir * 110, y: at.y + 26 }, { height: 110, duration: TIMING.wheel * 1.6 }).then(() => copy.destroy())
                void FX.to(scene, copy, { angle: copy.angle + dir * 220, alpha: 0 }, { duration: TIMING.wheel * 1.6 })
            })
            wheels.forEach(w => w.setVisible(false))
            await FX.wait(scene, TIMING.wheel * 0.6)
            car.setTire(next)
            const base = wheels[0].scaleX
            wheels.forEach(w => w.setScale(base * 0.3))
            await FX.to(scene, wheels, { scale: base }, { duration: TIMING.wheel, ease: 'Back.easeOut' })
        },
        async bounceOff(next) {
            const wrong = TIRES[next]
            const size = wrong.vehicle === 'moto' ? 1.45 : 0.7
            wheels.forEach(w => {
                w.setFrame(cellKey(wrong.cell)).setVisible(true)
                w.setScale(((r * 2) / Math.max(w.frame.width, w.frame.height)) * size)
            })
            await FX.wait(scene, TIMING.wheel)
            const p = inner.getWorldTransformMatrix()
            wheels.forEach((w, i) => {
                const at = p.transformPoint(w.x, w.y)
                const copy = view.world(scene.add.image(at.x, at.y, w.texture.key, w.frame.name))
                copy.setScale(w.scaleX * ls).setDepth(root.depth + 1)
                const dir = i === 0 ? -1 : 1
                void FX.arcTo(scene, copy, { x: at.x + dir * 260, y: at.y + 40 }, { height: 140, duration: 900 }).then(() => copy.destroy())
                void FX.to(scene, copy, { angle: dir * 540 }, { duration: 900 })
                w.setVisible(false)
            })
            tire = null
            await FX.to(scene, body, { y: half + r * 0.6 }, { duration: 240, ease: 'Bounce.easeOut' })
        },
        roll(dd) {
            if (flat) return
            spinAngle += dd / Math.max(1, r)
            wheels.forEach(w => w.setRotation(spinAngle))
        },
        jiggle(t, amount) {
            body.setY(half + Math.sin(t * 0.045) * amount)
        },
        tilt(deg) {
            inner.setAngle(deg)
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
                        car.place(from.x + dx * k.t, from.y + dy * k.t)
                        inner.setAngle(720 * k.t)
                    },
                    onComplete: () => resolve(),
                })
            })
        },
        async melt() {
            flat = true
            wheels.forEach(w => {
                w.setFrame(cellKey(PIECE_CELL.flat))
                w.setScale((r * 2.5) / Math.max(w.frame.width, w.frame.height)).setRotation(0).setOrigin(0.5, 1)
                w.setY(axle + r)
            })
            await FX.to(scene, body, { y: half + r * 0.45 }, { duration: 260, ease: 'Back.easeOut' })
        },
        async sink(amount) {
            await FX.to(scene, root, { y: pg + amount }, { duration: 600, ease: 'Sine.easeOut' })
            pg += amount
            shadow.setAlpha(0)
        },
        reset() {
            flat = false
            scene.tweens.killTweensOf([inner, body, root, ...wheels])
            inner.setAngle(0)
            body.setAlpha(1)
            root.setAlpha(1)
            shadow.setAlpha(0.22)
            layout()
        },
        fade(alpha, ms) {
            return FX.all(FX.to(scene, root, { alpha }, { duration: ms }), FX.to(scene, shadow, { alpha: alpha * 0.22 }, { duration: ms }))
        },
        setVisible(on) {
            root.setVisible(on)
            shadow.setVisible(on)
        },
        wheel(i) {
            return { x: px + spots[i] * ls, y: pg - r * ls }
        },
        head() {
            return { x: px - dispW * 0.03 * ls, y: pg - dispH * 0.74 * ls }
        },
        destroy() {
            scene.tweens.killTweensOf([inner, body, root, shadow, ...wheels])
            root.destroy()
            shadow.destroy()
            wheels = []
        },
    }
    return car
}
