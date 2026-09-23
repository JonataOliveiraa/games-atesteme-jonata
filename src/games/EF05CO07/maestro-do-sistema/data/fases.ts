import type { FaseDef, LevelDef, Piece, ProgramDef, Slot, Verdict, World } from '../types'

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
        ferias: false,
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

    /*
     * NÍVEL 2 — a fila nasce, e com ela a única decisão do jogo.
     *
     * Três programas e três peças justas: agora dá para dois quererem a mesma
     * coisa. Quando isso acontece o compasso para sozinho, e a criança escolhe
     * DE QUEM É A VEZ — que é o que só o sistema operacional faz.
     *
     * Os dois balões nunca sobem no mesmo compasso: "toca quem chegou antes"
     * não quer dizer nada num empate, e a validação cobra isso fase a fase.
     *
     * O FÉRIAS aparece aqui porque só aqui ele tem o que mostrar: três
     * segundos sem maestro, todo mundo pedindo, e ninguém tocando.
     *
     * E a fase 3 estreia o TRAVAMENTO — a peça que não volta ao atril
     * sozinha.
     */
    {
        level: 2,
        ferias: true,
        fases: [
            {
                id: 'n2-f1',
                pieces: ['cpu', 'speaker', 'screen'],
                programs: [
                    // Ele segura o processador a fase inteira: é a espera dele
                    // que junta os outros dois na fila.
                    { id: 'joguinho', asks: [{ piece: 'cpu', notes: 4, rest: 0 }] },
                    {
                        id: 'musiquinha',
                        asks: [
                            { piece: 'speaker', notes: 2, rest: 0 },
                            { piece: 'cpu', notes: 2, rest: 0 },
                        ],
                    },
                    {
                        id: 'desenho',
                        asks: [
                            { piece: 'screen', notes: 3, rest: 0 },
                            { piece: 'cpu', notes: 2, rest: 0 },
                        ],
                    },
                ],
            },
            {
                id: 'n2-f2',
                pieces: ['cpu', 'speaker', 'screen'],
                programs: [
                    {
                        id: 'joguinho',
                        asks: [
                            { piece: 'cpu', notes: 2, rest: 0 },
                            { piece: 'speaker', notes: 3, rest: 0 },
                        ],
                    },
                    { id: 'musiquinha', asks: [{ piece: 'speaker', notes: 5, rest: 0 }] },
                    {
                        id: 'desenho',
                        asks: [
                            { piece: 'screen', notes: 3, rest: 0 },
                            { piece: 'speaker', notes: 2, rest: 0 },
                        ],
                    },
                ],
            },
            {
                id: 'n2-f3',
                pieces: ['cpu', 'speaker', 'screen'],
                programs: [
                    {
                        id: 'joguinho',
                        asks: [
                            { piece: 'cpu', notes: 3, rest: 0 },
                            { piece: 'screen', notes: 2, rest: 0 },
                        ],
                    },
                    {
                        id: 'musiquinha',
                        asks: [
                            { piece: 'speaker', notes: 4, rest: 0 },
                            { piece: 'screen', notes: 2, rest: 0 },
                        ],
                    },
                    /*
                     * ELE TRAVA SEGURANDO A TELA — e é o travamento que CRIA a
                     * fila desta fase: os outros dois já estão esperando a tela
                     * quando ele para. Enquanto o X não desce, ninguém toca, e
                     * o que a criança descobre é que a peça não volta sozinha.
                     */
                    {
                        id: 'desenho',
                        asks: [{ piece: 'screen', notes: 6, rest: 0, freezes: true }],
                    },
                ],
            },
        ],
    },

    /*
     * NÍVEL 3 — quatro peças, e o palco não é mais o que era.
     *
     * A memória entra no atril, e com ela um quarto pedido possível. Dois
     * esperam ao mesmo tempo, e dois programas travam ao longo do nível: o
     * X do maestro deixa de ser novidade e vira ferramenta.
     *
     * E um CONVIDADO chega no meio da fase, andando, com a cadeira dele
     * reservada desde o começo — ninguém se mexe para abrir espaço, porque o
     * palco que se reorganiza no meio da música é ilegível.
     */
    {
        level: 3,
        ferias: true,
        fases: [
            {
                id: 'n3-f1',
                pieces: ['cpu', 'speaker', 'screen', 'memory'],
                programs: [
                    {
                        id: 'joguinho',
                        asks: [
                            { piece: 'cpu', notes: 3, rest: 0 },
                            { piece: 'memory', notes: 2, rest: 0 },
                        ],
                    },
                    {
                        id: 'musiquinha',
                        asks: [
                            { piece: 'speaker', notes: 4, rest: 0 },
                            { piece: 'memory', notes: 2, rest: 0 },
                        ],
                    },
                    // A memória fica com ele um bom tempo, e é essa demora que
                    // põe os outros dois na fila por ela.
                    {
                        id: 'desenho',
                        asks: [
                            { piece: 'screen', notes: 2, rest: 0 },
                            { piece: 'memory', notes: 4, rest: 0 },
                        ],
                    },
                ],
            },
            {
                id: 'n3-f2',
                pieces: ['cpu', 'speaker', 'screen', 'memory'],
                programs: [
                    {
                        id: 'joguinho',
                        asks: [
                            { piece: 'cpu', notes: 2, rest: 0 },
                            { piece: 'memory', notes: 3, rest: 0 },
                        ],
                    },
                    {
                        id: 'musiquinha',
                        asks: [
                            { piece: 'speaker', notes: 3, rest: 0 },
                            { piece: 'memory', notes: 2, rest: 0 },
                        ],
                    },
                    {
                        id: 'desenho',
                        asks: [{ piece: 'screen', notes: 5, rest: 0, freezes: true }],
                    },
                ],
                // A chamada de vídeo chega no meio e entra na disputa pela
                // memória: o palco ficou mais cheio sem ninguém sair do lugar.
                guest: {
                    at: 3,
                    program: {
                        id: 'video',
                        asks: [
                            { piece: 'memory', notes: 2, rest: 0 },
                            { piece: 'cpu', notes: 2, rest: 1 },
                        ],
                    },
                },
            },
            {
                id: 'n3-f3',
                pieces: ['cpu', 'speaker', 'screen', 'memory'],
                programs: [
                    {
                        id: 'joguinho',
                        asks: [
                            { piece: 'cpu', notes: 3, rest: 0 },
                            { piece: 'memory', notes: 2, rest: 0 },
                        ],
                    },
                    {
                        id: 'musiquinha',
                        asks: [
                            { piece: 'speaker', notes: 2, rest: 0 },
                            { piece: 'memory', notes: 4, rest: 0 },
                        ],
                    },
                    {
                        id: 'desenho',
                        asks: [{ piece: 'screen', notes: 3, rest: 0, freezes: true }],
                    },
                ],
                guest: {
                    at: 4,
                    program: {
                        id: 'video',
                        asks: [
                            { piece: 'memory', notes: 2, rest: 0 },
                            { piece: 'cpu', notes: 2, rest: 1 },
                        ],
                    },
                },
            },
        ],
    },
]

export const fasesIn = (level: number): number =>
    (LEVELS.find(l => l.level === level) ?? LEVELS[0]).fases.length

export const notesIn = (fase: FaseDef, id: string): number =>
    (everyProgram(fase).find(p => p.id === id)?.asks ?? []).reduce((sum, a) => sum + a.notes, 0)

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
    /** Quem travou segurando a peça neste compasso. */
    froze: string[]
}

const emptyReport = (): BeatReport => ({
    notes: [], freed: [], asked: [], finished: [], froze: [],
})

/**
 * O X DO MAESTRO: encerra quem travou, e a peça volta ao atril.
 *
 * Encerrar é definitivo — o programa não volta a tocar, e a partitura dele
 * fica pela metade. É o preço de ter travado, e é a única coisa que o sistema
 * operacional pode fazer por ele.
 */
export function kill(w: World, id: string): Piece | undefined {
    const s = slotOf(w, id)
    if (!s || s.state !== 'frozen') return undefined
    const piece = s.holds
    if (piece) w.busy.delete(piece)
    s.holds = undefined
    s.inAsk = 0
    s.state = 'done'
    return piece
}

/** Quem está travado agora. O toque do maestro procura por aqui. */
export const frozenIds = (w: World): string[] =>
    w.slots.filter(s => s.state === 'frozen').map(s => s.id)

/**
 * O CONVIDADO ENTRA.
 *
 * Ele nasce em `resting` com o descanso do primeiro pedido, igual a todo
 * mundo: quem levanta o balão dele é o `raise` do compasso seguinte, e não
 * uma exceção aqui.
 */
export function joinGuest(w: World, program: ProgramDef): Slot {
    const slot: Slot = {
        id: program.id,
        asks: program.asks.slice(),
        next: 0,
        state: 'resting',
        inAsk: 0,
        played: 0,
        restLeft: program.asks[0]?.rest ?? 0,
    }
    w.slots.push(slot)
    return slot
}

/**
 * UM COMPASSO.
 *
 * A ordem importa: primeiro toca e devolve, só depois alguém pede — assim a
 * peça que acabou de voltar já está livre para o balão que sobe no mesmo
 * compasso.
 */
export function beat(w: World): BeatReport {
    const out: BeatReport = emptyReport()

    w.slots.forEach(s => {
        if (s.state !== 'playing') return
        const ask = askOf(s)
        if (!ask) return
        s.inAsk += 1
        s.played += 1
        out.notes.push(s.id)
        if (s.inAsk < ask.notes) return

        // Travar é NÃO devolver: `busy` continua com ele, e o atril fica com
        // um buraco que nenhum compasso preenche.
        if (ask.freezes) {
            s.state = 'frozen'
            out.froze.push(s.id)
            return
        }

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
    const out = emptyReport()
    raise(w, out)
    return out
}

export const faseDone = (w: World): boolean => w.slots.every(s => s.state === 'done')

/* ───────────────────────────── as validações ──────────────────────────── */

const LIMIT = 200

/** Quem vai estar no palco desta fase, o convidado incluído. */
export const everyProgram = (fase: FaseDef): ProgramDef[] =>
    fase.guest ? [...fase.programs, fase.guest.program] : fase.programs

/**
 * O maestro perfeito: sempre o primeiro da fila, em toda peça livre. Se ele
 * não termina a fase, criança nenhuma termina.
 */
interface Run {
    beats: number
    stuck: number
    /** Quantas vezes duas mãos se levantaram para a mesma peça livre. */
    holds: number
    /** Dessas, quantas foram EMPATE — dois balões no mesmo compasso. */
    ties: number
}

function simulate(fase: FaseDef): Run {
    const w = newWorld(fase)
    openFase(w)
    let holds = 0
    let ties = 0

    for (let i = 0; i < LIMIT; i++) {
        // O maestro perfeito encerra quem travou na hora: se a fase só fecha
        // porque alguém deixou o travado em paz, ela não fecha.
        frozenIds(w).forEach(id => kill(w, id))

        /*
         * A ÚNICA DECISÃO DIFÍCIL DO JOGO, contada aqui.
         *
         * Duas mãos levantadas para a mesma peça livre: é disso que a fila
         * serve. E se as duas subiram no MESMO compasso, "toca quem chegou
         * antes" não quer dizer nada — a criança escolhe certo por sorte, e
         * a que ela escolher errado cobra uma vida. Empate é defeito.
         */
        w.pieces.forEach(p => {
            if (w.busy.has(p)) return
            const waiting = w.slots.filter(s => s.state === 'asking' && askOf(s)?.piece === p)
            if (waiting.length < 2) return
            holds += 1
            const first = Math.min(...waiting.map(s => s.askedAt ?? 0))
            if (waiting.filter(s => (s.askedAt ?? 0) === first).length > 1) ties += 1
        })

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

        if (faseDone(w)) return { beats: i, stuck: -1, holds, ties }

        const guestToCome = !!fase.guest && w.beat < fase.guest.at
        const alive = guestToCome || w.slots.some(s =>
            s.state === 'playing'
            || s.state === 'frozen'
            || (s.state === 'resting' && !!askOf(s)))
        if (!alive) return { beats: i, stuck: i, holds, ties }

        beat(w)
        if (fase.guest && w.beat === fase.guest.at) joinGuest(w, fase.guest.program)
    }
    return { beats: LIMIT, stuck: -1, holds, ties }
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        // Cada coisa nova nasce no nível em que ela é o assunto. Travamento e
        // FÉRIAS não existem antes de haver fila; o convidado é do nível 3.
        const freezes = level.fases.reduce(
            (n, f) => n + everyProgram(f).reduce(
                (k, p) => k + p.asks.filter(a => a.freezes).length, 0), 0)
        if (level.level === 1 && freezes) {
            problems.push(`nível 1: ${freezes} travamentos — o nível 1 é só o ciclo`)
        }
        if (level.level === 1 && level.ferias) {
            problems.push('nível 1: FÉRIAS antes de existir fila')
        }
        if (level.level > 1 && !level.ferias) {
            problems.push(`nível ${level.level}: sem FÉRIAS depois de ele ter nascido`)
        }
        if (level.fases.some(f => f.guest) && level.level !== 3) {
            problems.push(`nível ${level.level}: o convidado surpresa é do nível 3`)
        }

        level.fases.forEach(fase => {
            const where = `nível ${level.level} · fase ${fase.id}`

            if (fase.guest && everyProgram(fase).length > 4) {
                problems.push(`${where}: mais de 4 programas no palco`)
            }
            if (fase.guest && fase.programs.some(p => p.id === fase.guest!.program.id)) {
                problems.push(`${where}: o convidado já está no palco`)
            }
            if (fase.guest && fase.guest.at < 1) {
                problems.push(`${where}: o convidado entra antes de a fase começar`)
            }

            everyProgram(fase).forEach(p => {
                if (!p.asks.length) problems.push(`${where}: ${p.id} não pede nada`)
                p.asks.forEach((a, i) => {
                    if (!fase.pieces.includes(a.piece)) {
                        problems.push(`${where}: ${p.id} pede ${a.piece}, que não está no atril`)
                    }
                    if (a.notes < 1) problems.push(`${where}: ${p.id} tem pedido sem nota`)
                    // Encerrar é definitivo: um travamento no meio apagaria os
                    // pedidos seguintes sem a criança entender por quê.
                    if (a.freezes && i !== p.asks.length - 1) {
                        problems.push(`${where}: ${p.id} trava antes do último pedido`)
                    }
                })
                const total = p.asks.reduce((sum, a) => sum + a.notes, 0)
                if (total > 8) problems.push(`${where}: a partitura de ${p.id} não cabe na tela`)
            })

            const run = simulate(fase)
            if (run.stuck >= 0) problems.push(`${where}: beco sem saída no compasso ${run.stuck}`)
            else if (run.beats >= LIMIT) problems.push(`${where}: não termina`)
            if (run.ties) problems.push(`${where}: ${run.ties} empates na fila (dois balões no mesmo compasso)`)
            if (level.level === 1 && run.holds) problems.push(`${where}: fila no nível 1`)
            if (level.level > 1 && !run.holds) problems.push(`${where}: nenhuma fila — não há o que decidir`)
        })
    })

    return problems
}
