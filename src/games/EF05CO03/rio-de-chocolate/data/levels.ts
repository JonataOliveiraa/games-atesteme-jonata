import type { Attr, Color, LevelDef, PhaseDef, Shape, Size, Sweet, Top } from '../types'
import { has, holds } from './logic'

export const POINTS = 10

export const guideKey = (level: number) => `ef05co03-rio-l${level}`

const sw = (color: Color, shape: Shape, top: Top, size: Size): Sweet => ({ color, shape, top, size })

const N1: LevelDef = {
    level: 1,
    title: 'O NÃO troca a resposta',
    message: 'A placa é uma frase: cada doce a deixa verdadeira ou falsa. E o NÃO troca a resposta: o verdadeiro vira falso, e o falso vira verdadeiro.',
    phases: [
        {
            id: 'granulado',
            teach: 'rule',
            rule: { left: { not: false, term: { attr: 'top', value: 'granulado' } } },
            columns: [
                [sw('rosa', 'redondo', 'liso', 'grande'), sw('verde', 'redondo', 'granulado', 'grande'), sw('marrom', 'redondo', 'listrado', 'grande')],
                [sw('marrom', 'redondo', 'granulado', 'grande'), sw('verde', 'redondo', 'listrado', 'grande'), sw('rosa', 'redondo', 'granulado', 'grande')],
                [sw('rosa', 'redondo', 'listrado', 'grande'), sw('marrom', 'redondo', 'liso', 'grande'), sw('verde', 'redondo', 'granulado', 'grande')],
            ],
        },
        {
            id: 'nao-rosa',
            teach: 'not',
            rule: { left: { not: true, term: { attr: 'color', value: 'rosa' } } },
            columns: [
                [sw('rosa', 'redondo', 'liso', 'grande'), sw('verde', 'quadrado', 'liso', 'grande'), sw('rosa', 'quadrado', 'liso', 'grande')],
                [sw('marrom', 'quadrado', 'liso', 'grande'), sw('rosa', 'redondo', 'liso', 'grande'), sw('verde', 'redondo', 'liso', 'grande')],
                [sw('marrom', 'redondo', 'liso', 'grande'), sw('rosa', 'quadrado', 'liso', 'grande'), sw('rosa', 'redondo', 'liso', 'grande')],
            ],
        },
        {
            id: 'nao-grande',
            rule: { left: { not: true, term: { attr: 'size', value: 'grande' } } },
            columns: [
                [sw('verde', 'redondo', 'granulado', 'grande'), sw('rosa', 'redondo', 'granulado', 'pequeno'), sw('marrom', 'redondo', 'granulado', 'grande')],
                [sw('marrom', 'redondo', 'granulado', 'pequeno'), sw('rosa', 'redondo', 'granulado', 'grande'), sw('verde', 'redondo', 'granulado', 'pequeno')],
                [sw('verde', 'redondo', 'granulado', 'pequeno'), sw('marrom', 'redondo', 'granulado', 'grande'), sw('rosa', 'redondo', 'granulado', 'grande')],
            ],
        },
    ],
}

export const LEVELS: LevelDef[] = [N1]

const ATTRS: Attr[] = ['color', 'shape', 'top', 'size']

const key = (s: Sweet) => ATTRS.map(a => s[a]).join('|')

export const trueLanes = (phase: PhaseDef, column: Sweet[]) =>
    column.map((s, i) => (holds(phase.rule, s) ? i : -1)).filter(i => i >= 0)

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        level.phases.forEach((phase, pi) => {
            const tag = `N${level.level} ${phase.id}`
            const all = phase.columns.flat()
            const varying = ATTRS.filter(a => new Set(all.map(s => s[a])).size > 1)
            const ruleAttr = phase.rule.left.term.attr
            if (level.level === 1) {
                if (phase.rule.op) problems.push(`${tag}: o N1 só tem frase de um termo`)
                if (pi === 0 && phase.rule.left.not) problems.push(`${tag}: a 1ª fase do N1 não tem NÃO`)
                if (pi > 0 && !phase.rule.left.not) problems.push(`${tag}: as fases 2 e 3 do N1 têm NÃO`)
                if (varying.length !== 2) problems.push(`${tag}: mudam ${varying.length} atributos, e não 2`)
            }
            if (!varying.includes(ruleAttr)) problems.push(`${tag}: o atributo da placa não muda`)
            if (phase.columns.length < 3) problems.push(`${tag}: poucas fileiras`)
            const counts: number[] = []
            let prevLanes = ''
            phase.columns.forEach((column, ci) => {
                const ctag = `${tag} fileira ${ci + 1}`
                if (column.length !== 3) problems.push(`${ctag}: não tem 3 doces`)
                if (new Set(column.map(key)).size !== column.length) problems.push(`${ctag}: doce repetido`)
                const lanes = trueLanes(phase, column)
                counts.push(lanes.length)
                if (!lanes.length) problems.push(`${ctag}: nenhum doce aguenta`)
                if (lanes.length === column.length) problems.push(`${ctag}: todos aguentam`)
                if (lanes.join() === prevLanes) problems.push(`${ctag}: os certos estão na mesma raia da fileira anterior`)
                prevLanes = lanes.join()
                if (ci === 0 && phase.teach && lanes.length !== 1) problems.push(`${ctag}: a fileira da demonstração precisa de 1 certo`)
                if (ci === 0 && phase.teach && !column.some(s => has(s, phase.rule.left.term) === phase.rule.left.not))
                    problems.push(`${ctag}: falta o doce que afunda na demonstração`)
            })
            if (!counts.includes(1) || !counts.includes(2)) problems.push(`${tag}: precisa de fileira com 1 e com 2 certos`)
            const other = varying.find(a => a !== ruleAttr)
            if (other) {
                const good = phase.columns.flatMap(c => c.filter(s => holds(phase.rule, s)))
                if (new Set(good.map(s => s[other])).size < 2) problems.push(`${tag}: os certos são todos ${good[0]?.[other]}`)
            }
        })
    })
    if (problems.length) throw new Error(`Rio de Chocolate — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
