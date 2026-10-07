import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { PIECE, PIECES, THINGS, THING_FRAME } from '../data/files'
import { DEPTH, H, THING_VIEW, slotX } from '../data/layout'
import { C } from '../data/theme'
import type { Kind, Place, ThingDef, Tool, Vec } from '../types'

export interface ThingView {
    readonly def: ThingDef
    readonly sprite: Phaser.GameObjects.Sprite
    readonly x: number
    y: number
    resolved: boolean
    spoiled: boolean
    quiet: boolean
}

export interface Things {
    readonly list: ThingView[]
    readonly key: string
    setPlace(place: Place): void
    spawn(def: ThingDef, y?: number, x?: number): ThingView
    scroll(dy: number): ThingDef[]
    update(time: number): void
    solve(view: ThingView, nose: () => Vec): Promise<void>
    spoil(view: ThingView, tool: Tool, nose: () => Vec, shake: () => Promise<void>, heat: () => Promise<void>): Promise<void>
    fadeAll(): Promise<void>
    clear(): void
    destroy(): void
}

const SPOIL_MS = 700
const MARK = { r: 84, dashes: 10, alpha: 0.42, dot: 5 } as const

const BIT_SCALE: Record<Place, number> = { earth: 0.13, space: 0.32, moon: 0.38 }

export const START: Record<Kind, number> = {
    leaves: THING_FRAME.leaves,
    fire: THING_FRAME.fire,
    sheep: THING_FRAME.sheep,
}

export function createThings(scene: Phaser.Scene): Things {
    let list: ThingView[] = []
    const marks = scene.add.graphics().setDepth(DEPTH.things - 1)
    let key = THINGS.earth
    let bit = BIT_SCALE.earth
    const extras = new Set<Phaser.GameObjects.GameObject>()

    const extra = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
        extras.add(o)
        o.once('destroy', () => extras.delete(o))
        return o
    }

    const piece = (x: number, y: number, k: string, frame: number, scale: number) =>
        extra(scene.add.image(x, y, k, frame).setScale(scale).setDepth(DEPTH.fx + 1))

    const leafBurst = (x: number, y: number, count: number, toward?: { x: number; y: number }) => {
        const jobs: Promise<void>[] = []
        for (let k = 0; k < count; k++) {
            const leaf = piece(x + Phaser.Math.Between(-60, 60), y + Phaser.Math.Between(-40, 30), key, THING_FRAME.leaf, bit)
            leaf.setAngle(Phaser.Math.Between(0, 360))
            const target = toward
                ? { x: toward.x + Phaser.Math.Between(-10, 10), y: toward.y + Phaser.Math.Between(-10, 10), scale: bit * 0.3 }
                : { x: leaf.x + Phaser.Math.Between(-260, 260), y: leaf.y - Phaser.Math.Between(160, 380), scale: bit * 0.75 }
            jobs.push(
                FX.to(scene, leaf, { ...target, angle: leaf.angle + Phaser.Math.Between(240, 600), alpha: toward ? 1 : 0 }, { duration: Phaser.Math.Between(420, 760), delay: k * 25, ease: toward ? 'Sine.easeIn' : Ease.smooth }).then(() =>
                    leaf.destroy(),
                ),
            )
        }
        return Promise.all(jobs).then(() => undefined)
    }

    const drops = (x: number, y: number, count: number) => {
        for (let k = 0; k < count; k++) {
            const a = (k / count) * Math.PI * 2
            const d = piece(x, y, PIECES, PIECE.drop, 0.12)
            void FX.to(scene, d, { x: x + Math.cos(a) * 110, y: y + Math.sin(a) * 90, alpha: 0 }, { duration: Phaser.Math.Between(500, 800), delay: k * 40, ease: 'Sine.easeOut' }).then(() => d.destroy())
        }
    }

    const sparkles = (x: number, y: number) => {
        for (let k = 0; k < 5; k++) {
            const a = (k / 5) * Math.PI * 2
            const s = piece(x, y, PIECES, PIECE.sparkle, 0.05)
            void FX.to(scene, s, { x: x + Math.cos(a) * 90, y: y + Math.sin(a) * 90, scale: 0.16, alpha: 0, angle: 90 }, { duration: 560 }).then(() => s.destroy())
        }
    }

    const steam = (x: number, y: number) => {
        for (let k = 0; k < 5; k++) {
            const g = extra(scene.add.graphics().setDepth(DEPTH.fx + 1))
            g.fillStyle(C.white, 0.9)
            g.fillCircle(0, 0, 22)
            g.lineStyle(3, C.ink, 0.6)
            g.strokeCircle(0, 0, 22)
            g.setPosition(x + Phaser.Math.Between(-50, 50), y - 40).setScale(0.4)
            void FX.to(scene, g as unknown as Phaser.GameObjects.Image, { y: g.y - Phaser.Math.Between(80, 140), scale: 1.3, alpha: 0 }, { duration: 700, delay: k * 70 }).then(() => g.destroy())
        }
    }

    const finish = async (view: ThingView, nose: () => Vec) => {
        const s = view.sprite
        const kind = view.def.kind
        if (kind === 'leaves') {
            s.setFrame(THING_FRAME.clean)
            sparkles(s.x, s.y - 30)
            void leafBurst(s.x, s.y - 20, 9)
            await FX.impact(scene, s, 0.1)
            return
        }
        if (kind === 'fire') {
            await FX.wait(scene, 260)
            s.setFrame(THING_FRAME.saved)
            steam(s.x, s.y - 40)
            drops(s.x, s.y - 60, 4)
            await FX.impact(scene, s, 0.12)
            sparkles(s.x, s.y - 40)
            return
        }
        s.setVisible(false)
        s.setAngle(0)
        const lamb = extra(scene.add.sprite(s.x, s.y, s.texture.key, THING_FRAME.sheepFree).setScale(THING_VIEW.scale).setDepth(DEPTH.fx))
        const from = { x: lamb.x, y: lamb.y }
        await new Promise<void>(resolve =>
            scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 620,
                ease: 'Sine.easeInOut',
                onUpdate: tween => {
                    const t = tween.getValue() ?? 0
                    const to = nose()
                    lamb.setPosition(Phaser.Math.Linear(from.x, to.x, t), Phaser.Math.Linear(from.y, to.y - 40, t))
                    lamb.setAngle(t * 540).setScale(THING_VIEW.scale * (1 - t * 0.25))
                },
                onComplete: () => resolve(),
            }),
        )
        sparkles(lamb.x, lamb.y)
        void FX.ping(scene, lamb.x, lamb.y, C.pink, { radius: 70, duration: 420, depth: DEPTH.fx + 2 })
        await FX.to(scene, lamb, { y: H + 140, x: lamb.x + Phaser.Math.Between(-80, 80), angle: lamb.angle + 360 }, { duration: 700, ease: 'Sine.easeIn' })
        lamb.destroy()
    }

    const ruin = async (view: ThingView, tool: Tool, nose: () => Vec, shake: () => Promise<void>, heat: () => Promise<void>) => {
        const s = view.sprite
        const kind = view.def.kind
        if (kind === 'leaves' && tool === 'water') {
            s.setFrame(THING_FRAME.soaked)
            drops(s.x, s.y + 10, 6)
            await FX.impact(scene, s, 0.18)
        } else if (kind === 'leaves') {
            s.setVisible(false)
            await leafBurst(s.x, s.y - 20, 12, nose())
            await shake()
            void leafBurst(nose().x - 40, nose().y, 8)
        } else if (kind === 'fire' && tool === 'blower') {
            s.setFrame(THING_FRAME.bigFire)
            void FX.sparks(scene, s.x, s.y - 70, { color: C.red, count: 16, spread: 140, depth: DEPTH.fx + 1 })
            await FX.impact(scene, s, 0.22)
        } else if (kind === 'fire') {
            s.setFrame(THING_FRAME.bigFire)
            void FX.sparks(scene, s.x, s.y + 40, { color: C.flame, count: 12, spread: 120, depth: DEPTH.fx + 1 })
            await heat()
        } else if (tool === 'water') {
            s.setFrame(THING_FRAME.wetSheep)
            drops(s.x, s.y + 20, 5)
            await FX.impact(scene, s, 0.16)
        } else {
            s.setFrame(THING_FRAME.dizzySheep)
            await FX.to(scene, s, { angle: 720 }, { duration: 1000, ease: 'Sine.easeOut' })
        }
    }

    const restore = (view: ThingView) => {
        const s = view.sprite
        scene.tweens.killTweensOf(s)
        s.setFrame(START[view.def.kind]).setVisible(true).setAngle(0).setScale(THING_VIEW.scale * 0.6)
        void FX.to(scene, s, { scale: THING_VIEW.scale }, { duration: 260, ease: Ease.back(2.2) })
        sparkles(view.x, view.y)
    }

    return {
        get list() {
            return list
        },
        get key() {
            return key
        },
        setPlace(place) {
            key = THINGS[place]
            bit = BIT_SCALE[place]
        },
        spawn(def, y = THING_VIEW.spawnY, x = slotX(def.slot)) {
            const sprite = scene.add.sprite(x, y, key, START[def.kind]).setScale(THING_VIEW.scale).setDepth(DEPTH.things)
            const view: ThingView = { def, sprite, x, y, resolved: false, spoiled: false, quiet: false }
            list.push(view)
            return view
        },
        scroll(dy) {
            const gone: ThingDef[] = []
            list = list.filter(view => {
                view.y += dy
                view.sprite.y = view.y
                if (view.y < THING_VIEW.exitY) return true
                if (!view.def.decoy && (!view.resolved || view.spoiled)) gone.push(view.def)
                view.sprite.destroy()
                return false
            })
            return gone
        },
        update(time) {
            marks.clear()
            const pulse = 0.75 + Math.sin(time * 0.006) * 0.25
            const turn = time * 0.0008
            list.forEach((view, k) => {
                if (view.def.kind === 'sheep' && !view.resolved) view.sprite.setAngle(Math.sin(time * 0.006 + k) * 5)
                if (view.resolved || view.quiet || !view.sprite.visible) return
                marks.lineStyle(4, C.yellow, MARK.alpha * pulse)
                for (let d = 0; d < MARK.dashes; d++) {
                    const a = turn + (d / MARK.dashes) * Math.PI * 2
                    marks.beginPath()
                    marks.arc(view.x, view.y, MARK.r, a, a + (Math.PI / MARK.dashes) * 0.9, false)
                    marks.strokePath()
                }
                marks.fillStyle(C.yellow, 0.9 * MARK.alpha * pulse * 2)
                marks.fillCircle(view.x, view.y - MARK.r - 12, MARK.dot)
            })
        },
        solve(view, nose) {
            return finish(view, nose)
        },
        async spoil(view, tool, nose, shake, heat) {
            view.resolved = true
            view.spoiled = true
            void ruin(view, tool, nose, shake, heat)
            await FX.wait(scene, SPOIL_MS)
            if (!list.includes(view)) return
            restore(view)
            view.spoiled = false
            view.resolved = false
        },
        async fadeAll() {
            await FX.to(
                scene,
                list.map(v => v.sprite),
                { alpha: 0 },
                { duration: 260 },
            )
            this.clear()
        },
        clear() {
            list.forEach(view => {
                scene.tweens.killTweensOf(view.sprite)
                view.sprite.destroy()
            })
            list = []
            extras.forEach(o => {
                scene.tweens.killTweensOf(o)
                o.destroy()
            })
            extras.clear()
        },
        destroy() {
            this.clear()
            marks.destroy()
        },
    }
}
