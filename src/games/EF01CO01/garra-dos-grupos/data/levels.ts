import type { BoxDef, ItemRef, LevelDef, Piece, Rule, Spot } from '../types'
import { itemById } from './items'

export const REACH = 75
export const POINTS = 10

const big = (...ids: string[]): ItemRef[] => ids.map(id => ({ id, size: 'big' }))
const small = (...ids: string[]): ItemRef[] => ids.map(id => ({ id, size: 'small' }))

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        crossMs: 2500,
        spinMs: 12000,
        glowFromStart: true,
        boxes: [
            {
                tray: 'fruits',
                rule: { feature: 'color', color: 'red' },
                guide: 'ef01co01-l1',
                perBox: 2,
                items: big('apple-red', 'strawberry', 'apple-green', 'banana'),
            },
            {
                tray: 'shapes',
                rule: { feature: 'color', color: 'blue' },
                perBox: 5,
                items: big(
                    'circle-blue',
                    'circle-blue',
                    'square-blue',
                    'triangle-blue',
                    'triangle-blue',
                    'square-yellow',
                    'circle-green',
                    'triangle-pink',
                ),
            },
            {
                tray: 'fruits',
                rule: { feature: 'color', color: 'yellow' },
                perBox: 5,
                items: big(
                    'banana',
                    'banana',
                    'apple-yellow',
                    'pear-yellow',
                    'pear-yellow',
                    'apple-red',
                    'pear-green',
                    'grape-green',
                ),
            },
        ],
    },
    {
        level: 2,
        crossMs: 2500,
        spinMs: 9000,
        glowFromStart: false,
        boxes: [
            {
                tray: 'fruits',
                rule: { feature: 'color', color: 'red' },
                perBox: 5,
                items: [
                    ...big('apple-red', 'strawberry'),
                    ...small('apple-red', 'cherry', 'strawberry'),
                    ...big('apple-green', 'pear-yellow', 'apple-yellow'),
                    ...small('banana', 'grape-green'),
                ],
            },
            {
                tray: 'shapes',
                rule: { feature: 'size', size: 'big' },
                perBox: 5,
                items: [
                    ...big('circle-blue', 'square-red', 'triangle-yellow', 'circle-pink', 'square-green'),
                    ...small('circle-blue', 'square-red', 'triangle-green', 'triangle-yellow', 'circle-pink'),
                ],
            },
            {
                tray: 'fruits',
                rule: { feature: 'color', color: 'green' },
                perBox: 5,
                items: [
                    ...big('apple-green', 'pear-green', 'grape-green'),
                    ...small('apple-green', 'grape-green'),
                    ...big('banana', 'cherry'),
                    ...small('apple-red', 'pear-yellow', 'apple-yellow'),
                ],
            },
        ],
    },
    {
        level: 3,
        crossMs: 2500,
        spinMs: 7000,
        glowFromStart: false,
        boxes: [
            {
                tray: 'shapes',
                rule: { feature: 'shape', shape: 'round', not: true },
                perBox: 5,
                items: [
                    ...big('square-blue', 'triangle-pink', 'square-red'),
                    ...small('square-yellow', 'triangle-green'),
                    ...big('circle-blue', 'circle-pink', 'circle-red'),
                    ...small('circle-yellow', 'circle-green'),
                ],
            },
            {
                tray: 'fruits',
                rule: { feature: 'size', size: 'big', not: true },
                perBox: 5,
                items: [
                    ...small('apple-red', 'banana', 'pear-green', 'cherry', 'grape-green'),
                    ...big('apple-red', 'strawberry', 'pear-yellow', 'apple-green', 'banana'),
                ],
            },
            {
                tray: 'shapes',
                rule: { feature: 'size', size: 'big', not: true },
                perBox: 5,
                items: [
                    ...small('triangle-pink', 'circle-blue', 'square-yellow', 'circle-green', 'triangle-red'),
                    ...big('triangle-pink', 'square-blue', 'circle-yellow', 'square-green', 'triangle-blue'),
                ],
            },
        ],
    },
]

export const matches = (piece: Piece, rule: Rule): boolean => {
    const hit =
        rule.feature === 'color'
            ? piece.def.color === rule.color
            : rule.feature === 'size'
              ? piece.size === rule.size
              : piece.def.shape === rule.shape
    return rule.not ? !hit : hit
}

export const piecesOf = (box: BoxDef): Piece[] =>
    box.items.flatMap(ref => {
        const def = itemById(ref.id)
        return def ? [{ def, size: ref.size }] : []
    })

export const pickUnder = (reachable: Spot[], clawX: number): Spot | undefined => {
    let best: Spot | undefined
    reachable.forEach(spot => {
        const d = Math.abs(spot.x - clawX)
        if (d > REACH) return
        if (!best || d < Math.abs(best.x - clawX)) best = spot
    })
    return best
}

export const shuffled = <T>(list: T[], random: () => number = Math.random): T[] => {
    const out = [...list]
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

const keyOf = (piece: Piece) => `${piece.def.id}:${piece.size}`
const shares = (a: Piece[], b: Piece[], key: (p: Piece) => string) => {
    const left = new Set(a.map(key))
    return b.some(p => left.has(key(p)))
}

function checkBox(box: BoxDef, where: string, problems: string[]) {
    box.items.forEach(ref => {
        const item = itemById(ref.id)
        if (!item) problems.push(`${where}: item ${ref.id} não existe`)
        else if (item.tray !== box.tray) problems.push(`${where}: ${ref.id} não é da bandeja ${box.tray}`)
    })

    const pieces = piecesOf(box)
    const inside = pieces.filter(p => matches(p, box.rule))
    const outside = pieces.filter(p => !matches(p, box.rule))

    if (inside.length !== box.perBox) problems.push(`${where}: ${inside.length} itens entram, perBox ${box.perBox}`)
    if (new Set(outside.map(keyOf)).size < 2) problems.push(`${where}: os de fora não variam`)
    if (box.rule.feature === 'shape' && box.tray !== 'shapes') problems.push(`${where}: regra de forma fora das formas`)

    if (box.rule.feature === 'color' && !shares(inside, outside, p => p.def.kind)) {
        problems.push(`${where}: nenhum tipo aparece dentro e fora, o tipo entrega a cor`)
    }
    if (box.rule.feature === 'size' && !shares(inside, outside, p => p.def.id)) {
        problems.push(`${where}: nenhum item igual em outro tamanho, a cor ou o tipo entrega o tamanho`)
    }
    if (box.rule.feature === 'shape' && !shares(inside, outside, p => p.def.color)) {
        problems.push(`${where}: nenhuma cor aparece dentro e fora, a cor entrega a forma`)
    }
}

function checkLevel(level: LevelDef, problems: string[]) {
    const tag = `N${level.level}`
    const boxes = level.boxes
    const sizes = (box: BoxDef) => new Set(box.items.map(ref => ref.size))

    const guides = boxes.filter(box => box.guide).length
    if (guides !== (level.level === 1 ? 1 : 0)) problems.push(`${tag}: guia só no N1`)

    if (level.level === 1) {
        if (level.spinMs !== 12000) problems.push(`${tag}: bandeja de 12 s`)
        if (!level.glowFromStart) problems.push(`${tag}: brilho desde o início`)
        boxes.forEach((box, i) => {
            if (box.rule.feature !== 'color' || box.rule.not) problems.push(`${tag}/${i + 1}: o N1 é só cor`)
            if (box.items.some(ref => ref.size !== 'big')) problems.push(`${tag}/${i + 1}: o N1 não mistura tamanhos`)
            const want = i === 0 ? 4 : 8
            if (box.items.length !== want) problems.push(`${tag}/${i + 1}: ${box.items.length} itens, esperado ${want}`)
            if (i === 0 && box.tray !== 'fruits') problems.push(`${tag}/1: a primeira fase é de frutas`)
        })
        return
    }

    if (level.glowFromStart) problems.push(`${tag}: sem brilho`)
    boxes.forEach((box, i) => {
        if (box.items.length !== 10) problems.push(`${tag}/${i + 1}: ${box.items.length} itens, esperado 10`)
        if (sizes(box).size < 2) problems.push(`${tag}/${i + 1}: os tamanhos não se misturam`)
    })

    if (level.level === 2) {
        if (level.spinMs !== 9000) problems.push(`${tag}: bandeja de 9 s`)
        const features = boxes.map(box => box.rule.feature)
        if (boxes.some(box => box.rule.not)) problems.push(`${tag}: o N2 não tem negação`)
        if (!features.includes('color') || !features.includes('size')) problems.push(`${tag}: cor e tamanho`)
        features.forEach((f, i) => {
            if (i > 0 && f === features[i - 1]) problems.push(`${tag}/${i + 1}: a característica não trocou`)
        })
    }

    if (level.level === 3) {
        if (level.spinMs !== 7000) problems.push(`${tag}: bandeja de 7 s`)
        if (boxes.some(box => !box.rule.not)) problems.push(`${tag}: o N3 é todo pela negação`)
        const twin = boxes.some(box => {
            const pieces = piecesOf(box)
            return pieces.some(a =>
                pieces.some(b => a.def.id === b.def.id && a.size !== b.size && matches(a, box.rule) !== matches(b, box.rule)),
            )
        })
        if (!twin) problems.push(`${tag}: falta o item quase igual`)
    }
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach((level, index) => {
        if (level.level !== index + 1) problems.push(`nível ${level.level} fora de ordem`)
        if (level.boxes.length < 1 || level.boxes.length > 5) {
            problems.push(`N${level.level}: ${level.boxes.length} caixinhas`)
        }

        level.boxes.forEach((box, i) => {
            checkBox(box, `N${level.level}/${i + 1}`, problems)
            const previous = level.boxes[i - 1]
            if (previous && previous.tray === box.tray && previous.rule.feature === box.rule.feature) {
                problems.push(`N${level.level}/${i + 1}: mesma bandeja e característica da fase anterior`)
            }
        })

        checkLevel(level, problems)
    })

    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[garra-dos-grupos]', PROBLEMS)
