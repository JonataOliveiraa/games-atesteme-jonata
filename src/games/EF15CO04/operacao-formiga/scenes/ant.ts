import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ANT_SHEET, antCell, cellKey, sheetScale } from '../data/files'
import { ANT, WD } from '../data/layout'
import { C } from '../data/theme'
import type { AntPose, Rect, Vec } from '../types'
import type { Garden } from './garden'
import type { View } from './view'

/** A formiga da criança. Anda pelo jardim, colide com o muro e carrega um pedaço de cada vez. */
export interface Ant {
    readonly x: number
    readonly y: number
    place(x: number, y: number): void
    /** Anda na direção (vx, vy) por `dt` segundos. Devolve se andou e se bateu na fresta fechada. */
    step(vx: number, vy: number, dt: number, gate: boolean): { moved: boolean; gate: boolean }
    walkTo(path: Vec[], onStep?: () => void): Promise<void>
    setCarrying(on: boolean): void
    hold(): Vec
    depth(): number
    setPose(p: AntPose): void
    cheer(): Promise<void>
    strain(): Promise<void>
    face(dir: 1 | -1): void
    rect(): Rect
    destroy(): void
}

export function createAnt(scene: Phaser.Scene, view: View, garden: Garden, onStride: () => void): Ant {
    const k = sheetScale(scene, ANT_SHEET)
    const scale = (ANT.w / ANT.cell) * k
    const shadow = scene.add.ellipse(0, 0, ANT.w * 0.8, 16, C.shadow, 0.2)
    const sprite = scene.add.image(0, 0, ANT_SHEET.key, cellKey(antCell('idle'))).setOrigin(0.5, ANT.foot / ANT.cell).setScale(scale)
    view.add(shadow, WD.actor)
    view.add(sprite, WD.actor)

    let x: number = ANT.start.x
    let y: number = ANT.start.y
    let carrying = false
    let dir: 1 | -1 = -1
    let clock = 0
    let stride = 0
    let busy = false
    let pose: AntPose = 'idle'

    const show = (p: AntPose) => {
        pose = p
        sprite.setFrame(cellKey(antCell(p)))
    }

    const sync = () => {
        sprite.setPosition(x, y).setFlipX(dir < 0)
        shadow.setPosition(x, y - 2)
        sprite.setDepth(WD.actor + y)
        shadow.setDepth(WD.actor + y - 1)
        view.restack()
    }

    const idle = () => show(carrying ? 'carry' : 'idle')

    const animate = (moving: boolean, dt: number) => {
        if (busy) return
        if (!moving) {
            clock = 0
            if (pose !== 'idle' && pose !== 'carry') idle()
            return
        }
        clock += dt
        if (clock < ANT.step) return
        clock = 0
        stride = 1 - stride
        if (carrying) show(stride ? 'carryA' : 'carryB')
        else show(stride ? 'walkA' : 'walkB')
        onStride()
    }

    const ant: Ant = {
        get x() {
            return x
        },
        get y() {
            return y
        },
        place(nx, ny) {
            x = nx
            y = ny
            sync()
        },
        step(vx, vy, dt, gate) {
            const speed = carrying ? ANT.carrySpeed : ANT.speed
            const dx = vx * speed * dt
            const dy = vy * speed * dt
            let moved = false
            let hitGate = false
            if (Math.abs(vx) > 0.05) dir = vx > 0 ? 1 : -1
            if (dx) {
                if (!garden.blocked(x + dx, y, ANT.r, gate)) {
                    x += dx
                    moved = true
                } else if (gate && !garden.blocked(x + dx, y, ANT.r, false)) hitGate = true
            }
            if (dy) {
                if (!garden.blocked(x, y + dy, ANT.r, gate)) {
                    y += dy
                    moved = true
                } else if (gate && !garden.blocked(x, y + dy, ANT.r, false)) hitGate = true
            }
            sync()
            animate(moved, dt)
            return { moved, gate: hitGate }
        },
        async walkTo(path, onStep) {
            for (const p of path) {
                const dist = Math.hypot(p.x - x, p.y - y)
                if (dist < 1) continue
                const speed = carrying ? ANT.carrySpeed : ANT.speed
                const from = { x, y }
                if (Math.abs(p.x - x) > 2) dir = p.x > x ? 1 : -1
                const t = { v: 0 }
                await new Promise<void>(resolve => {
                    let last = 0
                    scene.tweens.add({
                        targets: t,
                        v: 1,
                        duration: (dist / speed) * 1000,
                        ease: 'Linear',
                        onUpdate: tw => {
                            x = Phaser.Math.Linear(from.x, p.x, t.v)
                            y = Phaser.Math.Linear(from.y, p.y, t.v)
                            sync()
                            const now = tw.elapsed / 1000
                            animate(true, now - last)
                            last = now
                            onStep?.()
                        },
                        onComplete: () => resolve(),
                    })
                })
            }
            animate(false, 0)
        },
        setCarrying(on) {
            carrying = on
            if (!busy) idle()
        },
        hold() {
            const hx = (ANT.hold.x - ANT.cell / 2) * (ANT.w / ANT.cell) * dir
            const hy = (ANT.hold.y - ANT.foot) * (ANT.w / ANT.cell)
            return { x: x + hx, y: y + hy }
        },
        depth: () => WD.actor + y + 0.5,
        setPose(p) {
            show(p)
        },
        async cheer() {
            busy = true
            show('happy')
            await FX.to(scene, sprite, { y: y - 26 }, { duration: 200, yoyo: true, ease: 'Sine.easeOut' })
            await FX.to(scene, sprite, { y: y - 14 }, { duration: 150, yoyo: true, ease: 'Sine.easeOut' })
            sprite.setY(y)
            busy = false
            idle()
        },
        async strain() {
            busy = true
            show('push')
            const base = x
            await FX.to(scene, sprite, { x: base + 5 * dir }, { duration: 70, yoyo: true, repeat: 4 })
            sprite.setX(base)
            busy = false
            idle()
        },
        face(d) {
            dir = d
            sync()
        },
        rect: () => ({ x, y: y - 36, w: ANT.w + 30, h: 100 }),
        destroy() {
            scene.tweens.killTweensOf(sprite)
            sprite.destroy()
            shadow.destroy()
        },
    }
    sync()
    return ant
}
