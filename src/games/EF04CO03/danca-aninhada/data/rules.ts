import { LEVELS } from './levels'
import type {
    Beat,
    Command,
    Divergence,
    LevelDef,
    Move,
    PhaseDef,
    SheetDef,
    Signal,
    SlotId,
    SlotKind,
    SlotValue,
    Trace,
    Values,
} from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FICHA VIRA ÁRVORE, A ÁRVORE É EXECUTADA, E SÓ ENTÃO SE COMPARA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Nenhuma fase guarda a lista de movimentos certos. Ela guarda o REFRÃO e
 * quantas vezes ele aparece; quem produz a sequência é a simulação. É o que
 * vai permitir o nível 3 existir: lá a fase não tem número de refrões, e o
 * mesmo programa roda duas vezes com durações diferentes de luz.
 *
 * Nada aqui toca em Phaser. A simulação é testável sem animação, como pede o
 * §8 do planejamento — a `GameScene` apenas anima o traço que sai daqui.
 *
 * O primeiro corte publica só o nível 1, mas a máquina já é a geral: o laço
 * aninhado e o laço por condição não são um segundo motor, são dois ramos
 * deste. Escrever um motor só para contar até três seria ter de jogá-lo fora.
 */

/** A trava contra laço sem fim. Atingi-la para a cena com aviso, não congela. */
export const MAX_ROUNDS = 6
const MAX_BEATS = 64

export const slotsOf = (sheet: SheetDef): SlotId[] => {
    const list: SlotId[] = ['outer']
    if (sheet.leading >= 1) list.push('lead1')
    if (sheet.leading >= 2) list.push('lead2')
    if (sheet.nested) list.push('innerTimes', 'innerMove')
    if (sheet.trailing) list.push('after')
    return list
}

export const kindOf = (sheet: SheetDef, slot: SlotId): SlotKind => {
    if (slot === 'outer') return sheet.outer === 'times' ? 'times' : 'signal'
    if (slot === 'innerTimes') return 'times'
    return 'move'
}

export const TIMES: number[] = [2, 3, 4]
export const MOVES: Move[] = ['step', 'clap', 'spin']
export const SIGNALS: Signal[] = ['lightOff', 'lightOn']

/** Até três opções grandes por espaço, como manda o §5. */
export const optionsFor = (kind: SlotKind): SlotValue[] => {
    if (kind === 'times') return TIMES.map(times => ({ kind: 'times', times }) as SlotValue)
    if (kind === 'signal') return SIGNALS.map(signal => ({ kind: 'signal', signal }) as SlotValue)
    return MOVES.map(move => ({ kind: 'move', move }) as SlotValue)
}

export const sameValue = (a?: SlotValue, b?: SlotValue) => {
    if (!a || !b || a.kind !== b.kind) return false
    if (a.kind === 'times' && b.kind === 'times') return a.times === b.times
    if (a.kind === 'move' && b.kind === 'move') return a.move === b.move
    if (a.kind === 'signal' && b.kind === 'signal') return a.signal === b.signal
    return false
}

export const complete = (sheet: SheetDef, values: Values) => slotsOf(sheet).every(id => values[id])

const moveAt = (values: Values, slot: SlotId): Move => {
    const v = values[slot]
    return v && v.kind === 'move' ? v.move : 'step'
}

const timesAt = (values: Values, slot: SlotId): number => {
    const v = values[slot]
    return v && v.kind === 'times' ? v.times : 2
}

const signalAt = (values: Values, slot: SlotId): Signal => {
    const v = values[slot]
    return v && v.kind === 'signal' ? v.signal : 'lightOff'
}

/** A ficha preenchida vira o programa. Ficha incompleta não vira nada. */
export const buildProgram = (sheet: SheetDef, values: Values): Command | null => {
    if (!complete(sheet, values)) return null

    const body: Command[] = []
    if (sheet.leading >= 1) body.push({ kind: 'move', move: moveAt(values, 'lead1'), slot: 'lead1' })
    if (sheet.leading >= 2) body.push({ kind: 'move', move: moveAt(values, 'lead2'), slot: 'lead2' })
    if (sheet.nested) {
        body.push({
            kind: 'repeat',
            times: timesAt(values, 'innerTimes'),
            body: [{ kind: 'move', move: moveAt(values, 'innerMove'), slot: 'innerMove' }],
            slot: 'innerTimes',
        })
    }
    if (sheet.trailing) body.push({ kind: 'move', move: moveAt(values, 'after'), slot: 'after' })

    return sheet.outer === 'times'
        ? { kind: 'repeat', times: timesAt(values, 'outer'), body, slot: 'outer' }
        : { kind: 'repeatUntil', signal: signalAt(values, 'outer'), body, slot: 'outer' }
}

/**
 * ── A LUZ É AVALIADA DEPOIS DO REFRÃO, NUNCA NO MEIO ─────────────────────
 *
 * Ela começa ACESA e apaga ao fim do refrão de número `plan`. `ATÉ A LUZ
 * APAGAR` para quando ela estiver apagada — ou seja, depois de `plan`
 * refrões. `ATÉ A LUZ ACENDER` para quando ela estiver acesa, e como ela já
 * começa assim, esse programa encerra depois do PRIMEIRO refrão. É o que faz
 * o distrator ser plausível e, ainda assim, errado.
 */
export function simulate(program: Command, plan?: number): Trace {
    const beats: Beat[] = []
    let rounds = 0
    let stopped: Trace['stopped'] = 'end'

    const runBody = (body: Command[], outer: number) => {
        for (const command of body) {
            if (command.kind === 'move') {
                beats.push({ move: command.move, outer, inner: null, slot: command.slot })
            } else if (command.kind === 'repeat') {
                for (let i = 1; i <= command.times; i++) {
                    for (const child of command.body) {
                        if (child.kind !== 'move') continue
                        beats.push({ move: child.move, outer, inner: i, slot: child.slot })
                    }
                }
            }
            if (beats.length > MAX_BEATS) return
        }
    }

    if (program.kind === 'repeat') {
        for (let r = 1; r <= Math.min(program.times, MAX_ROUNDS); r++) {
            runBody(program.body, r)
            rounds = r
            if (beats.length > MAX_BEATS) {
                stopped = 'limit'
                break
            }
        }
    } else if (program.kind === 'repeatUntil') {
        let lightOn = true
        for (let r = 1; r <= MAX_ROUNDS; r++) {
            runBody(program.body, r)
            rounds = r
            if (plan !== undefined && r >= plan) lightOn = false
            const reached = program.signal === 'lightOff' ? !lightOn : lightOn
            if (reached) break
            if (r === MAX_ROUNDS || beats.length > MAX_BEATS) stopped = 'limit'
        }
    }

    return { beats, rounds, stopped }
}

/** A ficha que resolve a fase — derivada do refrão, nunca guardada nos dados. */
export function solutionOf(phase: PhaseDef): Values {
    const { sheet, pattern } = phase
    const values: Values = {}

    values.outer =
        sheet.outer === 'times'
            ? { kind: 'times', times: phase.rounds ?? 2 }
            : { kind: 'signal', signal: 'lightOff' }

    if (sheet.leading >= 1) values.lead1 = { kind: 'move', move: pattern[0] }
    if (sheet.leading >= 2) values.lead2 = { kind: 'move', move: pattern[1] }
    if (sheet.nested) {
        values.innerTimes = { kind: 'times', times: pattern.length - (sheet.trailing ? 1 : 0) }
        values.innerMove = { kind: 'move', move: pattern[0] }
    }
    if (sheet.trailing) values.after = { kind: 'move', move: pattern[pattern.length - 1] }

    return values
}

/** Quantos refrões este ensaio deve ter. */
export const roundsOf = (phase: PhaseDef, rehearsal = 0): number =>
    phase.signalPlans ? phase.signalPlans[rehearsal] : (phase.rounds ?? 1)

export const planOf = (phase: PhaseDef, rehearsal = 0): number | undefined =>
    phase.signalPlans ? phase.signalPlans[rehearsal] : undefined

/** O que o pedido quer ver, refrão por refrão. */
export const wantedRounds = (phase: PhaseDef, rehearsal = 0): Move[][] =>
    Array.from({ length: roundsOf(phase, rehearsal) }, () => phase.pattern.slice())

/** A sequência inteira do pedido, para desenhar as tiras. */
export const wantedMoves = (phase: PhaseDef, rehearsal = 0): Move[] =>
    wantedRounds(phase, rehearsal).flat()

const groupRounds = (beats: Beat[]): Beat[][] => {
    const out: Beat[][] = []
    for (const beat of beats) {
        const i = beat.outer - 1
        if (!out[i]) out[i] = []
        out[i].push(beat)
    }
    for (let i = 0; i < out.length; i++) if (!out[i]) out[i] = []
    return out
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PRIMEIRA DIFERENÇA, E DE QUEM É A CULPA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O §9 quer que a simulação PARE na primeira divergência e aponte o espaço
 * responsável. O caminho ingênuo — comparar movimento a movimento e culpar o
 * espaço do movimento — erra o culpado assim que existir laço de dentro: com
 * o contador em 3 onde o pedido quer 2, o terceiro movimento do refrão sai
 * PASSO onde se esperava PALMA, e a culpa cairia no espaço do movimento, que
 * está certo.
 *
 * Por isso cada movimento executado carrega o espaço que o gerou e a volta
 * interna em que saiu. Quando o PAPEL do movimento difere do papel esperado
 * naquela posição, quem errou é o contador; só quando os papéis coincidem é
 * que a culpa pode ser do movimento escolhido.
 */
export function firstDivergence(phase: PhaseDef, trace: Trace, rehearsal = 0): Divergence | null {
    const want = wantedRounds(phase, rehearsal)
    const got = groupRounds(trace.beats)
    const counter: SlotId = phase.sheet.nested ? 'innerTimes' : 'outer'
    const nested = phase.sheet.nested
    const until = phase.sheet.outer === 'until'

    let index = 0

    for (let r = 0; r < Math.max(got.length, want.length); r++) {
        const gotRound = got[r] ?? []
        const wantRound = want[r] ?? []

        if (!want[r]) {
            return {
                index,
                slot: 'outer',
                expected: null,
                got: gotRound[0]?.move ?? null,
                reason: until ? 'signal' : 'roundsMore',
            }
        }
        if (!got[r]) {
            return {
                index,
                slot: 'outer',
                expected: wantRound[0] ?? null,
                got: null,
                reason: until ? 'signal' : 'roundsLess',
            }
        }

        for (let j = 0; j < Math.max(gotRound.length, wantRound.length); j++) {
            const beat = gotRound[j]
            const wanted = wantRound[j]

            if (!wanted) return { index, slot: counter, expected: null, got: beat.move, reason: 'innerMore' }
            if (!beat) return { index, slot: counter, expected: wanted, got: null, reason: 'innerLess' }

            /*
             * O papel esperado nesta posição: dentro do laço interno enquanto
             * couber o refrão pedido, e o movimento de DEPOIS na última casa.
             */
            if (nested) {
                const wantInner = j < wantRound.length - (phase.sheet.trailing ? 1 : 0)
                const gotInner = beat.inner !== null
                if (wantInner !== gotInner) {
                    return {
                        index,
                        slot: 'innerTimes',
                        expected: wanted,
                        got: beat.move,
                        reason: gotInner ? 'innerMore' : 'innerLess',
                    }
                }
            }

            if (beat.move !== wanted) {
                return { index, slot: beat.slot, expected: wanted, got: beat.move, reason: 'move' }
            }
            index++
        }
    }

    if (trace.stopped === 'limit') {
        return { index, slot: 'outer', expected: null, got: null, reason: 'limit' }
    }
    return null
}

/* ───────────────────────────── conferências ──────────────────────────── */

const MAX_VISIBLE = 12

/**
 * As conferências do §8, rodadas ao abrir a cena.
 *
 * A que mais importa é a última: montar a ficha da solução, EXECUTAR e exigir
 * que o traço bata com o pedido. Uma fase cujo formato de ficha não consegue
 * produzir o refrão pedido é impossível de resolver, e isso não aparece lendo
 * o arquivo de dados — só simulando.
 */
export function validateLevels(levels: LevelDef[] = LEVELS): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        if (level.phases.length !== 3) {
            problems.push(`nível ${level.level}: ${level.phases.length} fases (esperado 3)`)
        }
        level.phases.forEach(phase => {
            const where = `${level.level}/${phase.id}`
            const { sheet } = phase

            if (!phase.pattern.length) problems.push(`${where}: refrão vazio`)
            if (sheet.outer === 'times' && !phase.rounds) problems.push(`${where}: sem número de refrões`)
            if (sheet.outer === 'until' && !phase.signalPlans) problems.push(`${where}: sem planos de sinal`)
            if (phase.signalPlans && phase.signalPlans[0] === phase.signalPlans[1]) {
                problems.push(`${where}: os dois ensaios têm a mesma duração`)
            }
            if (phase.signalPlans?.some(n => n < 1 || n > MAX_ROUNDS)) {
                problems.push(`${where}: plano de sinal fora de 1..${MAX_ROUNDS}`)
            }
            if (sheet.nested && sheet.leading > 0) {
                problems.push(`${where}: laço interno e movimentos soltos no mesmo corpo`)
            }
            if (!sheet.nested && sheet.leading === 0) problems.push(`${where}: corpo externo vazio`)
            if (!sheet.nested && sheet.leading !== phase.pattern.length) {
                problems.push(`${where}: ${sheet.leading} espaços para um refrão de ${phase.pattern.length}`)
            }
            if (phase.rounds !== undefined && phase.rounds > MAX_ROUNDS) {
                problems.push(`${where}: ${phase.rounds} refrões (máx ${MAX_ROUNDS})`)
            }

            slotsOf(sheet).forEach(id => {
                const options = optionsFor(kindOf(sheet, id))
                const seen = new Set(options.map(o => JSON.stringify(o)))
                if (seen.size !== options.length) problems.push(`${where}/${id}: opção repetida na bandeja`)
                if (options.length > 3) problems.push(`${where}/${id}: ${options.length} opções (máx 3)`)
            })

            const program = buildProgram(sheet, solutionOf(phase))
            if (!program) {
                problems.push(`${where}: a ficha da solução não fecha`)
                return
            }

            const rehearsals = phase.signalPlans ? [0, 1] : [0]
            rehearsals.forEach(rehearsal => {
                const trace = simulate(program, planOf(phase, rehearsal))
                if (trace.stopped === 'limit') problems.push(`${where}: ensaio ${rehearsal + 1} bateu na trava`)
                if (trace.beats.length > MAX_VISIBLE) {
                    problems.push(
                        `${where}: ensaio ${rehearsal + 1} com ${trace.beats.length} movimentos (máx ${MAX_VISIBLE})`,
                    )
                }
                const bad = firstDivergence(phase, trace, rehearsal)
                if (bad) problems.push(`${where}: ensaio ${rehearsal + 1} não fecha (${bad.reason} em ${bad.slot})`)
            })

            // o distrator do nível 3 precisa ser ERRADO, e não apenas diferente
            if (sheet.outer === 'until') {
                const wrong = buildProgram(sheet, {
                    ...solutionOf(phase),
                    outer: { kind: 'signal', signal: 'lightOn' },
                })
                if (wrong && !firstDivergence(phase, simulate(wrong, planOf(phase, 0)), 0)) {
                    problems.push(`${where}: ATÉ A LUZ ACENDER também resolve`)
                }
            }
        })
    })

    return problems
}
