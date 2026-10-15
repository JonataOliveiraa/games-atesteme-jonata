import Phaser from 'phaser'
import { WALK_CYCLE, cellKey, type FigureData, type Sheet } from '../data/files'
import { GROUND, HERO } from '../data/layout'
import type { Rect, Vec } from '../types'
import { SHADOW, refOf } from './art'
import type { View } from './view'

export interface Walker {
    readonly x: number
    readonly face: number
    readonly moving: boolean
    move(dx: number, delta: number): void
    turn(face: number): void
    pose(cell: number | null): void
    place(x: number, face: number): void
    hop(): Promise<void>
    rect(): Rect
    head(): Vec
    destroy(): void
}

export function createWalker(scene: Phaser.Scene, view: View, sheet: Sheet, height: number, idle: number, depth: number, start: number, face: number): Walker {
    const shadow = view.world(scene.add.image(start, GROUND - 2, SHADOW).setDisplaySize(84, 22).setAlpha(0.2).setDepth(depth - 0.5))
    const body = view.world(scene.add.image(start, GROUND, sheet.key, cellKey(idle)).setDepth(depth))
    const scale = height / refOf(scene, sheet)
    let x = start
    let facing = face
    let travel = 0
    let moving = false
    let still = 0
    let held: number | null = null
    let jump = 0

    const paint = () => {
        const side = held === null
        const cell = held ?? (moving ? WALK_CYCLE[Math.floor(travel / HERO.stride) % WALK_CYCLE.length] : idle)
        body.setFrame(cellKey(cell))
        const data = body.frame.customData as FigureData
        const flip = side && facing < 0
        const px = data.px ?? 0.5
        body.setFlipX(flip).setOrigin(flip ? 1 - px : px, 1)
        body.setScale(scale)
        body.setPosition(x, GROUND - jump)
        shadow.setPosition(x, GROUND - 2)
    }

    const walker: Walker = {
        get x() {
            return x
        },
        get face() {
            return facing
        },
        get moving() {
            return moving
        },
        move(dx, delta) {
            if (Math.abs(dx) > 0.01) {
                x += dx
                travel += Math.abs(dx)
                facing = dx > 0 ? 1 : -1
                moving = true
                still = 0
                held = null
            } else {
                still += delta
                if (still > 70) moving = false
            }
            paint()
        },
        turn(f) {
            facing = f
            paint()
        },
        pose(cell) {
            held = cell
            paint()
        },
        place(nx, f) {
            x = nx
            facing = f
            moving = false
            paint()
        },
        async hop() {
            const k = { t: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: 360,
                    onUpdate: () => {
                        jump = Math.sin(k.t * Math.PI) * 26
                        paint()
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            jump = 0
            paint()
        },
        rect() {
            const h = body.displayHeight
            return { x, y: GROUND - h / 2, w: body.displayWidth, h }
        },
        head() {
            return { x, y: GROUND - body.displayHeight }
        },
        destroy() {
            scene.tweens.killTweensOf(body)
            body.destroy()
            shadow.destroy()
        },
    }
    paint()
    return walker
}
