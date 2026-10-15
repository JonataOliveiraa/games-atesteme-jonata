import Phaser from 'phaser'
import { CAVE_CELL, CAVE_SHEET, NATURE_CELL, NATURE_SHEET, SCENERY_CELL, SCENERY_SHEET, cellKey, type Sheet } from '../data/files'
import { DEPTH, worldDepth } from '../data/layout'
import { PROP_SIZE, inEllipse, inLake, inPond, riverDistance } from '../data/maps'
import { C } from '../data/theme'
import type { Circle, Ellipse, MapDef, Prop, Rect, Vec } from '../types'
import { DASH, GLINT, SHADOW } from './art'
import type { View } from './view'

export interface World {
    readonly parts: Phaser.GameObjects.GameObject[]
    update(delta: number, behind?: Rect): void
    destroy(): void
}

const TILE = 1600
const PIER_DX = -7
const SEE_THROUGH = 0.45
const TALL: Prop['kind'][] = ['bigTree', 'smallTree']

export function random(seed: number) {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function along(points: Vec[], step: number, each: (x: number, y: number) => void) {
    points.slice(1).forEach((b, i) => {
        const a = points[i]
        const len = Math.hypot(b.x - a.x, b.y - a.y)
        const n = Math.max(1, Math.ceil(len / step))
        for (let k = 0; k <= n; k++) each(a.x + ((b.x - a.x) * k) / n, a.y + ((b.y - a.y) * k) / n)
    })
}

function smooth(points: Vec[]): Vec[] {
    if (points.length < 3) return points
    const out: Vec[] = [points[0]]
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i]
        const b = points[i + 1]
        out.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 }, { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 })
    }
    out.push(points[points.length - 1])
    return out
}

function paintTrail(g: Phaser.GameObjects.Graphics, map: MapDef, rnd: () => number, edge: number, fill: number, light: number) {
    map.trail.forEach(line => {
        const path = smooth(smooth(line))
        g.fillStyle(edge, 1)
        along(path, 10, (x, y) => g.fillCircle(x, y, 40))
        g.fillStyle(fill, 1)
        along(path, 10, (x, y) => g.fillCircle(x, y, 33))
    })
    for (let i = 0; i < 160; i++) {
        const line = map.trail[Math.floor(rnd() * map.trail.length)]
        const k = Math.floor(rnd() * (line.length - 1))
        const t = rnd()
        const x = line[k].x + (line[k + 1].x - line[k].x) * t + (rnd() - 0.5) * 44
        const y = line[k].y + (line[k + 1].y - line[k].y) * t + (rnd() - 0.5) * 44
        g.fillStyle(rnd() < 0.5 ? light : edge, 1)
        g.fillEllipse(x, y, 8 + rnd() * 8, 5 + rnd() * 4)
    }
}

function paintWalls(g: Phaser.GameObjects.Graphics, walls: Circle[], rnd: () => number) {
    g.fillStyle(C.shadow, 0.35)
    walls.forEach(w => g.fillEllipse(w.x + 10, w.y + w.r * 0.35, w.r * 2.2, w.r * 1.3))
    walls.forEach(w => {
        g.fillStyle(C.caveRockDark, 1)
        g.fillCircle(w.x, w.y + 10, w.r)
    })
    walls.forEach(w => {
        g.fillStyle(C.caveRock, 1)
        g.fillCircle(w.x - w.r * 0.08, w.y - w.r * 0.06, w.r * 0.88)
        for (let k = 0; k < 3; k++) {
            g.fillStyle(C.caveRockDark, 0.5)
            const t = rnd() * Math.PI * 2
            g.fillEllipse(w.x + Math.cos(t) * w.r * 0.45, w.y + Math.sin(t) * w.r * 0.4, w.r * 0.5, w.r * 0.3)
        }
    })
    walls.forEach(w => {
        g.fillStyle(C.caveRockLight, 0.55)
        g.fillEllipse(w.x - w.r * 0.25, w.y - w.r * 0.42, w.r * 0.9, w.r * 0.36)
        if (rnd() < 0.6) {
            g.fillStyle(C.mossLime, 0.85)
            g.fillEllipse(w.x + (rnd() - 0.5) * w.r * 0.6, w.y - w.r * 0.55, w.r * 0.7, w.r * 0.22)
        }
    })
}

function paintWater(g: Phaser.GameObjects.Graphics, e: Ellipse, rim: number) {
    g.fillStyle(rim, 1)
    g.fillEllipse(e.x, e.y, (e.rx + 22) * 2, (e.ry + 18) * 2)
    g.fillStyle(C.water, 1)
    g.fillEllipse(e.x, e.y, e.rx * 2, e.ry * 2)
    g.fillStyle(C.waterDeep, 1)
    g.fillEllipse(e.x + 14, e.y + 10, e.rx * 1.3, e.ry * 1.15)
    g.lineStyle(5, C.waterLight, 1)
    g.strokeEllipse(e.x, e.y, e.rx * 2 - 24, e.ry * 2 - 20)
}

function paintTufts(g: Phaser.GameObjects.Graphics, map: MapDef, rnd: () => number, color: number, count: number) {
    for (let i = 0; i < count; i++) {
        const x = rnd() * map.w
        const y = rnd() * map.h
        if (inLake(map, x, y, 40) || inPond(map, x, y, 40) || riverDistance(map, { x, y }) < (map.riverW ?? 0) / 2 + 30) continue
        if (map.pool && Math.hypot(x - map.pool.x, y - map.pool.y) < map.pool.r + 40) continue
        if ((map.walls ?? []).some(c => Math.hypot(x - c.x, y - c.y) < c.r + 20)) continue
        if ((map.floor ?? []).some(f => inEllipse(f, x, y, 10))) continue
        g.lineStyle(4, color, 0.8)
        g.lineBetween(x - 6, y, x - 9, y - 12)
        g.lineBetween(x, y, x, y - 15)
        g.lineBetween(x + 6, y, x + 9, y - 11)
    }
}

function paintCave(g: Phaser.GameObjects.Graphics, map: MapDef) {
    const rnd = random(5)
    g.fillStyle(C.caveFloor, 1)
    g.fillRect(0, 0, map.w, map.h)
    for (let i = 0; i < 120; i++) {
        g.fillStyle(rnd() < 0.5 ? C.caveLight : C.caveDark, 0.6)
        g.fillEllipse(rnd() * map.w, rnd() * map.h, 100 + rnd() * 240, 40 + rnd() * 100)
    }
    g.fillStyle(C.grassDark, 0.85)
    g.fillEllipse(0, 720, 760, 760)
    g.fillStyle(C.grass, 0.7)
    g.fillEllipse(0, 720, 520, 560)
    paintTrail(g, map, rnd, C.caveDark, C.caveTrail, C.caveLight)
    ;(map.ponds ?? []).forEach(p => paintWater(g, p, C.caveRockDark))
    for (let i = 0; i < 260; i++) {
        g.fillStyle(rnd() < 0.5 ? C.caveRockLight : C.caveDark, 0.7)
        g.fillEllipse(rnd() * map.w, rnd() * map.h, 6 + rnd() * 8, 4 + rnd() * 5)
    }
    ;(map.sparks ?? []).forEach(s => {
        for (let k = 0; k < 5; k++) {
            g.fillStyle(C.spark, 1)
            g.fillCircle(s.x + (rnd() - 0.5) * 40, s.y + (rnd() - 0.5) * 24, 3 + rnd() * 3)
        }
    })
    paintWalls(g, map.walls ?? [], rnd)
    paintTufts(g, map, rnd, C.tuft, 40)
}

function paintForest(g: Phaser.GameObjects.Graphics, map: MapDef) {
    const rnd = random(9)
    g.fillStyle(C.forest, 1)
    g.fillRect(0, 0, map.w, map.h)
    for (let i = 0; i < 120; i++) {
        g.fillStyle(rnd() < 0.5 ? C.forestLight : C.forestDark, 0.55)
        g.fillEllipse(rnd() * map.w, rnd() * map.h, 120 + rnd() * 260, 50 + rnd() * 110)
    }
    for (let i = 0; i < 60; i++) {
        g.fillStyle(C.mossLime, 0.22)
        g.fillEllipse(rnd() * map.w, rnd() * map.h, 40 + rnd() * 70, 18 + rnd() * 26)
    }
    map.shade.forEach(s => {
        g.fillStyle(C.shade, 0.55)
        g.fillEllipse(s.x, s.y, s.rx * 2, s.ry * 2)
    })
    ;(map.floor ?? []).forEach(f => {
        g.fillStyle(C.caveDark, 1)
        g.fillEllipse(f.x, f.y, (f.rx + 30) * 2, (f.ry + 24) * 2)
        g.fillStyle(C.caveFloor, 1)
        g.fillEllipse(f.x, f.y, f.rx * 2, f.ry * 2)
    })
    paintTrail(g, map, rnd, C.trailEdge, C.trail, C.trailLight)
    paintWalls(g, map.walls ?? [], rnd)
    paintTufts(g, map, rnd, C.tuft, 560)
}

export function paintGround(g: Phaser.GameObjects.Graphics, map: MapDef) {
    if (map.theme === 'cave') return paintCave(g, map)
    if (map.theme === 'forest') return paintForest(g, map)
    paintMeadow(g, map)
}

function paintMeadow(g: Phaser.GameObjects.Graphics, map: MapDef) {
    const rnd = random(7)
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 0, map.w, map.h)
    for (let i = 0; i < 110; i++) {
        g.fillStyle(rnd() < 0.5 ? C.grassLight : C.grassDark, 0.55)
        g.fillEllipse(rnd() * map.w, rnd() * map.h, 120 + rnd() * 260, 50 + rnd() * 110)
    }
    if (map.field) {
        g.fillStyle(C.grassLight, 0.9)
        g.fillEllipse(map.field.x, map.field.y, map.field.rx * 2, map.field.ry * 2)
    }
    for (let i = 0; i < 46; i++) {
        g.fillStyle(C.mossLime, 0.22)
        g.fillEllipse(rnd() * map.w, rnd() * map.h, 40 + rnd() * 70, 18 + rnd() * 26)
    }
    map.shade.forEach(s => {
        g.fillStyle(C.shade, 0.55)
        g.fillEllipse(s.x, s.y, s.rx * 2, s.ry * 2)
    })
    paintTrail(g, map, rnd, C.trailEdge, C.trail, C.trailLight)

    const { lake, pool } = map
    const river = map.river ? smooth(smooth(map.river)) : []
    const riverW = map.riverW ?? 0
    g.fillStyle(C.sand, 1)
    if (lake) g.fillEllipse(lake.x, lake.y, (lake.rx + 24) * 2, (lake.ry + 20) * 2)
    along(river, 8, (x, y) => g.fillCircle(x, y, riverW / 2 + 16))
    if (pool) g.fillCircle(pool.x, pool.y, pool.r + 20)
    g.fillStyle(C.water, 1)
    if (lake) g.fillEllipse(lake.x, lake.y, lake.rx * 2, lake.ry * 2)
    along(river, 8, (x, y) => g.fillCircle(x, y, riverW / 2))
    if (pool) g.fillCircle(pool.x, pool.y, pool.r)
    g.fillStyle(C.waterDeep, 1)
    if (lake) g.fillEllipse(lake.x + 20, lake.y + 14, lake.rx * 1.25, lake.ry * 1.1)
    g.fillStyle(C.waterDeep, 0.6)
    along(river, 8, (x, y) => g.fillCircle(x, y, riverW / 4))
    g.lineStyle(6, C.waterLight, 1)
    if (lake) g.strokeEllipse(lake.x, lake.y, lake.rx * 2 - 26, lake.ry * 2 - 22)
    if (pool) g.strokeCircle(pool.x, pool.y, pool.r - 14)
    paintTufts(g, map, rnd, C.tuft, 520)
}

const PROP_ART: Record<Prop['kind'], { sheet: Sheet; cell: number }> = {
    bigTree: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.bigTree },
    smallTree: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.smallTree },
    bush: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.bush },
    rock: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.rock },
    log: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.log },
    reeds: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.reeds },
    flowers: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.flowers },
    lily: { sheet: NATURE_SHEET, cell: NATURE_CELL.lily },
    caveRock: { sheet: CAVE_SHEET, cell: CAVE_CELL.rock },
    gravel: { sheet: CAVE_SHEET, cell: CAVE_CELL.gravel },
}

export function createWorld(scene: Phaser.Scene, view: View, map: MapDef): World {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keys: string[] = []
    const tall: Phaser.GameObjects.Image[] = []
    const add = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        view.world(obj)
        parts.push(obj)
        return obj
    }

    for (let x = 0; x < map.w; x += TILE) {
        const key = `cnt-ground-${map.id}-${x}`
        keys.push(key)
        if (!scene.textures.exists(key)) {
            const g = scene.make.graphics({ x: 0, y: 0 }, false)
            g.translateCanvas(-x, 0)
            paintGround(g, map)
            g.generateTexture(key, Math.min(TILE, map.w - x), map.h)
            g.destroy()
        }
        add(scene.add.image(x, 0, key).setOrigin(0, 0).setDepth(DEPTH.ground))
    }

    if (map.pier) {
        const pierArt = scene.add.image(map.pier.x + PIER_DX, map.pier.top - 14, SCENERY_SHEET.key, cellKey(SCENERY_CELL.pier)).setOrigin(0.5, 0)
        pierArt.setScale((map.pier.bottom - map.pier.top + 34) / pierArt.frame.height).setDepth(DEPTH.water + 0.6)
        add(pierArt)
    }

    map.props.forEach(prop => {
        const { sheet, cell } = PROP_ART[prop.kind]
        const art = scene.add.image(prop.x, prop.y, sheet.key, cellKey(cell))
        const size = prop.size ?? PROP_SIZE[prop.kind]
        art.setScale(size / Math.max(art.frame.width, art.frame.height)).setFlipX(!!prop.flip)
        if (prop.kind === 'lily') {
            art.setDepth(DEPTH.water + 0.5)
            add(art)
            return
        }
        art.setOrigin(0.5, 1).setDepth(worldDepth(prop.y))
        if (prop.kind !== 'reeds' && prop.kind !== 'flowers' && prop.kind !== 'gravel') {
            const shadow = scene.add.image(prop.x + 8, prop.y - 4, SHADOW).setAlpha(0.2).setDepth(DEPTH.water + 0.8)
            shadow.setDisplaySize(art.displayWidth * (prop.kind === 'bigTree' || prop.kind === 'smallTree' ? 0.8 : 1), art.displayWidth * 0.3)
            add(shadow)
        }
        add(art)
        if (TALL.includes(prop.kind)) tall.push(art)
    })

    const rnd = random(11)
    const glints: Phaser.GameObjects.Image[] = []
    const lake = map.lake
    for (let i = 0; lake && i < 9; i++) {
        const a = rnd() * Math.PI * 2
        const d = Math.sqrt(rnd()) * 0.8
        const glint = scene.add
            .image(lake.x + Math.cos(a) * d * lake.rx, lake.y + Math.sin(a) * d * lake.ry, GLINT)
            .setDepth(DEPTH.water + 0.4)
            .setAlpha(0)
            .setScale(0.6 + rnd() * 0.5)
        glints.push(add(glint))
        scene.tweens.add({ targets: glint, alpha: 0.9, duration: 700, yoyo: true, repeat: -1, delay: rnd() * 2400, repeatDelay: 900 + rnd() * 1800 })
    }

    const river = map.river ? smooth(smooth(map.river)) : []
    const riverW = map.riverW ?? 0
    const lengths = river.slice(1).map((b, i) => Math.hypot(b.x - river[i].x, b.y - river[i].y))
    const total = lengths.reduce((s, l) => s + l, 0)
    const dashes = Array.from({ length: river.length ? 9 : 0 }, (_, i) => {
        const dash = scene.add.image(0, 0, DASH).setDepth(DEPTH.water + 0.4).setAlpha(0.75)
        return { dash: add(dash), at: (i / 9) * total, side: (i % 3) - 1 }
    })
    const place = (d: { dash: Phaser.GameObjects.Image; at: number; side: number }) => {
        let left = d.at % total
        let k = 0
        while (k < lengths.length - 1 && left > lengths[k]) {
            left -= lengths[k]
            k++
        }
        const a = river[k]
        const b = river[k + 1]
        const t = Math.min(1, left / lengths[k])
        const angle = Math.atan2(b.y - a.y, b.x - a.x)
        const off = d.side * riverW * 0.22
        d.dash.setPosition(a.x + (b.x - a.x) * t - Math.sin(angle) * off, a.y + (b.y - a.y) * t + Math.cos(angle) * off).setRotation(angle)
        const fade = Math.min(1, (d.at % total) / 80, (total - (d.at % total)) / 80)
        d.dash.setAlpha(0.75 * fade)
    }
    dashes.forEach(place)

    return {
        parts,
        update(delta, behind) {
            const ease = 1 - Math.exp(-delta / 90)
            tall.forEach(tree => {
                const left = tree.x - tree.displayWidth * tree.originX
                const top = tree.y - tree.displayHeight
                const hidden =
                    !!behind &&
                    behind.y + behind.h / 2 < tree.y &&
                    Math.abs(behind.x - (left + tree.displayWidth / 2)) < tree.displayWidth / 2 + behind.w / 4 &&
                    behind.y - behind.h / 2 < tree.y - tree.displayHeight * 0.2 &&
                    behind.y + behind.h / 2 > top
                const target = hidden ? SEE_THROUGH : 1
                if (Math.abs(tree.alpha - target) > 0.01) tree.setAlpha(tree.alpha + (target - tree.alpha) * ease)
            })
            dashes.forEach(d => {
                d.at += (delta / 1000) * 70
                place(d)
            })
        },
        destroy() {
            glints.forEach(g => scene.tweens.killTweensOf(g))
            parts.forEach(p => p.destroy())
            parts.length = 0
            keys.forEach(k => {
                if (scene.textures.exists(k)) scene.textures.remove(k)
            })
        },
    }
}
