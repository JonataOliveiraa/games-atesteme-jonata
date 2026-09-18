import type { FaseDef, LevelDef, Piece, Slot, Verdict, World } from '../types'

/** Um compasso. Devagar o bastante para a nota acendendo ser vista. */
export const BEAT_MS = 1400

/**
 * NÍVEL 1 — o ciclo, e nada mais.
 *
 * Dois programas, e no atril só as peças que alguém vai pedir: cada um quer a
 * sua, e não há disputa. A criança vê o ciclo inteiro acontecer — pede, recebe,
 * toca, devolve — sem fila, sem travamento e sem nenhum jeito de perder vida.
 * A terceira peça só aparece na fase 3, quando um programa passa a precisar
 * dela: peça na tela sem dono é enfeite que a criança tenta decifrar.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        fases: [
            {
                id: 'n1-f1',
                guided: true,
                pieces: ['cpu', 'speaker'],
                programs: [
                    { id: 'joguinho', asks: [{ piece: 'cpu', notes: 3, rest: 0 }] },
                    { id: 'musiquinha', asks: [{ piece: 'speaker', notes: 3, rest: 0 }] },
                ],
            },
            {
                id: 'n1-f2',
                pieces: ['cpu', 'speaker'],
                programs: [
                    {
                        id: 'joguinho',
                        asks: [
                            { piece: 'cpu', notes: 3, rest: 0 },
                            { piece: 'cpu', notes: 2, rest: 2 },
                        ],
                    },
                    { id: 'musiquinha', asks: [{ piece: 'speaker', notes: 4, rest: 1 }] },
                ],
            },
            {
                id: 'n1-f3',
                pieces: ['cpu', 'speaker', 'screen'],
                programs: [
                    {
                        id: 'joguinho',
                        asks: [
                            { piece: 'cpu', notes: 3, rest: 0 },
                            { piece: 'screen', notes: 3, rest: 2 },
                        ],
                    },
                    {
                        id: 'musiquinha',
                        asks: [
                            { piece: 'speaker', notes: 3, rest: 1 },
                            { piece: 'speaker', notes: 2, rest: 3 },
                        ],
                    },
                ],
            },
        ],
    },
]

export const fasesIn = (level: number): number =>
    (LEVELS.find(l => l.level === level) ?? LEVELS[0]).fases.length

export const notesIn = (fase: FaseDef, id: string): number =>
    (fase.programs.find(p => p.id === id)?.asks ?? []).reduce((sum, a) => sum + a.notes, 0)

export const pointsFor = (clean: boolean): number => (clean ? 10 : 5)

/* ───────────────────────────── o mundo vivo ───────────────────────────── */

export function newWorld(fase: FaseDef): World {
    return {
        beat: 0,
        pieces: fase.pieces.slice(),
        busy: new Map(),
        slots: fase.programs.map<Slot>(p => ({
            id: p.id,
            asks: p.asks.slice(),
            next: 0,
            state: 'resting',
            inAsk: 0,
            played: 0,
            restLeft: p.asks[0]?.rest ?? 0,
        })),
    }
}

export const slotOf = (w: World, id: string): Slot | undefined => w.slots.find(s => s.id === id)

export const askOf = (s: Slot) => s.asks[s.next]

/** O balão aceso é isto, e nada mais: a peça que ele quer está livre. */
export function canPlayNow(w: World, s: Slot): boolean {
    if (s.state !== 'asking') return false
    const ask = askOf(s)
    return !!ask && !w.busy.has(ask.piece)
}

/** Entre os que esperam a MESMA peça, quem levantou o balão primeiro. */
export function queueHead(w: World, piece: Piece): string | undefined {
    return w.slots
        .filter(s => s.state === 'asking' && askOf(s)?.piece === piece)
        .sort((a, b) => (a.askedAt ?? 0) - (b.askedAt ?? 0))[0]?.id
}

/** O mundo prende a respiração quando a escolha tem dono. */
export function mustHold(w: World): boolean {
    return w.pieces.some(p =>
        !w.busy.has(p)
        && w.slots.filter(s => s.state === 'asking' && askOf(s)?.piece === p).length > 1)
}

export function judgeServe(w: World, id: string): Verdict {
    const s = slotOf(w, id)
    if (!s) return 'none'
    if (s.state !== 'asking') return 'wave'
    if (!canPlayNow(w, s)) return 'busy'
    return queueHead(w, askOf(s).piece) === id ? 'served' : 'skip-queue'
}

/** Entrega: o estado muda na hora, e a animação vem depois. */
export function serve(w: World, id: string): Piece | undefined {
    const s = slotOf(w, id)
    if (!s || s.state !== 'asking') return undefined
    const piece = askOf(s).piece
    w.busy.set(piece, id)
    s.holds = piece
    s.state = 'playing'
    s.inAsk = 0
    s.askedAt = undefined
    return piece
}

export interface BeatReport {
    /** Quem acendeu uma nota neste compasso. */
    notes: string[]
    /** Quem acabou o pedido e devolveu a peça. */
    freed: Array<{ id: string; piece: Piece }>
    /** Quem levantou o balão agora. */
    asked: string[]
    /** Quem acabou a partitura inteira. */
    finished: string[]
}

/**
 * UM COMPASSO.
 *
 * A ordem importa: primeiro toca e devolve, só depois alguém pede — assim a
 * peça que acabou de voltar já está livre para o balão que sobe no mesmo
 * compasso.
 */
export function beat(w: World): BeatReport {
    const out: BeatReport = { notes: [], freed: [], asked: [], finished: [] }

    w.slots.forEach(s => {
        if (s.state !== 'playing') return
        const ask = askOf(s)
        if (!ask) return
        s.inAsk += 1
        s.played += 1
        out.notes.push(s.id)
        if (s.inAsk < ask.notes) return

        const piece = s.holds!
        w.busy.delete(piece)
        s.holds = undefined
        s.inAsk = 0
        s.next += 1
        out.freed.push({ id: s.id, piece })

        const nextAsk = askOf(s)
        if (nextAsk) {
            s.state = 'resting'
            s.restLeft = nextAsk.rest
        } else {
            s.state = 'done'
            out.finished.push(s.id)
        }
    })

    w.beat += 1
    raise(w, out)
    return out
}

/** Quem descansou o bastante levanta o balão. Usado no compasso e na largada. */
export function raise(w: World, out: BeatReport) {
    w.slots.forEach(s => {
        if (s.state !== 'resting') return
        if (!askOf(s)) return
        if (s.restLeft > 0) {
            s.restLeft -= 1
            return
        }
        s.state = 'asking'
        s.askedAt = w.beat
        out.asked.push(s.id)
    })
}

export function openFase(w: World): BeatReport {
    const out: BeatReport = { notes: [], freed: [], asked: [], finished: [] }
    raise(w, out)
    return out
}

export const faseDone = (w: World): boolean => w.slots.every(s => s.state === 'done')

/* ───────────────────────────── as validações ──────────────────────────── */

const LIMIT = 200

/**
 * O maestro perfeito: sempre o primeiro da fila, em toda peça livre. Se ele
 * não termina a fase, criança nenhuma termina.
 */
function simulate(fase: FaseDef): { beats: number; stuck: number } {
    const w = newWorld(fase)
    openFase(w)

    for (let i = 0; i < LIMIT; i++) {
        let moved = true
        while (moved) {
            moved = false
            for (const piece of w.pieces) {
                if (w.busy.has(piece)) continue
                const head = queueHead(w, piece)
                if (!head) continue
                serve(w, head)
                moved = true
            }
        }

        if (faseDone(w)) return { beats: i, stuck: -1 }

        const alive = w.slots.some(s =>
            s.state === 'playing'
            || s.state === 'frozen'
            || (s.state === 'resting' && !!askOf(s)))
        if (!alive) return { beats: i, stuck: i }

        beat(w)
    }
    return { beats: LIMIT, stuck: -1 }
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        level.fases.forEach(fase => {
            const where = `nível ${level.level} · fase ${fase.id}`

            fase.programs.forEach(p => {
                if (!p.asks.length) problems.push(`${where}: ${p.id} não pede nada`)
                p.asks.forEach(a => {
                    if (!fase.pieces.includes(a.piece)) {
                        problems.push(`${where}: ${p.id} pede ${a.piece}, que não está no atril`)
                    }
                    if (a.notes < 1) problems.push(`${where}: ${p.id} tem pedido sem nota`)
                })
                const total = p.asks.reduce((sum, a) => sum + a.notes, 0)
                if (total > 8) problems.push(`${where}: a partitura de ${p.id} não cabe na tela`)
            })

            const run = simulate(fase)
            if (run.stuck >= 0) problems.push(`${where}: beco sem saída no compasso ${run.stuck}`)
            else if (run.beats >= LIMIT) problems.push(`${where}: não termina`)
        })
    })

    return problems
}
