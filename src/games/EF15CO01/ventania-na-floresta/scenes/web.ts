import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUG_SHEET, OBJECT2_CELL, OBJECT2_SHEET, SPIDER_CELL, SPIDER_SHEET, bugCell, cellKey, sheetData } from '../data/files'
import { DEPTH, WEB } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Bug, Edge, Rect, TeiaPhase, Vec } from '../types'
import { baked } from './art'

export interface Web {
    build(phase: TeiaPhase): void
    hide(): void
    scatter(): Promise<void>
    start(edge: Edge): Promise<void>
    from(): Bug | undefined
    activate(onBug: (bug: Bug) => void): void
    deactivate(): void
    stretch(to: Bug): Promise<void>
    shine(to: Bug): Promise<void>
    snap(wrong: Bug, right: Bug): Promise<void>
    celebrate(): Promise<void>
    bugCenter(bug: Bug): Vec
    targetsRect(): Rect
    destroy(): void
}

interface BugView {
    bug: Bug
    box: Phaser.GameObjects.Container
    sprite: Phaser.GameObjects.Image
    slot: number
}

const THREAD_KEY = 'vnf-thread'
const THREAD_W = 256

function ensureThread(scene: Phaser.Scene) {
    baked(scene, THREAD_KEY, THREAD_W, 16, g => {
        g.fillStyle(C.thread, 0.35)
        g.fillRoundedRect(0, 3, THREAD_W, 10, 5)
        g.fillStyle(C.thread, 1)
        g.fillRoundedRect(0, 5.5, THREAD_W, 5, 2.5)
    })
}

const slotAt = (slot: number): Vec => {
    const a = Phaser.Math.DegToRad(WEB.angles[slot])
    return { x: WEB.center.x + Math.cos(a) * WEB.rx, y: WEB.center.y + Math.sin(a) * WEB.ry }
}

export function createWeb(scene: Phaser.Scene): Web {
    ensureThread(scene)
    let phase: TeiaPhase | undefined
    let bugs: BugView[] = []
    let threads: Phaser.GameObjects.Image[] = []
    let twigs: Phaser.GameObjects.Image[] = []
    let start: Bug | undefined
    const loose = new Set<Phaser.GameObjects.Image>()
    const zones: Phaser.GameObjects.Zone[] = []
    const rings: Phaser.GameObjects.Graphics[] = []

    const spider = scene.add.image(0, 0, SPIDER_SHEET.key, cellKey(SPIDER_CELL.hang))
    spider.setScale(WEB.spiderW / (sheetData(scene, SPIDER_SHEET).maxW ?? 200))
    const dangle = scene.add.image(0, 0, THREAD_KEY).setOrigin(0, 0.5).setAngle(-90).setVisible(false)
    const tece = scene.add.container(WEB.center.x, WEB.center.y, [dangle, spider]).setDepth(DEPTH.bee).setVisible(false)

    const bugScale = () => WEB.bugW / (sheetData(scene, BUG_SHEET).maxW ?? 200)
    const viewOf = (b: Bug) => bugs.find(v => v.bug === b) as BugView

    const thread = (a: Vec, b: Vec) => {
        const img = scene.add.image(a.x, a.y, THREAD_KEY).setOrigin(0, 0.5).setDepth(DEPTH.trail)
        img.setRotation(Phaser.Math.Angle.Between(a.x, a.y, b.x, b.y))
        img.setScale(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / THREAD_W, WEB.thread / 8)
        return img
    }

    const beside = (b: Bug): Vec => {
        const at = viewOf(b).box
        const dx = WEB.center.x - at.x
        const dy = WEB.center.y - at.y
        const d = Math.hypot(dx, dy) || 1
        return { x: at.x + (dx / d) * WEB.reach, y: at.y + (dy / d) * WEB.reach - 10 }
    }

    const pose = (cell: number) => spider.setFrame(cellKey(cell))

    const unhook = () => {
        zones.forEach(z => z.destroy())
        zones.length = 0
        rings.forEach(r => {
            scene.tweens.killTweensOf(r)
            r.destroy()
        })
        rings.length = 0
    }

    const clear = () => {
        unhook()
        bugs.forEach(v => {
            scene.tweens.killTweensOf([v.box, v.sprite])
            v.box.destroy()
        })
        threads.forEach(t => {
            scene.tweens.killTweensOf(t)
            t.destroy()
        })
        loose.forEach(t => {
            scene.tweens.killTweensOf(t)
            t.destroy()
        })
        loose.clear()
        twigs.forEach(t => t.destroy())
        bugs = []
        threads = []
        twigs = []
        start = undefined
        scene.tweens.killTweensOf([tece, spider, dangle])
        dangle.setVisible(false)
        tece.setVisible(false).setAngle(0)
    }

    const travel = (to: Vec, ms: number) => FX.to(scene, tece, { x: to.x, y: to.y }, { duration: ms, ease: 'Sine.easeInOut' })

    const hop = (v: BugView, scared = false) => {
        if (scared) v.sprite.setFrame(cellKey(bugCell(v.bug, true)))
        return FX.to(scene, v.box, { y: v.box.y - 30 }, { duration: 170, yoyo: true, ease: 'Sine.easeOut' }).then(() => {
            if (scared) return FX.shake(scene, v.box, { amount: 7, times: 3 })
            return undefined
        })
    }

    const breakThread = (t: Phaser.GameObjects.Image, delay = 0) => {
        loose.add(t)
        const len = t.scaleX * THREAD_W
        const ang = t.rotation
        const mid = { x: t.x + Math.cos(ang) * len * 0.5, y: t.y + Math.sin(ang) * len * 0.5 }
        const other = scene.add.image(mid.x, mid.y, THREAD_KEY).setOrigin(0, 0.5).setDepth(t.depth).setScale(t.scaleX * 0.5, t.scaleY)
        other.setRotation(ang)
        loose.add(other)
        t.setScale(t.scaleX * 0.5, t.scaleY)
        const end = { x: t.x + Math.cos(ang) * len, y: t.y + Math.sin(ang) * len }
        other.setPosition(end.x, end.y).setRotation(ang + Math.PI)
        const fall = (img: Phaser.GameObjects.Image, dir: number) =>
            FX.to(scene, img, { rotation: Math.PI / 2 + dir * 0.2, alpha: 0 }, { duration: 620, delay, ease: 'Sine.easeIn' }).then(() => {
                loose.delete(img)
                img.destroy()
            })
        return FX.all(fall(t, -1), fall(other, 1))
    }

    const web: Web = {
        build(next) {
            clear()
            phase = next
            ensureThread(scene)
            twigs = WEB.angles.map((_, i) => {
                const at = slotAt(i)
                const img = scene.add.image(at.x, at.y + 30, OBJECT2_SHEET.key, cellKey(OBJECT2_CELL.twig)).setDepth(DEPTH.plot)
                img.setScale(WEB.twigW / img.width)
                return img
            })
            bugs = next.bugs.map((bug, i) => {
                const at = slotAt(next.before[i])
                const sprite = scene.add.image(0, 0, BUG_SHEET.key, cellKey(bugCell(bug))).setScale(bugScale())
                const box = scene.add.container(at.x, at.y, [sprite]).setDepth(DEPTH.piece)
                return { bug, box, sprite, slot: next.before[i] }
            })
            threads = next.edges.map(([a, b]) => thread(viewOf(a).box, viewOf(b).box))
            tece.setVisible(true).setPosition(WEB.center.x, WEB.center.y).setAngle(0)
            pose(SPIDER_CELL.idle)
        },
        hide() {
            clear()
            phase = undefined
        },
        async scatter() {
            const p = phase as TeiaPhase
            pose(SPIDER_CELL.fall)
            void FX.to(scene, tece, { angle: 360 }, { duration: TIMING.tumble, ease: 'Sine.easeOut' }).then(() => tece.setAngle(0))
            const snaps = threads.map((t, i) => breakThread(t, i * 60))
            threads = []
            const moves = bugs.map((v, i) =>
                FX.wait(scene, 200 + i * 120).then(async () => {
                    v.sprite.setFrame(cellKey(bugCell(v.bug, true)))
                    v.box.setDepth(DEPTH.flying)
                    const to = slotAt(p.after[i])
                    v.slot = p.after[i]
                    void FX.to(scene, v.sprite, { angle: 360 }, { duration: TIMING.tumble, ease: 'Sine.easeOut' })
                    await FX.arcTo(scene, v.box, to, { height: 120, duration: TIMING.tumble })
                    v.box.setDepth(DEPTH.piece)
                    v.sprite.setAngle(0).setFrame(cellKey(bugCell(v.bug)))
                    await FX.impact(scene, v.sprite, 0.14)
                }),
            )
            await FX.all(...snaps, ...moves)
            pose(SPIDER_CELL.dizzy)
            await FX.wait(scene, 300)
            pose(SPIDER_CELL.hang)
        },
        async start(edge) {
            start = edge[0]
            pose(SPIDER_CELL.hang)
            await travel(beside(edge[0]), TIMING.fly)
            pose(SPIDER_CELL.pull)
            await FX.impact(scene, spider, 0.1)
        },
        from: () => start,
        activate(onBug) {
            web.deactivate()
            bugs
                .filter(v => v.bug !== start)
                .forEach(v => {
                    const ring = scene.add.graphics().setDepth(DEPTH.ring).setPosition(v.box.x, v.box.y)
                    const r = WEB.hit * 0.82
                    ring.lineStyle(11, C.ringRim, 0.55)
                    ring.strokeCircle(0, 0, r / 2)
                    ring.lineStyle(6, C.ringYellow, 1)
                    ring.strokeCircle(0, 0, r / 2)
                    scene.tweens.add({ targets: ring, alpha: 0.35, scale: 1.05, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
                    rings.push(ring)
                    const zone = scene.add.zone(v.box.x, v.box.y, WEB.hit, WEB.hit).setDepth(DEPTH.fx).setInteractive({ useHandCursor: true })
                    const base = v.sprite.scale
                    zone.on('pointerover', () => v.sprite.setScale(base * 1.06))
                    zone.on('pointerout', () => v.sprite.setScale(base))
                    zone.on('pointerdown', () => {
                        v.sprite.setScale(base)
                        onBug(v.bug)
                    })
                    zones.push(zone)
                })
        },
        deactivate: unhook,
        async stretch(to) {
            if (!start) return
            const a = viewOf(start).box
            const b = viewOf(to).box
            const t = thread(a, b)
            const full = t.scaleX
            t.setScale(0, t.scaleY)
            threads.push(t)
            const dist = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y)
            const ms = Math.max(520, dist * 1.4)
            const end = beside(to)
            await FX.all(FX.to(scene, t, { scaleX: full }, { duration: ms, ease: 'Sine.easeInOut' }), travel(end, ms))
        },
        async shine(to) {
            const t = threads[threads.length - 1]
            const v = viewOf(to)
            pose(SPIDER_CELL.cheer)
            if (t) {
                const len = t.scaleX * THREAD_W
                for (let k = 1; k <= 3; k++) {
                    const x = t.x + Math.cos(t.rotation) * len * (k / 4)
                    const y = t.y + Math.sin(t.rotation) * len * (k / 4)
                    void FX.sparks(scene, x, y, { color: C.white, count: 6, spread: 40, size: 7, duration: 500, depth: DEPTH.fx })
                }
                t.setTintFill(C.butter)
                void FX.wait(scene, 260).then(() => t.active && t.clearTint())
            }
            await hop(v)
            pose(SPIDER_CELL.idle)
            start = undefined
        },
        async snap(wrong, right) {
            const t = threads.pop()
            const r = viewOf(right)
            const w = viewOf(wrong)
            void hop(w, true)
            if (t) void breakThread(t)
            pose(SPIDER_CELL.fall)
            dangle.setVisible(true).setScale(0, WEB.thread / 10).setPosition(0, 0)
            const top = tece.y
            const drop = Phaser.Math.Clamp(WEB.floor - top, 60, WEB.fall)
            void FX.to(scene, dangle, { scaleX: drop / THREAD_W }, { duration: 520, ease: 'Bounce.easeOut' })
            const jobs = [
                FX.to(scene, tece, { y: top + drop }, { duration: 520, ease: 'Bounce.easeOut' }),
                FX.wait(scene, 260).then(() => hop(r, true)),
            ]
            await FX.all(...jobs)
            pose(SPIDER_CELL.dizzy)
            await FX.to(scene, tece, { angle: 10 }, { duration: 260, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' })
        },
        async celebrate() {
            await travel(WEB.center, TIMING.fly)
            pose(SPIDER_CELL.cheer)
            threads.forEach((t, i) => {
                void FX.wait(scene, i * 90).then(async () => {
                    if (!t.active) return
                    t.setTintFill(C.butter)
                    await FX.wait(scene, 240)
                    if (t.active) t.clearTint()
                })
            })
            await FX.all(...bugs.map((v, i) => FX.wait(scene, i * 100).then(() => hop(v))))
            await FX.impact(scene, spider, 0.14)
            await FX.wait(scene, 200)
            pose(SPIDER_CELL.idle)
        },
        bugCenter: b => ({ x: viewOf(b).box.x, y: viewOf(b).box.y }),
        targetsRect() {
            const list = bugs.filter(v => v.bug !== start)
            if (!list.length) return { x: WEB.center.x, y: WEB.center.y, w: 300, h: 300 }
            const l = Math.min(...list.map(v => v.box.x)) - WEB.hit / 2
            const r = Math.max(...list.map(v => v.box.x)) + WEB.hit / 2
            const t = Math.min(...list.map(v => v.box.y)) - WEB.hit / 2
            const b = Math.max(...list.map(v => v.box.y)) + WEB.hit / 2
            return { x: (l + r) / 2, y: (t + b) / 2, w: r - l, h: b - t }
        },
        destroy() {
            clear()
            tece.destroy()
        },
    }
    return web
}
