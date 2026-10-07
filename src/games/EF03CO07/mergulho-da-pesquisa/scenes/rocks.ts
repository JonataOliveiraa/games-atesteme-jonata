import Phaser from 'phaser'
import { random, rockBounds } from '../data/maps'
import { DEPTH, minimapBox, WORLD } from '../data/layout'
import { C } from '../data/theme'
import type { Blob, Deco, MapDef, Tone } from '../types'

type G = Phaser.GameObjects.Graphics

const OUTLINE = 5

type Stone = { b: Blob; pts: [number, number][] }

function stones(blobs: Blob[], seed: number): Stone[] {
    const rnd = random(seed)
    return blobs.map(b => {
        const n = 7 + Math.floor(rnd() * 3)
        const off = rnd() * Math.PI * 2
        const pts: [number, number][] = []
        for (let k = 0; k < n; k++) {
            const a = off + (k * Math.PI * 2) / n + (rnd() - 0.5) * 0.5
            const r = b.r * (0.9 + rnd() * 0.18)
            pts.push([Math.cos(a) * r, Math.sin(a) * r])
        }
        return { b, pts }
    })
}

function fillStone(g: G, st: Stone, ox: number, oy: number, scale: number, lift: number) {
    g.fillPoints(
        st.pts.map(([px, py]) => new Phaser.Math.Vector2(st.b.x - ox + px * scale, st.b.y - oy - lift + py * scale)),
        true,
    )
}

function body(g: G, blobs: Blob[], tone: Tone, ox: number, oy: number, seed: number) {
    const rnd = random(seed + 1)
    const all = stones(blobs, seed)
    g.fillStyle(C.ink, 1)
    all.forEach(st => fillStone(g, st, ox, oy, 1 + OUTLINE / st.b.r, 0))
    g.fillStyle(tone.dark, 1)
    all.forEach(st => fillStone(g, st, ox, oy, 1, 0))
    g.fillStyle(tone.light, 1)
    all.forEach(st => fillStone(g, st, ox, oy, 0.74, st.b.r * 0.2))
    all.forEach(({ b }) => {
        if (b.r < 30) return
        const cx = b.x - ox
        const cy = b.y - oy - b.r * 0.2
        g.lineStyle(3, tone.dark, 0.8)
        const a = rnd() * Math.PI * 2
        const len = b.r * (0.25 + rnd() * 0.2)
        const mx = cx + Math.cos(a) * len * 0.3
        const my = cy + Math.sin(a) * len * 0.3
        g.beginPath()
        g.moveTo(mx - Math.cos(a) * len * 0.6, my - Math.sin(a) * len * 0.6)
        g.lineTo(mx + (rnd() - 0.5) * 8, my + (rnd() - 0.5) * 8)
        g.lineTo(mx + Math.cos(a + 0.6) * len * 0.6, my + Math.sin(a + 0.6) * len * 0.6)
        g.strokePath()
        g.fillStyle(C.white, 0.25)
        g.fillEllipse(cx - b.r * 0.28, cy - b.r * 0.42, b.r * 0.42, b.r * 0.14)
    })
}

function stroke(g: G, points: Phaser.Math.Vector2[], width: number, color: number) {
    g.lineStyle(width + 5, C.ink, 1)
    g.strokePoints(points, false)
    g.lineStyle(width, color, 1)
    g.strokePoints(points, false)
}

function weed(g: G, x: number, y: number, s: number, flip: number, color: number) {
    ;[-12, 0, 12].forEach((dx, k) => {
        const h = (60 + k * 18 - Math.abs(dx)) * s
        const pts: Phaser.Math.Vector2[] = []
        for (let i = 0; i <= 8; i++) {
            const t = i / 8
            pts.push(new Phaser.Math.Vector2(x + dx * s + Math.sin(t * Math.PI * 2 + k) * 8 * s * t * flip, y - t * h))
        }
        stroke(g, pts, 5 * s, color)
    })
}

function coral(g: G, x: number, y: number, s: number, flip: number, color: number) {
    const v = (px: number, py: number) => new Phaser.Math.Vector2(x + px * s * flip, y - py * s)
    stroke(g, [v(0, 0), v(-2, 26), v(-16, 46), v(-20, 64)], 8 * s, color)
    stroke(g, [v(-2, 26), v(10, 44), v(8, 70)], 8 * s, color)
    stroke(g, [v(-8, 38), v(-30, 40)], 7 * s, color)
    g.fillStyle(color, 1)
    ;[v(-20, 64), v(8, 70), v(-30, 40)].forEach(p => g.fillCircle(p.x, p.y, 5 * s))
}

function gem(g: G, x: number, y: number, s: number, flip: number, color: number) {
    const pts = [
        [-12, 0],
        [-9, -30],
        [2, -46],
        [12, -28],
        [10, 0],
    ].map(([px, py]) => new Phaser.Math.Vector2(x + px * s * flip, y + py * s))
    g.fillStyle(color, 1)
    g.fillPoints(pts, true)
    g.lineStyle(4, C.ink, 1)
    g.strokePoints(pts, true)
    g.fillStyle(C.white, 0.7)
    g.fillTriangle(x - 5 * s * flip, y - 8 * s, x - 3 * s * flip, y - 30 * s, x + 2 * s * flip, y - 38 * s)
}

function star(g: G, x: number, y: number, s: number) {
    const pts: Phaser.Math.Vector2[] = []
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        const r = (i % 2 ? 6 : 14) * s
        pts.push(new Phaser.Math.Vector2(x + Math.cos(a) * r, y - 12 * s + Math.sin(a) * r))
    }
    g.fillStyle(C.lemon, 1)
    g.fillPoints(pts, true)
    g.lineStyle(3, C.ink, 1)
    g.strokePoints(pts, true)
}

function shell(g: G, x: number, y: number, s: number) {
    g.fillStyle(C.ink, 1)
    g.slice(x, y, 18 * s + 3, Math.PI, Math.PI * 2, false)
    g.fillPath()
    g.fillStyle(0xffb3d9, 1)
    g.slice(x, y - 1, 18 * s, Math.PI, Math.PI * 2, false)
    g.fillPath()
    g.lineStyle(2, C.ink, 0.7)
    ;[-0.6, -0.2, 0.2, 0.6].forEach(k => g.lineBetween(x, y - 2, x + Math.sin(k) * 16 * s, y - Math.cos(k) * 16 * s))
}

function decor(g: G, d: Deco, tone: Tone, ox: number, oy: number) {
    const x = d.x - ox
    const y = d.y - oy
    const flip = d.flip ? -1 : 1
    if (d.kind === 'weed') weed(g, x, y, d.size, flip, tone.weed)
    else if (d.kind === 'coral') coral(g, x, y, d.size, flip, tone.coral)
    else if (d.kind === 'gem') gem(g, x, y, d.size, flip, tone.gem)
    else if (d.kind === 'star') star(g, x, y, d.size)
    else shell(g, x, y, d.size)
}

const rockKey = (map: MapDef, i: number) => `mg-rock-${map.id}-${i}`

export function placeRocks(scene: Phaser.Scene, map: MapDef): Phaser.GameObjects.Image[] {
    return map.rocks.map((rock, i) => {
        const box = rockBounds(rock.blobs, map.h)
        const key = rockKey(map, i)
        if (!scene.textures.exists(key)) {
            const g = scene.make.graphics({ x: 0, y: 0 }, false)
            rock.decor.forEach(d => decor(g, d, map.tone, box.x, box.y))
            body(g, rock.blobs, map.tone, box.x, box.y, i * 97 + 5)
            g.generateTexture(key, box.w, box.h)
            g.destroy()
        }
        return scene.add.image(box.x, box.y, key).setOrigin(0).setDepth(DEPTH.pillar)
    })
}

export function forgetRocks(scene: Phaser.Scene, map: MapDef) {
    map.rocks.forEach((_, i) => {
        const key = rockKey(map, i)
        if (scene.textures.exists(key)) scene.textures.remove(key)
    })
    const mini = miniKey(map)
    if (scene.textures.exists(mini)) scene.textures.remove(mini)
}

const miniKey = (map: MapDef) => `mg-mini-${map.id}`

export function miniRocks(scene: Phaser.Scene, map: MapDef): string {
    const key = miniKey(map)
    if (scene.textures.exists(key)) return key
    const box = minimapBox()
    const k = box.w / WORLD.w
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    const ky = box.h / WORLD.h
    g.fillStyle(C.ink, 1)
    map.solids.forEach(b => g.fillCircle(b.x * k, b.y * ky, Math.max(1.2, b.r * k) + 1.5))
    g.fillStyle(0xe4dcff, 1)
    map.solids.forEach(b => g.fillCircle(b.x * k, b.y * ky, Math.max(1.2, b.r * k)))
    g.generateTexture(key, box.w, box.h)
    g.destroy()
    return key
}
