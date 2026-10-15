import Phaser from 'phaser'
import { TEO_CELL, TEO_SHEET, WALK_CYCLE, WALK_FRAMES, WALK_ROW, WALK_SHEET, cellKey, type FigureData } from '../data/files'
import { DEPTH, HERO, worldDepth } from '../data/layout'
import type { Pose, Rect, Vec } from '../types'
import { SHADOW, figure } from './art'
import type { View } from './view'

export interface Hero {
    readonly pos: Vec
    readonly face: Vec
    readonly parts: Phaser.GameObjects.GameObject[]
    readonly moving: boolean
    update(delta: number, input: Vec, free: (x: number, y: number) => boolean): void
    drive(points: Vec[]): Promise<void>
    stop(): void
    turn(face: Vec): void
    raise(on: boolean): void
    act(pose: 'cheer' | 'oops' | null): void
    place(at: Vec, face: Vec): void
    rect(): Rect
    destroy(): void
}

const STEP = 52
const LIFT = 4

export function createHero(scene: Phaser.Scene, view: View, start: Vec, startFace: Vec): Hero {
    const pos = { ...start }
    const face = { ...startFace }
    const shadow = view.world(scene.add.image(pos.x, pos.y, SHADOW).setDisplaySize(70, 24).setAlpha(0.22).setDepth(DEPTH.water + 0.9))
    const body = view.world(figure(scene, TEO_SHEET, TEO_CELL.front, HERO.height))
    const canWalk = scene.textures.exists(WALK_SHEET.key)
    let raised = false
    let acting: 'cheer' | 'oops' | null = null
    let clock = 0
    let travel = 0
    let walking = false
    let route: Vec[] = []
    let arrive: (() => void) | undefined

    const direction = (): 'front' | 'back' | 'side' => {
        if (Math.abs(face.x) > Math.abs(face.y) * 0.9) return 'side'
        return face.y < 0 ? 'back' : 'front'
    }

    const pose = (): Pose => {
        if (acting) return acting
        const dir = direction()
        if (!raised) return dir
        return dir === 'side' ? 'sideUp' : dir === 'back' ? 'backUp' : 'frontUp'
    }

    const paint = () => {
        const p = pose()
        const stepping = walking && canWalk && !raised && !acting
        if (stepping) {
            const dir = direction()
            const cycle = WALK_CYCLE[dir]
            const span = (STEP * 2) / cycle.length
            body.setTexture(WALK_SHEET.key, cellKey(WALK_ROW[dir] * WALK_FRAMES + cycle[Math.floor(travel / span) % cycle.length]))
        } else body.setTexture(TEO_SHEET.key, cellKey(TEO_CELL[p]))
        const data = body.frame.customData as FigureData
        const flip = !acting && (p === 'side' || p === 'sideUp') && face.x < 0
        const px = data.px ?? 0.5
        body.setFlipX(flip).setOrigin(flip ? 1 - px : px, 1)
        const scale = HERO.height / (data.h ?? body.frame.height)
        const breathe = walking ? 1 : 1 + Math.sin(clock / 420) * 0.012
        body.setScale(scale, scale * breathe)
        const lift = stepping && WALK_CYCLE[direction()].length === 2 ? Math.sin((((travel + STEP / 2) % STEP) / STEP) * Math.PI) * LIFT : 0
        const bob = walking && !stepping ? Math.abs(Math.sin(clock / 90)) * 7 : lift
        body.setPosition(pos.x, pos.y - bob)
        body.setRotation(walking && !stepping ? Math.sin(clock / 90) * 0.04 : 0)
        body.setDepth(worldDepth(pos.y))
        shadow.setPosition(pos.x, pos.y - 2)
    }

    const step = (delta: number, dir: Vec, free: (x: number, y: number) => boolean) => {
        const len = Math.hypot(dir.x, dir.y)
        if (len < 0.001) {
            walking = false
            return
        }
        face.x = dir.x / len
        face.y = dir.y / len
        const dist = (HERO.speed * Math.min(1, len) * delta) / 1000
        const nx = pos.x + face.x * dist
        const ny = pos.y + face.y * dist
        const from = { x: pos.x, y: pos.y }
        if (free(nx, pos.y)) pos.x = nx
        if (free(pos.x, ny)) pos.y = ny
        const moved = Math.hypot(pos.x - from.x, pos.y - from.y)
        travel += moved
        walking = moved > 0
    }

    const hero: Hero = {
        pos,
        face,
        parts: [shadow, body],
        get moving() {
            return walking
        },
        update(delta, input, free) {
            clock += delta
            if (route.length) {
                const target = route[0]
                const dx = target.x - pos.x
                const dy = target.y - pos.y
                const d = Math.hypot(dx, dy)
                const reach = (HERO.speed * delta) / 1000
                if (d <= reach) {
                    pos.x = target.x
                    pos.y = target.y
                    travel += d
                    route.shift()
                    if (!route.length) {
                        walking = false
                        const done = arrive
                        arrive = undefined
                        done?.()
                    }
                } else {
                    face.x = dx / d
                    face.y = dy / d
                    pos.x += face.x * reach
                    pos.y += face.y * reach
                    travel += reach
                    walking = true
                }
            } else step(delta, input, free)
            paint()
        },
        drive(points) {
            hero.stop()
            route = points.map(p => ({ ...p }))
            if (!route.length) return Promise.resolve()
            return new Promise(resolve => {
                arrive = resolve
            })
        },
        stop() {
            route = []
            walking = false
            const done = arrive
            arrive = undefined
            done?.()
        },
        turn(to) {
            const len = Math.hypot(to.x, to.y) || 1
            face.x = to.x / len
            face.y = to.y / len
            paint()
        },
        raise(on) {
            raised = on
            paint()
        },
        act(p) {
            acting = p
            paint()
        },
        place(at, to) {
            pos.x = at.x
            pos.y = at.y
            hero.turn(to)
        },
        rect() {
            return { x: pos.x, y: pos.y - HERO.height / 2, w: 120, h: HERO.height + 20 }
        },
        destroy() {
            hero.stop()
            shadow.destroy()
            body.destroy()
        },
    }
    paint()
    return hero
}
