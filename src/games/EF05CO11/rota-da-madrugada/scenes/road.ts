import Phaser from 'phaser'
import {
    CIDA_SHEET,
    COW_CELL,
    COW_SHEET,
    DOG_SHEET,
    HOUSE_SHEET,
    HOUSE_WINDOW,
    PROP2_CELL,
    PROP2_SHEET,
    PROP_CELL,
    PROP_SHEET,
    SKY2_KEY,
    SKY_KEY,
    TOW_CELL,
    TOW_SHEET,
    cellKey,
    houseFrame,
    type CidaPose,
    type CowPose,
    type DogPose,
    type HouseKind,
    type Prop2Kind,
    type PropKind,
} from '../data/files'
import { DEPTH, FORK, GAP, H, MUD, ROAD, SCALE, SIDE, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Vec, Way, Zone } from '../types'
import { HALO_KEY } from './art'

export interface Prop {
    img: Phaser.GameObjects.Image
    z: number
    side: number
    size: number
    house?: HouseKind
    lit: boolean
    glow?: Phaser.GameObjects.Image
    glowAt?: Vec
    gone: boolean
}

export interface Street {
    cida: Prop
    others: Prop[]
}

export interface Spot {
    z: number
}

interface Fork extends Spot {
    way: Way
    newRoad: boolean
    arrow: boolean
    merge: number
    from: number
    sign?: Prop
}

export interface Road {
    update(dt: number, speed: number): void
    setZone(zone: Zone): void
    spawnDog(z: number): Prop
    dogPose(dog: Prop, pose: DogPose): void
    spawnStreet(z: number): Street
    spawnCow(z: number): Prop
    cowPose(cow: Prop, pose: CowPose): void
    spawnThing(kind: Prop2Kind, z: number, side: number): Prop
    spawnFork(z: number, way: Way, sign: boolean, newRoad: boolean): Spot
    showArrow(): void
    spawnMud(z: number): Spot
    breakBridge(barrier: Prop): void
    spawnTow(z: number): Prop
    towBack(tow: Prop): void
    light(prop: Prop, on: boolean): void
    base(prop: Prop): Vec
    windowOf(prop: Prop): Vec
    scaleOf(prop: Prop): number
    remove(prop: Prop): void
    showCida(street: Street, pose: CidaPose): Phaser.GameObjects.Image
    nameTag(prop: Prop, text: string): Phaser.GameObjects.Container
    destroy(): void
}

const CX = W / 2
const SPAN = ROAD.bottom - ROAD.horizon

export const screenY = (z: number) => ROAD.horizon + SPAN / z
export const screenX = (side: number, z: number) => CX + (side * ROAD.half) / z

const LAMP = { x: 62, y: -300 }
const DOOR = { x: -56, y: 0 }

function random(seed: number) {
    let s = seed
    return () => {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
    }
}

export function createRoad(scene: Phaser.Scene, zone: Zone): Road {
    const wild = zone === 'serra' || zone === 'terra'
    const sky = scene.add.image(0, 0, wild ? SKY2_KEY : SKY_KEY).setOrigin(0).setDepth(DEPTH.sky)
    const ground = scene.add.rectangle(0, ROAD.horizon, W, H - ROAD.horizon, C.ground).setOrigin(0).setDepth(DEPTH.ground)
    const far = scene.add.rectangle(0, ROAD.horizon, W, 26, C.groundFar).setOrigin(0).setDepth(DEPTH.ground)
    const road = scene.add.graphics().setDepth(DEPTH.ground + 1)
    const rnd = random(31)
    const props: Prop[] = []
    let current = zone
    let travelled = 0
    let dirt = zone === 'terra'
    let fork: Fork | undefined
    let gap: Prop | undefined
    const muds: Spot[] = []
    const next = { pole: 0, house: 2, tree: 0, bush: 1.5, pine: 0 }
    const flip = { pole: 1, house: -1, tree: 1, bush: -1, pine: 1 }

    const add = (key: string, frame: string, z: number, side: number, size: number): Prop => {
        const img = scene.add.image(0, 0, key, frame).setOrigin(0.5, 1)
        const prop: Prop = { img, z, side, size, lit: false, gone: false }
        props.push(prop)
        place(prop)
        return prop
    }

    const addProp = (kind: PropKind, z: number, side: number) => {
        const size = kind === 'pole' ? SCALE.pole : kind === 'tree' ? SCALE.tree : SCALE.bush
        const prop = add(PROP_SHEET.key, cellKey(PROP_CELL[kind]), z, side, size)
        if (kind === 'pole') {
            prop.img.setFlipX(side > 0)
            prop.glowAt = { x: side > 0 ? -LAMP.x : LAMP.x, y: LAMP.y }
            prop.glow = scene.add.image(0, 0, HALO_KEY).setDepth(DEPTH.glow).setBlendMode(Phaser.BlendModes.ADD)
            place(prop)
        }
        return prop
    }

    const addThing = (kind: Prop2Kind, z: number, side: number) => {
        const size = kind === 'pine' ? SCALE.pine : kind === 'sign' ? SCALE.sign : kind === 'tower' ? SCALE.tower : SCALE.barrier
        return add(PROP2_SHEET.key, cellKey(PROP2_CELL[kind]), z, side, size)
    }

    const outside = (side: number, z: number) => {
        if (!fork || z <= fork.z) return side
        return Math.sign(side) * (Math.abs(side) + FORK.spread * (z - fork.z) + FORK.half)
    }

    const addHouse = (kind: HouseKind, z: number, side: number, lit: boolean) => {
        const prop = add(HOUSE_SHEET.key, houseFrame(kind, lit), z, side, SCALE.house)
        prop.house = kind
        prop.glowAt = HOUSE_WINDOW[kind]
        if (lit) light(prop, true)
        return prop
    }

    function place(prop: Prop) {
        const s = prop.size / prop.z
        const x = screenX(prop.side, prop.z)
        const y = screenY(prop.z)
        prop.img.setPosition(x, y).setScale(s).setDepth(DEPTH.prop + 1 / prop.z)
        prop.img.setVisible(prop.z < ROAD.far + 0.5)
        if (prop.glow && prop.glowAt) {
            prop.glow
                .setPosition(x + prop.glowAt.x * s, y + prop.glowAt.y * s)
                .setScale(s * (prop.house ? 1.3 : 1.1))
                .setVisible(prop.img.visible && (!prop.house || prop.lit))
        }
    }

    function light(prop: Prop, on: boolean) {
        if (!prop.house) return
        prop.lit = on
        prop.img.setFrame(houseFrame(prop.house, on))
        if (on && !prop.glow) prop.glow = scene.add.image(0, 0, HALO_KEY).setDepth(DEPTH.glow).setBlendMode(Phaser.BlendModes.ADD)
        place(prop)
    }

    const spawn = (z: number) => {
        if (current === 'vila' || current === 'rua') {
            if (travelled >= next.pole) {
                addProp('pole', z, SIDE.pole * flip.pole)
                flip.pole *= -1
                next.pole = travelled + 3.2
            }
        }
        if (current === 'vila' && travelled >= next.house) {
            const kind: HouseKind = rnd() < 0.5 ? 'a' : 'b'
            addHouse(kind, z + 0.3, SIDE.house * flip.house, rnd() < 0.35)
            flip.house *= -1
            next.house = travelled + 3.8
        }
        if (current === 'serra' || current === 'terra') {
            if (travelled >= next.pine) {
                addThing('pine', z, outside((SIDE.pine + rnd() * 0.8) * flip.pine, z))
                flip.pine *= -1
                next.pine = travelled + 1.6 + rnd() * 1.2
            }
            if (travelled >= next.bush) {
                addProp('bush', z + 0.2, outside(SIDE.bush * flip.bush, z + 0.2))
                flip.bush *= -1
                next.bush = travelled + 5 + rnd() * 2
            }
        }
        if (current === 'estrada') {
            if (travelled >= next.tree) {
                addProp('tree', z, (SIDE.tree + rnd() * 0.5) * flip.tree)
                flip.tree *= -1
                next.tree = travelled + 2 + rnd() * 1
            }
            if (travelled >= next.bush) {
                addProp('bush', z + 0.2, SIDE.bush * flip.bush)
                flip.bush *= -1
                next.bush = travelled + 4.5 + rnd() * 2
            }
        }
    }

    const quad = (a: number, b: number, z1: number, z2: number, color: number) => {
        road.fillStyle(color, 1)
        road.fillPoints(
            [
                { x: screenX(a, z1), y: screenY(z1) },
                { x: screenX(b, z1), y: screenY(z1) },
                { x: screenX(b, z2), y: screenY(z2) },
                { x: screenX(a, z2), y: screenY(z2) },
            ],
            true,
        )
    }

    const strip = (center: (z: number) => number, a: number, b: number, z1: number, z2: number, color: number, alpha = 1) => {
        road.fillStyle(color, alpha)
        for (let z = z1; z < z2; ) {
            const zn = Math.min(z + Math.max(0.25, z * 0.12), z2)
            road.fillPoints(
                [
                    { x: screenX(center(z) + a, z), y: screenY(z) },
                    { x: screenX(center(z) + b, z), y: screenY(z) },
                    { x: screenX(center(zn) + b, zn), y: screenY(zn) },
                    { x: screenX(center(zn) + a, zn), y: screenY(zn) },
                ],
                true,
            )
            z = zn
        }
    }

    const branchCenter = (f: Fork, side: Way) => (z: number) => {
        const open = side * FORK.spread * (z - f.z)
        if (side === f.way) return open * (1 - f.merge)
        return (f.newRoad ? 0 : open) + open * 2 * f.merge
    }

    const paintBetween = (f: Fork, top: number) => {
        const left = branchCenter(f, -1)
        const right = branchCenter(f, 1)
        road.fillStyle(C.leafDark, 1)
        for (let z = Math.max(f.z, 0.9); z < top; ) {
            const zn = Math.min(z + Math.max(0.25, z * 0.12), top)
            const a = left(z) + FORK.half
            const b = right(z) - FORK.half
            const an = left(zn) + FORK.half
            const bn = right(zn) - FORK.half
            if (bn > an) {
                road.fillPoints(
                    [
                        { x: screenX(Math.min(a, b), z), y: screenY(z) },
                        { x: screenX(Math.max(a, b), z), y: screenY(z) },
                        { x: screenX(bn, zn), y: screenY(zn) },
                        { x: screenX(an, zn), y: screenY(zn) },
                    ],
                    true,
                )
            }
            z = zn
        }
    }

    const paintBranch = (f: Fork, side: Way, top: number) => {
        const center = branchCenter(f, side)
        const paved = !dirt || (f.newRoad && side === f.way)
        const alpha = side === f.way ? 1 : 1 - f.merge
        const z1 = Math.max(f.z, 0.9)
        strip(center, -FORK.half, FORK.half, z1, top, paved ? C.road : C.dirt, alpha)
        const edge = paved ? C.roadEdge : C.dirtEdge
        const inner = Math.max(z1, f.z + ((f.newRoad ? 2 : 1) * FORK.half) / FORK.spread)
        strip(center, -FORK.half, -FORK.half + ROAD.edge, side < 0 ? z1 : inner, top, edge, alpha)
        strip(center, FORK.half - ROAD.edge, FORK.half, side > 0 ? z1 : inner, top, edge, alpha)
        if (!paved) return
        for (let z = f.z + 0.4; z < top; z += ROAD.dashEvery) {
            const a = Math.max(z, 0.9)
            const b = Math.min(z + ROAD.dashLen, top)
            if (b > a) strip(center, -ROAD.line, ROAD.line, a, b, C.roadLine, alpha)
        }
    }

    const paintArrow = (f: Fork) => {
        const tailZ = Math.max(f.z - FORK.arrowTail, 1)
        const headZ = f.z + FORK.arrowHead
        if (headZ <= tailZ + 0.3) return
        const center = branchCenter(f, f.way)
        const tail = { x: screenX(0, tailZ), y: screenY(tailZ) }
        const head = { x: screenX(center(headZ), headZ), y: screenY(headZ) }
        const len = Math.hypot(head.x - tail.x, head.y - tail.y)
        const dir = { x: (head.x - tail.x) / len, y: (head.y - tail.y) / len }
        const n = { x: -dir.y, y: dir.x }
        const neck = { x: tail.x + dir.x * len * 0.6, y: tail.y + dir.y * len * 0.6 }
        const width = (z: number) => (ROAD.half * FORK.arrowWidth) / z
        const wt = width(tailZ)
        const wn = width(tailZ + (headZ - tailZ) * 0.6)
        const off = (p: { x: number; y: number }, k: number) => ({ x: p.x + n.x * k, y: p.y + n.y * k })
        const shape = (k: number) => [
            off(tail, wt * k),
            off(neck, wn * k),
            off(neck, wn * 2.4 * k),
            { x: head.x + dir.x * 10 * (k - 1), y: head.y + dir.y * 10 * (k - 1) },
            off(neck, -wn * 2.4 * k),
            off(neck, -wn * k),
            off(tail, -wt * k),
        ]
        road.fillStyle(C.arrowDark, 1)
        road.fillPoints(shape(1.3), true)
        road.fillStyle(C.arrow, 1)
        road.fillPoints(shape(1), true)
    }

    const paintMud = (m: Spot, top: number) => {
        const part = (a: number, b: number, from: number, to: number, color: number, alpha = 1) => {
            const z1 = Math.max(m.z + from, 0.9)
            const z2 = Math.min(m.z + to, top)
            if (z2 <= z1) return
            road.fillStyle(color, alpha)
            road.fillPoints(
                [
                    { x: screenX(a, z1), y: screenY(z1) },
                    { x: screenX(b, z1), y: screenY(z1) },
                    { x: screenX(b * 0.85, z2), y: screenY(z2) },
                    { x: screenX(a * 0.85, z2), y: screenY(z2) },
                ],
                true,
            )
        }
        part(-MUD.side, MUD.side, 0, MUD.len, C.mud)
        part(-1.1, -0.3, 0.6, 1.6, C.mudLight)
        part(0.2, 1, 1.4, 2.4, C.mudLight)
        part(-0.7, -0.45, 0.9, 1.2, C.mudShine, 0.7)
        part(0.45, 0.8, 1.7, 1.9, C.mudShine, 0.7)
        part(-0.2, 0.15, 2.4, 2.55, C.mudShine, 0.6)
    }

    const paintGap = (near: number) => {
        const far = Math.min(near + GAP.width, ROAD.far)
        quad(-40, 40, near, ROAD.far, C.valley)
        if (far < ROAD.far) quad(-1, 1, far, ROAD.far, dirt ? C.dirt : C.road)
        ;[
            [-0.95, -0.55, 0.45],
            [-0.45, -0.1, 0.2],
            [0.1, 0.5, 0.35],
            [0.6, 0.95, 0.15],
        ].forEach(([a, b, len]) => quad(a, b, near, near + len, C.plank))
        const yf = screenY(far)
        road.fillStyle(C.valleyEdge, 1)
        road.fillRect(screenX(-1.2, far), yf, screenX(1.2, far) - screenX(-1.2, far), SPAN * 0.06 / far)
        const width = (ROAD.half * 0.24) / far
        const len = (screenY(near) - yf) * GAP.hang
        ;[
            [-0.55, 0.22],
            [0.4, -0.18],
        ].forEach(([side, tilt]) => {
            const x = screenX(side, far)
            const dx = Math.sin(tilt) * len
            road.fillStyle(C.plank, 1)
            road.fillPoints(
                [
                    { x: x - width / 2, y: yf },
                    { x: x + width / 2, y: yf },
                    { x: x + width / 2 + dx, y: yf + len },
                    { x: x - width / 2 + dx, y: yf + len },
                ],
                true,
            )
        })
    }

    const paintRoad = () => {
        road.clear()
        const top = gap ? Math.min(ROAD.far, gap.z + GAP.after) : ROAD.far
        const end = fork ? Math.max(0.9, Math.min(top, fork.z)) : top
        quad(-1, 1, 0.9, end, dirt ? C.dirt : C.road)
        if (!dirt) {
            quad(-0.98, -0.98 + ROAD.edge, 0.9, end, C.roadEdge)
            quad(0.98 - ROAD.edge, 0.98, 0.9, end, C.roadEdge)
            const offset = travelled % ROAD.dashEvery
            for (let z = 1 - offset; z < end; z += ROAD.dashEvery) {
                const z1 = Math.max(z, 0.9)
                const z2 = Math.min(z + ROAD.dashLen, end)
                if (z2 > z1) quad(-ROAD.line, ROAD.line, z1, z2, C.roadLine)
            }
        }
        if (fork) {
            paintBetween(fork, top)
            const order: Way[] = fork.newRoad && fork.merge === 0 ? [fork.way, -fork.way as Way] : [-fork.way as Way, fork.way]
            order.forEach(side => paintBranch(fork!, side, top))
            if (fork.arrow) paintArrow(fork)
        }
        muds.forEach(m => paintMud(m, top))
        if (gap) paintGap(top)
    }

    const advance = (d: number) => {
        travelled += d
        if (fork) fork.z -= d
        muds.forEach(m => (m.z -= d))
        for (let i = muds.length - 1; i >= 0; i--) if (muds[i].z + MUD.len < ROAD.near) muds.splice(i, 1)
        for (const prop of props) {
            prop.z -= d
            if (prop.z < ROAD.near) prop.gone = true
        }
        for (let i = props.length - 1; i >= 0; i--) {
            if (!props[i].gone) continue
            props[i].img.destroy()
            props[i].glow?.destroy()
            props.splice(i, 1)
        }
        spawn(ROAD.far)
    }

    for (let t = 0; t < ROAD.far; t += 0.25) advance(0.25)
    props.forEach(place)
    paintRoad()

    return {
        update(dt, speed) {
            if (speed > 0) advance(speed * dt)
            if (fork?.arrow) {
                fork.merge = Phaser.Math.Clamp((fork.from - fork.z) / FORK.mergeDist, 0, 1)
                if (fork.sign) fork.sign.side = -fork.way * FORK.signAway * fork.merge
                if (fork.merge >= 1) {
                    if (fork.newRoad) dirt = false
                    fork = undefined
                }
            }
            props.forEach(place)
            paintRoad()
        },
        setZone(zone) {
            current = zone
            next.pole = travelled
            next.tree = travelled
            next.bush = travelled + 1
            next.house = travelled + 1
            next.pine = travelled
        },
        spawnCow(z) {
            return add(COW_SHEET.key, cellKey(COW_CELL.calm), z, 0, SCALE.cow)
        },
        cowPose(cow, pose) {
            cow.img.setFrame(cellKey(COW_CELL[pose]))
        },
        spawnThing: addThing,
        spawnFork(z, way, sign, newRoad) {
            const made: Fork = { z, way, newRoad, arrow: false, merge: 0, from: z }
            fork = made
            props.forEach(p => {
                if (p.z > z - 0.3) p.side = outside(p.side, p.z)
            })
            if (sign) made.sign = addThing('sign', z - 0.2, 0)
            return made
        },
        showArrow() {
            if (!fork) return
            fork.arrow = true
            fork.from = fork.z
        },
        spawnMud(z) {
            const mud = { z }
            muds.push(mud)
            return mud
        },
        breakBridge(barrier) {
            gap = barrier
        },
        spawnTow(z) {
            return add(TOW_SHEET.key, cellKey(TOW_CELL.front), z, 0, SCALE.tow)
        },
        towBack(tow) {
            tow.img.setFrame(cellKey(TOW_CELL.back))
        },
        spawnDog(z) {
            return add(DOG_SHEET.key, cellKey(0), z, 0, SCALE.dog)
        },
        dogPose(dog, pose) {
            dog.img.setFrame(cellKey(['sleep', 'awake', 'run'].indexOf(pose)))
        },
        spawnStreet(z) {
            const cida = addHouse('cida', z, SIDE.house, false)
            const others = [
                addHouse('b', z + 0.4, -SIDE.house, false),
                addHouse('a', z + 3, SIDE.house, false),
                addHouse('a', z + 3.4, -SIDE.house, false),
                addHouse('b', z + 6.4, SIDE.house, false),
                addHouse('b', z + 6.8, -SIDE.house, false),
            ]
            return { cida, others }
        },
        light,
        base(prop) {
            return { x: prop.img.x, y: prop.img.y }
        },
        windowOf(prop) {
            const s = prop.size / prop.z
            const at = HOUSE_WINDOW[prop.house ?? 'a']
            return { x: prop.img.x + at.x * s, y: prop.img.y + at.y * s }
        },
        scaleOf(prop) {
            return prop.size / prop.z
        },
        remove(prop) {
            prop.gone = true
            prop.img.setVisible(false)
            prop.glow?.setVisible(false)
        },
        showCida(street, pose) {
            const house = street.cida
            const s = house.size / house.z
            const x = house.img.x + DOOR.x * s
            const scale = (SCALE.cida * s) / SCALE.house
            return scene.add
                .image(x, house.img.y, CIDA_SHEET.key, cellKey(pose === 'wave' ? 0 : 1))
                .setOrigin(0.5, 1)
                .setScale(scale)
                .setDepth(DEPTH.person)
        },
        nameTag(prop, text) {
            const s = prop.size / prop.z
            const label = scene.add
                .text(0, 0, text, { fontFamily: FONT.black, fontSize: '24px', color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const w = label.width + 36
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.3)
            g.fillRoundedRect(-w / 2, -20 + 5, w, 40, 20)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(-w / 2, -20, w, 40, 20)
            g.fillTriangle(-10, 18, 10, 18, 0, 32)
            return scene.add.container(prop.img.x, prop.img.y - HOUSE_SHEET.cell * s - 30, [g, label]).setDepth(DEPTH.person)
        },
        destroy() {
            props.forEach(p => {
                p.img.destroy()
                p.glow?.destroy()
            })
            props.length = 0
            road.destroy()
            ground.destroy()
            far.destroy()
            sky.destroy()
        },
    }
}
