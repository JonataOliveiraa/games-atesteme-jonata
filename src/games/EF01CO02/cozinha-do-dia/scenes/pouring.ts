import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { COUNTER, DEPTH, DISH, H, POUR, W } from '../data/layout'
import { TIMING } from '../data/timing'
import type { DishId, ObjectId } from '../types'
import { DOT } from './art'
import type { Audio } from './audio'
import type { Bench } from './bench'
import type { Client } from './client'
import type { Dish } from './dish'
import type { Focus } from './focus'
import { fingerDot, hint } from './guide'
import type { Mess } from './mess'

interface Parts {
    bench: Bench
    dish: Dish
    mess: Mess
    client: Client
    audio: Audio
    focus: Focus
}

interface Drop {
    image: Phaser.GameObjects.Image
    vx: number
    vy: number
    floor: number
    falling: boolean
}

export interface Pouring {
    start(id: ObjectId, frame: string, dish: DishId): Promise<void>
    demo(): Promise<void>
    play(): Promise<void>
    finish(frame: string): Promise<void>
    level(): number
    toolRect(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

const SWAY_SLOW = 2.4
const SWAY_FAST = 5.3
const SWAY_FAST_SHARE = 0.35
const SWAY_EASE = 8
const RETURN_SPEED = 1.2
const FOLLOW = 14
const TILT_SPEED = 12

export function createPouring(scene: Phaser.Scene, parts: Parts): Pouring {
    const { bench, dish, mess, client, audio, focus } = parts

    let tool: Phaser.GameObjects.Image | null = null
    let object: ObjectId = 'milk'
    let target = ''
    let dishId: DishId = 'cereal'
    let homeX = 0
    let toolY = 0

    let base = 0
    let aim = 0
    let grab = 0
    let held = false
    let holder: Phaser.Input.Pointer | null = null
    let heldFor = 0
    let phase = 0
    let swayNow = 0
    let level = 0
    let spawn = 0
    let soundIn = 0
    let dripIn = 0
    let lastMiss = -9999
    let stains = 0
    let wincing = false
    let ticking = false
    let drops: Drop[] = []

    let zone: Phaser.GameObjects.Zone | null = null
    let stopHint: (() => void) | undefined
    let finger: Phaser.GameObjects.Arc | null = null
    let autoFor = -1
    let doneCb: (() => void) | undefined

    const material = () => POUR.material[object]
    const halfWidth = () => POUR.half[dishId]

    const showHint = () => {
        stopHint?.()
        if (tool) stopHint = hint(scene, tool.x, tool.y)
    }

    const clearHint = () => {
        stopHint?.()
        stopHint = undefined
    }

    const press = (pointer: Phaser.Input.Pointer) => {
        if (held) return
        held = true
        holder = pointer
        heldFor = 0
        phase = Phaser.Math.FloatBetween(0, Math.PI * 2)
        grab = base - pointer.x
        aim = base
        clearHint()
    }

    const release = (pointer?: Phaser.Input.Pointer) => {
        if (!held || (pointer && pointer !== holder)) return
        held = false
        holder = null
        if (zone) showHint()
    }

    const onUp = (pointer: Phaser.Input.Pointer) => release(pointer)

    const removeDrop = (drop: Drop) => {
        drop.image.destroy()
    }

    const spawnDrop = (x: number, y: number) => {
        const { color, size } = material()
        const image = scene.add
            .image(x, y, DOT)
            .setDepth(DEPTH.fx)
            .setTint(color)
            .setScale((size / 28) * Phaser.Math.FloatBetween(0.8, 1.1))
        drops.push({
            image,
            vx: Phaser.Math.Between(-POUR.spread, POUR.spread),
            vy: POUR.dropSpeed,
            floor: COUNTER.top + Phaser.Math.Between(POUR.floorNear, POUR.floorFar),
            falling: false,
        })
    }

    const land = (drop: Drop) => {
        const { color, size, solid } = material()
        if (stains < POUR.maxStains) {
            stains += 1
            if (solid) mess.crumb(drop.image.x, drop.floor, color, size)
            else mess.splat(drop.image.x, drop.floor, color, Phaser.Math.FloatBetween(0.14, 0.24))
        }
    }

    const moveDrops = (dt: number, now: number) => {
        const mouth = dish.mouth()
        drops = drops.filter(drop => {
            drop.vy += POUR.gravity * dt
            drop.image.x += drop.vx * dt
            drop.image.y += drop.vy * dt
            if (!drop.falling && drop.image.y >= mouth.y) {
                if (Math.abs(drop.image.x - mouth.x) <= halfWidth()) {
                    level = Math.min(1, level + 1 / material().drops)
                    dish.fill(target, level)
                    removeDrop(drop)
                    return false
                }
                drop.falling = true
                lastMiss = now
            }
            if (drop.falling && drop.image.y >= drop.floor) {
                land(drop)
                if (dripIn <= 0) {
                    audio.drip()
                    dripIn = POUR.dripEvery
                }
                removeDrop(drop)
                return false
            }
            return true
        })
    }

    const tick = (_time: number, delta: number) => {
        if (!tool) return
        const dt = Math.min(delta, 50) / 1000
        const now = scene.time.now
        soundIn -= delta
        dripIn -= delta
        spawn -= delta

        if (held && zone && holder) {
            if (!holder.isDown) release()
            else aim = Phaser.Math.Clamp(holder.x + grab, homeX - POUR.reachLeft, homeX + POUR.reachRight)
        }

        if (held) heldFor += dt
        const ramp = held ? Math.min(1, heldFor / POUR.rampTime) : 0
        const amp = POUR.swayShare * halfWidth() * ramp
        const sway = amp * (Math.sin(phase + heldFor * SWAY_SLOW) + SWAY_FAST_SHARE * Math.sin(phase + heldFor * SWAY_FAST))
        swayNow += (sway - swayNow) * (1 - Math.exp(-dt * SWAY_EASE))
        if (!held && autoFor < 0) aim += (homeX - aim) * (1 - Math.exp(-dt * RETURN_SPEED))

        if (autoFor >= 0) {
            autoFor += dt
            aim = autoFor < POUR.demoFree ? homeX : homeX - swayNow
            if (finger) finger.setPosition(base, toolY + POUR.fingerDY)
            if (autoFor >= POUR.demoMin && level >= POUR.demoUntil) {
                autoFor = -1
                held = false
                finger?.destroy()
                finger = null
                const cb = doneCb
                doneCb = undefined
                cb?.()
            }
        }

        base += (aim - base) * (1 - Math.exp(-dt * FOLLOW))
        const x = base + swayNow
        tool.setPosition(x, toolY + (held ? Math.sin(heldFor * 9) * 3 : 0))

        const goal = held ? POUR.tiltOn + Math.sin(heldFor * 5) * POUR.tiltWobble : POUR.tiltOff
        tool.setAngle(tool.angle + (goal - tool.angle) * (1 - Math.exp(-dt * TILT_SPEED)))

        const radians = Phaser.Math.DegToRad(tool.angle)
        const noseX = x + Math.sin(radians) * POUR.nose
        const noseY = tool.y - Math.cos(radians) * POUR.nose
        const flowing = held && tool.angle < POUR.flowFrom && level < 1

        if (flowing) {
            if (spawn <= 0) {
                spawnDrop(noseX, noseY)
                spawn = material().every
            }
            if (soundIn <= 0) {
                audio.pour(object)
                soundIn = POUR.soundEvery
            }
        }

        moveDrops(dt, now)
        focus.follow((DISH.x + noseX) / 2)

        const wince = now - lastMiss < POUR.wince
        if (wince !== wincing) {
            wincing = wince
            client.pose(wince ? 'yuck' : 'wait')
        }

        if (level >= 1 && autoFor < 0 && zone && drops.length === 0) {
            const cb = doneCb
            doneCb = undefined
            closeZone()
            cb?.()
        }
    }

    const closeZone = () => {
        clearHint()
        held = false
        holder = null
        if (zone) {
            zone.destroy()
            zone = null
        }
        scene.input.off('pointerup', onUp)
        scene.input.off('pointerupoutside', onUp)
    }

    const stopTick = () => {
        if (!ticking) return
        ticking = false
        scene.events.off('update', tick)
    }

    const pouring: Pouring = {
        async start(id, frame, nextDish) {
            object = id
            target = frame
            dishId = nextDish
            level = 0
            stains = 0
            held = false
            heldFor = 0
            swayNow = 0
            lastMiss = -9999
            wincing = false
            const mouth = dish.mouth()
            homeX = mouth.x + POUR.startX
            toolY = mouth.y + POUR.startY[nextDish]
            base = homeX
            aim = homeX
            tool = bench.take(id, true)
            audio.whoosh()
            await FX.arcTo(scene, tool, { x: homeX, y: toolY }, { height: 70, duration: TIMING.fly })
            if (!tool) return
            await FX.to(scene, tool, { angle: POUR.tiltOff }, { duration: 170, ease: 'Back.easeOut' })
            if (!tool) return
            ticking = true
            scene.events.on('update', tick)
        },
        demo() {
            return new Promise(resolve => {
                doneCb = resolve
                held = true
                heldFor = 0
                phase = 0
                autoFor = 0
                finger = fingerDot(scene, base, toolY + POUR.fingerDY)
            })
        },
        play() {
            if (level >= 1) return Promise.resolve()
            return new Promise(resolve => {
                doneCb = resolve
                zone = scene.add
                    .zone(W / 2, H / 2, W, H)
                    .setDepth(DEPTH.zones)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', press)
                scene.input.on('pointerup', onUp)
                scene.input.on('pointerupoutside', onUp)
                showHint()
            })
        },
        async finish(frame) {
            stopTick()
            client.pose('wait')
            await FX.wait(scene, 180)
            audio.place()
            await dish.swap(frame)
            if (!tool) return
            const home = bench.pos(object)
            const flying = tool
            tool = null
            await FX.to(scene, flying, { angle: 0 }, { duration: 120 })
            await FX.arcTo(scene, flying, home, { height: 50, duration: 380 })
            flying.destroy()
            bench.show(object)
        },
        level: () => level,
        toolRect: () => ({ x: DISH.x + POUR.startX / 2, y: toolY + POUR.spotDY, w: POUR.spotW, h: POUR.spotH }),
        destroy() {
            stopTick()
            closeZone()
            drops.forEach(removeDrop)
            drops = []
            finger?.destroy()
            finger = null
            if (tool) {
                FX.kill(scene, tool)
                tool.destroy()
                tool = null
            }
        },
    }
    return pouring
}
