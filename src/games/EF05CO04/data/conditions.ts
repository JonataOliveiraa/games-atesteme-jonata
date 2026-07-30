import type {
    ActionId,
    CityChallenge,
    ConditionId,
    DecisionLog,
    ItemId,
    PlayerState,
    Program,
    PropDef,
    SimulationResult,
    TileKind,
    TraceStep,
    WorldState,
} from '../types'

// ── Rótulos e ícones ──────────────────────────────────────────────────────

export interface TexIcon { key: string; frame?: number }

export const CONDITION_LABELS: Record<ConditionId, string> = {
    semaforo_verde: 'o semáforo está verde',
    porta_aberta: 'a porta está aberta',
    chovendo: 'está chovendo',
    tem_chave: 'estou com a chave',
    caminho_livre: 'o caminho está livre',
}

export const CONDITION_ICON: Record<ConditionId, TexIcon> = {
    semaforo_verde: { key: 'semaforo-verde' },
    porta_aberta: { key: 'porta-aberta' },
    chovendo: { key: 'gota' },
    tem_chave: { key: 'chave' },
    caminho_livre: { key: 'pedra' },
}

export const conditionSentence = (id: ConditionId) => `Se ${CONDITION_LABELS[id]}...`
export const conditionQuestion = (id: ConditionId) => `${CONDITION_LABELS[id]}?`

export const ACTION_LABELS: Record<ActionId, string> = {
    'andar': 'andar',
    'virar-esq': 'virar à esquerda',
    'virar-dir': 'virar à direita',
    'esperar': 'esperar',
    'pegar': 'pegar',
    'abrir': 'abrir',
}

export type ActionIcon =
    | { kind: 'seta'; angle: number }
    | { kind: 'tex'; key: string; frame?: number }

export const ACTION_ICON: Record<ActionId, ActionIcon> = {
    'andar': { kind: 'seta', angle: 0 },
    'virar-esq': { kind: 'seta', angle: -90 },
    'virar-dir': { kind: 'seta', angle: 90 },
    'esperar': { kind: 'tex', key: 'semaforo-vermelho' },
    'pegar': { kind: 'tex', key: 'itens', frame: 4 },
    'abrir': { kind: 'tex', key: 'chave' },
}

export const ITEM_FRAME: Record<ItemId, number> = {
    'guarda-chuva': 0,
    'livro': 1,
    'pao': 2,
    'carta': 3,
    'moeda': 4,
}

export const TILE_FRAME: Record<TileKind, number> = {
    asfalto: 0,
    grama: 1,
    calcada: 2,
}

// ── Leitura do mundo ──────────────────────────────────────────────────────

const DELTA = [
    { c: 0, r: -1 },
    { c: 1, r: 0 },
    { c: 0, r: 1 },
    { c: -1, r: 0 },
]

export const tileAt = (ch: CityChallenge, c: number, r: number): TileKind | null => {
    if (c < 0 || r < 0 || c >= ch.width || r >= ch.height) return null
    return ch.tiles[r * ch.width + c]
}

/** O guarda-chuva só aparece quando chove; a pedra, só quando o caminho está bloqueado. */
export function visibleProps(ch: CityChallenge, w: WorldState): PropDef[] {
    return ch.props.filter(p => {
        if (p.kind === 'pedra') return !w.caminhoLivre
        if (p.kind === 'item' && p.item === 'guarda-chuva') return w.chovendo
        return true
    })
}

const propAt = (props: PropDef[], c: number, r: number) =>
    props.find(p => p.at.c === c && p.at.r === r)

const hasSemaforo = (ch: CityChallenge) => ch.props.some(p => p.kind === 'semaforo')

export function evalCondition(id: ConditionId, env: WorldState, p: PlayerState): boolean {
    switch (id) {
        case 'semaforo_verde': return env.semaforoVerde
        case 'porta_aberta': return env.portaAberta
        case 'chovendo': return env.chovendo
        case 'tem_chave': return env.temChave
        case 'caminho_livre': return env.caminhoLivre
    }
    return false
}

export function simulate(
    ch: CityChallenge,
    program: Program,
    world: WorldState,
): SimulationResult {
    const env: WorldState = { ...world }
    const props = visibleProps(ch, env)
    const semaforo = hasSemaforo(ch)

    let p: PlayerState = {
        c: ch.start.c,
        r: ch.start.r,
        dir: ch.startDir,
        mochila: [],
        passos: 0,
    }

    const trace: TraceStep[] = []
    const decisions: DecisionLog[] = []
    let stop: 'bateu' | 'atropelado' | 'parou' | null = null

    const snap = (): PlayerState => ({ ...p, mochila: [...p.mochila] })

    const fail = (kind: TraceStep['kind'], before: PlayerState, why: typeof stop, target?: typeof ch.goal) => {
        trace.push({ kind, before, after: before, target })
        stop = why
    }

    const runAction = (action: ActionId) => {
        if (stop) return
        const before = snap()

        if (action === 'virar-esq' || action === 'virar-dir') {
            p.dir = (((p.dir + (action === 'virar-dir' ? 1 : 3)) % 4) as PlayerState['dir'])
            trace.push({ kind: 'virar', before, after: snap(), action })
            return
        }

        if (action === 'esperar') {
            env.semaforoVerde = true
            trace.push({ kind: 'esperar', before, after: snap(), action })
            return
        }

        if (action === 'pegar') {
            const here = propAt(props, p.c, p.r)
            if (!here || here.kind !== 'item' || !here.item) {
                fail('bater', before, 'parou')
                return
            }
            if (!p.mochila.includes(here.item)) p.mochila.push(here.item)
            trace.push({ kind: 'pegar', before, after: snap(), action, item: here.item })
            return
        }

        if (action === 'abrir') {
            const d = DELTA[p.dir]
            const ahead = propAt(props, p.c + d.c, p.r + d.r)
            if (!ahead || ahead.kind !== 'porta' || env.portaAberta) {
                fail('bater', before, 'parou', { c: p.c + d.c, r: p.r + d.r })
                return
            }
            env.portaAberta = true
            trace.push({ kind: 'abrir', before, after: snap(), action, target: ahead.at })
            return
        }

        const d = DELTA[p.dir]
        const target = { c: p.c + d.c, r: p.r + d.r }
        const tile = tileAt(ch, target.c, target.r)
        const obst = propAt(props, target.c, target.r)

        const bloqueado =
            tile === null ||
            tile === 'grama' ||
            obst?.kind === 'pedra' ||
            (obst?.kind === 'porta' && !env.portaAberta)

        if (bloqueado) {
            fail('bater', before, 'bateu', target)
            return
        }

        if (tile === 'asfalto' && semaforo && !env.semaforoVerde) {
            fail('atropelar', before, 'atropelado', target)
            return
        }

        p.c = target.c
        p.r = target.r
        p.passos++
        trace.push({ kind: 'andar', before, after: snap(), action, target })
    }

    const runList = (list: ActionId[]) => list.forEach(runAction)

    for (const stmt of program) {
        if (stop) break

        if (stmt.kind === 'acao') {
            runAction(stmt.action)
            continue
        }

        if (stmt.kind === 'repita') {
            for (let i = 0; i < stmt.times && !stop; i++) runList(stmt.corpo)
            continue
        }

        if (!stmt.condition) {
            stop = 'parou'
            break
        }

        const value = evalCondition(stmt.condition, env, p)
        const branch: 'entao' | 'senao' = value ? 'entao' : 'senao'
        const before = snap()

        trace.push({
            kind: 'verificar', before, after: before,
            condition: stmt.condition, conditionValue: value, branch,
        })
        decisions.push({ condition: stmt.condition, value, branch })

        runList(value ? stmt.entao : stmt.senao)
    }

    const noAlvo = p.c === ch.goal.c && p.r === ch.goal.r
    const seco = !env.chovendo || p.mochila.includes('guarda-chuva')

    const outcome: SimulationResult['outcome'] =
        stop === 'bateu' ? 'bateu'
            : stop === 'atropelado' ? 'atropelado'
                : !noAlvo ? 'parou'
                    : !seco ? 'molhado'
                        : 'chegou'

    return { trace, outcome, final: p, decisions }
}

// ── Veredito: precisa funcionar em TODOS os cenários ──────────────────────

export type VerdictReason = 'ok' | 'falhou' | 'condicao-constante' | 'incompleto'

export interface Verdict {
    ok: boolean
    reason: VerdictReason
    results: SimulationResult[]
    failedScenario: number
    /** Índice do SE cuja condição não muda entre os cenários. */
    deadDecision: number
}

const OUTCOME_MSG: Record<SimulationResult['outcome'], string> = {
    chegou: '',
    parou: 'O programa terminou fora do lugar certo.',
    bateu: 'Bateu de frente com um obstáculo.',
    atropelado: 'Entrou na rua com o semáforo fechado.',
    molhado: 'Chegou, mas encharcado — faltou o guarda-chuva.',
}

export const outcomeMessage = (o: SimulationResult['outcome']) => OUTCOME_MSG[o]

export function evaluate(ch: CityChallenge, program: Program): Verdict {
    const incompleto = program.some(s => s.kind === 'se' && !s.condition)
    if (incompleto || !program.length) {
        return { ok: false, reason: 'incompleto', results: [], failedScenario: -1, deadDecision: -1 }
    }

    const results = ch.scenarios.map(w => simulate(ch, program, w))

    const failedScenario = results.findIndex(r => r.outcome !== 'chegou')
    if (failedScenario >= 0) {
        return { ok: false, reason: 'falhou', results, failedScenario, deadDecision: -1 }
    }

    if (ch.scenarios.length > 1) {
        const total = Math.min(...results.map(r => r.decisions.length))
        for (let i = 0; i < total; i++) {
            const first = results[0].decisions[i].value
            if (results.every(r => r.decisions[i].value === first)) {
                return { ok: false, reason: 'condicao-constante', results, failedScenario: -1, deadDecision: i }
            }
        }
    }

    return { ok: true, reason: 'ok', results, failedScenario: -1, deadDecision: -1 }
}