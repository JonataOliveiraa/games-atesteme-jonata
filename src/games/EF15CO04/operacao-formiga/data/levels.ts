import type { LevelDef, Poly } from '../types'
import { applyCut, blows, cutAll, fits } from './cutting'
import { CAP, FRUITS, WIND_MIN, fruitArea, fruitPoly, radiusOf } from './fruits'
import { area, isConvex } from './geometry'
import { ANT, MAP, WALL } from './layout'

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
            fruit: 'morango',
            wind: false,
            teach: 'all',
            demo: [
                { from: { x: -50, y: -270 }, to: { x: -50, y: 270 } },
                { from: { x: 50, y: -270 }, to: { x: 50, y: 270 } },
            ],
        },
        { id: 'laranja', fruit: 'laranja', wind: false, teach: 'cut' },
        { id: 'maca', fruit: 'maca', wind: true, teach: 'wind' },
    ],
}

export const LEVELS: LevelDef[] = [N1]

/** O menor número de pedaços que passa na fresta. */
export const need = (whole: number) => Math.ceil(whole / CAP)

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const needs: number[] = []
        let prev = ''
        level.phases.forEach((phase, pi) => {
            const tag = `N${level.level} ${phase.id}`
            const def = FRUITS[phase.fruit]
            const poly = fruitPoly(def)
            if (!isConvex(poly)) problems.push(`${tag}: a silhueta não é convexa`)
            const whole = fruitArea(phase.fruit)
            const ratio = CAP / whole
            if (ratio < 0.25 || ratio > 0.45) problems.push(`${tag}: fresta ÷ fruta = ${ratio.toFixed(2)}, fora de 0,25–0,45`)
            const n = need(whole)
            if (n < 2 || n > 5) problems.push(`${tag}: pede ${n} pedaços`)
            needs.push(n)
            if (phase.fruit === prev) problems.push(`${tag}: a mesma fruta da fase anterior`)
            prev = phase.fruit
            if (pi === 0 && phase.wind) problems.push(`${tag}: a 1ª fase não tem vento`)
            if (phase.wind) {
                const before = level.phases.slice(0, pi).some(p => p.wind)
                if (!before && phase.teach !== 'wind') problems.push(`${tag}: o vento estreia sem demonstração`)
                if (whole / n < whole * WIND_MIN * 1.5) problems.push(`${tag}: a divisão justa fica perto demais do vento`)
            }
            if (phase.teach === 'all' && !phase.demo?.length) problems.push(`${tag}: ensina sem os cortes da demonstração`)
            if (phase.demo) {
                let pieces: Poly[] = [poly]
                phase.demo.forEach(s => {
                    const r = cutAll(pieces, s.from, s.to, whole)
                    if (r.kind !== 'cut') problems.push(`${tag}: um corte da demonstração não corta (${r.kind})`)
                    pieces = applyCut(pieces, r)
                })
                if (pieces.length !== n) problems.push(`${tag}: a demonstração dá ${pieces.length} pedaços, e não ${n}`)
                pieces.forEach((p, i) => {
                    const a = area(p)
                    if (!fits(a)) problems.push(`${tag}: o pedaço ${i + 1} da demonstração entala`)
                    if (phase.wind && blows(a, whole)) problems.push(`${tag}: o pedaço ${i + 1} da demonstração voa`)
                })
            }
        })
        if (level.level === 1 && needs.length > 1 && needs[0] === needs[1]) problems.push('N1: as fases 1 e 2 pedem o mesmo número de pedaços')
    })
    const opening = WALL.gapBottom - WALL.gapTop
    if (opening < ANT.r * 2 + 20) problems.push(`a fresta (${opening}) é estreita demais para a formiga`)
    if (opening < radiusOf(CAP) * 2 * MAP.scale) problems.push('a fresta é menor que o círculo do medidor')
    if (problems.length) throw new Error(`Operação Formiga — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
