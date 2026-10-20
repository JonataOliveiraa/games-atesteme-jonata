import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BACKGROUNDS, FISH_FRAME, FISH_SHEET, VILA_FRAME, VILA_SHEET, cellKey, cellScale, iconRef } from '../data/files'
import { DEPTH, FISH_SIZE, H, HEADER, HIT, SKY, VILA, W, WATER, ZONES } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import { ERAS } from '../data/eras'
import type { FishKind, Rect, Vec } from '../types'

export interface Fish {
    kind: FishKind
    img: Phaser.GameObjects.Image
}

export interface World {
    setEra(era: number): void
    populate(era: number, want?: FishKind, noBig?: boolean): void
    setDirty(on: boolean, ms: number): Promise<void>
    trash(): Phaser.GameObjects.Image[]
    bigBack(from: Vec): Promise<void>
    setVila(frame: number): void
    setNight(on: boolean, ms: number): Promise<void>
    travel(to: number, dir: 1 | -1, mid: () => void): Promise<void>
    find(kind: FishKind): Fish | null
    fishAt(x: number, y: number): Fish | null
    blips(): { kind: FishKind; at: Vec }[]
    take(fish: Fish): Phaser.GameObjects.Image
    present(kind: FishKind): boolean
    call(icon: number, to: Vec): Promise<void>
    vilaRect(): Rect
    cheer(): Promise<void>
    update(time: number, delta: number): void
    destroy(): void
}

interface Swimmer extends Fish {
    base: number
    left: number
    right: number
    dir: 1 | -1
    speed: number
    phase: number
    frame: number
    lock: boolean
}

const NIGHT = 0.52
const MURK = 0.34

export function createWorld(scene: Phaser.Scene, startEra: number): World {
    const backs = BACKGROUNDS.map((key, i) =>
        scene.add
            .image(0, 0, key)
            .setOrigin(0)
            .setDisplaySize(W, H)
            .setDepth(DEPTH.bg + i * 0.01)
            .setAlpha(i === startEra ? 1 : 0),
    )
    let era = startEra

    const vilaScale = VILA.scale * cellScale(scene.textures, VILA_SHEET)
    const vila = scene.add.image(VILA.x, VILA.y, VILA_SHEET.key, cellKey(0)).setOrigin(0.5, VILA.foot).setScale(vilaScale).setDepth(DEPTH.vila)

    const fishScale = cellScale(scene.textures, FISH_SHEET)
    let swimmers: Swimmer[] = []
    let bottle: Phaser.GameObjects.Image | null = null
    let junk: Phaser.GameObjects.Image[] = []
    const murk = scene.add.rectangle(WATER.left, WATER.y, W - WATER.left, H - WATER.y, C.murk, 0).setOrigin(0).setDepth(DEPTH.fish + 0.5)

    const surface = scene.add.graphics().setDepth(DEPTH.fish + 1)

    const dim = scene.add.rectangle(0, HEADER.h, W, H - HEADER.h, C.night, 0).setOrigin(0).setDepth(DEPTH.night)
    const moon = scene.add.container(1110, 170, [scene.add.circle(0, 0, 44, C.moon, 0.18), scene.add.circle(0, 0, 30, C.moon)]).setDepth(DEPTH.sky).setAlpha(0)
    const stars = scene.add
        .container(
            0,
            0,
            Array.from({ length: 16 }, (_, i) => scene.add.circle(80 + ((i * 397) % 1120), 120 + ((i * 131) % 230), i % 4 === 0 ? 3.5 : 2.2, C.star)),
        )
        .setDepth(DEPTH.sky)
        .setAlpha(0)
    const sun = scene.add.container(0, 0, [scene.add.circle(0, 0, SKY.sunR * 1.7, C.sunGlow, 0.45), scene.add.circle(0, 0, SKY.sunR, C.sun)]).setDepth(DEPTH.sky).setVisible(false)
    const streaks = Array.from({ length: 5 }, () => scene.add.ellipse(0, 0, 220, 54, C.cloud, 0.85).setDepth(DEPTH.sky).setVisible(false))
    const rain = scene.add.graphics().setDepth(DEPTH.rain)
    let raining = 0
    let night = false

    const zoneOf = (kind: FishKind) => ZONES[kind]

    const clear = () => {
        swimmers.forEach(s => s.img.destroy())
        swimmers = []
        bottle?.destroy()
        bottle = null
    }

    const spawn = (kind: FishKind, k: number, n: number) => {
        const z = zoneOf(kind)
        const frame = kind === 'small' ? FISH_FRAME.small : kind === 'big' ? FISH_FRAME.big : FISH_FRAME.school
        const x = z.x + ((k + 0.5) / n) * z.w
        const y = z.y + z.h / 2 + ((k % 2) * 2 - 1) * z.h * 0.22
        const img = scene.add
            .image(x, y, FISH_SHEET.key, cellKey(frame))
            .setScale(FISH_SIZE[kind] * fishScale)
            .setDepth(DEPTH.fish)
        const dir: 1 | -1 = k % 2 === 0 ? 1 : -1
        img.setFlipX(dir < 0)
        const s: Swimmer = {
            kind,
            img,
            base: y,
            left: z.x,
            right: z.x + z.w,
            dir,
            speed: kind === 'big' ? 26 : kind === 'school' ? 34 : 42 + k * 6,
            phase: k * 1.7,
            frame,
            lock: false,
        }
        swimmers.push(s)
        if (night) img.setAlpha(0)
        return s
    }

    const world: World = {
        setEra(next) {
            era = next
            backs.forEach((b, i) => {
                scene.tweens.killTweensOf(b)
                b.setAlpha(i === next ? 1 : 0)
            })
        },
        populate(at, want, noBig) {
            clear()
            const def = ERAS[at]
            for (let k = 0; k < def.small; k++) spawn('small', k, def.small)
            if (def.big && !noBig) spawn('big', 0, 1)
            if (want === 'school' && def.school) spawn('school', 0, 1)
            if (def.trash) {
                bottle = scene.add
                    .image(980, WATER.y + 4, FISH_SHEET.key, cellKey(FISH_FRAME.bottle))
                    .setScale(0.55 * fishScale)
                    .setDepth(DEPTH.trash)
                    .setAngle(-8)
            }
        },
        async setDirty(on, ms) {
            if (on && junk.length === 0) {
                junk = [
                    { x: 900, y: WATER.y + 4, angle: -8, frame: FISH_FRAME.bottle },
                    { x: 1120, y: WATER.bed - 12, angle: 64, frame: FISH_FRAME.bottle },
                ].map(j =>
                    scene.add
                        .image(j.x, j.y, FISH_SHEET.key, cellKey(j.frame))
                        .setScale(0.55 * fishScale)
                        .setAngle(j.angle)
                        .setDepth(DEPTH.trash),
                )
            }
            await FX.to(scene, murk, { fillAlpha: on ? MURK : 0 }, { duration: Math.max(1, ms) })
        },
        trash() {
            const out = [...junk, ...(bottle ? [bottle] : [])]
            junk = []
            bottle = null
            return out
        },
        async bigBack(from) {
            const s = spawn('big', 0, 1)
            s.lock = true
            s.img.setPosition(from.x, from.y).setAlpha(night ? 0 : 1)
            const z = ZONES.big
            const to = { x: z.x + z.w / 2, y: z.y + z.h / 2 }
            s.img.setFlipX(to.x < from.x)
            await FX.to(scene, s.img, { x: to.x, y: to.y }, { duration: TIMING.bigBack, ease: 'Sine.easeOut' })
            s.base = to.y
            s.lock = false
        },
        setVila(frame) {
            vila.setFrame(cellKey(frame))
        },
        async setNight(on, ms) {
            night = on
            swimmers.forEach(s => {
                scene.tweens.killTweensOf(s.img)
                scene.tweens.add({ targets: s.img, alpha: on ? 0 : 1, duration: ms })
            })
            await FX.all(
                FX.to(scene, dim, { fillAlpha: on ? NIGHT : 0 }, { duration: ms }),
                FX.to(scene, moon, { alpha: on ? 1 : 0 }, { duration: ms }),
                FX.to(scene, stars, { alpha: on ? 1 : 0 }, { duration: ms }),
            )
        },
        async travel(to, dir, mid) {
            const cycles = TIMING.cycles
            const cycle = TIMING.cycle
            const base = night ? NIGHT : 0
            const dusk = (t: number) => base + (1 - base) * 0.45 * (1 - Math.sin(t * Math.PI))
            await FX.all(
                FX.to(scene, [moon, stars], { alpha: 0 }, { duration: 240 }),
                FX.to(scene, dim, { fillAlpha: dusk(0) }, { duration: 240 }),
            )
            sun.setVisible(true)
            streaks.forEach(s => s.setVisible(true))
            raining = 1
            let swapped = false
            for (let c = 0; c < cycles; c++) {
                const from = dir > 0 ? SKY.left : SKY.right
                const end = dir > 0 ? SKY.right : SKY.left
                const k = { t: 0 }
                streaks.forEach((s, i) => s.setPosition(dir > 0 ? -200 - i * 90 : W + 200 + i * 90, 150 + ((i * 47) % 160)))
                await new Promise<void>(resolve => {
                    scene.tweens.add({
                        targets: k,
                        t: 1,
                        duration: cycle,
                        ease: 'Linear',
                        onUpdate: () => {
                            const t = k.t
                            sun.setPosition(Phaser.Math.Linear(from, end, t), SKY.low - Math.sin(t * Math.PI) * (SKY.low - SKY.top))
                            dim.setFillStyle(C.night, dusk(t))
                            streaks.forEach((s, i) => s.setX(s.x + dir * (26 + i * 6)))
                            if (!swapped && c === Math.floor(cycles / 2) && t > 0.45) {
                                swapped = true
                                const old = backs[era]
                                const next = backs[to]
                                scene.tweens.add({ targets: old, alpha: 0, duration: cycle * 0.8 })
                                scene.tweens.add({ targets: next, alpha: 1, duration: cycle * 0.8 })
                                era = to
                                mid()
                            }
                        },
                        onComplete: () => resolve(),
                        onStop: () => resolve(),
                    })
                })
            }
            raining = 0
            rain.clear()
            sun.setVisible(false)
            streaks.forEach(s => s.setVisible(false))
            await FX.all(
                FX.to(scene, dim, { fillAlpha: base }, { duration: 300 }),
                night ? FX.to(scene, [moon, stars], { alpha: 1 }, { duration: 300 }) : Promise.resolve(),
            )
        },
        find(kind) {
            return swimmers.find(s => s.kind === kind) ?? null
        },
        fishAt(x, y) {
            let best: Swimmer | null = null
            let bestD = Infinity
            swimmers.forEach(s => {
                if (s.img.alpha < 0.5) return
                const rx = Math.max(HIT.min, (s.img.displayWidth * HIT.pad) / 2)
                const ry = Math.max(HIT.min, (s.img.displayHeight * HIT.pad) / 2)
                const d = ((x - s.img.x) / rx) ** 2 + ((y - s.img.y) / ry) ** 2
                if (d <= 1 && d < bestD) {
                    best = s
                    bestD = d
                }
            })
            return best
        },
        blips: () => swimmers.map(s => ({ kind: s.kind, at: { x: s.img.x, y: s.img.y } })),
        async call(icon, to) {
            const bx = VILA.x + 10
            const by = VILA.y - 150
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.2)
            g.fillRoundedRect(-62 + 4, -50 + 6, 124, 100, 26)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(-62, -50, 124, 100, 26)
            g.fillTriangle(-18, 48, 14, 48, -10, 74)
            const ref = iconRef(icon)
            const pic = scene.add.image(0, -2, ref.key, ref.frame).setDisplaySize(80, 80)
            const bubble = scene.add.container(bx, by, [g, pic]).setDepth(DEPTH.sonar)
            vila.setFrame(cellKey(VILA_FRAME.cheer))
            void FX.popIn(scene, bubble, { from: 0.3, duration: 360 })
            await FX.to(scene, vila, { y: VILA.y - 10 }, { duration: 160, yoyo: true, repeat: 1 })
            vila.setY(VILA.y).setFrame(cellKey(VILA_FRAME.idle))
            await FX.wait(scene, TIMING.ask)
            const fly = scene.add.image(bx, by - 2, ref.key, ref.frame).setDisplaySize(80, 80).setDepth(DEPTH.caption)
            void FX.to(scene, bubble, { alpha: 0, scale: 0.6 }, { duration: 260 }).then(() => bubble.destroy())
            await FX.arcTo(scene, fly, to, { height: 80, duration: TIMING.fly })
            fly.destroy()
        },
        vilaRect: () => ({ x: VILA.x - 110, y: VILA.y - 130, w: 220, h: 150 }),
        take(fish) {
            swimmers = swimmers.filter(s => s.img !== fish.img)
            scene.tweens.killTweensOf(fish.img)
            fish.img.setDepth(DEPTH.tool + 1)
            return fish.img
        },
        present(kind) {
            return swimmers.some(s => s.kind === kind)
        },
        async cheer() {
            vila.setFrame(cellKey(VILA_FRAME.cheer))
            await FX.to(scene, vila, { y: VILA.y - 14 }, { duration: 180, yoyo: true, repeat: 2, ease: 'Sine.easeOut' })
            vila.setY(VILA.y).setFrame(cellKey(VILA_FRAME.idle))
        },
        update(time, delta) {
            const dt = delta / 1000
            swimmers.forEach(s => {
                if (s.lock) return
                s.img.x += s.dir * s.speed * dt
                if (s.img.x > s.right && s.dir > 0) s.dir = -1
                if (s.img.x < s.left && s.dir < 0) s.dir = 1
                s.img.setFlipX(s.dir < 0)
                s.img.y = s.base + Math.sin(time / 600 + s.phase) * 4
                if (s.kind !== 'school') s.img.setFrame(cellKey(s.frame + (Math.floor(time / TIMING.tail + s.phase) % 2)))
            })
            if (bottle) bottle.y = WATER.y + 4 + Math.sin(time / 500) * 3
            surface.clear()
            surface.lineStyle(3, C.surface, night ? 0.25 : 0.7)
            surface.beginPath()
            for (let x = WATER.left + 6; x <= W; x += 20) {
                const y = WATER.y + Math.sin(x / 46 + time / 420) * 2.2
                if (x === WATER.left + 6) surface.moveTo(x, y)
                else surface.lineTo(x, y)
            }
            surface.strokePath()
            if (raining) {
                rain.clear()
                rain.lineStyle(3, C.rain, 0.7)
                for (let i = 0; i < 36; i++) {
                    const x = (i * 173 + time * 0.9) % W
                    const y = HEADER.h + ((i * 89 + time * 1.4) % (H - HEADER.h))
                    rain.lineBetween(x, y, x - 8, y + 26)
                }
            }
        },
        destroy() {
            clear()
            backs.forEach(b => b.destroy())
            junk.forEach(j => j.destroy())
            ;[vila, murk, surface, dim, moon, stars, sun, rain, ...streaks].forEach(o => o.destroy())
        },
    }
    return world
}

export const fishSpot = (fish: Fish | null, kind: FishKind): Vec => {
    if (fish) return { x: fish.img.x, y: fish.img.y }
    const z = ZONES[kind]
    return { x: z.x + z.w / 2, y: z.y + z.h / 2 }
}
