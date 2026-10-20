import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MAP_KEY } from '../data/files'
import { CONSOLE, DEPTH, MAP, SIGNAL } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Rect, Vec, Way } from '../types'

type G = Phaser.GameObjects.Graphics

export interface Signal {
    set(on: boolean): Promise<void>
    rect(): Rect
    destroy(): void
}

const BARS = 4

function bars(g: G, cx: number, cy: number, w: number, h: number, v: number) {
    const left = cx - w / 2
    const top = cy - h / 2
    const k = h / SIGNAL.h
    g.fillStyle(C.screenEdge, 1)
    g.fillRoundedRect(left, top, w, h, 14 * k)
    g.fillStyle(C.screen, 1)
    g.fillRoundedRect(left + 3, top + 3, w - 6, h - 6, 11 * k)
    const bw = 11 * k
    const step = 6 * k
    const base = top + h - 8 * k
    for (let i = 0; i < BARS; i++) {
        const bh = 8 * k + i * 7 * k
        g.fillStyle(v * BARS > i + 0.5 ? C.yes : C.barOff, 1)
        g.fillRoundedRect(left + 10 * k + i * (bw + step), base - bh, bw, bh, 3 * k)
    }
    const off = 1 - v
    if (off <= 0.05) return
    const xc = left + w * 0.62
    const r = h * 0.36 * off
    g.lineStyle(9 * k, C.white, 1)
    g.lineBetween(xc - r, cy - r, xc + r, cy + r)
    g.lineBetween(xc + r, cy - r, xc - r, cy + r)
    g.lineStyle(6 * k, C.noSignal, 1)
    g.lineBetween(xc - r, cy - r, xc + r, cy + r)
    g.lineBetween(xc + r, cy - r, xc - r, cy + r)
}

export function createSignal(scene: Phaser.Scene, on: boolean, badges: Phaser.GameObjects.Container[]): Signal {
    const g = scene.add.graphics().setDepth(DEPTH.key + 1)
    const small = badges.map(box => {
        const b = scene.add.graphics()
        box.add(b)
        return b
    })
    const state = { v: on ? 1 : 0 }

    const paint = () => {
        g.clear()
        bars(g, SIGNAL.x, SIGNAL.y, SIGNAL.w, SIGNAL.h, state.v)
        small.forEach(b => {
            b.clear()
            bars(b, SIGNAL.badgeX, SIGNAL.badgeY, SIGNAL.badgeW, SIGNAL.badgeH, state.v)
        })
    }
    paint()

    return {
        set(value) {
            return new Promise(resolve => {
                scene.tweens.killTweensOf(state)
                scene.tweens.add({
                    targets: state,
                    v: value ? 1 : 0,
                    duration: TIMING.signal,
                    onUpdate: paint,
                    onComplete: () => {
                        paint()
                        resolve()
                    },
                })
            })
        },
        rect: () => ({ x: SIGNAL.x, y: SIGNAL.y, w: SIGNAL.w + 24, h: SIGNAL.h + 24 }),
        destroy() {
            scene.tweens.killTweensOf(state)
            g.destroy()
            small.forEach(b => b.destroy())
        },
    }
}

const screenPanel = (g: G) => {
    g.fillStyle(C.screenEdge, 1)
    g.fillRoundedRect(CONSOLE.x, CONSOLE.y, CONSOLE.w, CONSOLE.h, 26)
    g.fillStyle(C.screen, 1)
    g.fillRoundedRect(CONSOLE.x + 6, CONSOLE.y + 6, CONSOLE.w - 12, CONSOLE.h - 12, 22)
}

const close = async (scene: Phaser.Scene, items: Phaser.GameObjects.GameObject[]) => {
    await new Promise<void>(resolve =>
        scene.tweens.add({ targets: items, alpha: 0, duration: 220, onComplete: () => resolve() }),
    )
    items.forEach(i => i.destroy())
}

const lerp = (a: Vec, b: Vec, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

async function drawRoute(scene: Phaser.Scene, g: G, points: Vec[], width: number, ms: number) {
    const state = { t: 0 }
    const legs = points.length - 1
    await new Promise<void>(resolve =>
        scene.tweens.add({
            targets: state,
            t: 1,
            duration: ms,
            onUpdate: () => {
                g.clear()
                g.lineStyle(width, C.route, 1)
                g.beginPath()
                g.moveTo(points[0].x, points[0].y)
                const reach = state.t * legs
                for (let i = 0; i < legs; i++) {
                    if (reach <= i) break
                    const p = lerp(points[i], points[i + 1], Math.min(1, reach - i))
                    g.lineTo(p.x, p.y)
                }
                g.strokePath()
            },
            onComplete: () => resolve(),
        }),
    )
}

export async function gpsScreen(scene: Phaser.Scene, way: Way | null) {
    const g = scene.add.graphics().setDepth(DEPTH.key + 3)
    screenPanel(g)
    const mid = CONSOLE.x + CONSOLE.w / 2
    const bottom = CONSOLE.y + CONSOLE.h - 18
    const fork = { x: mid, y: CONSOLE.y + CONSOLE.h * 0.55 }
    const ends = { [-1]: { x: mid - 200, y: CONSOLE.y + 22 }, [1]: { x: mid + 200, y: CONSOLE.y + 22 } } as Record<Way, Vec>
    g.lineStyle(16, C.mapRoad, 1)
    g.lineBetween(mid, bottom, fork.x, fork.y)
    g.lineBetween(fork.x, fork.y, ends[-1].x, ends[-1].y)
    g.lineBetween(fork.x, fork.y, ends[1].x, ends[1].y)
    const route = scene.add.graphics().setDepth(DEPTH.key + 4)
    const car = scene.add.circle(mid, bottom, 12, C.butter).setDepth(DEPTH.key + 5).setStrokeStyle(4, C.white)
    g.setAlpha(0)
    await FX.to(scene, g, { alpha: 1 }, { duration: 200 })
    if (way !== null) {
        await drawRoute(scene, route, [{ x: mid, y: bottom }, fork, ends[way]], 10, TIMING.route)
        const pin = scene.add.circle(ends[way].x, ends[way].y, 14, C.yes).setDepth(DEPTH.key + 5).setStrokeStyle(4, C.white)
        await FX.popIn(scene, pin, { from: 0.2, duration: 240 })
        await FX.wait(scene, TIMING.screenHold)
        await close(scene, [g, route, car, pin])
        return
    }
    await FX.wait(scene, TIMING.screenHold)
    await close(scene, [g, route, car])
}

export async function searching(scene: Phaser.Scene) {
    const g = scene.add.graphics().setDepth(DEPTH.key + 3)
    screenPanel(g)
    const spin = scene.add.graphics().setDepth(DEPTH.key + 4)
    const cx = CONSOLE.x + CONSOLE.w / 2
    const cy = CONSOLE.y + CONSOLE.h / 2
    spin.lineStyle(12, C.barOff, 1)
    spin.beginPath()
    spin.arc(0, 0, 40, 0, Math.PI * 1.4, false)
    spin.strokePath()
    spin.setPosition(cx, cy)
    scene.tweens.add({ targets: spin, angle: 360 * 3, duration: TIMING.search })
    await FX.wait(scene, TIMING.search)
    await close(scene, [g, spin])
}

export async function paperMap(scene: Phaser.Scene, way: Way | null) {
    const img = scene.add.image(MAP.x, MAP.y, MAP_KEY).setDepth(DEPTH.flight - 1).setScale(MAP.scale, 0)
    await FX.to(scene, img, { scaleY: MAP.scale }, { duration: 320, ease: 'Back.easeOut' })
    const at = (p: Vec) => ({ x: MAP.x + (p.x / MAP.w - 0.5) * img.width * MAP.scale, y: MAP.y + (p.y / MAP.h - 0.5) * img.height * MAP.scale })
    const route = scene.add.graphics().setDepth(DEPTH.flight)
    const items: Phaser.GameObjects.GameObject[] = [img, route]
    if (way !== null) {
        const path = way < 0 ? MAP.left : MAP.right
        await drawRoute(scene, route, [...MAP.trunk, ...path].map(at), 12, TIMING.route)
        const end = at(path[path.length - 1])
        const pin = scene.add.circle(end.x, end.y, 14, C.yes).setDepth(DEPTH.flight).setStrokeStyle(4, C.white)
        items.push(pin)
        await FX.popIn(scene, pin, { from: 0.2, duration: 240 })
    }
    await FX.wait(scene, TIMING.screenHold)
    await close(scene, items)
}
