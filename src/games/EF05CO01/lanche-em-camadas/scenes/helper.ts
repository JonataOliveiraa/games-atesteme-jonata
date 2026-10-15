import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HELPER_CELL, HELPER_SHEET, ING_SHEET, UI_CELL, UI_SHEET, cellKey, type FigureData } from '../data/files'
import { INGREDIENTS } from '../data/ingredients'
import { DEPTH, FLOOR, HELPER, LAYER, TRAY } from '../data/layout'
import { TIMING } from '../data/timing'
import type { IngredientId, Rect, Vec } from '../types'
import { SHADOW, fitInto, refOf } from './art'
import type { View } from './view'

export interface Helper {
    readonly x: number
    readonly moving: boolean
    readonly count: number
    move(dx: number, delta: number): void
    pose(cell: number | null): void
    place(x: number): void
    top(): number
    add(id: IngredientId, fromX: number): Promise<void>
    clear(): void
    takeStack(): Phaser.GameObjects.Container
    stackRect(): Rect
    head(): Vec
    destroy(): void
}

const TRAY_TOP = 10

export function createHelper(scene: Phaser.Scene, view: View): Helper {
    const shadow = view.world(scene.add.image(HELPER.start, FLOOR - 2, SHADOW).setDisplaySize(110, 26).setAlpha(0.2).setDepth(DEPTH.helper - 1))
    const body = view.world(scene.add.image(HELPER.start, FLOOR, HELPER_SHEET.key, cellKey(HELPER_CELL.idle)).setDepth(DEPTH.helper))
    const scale = HELPER.height / refOf(scene, HELPER_SHEET)
    const trayY = FLOOR - HELPER.hands
    const tray = view.world(fitInto(scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.tray)), TRAY.w))
    const stack = view.world(scene.add.container(HELPER.start, trayY, [tray]).setDepth(DEPTH.stack))
    let layers: Phaser.GameObjects.Image[] = []
    let height = TRAY_TOP
    let x: number = HELPER.start
    let travel = 0
    let moving = false
    let still = 0
    let held: number | null = null
    let tilt = 0

    const paint = () => {
        const cell = held ?? (moving ? (Math.floor(travel / HELPER.stride) % 2 ? HELPER_CELL.stepB : HELPER_CELL.stepA) : HELPER_CELL.idle)
        body.setFrame(cellKey(cell))
        const px = (body.frame.customData as FigureData).px ?? 0.5
        body.setOrigin(px, 1).setScale(scale).setPosition(x, FLOOR)
        shadow.setX(x)
        stack.setPosition(x, trayY).setAngle(tilt)
        tray.setVisible(cell <= HELPER_CELL.balance || layers.length > 0)
    }

    const helper: Helper = {
        get x() {
            return x
        },
        get moving() {
            return moving
        },
        get count() {
            return layers.length
        },
        move(dx, delta) {
            if (Math.abs(dx) > 0.01) {
                x += dx
                travel += Math.abs(dx)
                moving = true
                still = 0
            } else {
                still += delta
                if (still > 80) moving = false
            }
            const want = Phaser.Math.Clamp((-dx / Math.max(delta, 1)) * 1000 * 0.012 * (1 + layers.length * 0.25), -8, 8)
            tilt += (want - tilt) * Math.min(1, delta / 120)
            paint()
        },
        pose(cell) {
            held = cell
            paint()
        },
        place(nx) {
            x = nx
            moving = false
            tilt = 0
            paint()
        },
        top: () => trayY - height,
        async add(id, fromX) {
            const img = fitInto(scene.add.image(0, 0, ING_SHEET.key, cellKey(INGREDIENTS[id].cell)), LAYER.w)
            view.world(img)
            const h = img.displayHeight
            const y = -height - h / 2
            height += h * LAYER.overlap
            img.setPosition(Phaser.Math.Clamp(fromX - x, -40, 40), y - 24)
            stack.add(img)
            layers.push(img)
            await FX.to(scene, img, { x: 0, y }, { duration: TIMING.land, ease: 'Quad.easeIn' })
            const sx = img.scaleX
            const sy = img.scaleY
            await FX.to(scene, img, { scaleX: sx * 1.12, scaleY: sy * 0.82 }, { duration: 80, yoyo: true })
            img.setScale(sx, sy)
        },
        clear() {
            layers.forEach(l => {
                scene.tweens.killTweensOf(l)
                l.destroy()
            })
            layers = []
            height = TRAY_TOP
        },
        takeStack() {
            const flight = view.world(scene.add.container(x, trayY).setDepth(DEPTH.stack + 1).setAngle(tilt))
            layers.forEach(l => {
                stack.remove(l)
                flight.add(l)
            })
            layers = []
            height = TRAY_TOP
            return flight
        },
        stackRect() {
            const h = height + 50
            return { x, y: trayY - h / 2 + 20, w: TRAY.w + 30, h }
        },
        head: () => ({ x, y: FLOOR - HELPER.height }),
        destroy() {
            scene.tweens.killTweensOf([body, stack])
            layers.forEach(l => l.destroy())
            stack.destroy()
            body.destroy()
            shadow.destroy()
        },
    }
    paint()
    return helper
}
