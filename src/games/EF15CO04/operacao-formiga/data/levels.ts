import type { CutPhase, Dirt, GiantPhase, LevelDef, Poly, Vec } from '../types'
import { applyCut, blows, cutAll, fits, hintLine, lifts } from './cutting'
import { CAP, ITEMS, LIFT, WIND_AREA, itemArea, itemPoly, radiusOf } from './fruits'
import { area, isConvex } from './geometry'
import { ANT, FRIEND, GIANT, HOLE, JOY, MAP, MOUND, WALL, WIDE, WIND } from './layout'

export const POINTS = 10

export const guideKey = (level: number) => `ef15co04-formiga-l${level}`
export const OPENING_KEY = 'ef15co04-formiga-opening'
export const GAUGE_KEY = 'ef15co04-formiga-gauge'
export const STUCK_KEY = 'ef15co04-formiga-stuck'

const N1: LevelDef = {
    level: 1,
    title: 'Cortar no tamanho certo',
    message: 'A fruta não passava inteira: você dividiu em pedaços, levou um de cada vez e a rainha ganhou a fruta inteira de novo.',
    phases: [
        {
            id: 'morango',
            type: 'cut',
            item: 'morango',
            wind: false,
            lift: false,
            teach: 'all',
            demo: [
                { from: { x: -50, y: -270 }, to: { x: -50, y: 270 } },
                { from: { x: 50, y: -270 }, to: { x: 50, y: 270 } },
            ],
        },
        { id: 'laranja', type: 'cut', item: 'laranja', wind: false, lift: false, teach: 'cut' },
        { id: 'maca', type: 'cut', item: 'maca', wind: true, lift: false, teach: 'wind' },
    ],
}

const N2: LevelDef = {
    level: 2,
    title: 'Corta de novo',
    message: 'A folha era grande demais: você cortou em partes, cortou cada parte de novo e a rainha ganhou a folha inteira.',
    phases: [
        {
            id: 'folha',
            type: 'cut',
            item: 'folha',
            wind: true,
            lift: true,
            teach: 'leaf',
            demo: [
                { from: { x: -120, y: -300 }, to: { x: -120, y: 300 } },
                { from: { x: 100, y: -300 }, to: { x: 100, y: 300 } },
            ],
        },
        { id: 'folha-grande', type: 'cut', item: 'folhaGrande', wind: true, lift: true },
    ],
}

const dirt = (kind: Dirt['kind'], x: number, y: number, angle = 0): Dirt => ({ kind, x, y, angle })

const N3: LevelDef = {
    level: 3,
    title: 'Partes diferentes',
    message: 'A folha gigante pedia tarefas diferentes: limpar, chamar as amigas e levar juntas. Você fez cada parte e juntou tudo.',
    phases: [
        {
            id: 'gigante',
            type: 'giant',
            teach: 'giant',
            dirt: [
                dirt('drop', -250, -70),
                dirt('soil', -110, 120),
                dirt('twig', 40, -130, 30),
                dirt('petal', 190, 70, -20),
                dirt('drop', 40, 60),
            ],
            friends: [
                { x: 560, y: 220 },
                { x: 560, y: 620 },
            ],
        },
        {
            id: 'gigante-suja',
            type: 'giant',
            dirt: [
                dirt('soil', -300, -40),
                dirt('drop', -200, 120),
                dirt('petal', -150, -150, 25),
                dirt('twig', -40, 30, -35),
                dirt('drop', 50, -170),
                dirt('soil', 110, 150),
                dirt('petal', 190, -40, -15),
                dirt('twig', 300, 70, 50),
                dirt('drop', 330, -60),
            ],
            friends: [
                { x: 110, y: 200 },
                { x: 560, y: 620 },
                { x: 990, y: 360 },
            ],
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

/** O menor número de pedaços que passa na fresta. */
export const need = (whole: number) => Math.ceil(whole / CAP)

function cutDemo(poly: Poly, phase: CutPhase, whole: number, tag: string, problems: string[]): Poly[] {
    let pieces: Poly[] = [poly]
    phase.demo?.forEach(s => {
        const r = cutAll(pieces, s.from, s.to, whole)
        if (r.kind !== 'cut') problems.push(`${tag}: um corte da demonstração não corta (${r.kind})`)
        pieces = applyCut(pieces, r)
    })
    return pieces
}

function validateCut(level: LevelDef, phase: CutPhase, pi: number, prev: string, problems: string[]) {
    const tag = `N${level.level} ${phase.id}`
    const def = ITEMS[phase.item]
    const poly = itemPoly(def)
    if (!isConvex(poly)) problems.push(`${tag}: a silhueta não é convexa`)
    const whole = itemArea(phase.item)
    const n = need(whole)
    if (phase.item === prev) problems.push(`${tag}: o mesmo item da fase anterior`)
    if (pi === 0 && phase.wind && level.level === 1) problems.push(`${tag}: a 1ª fase não tem vento`)
    if (phase.wind) {
        const before = LEVELS.slice(0, level.level - 1).some(l => l.phases.some(p => p.type === 'cut' && p.wind))
        const earlier = level.phases.slice(0, pi).some(p => p.type === 'cut' && p.wind)
        if (!before && !earlier && phase.teach !== 'wind') problems.push(`${tag}: o vento estreia sem demonstração`)
        if (whole / n < WIND_AREA * 1.5) problems.push(`${tag}: a divisão justa fica perto demais do vento`)
    }
    if ((phase.teach === 'all' || phase.teach === 'leaf') && !phase.demo?.length) problems.push(`${tag}: ensina sem os cortes da demonstração`)

    if (!phase.lift) {
        const ratio = CAP / whole
        if (ratio < 0.25 || ratio > 0.45) problems.push(`${tag}: fresta ÷ fruta = ${ratio.toFixed(2)}, fora de 0,25–0,45`)
        if (n < 2 || n > 5) problems.push(`${tag}: pede ${n} pedaços`)
        if (phase.demo) {
            const pieces = cutDemo(poly, phase, whole, tag, problems)
            if (pieces.length !== n) problems.push(`${tag}: a demonstração dá ${pieces.length} pedaços, e não ${n}`)
            pieces.forEach((p, i) => {
                const a = area(p)
                if (!fits(a)) problems.push(`${tag}: o pedaço ${i + 1} da demonstração entala`)
                if (phase.wind && blows(a)) problems.push(`${tag}: o pedaço ${i + 1} da demonstração voa`)
            })
        }
        return n
    }

    const part = (k: number) => whole / k
    if (lifts(part(2))) problems.push(`${tag}: a metade levanta`)
    if (blows(part(8))) problems.push(`${tag}: o oitavo voa`)
    if (pi === 0) {
        if (part(3) * 1.1 > LIFT) problems.push(`${tag}: o terço não levanta com folga de 10 %`)
        if (fits(part(3))) problems.push(`${tag}: o terço não entala`)
        if (part(6) * 1.05 > CAP) problems.push(`${tag}: o sexto não passa com folga de 5 %`)
    } else {
        if (lifts(part(3))) problems.push(`${tag}: o terço levanta`)
        if (part(4) * 1.1 > LIFT) problems.push(`${tag}: o quarto não levanta com folga de 10 %`)
        if (!fits(part(8))) problems.push(`${tag}: o oitavo não passa`)
    }
    if (phase.demo) {
        const pieces = cutDemo(poly, phase, whole, tag, problems)
        if (pieces.length !== 3) problems.push(`${tag}: a demonstração dá ${pieces.length} partes, e não 3`)
        pieces.forEach((p, i) => {
            const a = area(p)
            if (!lifts(a) || fits(a)) problems.push(`${tag}: a parte ${i + 1} da demonstração não levanta e entala`)
        })
        const right = pieces.reduce((best, p) => (Math.max(...p.map(v => v.x)) > Math.max(...best.map(v => v.x)) ? p : best), pieces[0])
        const h = hintLine(right)
        const r = cutAll([right], h.a, h.b, whole)
        const halves = applyCut([right], r)
        if (halves.length !== 2) problems.push(`${tag}: o corte da parte da direita não corta`)
        halves.forEach((p, i) => {
            if (!fits(area(p))) problems.push(`${tag}: a metade ${i + 1} da demonstração entala`)
            if (blows(area(p))) problems.push(`${tag}: a metade ${i + 1} da demonstração voa`)
        })
    }
    return Math.ceil(whole / CAP)
}

const inside = (p: Vec, x0: number, y0: number, x1: number, y1: number) => p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1

function validateGiant(level: LevelDef, phase: GiantPhase, problems: string[]) {
    const tag = `N${level.level} ${phase.id}`
    if (phase.friends.length < 2 || phase.friends.length > 3) problems.push(`${tag}: ${phase.friends.length} amigas, fora de 2–3`)
    if (phase.dirt.length < 4 || phase.dirt.length > 10) problems.push(`${tag}: ${phase.dirt.length} sujeiras, fora de 4–10`)
    const half = GIANT.dirtW / (GIANT.w / GIANT.leafW) / 2
    phase.dirt.forEach((d, i) => {
        const rx = GIANT.leafW / 2 - half
        const ry = GIANT.leafH / 2 - half
        if ((d.x / rx) ** 2 + (d.y / ry) ** 2 > 1) problems.push(`${tag}: a sujeira ${i + 1} sai da folha`)
    })
    const leafW = GIANT.w
    const leafH = GIANT.leafH * (GIANT.w / GIANT.leafW)
    const fw = FRIEND.w / 2
    phase.friends.forEach((f, i) => {
        const t = `${tag}: a amiga ${i + 1}`
        if (!inside(f, MAP.left + fw, MAP.top + 40, MAP.right - fw, MAP.bottom - 10)) problems.push(`${t} fica fora do jardim`)
        if (Math.abs(f.x - WALL.x) < WALL.half + fw + 10) problems.push(`${t} nasce no muro`)
        if (f.x > WIND.left - 20 && f.x < WIND.right + 20) problems.push(`${t} nasce no vento`)
        if (inside(f, GIANT.at.x - leafW / 2 - fw, GIANT.at.y - leafH / 2 - 20, GIANT.at.x + leafW / 2 + fw, GIANT.at.y + leafH / 2 + 60)) problems.push(`${t} nasce na folha`)
        if (Math.hypot(f.x - HOLE.x, f.y - HOLE.y) < HOLE.r + fw || Math.hypot(f.x - MOUND.x, f.y - MOUND.y) < MOUND.w / 2 + fw) problems.push(`${t} nasce no formigueiro`)
        if (f.x < JOY.grabMaxX && f.y > JOY.grabMinY) problems.push(`${t} nasce embaixo do joystick`)
        if (Math.hypot(f.x - ANT.start.x, f.y - ANT.start.y) < FRIEND.wake * 2) problems.push(`${t} nasce em cima da formiga`)
    })
    if (WIDE.bottom - MAP.top <= leafH + 20) problems.push(`o caminho largo (${WIDE.bottom - MAP.top}) não passa a folha gigante (${leafH} + 20)`)
}

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const needs: number[] = []
        let prev = ''
        level.phases.forEach((phase, pi) => {
            if (phase.type === 'giant') {
                validateGiant(level, phase, problems)
                return
            }
            needs.push(validateCut(level, phase, pi, prev, problems))
            prev = phase.item
        })
        if (level.level === 1 && needs.length > 1 && needs[0] === needs[1]) problems.push('N1: as fases 1 e 2 pedem o mesmo número de pedaços')
        if (level.level === 2 && needs.length > 1 && needs[1] <= needs[0]) problems.push('N2: a fase 2 não pede mais pedaços que a fase 1')
    })
    const opening = WALL.gapBottom - WALL.gapTop
    if (opening < ANT.r * 2 + 20) problems.push(`a fresta (${opening}) é estreita demais para a formiga`)
    if (opening < radiusOf(CAP) * 2 * MAP.scale) problems.push('a fresta é menor que o círculo do medidor')
    if (problems.length) throw new Error(`Operação Formiga — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
