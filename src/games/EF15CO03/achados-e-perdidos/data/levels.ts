import type { CardDef, CaseDef, CritterDef, Field, LevelDef, Operator, Term, Value } from '../types'
import { critterOf } from './critters'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS CARTAS, AS FASES E A LÓGICA
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  NENHUM GABARITO MORA AQUI. Uma tabela bicho × carta seria uma cópia que
 *  envelhece calada na primeira vez que alguém mexer num bichinho. O valor
 *  de cada carta sai de `evaluate()`, contra o bichinho da fase, no instante
 *  do toque.
 */

const t = (value: Value, negated = false): Term => ({ value, negated })

const one = (id: string, value: Value, negated = false): CardDef => ({ id, term: t(value, negated) })

const two = (id: string, left: Term, op: Operator, right: Term): CardDef => ({
    id,
    term: left,
    op,
    right,
})

export const CARDS: Record<string, CardDef> = {
    /* ── um termo ── */
    blue: one('blue', 'blue'),
    green: one('green', 'green'),
    red: one('red', 'red'),
    yellow: one('yellow', 'yellow'),

    notBlue: one('notBlue', 'blue', true),
    notGreen: one('notGreen', 'green', true),
    notYellow: one('notYellow', 'yellow', true),

    hat: one('hat', 'hat'),
    notHat: one('notHat', 'hat', true),
    glasses: one('glasses', 'glasses'),
    notGlasses: one('notGlasses', 'glasses', true),

    big: one('big', 'big'),
    small: one('small', 'small'),

    /* ── dois termos, com E ── */
    greenAndHat: two('greenAndHat', t('green'), 'e', t('hat')),
    hatAndGlasses: two('hatAndGlasses', t('hat'), 'e', t('glasses')),
    hatAndSmall: two('hatAndSmall', t('hat'), 'e', t('small')),
    greenAndBig: two('greenAndBig', t('green'), 'e', t('big')),
    glassesAndBig: two('glassesAndBig', t('glasses'), 'e', t('big')),
    notGreenAndSmall: two('notGreenAndSmall', t('green', true), 'e', t('small')),
    notHatAndGlasses: two('notHatAndGlasses', t('hat', true), 'e', t('glasses')),
    notHatAndNotGlasses: two('notHatAndNotGlasses', t('hat', true), 'e', t('glasses', true)),
    notBlueAndHat: two('notBlueAndHat', t('blue', true), 'e', t('hat')),
    notYellowAndBig: two('notYellowAndBig', t('yellow', true), 'e', t('big')),

    /* ── dois termos, com OU ── */
    redOrGlasses: two('redOrGlasses', t('red'), 'ou', t('glasses')),
    bigOrGlasses: two('bigOrGlasses', t('big'), 'ou', t('glasses')),
    bigOrHat: two('bigOrHat', t('big'), 'ou', t('hat')),
    smallOrHat: two('smallOrHat', t('small'), 'ou', t('hat')),
    notGreenOrGlasses: two('notGreenOrGlasses', t('green', true), 'ou', t('glasses')),
    notHatOrSmall: two('notHatOrSmall', t('hat', true), 'ou', t('small')),
}

export const cardOf = (id: string): CardDef => {
    const found = CARDS[id]
    if (!found) throw new Error(`[achados-e-perdidos] carta desconhecida: ${id}`)
    return found
}

/* ───────────────────────────────── a lógica ───────────────────────────── */

export const fieldOf = (value: Value): Field =>
    value === 'hat' ? 'hat'
        : value === 'glasses' ? 'glasses'
            : value === 'big' || value === 'small' ? 'size'
                : 'color'

const has = (critter: CritterDef, value: Value): boolean => {
    switch (value) {
        case 'hat': return critter.hat
        case 'glasses': return critter.glasses
        case 'big': return critter.big
        case 'small': return !critter.big
        default: return critter.color === value
    }
}

/** O NÃO troca o valor do termo, e é a única coisa que ele faz. */
export const termHolds = (term: Term, critter: CritterDef): boolean =>
    term.negated ? !has(critter, term.value) : has(critter, term.value)

/** Os termos da carta, na ordem em que aparecem nela. */
export const termsOf = (card: CardDef): Term[] =>
    card.op && card.right ? [card.term, card.right] : [card.term]

export const evaluate = (card: CardDef, critter: CritterDef): boolean => {
    const left = termHolds(card.term, critter)
    if (!card.op || !card.right) return left
    const right = termHolds(card.right, critter)
    return card.op === 'e' ? left && right : left || right
}

/**
 * Uma carta verdadeira acende o campo de CADA termo que deu ✓.
 *
 * É desta linha única que sai o comportamento inteiro do §6 do plano, sem um
 * caso especial escrito à mão: o E sempre acende dois (se fosse um só ele
 * seria falso), o OU acende um ou dois, e a carta falsa não acende nada.
 */
export const lights = (card: CardDef, critter: CritterDef): Field[] => {
    if (!evaluate(card, critter)) return []
    const fields = termsOf(card)
        .filter(term => termHolds(term, critter))
        .map(term => fieldOf(term.value))
    return [...new Set(fields)]
}

/** Os termos que deram ✓ — é deles que sai o que cada campo do cartaz diz. */
export const litTerms = (card: CardDef, critter: CritterDef): Term[] =>
    evaluate(card, critter) ? termsOf(card).filter(term => termHolds(term, critter)) : []

/** +10 fechando o cartaz sem mentir, +5 depois de uma carta falsa. */
export const pointsFor = (missed: boolean): number => (missed ? 5 : 10)

/* ────────────────────────────────── as fases ──────────────────────────── */

const LEVEL_1: LevelDef = {
    level: 1,
    ruler: false,
    cases: [
        /* a fase do tutorial: sem NÃO nenhum, só o laço */
        { id: '1.1', critter: 'bolota', fields: ['color', 'hat'], hand: ['blue', 'hat', 'red'] },
        /* o primeiro NÃO, e ele é a carta VERDADEIRA */
        { id: '1.2', critter: 'tico', fields: ['color', 'glasses'], hand: ['notGreen', 'glasses', 'hat'] },
        /* o exemplo da BNCC de pé: dizer o que ele NÃO tem é informação boa */
        { id: '1.3', critter: 'nina', fields: ['color', 'hat'], hand: ['green', 'notHat', 'glasses'] },
        /* a carta falsa é um NÃO — o NÃO não é sinônimo de verdadeiro */
        { id: '1.4', critter: 'pepe', fields: ['color', 'glasses'], hand: ['notBlue', 'glasses', 'notGlasses'] },
        /* a afirmação e o seu avesso, lado a lado na mesma mão */
        { id: '1.5', critter: 'mel', fields: ['color', 'hat'], hand: ['yellow', 'hat', 'notYellow'] },
    ],
}

const LEVEL_2: LevelDef = {
    level: 2,
    ruler: true,
    cases: [
        /* o primeiro E: uma carta acende DOIS campos, e a criança conta com o olho */
        {
            id: '2.1',
            critter: 'juju',
            fields: ['color', 'hat', 'glasses'],
            hand: ['greenAndHat', 'glasses', 'big'],
        },
        /* o OU com UM lado falso — e a carta ainda é verdadeira */
        {
            id: '2.2',
            critter: 'tati',
            fields: ['color', 'hat', 'size'],
            hand: ['redOrGlasses', 'hatAndSmall', 'big'],
        },
        /* a festa: o OU com os DOIS lados verdadeiros acende os dois campos */
        {
            id: '2.3',
            critter: 'pepe',
            fields: ['color', 'glasses', 'size'],
            hand: ['bigOrGlasses', 'notGreen', 'small'],
        },
        /* um termo falso derruba o E inteiro */
        {
            id: '2.4',
            critter: 'mel',
            fields: ['color', 'hat', 'glasses'],
            hand: ['hatAndGlasses', 'yellow', 'greenAndHat'],
        },
    ],
}

const LEVEL_3: LevelDef = {
    level: 3,
    ruler: true,
    cases: [
        /* quatro campos: duas cartas de dois termos fecham o cartaz */
        {
            id: '3.1',
            critter: 'tico',
            fields: ['color', 'size', 'hat', 'glasses'],
            hand: ['notGreenAndSmall', 'notHatAndGlasses', 'bigOrHat'],
        },
        /* dois NÃO dentro do mesmo E */
        {
            id: '3.2',
            critter: 'nina',
            fields: ['color', 'size', 'hat', 'glasses'],
            hand: ['greenAndBig', 'notHatAndNotGlasses', 'notGreenOrGlasses'],
        },
        /* o NÃO que é verdadeiro sobre uma cor que ele não tem */
        {
            id: '3.3',
            critter: 'mel',
            fields: ['color', 'hat', 'glasses', 'size'],
            hand: ['notBlueAndHat', 'glassesAndBig', 'notHatOrSmall'],
        },
        /* fecho: o NÃO no E dos dois lados da mão */
        {
            id: '3.4',
            critter: 'pepe',
            fields: ['color', 'size', 'hat', 'glasses'],
            hand: ['notYellowAndBig', 'notHatAndGlasses', 'smallOrHat'],
        },
    ],
}

export const LEVELS: LevelDef[] = [LEVEL_1, LEVEL_2, LEVEL_3]

export const TOTAL_CASES = LEVELS.reduce((n, level) => n + level.cases.length, 0)

/* ──────────────────────────────── a validação ─────────────────────────── */

/**
 * O conserto nº 4 do plano: **toda mão fecha o cartaz**. Mão conferida a olho
 * envelhece na primeira vez que alguém mexer num bichinho; este teste é o que
 * transforma "sempre dá para vencer" em garantia. Roda no `import`.
 */
export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        let negatedSomewhere = false
        let talksAboutSize = false

        level.cases.forEach((c: CaseDef) => {
            const where = `nível ${level.level} · fase ${c.id}`
            const critter = critterOf(c.critter)

            if (c.hand.length !== 3) problems.push(`${where}: a mão tem ${c.hand.length} cartas, e ela é de 3`)

            const hand = c.hand.map(cardOf)
            const truthy = hand.filter(card => evaluate(card, critter))

            hand.forEach(card => {
                if (termsOf(card).some(term => term.negated)) negatedSomewhere = true
                if (termsOf(card).some(term => fieldOf(term.value) === 'size')) talksAboutSize = true
            })

            /* 1 — o cartaz fecha */
            const covered = new Set(truthy.flatMap(card => lights(card, critter)))
            const missing = c.fields.filter(f => !covered.has(f))
            if (missing.length) problems.push(`${where}: nenhuma mão fecha os campos ${missing.join(', ')}`)

            /* 2 — nenhum campo sobra */
            truthy.forEach(card => {
                lights(card, critter)
                    .filter(f => !c.fields.includes(f))
                    .forEach(f => problems.push(`${where}: a carta ${card.id} acende "${f}", que o cartaz não pede`))
            })

            /* 3 — duas verdadeiras não disputam o mesmo campo */
            const seen = new Set<Field>()
            truthy.forEach(card =>
                lights(card, critter).forEach(f => {
                    if (seen.has(f)) problems.push(`${where}: duas cartas verdadeiras acendem "${f}"`)
                    seen.add(f)
                }),
            )

            /* 4 — sempre existe uma carta falsa, senão não há o que decidir */
            if (truthy.length === hand.length) problems.push(`${where}: nenhuma carta é falsa`)

            /* 5 — o cartaz tem o tamanho do nível */
            const wanted = level.level + 1
            if (c.fields.length !== wanted) {
                problems.push(`${where}: ${c.fields.length} campos, e o nível ${level.level} pede ${wanted}`)
            }
        })

        /* a 1.1 é a fase do tutorial e é a única isenta, de propósito */
        if (!negatedSomewhere) problems.push(`nível ${level.level}: nenhuma carta com NÃO`)

        /* a régua é desenhada quando, e só quando, alguma carta fala de tamanho */
        if (talksAboutSize !== level.ruler) {
            problems.push(
                `nível ${level.level}: ruler=${level.ruler} mas ${talksAboutSize ? 'existe' : 'não existe'} carta de tamanho`,
            )
        }
    })

    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[achados-e-perdidos]', PROBLEMS)
