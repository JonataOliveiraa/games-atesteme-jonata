import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FISH_FRAME, FISH_SHEET, INVENT, INVENT_SHEET, cellKey, cellScale } from '../data/files'
import { DEPTH, FISH_SIZE, INVENT_SPOT, W, WATER } from '../data/layout'
import { C } from '../data/theme'
import type { InventionId, Vec } from '../types'
import type { Audio } from './audio'

export interface InventionHooks {
    trash(): Phaser.GameObjects.Image[]
    clean(ms: number): Promise<void>
    bigBack(from: Vec): Promise<void>
}

export interface Inventions {
    play(id: InventionId): Promise<void>
    destroy(): void
}

const SIZE = { robo: 0.78, bercario: 0.62, drone: 0.62, tree: 0.62, baby: 0.32 } as const
const ROBO_ORIGIN = 0.62
const NET = { x: 86, y: 166 - 256 * ROBO_ORIGIN }
const TREE_FOOT = 244 / 256
const AWAY = { x: 1320, y: 640 }
const DRONE_Y = INVENT_SPOT.drone.from.y

export function createInventions(scene: Phaser.Scene, audio: Audio, hooks: InventionHooks): Inventions {
    const made: Phaser.GameObjects.GameObject[] = []
    const scale = () => cellScale(scene.textures, INVENT_SHEET)
    const fishScale = () => cellScale(scene.textures, FISH_SHEET)

    const add = (x: number, y: number, frame: number, size: number, depth: number) => {
        const img = scene.add.image(x, y, INVENT_SHEET.key, cellKey(frame)).setScale(size * scale()).setDepth(depth)
        made.push(img)
        return img
    }

    const drop = (img: Phaser.GameObjects.GameObject) => {
        scene.tweens.killTweensOf(img)
        const at = made.indexOf(img)
        if (at >= 0) made.splice(at, 1)
        img.destroy()
    }

    const splash = (x: number) => {
        audio.splash()
        void FX.sparks(scene, x, WATER.y, { color: C.surface, count: 12, spread: 100, size: 8, duration: 520, depth: DEPTH.tool + 1 })
    }

    const robo = async () => {
        const { from, stop } = INVENT_SPOT.robo
        const bot = add(from.x, from.y, INVENT.robo, SIZE.robo, DEPTH.tool).setOrigin(0.5, ROBO_ORIGIN)
        FX.wiggle(scene, bot, { deg: 2.5, duration: 900 })
        audio.wake()
        await FX.to(scene, bot, { x: stop.x }, { duration: 1500, ease: 'Sine.easeOut' })
        const net = { x: stop.x + NET.x * bot.scaleX, y: stop.y + NET.y * bot.scaleY }
        const junk = hooks.trash()
        await FX.all(
            ...junk.map((j, i) =>
                FX.wait(scene, i * 220).then(async () => {
                    scene.tweens.killTweensOf(j)
                    j.setDepth(DEPTH.tool + 0.5)
                    audio.throw()
                    await FX.all(FX.arcTo(scene, j, net, { height: 110, duration: 620 }), FX.to(scene, j, { angle: 200, scale: j.scale * 0.6 }, { duration: 620 }))
                    audio.plop()
                    j.destroy()
                }),
            ),
        )
        bot.setFrame(cellKey(INVENT.roboFull))
        splash(net.x)
        void FX.impact(scene, bot, 0.1)
        await FX.wait(scene, 650)
        await FX.to(scene, bot, { x: W + 200 }, { duration: 1400, ease: 'Sine.easeIn' })
        drop(bot)
        await hooks.clean(900)
        await hooks.bigBack(AWAY)
    }

    const bercario = async () => {
        const { at } = INVENT_SPOT.bercario
        const nest = add(at.x - 320, 120, INVENT.bercario, SIZE.bercario, DEPTH.tool)
        audio.throw()
        await FX.all(FX.arcTo(scene, nest, at, { height: 140, duration: 1000 }), FX.to(scene, nest, { angle: 360 }, { duration: 1000 }))
        nest.setAngle(0)
        splash(at.x)
        FX.float(scene, nest, { amount: 5, duration: 1300 })
        await FX.wait(scene, 600)
        nest.setFrame(cellKey(INVENT.bercarioOpen))
        audio.ping()
        void FX.impact(scene, nest, 0.12)
        const base = FISH_SIZE.small * fishScale()
        const babies = [-70, 0, 70].map((dx, i) => {
            const f = scene.add
                .image(at.x + dx * 0.3, at.y - 10, FISH_SHEET.key, cellKey(FISH_FRAME.small))
                .setScale(base * SIZE.baby)
                .setDepth(DEPTH.fish)
                .setFlipX(i === 0)
            made.push(f)
            return f
        })
        await FX.all(
            ...babies.map((f, i) =>
                FX.wait(scene, i * 180).then(() => {
                    audio.plop()
                    return FX.to(scene, f, { x: at.x + (i - 1) * 90, y: at.y + 70 + i * 34, scale: base }, { duration: 1600, ease: 'Sine.easeInOut' })
                }),
            ),
        )
        audio.cheer()
        await FX.all(...babies.map(f => FX.to(scene, f, { alpha: 0 }, { duration: 450 })))
        babies.forEach(drop)
        await hooks.bigBack({ x: at.x, y: at.y + 120 })
    }

    const drone = async () => {
        const { from, trees } = INVENT_SPOT.drone
        const bot = add(from.x, from.y, INVENT.drone, SIZE.drone, DEPTH.tool)
        FX.wiggle(scene, bot, { deg: 3, duration: 700 })
        audio.wake()
        for (const spot of trees) {
            const d = Math.abs(spot.x - bot.x)
            await FX.to(scene, bot, { x: spot.x, y: DRONE_Y }, { duration: Math.max(500, d * 1.6), ease: 'Sine.easeInOut' })
            const seed = add(spot.x, DRONE_Y + 40, INVENT.tree, SIZE.tree * 0.18, DEPTH.vila - 1).setOrigin(0.5, TREE_FOOT)
            audio.throw()
            await FX.to(scene, seed, { y: spot.y }, { duration: 420, ease: 'Quad.easeIn' })
            audio.plop()
            const full = SIZE.tree * scale()
            seed.setScale(0)
            await FX.to(scene, seed, { scale: full }, { duration: 520, ease: 'Back.easeOut' })
            await FX.to(scene, seed, { y: spot.y - 10 }, { duration: 140, yoyo: true })
            void FX.stars(scene, spot.x, spot.y - 80, { color: C.leafLight, count: 6, rise: 70, depth: DEPTH.vila })
        }
        await FX.to(scene, bot, { x: W + 160, y: DRONE_Y - 40 }, { duration: 1100, ease: 'Sine.easeIn' })
        drop(bot)
        audio.cheer()
        await hooks.clean(1100)
        await hooks.bigBack(AWAY)
    }

    return {
        async play(id) {
            if (id === 'robo') await robo()
            else if (id === 'bercario') await bercario()
            else await drone()
        },
        destroy() {
            made.splice(0).forEach(o => {
                scene.tweens.killTweensOf(o)
                o.destroy()
            })
        },
    }
}
