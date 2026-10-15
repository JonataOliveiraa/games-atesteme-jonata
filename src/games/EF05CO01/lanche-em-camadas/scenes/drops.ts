import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ING_SHEET, UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { INGREDIENTS } from '../data/ingredients'
import { CHEF, DEPTH, FLOOR, LANES, LAYER, TOSS } from '../data/layout'
import { TIMING } from '../data/timing'
import type { IngredientId } from '../types'
import { SHADOW, fitInto } from './art'
import type { View } from './view'

export interface Drop {
    id: IngredientId
    lane: number
    img: Phaser.GameObjects.Image
    shadow: Phaser.GameObjects.Image
    vy: number
    spin: number
    phase: 'toss' | 'fall' | 'done'
}

export interface Catcher {
    x: number
    top: number
    half: number
}

export interface Drops {
    spawn(id: IngredientId, lane: number, speed: number): Drop
    update(delta: number, catcher: Catcher): { caught: Drop[]; missed: Drop[] }
    list(): Drop[]
    take(drop: Drop): void
    miss(drop: Drop): Promise<void>
    clear(): void
    destroy(): void
}

export function createDrops(scene: Phaser.Scene, view: View): Drops {
    let drops: Drop[] = []

    const bottomOf = (d: Drop) => d.img.y + d.img.displayHeight / 2

    const drops_: Drops = {
        spawn(id, lane, speed) {
            const x = LANES[lane]
            const img = view.world(fitInto(scene.add.image(CHEF.x, TOSS.fromY, ING_SHEET.key, cellKey(INGREDIENTS[id].cell)), LAYER.w * 0.6).setDepth(DEPTH.drop))
            const full = img.scale / 0.6
            const shadow = view.world(scene.add.image(x, FLOOR - 4, SHADOW).setDisplaySize(LAYER.w * 0.7, 18).setAlpha(0).setDepth(DEPTH.shadow))
            const drop: Drop = { id, lane, img, shadow, vy: speed, spin: Phaser.Math.FloatBetween(-40, 40), phase: 'toss' }
            drops.push(drop)
            const from = { x: CHEF.x, y: TOSS.fromY }
            const k = { t: 0 }
            scene.tweens.add({
                targets: k,
                t: 1,
                duration: TIMING.toss,
                ease: 'Sine.easeOut',
                onUpdate: () => {
                    if (drop.phase !== 'toss') return
                    const lift = Math.sin(k.t * Math.PI * 0.5) * 70
                    img.setPosition(Phaser.Math.Linear(from.x, x, k.t), Phaser.Math.Linear(from.y, TOSS.topY, k.t) - lift * (1 - k.t))
                    img.setScale(Phaser.Math.Linear(full * 0.6, full, k.t))
                    img.setAngle(k.t * 360)
                },
                onComplete: () => {
                    if (drop.phase !== 'toss') return
                    img.setAngle(0).setScale(full)
                    drop.phase = 'fall'
                },
            })
            return drop
        },
        update(delta, catcher) {
            const caught: Drop[] = []
            const missed: Drop[] = []
            const dt = delta / 1000
            drops.forEach(d => {
                if (d.phase !== 'fall') return
                const before = bottomOf(d)
                d.img.y += d.vy * dt
                d.img.angle += d.spin * dt * 0.3
                const after = bottomOf(d)
                const near = Phaser.Math.Clamp((d.img.y - TOSS.topY) / (FLOOR - TOSS.topY), 0, 1)
                d.shadow.setAlpha(0.08 + near * 0.18)
                if (before < catcher.top + 6 && after >= catcher.top && Math.abs(d.img.x - catcher.x) <= catcher.half) {
                    caught.push(d)
                    return
                }
                if (after >= FLOOR - 6) missed.push(d)
            })
            return { caught, missed }
        },
        list: () => drops.filter(d => d.phase !== 'done'),
        take(drop) {
            drop.phase = 'done'
            drops = drops.filter(d => d !== drop)
            scene.tweens.killTweensOf([drop.img, drop.shadow])
            drop.img.destroy()
            drop.shadow.destroy()
        },
        async miss(drop) {
            drop.phase = 'done'
            drops = drops.filter(d => d !== drop)
            const { img, shadow } = drop
            const puff = view.world(fitInto(scene.add.image(img.x, FLOOR - 20, UI_SHEET.key, cellKey(UI_CELL.puff)), 90).setDepth(DEPTH.fx).setAlpha(0))
            await FX.to(scene, img, { y: img.y - 40, angle: img.angle + 30 }, { duration: 180, ease: 'Quad.easeOut' })
            void FX.to(scene, puff, { alpha: 1, scale: puff.scale * 1.3 }, { duration: 200 })
            await FX.to(scene, [img, shadow], { alpha: 0 }, { duration: 260 })
            await FX.to(scene, puff, { alpha: 0 }, { duration: 260 })
            img.destroy()
            shadow.destroy()
            puff.destroy()
        },
        clear() {
            drops.forEach(d => {
                d.phase = 'done'
                scene.tweens.killTweensOf([d.img, d.shadow])
                const { img, shadow } = d
                void FX.to(scene, [img, shadow], { alpha: 0 }, { duration: 220 }).then(() => {
                    img.destroy()
                    shadow.destroy()
                })
            })
            drops = []
        },
        destroy() {
            drops.forEach(d => {
                scene.tweens.killTweensOf([d.img, d.shadow])
                d.img.destroy()
                d.shadow.destroy()
            })
            drops = []
        },
    }
    return drops_
}
