import type { Cloud, Course, CourseDef, Platform, Range } from '../types'
import { COLUMN } from './layout'
import { CHECK, CLOUD, PHONE, PHYS, SUMMIT, speedFor } from './physics'

const EDGE = 12

function random(seed: number) {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function buildCourse(def: CourseDef): Course {
    const rand = random(def.seed)
    const between = (r: Range) => r.min + (r.max - r.min) * rand()
    const platforms: Platform[] = []
    const clouds: Cloud[] = []
    const add = (p: Omit<Platform, 'id'>) => {
        const full = { ...p, id: platforms.length }
        platforms.push(full)
        return full
    }

    add({ kind: 'chao', x: COLUMN.x, y: 0, w: COLUMN.w })
    let y = 0
    let x: number = COLUMN.x
    let count = 0

    def.sections.forEach((size, item) => {
        for (let k = 0; k < size; k++) {
            const afterCloud = item > 0 && k === 0
            const w = Math.round(between(def.width))
            const moving = def.move && !afterCloud && ++count % def.move.every === 0
            const room = moving && def.move ? def.move.range : 0
            const lo = COLUMN.left + w / 2 + EDGE + room
            const hi = COLUMN.right - w / 2 - EDGE - room
            if (!afterCloud) {
                y -= Math.round(between(def.step))
                let dx = (def.shift * 0.35 + rand() * def.shift * 0.65) * (rand() < 0.5 ? -1 : 1)
                if (x + dx < lo || x + dx > hi) dx = -dx
                x += dx
            }
            x = clamp(x, lo, hi)
            add({
                kind: 'aba',
                x: Math.round(x),
                y,
                w,
                move: moving && def.move ? { range: def.move.range, period: def.move.period, phase: rand() * Math.PI * 2 } : undefined,
            })
        }
        y -= Math.round(between(def.step))
        x = clamp((x + COLUMN.x) / 2, COLUMN.left + CHECK.w / 2 + EDGE, COLUMN.right - CHECK.w / 2 - EDGE)
        add({ kind: 'parada', x: Math.round(x), y, w: CHECK.w, item })
        const bottom = y - CLOUD.gap
        const top = bottom - CLOUD.thick
        clouds.push({ item, bottom, top })
        y = top - CLOUD.above
    })

    const summit = add({ kind: 'topo', x: COLUMN.x, y, w: SUMMIT.w })
    return { platforms, clouds, summit }
}

export function reach(rise: number, height: number = PHYS.jump) {
    const v = speedFor(height)
    const disc = v * v - 2 * PHYS.gravity * rise
    if (disc < 0) return 0
    const t = (v + Math.sqrt(disc)) / PHYS.gravity
    return PHYS.run * t * 0.75
}

export function checkCourse(course: Course, def: CourseDef): string[] {
    const problems: string[] = []
    const list = course.platforms
    if (CLOUD.gap >= PHYS.jump + PHONE.h) problems.push('a nuvem está alta demais: o pulo não bate nela')
    if (CLOUD.gap <= PHYS.jump - PHONE.h) problems.push('a nuvem está baixa demais')
    if (def.step.max > PHYS.jump - 60) problems.push(`degrau de ${def.step.max} px para um pulo de ${PHYS.jump}`)
    for (let i = 1; i < list.length; i++) {
        const a = list[i - 1]
        const b = list[i]
        const rise = a.y - b.y
        const afterCloud = a.kind === 'parada'
        const height = afterCloud ? PHYS.boost : PHYS.jump
        if (rise > height - 60) problems.push(`plataforma ${b.id}: ${rise} px acima da anterior`)
        const gapX = Math.max(0, Math.abs(a.x - b.x) - (a.w + b.w) / 2 + PHONE.foot * 2)
        if (gapX > reach(rise, height)) problems.push(`plataforma ${b.id}: longe demais para o lado`)
        const room = b.move?.range ?? 0
        if (b.x - b.w / 2 - room < COLUMN.left || b.x + b.w / 2 + room > COLUMN.right)
            problems.push(`plataforma ${b.id}: sai da coluna`)
    }
    return problems
}
