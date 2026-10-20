import { BALL, CLOUD, PHYS, PLATFORM, SPRING } from '../data/layout'
import { platformBottom, platformTop, type World } from './world'

export type BallEvent =
    | { type: 'none' }
    | { type: 'bounce' }
    | { type: 'spring'; spring: number }
    | { type: 'tunnel'; tunnel: number }
    | { type: 'device'; device: number }
    | { type: 'cloud'; cloud: number }
    | { type: 'miss' }

export interface BallState {
    x: number
    y: number
    vx: number
    vy: number
    spin: number
    /** onde está rolando: o chão, uma tábua (índice) ou nada (voando) */
    on: 'air' | 'ground' | number
}

export function launch(x: number, y: number, vx: number, vy: number): BallState {
    return { x, y, vx, vy, spin: 0, on: 'air' }
}

const NONE: BallEvent = { type: 'none' }

/** pousou numa superfície: quica se veio rápido, senão passa a rolar nela */
function land(b: BallState, surface: number, on: 'ground' | number): BallEvent {
    b.y = surface - BALL.r
    if (b.vy > PHYS.bounceMin) {
        b.vy = -b.vy * PHYS.bounce
        b.vx *= PHYS.landKeep
        return { type: 'bounce' }
    }
    b.vy = 0
    b.on = on
    return { type: 'bounce' }
}

/** um passo de física; as nuvens são passadas à parte porque elas andam */
export function step(b: BallState, dt: number, world: World, clouds: Array<{ x: number; y: number }>): BallEvent {
    const r = BALL.r
    const map = world.map
    const cloud = clouds.findIndex(c => Math.hypot(b.x - c.x, b.y - c.y) < CLOUD.r + r * 0.4)
    if (cloud >= 0) return { type: 'cloud', cloud }

    const fromX = b.x
    const fromY = b.y

    if (b.on === 'air') {
        b.vy += PHYS.gravity * dt
        b.x += b.vx * dt
        b.y += b.vy * dt
        b.spin += b.vx * dt * 0.02
    } else {
        const s = b.on === 'ground' ? world.slopeAt(b.x) : 0
        b.vx += ((PHYS.gravity * s) / (1 + s * s)) * dt
        b.vx *= Math.max(0, 1 - PHYS.rollDrag * dt)
        b.x += b.vx * dt
        b.spin += (b.vx * dt) / r
    }

    if (b.x < r) {
        b.x = r
        b.vx = Math.abs(b.vx) * 0.5
    }
    if (b.x > map.width - r) {
        b.x = map.width - r
        b.vx = -Math.abs(b.vx) * 0.5
    }
    if (b.y > 780) return { type: 'miss' }

    for (let i = 0; i < map.devices.length; i++) {
        const box = world.deviceBox(i)
        const nx = Math.max(box.x - box.w / 2, Math.min(b.x, box.x + box.w / 2))
        const ny = Math.max(box.y - box.h / 2, Math.min(b.y, box.y + box.h / 2))
        if (Math.hypot(b.x - nx, b.y - ny) < r) return { type: 'device', device: i }
    }

    for (let i = 0; i < map.platforms.length; i++) {
        const p = map.platforms[i]
        const left = p.x - p.w / 2
        const right = p.x + p.w / 2
        const top = platformTop(p)
        const bottom = platformBottom(p)
        if (b.on === i) {
            if (b.x < left || b.x > right) {
                b.on = 'air'
                b.vy = 0
                return NONE
            }
            if (Math.abs(b.vx) < PLATFORM.slide) b.vx = (b.x < p.x ? -1 : 1) * PLATFORM.slide
            b.y = top - r
            continue
        }
        const inside = b.x > left - r * 0.5 && b.x < right + r * 0.5
        if (inside && fromY + r <= top + 1 && b.y + r >= top) return land(b, top, i)
        if (inside && fromY - r >= bottom - 1 && b.y - r <= bottom) {
            b.y = bottom + r
            b.vy = Math.abs(b.vy) * 0.3
            return { type: 'bounce' }
        }
        const level = b.y + r > top && b.y - r < bottom
        if (level && ((fromX + r <= left && b.x + r > left) || (fromX - r >= right && b.x - r < right))) {
            b.x = fromX
            b.vx = -b.vx * 0.4
            return { type: 'bounce' }
        }
    }
    if (typeof b.on === 'number') return NONE

    const tunnel = world.tunnelAt(b.x)
    if (tunnel !== null && b.y + r * 0.4 >= world.tunnelTop(tunnel)) return { type: 'tunnel', tunnel }
    if (tunnel !== null && b.on === 'ground') {
        b.on = 'air'
        b.vy = 0
        return NONE
    }

    const ground = world.groundAt(b.x)
    if (ground === null) return NONE
    if (b.on === 'ground') {
        b.y = ground - r
        if (Math.abs(b.vx) < PHYS.stopSpeed && Math.abs(world.slopeAt(b.x)) < 0.08) return { type: 'miss' }
        return NONE
    }
    const spring = world.springAt(b.x)
    if (spring !== null && b.vy > 0 && b.y + r >= ground - SPRING.h) {
        b.y = ground - SPRING.h - r
        b.vy = -SPRING.kick
        return { type: 'spring', spring }
    }
    if (b.y + r < ground) return NONE

    const before = world.groundAt(fromX)
    if (before !== null && fromY + r <= before + 2 && fromY + r > ground + 10) {
        b.x = fromX
        b.vx = -b.vx * 0.4
        return { type: 'bounce' }
    }

    return land(b, ground, 'ground')
}

/**
 * A mira: o voo inteiro até o primeiro toque (chão, tábua, mola, buraco ou nuvem), com a mesma física
 * do arquivo de verdade. O último ponto é onde ele aterrissa.
 */
export function preview(world: World, x: number, y: number, vx: number, vy: number, clouds: Array<{ x: number; y: number }> = []) {
    const dots: Array<{ x: number; y: number }> = []
    const b = launch(x, y, vx, vy)
    const dt = 1 / 180
    const every = Math.round(PHYS.previewDt / dt)
    for (let i = 1; i < PHYS.previewMax / dt; i++) {
        const event = step(b, dt, world, clouds)
        if (event.type !== 'none' || b.on !== 'air') {
            dots.push({ x: b.x, y: b.y })
            break
        }
        if (i % every === 0) dots.push({ x: b.x, y: b.y })
    }
    return dots
}
