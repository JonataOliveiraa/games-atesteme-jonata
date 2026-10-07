import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAST, ITEM_COL, anchor } from '../data/files'
import { CRITTER, CROSS, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { Item, Rect } from '../types'

export interface Critters {
    setAll(state: boolean[], item: Item): void
    set(i: number, has: boolean, animate: boolean): void
    states(): boolean[]
    enable(list: number[]): void
    hit(i: number): Rect
    all(): Rect
    shake(i: number): Promise<void>
    cross(onHop: () => void): void
    reset(): void
    update(): void
    destroy(): void
}

export function createCritters(scene: Phaser.Scene, onTap: (i: number) => void): Critters {
    const S = CRITTER.scale
    let item: Item = 'chapeu'
    let state = [false, false, false]
    let enabled = new Set<number>()
    let hover: number | null = null

    const glow = scene.add.graphics().setDepth(DEPTH.glow)

    const bodies = CRITTER.xs.map((x, i) => {
        const img = scene.add.image(0, 0, CAST, i * 4).setScale(S)
        img.setOrigin(...anchor(i * 4))
        const box = scene.add.container(x, CRITTER.footY, [img]).setDepth(DEPTH.critters + i)
        const breath = scene.tweens.add({
            targets: img,
            scaleY: S * 1.03,
            scaleX: S * 0.99,
            duration: 880 + i * 110,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
        return { img, box, breath }
    })

    const hit = (i: number): Rect => ({
        x: CRITTER.xs[i],
        y: CRITTER.footY + CRITTER.hit.dy,
        w: CRITTER.hit.w,
        h: CRITTER.hit.h,
    })

    const zones = CRITTER.xs.map((_, i) => {
        const r = hit(i)
        const zone = scene.add.zone(r.x, r.y, r.w, r.h).setDepth(DEPTH.critters + 6).setInteractive({ useHandCursor: true })
        if (zone.input) zone.input.enabled = false
        zone.on('pointerdown', () => {
            if (enabled.has(i)) onTap(i)
        })
        zone.on('pointerover', () => (hover = i))
        zone.on('pointerout', () => {
            if (hover === i) hover = null
        })
        return zone
    })

    const frameOf = (i: number) => i * 4 + (state[i] ? ITEM_COL[item] : 0)

    const paint = (i: number) => {
        const f = frameOf(i)
        const { img } = bodies[i]
        img.setFrame(f)
        img.setOrigin(...anchor(f))
    }

    const reset = () => {
        bodies.forEach(({ box }, i) => {
            scene.tweens.killTweensOf(box)
            box.setPosition(CRITTER.xs[i], CRITTER.footY).setScale(1).setAlpha(1)
        })
    }

    return {
        setAll(next, nextItem) {
            item = nextItem
            state = [...next]
            state.forEach((_, i) => paint(i))
        },
        set(i, has, animate) {
            state[i] = has
            paint(i)
            if (!animate) return
            const { box } = bodies[i]
            void FX.impact(scene, box, 0.16)
            void FX.stars(scene, CRITTER.xs[i], CRITTER.footY - 150, { color: has ? C.yellow : C.cyan, count: 4, rise: 50, duration: 420, depth: DEPTH.fx })
        },
        states: () => [...state],
        enable(list) {
            enabled = new Set(list)
            zones.forEach((zone, i) => {
                if (zone.input) zone.input.enabled = enabled.has(i)
            })
            if (!list.length) hover = null
        },
        hit,
        all() {
            const a = hit(0)
            const b = hit(CRITTER.xs.length - 1)
            const left = a.x - a.w / 2
            const right = b.x + b.w / 2
            return { x: (left + right) / 2, y: a.y, w: right - left, h: a.h }
        },
        shake(i) {
            return FX.shake(scene, bodies[i].box, { amount: 9, times: 4 })
        },
        cross(onHop) {
            const order = [2, 1, 0]
            order.forEach((i, k) => {
                const { box } = bodies[i]
                const dist = CROSS.exitX - box.x
                const duration = (dist / CROSS.speed) * 1000
                scene.tweens.add({ targets: box, x: CROSS.exitX, duration, delay: k * CROSS.stagger, ease: 'Linear' })
                scene.tweens.add({
                    targets: box,
                    y: CRITTER.footY - CROSS.hop,
                    duration: CROSS.hopMs,
                    delay: k * CROSS.stagger,
                    yoyo: true,
                    repeat: Math.ceil(duration / (CROSS.hopMs * 2)),
                    ease: 'Sine.easeOut',
                    onRepeat: k === 0 ? onHop : undefined,
                })
            })
        },
        reset,
        update() {
            glow.clear()
            if (hover === null || !enabled.has(hover)) return
            glow.fillStyle(C.white, 0.35)
            glow.fillEllipse(CRITTER.xs[hover], CRITTER.footY + 2, 150, 32)
            glow.lineStyle(4, C.white, 0.9)
            glow.strokeEllipse(CRITTER.xs[hover], CRITTER.footY + 2, 150, 32)
        },
        destroy() {
            zones.forEach(z => z.destroy())
            bodies.forEach(({ box, breath }) => {
                breath.stop()
                scene.tweens.killTweensOf(box)
                box.destroy()
            })
            glow.destroy()
        },
    }
}

