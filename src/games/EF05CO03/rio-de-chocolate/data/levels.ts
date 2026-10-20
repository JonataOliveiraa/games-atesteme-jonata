import type { Attr, Color, LevelDef, PhaseDef, Shape, Size, Sweet, Top } from '../types'
import { has, holds, literalHolds, literals } from './logic'

export const POINTS = 10

export const guideKey = (level: number) => `ef05co03-rio-l${level}`
export const OPENING_KEY = 'ef05co03-rio-opening'

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

const N2: LevelDef = {
    level: 2,
    title: 'O E e o OU juntam duas partes',
    message: 'Com E, as duas partes da frase têm que ser verdadeiras. Com OU, basta uma delas ser verdadeira.',
    phases: [
        {
            id: 'rosa-e-redondo',
            teach: 'and',
            rule: {
                left: { not: false, term: { attr: 'color', value: 'rosa' } },
                op: 'e',
                right: { not: false, term: { attr: 'shape', value: 'redondo' } },
            },
            columns: [
                [sw('verde', 'redondo', 'liso', 'grande'), sw('rosa', 'redondo', 'granulado', 'grande'), sw('rosa', 'quadrado', 'listrado', 'grande')],
                [sw('rosa', 'redondo', 'listrado', 'grande'), sw('marrom', 'redondo', 'granulado', 'grande'), sw('rosa', 'redondo', 'liso', 'grande')],
                [sw('verde', 'redondo', 'listrado', 'grande'), sw('rosa', 'redondo', 'granulado', 'grande'), sw('rosa', 'quadrado', 'liso', 'grande')],
            ],
        },
        {
            id: 'listrado-ou-pequeno',
            teach: 'or',
            rule: {
                left: { not: false, term: { attr: 'top', value: 'listrado' } },
                op: 'ou',
                right: { not: false, term: { attr: 'size', value: 'pequeno' } },
            },
            columns: [
                [sw('verde', 'quadrado', 'liso', 'grande'), sw('rosa', 'quadrado', 'granulado', 'grande'), sw('marrom', 'quadrado', 'listrado', 'grande')],
                [sw('rosa', 'quadrado', 'granulado', 'pequeno'), sw('marrom', 'quadrado', 'liso', 'grande'), sw('verde', 'quadrado', 'listrado', 'grande')],
                [sw('marrom', 'quadrado', 'granulado', 'grande'), sw('verde', 'quadrado', 'liso', 'pequeno'), sw('rosa', 'quadrado', 'liso', 'grande')],
            ],
        },
        {
            id: 'quadrado-e-nao-marrom',
            rule: {
                left: { not: false, term: { attr: 'shape', value: 'quadrado' } },
                op: 'e',
                right: { not: true, term: { attr: 'color', value: 'marrom' } },
            },
            columns: [
                [sw('marrom', 'quadrado', 'liso', 'grande'), sw('verde', 'redondo', 'granulado', 'grande'), sw('rosa', 'quadrado', 'listrado', 'grande')],
                [sw('verde', 'quadrado', 'granulado', 'grande'), sw('rosa', 'quadrado', 'liso', 'grande'), sw('rosa', 'redondo', 'listrado', 'grande')],
                [sw('verde', 'redondo', 'liso', 'grande'), sw('verde', 'quadrado', 'listrado', 'grande'), sw('marrom', 'quadrado', 'granulado', 'grande')],
            ],
        },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'Frases com E, OU e NÃO',
    message: 'Primeiro cada parte, depois o NÃO, e por último o E ou o OU.',
    phases: [
        {
            id: 'nao-verde-e-granulado',
            rule: {
                left: { not: true, term: { attr: 'color', value: 'verde' } },
                op: 'e',
                right: { not: false, term: { attr: 'top', value: 'granulado' } },
            },
            columns: [
                [sw('verde', 'redondo', 'granulado', 'grande'), sw('rosa', 'redondo', 'granulado', 'pequeno'), sw('marrom', 'redondo', 'liso', 'grande')],
                [sw('marrom', 'redondo', 'granulado', 'grande'), sw('verde', 'redondo', 'granulado', 'pequeno'), sw('rosa', 'redondo', 'granulado', 'grande')],
                [sw('rosa', 'redondo', 'listrado', 'pequeno'), sw('marrom', 'redondo', 'granulado', 'pequeno'), sw('verde', 'redondo', 'granulado', 'grande')],
                [sw('rosa', 'redondo', 'granulado', 'grande'), sw('verde', 'redondo', 'liso', 'pequeno'), sw('marrom', 'redondo', 'listrado', 'grande')],
            ],
        },
        {
            id: 'grande-ou-nao-liso',
            rule: {
                left: { not: false, term: { attr: 'size', value: 'grande' } },
                op: 'ou',
                right: { not: true, term: { attr: 'top', value: 'liso' } },
            },
            columns: [
                [sw('rosa', 'quadrado', 'liso', 'pequeno'), sw('verde', 'quadrado', 'liso', 'grande'), sw('marrom', 'quadrado', 'liso', 'pequeno')],
                [sw('marrom', 'quadrado', 'granulado', 'pequeno'), sw('rosa', 'quadrado', 'liso', 'pequeno'), sw('verde', 'quadrado', 'listrado', 'pequeno')],
                [sw('verde', 'quadrado', 'liso', 'pequeno'), sw('marrom', 'quadrado', 'liso', 'grande'), sw('rosa', 'quadrado', 'listrado', 'pequeno')],
                [sw('rosa', 'quadrado', 'liso', 'grande'), sw('verde', 'quadrado', 'liso', 'pequeno'), sw('marrom', 'quadrado', 'liso', 'pequeno')],
            ],
        },
        {
            id: 'nao-rosa-ou-quadrado',
            rule: {
                left: { not: true, term: { attr: 'color', value: 'rosa' } },
                op: 'ou',
                right: { not: false, term: { attr: 'shape', value: 'quadrado' } },
            },
            columns: [
                [sw('rosa', 'redondo', 'listrado', 'grande'), sw('verde', 'redondo', 'granulado', 'grande'), sw('rosa', 'redondo', 'liso', 'grande')],
                [sw('rosa', 'quadrado', 'granulado', 'grande'), sw('rosa', 'redondo', 'granulado', 'grande'), sw('marrom', 'redondo', 'liso', 'grande')],
                [sw('rosa', 'redondo', 'liso', 'grande'), sw('rosa', 'quadrado', 'listrado', 'grande'), sw('verde', 'redondo', 'listrado', 'grande')],
                [sw('marrom', 'redondo', 'granulado', 'grande'), sw('rosa', 'redondo', 'listrado', 'grande'), sw('rosa', 'redondo', 'granulado', 'grande')],
            ],
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

const ATTRS: Attr[] = ['color', 'shape', 'top', 'size']

const key = (s: Sweet) => ATTRS.map(a => s[a]).join('|')

export const trueParts = (phase: PhaseDef, s: Sweet) => literals(phase.rule).filter(l => literalHolds(s, l)).length

export const trueLanes = (phase: PhaseDef, column: Sweet[]) =>
    column.map((s, i) => (holds(phase.rule, s) ? i : -1)).filter(i => i >= 0)

const SHAPE: Record<number, { columns: number; varying: (n: number) => boolean; text: string }> = {
    1: { columns: 3, varying: n => n === 2, text: '2' },
    2: { columns: 3, varying: n => n === 3, text: '3' },
    3: { columns: 4, varying: n => n >= 3, text: '3 ou mais' },
}

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const shape = SHAPE[level.level]
        level.phases.forEach((phase, pi) => {
            const tag = `N${level.level} ${phase.id}`
            const rule = phase.rule
            const lits = literals(rule)
            const all = phase.columns.flat()
            const varying = ATTRS.filter(a => new Set(all.map(s => s[a])).size > 1)
            const ruleAttrs = lits.map(l => l.term.attr)
            if (level.level === 1) {
                if (rule.op) problems.push(`${tag}: o N1 só tem frase de um termo`)
                if (pi === 0 && rule.left.not) problems.push(`${tag}: a 1ª fase do N1 não tem NÃO`)
                if (pi > 0 && !rule.left.not) problems.push(`${tag}: as fases 2 e 3 do N1 têm NÃO`)
            } else {
                if (!rule.op || !rule.right) problems.push(`${tag}: o N${level.level} tem frase de dois termos`)
                if (new Set(ruleAttrs).size !== lits.length) problems.push(`${tag}: os dois termos falam do mesmo atributo`)
            }
            if (level.level === 3 && !lits.some(l => l.not)) problems.push(`${tag}: o N3 tem NÃO em toda frase`)
            if (shape && !shape.varying(varying.length)) problems.push(`${tag}: mudam ${varying.length} atributos, e não ${shape.text}`)
            if (shape && phase.columns.length !== shape.columns) problems.push(`${tag}: tem ${phase.columns.length} fileiras, e não ${shape.columns}`)
            ruleAttrs.forEach(a => {
                if (!varying.includes(a)) problems.push(`${tag}: o atributo da placa (${a}) não muda`)
            })
            if (phase.teach === 'and' && rule.op !== 'e') problems.push(`${tag}: ensina o E sem E na placa`)
            if (phase.teach === 'or' && rule.op !== 'ou') problems.push(`${tag}: ensina o OU sem OU na placa`)
            if (phase.teach === 'not' && !lits.some(l => l.not)) problems.push(`${tag}: ensina o NÃO sem NÃO na placa`)
            if (rule.op === 'ou' && rule.right) {
                const right = rule.right
                if (all.some(s => trueParts(phase, s) === 2)) problems.push(`${tag}: no OU, nenhum doce pode ter as duas partes`)
                const good = all.filter(s => holds(rule, s))
                if (!good.some(s => literalHolds(s, rule.left)) || !good.some(s => literalHolds(s, right)))
                    problems.push(`${tag}: no OU, os certos precisam vir pelas duas partes`)
            }
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
                if (rule.op && !column.some(s => trueParts(phase, s) === 1)) problems.push(`${ctag}: falta o doce com só uma parte`)
                if (ci === 0 && phase.teach && lanes.length !== 1) problems.push(`${ctag}: a fileira da demonstração precisa de 1 certo`)
                if (ci === 0 && phase.teach === 'not' && !column.some(s => has(s, rule.left.term) === rule.left.not))
                    problems.push(`${ctag}: falta o doce que afunda na demonstração`)
            })
            if (!counts.includes(1) || !counts.includes(2)) problems.push(`${tag}: precisa de fileira com 1 e com 2 certos`)
            const good = phase.columns.flatMap(c => c.filter(s => holds(rule, s)))
            varying
                .filter(a => !ruleAttrs.includes(a))
                .forEach(other => {
                    if (new Set(good.map(s => s[other])).size < 2) problems.push(`${tag}: os certos são todos ${good[0]?.[other]}`)
                })
        })
    })
    if (problems.length) throw new Error(`Rio de Chocolate — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
