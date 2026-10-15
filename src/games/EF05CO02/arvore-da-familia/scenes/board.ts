import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CARD, DEPTH, GROUND, LINE, WAVE } from '../data/layout'
import { PEOPLE } from '../data/people'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { FamilyDef, LevelDef, PhaseDef, Rect, Role, SlotDef, Vec } from '../types'
import { piece, slotImage } from './art'
import { waveReach } from './wave'
import { createCard, type Card } from './card'

export type SlotTouch = 'down' | 'up'

export interface BoardHandlers {
    onCard(card: Card): void
    onSlot(slot: string, touch: SlotTouch): void
}

export type Knock = 'wind' | 'wave'

export interface Board {
    readonly phase: PhaseDef
    card(role: Role): Card
    slot(id: string): SlotDef
    homeOf(role: Role): string
    rectOf(ids: string[]): Rect
    emptySlots(): string[]
    loose(): Card[]
    complete(): boolean
    enter(onRow?: (row: number) => void): Promise<void>
    leave(): Promise<void>
    strip(roles: Role[]): void
    knock(roles: Role[], style: Knock, onFall?: () => void): Promise<void>
    addLoose(card: Card): void
    setLoosePickable(on: boolean, pulse: boolean): void
    setSlotTargets(on: boolean): void
    lift(card: Card | null): void
    attach(card: Card, slot: string): Promise<void>
    reject(card: Card, slot: string): Promise<void>
    celebrate(): Promise<void>
    destroy(): void
}

interface Segment {
    a: Vec
    b: Vec
    lit: boolean
    touches: string[]
}

interface SlotView {
    def: SlotDef
    img: Phaser.GameObjects.Image
    ring: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
}

export function createBoard(scene: Phaser.Scene, level: LevelDef, phase: PhaseDef, handlers: BoardHandlers): Board {
    const size = level.card
    const { w, h } = size
    const occupant = new Map<string, Role | null>()
    const cards = new Map<Role, Card>()
    const free: Card[] = []
    const extras: Phaser.GameObjects.GameObject[] = []

    const edges = scene.add.graphics().setDepth(DEPTH.edges)
    const alert = scene.add.graphics().setDepth(DEPTH.edges + 1).setAlpha(0)

    const views: SlotView[] = phase.slots.map(def => {
        const img = slotImage(scene, def.x, def.y, size).setDepth(DEPTH.slots).setVisible(false)
        const ring = scene.add.graphics({ x: def.x, y: def.y }).setDepth(DEPTH.slots + 1).setVisible(false)
        const pad = CARD.ring
        ring.lineStyle(6, C.ring, 1)
        ring.strokeRoundedRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2, CARD.radius + pad)
        const zone = scene.add
            .zone(def.x, def.y, w + 24, h + 24)
            .setDepth(DEPTH.slots + 2)
            .setInteractive({ useHandCursor: true })
        if (zone.input) zone.input.enabled = false
        zone.on('pointerdown', () => handlers.onSlot(def.id, 'down'))
        zone.on('pointerup', () => handlers.onSlot(def.id, 'up'))
        occupant.set(def.id, null)
        return { def, img, ring, zone }
    })
    const view = (id: string) => views.find(v => v.def.id === id) as SlotView

    phase.people.forEach(p => {
        const person = PEOPLE[p.role]
        const text = level.links && person.link ? person.link : person.label
        const card = createCard(scene, p.role, size, text, c => handlers.onCard(c))
        const s = view(p.slot).def
        card.put(s.x, s.y)
        card.box.setScale(0)
        cards.set(p.role, card)
        occupant.set(p.slot, p.role)
    })

    const filled = (id: string) => occupant.get(id) != null
    const homeOf = (role: Role) => phase.people.find(p => p.role === role)?.slot ?? ''

    const segmentsOf = (f: FamilyDef): Segment[] => {
        const parents = f.parents.map(id => view(id).def).sort((a, b) => a.x - b.x)
        const kids = f.children.map(id => view(id).def)
        const py = parents[0].y
        const cy = kids[0].y
        const barY = cy - h / 2 - LINE.gap
        const all = parents.every(p => filled(p.id))
        const any = parents.some(p => filled(p.id))
        const out: Segment[] = []
        let mid: number
        let top: number
        if (parents.length === 2) {
            mid = (parents[0].x + parents[1].x) / 2
            top = py
            out.push({
                a: { x: parents[0].x + w / 2, y: py },
                b: { x: parents[1].x - w / 2, y: py },
                lit: all,
                touches: parents.map(p => p.id),
            })
        } else {
            mid = parents[0].x
            top = py + h / 2
        }
        const parentIds = parents.map(p => p.id)
        const kidIds = kids.map(k => k.id)
        out.push({ a: { x: mid, y: top }, b: { x: mid, y: barY }, lit: any, touches: [...parentIds, ...kidIds] })
        const xs = [mid, ...kids.map(k => k.x)]
        out.push({ a: { x: Math.min(...xs), y: barY }, b: { x: Math.max(...xs), y: barY }, lit: any, touches: [...parentIds, ...kidIds] })
        kids.forEach(k => out.push({ a: { x: k.x, y: barY }, b: { x: k.x, y: cy - h / 2 }, lit: any && filled(k.id), touches: [...parentIds, k.id] }))
        return out
    }

    const segments = () => phase.families.flatMap(segmentsOf)

    const stroke = (g: Phaser.GameObjects.Graphics, s: Segment, color: number, width: number, alpha: number, dy = 0) => {
        g.lineStyle(width, color, alpha)
        g.lineBetween(s.a.x, s.a.y + dy, s.b.x, s.b.y + dy)
        g.fillStyle(color, alpha)
        g.fillCircle(s.a.x, s.a.y + dy, width / 2)
        g.fillCircle(s.b.x, s.b.y + dy, width / 2)
    }

    const paint = () => {
        edges.clear()
        const list = segments()
        list.filter(s => !s.lit).forEach(s => stroke(edges, s, C.edge, LINE.dim, 0.3))
        list.filter(s => s.lit).forEach(s => stroke(edges, s, C.shadow, LINE.w + 2, 0.16, 4))
        list.filter(s => s.lit).forEach(s => stroke(edges, s, C.edge, LINE.w, 1))
        list.filter(s => s.lit).forEach(s => {
            edges.lineStyle(2.5, C.edgeHi, 1)
            edges.lineBetween(s.a.x, s.a.y - 1.5, s.b.x, s.b.y - 1.5)
        })
        views.forEach(v => v.img.setVisible(!filled(v.def.id)))
    }
    paint()

    const rows = [...new Set(phase.slots.map(s => s.y))].sort((a, b) => a - b)

    const leaves = (x: number, y: number, n: number) => {
        for (let i = 0; i < n; i++) {
            const leaf = piece(scene, i % 3 === 2 ? 'flower' : 'leaf', x, y, 32).setDepth(DEPTH.fx)
            extras.push(leaf)
            const a = (i / n) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.3, 0.3)
            const d = Phaser.Math.Between(50, 90)
            void FX.to(scene, leaf, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, angle: Phaser.Math.Between(-160, 160), alpha: 0 }, { duration: 650, ease: 'Sine.easeOut' }).then(() => leaf.destroy())
        }
    }

    const toWorld = (card: Card) => {
        if (card.box.scrollFactorX !== 0) return
        const cam = scene.cameras.main
        card.box.setScrollFactor(1)
        card.box.setPosition(card.box.x + cam.scrollX, card.box.y + cam.scrollY)
    }

    const groundSpots = (n: number) =>
        Phaser.Utils.Array.Shuffle(
            Array.from({ length: n }, (_, i) => GROUND.left + (n === 1 ? (GROUND.right - GROUND.left) / 2 : ((GROUND.right - GROUND.left) * i) / (n - 1))),
        )

    const release = (role: Role) => {
        const card = cards.get(role) as Card
        scene.tweens.killTweensOf(card.box)
        const slot = [...occupant.entries()].find(([, r]) => r === role)?.[0]
        if (slot) occupant.set(slot, null)
        paint()
        free.push(card)
        return card
    }

    const blowWind = async (roles: Role[], onFall?: () => void) => {
        const all = [...cards.values()].filter(c => !free.includes(c))
        all.forEach((c, i) => {
            const swing = 7 + (i % 3) * 2
            scene.tweens.add({ targets: c.box, angle: { from: -swing, to: swing }, duration: 150 + (i % 4) * 25, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' })
        })
        await FX.wait(scene, TIMING.wobble)
        const down = Phaser.Utils.Array.Shuffle(roles.slice())
        const spots = groundSpots(down.length)
        const flights = down.map((role, i) =>
            FX.wait(scene, i * TIMING.fallGap).then(() => {
                onFall?.()
                const card = release(role)
                const tilt = Phaser.Math.Between(-GROUND.tilt, GROUND.tilt)
                return card.flyTo(spots[i], GROUND.y, { arc: 140, ms: TIMING.fall, angle: tilt, spin: Phaser.Math.RND.pick([-1, 1]) })
            }),
        )
        await FX.all(...flights)
        all.filter(c => !down.includes(c.role)).forEach(c => {
            scene.tweens.killTweensOf(c.box)
            void FX.to(scene, c.box, { angle: 0 }, { duration: 200 })
        })
    }

    const washWave = async (roles: Role[], onFall?: () => void) => {
        const spots = groundSpots(roles.length)
        const sorted = roles.slice().sort((a, b) => (cards.get(a) as Card).box.y - (cards.get(b) as Card).box.y)
        const reach = waveReach
        const stay = [...cards.values()].filter(c => !free.includes(c) && !roles.includes(c.role))
        stay.forEach(c => {
            void FX.wait(scene, reach(c.box.y)).then(() => FX.to(scene, c.box, { angle: 4 }, { duration: 120, yoyo: true, repeat: 1 }))
        })
        const carries = sorted.map((role, i) =>
            FX.wait(scene, reach((cards.get(role) as Card).box.y)).then(() => {
                onFall?.()
                const card = release(role)
                card.box.setDepth(DEPTH.carried)
                const tilt = Phaser.Math.Between(-GROUND.tilt, GROUND.tilt)
                const ms = Math.max(500, WAVE.down - reach(card.box.y) + 450)
                return card.flyTo(spots[i], GROUND.y, { arc: -20, ms, angle: tilt })
            }),
        )
        await FX.all(...carries)
    }

    const board: Board = {
        phase,
        card: role => cards.get(role) as Card,
        slot: id => view(id).def,
        homeOf,
        rectOf(ids) {
            const defs = ids.map(id => view(id).def)
            const x0 = Math.min(...defs.map(d => d.x)) - w / 2
            const x1 = Math.max(...defs.map(d => d.x)) + w / 2
            const y0 = Math.min(...defs.map(d => d.y)) - h / 2
            const y1 = Math.max(...defs.map(d => d.y)) + h / 2
            return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 }
        },
        emptySlots: () => views.filter(v => !filled(v.def.id)).map(v => v.def.id),
        loose: () => free.slice(),
        complete: () => views.every(v => filled(v.def.id)),
        async enter(onRow) {
            edges.setAlpha(0)
            for (let r = 0; r < rows.length; r++) {
                onRow?.(r)
                views
                    .filter(v => v.def.y === rows[r] && filled(v.def.id))
                    .forEach((v, i) => void FX.to(scene, (cards.get(occupant.get(v.def.id) as Role) as Card).box, { scale: 1 }, { duration: TIMING.cardPop, delay: i * 70, ease: 'Back.easeOut' }))
                if (r === 0) void FX.to(scene, edges, { alpha: 1 }, { duration: TIMING.linesIn, delay: 200 })
                await FX.wait(scene, TIMING.rowIn)
            }
            await FX.wait(scene, TIMING.cardPop)
        },
        async leave() {
            views.forEach(v => v.img.setVisible(false))
            await FX.all(
                FX.to(scene, edges, { alpha: 0 }, { duration: TIMING.leave }),
                ...[...cards.values()].map(c => FX.to(scene, c.box, { scale: 0, alpha: 0 }, { duration: TIMING.leave, ease: 'Back.easeIn' })),
            )
        },
        strip(roles) {
            roles.forEach(role => {
                occupant.set(homeOf(role), null)
                ;(cards.get(role) as Card).box.setVisible(false)
            })
            paint()
        },
        knock(roles, style, onFall) {
            return style === 'wind' ? blowWind(roles, onFall) : washWave(roles, onFall)
        },
        addLoose(card) {
            if (!free.includes(card)) free.push(card)
        },
        setLoosePickable(on, pulse) {
            free.forEach(c => c.setPickable(on, pulse))
        },
        setSlotTargets(on) {
            views.forEach(v => {
                const target = on && !filled(v.def.id)
                scene.tweens.killTweensOf(v.ring)
                v.ring.setAlpha(1).setVisible(target)
                if (v.zone.input) v.zone.input.enabled = target
                if (target) scene.tweens.add({ targets: v.ring, alpha: 0.35, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            })
        },
        lift(card) {
            free.forEach(c => c.setLifted(c === card))
        },
        async attach(card, id) {
            const s = view(id).def
            free.splice(free.indexOf(card), 1)
            card.setPickable(false, false)
            toWorld(card)
            await card.flyTo(s.x, s.y, { arc: 60, ms: TIMING.fly })
            occupant.set(id, card.role)
            paint()
            leaves(s.x, s.y, 7)
            await FX.to(scene, card.box, { scale: 1.12 }, { duration: 110, yoyo: true })
        },
        async reject(card, id) {
            const s = view(id).def
            free.splice(free.indexOf(card), 1)
            card.setPickable(false, false)
            toWorld(card)
            await card.flyTo(s.x, s.y, { arc: 60, ms: TIMING.fly })
            alert.clear()
            segments()
                .filter(seg => seg.touches.includes(id))
                .forEach(seg => stroke(alert, seg, C.oops, LINE.w + 2, 1))
            alert.setAlpha(1)
            scene.tweens.add({ targets: alert, alpha: 0.2, duration: 180, yoyo: true, repeat: 4 })
            await card.shake()
            await card.dropOut()
        },
        async celebrate() {
            for (let r = 0; r < rows.length; r++) {
                views
                    .filter(v => v.def.y === rows[r] && filled(v.def.id))
                    .forEach((v, i) => void (cards.get(occupant.get(v.def.id) as Role) as Card).hop(i * 60))
                await FX.wait(scene, 170)
            }
            views.forEach((v, i) => {
                const f = piece(scene, 'flower', v.def.x + Phaser.Math.Between(-w, w), v.def.y + Phaser.Math.Between(-h / 2, h / 2), 38).setDepth(DEPTH.edges - 1)
                const base = f.scale
                f.setScale(0)
                extras.push(f)
                void FX.to(scene, f, { scale: base }, { duration: 300, delay: i * 50, ease: 'Back.easeOut' })
            })
            await FX.wait(scene, 500)
        },
        destroy() {
            views.forEach(v => {
                scene.tweens.killTweensOf(v.ring)
                v.zone.destroy()
                v.ring.destroy()
                v.img.destroy()
            })
            cards.forEach(c => c.destroy())
            extras.forEach(e => e.destroy())
            scene.tweens.killTweensOf([edges, alert])
            edges.destroy()
            alert.destroy()
        },
    }

    return board
}
