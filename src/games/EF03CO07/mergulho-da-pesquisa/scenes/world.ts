import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { BUBBLE_FRAME, CELL, PLACE_ART, PLACES, SUBS } from '../data/files'
import { DEPTH, DOCK, FLOOR, H, PLACE_SCALE, SUB, SURFACE, W, WORLD } from '../data/layout'
import { pushOut } from '../data/maps'
import { C } from '../data/theme'
import type { MapDef, Spot, Vec } from '../types'
import { forgetRocks, placeRocks } from './rocks'
import { baked } from './bake'

const BRUSH = 'mergulho-light'
const DAYLIGHT = 'mergulho-daylight'
const DAY_TOP = 64
const DAY_FADE = 32
const STAMP = 48
const FOG_ALPHA = 0.96
const FOG_SCALE = 8
const PING_SPEED = 1400
const RIPPLE = { r: 46, alpha: 0.2, ms: 2200 }

export interface World {
    load(map: MapDef, spots: Spot[]): void
    push(x: number, y: number, r: number): Vec
    map(): MapDef | undefined
    reveal(at: Vec): void
    shine(scrollX: number, scrollY: number, at: Vec): void
    marks(): { spots: Vec[]; pickups: Vec[] }
    light(indices: number[], from: Vec): void
    ping(from: Vec): Promise<void>
    touching(at: Vec, radius: number): number
    take(i: number): void
    pickup(at: Vec): boolean
    spot(i: number): Vec
    nudge(i: number): void
    lit(): number[]
    fogTexture(): Phaser.Textures.Texture
    destroy(): void
}

const hex = (c: number) => '#' + c.toString(16).padStart(6, '0')

const tile = (scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void) => {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
    return key
}

function buildBackground(scene: Phaser.Scene): Phaser.GameObjects.GameObject[] {
    const grad = `mg-gradient-${WORLD.h}`
    if (!scene.textures.exists(grad)) {
        const canvas = scene.textures.createCanvas(grad, 4, WORLD.h)
        const ctx = canvas?.getContext()
        if (canvas && ctx) {
            const sky = ctx.createLinearGradient(0, 0, 0, SURFACE)
            sky.addColorStop(0, hex(C.sky))
            sky.addColorStop(1, hex(C.skyLow))
            ctx.fillStyle = sky
            ctx.fillRect(0, 0, 4, SURFACE)
            const sea = ctx.createLinearGradient(0, SURFACE, 0, FLOOR)
            sea.addColorStop(0, hex(C.seaTop))
            sea.addColorStop(0.4, hex(C.seaMid))
            sea.addColorStop(1, hex(C.seaDeep))
            ctx.fillStyle = sea
            ctx.fillRect(0, SURFACE, 4, FLOOR - SURFACE)
            ctx.fillStyle = hex(C.sand)
            ctx.fillRect(0, FLOOR, 4, WORLD.h - FLOOR)
            canvas.refresh()
        }
    }
    const clouds = tile(scene, 'mg-clouds', 520, 200, g => {
        g.fillStyle(C.white, 0.8)
        g.fillEllipse(120, 80, 150, 40)
        g.fillEllipse(150, 66, 90, 40)
        g.fillEllipse(380, 140, 160, 42)
    })
    const rays = tile(scene, 'mg-rays', 420, 900, g => {
        g.fillStyle(C.white, 0.06)
        g.fillTriangle(0, 0, 80, 0, 260, 900)
    })
    const wave = tile(scene, 'mg-wave', 40, 14, g => {
        g.fillStyle(C.white, 0.85)
        g.fillEllipse(20, 7, 44, 10)
    })
    const bumps = tile(scene, 'mg-bumps', 70, 30, g => {
        g.fillStyle(C.sand, 1)
        g.fillEllipse(35, 15, 96, 26)
    })
    const dock = tile(scene, 'mg-dock', DOCK.right + 4, 220, g => {
        const top = 140
        ;[40, 170, 300].forEach(x => {
            g.fillStyle(C.woodDark, 1)
            g.fillRoundedRect(x, top + 20, 18, 70, 4)
        })
        g.fillStyle(C.wood, 1)
        g.fillRoundedRect(0, top, DOCK.right, 24, 6)
        g.lineStyle(3, C.ink, 1)
        g.strokeRoundedRect(1, top, DOCK.right - 2, 24, 6)
        g.fillStyle(C.pink, 1)
        g.fillRoundedRect(DOCK.right - 24, top - 130, 10, 130, 4)
        g.fillStyle(C.lemon, 1)
        g.fillCircle(DOCK.right - 19, top - 120, 15)
    })
    return [
        scene.add.image(0, 0, grad).setOrigin(0).setDisplaySize(WORLD.w, WORLD.h).setDepth(DEPTH.bg),
        scene.add.tileSprite(0, 10, WORLD.w, 200, clouds).setOrigin(0).setDepth(DEPTH.bg),
        scene.add.tileSprite(300, SURFACE, WORLD.w, 900, rays).setOrigin(0).setDepth(DEPTH.bg),
        scene.add.tileSprite(0, SURFACE - 7, WORLD.w, 14, wave).setOrigin(0).setDepth(DEPTH.bg),
        scene.add.tileSprite(0, FLOOR - 15, WORLD.w, 30, bumps).setOrigin(0).setDepth(DEPTH.bg),
        scene.add.image(0, DOCK.deck - 140, dock).setOrigin(0).setDepth(DEPTH.dock),
    ]
}

function brush(scene: Phaser.Scene, r: number) {
    if (scene.textures.exists(BRUSH)) return
    const canvas = scene.textures.createCanvas(BRUSH, r * 2, r * 2)
    const ctx = canvas?.getContext()
    if (!canvas || !ctx) return
    const grad = ctx.createRadialGradient(r, r, 0, r, r, r)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.5, 'rgba(255,255,255,1)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, r * 2, r * 2)
    canvas.refresh()
}

function daylight(scene: Phaser.Scene) {
    if (scene.textures.exists(DAYLIGHT)) return
    const canvas = scene.textures.createCanvas(DAYLIGHT, 4, DAY_TOP + DAY_FADE)
    const ctx = canvas?.getContext()
    if (!canvas || !ctx) return
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.fillRect(0, 0, 4, DAY_TOP)
    const grad = ctx.createLinearGradient(0, DAY_TOP, 0, DAY_TOP + DAY_FADE)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, DAY_TOP, 4, DAY_FADE)
    canvas.refresh()
}

export function createWorld(scene: Phaser.Scene): World {
    const bg = buildBackground(scene)
    const r = SUB.light / FOG_SCALE
    brush(scene, r)
    const stamped = new Set<number>()
    const fogW = Math.ceil(WORLD.w / FOG_SCALE)
    const fogH = Math.ceil((WORLD.h - SURFACE) / FOG_SCALE)
    const fog = scene.add.renderTexture(0, SURFACE, fogW, fogH).setOrigin(0).setVisible(false)
    fog.texture.setFilter(Phaser.Textures.FilterMode.LINEAR)
    const stamp = scene.make.image({ key: BRUSH, add: false }).setOrigin(0)
    daylight(scene)
    const dark = scene.add
        .renderTexture(0, 0, Math.ceil(W / FOG_SCALE) + 1, Math.ceil(H / FOG_SCALE) + 1)
        .setOrigin(0)
        .setScale(FOG_SCALE)
        .setScrollFactor(0)
        .setDepth(DEPTH.fog)
    dark.texture.setFilter(Phaser.Textures.FilterMode.LINEAR)
    const day = scene.make.image({ key: DAYLIGHT, add: false }).setOrigin(0).setDisplaySize(dark.width + 2, DAY_TOP + DAY_FADE)
    const glows = scene.add.graphics().setDepth(DEPTH.lit)
    const rings = scene.add.graphics().setDepth(DEPTH.ping)
    let spots: Spot[] = []
    let sprites: Phaser.GameObjects.Image[] = []
    let copies: Phaser.GameObjects.Image[] = []
    let lit: number[] = []
    let pickups: Phaser.GameObjects.Sprite[] = []
    let rocks: Phaser.GameObjects.Image[] = []
    let ripples: Phaser.GameObjects.Image[] = []
    const taken = new Set<number>()
    const rippleKey = baked(scene, 'mg-ripple', RIPPLE.r * 2 + 8, RIPPLE.r * 2 + 8, g => {
        g.lineStyle(3, C.aqua, 1)
        g.strokeCircle(RIPPLE.r + 4, RIPPLE.r + 4, RIPPLE.r)
    })
    const dropRipples = () => {
        ripples.forEach(r => {
            scene.tweens.killTweensOf(r)
            r.destroy()
        })
        ripples = []
    }
    let current: MapDef | undefined
    const center = (s: Spot): Vec => ({ x: s.x, y: s.y - 60 })

    const clearLit = () => {
        copies.forEach(c => c.destroy())
        copies = []
        lit = []
        glows.clear()
    }

    const paintGlows = () => {
        glows.clear()
        lit.forEach(i => {
            const c = center(spots[i])
            glows.fillStyle(C.glow, 0.25)
            glows.fillEllipse(c.x, c.y, 220, 190)
            glows.lineStyle(6, C.glow, 0.95)
            glows.strokeEllipse(c.x, c.y, 180, 150)
        })
    }

    return {
        load(map, next) {
            clearLit()
            sprites.forEach(s => s.destroy())
            pickups.forEach(p => p.destroy())
            if (map !== current) {
                rocks.forEach(r => r.destroy())
                if (current) forgetRocks(scene, current)
                current = map
                rocks = placeRocks(scene, map)
            }
            spots = next
            sprites = spots.map(s =>
                scene.add.image(s.x, s.y, PLACES, s.place).setOrigin(0.5, PLACE_ART.foot / CELL).setScale(PLACE_SCALE).setDepth(DEPTH.place),
            )
            pickups = map.pickups.map(p => scene.add.sprite(p.x, p.y, SUBS, BUBBLE_FRAME.full).setScale(0.7).setDepth(DEPTH.pickup))
            dropRipples()
            ripples = map.pickups.map((p, i) => {
                const ring = scene.add.image(p.x, p.y, rippleKey).setDepth(DEPTH.ripple).setScale(0.5).setAlpha(0)
                scene.tweens.add({
                    targets: ring,
                    scale: 1.7,
                    alpha: { from: RIPPLE.alpha, to: 0 },
                    duration: RIPPLE.ms,
                    delay: (i * 530) % RIPPLE.ms,
                    repeat: -1,
                    repeatDelay: 600,
                })
                return ring
            })
            taken.clear()
            fog.clear()
            fog.fill(C.fog, FOG_ALPHA)
            stamped.clear()
        },
        shine(scrollX, scrollY, at) {
            dark.clear()
            dark.fill(C.fog, FOG_ALPHA)
            dark.erase(day, -1, (SURFACE - scrollY) / FOG_SCALE - DAY_TOP)
            dark.erase(stamp, (at.x - scrollX) / FOG_SCALE - r, (at.y - scrollY) / FOG_SCALE - r)
        },
        marks() {
            return {
                spots: spots.map(center),
                pickups: pickups.filter(p => !p.getData('taken')).map(p => ({ x: p.x, y: p.y })),
            }
        },
        reveal(at) {
            const cell = Math.floor(at.y / STAMP) * 1000 + Math.floor(at.x / STAMP)
            if (stamped.has(cell)) return
            stamped.add(cell)
            fog.erase(stamp, at.x / FOG_SCALE - r, (at.y - SURFACE) / FOG_SCALE - r)
        },
        light(indices, from) {
            clearLit()
            lit = indices
            indices.forEach(i => {
                const s = spots[i]
                const delay = (Math.hypot(s.x - from.x, s.y - from.y) / PING_SPEED) * 1000
                const copy = scene.add
                    .image(s.x, s.y, PLACES, s.place)
                    .setOrigin(0.5, PLACE_ART.foot / CELL)
                    .setScale(PLACE_SCALE * 0.6)
                    .setDepth(DEPTH.litPlace)
                    .setAlpha(0)
                copies.push(copy)
                void FX.to(scene, copy, { alpha: 1, scale: PLACE_SCALE }, { duration: 260, delay, ease: Ease.back(2) })
            })
            paintGlows()
        },
        async ping(from) {
            const reach = 1500
            const t = { r: 0 }
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: t,
                    r: reach,
                    duration: (reach / PING_SPEED) * 1000,
                    ease: 'Linear',
                    onUpdate: () => {
                        rings.clear()
                        ;[0, 70, 140].forEach((lag, k) => {
                            const rad = t.r - lag
                            if (rad <= 0) return
                            rings.lineStyle(7 - k * 2, C.aqua, Math.max(0, 0.85 - rad / reach) * (1 - k * 0.25))
                            rings.strokeCircle(from.x, from.y, rad)
                        })
                    },
                    onComplete: () => {
                        rings.clear()
                        resolve()
                    },
                }),
            )
        },
        push(x, y, r) {
            return current ? pushOut(current, x, y, r) : { x, y }
        },
        map() {
            return current
        },
        touching(at, radius) {
            let best = -1
            let bestD = radius
            spots.forEach((s, i) => {
                if (taken.has(i)) return
                const c = center(s)
                const d = Math.hypot(at.x - c.x, at.y - c.y)
                if (d < bestD) {
                    best = i
                    bestD = d
                }
            })
            return best
        },
        take(i) {
            taken.add(i)
            sprites[i]?.setAlpha(0.45)
        },
        pickup(at) {
            const hit = pickups.find(p => !p.getData('taken') && Math.hypot(p.x - at.x, p.y - at.y) < 70)
            if (!hit) return false
            hit.setData('taken', true)
            const ring = ripples[pickups.indexOf(hit)]
            if (ring) {
                scene.tweens.killTweensOf(ring)
                ring.setVisible(false)
            }
            hit.setFrame(BUBBLE_FRAME.pop)
            void FX.to(scene, hit, { scale: 1.1, alpha: 0 }, { duration: 300 }).then(() => hit.setVisible(false))
            return true
        },
        nudge(i) {
            const s = sprites[i]
            if (s) void FX.shake(scene, s, { amount: 6, times: 2 })
        },
        spot(i) {
            return center(spots[i])
        },
        lit() {
            return lit
        },
        fogTexture() {
            return fog.texture
        },
        destroy() {
            clearLit()
            sprites.forEach(s => s.destroy())
            pickups.forEach(p => p.destroy())
            dropRipples()
            fog.destroy()
            dark.destroy()
            day.destroy()
            stamp.destroy()
            rocks.forEach(r => r.destroy())
            glows.destroy()
            rings.destroy()
            bg.forEach(o => o.destroy())
        },
    }
}

