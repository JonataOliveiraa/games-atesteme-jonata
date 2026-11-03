import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { CLOUD, DEPTH, W, WORLD } from '../data/layout'
import { C } from '../data/theme'
import type { Art, Point, Rect } from '../types'
import { baked, cloudBox, createArtView, paintCloud } from './art'

export interface World {
    setGoal(art: Art, cloudY: number): void
    revealGoal(): Promise<void>
    celebrate(): Promise<void>
    goalPoint(): Point
    readonly cloudRect: Rect
    destroy(): void
}

const SKY = 'sdd-sky'
const GROUND = 'sdd-ground'
const PUFF = 'sdd-puff'
const GOAL_CLOUD = 'sdd-goal-cloud'

const DECOR = [
    { x: 150, y: 120, s: 0.9 },
    { x: 1150, y: 330, s: 0.7 },
    { x: 120, y: 620, s: 0.6 },
    { x: 1170, y: 860, s: 0.8 },
    { x: 1010, y: 1110, s: 0.55 },
    { x: 240, y: 960, s: 0.5 },
]

function makeSky(scene: Phaser.Scene) {
    if (scene.textures.exists(SKY)) return
    const tex = scene.textures.createCanvas(SKY, 4, 256)
    if (!tex) return
    const ctx = tex.getContext()
    const grad = ctx.createLinearGradient(0, 0, 0, 256)
    const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`
    grad.addColorStop(0, hex(C.skyTop))
    grad.addColorStop(0.75, hex(C.skyLow))
    grad.addColorStop(1, hex(C.paperLight))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 4, 256)
    tex.refresh()
    tex.setFilter(Phaser.Textures.FilterMode.LINEAR)
}

export function createWorld(scene: Phaser.Scene): World {
    makeSky(scene)
    const sky = scene.add
        .image(0, 0, SKY)
        .setOrigin(0)
        .setDisplaySize(W, WORLD.groundY + 20)
        .setDepth(DEPTH.bg)

    baked(scene, PUFF, 260, 120, g => {
        g.fillStyle(C.white, 1)
        g.fillCircle(70, 72, 42)
        g.fillCircle(126, 52, 52)
        g.fillCircle(186, 72, 40)
        g.fillRoundedRect(36, 70, 190, 44, 22)
    })
    const decor = DECOR.map(d => scene.add.image(d.x, d.y, PUFF).setScale(d.s).setAlpha(0.75).setDepth(DEPTH.decor))

    const groundH = WORLD.h - WORLD.groundY + 20
    baked(scene, GROUND, W, groundH, g => {
        g.fillStyle(C.grass, 1)
        g.fillRect(0, 14, W, groundH)
        g.fillStyle(C.grassDark, 1)
        g.fillRect(0, 14, W, 10)
        g.lineStyle(5, C.ink, 1)
        g.beginPath()
        g.moveTo(0, 16)
        for (let x = 0; x <= W; x += 40) g.lineTo(x, 16 + Math.sin(x / 90) * 4)
        g.strokePath()
        g.lineStyle(4, C.ink, 1)
        for (const x of [90, 330, 560, 880, 1110, 1230]) {
            g.lineBetween(x - 10, 6, x - 4, 16)
            g.lineBetween(x, 2, x, 16)
            g.lineBetween(x + 10, 6, x + 4, 16)
        }
    })
    const ground = scene.add.image(0, WORLD.groundY - 16, GROUND).setOrigin(0).setDepth(DEPTH.decor + 1)

    const box = cloudBox(CLOUD.w, CLOUD.h)
    baked(scene, GOAL_CLOUD, box.w, box.h, g => paintCloud(g, box.w / 2, box.h / 2, CLOUD.w, CLOUD.h))
    const cloud = scene.add.container(WORLD.ladderX, 0).setDepth(DEPTH.cloud)
    const cloudImage = scene.add.image(0, 0, GOAL_CLOUD)
    const goal = createArtView(scene, CLOUD.artDX, -6, CLOUD.art)
    cloud.add([cloudImage, goal.container])
    goal.container.setAlpha(0)

    const rect: Rect = { x: WORLD.ladderX, y: 0, w: CLOUD.w, h: CLOUD.h }

    return {
        setGoal(art, cloudY) {
            FX.kill(scene, [cloud, goal.container])
            cloud.setPosition(WORLD.ladderX, cloudY).setScale(1)
            goal.set(art)
            goal.container.setAlpha(0).setScale(1)
            rect.y = cloudY
        },
        async revealGoal() {
            FX.kill(scene, goal.container)
            await FX.popIn(scene, goal.container, { from: 0.4 })
            await FX.to(scene, goal.container, { scale: 1.1 }, { duration: 200, yoyo: true, ease: 'Sine.easeInOut' })
        },
        async celebrate() {
            void FX.stars(scene, WORLD.ladderX + CLOUD.artDX, rect.y, { color: C.gold, count: 14, depth: DEPTH.worldFx })
            await FX.impact(scene, cloud, 0.1)
            await FX.to(scene, goal.container, { scale: 1.12 }, { duration: 240, yoyo: true, ease: Ease.back(2) })
        },
        goalPoint() {
            return { x: WORLD.ladderX + CLOUD.artDX, y: rect.y - 6 }
        },
        cloudRect: rect,
        destroy() {
            goal.destroy()
            cloud.destroy()
            ground.destroy()
            decor.forEach(d => d.destroy())
            sky.destroy()
        },
    }
}
