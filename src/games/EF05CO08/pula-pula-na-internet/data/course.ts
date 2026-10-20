import type { Course, CourseDef, Platform, Range } from '../types'
import { COLUMN } from './layout'
import { CHECK, EARTH, PHONE, PHYS, SUMMIT, feelAt, speedFor, type Feel } from './physics'

const EDGE = 12
const CENTER_JITTER = 50
const BRANCH_GAP = 30

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

const span = (w: number, room = 0) => ({
    lo: COLUMN.left + w / 2 + EDGE + room,
    hi: COLUMN.right - w / 2 - EDGE - room,
})

export function altAt(course: Pick<Course, 'knots'>, y: number) {
    const k = course.knots
    if (y >= k[0].y) {
        const slope = (k[1].a - k[0].a) / (k[1].y - k[0].y)
        return k[0].a + (y - k[0].y) * slope
    }
    for (let i = 1; i < k.length; i++) {
        if (y >= k[i].y) {
            const t = (y - k[i - 1].y) / (k[i].y - k[i - 1].y)
            return k[i - 1].a + (k[i].a - k[i - 1].a) * t
        }
    }
    return k[k.length - 1].a
}

export interface Start {
    y: number
    w: number
}

export const FRESH: Start = { y: 0, w: COLUMN.w }

export function buildCourse(def: CourseDef, altitude: number, start: Start = FRESH): Course {
    const rand = random(def.seed)
    const between = (r: Range) => r.min + (r.max - r.min) * rand()
    const platforms: Platform[] = []
    const links: [number, number][] = []
    const n = def.sections.length
    const add = (p: Omit<Platform, 'id'>) => {
        const full = { ...p, id: platforms.length }
        platforms.push(full)
        return full
    }
    const scaleAt = (alt: number) => feelAt(alt - 0.04).jump / EARTH.jump

    let prev = add({ kind: 'chao', x: COLUMN.x, y: 0, w: start.w, alt: altitude })
    let count = 0

    const main = (alt: number, opts: { center?: boolean; still?: boolean } = {}) => {
        const scale = scaleAt(alt)
        const w = Math.round(between(def.width))
        const moving = !!def.move && !opts.still && !opts.center && ++count % def.move.every === 0
        const room = moving && def.move ? def.move.range : 0
        const { lo, hi } = span(w, room)
        const y = prev.y - Math.round(between(def.step) * scale)
        let x: number
        if (opts.center) {
            x = COLUMN.x + (rand() * 2 - 1) * CENTER_JITTER
        } else {
            const shift = def.shift * Math.min(1.15, scale)
            let dx = (shift * 0.35 + rand() * shift * 0.65) * (rand() < 0.5 ? -1 : 1)
            if (prev.x + dx < lo || prev.x + dx > hi) dx = -dx
            x = prev.x + dx
        }
        const p = add({
            kind: 'aba',
            x: Math.round(clamp(x, lo, hi)),
            y,
            w,
            alt,
            move: moving && def.move ? { range: def.move.range, period: def.move.period, phase: rand() * Math.PI * 2 } : undefined,
        })
        links.push([prev.id, p.id])
        prev = p
        return p
    }

    const knots = [{ y: 0, a: altitude }]

    def.sections.forEach((size, item) => {
        for (let k = 0; k < size; k++) {
            const alt = altitude + (item + (k + 1) / (size + 2)) / n
            main(alt, { center: k === size - 1, still: k === 0 && item > 0 })
        }
        const fork = prev
        const alt = altitude + (item + 1) / n
        const scale = scaleAt(alt)
        const side = rand() < 0.5 ? -1 : 1
        const y = fork.y - Math.round(between(def.step) * scale)
        const checkSpan = span(CHECK.w)
        const gx = clamp(fork.x + side * (def.shift + 40), checkSpan.lo, checkSpan.hi)
        const check = add({ kind: 'parada', x: Math.round(gx), y, w: CHECK.w, alt, item })
        const bw = Math.round(between(def.width))
        const bypassSpan = span(bw)
        let bx = clamp(fork.x - side * (def.shift * 0.75), bypassSpan.lo, bypassSpan.hi)
        const need = (CHECK.w + bw) / 2 + BRANCH_GAP
        if (Math.abs(bx - gx) < need) bx = clamp(gx - side * need, bypassSpan.lo, bypassSpan.hi)
        const bypass = add({ kind: 'aba', x: Math.round(bx), y, w: bw, alt })
        links.push([fork.id, check.id], [fork.id, bypass.id], [bypass.id, check.id])
        knots.push({ y, a: alt })
        prev = check
        const join = main(alt + 0.02 / n, { center: true })
        links.push([bypass.id, join.id])
    })

    for (let k = 0; k < def.finish; k++) main(altitude + 1, { still: k === def.finish - 1 })
    const summit = add({
        kind: 'topo',
        x: COLUMN.x,
        y: prev.y - Math.round(between(def.step) * scaleAt(altitude + 1)),
        w: SUMMIT.w,
        alt: altitude + 1,
    })
    links.push([prev.id, summit.id])

    platforms.forEach(p => (p.y += start.y))
    knots.forEach(k => (k.y += start.y))
    const course: Course = { platforms, links, knots, summit }
    platforms.forEach(p => (p.alt = altAt(course, p.y)))
    return course
}

export function reach(rise: number, feel: Feel) {
    const v = speedFor(feel)
    const disc = v * v - 2 * feel.gravity * rise
    if (disc < 0) return 0
    const t = (v + Math.sqrt(disc)) / feel.gravity
    return PHYS.run * t * 0.75
}

export function checkCourse(course: Course): string[] {
    const problems: string[] = []
    const list = course.platforms
    course.links.forEach(([from, to]) => {
        const a = list[from]
        const b = list[to]
        const feel = feelAt(a.alt)
        const rise = a.y - b.y
        if (rise > feel.jump - 60) problems.push(`plataforma ${b.id}: ${rise} px acima da ${a.id}, pulo de ${Math.round(feel.jump)}`)
        const slack = (a.move?.range ?? 0) + (b.move?.range ?? 0)
        const gapX = Math.max(0, Math.abs(a.x - b.x) + slack - (a.w + b.w) / 2 + PHONE.foot * 2)
        if (gapX > reach(rise, feel)) problems.push(`plataforma ${b.id}: longe demais para o lado da ${a.id}`)
    })
    list.forEach(p => {
        const room = p.move?.range ?? 0
        if (p.x - p.w / 2 - room < COLUMN.left || p.x + p.w / 2 + room > COLUMN.right) problems.push(`plataforma ${p.id}: sai da coluna`)
    })
    list.forEach(p => {
        if (p.kind !== 'parada') return
        const twin = list.find(o => o !== p && o.kind === 'aba' && Math.abs(o.y - p.y) < 60 && Math.abs(o.x - p.x) < (o.w + p.w) / 2 + BRANCH_GAP - 1)
        if (twin) problems.push(`parada ${p.id}: encostada na aba ${twin.id}`)
    })
    return problems
}
