import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CREW_CELL, CREW_SHEET, FISH_SHEET, OBJECT_CELL, OBJECT_SHEET, cellKey, fishCell, glowCell, shroomCell } from '../data/files'
import { DEPTH, DUCK, FISH, FLY, JEITO, SHROOM, SNAIL } from '../data/layout'
import { FISH_FIELDS, edgeFits, fishHome, fishMismatch, isNext, shroomHome, wayOf } from '../data/logic'
import { C, COR, CSS, FONT, GLOW, HUE } from '../data/theme'
import { TIMING } from '../data/timing'
import { PEBBLE_TEXT, TEACH, WHY } from '../data/words'
import type { Cell, Fish, Glow, Home, JeitoPhase, Rect, Vec } from '../types'
import { baked } from './art'
import { union } from './guide'
import { SHAPE_DOTS, makePlate, shapeAt, shapeBoard } from './shapes'

export interface TeachStep {
    text: string
    rect: Rect
}

export interface Crew {
    build(phase: JeitoPhase): void
    hide(): void
    look(): Promise<void>
    scatter(): Promise<void>
    groupRect(): Rect
    showPlates(): Promise<void>
    plateRect(home: Home): Rect
    platesRect(): Rect
    activatePlates(onPick: (home: Home) => void): void
    choose(home: Home): Promise<void>
    misfit(home: Home): Promise<void>
    prepare(): Promise<void>
    step(): Promise<void>
    activate(onPick: (target: number) => void): void
    deactivate(): void
    judge(target: number): string | undefined
    answer(): number
    targetCenter(target: number): Vec
    targetsRect(): Rect
    apply(target: number): Promise<void>
    oops(target: number): Promise<void>
    settle(target: number): Promise<void>
    done(): boolean
    celebrate(): Promise<void>
    teachSteps(): TeachStep[]
    destroy(): void
}

interface Item {
    box: Phaser.GameObjects.Container
    img: Phaser.GameObjects.Image
}

interface Kit {
    items: Item[]
    look(): Promise<void>
    scatter(): Promise<void>
    prepare(): Promise<void>
    step(): Promise<void>
    targets(): number[]
    hitRect(t: number): Rect
    judge(t: number): string | undefined
    answer(): number
    apply(t: number): Promise<void>
    oops(t: number): Promise<void>
    settle(t: number): Promise<void>
    done(): boolean
    celebrate(): Promise<void>
    teach(): TeachStep[]
    groupRect(): Rect
}

const SLOT_KEY = 'vnf-duck-slot'
const LIGHT_KEY = 'vnf-light'
const CARD_KEY = 'vnf-fish-card'
const PAIR_KEY = 'vnf-pair-card'
const LABEL_KEY = 'vnf-fish-label'
const CHEVRON_KEY = 'vnf-fish-chevron'
const DOT_KEY = 'vnf-fish-dot'
const HALO_KEY = 'vnf-glow-halo'

function ensureCrewBits(scene: Phaser.Scene) {
    baked(scene, SLOT_KEY, 150, 50, g => {
        g.fillStyle(C.white, 0.28)
        g.fillEllipse(75, 25, 140, 40)
        g.lineStyle(5, C.white, 0.9)
        for (let k = 0; k < 12; k += 2) {
            g.beginPath()
            g.arc(75, 25, 68, (k / 12) * Math.PI * 2, ((k + 1) / 12) * Math.PI * 2, false)
            g.strokePath()
        }
    })
    baked(scene, LIGHT_KEY, 64, FLY.line + 8, g => {
        g.fillStyle(C.lightLine, 0.35)
        g.fillRoundedRect(0, 0, 64, FLY.line + 8, (FLY.line + 8) / 2)
        g.fillStyle(C.lightLine, 1)
        g.fillRoundedRect(0, 4, 64, FLY.line, FLY.line / 2)
    })
    baked(scene, CARD_KEY, FISH.cardW + 8, FISH.cardH + 10, g => {
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(6, 10, FISH.cardW, FISH.cardH, 20)
        g.fillStyle(C.board, 1)
        g.fillRoundedRect(0, 0, FISH.cardW, FISH.cardH, 20)
        g.lineStyle(5, C.woodDark, 1)
        g.strokeRoundedRect(2.5, 2.5, FISH.cardW - 5, FISH.cardH - 5, 18)
    })
    baked(scene, PAIR_KEY, FLY.card.w, FLY.card.h, g => {
        g.fillStyle(C.nightDark, 0.9)
        g.fillRoundedRect(0, 0, FLY.card.w, FLY.card.h, FLY.card.h / 2)
        g.lineStyle(4, C.lightLine, 0.8)
        g.strokeRoundedRect(2, 2, FLY.card.w - 4, FLY.card.h - 4, FLY.card.h / 2 - 2)
        g.lineStyle(6, C.lightLine, 1)
        g.lineBetween(56, FLY.card.h / 2, FLY.card.w - 56, FLY.card.h / 2)
    })
    baked(scene, LABEL_KEY, 48, 48, g => {
        g.fillStyle(C.labelRing, 1)
        g.fillCircle(24, 24, 22)
        g.lineStyle(3, C.labelIcon, 1)
        g.strokeCircle(24, 24, 21)
    })
    baked(scene, CHEVRON_KEY, 20, 28, g => {
        g.lineStyle(5, C.inkSoft, 1)
        g.beginPath()
        g.moveTo(5, 4)
        g.lineTo(15, 14)
        g.lineTo(5, 24)
        g.strokePath()
    })
    baked(scene, DOT_KEY, 44, 44, g => {
        g.fillStyle(C.white, 1)
        g.fillCircle(22, 22, 20)
        g.lineStyle(4, C.line, 1)
        g.strokeCircle(22, 22, 19)
    })
    baked(scene, HALO_KEY, 200, 200, g => {
        for (let k = 6; k >= 1; k--) {
            g.fillStyle(C.white, 0.1)
            g.fillCircle(100, 100, 20 + k * 13)
        }
    })
}

const center = (r: Rect): Vec => ({ x: r.x, y: r.y })

export function createCrew(scene: Phaser.Scene): Crew {
    ensureCrewBits(scene)
    let phase: JeitoPhase | undefined
    let kit: Kit | undefined
    const owned = new Set<Phaser.GameObjects.GameObject>()
    const zones: Phaser.GameObjects.Zone[] = []
    const rings: Phaser.GameObjects.Graphics[] = []
    let plates: { home: Home; box: Phaser.GameObjects.Container; w: number; h: number }[] = []

    const own = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
        owned.add(o)
        return o
    }

    const drop = (o: Phaser.GameObjects.GameObject) => {
        owned.delete(o)
        scene.tweens.killTweensOf(o)
        o.destroy()
    }

    const item = (sheet: string, cell: number, size: number, by: 'w' | 'h', x: number, y: number, originY = 1): Item => {
        const img = scene.add.image(0, 0, sheet, cellKey(cell)).setOrigin(0.5, originY)
        img.setScale(size / (by === 'w' ? img.width : img.height))
        const box = own(scene.add.container(x, y, [img]).setDepth(DEPTH.piece))
        return { box, img }
    }

    const boxRect = (it: Item, pad = 0): Rect => {
        const w = it.img.displayWidth * it.box.scaleX
        const h = it.img.displayHeight * it.box.scaleY
        const cy = it.box.y - h * (it.img.originY - 0.5)
        return { x: it.box.x, y: cy, w: w + pad * 2, h: h + pad * 2 }
    }

    const ringAt = (r: Rect) => {
        const g = own(scene.add.graphics().setDepth(DEPTH.ring).setPosition(r.x, r.y))
        g.lineStyle(11, C.ringRim, 0.5)
        g.strokeRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 30)
        g.lineStyle(6, C.ringYellow, 1)
        g.strokeRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 30)
        scene.tweens.add({ targets: g, alpha: 0.35, scaleX: 1.03, scaleY: 1.03, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        rings.push(g)
    }

    const zoneAt = (r: Rect, onDown: () => void, hover?: Phaser.GameObjects.Container) => {
        const z = scene.add.zone(r.x, r.y, r.w, r.h).setDepth(DEPTH.fx).setInteractive({ useHandCursor: true })
        const base = hover?.scale ?? 1
        if (hover) {
            z.on('pointerover', () => hover.setScale(base * 1.05))
            z.on('pointerout', () => hover.setScale(base))
        }
        z.on('pointerdown', () => {
            hover?.setScale(base)
            onDown()
        })
        zones.push(z)
    }

    const unhook = () => {
        zones.forEach(z => z.destroy())
        zones.length = 0
        rings.forEach(drop)
        rings.length = 0
    }

    const glowRect = (r: Rect) => {
        const g = own(scene.add.graphics().setDepth(DEPTH.stake - 1).setPosition(r.x, r.y))
        g.fillStyle(C.butter, 0.55)
        g.fillRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 24)
        g.setAlpha(0)
        void FX.to(scene, g, { alpha: 1 }, { duration: 260 })
        return g
    }

    const bob = (it: Item, amount = 6, ms = 1300) =>
        scene.tweens.add({ targets: it.box, y: it.box.y - amount, duration: ms, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    const hopTo = (it: Item, to: Vec, height = 70, ms: number = TIMING.fly) =>
        FX.all(FX.arcTo(scene, it.box, to, { height, duration: ms }), FX.to(scene, it.box, { angle: 0 }, { duration: ms }))

    const tumbleTo = (it: Item, to: Vec, i: number) =>
        FX.wait(scene, i * 110).then(() =>
            FX.all(
                FX.arcTo(scene, it.box, to, { height: 140, duration: TIMING.tumble }),
                FX.to(scene, it.box, { angle: (i % 2 ? 1 : -1) * (360 + 20) }, { duration: TIMING.tumble, ease: 'Sine.easeOut' }),
            ).then(() => {
                it.box.setAngle((i % 2 ? 1 : -1) * 20)
            }),
        )

    const blowAway = (objs: (Phaser.GameObjects.Container | Phaser.GameObjects.Image)[]) =>
        FX.all(
            ...objs.map((o, i) =>
                FX.wait(scene, i * 60).then(() =>
                    FX.to(scene, o, { x: o.x + 160, alpha: 0, angle: 30 }, { duration: 520, ease: 'Sine.easeIn' }),
                ),
            ),
        )

    const bringBack = (objs: (Phaser.GameObjects.Container | Phaser.GameObjects.Image)[], spots: Vec[]) =>
        FX.all(
            ...objs.map((o, i) => {
                o.setPosition(spots[i].x, spots[i].y).setAngle(0).setAlpha(1).setVisible(true)
                return FX.popIn(scene, o, { from: 0.3, delay: i * 90, duration: 360 })
            }),
        )

    // ───────────────────────────────────────────── patinhos (FILA)

    const ducks = (p: Extract<JeitoPhase, { group: 'patos' }>): Kit => {
        const mom = item(CREW_SHEET.key, CREW_CELL.duck, DUCK.momW, 'w', DUCK.mom.x, DUCK.mom.y)
        const list = p.scattered.map((rank, i) => ({
            rank,
            spot: DUCK.scatter[i],
            placed: false,
            it: item(CREW_SHEET.key, CREW_CELL.duckling, DUCK.w * DUCK.sizes[rank], 'w', DUCK.slots[rank], DUCK.y),
        }))
        const slot = own(scene.add.image(0, DUCK.y - 4, SLOT_KEY).setDepth(DEPTH.trail).setVisible(false))
        let k = 0
        const loose = () => list.filter(d => !d.placed)
        const all = [mom, ...list.map(d => d.it)]
        return {
            items: list.map(d => d.it),
            async look() {
                await FX.all(
                    ...all.map((it, i) =>
                        FX.wait(scene, i * 120).then(() => FX.to(scene, it.box, { y: it.box.y - 14 }, { duration: 200, yoyo: true, repeat: 3, ease: 'Sine.easeOut' })),
                    ),
                )
            },
            async scatter() {
                void FX.shake(scene, mom.box, { amount: 8, times: 4 })
                await FX.all(...list.map((d, i) => tumbleTo(d.it, d.spot, i)))
            },
            async prepare() {
                await FX.wait(scene, 200)
            },
            async step() {
                slot.setPosition(DUCK.slots[k], DUCK.y - 4).setVisible(true).setAlpha(0)
                await FX.to(scene, slot, { alpha: 1 }, { duration: 240 })
            },
            targets: () => list.map((d, i) => (d.placed ? -1 : i)).filter(i => i >= 0),
            hitRect: t => {
                const r = boxRect(list[t].it)
                return { x: r.x, y: r.y, w: Math.max(DUCK.hit, r.w + 20), h: Math.max(DUCK.hit, r.h + 20) }
            },
            judge: t => (isNext(list[t].rank, loose().map(d => d.rank)) ? undefined : WHY.duck),
            answer: () => list.indexOf(loose().reduce((a, b) => (b.rank < a.rank ? b : a))),
            async apply(t) {
                const d = list[t]
                d.placed = true
                slot.setVisible(false)
                await hopTo(d.it, { x: DUCK.slots[k], y: DUCK.y })
            },
            async oops(t) {
                const right = loose().reduce((a, b) => (b.rank < a.rank ? b : a), loose()[0])
                if (right) void FX.to(scene, right.it.box, { y: right.it.box.y - 40 }, { duration: 180, yoyo: true, repeat: 1 })
                void FX.shake(scene, mom.box, { amount: 8, times: 5 })
                await FX.to(scene, list[t].it.box, { angle: -40 }, { duration: 220, ease: 'Back.easeOut' })
                await FX.shake(scene, list[t].it.box, { amount: 6, times: 4 })
            },
            async settle(t) {
                k += 1
                await FX.to(scene, list[t].it.box, { y: DUCK.y - 16 }, { duration: 150, yoyo: true })
            },
            done: () => loose().length === 0,
            async celebrate() {
                const marchers = [mom, ...[...list].sort((a, b) => a.rank - b.rank).map(d => d.it)]
                await FX.all(
                    ...marchers.map((it, i) =>
                        FX.wait(scene, i * 120).then(() =>
                            FX.all(
                                FX.to(scene, it.box, { x: it.box.x - 760 }, { duration: 2000, ease: 'Sine.easeIn' }),
                                FX.to(scene, it.box, { y: it.box.y - 12 }, { duration: 160, yoyo: true, repeat: 5 }),
                            ),
                        ),
                    ),
                )
            },
            teach: () => [{ text: TEACH.duck, rect: union(loose().map(d => boxRect(d.it, 12))) }],
            groupRect: () => union(all.map(it => boxRect(it, 14))),
        }
    }

    // ───────────────────────────────────────────── cogumelos (GRADE)

    const shrooms = (p: Extract<JeitoPhase, { group: 'cogumelos' }>): Kit => {
        const { rows, cols, bring } = p
        const w = cols.length * SHROOM.cell + (cols.length - 1) * SHROOM.gap
        const h = rows.length * SHROOM.cell + (rows.length - 1) * SHROOM.gap
        const left = SHROOM.x - w / 2
        const top = SHROOM.y - h / 2
        const cellOf = (t: number): Cell => ({ r: Math.floor(t / cols.length), c: t % cols.length })
        const indexOf = (cell: Cell) => cell.r * cols.length + cell.c
        const cellCenter = (t: number): Vec => {
            const { r, c } = cellOf(t)
            return { x: left + c * (SHROOM.cell + SHROOM.gap) + SHROOM.cell / 2, y: top + r * (SHROOM.cell + SHROOM.gap) + SHROOM.cell / 2 }
        }
        const foot = (t: number): Vec => {
            const c = cellCenter(t)
            return { x: c.x, y: c.y + SHROOM.cell * 0.34 }
        }
        const plots = Array.from({ length: rows.length * cols.length }, (_, t) => {
            const c = cellCenter(t)
            const img = own(scene.add.image(c.x, c.y, OBJECT_SHEET.key, cellKey(OBJECT_CELL.plot)).setDepth(DEPTH.plot))
            return img.setScale(SHROOM.cell / Math.max(img.width, img.height))
        })
        const rowStakes = rows.map((cap, r) => {
            const stake = scene.add.image(0, 0, OBJECT_SHEET.key, cellKey(OBJECT_CELL.signStake))
            stake.setScale(140 / stake.height)
            const icon = scene.add.image(0, -stake.displayHeight * 0.24, CREW_SHEET.key, cellKey(shroomCell({ cap, hue: 'vermelho' }))).setTintFill(C.silhouette)
            icon.setScale(SHROOM.icon / icon.height)
            const y = cellCenter(indexOf({ r, c: 0 })).y
            return own(scene.add.container(left - SHROOM.rowStake, y + 14, [stake, icon]).setDepth(DEPTH.stake))
        })
        const colStakes = cols.map((hue, c) => {
            const stake = scene.add.image(0, 0, OBJECT_SHEET.key, cellKey(OBJECT_CELL.stake)).setOrigin(0.5, 1)
            stake.setScale(104 / stake.height)
            const bow = scene.add.image(0, -stake.displayHeight + 10, OBJECT_SHEET.key, cellKey(OBJECT_CELL.bow)).setTint(HUE[hue].fill)
            bow.setScale(80 / bow.width)
            const x = cellCenter(indexOf({ r: 0, c })).x
            return own(scene.add.container(x, top - 4, [stake, bow]).setDepth(DEPTH.stake))
        })
        const props = [...plots, ...rowStakes, ...colStakes]
        const propSpots = props.map(o => ({ x: o.x, y: o.y }))
        const list = bring.map(s => ({ def: s, home: shroomHome(rows, cols, s), it: item(CREW_SHEET.key, shroomCell(s), SHROOM.h, 'h', 0, 0) }))
        list.forEach(m => m.it.box.setPosition(foot(indexOf(m.home)).x, foot(indexOf(m.home)).y))
        const filled = new Set<number>()
        let k = 0
        let float: Phaser.Tweens.Tween | undefined
        let hint: Phaser.GameObjects.Graphics | undefined
        const PILE = [
            { dx: -64, dy: 0, a: -70 },
            { dx: 4, dy: -18, a: 64 },
            { dx: 70, dy: 4, a: -80 },
            { dx: 0, dy: 20, a: 84 },
        ]
        const current = () => list[k]
        return {
            items: list.map(m => m.it),
            async look() {
                await FX.all(...list.map((m, i) => FX.wait(scene, i * 90).then(() => FX.to(scene, m.it.box, { angle: 7 }, { duration: 260, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' }))))
            },
            async scatter() {
                void blowAway(props)
                await FX.all(...list.map((m, i) => tumbleTo(m.it, SHROOM.scatter[i], i)))
            },
            async prepare() {
                await bringBack(props, propSpots)
                await FX.all(
                    ...list.map((m, i) => {
                        const s = PILE[i % PILE.length]
                        return FX.wait(scene, i * 80).then(() =>
                            FX.all(
                                FX.arcTo(scene, m.it.box, { x: SHROOM.pile.x + s.dx, y: SHROOM.pile.y + s.dy }, { height: 60, duration: 520 }),
                                FX.to(scene, m.it.box, { angle: s.a }, { duration: 520 }),
                            ),
                        )
                    }),
                )
            },
            async step() {
                const m = current()
                m.it.box.setDepth(DEPTH.flying)
                await hopTo(m.it, SHROOM.hold, 80, 560)
                float = bob(m.it)
            },
            targets: () => plots.map((_, t) => (filled.has(t) ? -1 : t)).filter(t => t >= 0),
            hitRect: t => ({ ...cellCenter(t), w: SHROOM.cell, h: SHROOM.cell }),
            judge(t) {
                const s = current().def
                const { r, c } = cellOf(t)
                if (rows[r] !== s.cap) return WHY.cap(rows[r])
                if (cols[c] !== s.hue) return WHY.hue(cols[c])
                return undefined
            },
            answer: () => indexOf(current().home),
            async apply(t) {
                float?.stop()
                filled.add(t)
                const m = current()
                await hopTo(m.it, foot(t), 70)
                m.it.box.setDepth(DEPTH.piece)
            },
            async oops(t) {
                const m = current()
                const { r, c } = cellOf(t)
                const rowBad = rows[r] !== m.def.cap
                m.it.img.setTint(C.wilt)
                hint = glowRect({ ...cellCenter(indexOf(m.home)), w: SHROOM.cell + 10, h: SHROOM.cell + 10 })
                const stake = rowBad ? rowStakes[r] : colStakes[c]
                await FX.all(FX.to(scene, m.it.box, { angle: 28, scaleY: 0.82 }, { duration: 420, ease: 'Sine.easeOut' }), FX.shake(scene, stake, { amount: 8, times: 5 }))
            },
            async settle(t) {
                k += 1
                void FX.sparks(scene, cellCenter(t).x, cellCenter(t).y, { color: C.butter, count: 10, spread: 70, size: 8, depth: DEPTH.fx })
                await FX.impact(scene, list[k - 1].it.box, 0.12)
            },
            done: () => filled.size === list.length,
            async celebrate() {
                hint?.destroy()
                await FX.all(...list.map((m, i) => FX.wait(scene, i * 90).then(() => FX.to(scene, m.it.box, { angle: 9 }, { duration: 220, yoyo: true, repeat: 3 }))))
            },
            teach: () => [
                { text: TEACH.cap, rect: union(rowStakes.map(s => ({ x: s.x, y: s.y - 30, w: 110, h: 170 }))) },
                { text: TEACH.col, rect: union(colStakes.map(s => ({ x: s.x, y: s.y - 56, w: 110, h: 120 }))) },
            ],
            groupRect: () => ({ x: SHROOM.x - 30, y: SHROOM.y - 30, w: w + 200, h: h + 140 }),
        }
    }

    // ───────────────────────────────────────────── peixinhos (FICHA)

    const fishes = (p: Extract<JeitoPhase, { group: 'peixes' }>): Kit => {
        const { homes, bring } = p
        const shells = homes.map((_, h) => item(CREW_SHEET.key, CREW_CELL.shell, FISH.shellW, 'w', FISH.xs[h], FISH.shellY, 0.5))
        shells.forEach(s => s.box.setDepth(DEPTH.plot))
        const rowsOf: Phaser.GameObjects.Container[][] = []
        const cards = homes.map((home, h) => {
            const bg = scene.add.image(4, 5, CARD_KEY).setOrigin(0.5, 0)
            const rows = FISH_FIELDS.map((field, r) => {
                const y = 40 + r * FISH.row
                const ring = scene.add.image(-50, 0, LABEL_KEY)
                const icon = scene.add.image(-50, 0, CREW_SHEET.key, cellKey(field === 'corpo' ? CREW_CELL.corpo : CREW_CELL.rabo))
                icon.setScale(30 / Math.max(icon.width, icon.height))
                const chev = scene.add.image(-6, 0, CHEVRON_KEY)
                const dot = scene.add.image(44, 0, DOT_KEY).setTint(COR[home[field]].fill)
                return scene.add.container(0, y, [ring, icon, chev, dot])
            })
            rowsOf.push(rows)
            return own(scene.add.container(FISH.xs[h], FISH.cardY, [bg, ...rows]).setDepth(DEPTH.stake))
        })
        const cardSpots = cards.map(c => ({ x: c.x, y: c.y }))
        const fishImg = (f: Fish, x: number, y: number) => item(FISH_SHEET.key, fishCell(f), FISH.w, 'w', x, y, 0.5)
        const list = bring.map(f => {
            const home = fishHome(homes, f)
            return { def: f, home, it: fishImg(f, FISH.xs[home], FISH.sitY) }
        })
        const filled = new Set<number>()
        let k = 0
        let float: Phaser.Tweens.Tween | undefined
        let hint: Phaser.GameObjects.Graphics | undefined
        const current = () => list[k]
        const homeRect = (h: number): Rect => {
            const top = FISH.shellY - 70
            const bottom = FISH.cardY + FISH.cardH + 8
            return { x: FISH.xs[h], y: (top + bottom) / 2, w: FISH.cardW + 24, h: bottom - top }
        }
        return {
            items: list.map(m => m.it),
            async look() {
                await FX.all(...list.map((m, i) => FX.wait(scene, i * 120).then(() => FX.to(scene, m.it.box, { y: m.it.box.y - 18 }, { duration: 300, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' }))))
            },
            async scatter() {
                void blowAway(cards)
                await FX.all(...list.map((m, i) => tumbleTo(m.it, FISH.scatter[i], i)))
                list.forEach(m => m.it.box.setAngle(0))
            },
            async prepare() {
                await bringBack(cards, cardSpots)
            },
            async step() {
                const m = current()
                m.it.box.setDepth(DEPTH.flying)
                await hopTo(m.it, FISH.hold, 60, 600)
                float = bob(m.it, 8)
            },
            targets: () => homes.map((_, h) => (filled.has(h) ? -1 : h)).filter(h => h >= 0),
            hitRect: homeRect,
            judge(h) {
                const field = fishMismatch(homes[h], current().def)
                return field ? WHY.fish(field, homes[h]) : undefined
            },
            answer: () => current().home,
            async apply(h) {
                float?.stop()
                filled.add(h)
                await hopTo(current().it, { x: FISH.xs[h], y: FISH.sitY }, 80)
                current().it.box.setDepth(DEPTH.piece)
            },
            async oops(h) {
                const m = current()
                const field = fishMismatch(homes[h], m.def) ?? 'corpo'
                const row = rowsOf[h][FISH_FIELDS.indexOf(field)]
                hint = glowRect(homeRect(m.home))
                await FX.all(FX.shake(scene, row, { amount: 8, times: 6 }), FX.shake(scene, m.it.box, { amount: 10, times: 5 }))
            },
            async settle(h) {
                k += 1
                void FX.sparks(scene, FISH.xs[h], FISH.sitY - 40, { color: C.white, count: 12, spread: 80, size: 8, depth: DEPTH.fx })
                await FX.to(scene, cards[h], { angle: 5 }, { duration: 160, yoyo: true, repeat: 1 })
            },
            done: () => filled.size === list.length,
            async celebrate() {
                hint?.destroy()
                await FX.all(...list.map((m, i) => FX.wait(scene, i * 140).then(() => FX.to(scene, m.it.box, { y: m.it.box.y - 50 }, { duration: 260, yoyo: true, ease: 'Sine.easeOut' }))))
            },
            teach: () => [
                { text: TEACH.card, rect: union(cards.map((_, h) => ({ x: FISH.xs[h], y: FISH.cardY + FISH.cardH / 2, w: FISH.cardW + 16, h: FISH.cardH + 16 }))) },
                { text: TEACH.labels, rect: union(cards.map((_, h) => ({ x: FISH.xs[h] - 50, y: FISH.cardY + 40 + FISH.row / 2, w: 70, h: FISH.row + 60 }))) },
            ],
            groupRect: () => union(homes.map((_, h) => homeRect(h))),
        }
    }

    // ───────────────────────────────────────────── vagalumes (TEIA)

    const fireflies = (p: Extract<JeitoPhase, { group: 'vagalumes' }>): Kit => {
        const { glows, before, after, edges } = p
        const spotOf = (slot: number): Vec => {
            const a = Phaser.Math.DegToRad(FLY.angles[slot])
            return { x: FLY.center.x + Math.cos(a) * FLY.rx, y: FLY.center.y + Math.sin(a) * FLY.ry }
        }
        const list = glows.map((g, i) => {
            const at = spotOf(before[i])
            const it = item(CREW_SHEET.key, glowCell(g), FLY.w, 'w', at.x, at.y, 0.5)
            const halo = scene.add.image(0, 0, HALO_KEY).setTint(GLOW[g]).setAlpha(0.7)
            it.box.addAt(halo, 0)
            return { glow: g, it, halo }
        })
        const byGlow = (g: Glow) => list.findIndex(f => f.glow === g)
        const thread = (a: Vec, b: Vec, grow = false) => {
            const len = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y)
            const img = own(scene.add.image(a.x, a.y, LIGHT_KEY).setOrigin(0, 0.5).setDepth(DEPTH.plot))
            img.setRotation(Phaser.Math.Angle.Between(a.x, a.y, b.x, b.y))
            const sx = len / 64
            img.setScale(grow ? 0.001 : sx, 1)
            return { img, sx }
        }
        const old = edges.map(([x, y]) => thread(spotOf(before[byGlow(x)]), spotOf(before[byGlow(y)])).img)
        const pairIcon = (g: Glow, x: number) => {
            const img = scene.add.image(x, 0, CREW_SHEET.key, cellKey(glowCell(g)))
            return img.setScale(52 / Math.max(img.width, img.height))
        }
        const card = own(scene.add.container(FLY.card.x, FLY.card.y, [scene.add.image(0, 0, PAIR_KEY)]).setDepth(DEPTH.stake).setVisible(false))
        let k = 0
        let leaderRing: Phaser.GameObjects.Graphics | undefined
        let pending: Phaser.GameObjects.Image | undefined
        const edge = () => edges[k]
        const pos = (i: number) => ({ x: list[i].it.box.x, y: list[i].it.box.y })
        return {
            items: list.map(f => f.it),
            async look() {
                await FX.all(...list.map((f, i) => FX.wait(scene, i * 140).then(() => FX.to(scene, f.halo, { scale: 1.35, alpha: 1 }, { duration: 320, yoyo: true, repeat: 2 }))))
            },
            async scatter() {
                void FX.all(...old.map(t => FX.to(scene, t, { alpha: 0, angle: t.angle + 25 }, { duration: 360, ease: 'Sine.easeIn' })))
                await FX.all(
                    ...list.map((f, i) =>
                        FX.wait(scene, i * 110).then(() => FX.arcTo(scene, f.it.box, spotOf(after[i]), { height: 120, duration: TIMING.tumble })),
                    ),
                )
            },
            async prepare() {
                card.setVisible(true)
                await FX.popIn(scene, card, { from: 0.4, duration: 360 })
            },
            async step() {
                const [a, b] = edge()
                card.removeAll(true)
                card.add([scene.add.image(0, 0, PAIR_KEY), pairIcon(a, -FLY.card.w / 2 + 34), pairIcon(b, FLY.card.w / 2 - 34)])
                void FX.popIn(scene, card, { from: 0.85, duration: 260 })
                const lead = pos(byGlow(a))
                leaderRing?.destroy()
                leaderRing = own(scene.add.graphics().setDepth(DEPTH.plot).setPosition(lead.x, lead.y))
                leaderRing.lineStyle(6, C.lightLine, 1)
                leaderRing.strokeCircle(0, 0, FLY.w * 0.62)
                await FX.to(scene, list[byGlow(a)].it.box, { scale: 1.15 }, { duration: 220, yoyo: true })
            },
            targets: () => list.map((_, i) => i).filter(i => list[i].glow !== edge()[0]),
            hitRect: i => ({ ...pos(i), w: FLY.hit, h: FLY.hit }),
            judge: i => (edgeFits(edge(), edge()[0], list[i].glow) ? undefined : WHY.glow(edge()[0], edge()[1])),
            answer: () => byGlow(edge()[1]),
            async apply(i) {
                const t = thread(pos(byGlow(edge()[0])), pos(i), true)
                pending = t.img
                await FX.to(scene, t.img, { scaleX: t.sx }, { duration: 420, ease: 'Sine.easeOut' })
            },
            async oops(i) {
                const right = byGlow(edge()[1])
                if (pending) void FX.to(scene, pending, { angle: pending.angle + 70, alpha: 0 }, { duration: 600, ease: 'Sine.easeIn' })
                void FX.to(scene, list[right].it.box, { scale: 1.25 }, { duration: 200, yoyo: true, repeat: 2 })
                await FX.shake(scene, list[i].it.box, { amount: 10, times: 5 })
            },
            async settle(i) {
                pending = undefined
                k += 1
                const a = list[byGlow(edges[k - 1][0])]
                void FX.sparks(scene, list[i].it.box.x, list[i].it.box.y, { color: C.lightLine, count: 10, spread: 60, size: 7, depth: DEPTH.fx })
                await FX.all(FX.to(scene, list[i].halo, { scale: 1.3 }, { duration: 180, yoyo: true }), FX.to(scene, a.halo, { scale: 1.3 }, { duration: 180, yoyo: true }))
            },
            done: () => k >= edges.length,
            async celebrate() {
                leaderRing?.destroy()
                leaderRing = undefined
                card.setVisible(false)
                await FX.all(...list.map((f, i) => FX.wait(scene, i * 100).then(() => FX.to(scene, f.halo, { scale: 1.5, alpha: 1 }, { duration: 260, yoyo: true, repeat: 2 }))))
            },
            teach: () => [{ text: TEACH.web, rect: { x: FLY.card.x, y: FLY.card.y, w: FLY.card.w + 20, h: FLY.card.h + 20 } }],
            groupRect: () => ({ x: FLY.center.x, y: FLY.center.y, w: FLY.rx * 2 + FLY.w + 20, h: FLY.ry * 2 + FLY.w + 20 }),
        }
    }

    // ───────────────────────────────────────────── caracol (SOLTO)

    const snail = (): Kit => {
        const owner = item(CREW_SHEET.key, CREW_CELL.snail, SNAIL.w, 'w', SNAIL.x, SNAIL.y)
        const stone = item(CREW_SHEET.key, CREW_CELL.pebble, SNAIL.pebbleW, 'w', SNAIL.pebble.x, SNAIL.pebble.y)
        const seven = scene.add
            .text(0, -stone.img.displayHeight * 0.48, PEBBLE_TEXT, { fontFamily: FONT.black, fontSize: `${Math.round(SNAIL.pebbleW * 0.5)}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        stone.box.add(seven)
        let basket: Item | undefined
        return {
            items: [stone],
            async look() {
                void FX.sparks(scene, stone.box.x, stone.box.y - 50, { color: C.butter, count: 10, spread: 60, size: 8, depth: DEPTH.fx })
                await FX.to(scene, owner.box, { y: owner.box.y - 10 }, { duration: 260, yoyo: true, repeat: 2 })
            },
            async scatter() {
                void FX.shake(scene, owner.box, { amount: 8, times: 4 })
                await FX.all(
                    FX.arcTo(scene, stone.box, SNAIL.fly, { height: 160, duration: TIMING.tumble }),
                    FX.to(scene, stone.box, { angle: 380 }, { duration: TIMING.tumble, ease: 'Sine.easeOut' }),
                )
                stone.box.setAngle(20)
            },
            async prepare() {
                basket = item(CREW_SHEET.key, CREW_CELL.basket, SNAIL.basket.w, 'w', SNAIL.basket.x, SNAIL.basket.y)
                await FX.popIn(scene, basket.box, { from: 0.3, duration: 380 })
                stone.box.setDepth(DEPTH.flying)
                await hopTo(stone, { x: SNAIL.basket.x, y: SNAIL.basket.y - 150 }, 120)
                await FX.to(scene, stone.box, { y: SNAIL.basket.y - 92, scale: 0.8 }, { duration: 200, ease: 'Sine.easeIn' })
                stone.box.setDepth(DEPTH.piece + 2)
                void FX.impact(scene, basket.box, 0.12)
            },
            step: () => Promise.resolve(),
            targets: () => [],
            hitRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
            judge: () => undefined,
            answer: () => -1,
            apply: () => Promise.resolve(),
            oops: () => Promise.resolve(),
            settle: () => Promise.resolve(),
            done: () => true,
            async celebrate() {
                void FX.sparks(scene, owner.box.x, owner.box.y - 80, { color: C.butter, count: 14, spread: 90, size: 9, depth: DEPTH.fx })
                await FX.to(scene, owner.box, { y: owner.box.y - 26 }, { duration: 200, yoyo: true, repeat: 1 })
            },
            teach: () => [],
            groupRect: () => union([boxRect(owner, 12), boxRect(stone, 12)]),
        }
    }

    // ───────────────────────────────────────────── placas e erro de jeito

    const plateX = (i: number) => 640 + (i - 0.5) * JEITO.plates.gap

    const plateOf = (home: Home) => plates.find(p => p.home === home)

    const clear = () => {
        unhook()
        owned.forEach(o => {
            scene.tweens.killTweensOf(o)
            o.destroy()
        })
        owned.clear()
        plates = []
        kit = undefined
    }

    const need = () => kit as Kit

    const view: Crew = {
        build(next) {
            clear()
            phase = next
            ensureCrewBits(scene)
            kit =
                next.group === 'patos'
                    ? ducks(next)
                    : next.group === 'cogumelos'
                      ? shrooms(next)
                      : next.group === 'peixes'
                        ? fishes(next)
                        : next.group === 'vagalumes'
                          ? fireflies(next)
                          : snail()
        },
        hide() {
            clear()
            phase = undefined
        },
        look: () => need().look(),
        scatter: () => need().scatter(),
        groupRect: () => need().groupRect(),
        async showPlates() {
            const p = phase as JeitoPhase
            plates = p.options.map((home, i) => {
                const plate = makePlate(scene, home, JEITO.plates.k, 34)
                own(plate.box.setPosition(plateX(i), JEITO.plates.y).setDepth(DEPTH.piece + 2))
                return { home, ...plate }
            })
            await FX.all(...plates.map((pl, i) => FX.popIn(scene, pl.box, { from: 0.5, delay: i * 140, duration: 360 })))
        },
        plateRect(home) {
            const pl = plateOf(home)
            if (!pl) return { x: 640, y: JEITO.plates.y, w: 0, h: 0 }
            return { x: pl.box.x, y: pl.box.y, w: Math.max(pl.w + 24, JEITO.plates.hitW), h: JEITO.plates.hitH }
        },
        platesRect: () => union(plates.map(pl => view.plateRect(pl.home))),
        activatePlates(onPick) {
            view.deactivate()
            plates.forEach(pl => {
                const r = view.plateRect(pl.home)
                ringAt(r)
                zoneAt(r, () => onPick(pl.home), pl.box)
            })
        },
        async choose(home) {
            const pl = plateOf(home)
            if (!pl) return
            await FX.press(scene, pl.box)
            await FX.all(...plates.filter(o => o !== pl).map(o => FX.to(scene, o.box, { alpha: 0.35 }, { duration: 200 })))
        },
        async misfit(home) {
            const k = JEITO.wrong.k
            const at = { x: JEITO.wrong.x, y: JEITO.wrong.y }
            const board = own(shapeBoard(scene, home, k).setPosition(at.x + 4, at.y + 5).setDepth(DEPTH.plot))
            await FX.popIn(scene, board, { from: 0.4, duration: 360 })
            const items = need().items
            const room = SHAPE_DOTS[home].length
            await FX.all(
                ...items.map((it, i) => {
                    const target = i < room ? shapeAt(home, at, k, i) : { x: at.x + (i % 2 ? 1 : -1) * 260, y: at.y - 40 }
                    const scale = JEITO.wrong.item / Math.max(it.img.displayWidth, it.img.displayHeight)
                    it.box.setDepth(DEPTH.flying)
                    return FX.wait(scene, i * 100).then(() =>
                        FX.all(
                            FX.arcTo(scene, it.box, { x: target.x, y: target.y + (it.img.originY - 0.5) * it.img.displayHeight * scale }, { height: 80, duration: 560 }),
                            FX.to(scene, it.box, { scale, angle: 0 }, { duration: 560 }),
                        ),
                    )
                }),
            )
            await FX.all(FX.shake(scene, board, { amount: 10, times: 5 }), ...items.map(it => FX.shake(scene, it.box, { amount: 8, times: 5 })))
            const right = plateOf(wayOf((phase as JeitoPhase).group))
            const chosen = plateOf(home)
            if (chosen) void FX.to(scene, chosen.box, { alpha: 0.35 }, { duration: 200 })
            if (right) {
                right.box.setAlpha(1)
                void FX.to(scene, right.box, { scale: 1.12 }, { duration: 240, yoyo: true, repeat: 2 })
            }
            await FX.all(
                ...items.map((it, i) =>
                    FX.wait(scene, i * 80).then(() =>
                        FX.all(
                            FX.to(scene, it.box, { y: JEITO.ground - 20 - (i % 3) * 8 }, { duration: 520, ease: 'Bounce.easeOut' }),
                            FX.to(scene, it.box, { angle: (i % 2 ? 1 : -1) * 80 }, { duration: 520 }),
                        ),
                    ),
                ),
            )
        },
        async prepare() {
            await FX.all(...plates.map(pl => FX.to(scene, pl.box, { alpha: 0, scale: 0.8 }, { duration: 260 })))
            plates.forEach(pl => drop(pl.box))
            plates = []
            await need().prepare()
        },
        step: () => need().step(),
        activate(onPick) {
            view.deactivate()
            const k = need()
            k.targets().forEach(t => {
                const r = k.hitRect(t)
                ringAt(r)
                zoneAt(r, () => onPick(t))
            })
        },
        deactivate: unhook,
        judge: t => need().judge(t),
        answer: () => need().answer(),
        targetCenter: t => center(need().hitRect(t)),
        targetsRect: () => {
            const k = need()
            const ts = k.targets()
            return ts.length ? union(ts.map(t => k.hitRect(t))) : k.groupRect()
        },
        apply: t => need().apply(t),
        oops: t => need().oops(t),
        settle: t => need().settle(t),
        done: () => need().done(),
        celebrate: () => need().celebrate(),
        teachSteps: () => need().teach(),
        destroy() {
            clear()
        },
    }
    return view
}

