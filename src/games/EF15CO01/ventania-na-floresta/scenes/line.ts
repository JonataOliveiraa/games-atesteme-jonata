import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ANT_CELL, ANT_SHEET, OBJECT_CELL, OBJECT_SHEET, cellKey, sheetData } from '../data/files'
import { ANT, DEPTH, LINE, SCATTER } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { LinePhase, Rect, Vec } from '../types'

export interface AntView {
    readonly rank: number
    readonly box: Phaser.GameObjects.Container
    readonly sprite: Phaser.GameObjects.Image
}

export interface Line {
    build(phase: LinePhase): void
    hide(): void
    march(ms: number): Promise<void>
    scatter(): Promise<void>
    loose(): AntView[]
    ranksLeft(): number[]
    placedCount(): number
    biggestLoose(): AntView | undefined
    showNext(on: boolean): void
    activate(onPick: (a: AntView) => void): void
    deactivate(): void
    join(a: AntView, onStep?: () => void): Promise<void>
    stumble(wrong: AntView, right: AntView): Promise<void>
    enter(onStep?: () => void): Promise<void>
    antRect(a: AntView): Rect
    looseRect(): Rect
    destroy(): void
}

interface Ant extends AntView {
    shadow: Phaser.GameObjects.Ellipse
    placed: boolean
    walking?: Phaser.Time.TimerEvent
}

export function createLine(scene: Phaser.Scene): Line {
    let ants: Ant[] = []
    let placed = 0
    let slots: number[] = []
    const marker = scene.add
        .image(0, LINE.y - 6, OBJECT_SHEET.key, cellKey(OBJECT_CELL.pebble))
        .setDepth(DEPTH.trail)
        .setVisible(false)
    marker.setScale(70 / marker.width)
    const zones: Phaser.GameObjects.Zone[] = []
    const rings: Phaser.GameObjects.Graphics[] = []

    const baseScale = () => ANT.w / (sheetData(scene, ANT_SHEET).maxW ?? 205)

    const sizeOf = (a: Ant) => ({ w: a.sprite.displayWidth, h: a.sprite.displayHeight })

    const frame = (a: Ant, cell: number) => a.sprite.setFrame(cellKey(cell))

    const stopWalk = (a: Ant) => {
        a.walking?.remove()
        a.walking = undefined
    }

    const startWalk = (a: Ant, onStep?: () => void) => {
        stopWalk(a)
        let flip = false
        frame(a, ANT_CELL.walkA)
        a.walking = scene.time.addEvent({
            delay: ANT.step,
            loop: true,
            callback: () => {
                flip = !flip
                frame(a, flip ? ANT_CELL.walkB : ANT_CELL.walkA)
                onStep?.()
            },
        })
    }

    const clearAnts = () => {
        ants.forEach(a => {
            stopWalk(a)
            scene.tweens.killTweensOf([a.box, a.sprite, a.shadow])
            a.box.destroy()
        })
        ants = []
    }

    const center = (a: Ant): Vec => ({ x: a.box.x, y: a.box.y - sizeOf(a).h / 2 })

    const dust = (x: number, y: number, scale = 0.32) => {
        const puff = scene.add
            .image(x, y, OBJECT_SHEET.key, cellKey(OBJECT_CELL.dust))
            .setDepth(DEPTH.piece - 1)
            .setScale(scale * 0.6)
            .setAlpha(0.9)
        void FX.to(scene, puff, { scale, alpha: 0, y: y - 16 }, { duration: 520 }).then(() => puff.destroy())
    }

    const walkTo = (a: Ant, to: Vec, ms: number, onStep?: () => void) => {
        a.sprite.setFlipX(to.x > a.box.x)
        startWalk(a, onStep)
        return FX.to(scene, a.box, { x: to.x, y: to.y }, { duration: ms, ease: 'Sine.easeInOut' }).then(() => stopWalk(a))
    }

    const line: Line = {
        build(phase) {
            clearAnts()
            line.deactivate()
            placed = 0
            const n = phase.scattered.length
            slots = LINE.slots.slice(0, n)
            const k = baseScale()
            ants = Array.from({ length: n }, (_, rank) => {
                const sprite = scene.add.image(0, 0, ANT_SHEET.key, cellKey(ANT_CELL.idle)).setOrigin(0.5, 1)
                sprite.setScale(k * ANT.sizes[rank])
                const shadow = scene.add.ellipse(0, -4, sprite.displayWidth * 0.8, sprite.displayWidth * 0.18, C.shadow, 0.18)
                const box = scene.add.container(slots[rank], LINE.y, [shadow, sprite]).setDepth(DEPTH.piece)
                return { rank, box, sprite, shadow, placed: true }
            })
            phase.scattered.forEach((rank, spot) => {
                const ant = ants[rank]
                ant.box.setData('spot', SCATTER[n][spot])
            })
            marker.setVisible(false)
        },
        hide() {
            clearAnts()
            line.deactivate()
            marker.setVisible(false)
        },
        march(ms) {
            ants.forEach((a, i) => scene.time.delayedCall(FX.ms(scene, i * 60), () => startWalk(a)))
            return FX.wait(scene, ms).then(() =>
                ants.forEach(a => {
                    stopWalk(a)
                    frame(a, ANT_CELL.idle)
                }),
            )
        },
        async scatter() {
            placed = 0
            const jobs = ants.map((a, i) => {
                const spot = a.box.getData('spot') as Vec
                a.placed = false
                return FX.wait(scene, i * 110).then(async () => {
                    frame(a, ANT_CELL.tumble)
                    a.box.setDepth(DEPTH.flying)
                    a.shadow.setVisible(false)
                    void FX.to(scene, a.sprite, { angle: 360 + Phaser.Math.Between(-20, 20) }, { duration: TIMING.tumble, ease: 'Sine.easeOut' })
                    await FX.arcTo(scene, a.box, spot, { height: 160 + i * 20, duration: TIMING.tumble })
                    a.sprite.setAngle(Phaser.Math.Between(-12, 12))
                    a.sprite.setFlipX(i % 2 === 1)
                    frame(a, ANT_CELL.dizzy)
                    a.box.setDepth(DEPTH.piece)
                    a.shadow.setVisible(true)
                    dust(spot.x, spot.y)
                    await FX.impact(scene, a.sprite, 0.16)
                })
            })
            await FX.all(...jobs)
        },
        loose: () => ants.filter(a => !a.placed),
        ranksLeft: () => ants.filter(a => !a.placed).map(a => a.rank),
        placedCount: () => placed,
        biggestLoose() {
            const left = ants.filter(a => !a.placed)
            return left.sort((a, b) => a.rank - b.rank)[0]
        },
        showNext(on) {
            if (!on || placed >= slots.length) {
                marker.setVisible(false)
                return
            }
            marker.setPosition(slots[placed], LINE.y - 6).setVisible(true).setAlpha(0)
            void FX.to(scene, marker, { alpha: 0.95 }, { duration: 220 })
        },
        activate(onPick) {
            line.deactivate()
            ants
                .filter(a => !a.placed)
                .forEach(a => {
                    const { w, h } = sizeOf(a)
                    const c = center(a)
                    const ring = scene.add.graphics().setDepth(DEPTH.ring).setPosition(c.x, c.y)
                    const rw = Math.max(w * 1.15, 120)
                    const rh = Math.max(h * 1.15, 110)
                    ring.lineStyle(11, C.ringRim, 0.55)
                    ring.strokeEllipse(0, 0, rw, rh)
                    ring.lineStyle(6, C.ringYellow, 1)
                    ring.strokeEllipse(0, 0, rw, rh)
                    scene.tweens.add({ targets: ring, alpha: 0.35, scale: 1.05, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
                    rings.push(ring)
                    const zone = scene.add
                        .zone(c.x, c.y, Math.max(ANT.hit, w * 1.1), Math.max(ANT.hit, h * 1.1))
                        .setDepth(DEPTH.fx)
                        .setInteractive({ useHandCursor: true })
                    const base = a.sprite.scale
                    zone.on('pointerover', () => a.sprite.setScale(base * 1.06))
                    zone.on('pointerout', () => a.sprite.setScale(base))
                    zone.on('pointerdown', () => {
                        a.sprite.setScale(base)
                        onPick(a)
                    })
                    zones.push(zone)
                })
        },
        deactivate() {
            zones.forEach(z => z.destroy())
            zones.length = 0
            rings.forEach(r => {
                scene.tweens.killTweensOf(r)
                r.destroy()
            })
            rings.length = 0
        },
        async join(view, onStep) {
            const a = view as Ant
            const k = placed
            placed += 1
            a.placed = true
            marker.setVisible(false)
            a.sprite.setAngle(0)
            frame(a, ANT_CELL.startled)
            await FX.to(scene, a.box, { y: a.box.y - ANT.hop * 0.5 }, { duration: 140, ease: 'Sine.easeOut', yoyo: true })
            const to = { x: slots[k], y: LINE.y }
            const dist = Phaser.Math.Distance.Between(a.box.x, a.box.y, to.x, to.y)
            await walkTo(a, to, Math.max(520, dist * 1.25), onStep)
            a.sprite.setFlipX(false)
            frame(a, ANT_CELL.idle)
            dust(to.x + 30, to.y)
            await FX.impact(scene, a.sprite, 0.12)
        },
        async stumble(wrongView, rightView) {
            const wrong = wrongView as Ant
            const right = rightView as Ant
            frame(right, ANT_CELL.startled)
            right.sprite.setAngle(0)
            void FX.to(scene, right.box, { y: right.box.y - 34 }, { duration: 180, yoyo: true, ease: 'Sine.easeOut' }).then(() =>
                FX.shake(scene, right.box, { amount: 8, times: 3 }),
            )
            await FX.wait(scene, 260)
            frame(wrong, ANT_CELL.trip)
            const head = center(wrong)
            const leaf = scene.add
                .image(head.x, head.y - sizeOf(wrong).h * 0.4, OBJECT_SHEET.key, cellKey(OBJECT_CELL.leaf))
                .setDepth(DEPTH.flying)
                .setScale((sizeOf(wrong).w / 256) * 0.75)
            void FX.to(scene, leaf, { angle: 220 }, { duration: 760 })
            void FX.arcTo(scene, leaf, { x: head.x + 110, y: LINE.y - 10 }, { height: 70, duration: 760 })
            void FX.to(scene, wrong.sprite, { angle: -24 }, { duration: 240 })
            await FX.shake(scene, wrong.box, { amount: 10, times: 4 })
        },
        async enter(onStep) {
            const order = ants.filter(a => a.placed).sort((a, b) => a.rank - b.rank)
            order.forEach(a => frame(a, ANT_CELL.cheer))
            await FX.all(...order.map((a, i) => FX.wait(scene, i * 70).then(() => FX.to(scene, a.box, { y: a.box.y - 26 }, { duration: 170, yoyo: true }))))
            await FX.wait(scene, 160)
            const jobs = order.map((a, i) =>
                FX.wait(scene, i * 160).then(async () => {
                    const dist = a.box.x - LINE.march.x
                    await walkTo(a, { x: LINE.march.x, y: LINE.march.y }, Math.max(380, dist * 1.6), i === 0 ? onStep : undefined)
                    dust(LINE.march.x + 20, LINE.march.y + 6, 0.26)
                    await FX.to(scene, a.box, { scale: 0.3, alpha: 0 }, { duration: 200 })
                }),
            )
            await FX.all(...jobs)
        },
        antRect(view) {
            const a = view as Ant
            const { w, h } = sizeOf(a)
            const c = center(a)
            return { x: c.x, y: c.y, w: Math.max(w, 110), h: Math.max(h, 100) }
        },
        looseRect() {
            const left = ants.filter(a => !a.placed)
            if (!left.length) return { x: 640, y: 320, w: 200, h: 160 }
            const rs = left.map(a => line.antRect(a))
            const l = Math.min(...rs.map(r => r.x - r.w / 2))
            const r = Math.max(...rs.map(r => r.x + r.w / 2))
            const t = Math.min(...rs.map(r => r.y - r.h / 2))
            const b = Math.max(...rs.map(r => r.y + r.h / 2))
            return { x: (l + r) / 2, y: (t + b) / 2, w: r - l + 30, h: b - t + 30 }
        },
        destroy() {
            line.deactivate()
            clearAnts()
            marker.destroy()
        },
    }
    return line
}
