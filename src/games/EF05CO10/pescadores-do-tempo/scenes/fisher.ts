import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FISHER_SHEET, FISH_FRAME, FISH_SHEET, TALK_SHEET, cellKey, cellScale } from '../data/files'
import { DEPTH, FISHER, WATER } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import { ERAS } from '../data/eras'
import type { Poses, Rect, Vec } from '../types'
import type { Audio } from './audio'

type Img = Phaser.GameObjects.Image

export interface Fisher {
    setEra(era: number): void
    swap(era: number): Promise<void>
    throwSpear(fish: Img | null, miss: Vec): Promise<Img | null>
    castLine(goal: Vec, fish: Img | null): Promise<Img | null>
    dropSonar(at: Vec): Promise<void>
    liftSonar(): Promise<void>
    release(fish: Img | null): Promise<void>
    talk(frame: number): void
    still(): void
    mouth(): Vec
    phone(): Vec
    rect(): Rect
    destroy(): void
}

export const fisherPoint = (x: number, y: number): Vec => ({
    x: FISHER.x + (x - FISHER.cellW / 2) * FISHER.scale,
    y: FISHER.y + (y - FISHER.cellH * FISHER.foot) * FISHER.scale,
})

const run = (scene: Phaser.Scene, duration: number, step: (t: number) => void) =>
    new Promise<void>(resolve => {
        const k = { t: 0 }
        scene.tweens.add({
            targets: k,
            t: 1,
            duration,
            ease: 'Sine.easeInOut',
            onUpdate: () => step(k.t),
            onComplete: () => resolve(),
            onStop: () => resolve(),
        })
    })

export function createFisher(scene: Phaser.Scene, audio: Audio, startEra: number): Fisher {
    const scales: Record<string, number> = {
        [FISHER_SHEET.key]: FISHER.scale * cellScale(scene.textures, FISHER_SHEET),
        [TALK_SHEET.key]: FISHER.scale * cellScale(scene.textures, TALK_SHEET),
    }
    const fishScale = cellScale(scene.textures, FISH_SHEET)
    let era = startEra
    const img = scene.add.image(FISHER.x, FISHER.y, FISHER_SHEET.key, cellKey(0)).setOrigin(0.5, FISHER.foot).setDepth(DEPTH.fisher)
    const show = (key: string, index: number) => img.setTexture(key, cellKey(index)).setScale(scales[key])
    const line = scene.add.graphics().setDepth(DEPTH.line)
    const bob = scene.add
        .container(0, 0, [scene.add.circle(0, 2, 9, C.white), scene.add.ellipse(0, -3, 18, 10, C.oops)])
        .setDepth(DEPTH.tool)
        .setVisible(false)
    let buoy: Img | null = null
    const spare: Phaser.GameObjects.GameObject[] = []

    const pose = (p: keyof Omit<Poses, 'key'>) => show(ERAS[era].poses.key, ERAS[era].poses[p])
    pose('idle')
    const tip = () => fisherPoint(FISHER.tip.x, FISHER.tip.y)
    const lift = () => fisherPoint(FISHER.lift.x, FISHER.lift.y)
    const hand = () => fisherPoint(FISHER.hand.x, FISHER.hand.y)

    let hook: Vec | null = null
    const drawLine = () => {
        line.clear()
        if (!bob.visible) return
        const t = tip()
        line.lineStyle(2, C.white, 0.9)
        line.beginPath()
        line.moveTo(t.x, t.y)
        const mx = (t.x + bob.x) / 2
        const my = Math.min(t.y, bob.y) - 30
        for (let k = 1; k <= 12; k++) {
            const u = k / 12
            line.lineTo((1 - u) * (1 - u) * t.x + 2 * (1 - u) * u * mx + u * u * bob.x, (1 - u) * (1 - u) * t.y + 2 * (1 - u) * u * my + u * u * bob.y)
        }
        line.strokePath()
        if (hook) {
            line.lineStyle(2, C.white, 0.7)
            line.lineBetween(bob.x, bob.y, hook.x, hook.y)
        }
    }
    scene.events.on('update', drawLine)

    const splash = (x: number) => {
        audio.splash()
        const ring = scene.add.ellipse(x, WATER.y, 30, 10, C.white, 0).setStrokeStyle(3, C.white, 0.9).setDepth(DEPTH.fish + 2)
        scene.tweens.add({ targets: ring, scaleX: 3.2, scaleY: 2.2, alpha: 0, duration: 600, onComplete: () => ring.destroy() })
        void FX.sparks(scene, x, WATER.y - 4, { color: C.surface, count: 10, spread: 50, size: 7, duration: 420, depth: DEPTH.fish + 2 })
    }

    const carry = async (fish: Img) => {
        pose('cheer')
        const to = lift()
        fish.setFlipX(false).setAlpha(1)
        await FX.to(scene, fish, { x: to.x, y: to.y, angle: -16 }, { duration: TIMING.reel, ease: 'Sine.easeOut' })
        audio.catchFish()
        void FX.sparks(scene, to.x, to.y, { color: C.butter, count: 16, spread: 90, size: 9, duration: 600, depth: DEPTH.tool + 2 })
        await FX.to(scene, fish, { y: to.y - 10 }, { duration: 160, yoyo: true, repeat: 1 })
        return fish
    }

    return {
        setEra(next) {
            era = next
            pose('idle')
        },
        async swap(next) {
            await FX.to(scene, img, { alpha: 0 }, { duration: 220 })
            era = next
            pose('idle')
            await FX.to(scene, img, { alpha: 1 }, { duration: 260 })
        },
        async throwSpear(fish, miss) {
            const goal = fish ? { x: fish.x, y: fish.y } : miss
            pose('throw')
            audio.throw()
            const from = hand()
            const s = scene.add.image(from.x, from.y, FISH_SHEET.key, cellKey(FISH_FRAME.spear)).setScale(0.6 * fishScale).setDepth(DEPTH.tool)
            spare.push(s)
            const aim = Math.atan2(goal.y - from.y, goal.x - from.x)
            s.setRotation(aim - 0.5)
            scene.tweens.add({ targets: s, rotation: aim + 0.25, duration: TIMING.throw })
            await FX.arcTo(scene, s, goal, { height: 70, duration: TIMING.throw })
            splash(Phaser.Math.Linear(from.x, goal.x, 0.8))
            if (fish) {
                const back = lift()
                await FX.all(FX.to(scene, s, { x: back.x + 30, y: back.y + 20, alpha: 0 }, { duration: TIMING.reel }), carry(fish))
                return fish
            }
            pose('idle')
            audio.miss()
            await FX.to(scene, s, { y: s.y + 46, alpha: 0.35, rotation: s.rotation + 0.5 }, { duration: TIMING.sink, ease: 'Sine.easeIn' })
            return null
        },
        async castLine(goal, fish) {
            pose('cast')
            audio.throw()
            const t = tip()
            bob.setPosition(t.x, t.y).setVisible(true).setAlpha(1)
            hook = null
            await FX.arcTo(scene, bob, { x: goal.x, y: WATER.y }, { height: 90, duration: TIMING.cast })
            audio.plop()
            splash(goal.x)
            await run(scene, 420, u => (hook = { x: goal.x, y: Phaser.Math.Linear(WATER.y, goal.y, u) }))
            if (fish) {
                await FX.wait(scene, TIMING.bite * 0.5)
                audio.bite()
                await FX.to(scene, bob, { y: WATER.y + 12 }, { duration: 120, yoyo: true, repeat: 2 })
                fish.setAlpha(1)
                const from = { x: fish.x, y: fish.y }
                await run(scene, TIMING.reel * 0.7, u => {
                    const x = Phaser.Math.Linear(from.x, goal.x, u)
                    const y = Phaser.Math.Linear(from.y, WATER.y - 10, u)
                    fish.setPosition(x, y)
                    hook = { x, y }
                    bob.setPosition(goal.x, WATER.y + Math.sin(u * 20) * 3)
                })
                splash(goal.x)
                bob.setVisible(false)
                hook = null
                return carry(fish)
            }
            await FX.wait(scene, TIMING.bite)
            audio.miss()
            hook = null
            await FX.to(scene, bob, { x: t.x, y: t.y, alpha: 0.6 }, { duration: TIMING.reel })
            bob.setVisible(false)
            pose('idle')
            return null
        },
        async dropSonar(at) {
            pose('throw')
            audio.throw()
            const from = hand()
            buoy?.destroy()
            buoy = scene.add.image(from.x, from.y, FISH_SHEET.key, cellKey(FISH_FRAME.buoy)).setScale(0.42 * fishScale).setDepth(DEPTH.tool)
            const drop = { x: at.x, y: WATER.y - 6 }
            await FX.arcTo(scene, buoy, drop, { height: 80, duration: TIMING.throw })
            splash(drop.x)
            pose('idle')
            scene.tweens.add({ targets: buoy, y: drop.y + 4, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            audio.ping()
        },
        async liftSonar() {
            if (!buoy) return
            const b = buoy
            buoy = null
            scene.tweens.killTweensOf(b)
            await FX.to(scene, b, { alpha: 0 }, { duration: 300 })
            b.destroy()
        },
        async release(fish) {
            spare.splice(0).forEach(o => o.destroy())
            if (fish) {
                await FX.to(scene, fish, { alpha: 0, scale: fish.scale * 0.6 }, { duration: 320 })
                fish.destroy()
            }
            pose('idle')
        },
        talk(frame) {
            show(TALK_SHEET.key, frame)
        },
        still() {
            pose('idle')
        },
        mouth: () => fisherPoint(196, 96),
        phone: () => fisherPoint(96, 196),
        rect: () => ({ x: FISHER.x - 96, y: FISHER.y - 262, w: 196, h: 274 }),
        destroy() {
            scene.events.off('update', drawLine)
            spare.forEach(o => o.destroy())
            buoy?.destroy()
            bob.destroy()
            line.destroy()
            img.destroy()
        },
    }
}
