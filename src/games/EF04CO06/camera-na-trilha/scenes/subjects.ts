import Phaser from 'phaser'
import {
    CAVE_CELL,
    CAVE_SHEET,
    CRITTER_CELL,
    CRITTER_SHEET,
    FALL_SHEET,
    NATURE_CELL,
    NATURE_SHEET,
    SCENERY_CELL,
    SCENERY_SHEET,
    WOOD_CELL,
    WOOD_SHEET,
    cellKey,
    type Sheet,
} from '../data/files'
import { DEPTH, worldDepth } from '../data/layout'
import { sizeOf } from '../data/maps'
import { SUBJECTS } from '../data/subjects'
import type { Circle, MapDef, Spot, SubjectDef, SubjectId, Vec } from '../types'
import { GLINT, RIPPLE, SHADOW, fit, tall } from './art'
import type { View } from './view'

export interface SubjectView {
    readonly def: SubjectDef
    readonly spot: Spot
    readonly parts: Phaser.GameObjects.GameObject[]
    readonly washed: boolean
    focus(): Vec
    glow(): Circle[]
    setWashed(on: boolean): void
    update(delta: number): void
    react(): void
    destroy(): void
}

const HOP_WAIT = 1200
const HOP_MS = 380
const DUCK_SPEED = 32
const FALL_AT = { dx: -28, dy: 198 }
const DRIP_MS = 1400
const FIREFLIES = 5
const ANTS = 6
const ANT_RUN = 130

const STILL: Partial<Record<SubjectId, { sheet: Sheet; cell: number; pale?: number }>> = {
    bluecrystal: { sheet: CAVE_SHEET, cell: CAVE_CELL.bluecrystal },
    crystal: { sheet: CAVE_SHEET, cell: CAVE_CELL.crystal },
    stalagmite: { sheet: CAVE_SHEET, cell: CAVE_CELL.stalagmite },
    glowshroom: { sheet: CAVE_SHEET, cell: CAVE_CELL.shroomLit, pale: CAVE_CELL.shroomPale },
    glowmoss: { sheet: CRITTER_SHEET, cell: CRITTER_CELL.mossLit, pale: CRITTER_CELL.mossPale },
    nest: { sheet: WOOD_SHEET, cell: WOOD_CELL.nest },
    ladybug: { sheet: WOOD_SHEET, cell: WOOD_CELL.ladybug },
    bigtree: { sheet: WOOD_SHEET, cell: WOOD_CELL.bigtree },
    anthill: { sheet: WOOD_SHEET, cell: WOOD_CELL.anthill },
    boulder: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.rock },
}

const GLOW_R: Partial<Record<SubjectId, number>> = { glowshroom: 150, glowmoss: 120 }

export function createSubjects(scene: Phaser.Scene, view: View, map: MapDef): SubjectView[] {
    return map.spots.map(spot => createSubject(scene, view, spot))
}

function createSubject(scene: Phaser.Scene, view: View, spot: Spot): SubjectView {
    const def = SUBJECTS[spot.subject]
    const size = sizeOf(spot)
    const parts: Phaser.GameObjects.GameObject[] = []
    const add = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        view.world(obj)
        parts.push(obj)
        return obj
    }
    const shadow = (x: number, y: number, w: number, alpha = 0.2) =>
        add(scene.add.image(x, y, SHADOW).setDisplaySize(w, w * 0.32).setAlpha(alpha).setDepth(DEPTH.water + 0.9))

    const at = spot.at
    const pos = { ...at }
    let clock = 0
    let washed = false
    let update: (delta: number) => void = () => undefined
    let glow: () => Circle[] = () => []
    let figureArt: Phaser.GameObjects.Image | undefined
    let baseY = 0

    const still = STILL[def.id]
    if (still) {
        const ref = still.pale ?? still.cell
        const art = scene.add.image(0, 0, still.sheet.key, cellKey(ref)).setOrigin(0.5, 1)
        art.setScale(size / Math.max(art.frame.width, art.frame.height))
        const h = art.displayHeight
        baseY = at.y + h / 2
        art.setPosition(at.x, baseY).setDepth(worldDepth(baseY))
        shadow(at.x + 6, baseY - 4, art.displayWidth * 0.85)
        figureArt = add(art)
        if (still.pale !== undefined) {
            const lit = still.cell
            const pale = still.pale
            update = () => art.setFrame(cellKey(washed ? pale : lit))
            art.setFrame(cellKey(lit))
            glow = () => (washed ? [] : [{ x: at.x, y: at.y, r: GLOW_R[def.id] ?? 120 }])
        }
        if (def.id === 'bigtree') update = () => art.setRotation(Math.sin(clock / 900) * 0.02)
    }

    if (def.id === 'mushroom' || def.id === 'sunflower') {
        const cell = def.id === 'mushroom' ? NATURE_CELL.mushroom : NATURE_CELL.sunflower
        shadow(at.x + 4, at.y + size / 2 - 2, size * (def.id === 'mushroom' ? 1.1 : 0.6))
        figureArt = add(tall(scene, NATURE_SHEET, cell, size).setPosition(at.x, at.y + size / 2).setDepth(worldDepth(at.y + size / 2)))
        baseY = figureArt.y
        if (def.id === 'sunflower') update = () => figureArt?.setRotation(Math.sin(clock / 700) * 0.035)
    }

    if (def.id === 'butterfly') {
        const shade = shadow(at.x, at.y + 70, 40, 0.14)
        figureArt = add(fit(scene, NATURE_SHEET, NATURE_CELL.butterflyA, size).setDepth(worldDepth(at.y + 70)))
        let last = at.x
        update = () => {
            const t = clock / 1000
            pos.x = at.x + Math.cos(t * 1.25) * 72
            pos.y = at.y + Math.sin(t * 2.3) * 34 + Math.sin(t * 7) * 4
            const flap = Math.floor(clock / 110) % 2 === 0
            figureArt?.setFrame(cellKey(flap ? NATURE_CELL.butterflyA : NATURE_CELL.butterflyB)).setPosition(pos.x, pos.y)
            figureArt?.setFlipX(pos.x < last)
            last = pos.x
            shade.setPosition(pos.x, at.y + 70)
        }
    }

    if (def.id === 'frog') {
        const route = spot.route ?? [at]
        const feet = 24
        const shade = shadow(route[0].x, route[0].y + feet, 56)
        figureArt = add(tall(scene, NATURE_SHEET, NATURE_CELL.frog, size).setDepth(worldDepth(at.y + 40)))
        let index = 0
        let phase = 0
        pos.x = route[0].x
        pos.y = route[0].y
        update = delta => {
            phase += delta
            const from = route[index]
            const to = route[(index + 1) % route.length]
            if (phase < HOP_WAIT) {
                pos.x = from.x
                pos.y = from.y
                figureArt?.setFrame(cellKey(NATURE_CELL.frog)).setFlipX(false)
                figureArt?.setPosition(pos.x, pos.y + feet)
                shade.setPosition(pos.x, pos.y + feet - 2)
                return
            }
            const k = Math.min(1, (phase - HOP_WAIT) / HOP_MS)
            pos.x = Phaser.Math.Linear(from.x, to.x, k)
            pos.y = Phaser.Math.Linear(from.y, to.y, k) - Math.sin(k * Math.PI) * 46
            figureArt?.setFrame(cellKey(NATURE_CELL.frogJump)).setFlipX(to.x < from.x)
            figureArt?.setPosition(pos.x, pos.y + feet)
            shade.setPosition(pos.x, Phaser.Math.Linear(from.y, to.y, k) + feet - 2)
            if (k >= 1) {
                index = (index + 1) % route.length
                phase = 0
            }
        }
    }

    if (def.id === 'duck') {
        const route = spot.route ?? [at, at]
        figureArt = add(fit(scene, NATURE_SHEET, NATURE_CELL.duck, size * 1.4).setDepth(worldDepth(at.y + 30)))
        const len = Math.hypot(route[1].x - route[0].x, route[1].y - route[0].y)
        let travel = len / 2
        let dir = 1
        update = delta => {
            travel += (dir * DUCK_SPEED * delta) / 1000
            if (travel > len) {
                travel = len
                dir = -1
            }
            if (travel < 0) {
                travel = 0
                dir = 1
            }
            const k = travel / len
            pos.x = Phaser.Math.Linear(route[0].x, route[1].x, k)
            pos.y = Phaser.Math.Linear(route[0].y, route[1].y, k)
            const goingRight = (route[1].x - route[0].x) * dir > 0
            figureArt?.setPosition(pos.x, pos.y + Math.sin(clock / 300) * 2).setFlipX(!goingRight)
        }
    }

    if (def.id === 'waterfall') {
        figureArt = add(tall(scene, FALL_SHEET, 0, size).setPosition(at.x + FALL_AT.dx, at.y + FALL_AT.dy).setDepth(worldDepth(at.y + FALL_AT.dy)))
        update = () => figureArt?.setFrame(cellKey(Math.floor(clock / 170) % 2))
    }

    if (def.id === 'lake') {
        const rings = Array.from({ length: 4 }, (_, i) => {
            const ring = add(scene.add.image(at.x, at.y, RIPPLE).setDepth(DEPTH.water + 0.45).setAlpha(0))
            return { ring, offset: i * 650 }
        })
        const spots = [
            { x: -40, y: -10 },
            { x: 46, y: 14 },
            { x: -6, y: 22 },
            { x: 30, y: -24 },
        ]
        const glints = [-60, 10, 64].map((dx, i) => {
            const glint = add(scene.add.image(at.x + dx, at.y + (i - 1) * 18, GLINT).setDepth(DEPTH.water + 0.46).setAlpha(0))
            return { glint, offset: i * 480 }
        })
        update = () => {
            rings.forEach(({ ring, offset }, i) => {
                const k = ((clock + offset) % 2600) / 2600
                const s = spots[(Math.floor((clock + offset) / 2600) + i) % spots.length]
                ring.setPosition(at.x + s.x, at.y + s.y).setScale(0.25 + k * 1.1).setAlpha(0.9 * (1 - k))
            })
            glints.forEach(({ glint, offset }) => {
                const k = ((clock + offset) % 1400) / 1400
                glint.setAlpha(Math.sin(k * Math.PI) * 0.95).setScale(0.6 + Math.sin(k * Math.PI) * 0.4)
            })
        }
    }

    if (def.id === 'drops') {
        add(fit(scene, CAVE_SHEET, CAVE_CELL.puddle, size).setPosition(at.x, at.y + 18).setDepth(DEPTH.water + 0.7))
        const drop = add(fit(scene, CRITTER_SHEET, CRITTER_CELL.drop, 30).setDepth(worldDepth(at.y + 40)))
        const splash = add(fit(scene, CRITTER_SHEET, CRITTER_CELL.splash, 70).setPosition(at.x, at.y + 6).setDepth(worldDepth(at.y + 40)))
        const ring = add(scene.add.image(at.x, at.y + 18, RIPPLE).setDepth(DEPTH.water + 0.75).setAlpha(0))
        pos.y = at.y - 10
        update = () => {
            const k = (clock % DRIP_MS) / DRIP_MS
            const fall = Math.min(1, k / 0.35)
            drop.setVisible(k < 0.35).setPosition(at.x, Phaser.Math.Linear(at.y - 170, at.y, fall * fall)).setAlpha(Math.min(1, k / 0.06))
            const hit = (k - 0.35) / 0.25
            splash.setVisible(hit >= 0 && hit <= 1).setAlpha(1 - Math.max(0, hit))
            const wave = (k - 0.35) / 0.6
            ring.setAlpha(wave >= 0 && wave <= 1 ? 0.8 * (1 - wave) : 0).setScale(0.3 + Math.max(0, wave) * 0.9, (0.3 + Math.max(0, wave) * 0.9) * 0.7)
        }
    }

    if (def.id === 'cavefish') {
        figureArt = add(fit(scene, CRITTER_SHEET, CRITTER_CELL.fish, size).setDepth(DEPTH.water + 0.6))
        let last = at.x
        update = () => {
            const t = clock / 900
            pos.x = at.x + Math.cos(t) * 110
            pos.y = at.y + Math.sin(t) * 40
            figureArt?.setPosition(pos.x, pos.y).setFlipX(pos.x < last).setRotation(Math.sin(clock / 160) * 0.08)
            last = pos.x
        }
    }

    if (def.id === 'fireflies') {
        const flies = Array.from({ length: FIREFLIES }, (_, i) => {
            const fly = add(fit(scene, CRITTER_SHEET, CRITTER_CELL.fireflyLit, size).setDepth(worldDepth(at.y + 90)))
            return { fly, r: 30 + i * 8, speed: 0.0011 + i * 0.00017, phase: i * 1.3, lit: true }
        })
        update = () => {
            flies.forEach((f, i) => {
                const t = clock * f.speed + f.phase
                f.fly.setPosition(at.x + Math.cos(t) * f.r, at.y + Math.sin(t * 1.3) * f.r * 0.6 + Math.sin(clock / 200 + i) * 4)
                f.fly.setFlipX(Math.sin(t) > 0)
                const wave = Math.sin(clock / 260 - i * 0.9)
                f.lit = !washed && wave > -0.2
                f.fly.setFrame(cellKey(f.lit ? CRITTER_CELL.fireflyLit : CRITTER_CELL.fireflyDim))
            })
        }
        glow = () => flies.filter(f => f.lit).map(f => ({ x: f.fly.x, y: f.fly.y, r: 50 }))
    }

    if (def.id === 'ants') {
        const ants = Array.from({ length: ANTS }, () => add(fit(scene, WOOD_SHEET, WOOD_CELL.ant, size).setFlipX(true).setDepth(worldDepth(at.y + 20))))
        update = () => {
            ants.forEach((ant, i) => {
                const run = ANT_RUN * 2
                const d = (clock * 0.04 + (i * run) / ANTS) % run
                const x = at.x - ANT_RUN + d
                ant.setPosition(x, at.y + Math.sin((x + clock * 0.02) / 30) * 6 + Math.abs(Math.sin(clock / 90 + i)) * -2)
                ant.setAlpha(Math.min(1, d / 30, (run - d) / 30))
            })
        }
    }

    if (def.id === 'bee') {
        const flower = add(fit(scene, WOOD_SHEET, WOOD_CELL.flower, 92).setPosition(at.x, at.y + 30).setDepth(worldDepth(at.y + 30)))
        figureArt = add(fit(scene, WOOD_SHEET, WOOD_CELL.beeOpen, size).setDepth(worldDepth(at.y + 60)))
        const shade = shadow(at.x, at.y + 50, 30, 0.14)
        let last = at.x
        update = () => {
            const cycle = clock % 4200
            const resting = cycle > 3000
            const t = clock / 1000
            const hx = at.x + Math.cos(t * 1.7) * 34
            const hy = at.y - 5 + Math.sin(t * 2.6) * 20
            const k = resting ? Math.min(1, (cycle - 3000) / 250) * Math.min(1, (4200 - cycle) / 250) : 0
            pos.x = Phaser.Math.Linear(hx, flower.x, k)
            pos.y = Phaser.Math.Linear(hy, flower.y - 22, k)
            const wings = resting ? WOOD_CELL.beeShut : Math.floor(clock / 60) % 2 ? WOOD_CELL.beeOpen : WOOD_CELL.beeShut
            figureArt?.setFrame(cellKey(wings)).setPosition(pos.x, pos.y).setFlipX(pos.x < last - 0.2)
            last = pos.x
            shade.setPosition(pos.x, at.y + 50)
        }
    }

    const subject: SubjectView = {
        def,
        spot,
        parts,
        get washed() {
            return washed
        },
        focus: () => ({ x: pos.x, y: pos.y }),
        glow: () => glow(),
        setWashed(on) {
            washed = on
        },
        update(delta) {
            clock += delta
            update(delta)
        },
        react() {
            const art = figureArt
            if (!art || (!still && def.id !== 'mushroom' && def.id !== 'sunflower') || size > 200) return
            scene.tweens.killTweensOf(art)
            scene.tweens.add({
                targets: art,
                y: baseY - 14,
                duration: 160,
                yoyo: true,
                repeat: 1,
                ease: 'Sine.easeOut',
                onComplete: () => art.setY(baseY),
            })
        },
        destroy() {
            parts.forEach(part => {
                scene.tweens.killTweensOf(part)
                part.destroy()
            })
            parts.length = 0
        },
    }
    return subject
}
