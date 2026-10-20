import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DECO_CELL, GRASS_KEY, HOUSE_FOOT, HOUSE_PLATE, cellKey } from '../data/files'
import { BUSY, DECO, DEPTH, FENCE, HOUSE, ROAD } from '../data/layout'
import { GATE_OPEN, PLACES } from '../data/places'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL } from '../data/words'
import type { AppId, DecoSpot, LevelDef, PartId, PlaceId, Solid, Vec, Works } from '../types'
import type { View } from './view'

export interface Town {
    readonly solids: Solid[]
    door(id: PlaceId): Vec
    foot(id: PlaceId): Vec
    plate(id: PlaceId): Vec
    top(id: PlaceId): Vec
    nearDoor(at: Vec): PlaceId | null
    call(id: PlaceId | null): void
    aim(id: PlaceId | null): void
    gate(id: PlaceId, open: boolean): void
    peek(id: PlaceId, ms: number): void
    gateAt(id: PlaceId): Vec
    nope(id: PlaceId): void
    happy(id: PlaceId): void
    dim(id: PlaceId, on: boolean): void
    works(id: PlaceId, kind: Works): Promise<void>
    beam(from: Vec, to: Vec): Promise<void>
    fly(icon: number, from: Vec, to: Vec, size: number): Promise<void>
    use(part: PartId, app: AppId | null): void
    holder(part: PartId): AppId | null
    usedAt(app: AppId, part: PartId): Vec
    home(part: PartId, from: Vec): Promise<void>
    demo(on: boolean): void
    destroy(): void
}

interface House {
    id: PlaceId
    at: Vec
    art: Phaser.GameObjects.Image
    icon: Phaser.GameObjects.Image
    name: Phaser.GameObjects.Text
    base: number
}

const CHUNK = 1024

export const sortDepth =(y: number) => DEPTH.sorted + y / 1000

export function createTown(scene: Phaser.Scene, view: View, level: LevelDef): Town {
    const { w, h } = level.world
    const objects: Phaser.GameObjects.GameObject[] = []
    const own = <T extends Phaser.GameObjects.GameObject>(obj: T): T => {
        objects.push(obj)
        return view.world(obj)
    }
    const temp = <T extends Phaser.GameObjects.GameObject>(obj: T): T => view.world(obj)

    own(scene.add.tileSprite(0, 0, w, h, GRASS_KEY).setOrigin(0).setDepth(DEPTH.ground))

    const ground = scene.make.graphics({ x: 0, y: 0 }, false)
    paintFence(ground, w, h)
    paintRoads(ground, level)

    const shade = scene.make.graphics({ x: 0, y: 0 }, false)
    const solids: Solid[] = []
    const houses = new Map<PlaceId, House>()
    const plateD = HOUSE_PLATE.d * HOUSE.size

    level.houses.forEach(spot => {
        const def = PLACES[spot.id]
        const { x, y } = spot.at
        shade.fillStyle(C.shade, 0.16)
        shade.fillEllipse(x, y - 4, HOUSE.size * 0.86, 40)
        const art = own(
            scene.add
                .image(x, y, 'casas', cellKey(def.look))
                .setOrigin(0.5, HOUSE_FOOT)
                .setDisplaySize(HOUSE.size, HOUSE.size)
                .setDepth(sortDepth(y)),
        )
        const plate = { x, y: y + HOUSE_PLATE.y * HOUSE.size }
        const icon = own(
            scene.add
                .image(plate.x, plate.y, 'icones', cellKey(def.icon))
                .setDisplaySize(plateD * 0.82, plateD * 0.82)
                .setDepth(sortDepth(y) + 0.0005),
        )
        const name = own(
            scene.add
                .text(x, plate.y + plateD / 2 + HOUSE.name, def.name, {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.name}px`,
                    color: '#ffffff',
                    stroke: '#2b2440',
                    strokeThickness: 7,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.label),
        )
        houses.set(spot.id, { id: spot.id, at: spot.at, art, icon, name, base: art.scaleX })
        solids.push({ kind: 'box', x, y: y - HOUSE.body.lift - HOUSE.body.h / 2, w: HOUSE.body.w, h: HOUSE.body.h })
    })

    level.decor.forEach(spot => placeDeco(spot))

    for (let cy = 0; cy < h; cy += CHUNK)
        for (let cx = 0; cx < w; cx += CHUNK) {
            const tile = own(scene.add.renderTexture(cx, cy, Math.min(CHUNK, w - cx), Math.min(CHUNK, h - cy)).setOrigin(0).setDepth(DEPTH.road))
            tile.draw(ground, -cx, -cy)
            tile.draw(shade, -cx, -cy)
        }
    ground.destroy()
    shade.destroy()

    function placeDeco(spot: DecoSpot) {
        const size = spot.kind === 'chafariz' ? DECO.fountain : spot.kind === 'lago' ? DECO.pond : DECO.size
        const { x, y } = spot.at
        const art = DECO_CELL[spot.kind]
        shade.fillStyle(C.shade, 0.14)
        shade.fillEllipse(x, y - 6, size * (DECO.shadow[spot.kind] ?? 0.62), size * 0.14)
        own(
            scene.add
                .image(x, y, art.sheet, cellKey(art.cell))
                .setOrigin(0.5, 240 / 256)
                .setDisplaySize(size, size)
                .setDepth(sortDepth(y)),
        )
        const r = DECO.solid[spot.kind]
        if (r) solids.push({ kind: 'circle', x, y: y - (DECO.lift[spot.kind] ?? 12), r })
    }

    const door = (id: PlaceId): Vec => {
        const at = houses.get(id)?.at ?? { x: 0, y: 0 }
        return { x: at.x, y: at.y + HOUSE.door.dy }
    }
    const top = (id: PlaceId): Vec => {
        const hs = houses.get(id)
        return hs ? { x: hs.at.x, y: hs.icon.y - plateD / 2 - HOUSE.arrow } : { x: 0, y: 0 }
    }

    const arrow = own(scene.add.graphics().setDepth(DEPTH.label + 1).setVisible(false))
    arrow.fillStyle(C.shadow, 0.22)
    arrow.fillTriangle(-30, -18, 34, -18, 2, 30)
    arrow.fillStyle(C.butter, 1)
    arrow.fillTriangle(-34, -24, 34, -24, 0, 24)
    arrow.fillRoundedRect(-14, -58, 28, 40, 8)
    arrow.lineStyle(5, C.ink, 1)
    arrow.strokeTriangle(-34, -24, 34, -24, 0, 24)

    const ring = own(scene.add.graphics().setDepth(DEPTH.shade + 0.5).setVisible(false))

    let calling: PlaceId | null = null
    let aiming: PlaceId | null = null
    let smoke: Phaser.Time.TimerEvent | undefined

    const puff = () => {
        if (!calling) return
        const hs = houses.get(calling)
        if (!hs) return
        const x = hs.at.x + (91 / 384) * HOUSE.size
        const y = hs.at.y - (292 / 384) * HOUSE.size
        const p = temp(scene.add.circle(x + Phaser.Math.Between(-6, 6), y, Phaser.Math.Between(12, 18), C.smoke, 0.9).setDepth(DEPTH.smoke))
        scene.tweens.add({
            targets: p,
            x: p.x + Phaser.Math.Between(-30, 30),
            y: y - Phaser.Math.Between(90, 140),
            scale: 2.2,
            alpha: 0,
            duration: 1300,
            onComplete: () => p.destroy(),
        })
    }

    const pointAt = (target: PlaceId | null) => {
        scene.tweens.killTweensOf([arrow, ring])
        arrow.setVisible(Boolean(target))
        ring.setVisible(Boolean(target))
        if (!target) return
        const t = top(target)
        arrow.setPosition(t.x, t.y).setScale(1)
        scene.tweens.add({ targets: arrow, scaleY: 0.86, y: t.y + 14, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        const d = door(target)
        ring.clear()
        ring.lineStyle(10, C.butter, 1)
        ring.strokeEllipse(d.x, d.y, HOUSE.door.r * 1.9, HOUSE.door.r * 0.9)
        ring.setAlpha(1)
        scene.tweens.add({ targets: ring, alpha: 0.35, duration: 520, yoyo: true, repeat: -1 })
    }

    const shut = new Map<PlaceId, Phaser.Time.TimerEvent>()
    const opened = new Set<PlaceId>()
    const dimmed = new Set<PlaceId>()
    const held = new Map<PartId, AppId>()
    const seals = new Map<PartId, Phaser.GameObjects.Container>()

    const isPart = (id: PlaceId): id is PartId => PLACES[id].family === 'peca'

    const tone = (hs: House) => {
        const parts = [hs.art, hs.icon]
        parts.forEach(o => o.clearTint())
        if (dimmed.has(hs.id)) parts.forEach(o => o.setTint(C.dim))
        else if (isPart(hs.id) && held.has(hs.id) && !opened.has(hs.id)) hs.art.setTint(C.busyShop)
    }

    const frameOf = (id: PlaceId) => (isPart(id) && (opened.has(id) || held.has(id)) ? GATE_OPEN : PLACES[id].look)

    const refresh = (id: PlaceId) => {
        const hs = houses.get(id)
        if (!hs || !isPart(id)) return
        hs.art.setFrame(cellKey(frameOf(id)))
        hs.art.setDisplaySize(HOUSE.size, HOUSE.size)
        tone(hs)
    }

    const heldBy = (app: AppId) => [...held].filter(([, a]) => a === app).map(([p]) => p)

    const sealSpot = (app: AppId, index: number): Vec => {
        const hs = houses.get(app)
        if (!hs) return { x: 0, y: 0 }
        return { x: hs.icon.x + (index === 0 ? 1 : -1) * BUSY.dx, y: hs.icon.y + BUSY.dy }
    }

    const placeSeals = (app: AppId) => heldBy(app).forEach((p, i) => {
        const at = sealSpot(app, i)
        seals.get(p)?.setPosition(at.x, at.y)
    })

    const makeSeal = (part: PartId) => {
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillCircle(3, 5, BUSY.r)
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, BUSY.r)
        g.lineStyle(5, C.ink, 1)
        g.strokeCircle(0, 0, BUSY.r)
        const img = scene.add.image(0, 0, 'icones', cellKey(PLACES[part].icon)).setDisplaySize(BUSY.icon, BUSY.icon)
        const tagG = scene.add.graphics()
        tagG.fillStyle(C.ink, 1)
        tagG.fillRoundedRect(-BUSY.tagW / 2, BUSY.tagY - BUSY.tagH / 2, BUSY.tagW, BUSY.tagH, BUSY.tagH / 2)
        const tag = scene.add
            .text(0, BUSY.tagY + 1, LABEL.busy, { fontFamily: FONT.black, fontSize: `${SIZE.tag}px`, color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2)
        const seal = temp(scene.add.container(0, 0, [g, img, tagG, tag]).setDepth(DEPTH.label + 0.5))
        scene.tweens.add({ targets: img, angle: 360, duration: BUSY.spin, repeat: -1 })
        return seal
    }

    const dropSeal = (part: PartId) => {
        const seal = seals.get(part)
        seals.delete(part)
        if (!seal) return
        scene.tweens.killTweensOf(seal)
        seal.each((o: Phaser.GameObjects.GameObject) => scene.tweens.killTweensOf(o))
        seal.destroy()
    }

    const arc = async (img: Phaser.GameObjects.Image, from: Vec, to: Vec) => {
        const lift = Math.max(120, Phaser.Math.Distance.BetweenPoints(from, to) * 0.3)
        const k = { t: 0 }
        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(scene, TIMING.beam),
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    const u = k.t
                    img.setPosition(Phaser.Math.Linear(from.x, to.x, u), Phaser.Math.Linear(from.y, to.y, u) - Math.sin(u * Math.PI) * lift)
                },
                onComplete: () => resolve(),
            })
        })
    }

    let balloons: Phaser.GameObjects.Container[] = []
    let locks: Phaser.GameObjects.Graphics[] = []

    const town: Town = {
        solids,
        door,
        foot: id => ({ ...(houses.get(id)?.at ?? { x: 0, y: 0 }) }),
        plate: id => {
            const hs = houses.get(id)
            return hs ? { x: hs.icon.x, y: hs.icon.y } : { x: 0, y: 0 }
        },
        top,
        nearDoor(at) {
            let best: PlaceId | null = null
            let bestD: number = HOUSE.door.r
            houses.forEach(hs => {
                const d = Phaser.Math.Distance.BetweenPoints(at, door(hs.id))
                if (d < bestD) {
                    bestD = d
                    best = hs.id
                }
            })
            return best
        },
        call(id) {
            calling = id
            smoke?.remove()
            smoke = undefined
            if (id) smoke = scene.time.addEvent({ delay: TIMING.smoke, loop: true, callback: puff })
            pointAt(id ?? aiming)
        },
        aim(id) {
            aiming = id
            pointAt(id ?? calling)
        },
        gate(id, open) {
            shut.get(id)?.remove()
            shut.delete(id)
            const hs = houses.get(id)
            if (!hs || !isPart(id)) return
            if (open) opened.add(id)
            else opened.delete(id)
            refresh(id)
            if (open) void FX.to(scene, hs.art, { scaleY: hs.base * 1.04 }, { duration: 140, yoyo: true })
        },
        peek(id, ms) {
            town.gate(id, true)
            shut.set(id, scene.time.delayedCall(ms, () => town.gate(id, false)))
        },
        gateAt(id) {
            const d = door(id)
            return { x: d.x, y: d.y - HOUSE.gate }
        },
        nope(id) {
            const hs = houses.get(id)
            if (!hs || scene.tweens.isTweening(hs.art)) return
            const x = hs.art.x
            scene.tweens.add({ targets: hs.art, x: x + 8, duration: 60, yoyo: true, repeat: 3, onComplete: () => hs.art.setX(x) })
        },
        happy(id) {
            const hs = houses.get(id)
            if (!hs) return
            scene.tweens.killTweensOf([hs.art, hs.icon])
            hs.art.setScale(hs.base)
            scene.tweens.add({ targets: hs.art, scaleY: hs.base * 1.08, scaleX: hs.base * 0.96, duration: 160, yoyo: true, repeat: 2 })
            const iy = hs.icon.y
            scene.tweens.add({ targets: hs.icon, y: iy - 22, duration: 160, yoyo: true, repeat: 2, onComplete: () => hs.icon.setY(iy) })
        },
        dim(id, on) {
            const hs = houses.get(id)
            if (!hs) return
            if (on) dimmed.add(id)
            else dimmed.delete(id)
            tone(hs)
        },
        async works(id, kind) {
            const hs = houses.get(id)
            if (!hs) return
            town.happy(id)
            const p = { x: hs.icon.x, y: hs.icon.y }
            if (kind === 'flash') {
                const flash = temp(scene.add.circle(p.x, p.y, 40, C.white, 0.95).setDepth(DEPTH.beam))
                void FX.to(scene, flash, { scale: 7, alpha: 0 }, { duration: 520 }).then(() => flash.destroy())
                const photo = temp(scene.add.image(p.x, p.y, 'icones', cellKey(0)).setDisplaySize(60, 60).setDepth(DEPTH.beam))
                await FX.to(scene, photo, { y: p.y - 150, scale: photo.scale * 1.8 }, { duration: 620, ease: 'Back.easeOut' })
                await FX.wait(scene, 420)
                await FX.to(scene, photo, { alpha: 0 }, { duration: 260 })
                photo.destroy()
                return
            }
            if (kind === 'notes') {
                const jobs: Promise<void>[] = []
                for (let k = 0; k < 6; k++) {
                    const n = temp(scene.add.image(p.x, p.y, 'icones', cellKey(3)).setDisplaySize(46, 46).setDepth(DEPTH.beam).setAlpha(0))
                    jobs.push(
                        FX.to(scene, n, { alpha: 1, x: p.x + Phaser.Math.Between(-150, 150), y: p.y - Phaser.Math.Between(110, 220) }, { duration: 760, delay: k * 140 })
                            .then(() => FX.to(scene, n, { alpha: 0 }, { duration: 260 }))
                            .then(() => n.destroy()),
                    )
                }
                await FX.all(...jobs)
                return
            }
            const glow = temp(scene.add.circle(p.x, p.y, 60, C.beam, 0.7).setDepth(DEPTH.beam - 2))
            await FX.to(scene, glow, { scale: 1.6, alpha: 0 }, { duration: 700 })
            glow.destroy()
        },
        async beam(from, to) {
            const ball = temp(scene.add.circle(from.x, from.y, 22, C.beam, 1).setDepth(DEPTH.beam))
            ball.setStrokeStyle(6, C.white, 0.9)
            const lift = Math.max(160, Phaser.Math.Distance.BetweenPoints(from, to) * 0.35)
            const k = { t: 0 }
            let last = 0
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, TIMING.beam),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const u = k.t
                        const x = Phaser.Math.Linear(from.x, to.x, u)
                        const y = Phaser.Math.Linear(from.y, to.y, u) - Math.sin(u * Math.PI) * lift
                        ball.setPosition(x, y)
                        if (u - last > 0.04) {
                            last = u
                            const trail = temp(scene.add.circle(x, y, 12, C.beam, 0.8).setDepth(DEPTH.beam - 1))
                            scene.tweens.add({ targets: trail, scale: 0.2, alpha: 0, duration: 420, onComplete: () => trail.destroy() })
                        }
                    },
                    onComplete: () => resolve(),
                })
            })
            void FX.to(scene, ball, { scale: 2.4, alpha: 0 }, { duration: 260 }).then(() => ball.destroy())
        },
        async fly(icon, from, to, size) {
            const img = temp(scene.add.image(from.x, from.y, 'icones', cellKey(icon)).setDisplaySize(size, size).setDepth(DEPTH.beam))
            await arc(img, from, to)
            img.destroy()
        },
        use(part, app) {
            const prev = held.get(part) ?? null
            if (prev === app) return
            if (prev) {
                held.delete(part)
                dropSeal(part)
                placeSeals(prev)
            }
            if (app && houses.has(app)) {
                held.set(part, app)
                const seal = makeSeal(part)
                seals.set(part, seal)
                placeSeals(app)
                seal.setScale(0)
                scene.tweens.add({ targets: seal, scale: 1, duration: 280, ease: 'Back.easeOut' })
            }
            refresh(part)
        },
        holder: part => held.get(part) ?? null,
        usedAt(app, part) {
            const list = heldBy(app)
            const i = list.indexOf(part)
            return sealSpot(app, i >= 0 ? i : list.length)
        },
        async home(part, from) {
            const hs = houses.get(part)
            town.use(part, null)
            if (!hs) return
            town.gate(part, true)
            const to = town.gateAt(part)
            const size = BUSY.icon * 1.6
            const img = temp(scene.add.image(from.x, from.y, 'icones', cellKey(PLACES[part].icon)).setDisplaySize(size, size).setDepth(DEPTH.beam))
            await arc(img, from, to)
            await FX.to(scene, img, { y: to.y - 40 }, { duration: 160, ease: 'Quad.easeOut' })
            await FX.to(scene, img, { y: to.y + 40, scale: 0, alpha: 0.4 }, { duration: 220, ease: 'Quad.easeIn' })
            img.destroy()
            scene.tweens.killTweensOf(hs.art)
            hs.art.setScale(hs.base)
            await FX.to(scene, hs.art, { scaleY: hs.base * 1.08, scaleX: hs.base * 0.96 }, { duration: 140, yoyo: true })
            hs.art.setScale(hs.base)
            await FX.wait(scene, 220)
            town.gate(part, false)
        },
        demo(on) {
            balloons.forEach(b => {
                scene.tweens.killTweensOf(b)
                b.destroy()
            })
            locks.forEach(l => l.destroy())
            balloons = []
            locks = []
            if (!on) return
            level.calls.forEach((c, i) => {
                const hs = houses.get(c.app)
                if (!hs) return
                const pair = c.wants.length > 1
                const bw = pair ? 190 : 116
                const g = scene.add.graphics()
                g.fillStyle(C.shadow, 0.2)
                g.fillRoundedRect(-bw / 2 + 2, -50, bw, 96, 30)
                g.fillStyle(C.white, 1)
                g.fillRoundedRect(-bw / 2 - 2, -56, bw, 96, 30)
                g.fillTriangle(-16, 36, 14, 36, -4, 64)
                const size = pair ? 66 : 74
                const wants = c.wants.map((p, k) =>
                    scene.add.image(pair ? (k === 0 ? -42 : 38) : -2, -8, 'icones', cellKey(PLACES[p].icon)).setDisplaySize(size, size),
                )
                const b = temp(scene.add.container(hs.at.x + 120 + (pair ? 36 : 0), hs.icon.y - 40, [g, ...wants]).setDepth(DEPTH.label + 2))
                b.setScale(0)
                scene.tweens.add({ targets: b, scale: 1, duration: 300, delay: i * 120, ease: 'Back.easeOut' })
                scene.tweens.add({ targets: b, angle: { from: -6, to: 6 }, duration: 160, yoyo: true, repeat: -1, delay: 400 + i * 90 })
                balloons.push(b)
            })
            houses.forEach(hs => {
                if (PLACES[hs.id].family !== 'peca') return
                const g = temp(scene.add.graphics().setDepth(DEPTH.label + 2))
                const x = hs.at.x
                const y = hs.at.y - 70
                g.lineStyle(10, C.graphite, 1)
                g.beginPath()
                g.arc(x, y - 12, 20, Math.PI, 0)
                g.strokePath()
                g.fillStyle(C.accentYellow, 1)
                g.fillRoundedRect(x - 32, y - 12, 64, 50, 12)
                g.fillStyle(C.graphite, 1)
                g.fillCircle(x, y + 8, 7)
                g.fillRect(x - 3, y + 8, 6, 16)
                locks.push(g)
            })
        },
        destroy() {
            smoke?.remove()
            shut.forEach(t => t.remove())
            shut.clear()
            ;[...seals.keys()].forEach(dropSeal)
            held.clear()
            scene.tweens.killTweensOf([arrow, ring])
            town.demo(false)
            objects.forEach(o => {
                scene.tweens.killTweensOf(o)
                o.destroy()
            })
        },
    }
    return town
}

function quad(g: Phaser.GameObjects.Graphics, a: Vec, b: Vec, width: number, color: number) {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const nx = (-(b.y - a.y) / len) * (width / 2)
    const ny = ((b.x - a.x) / len) * (width / 2)
    g.fillStyle(color, 1)
    g.fillPoints(
        [
            new Phaser.Math.Vector2(a.x + nx, a.y + ny),
            new Phaser.Math.Vector2(b.x + nx, b.y + ny),
            new Phaser.Math.Vector2(b.x - nx, b.y - ny),
            new Phaser.Math.Vector2(a.x - nx, a.y - ny),
        ],
        true,
    )
    g.fillCircle(a.x, a.y, width / 2)
    g.fillCircle(b.x, b.y, width / 2)
}

function paintRoads(g: Phaser.GameObjects.Graphics, level: LevelDef) {
    const paths = level.houses.map(spot => {
        const below = level.roads
            .flatMap(r => r.slice(1).map((b, i) => [r[i], b] as const))
            .filter(([a, b]) => a.y === b.y && a.y > spot.at.y && Math.min(a.x, b.x) <= spot.at.x && Math.max(a.x, b.x) >= spot.at.x)
            .map(([a]) => a.y)
        const to = below.length ? Math.min(...below) : spot.at.y + 90
        return [
            { x: spot.at.x, y: spot.at.y - 10 },
            { x: spot.at.x, y: to },
        ] as const
    })
    const segs = level.roads.flatMap(r => r.slice(1).map((b, i) => [r[i], b] as const))
    const { plaza } = level

    segs.forEach(([a, b]) => quad(g, a, b, ROAD.width + ROAD.edge * 2, C.roadEdge))
    paths.forEach(([a, b]) => quad(g, a, b, ROAD.path + ROAD.edge * 2, C.roadEdge))
    g.fillStyle(C.plazaEdge, 1)
    g.fillCircle(plaza.x, plaza.y, plaza.r + ROAD.edge)
    segs.forEach(([a, b]) => quad(g, a, b, ROAD.width, C.road))
    paths.forEach(([a, b]) => quad(g, a, b, ROAD.path, C.road))
    g.fillStyle(C.plaza, 1)
    g.fillCircle(plaza.x, plaza.y, plaza.r)
    g.fillStyle(C.plazaEdge, 0.5)
    g.fillCircle(plaza.x, plaza.y, plaza.r * 0.72)
    g.fillStyle(C.plaza, 1)
    g.fillCircle(plaza.x, plaza.y, plaza.r * 0.68)

    segs.forEach(([a, b]) => {
        const len = Math.hypot(b.x - a.x, b.y - a.y)
        const ux = (b.x - a.x) / len
        const uy = (b.y - a.y) / len
        for (let d = 60; d < len - 40; d += 90) {
            const x = a.x + ux * d
            const y = a.y + uy * d
            if (Math.hypot(x - plaza.x, y - plaza.y) < plaza.r + 20) continue
            g.fillStyle(C.roadLine, 1)
            if (Math.abs(ux) > Math.abs(uy)) g.fillRoundedRect(x - 20, y - 4, 40, 8, 4)
            else g.fillRoundedRect(x - 4, y - 20, 8, 40, 4)
        }
    })
}

function paintFence(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    const i = FENCE.inset
    g.fillStyle(C.fenceDark, 1)
    g.fillRoundedRect(i - 6, i - 6, w - i * 2 + 12, 12, 6)
    g.fillRoundedRect(i - 6, h - i - 6, w - i * 2 + 12, 12, 6)
    g.fillRoundedRect(i - 6, i - 6, 12, h - i * 2 + 12, 6)
    g.fillRoundedRect(w - i - 6, i - 6, 12, h - i * 2 + 12, 6)
    g.fillStyle(C.fence, 1)
    for (let x = i; x <= w - i; x += FENCE.post) {
        g.fillRoundedRect(x - 8, i - 26, 16, 40, 6)
        g.fillRoundedRect(x - 8, h - i - 26, 16, 40, 6)
    }
    for (let y = i; y <= h - i; y += FENCE.post) {
        g.fillRoundedRect(i - 8, y - 26, 16, 40, 6)
        g.fillRoundedRect(w - i - 8, y - 26, 16, 40, 6)
    }
}
