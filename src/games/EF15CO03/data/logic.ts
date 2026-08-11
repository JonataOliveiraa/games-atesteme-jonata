import { OPERATOR_NAME, OPERATOR_RULE } from './theme'
import type {
    Beat,
    OperatorKind,
    PathPhase,
    PhaseConfig,
    PhaseTrace,
    Statement,
    TraceEntry,
} from '../types'

export const applyNot = (v: boolean) => !v
export const applyAnd = (a: boolean, b: boolean) => a && b
export const applyOr = (a: boolean, b: boolean) => a || b

export function applyOperator(kind: OperatorKind, a: boolean, b?: boolean): boolean {
    if (kind === 'nao') return applyNot(a)
    if (kind === 'e') return applyAnd(a, b ?? false)
    return applyOr(a, b ?? false)
}

export function shortText(text: string, max = 30) {
    const clean = text.replace(/\s+/g, ' ').trim()
    if (clean.length <= max) return clean
    return `${clean.slice(0, max - 1).trimEnd()}…`
}

function statementMap(list: Statement[]) {
    const map = new Map<string, Statement>()
    list.forEach(s => map.set(s.id, s))
    return map
}

function phaseStatements(phase: PhaseConfig): Statement[] {
    if (phase.kind === 'valor' || phase.kind === 'negacao') return [phase.statement]
    if (phase.kind === 'dupla') return [phase.left, phase.right]
    return phase.statements
}

function buildValueBeat(s: Statement, question: string, tip: string): Beat {
    return {
        id: s.id,
        kind: 'valor',
        question,
        tip,
        refs: [s.id],
        expected: s.value,
        label: shortText(s.text),
        sourceText: s.text,
        why: s.why,
    }
}

function pathBeats(phase: PathPhase): Beat[] {
    const map = statementMap(phase.statements)
    const values = new Map<string, boolean>()
    const labels = new Map<string, string>()

    phase.statements.forEach(s => {
        values.set(s.id, s.value)
        labels.set(s.id, shortText(s.text))
    })

    return phase.steps.map(step => {
        const inputs = step.inputs.map(id => values.get(id) ?? false)
        const kind = step.kind
        const operator: OperatorKind | undefined =
            kind === 'nao' ? 'nao' : kind === 'combina' ? step.operator : undefined

        const expected = kind === 'valor'
            ? inputs[0]
            : applyOperator(operator!, inputs[0], inputs[1])

        values.set(step.id, expected)

        const label = kind === 'valor'
            ? labels.get(step.inputs[0]) ?? ''
            : OPERATOR_NAME[operator!]

        labels.set(step.id, label)

        const source = kind === 'valor'
            ? map.get(step.inputs[0])
            : undefined

        return {
            id: step.id,
            kind,
            question: step.question,
            tip: step.tip,
            operator,
            refs: [...step.inputs],
            expected,
            label,
            sourceText: source?.text ?? '',
            why: source?.why ?? '',
        }
    })
}

export function buildBeats(phase: PhaseConfig): Beat[] {
    if (phase.kind === 'valor') {
        return [buildValueBeat(phase.statement, phase.ask, phase.hint)]
    }

    if (phase.kind === 'negacao') {
        const base = buildValueBeat(phase.statement, phase.ask, phase.hint)
        return [
            base,
            {
                id: `${phase.statement.id}-nao`,
                kind: 'nao',
                question: phase.askAfter,
                tip: OPERATOR_RULE.nao,
                operator: 'nao',
                refs: [phase.statement.id],
                expected: applyNot(phase.statement.value),
                label: OPERATOR_NAME.nao,
                sourceText: phase.statement.text,
                why: phase.statement.why,
            },
        ]
    }

    if (phase.kind === 'dupla') {
        const left = buildValueBeat(phase.left, phase.ask, phase.hint)
        const right = buildValueBeat(phase.right, phase.ask, phase.hint)
        return [
            left,
            right,
            {
                id: `${phase.id}-op`,
                kind: 'combina',
                question: phase.askAfter,
                tip: OPERATOR_RULE[phase.operator],
                operator: phase.operator,
                refs: [phase.left.id, phase.right.id],
                expected: applyOperator(phase.operator, phase.left.value, phase.right.value),
                label: OPERATOR_NAME[phase.operator],
                sourceText: '',
                why: '',
            },
        ]
    }

    return pathBeats(phase)
}

export function runPhase(phase: PhaseConfig, answers: Map<string, boolean> = new Map()): PhaseTrace {
    const beats = buildBeats(phase)
    const trace: TraceEntry[] = beats.map(beat => ({
        id: beat.id,
        label: beat.label,
        value: beat.expected,
        operator: beat.operator,
        missed: answers.has(beat.id) && answers.get(beat.id) !== beat.expected,
    }))

    return {
        beats,
        trace,
        final: beats.length ? beats[beats.length - 1].expected : false,
        statements: phaseStatements(phase),
    }
}

export function expectedAt(phase: PhaseConfig, index: number): boolean {
    const beats = buildBeats(phase)
    return beats[Phaser0Clamp(index, 0, beats.length - 1)].expected
}

function Phaser0Clamp(v: number, min: number, max: number) {
    return v < min ? min : v > max ? max : v
}

export function finalValue(phase: PhaseConfig): boolean {
    return runPhase(phase).final
}

export function explainOperator(kind: OperatorKind, a: boolean, b?: boolean): string {
    const color = (v: boolean) => (v ? 'verde' : 'vermelho')
    const out = applyOperator(kind, a, b)

    if (kind === 'nao') {
        return `Entrou ${color(a)} no NÃO, então sai ${color(out)}.`
    }
    if (kind === 'e') {
        return out
            ? 'Os dois sinais estavam verdes, então o E deixou a energia passar.'
            : 'O E precisa dos dois verdes. Faltou um, então o sinal saiu vermelho.'
    }
    return out
        ? 'No OU, um sinal verde já basta para acender.'
        : 'No OU, os dois sinais estavam vermelhos, então não sobrou energia.'
}

export function explainBeat(beat: Beat, inputs: boolean[]): string {
    if (beat.kind === 'valor') {
        return `${beat.why} Por isso a frase é ${beat.expected ? 'verdadeira' : 'falsa'}.`
    }
    return explainOperator(beat.operator!, inputs[0], inputs[1])
}

export function mapNodes(trace: TraceEntry[]) {
    return trace.map((entry, i) => ({
        ...entry,
        step: i + 1,
        first: i === 0,
        last: i === trace.length - 1,
    }))
}