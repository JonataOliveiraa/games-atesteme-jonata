import type { Act, Card, Cycle, LevelDef, Outcome } from '../types'
import { cards, owl } from './cast'

/**
 * Um passo do robô. Bem devagar de propósito: é o tempo de a criança ver a
 * linha da carta acender, o corte para a coruja e a ação acontecer.
 */
export const STEP_MS = 900

/**
 * Quantos passos parado antes de o robô desistir. Tem de ser MAIOR que a
 * fase acordada mais longa — senão a carta certa, que manda esperar enquanto a
 * coruja olha, seria acusada de nunca chegar.
 */
export const STUCK_STEPS = 5

export const isAwake = (cycle: Cycle, t: number): boolean =>
    t % (cycle.asleep + cycle.awake) >= cycle.asleep

/** O ramo que dispara neste passo. É daqui que sai o que acende na carta. */
export const branchOf = (c: Card, awake: boolean): 'then' | 'else' =>
    (c.asks === 'acordada' ? awake : !awake) ? 'then' : 'else'

export const actOf = (c: Card, awake: boolean): Act =>
    branchOf(c, awake) === 'then' ? c.then : c.otherwise

/** O veredito de UM passo, contra o mundo daquele instante. */
export function stepOutcome(
    c: Card,
    awake: boolean,
    stuckFor: number,
): 'andou' | 'escondeu' | 'visto' | 'parado' {
    if (actOf(c, awake) === 'andar') return awake ? 'visto' : 'andou'
    return stuckFor >= STUCK_STEPS ? 'parado' : 'escondeu'
}

/** A travessia inteira, sem desenho nenhum. O jogo anima o mesmo caminho. */
export function simulateLeg(c: Card, cycle: Cycle, steps: number, startAt: number): Outcome {
    let t = startAt
    let done = 0
    let stuck = 0

    while (done < steps) {
        const verdict = stepOutcome(c, isAwake(cycle, t), stuck)
        if (verdict === 'visto' || verdict === 'parado') return verdict
        if (verdict === 'andou') { done += 1; stuck = 0 }
        else stuck += 1
        t += STEP_MS
    }
    return 'chegou'
}

const SAMPLES = 32

const sampleOffsets = (cycle: Cycle) => {
    const span = cycle.asleep + cycle.awake
    return Array.from({ length: SAMPLES }, (_, i) => (span * i) / SAMPLES)
}

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        rooms: [
            {
                id: 'sala-1-1',
                guided: true,
                legs: [{ owl: 'ru', steps: 2, cards: ['certa', 'invertida'] }],
                close: 'Cheguei!',
            },
            {
                id: 'sala-1-2',
                legs: [{ owl: 'ru', steps: 3, cards: ['certa', 'invertida'] }],
                close: 'De novo!',
            },
            {
                id: 'sala-1-3',
                legs: [{ owl: 'ru', steps: 4, cards: ['certa', 'invertida'] }],
                close: 'Consegui!',
            },
        ],
    },

    /*
     * NÍVEL 2 — entra a carta que ESCONDE SEMPRE.
     *
     * Ela parece a mais segura do mundo e falha de um jeito novo: o robô nunca
     * chega. É a carta que ensina que o SENÃO também precisa estar certo. A
     * sala 3 traz duas corujas, uma por trecho, com ritmos diferentes.
     */
    {
        level: 2,
        rooms: [
            {
                id: 'sala-2-1',
                legs: [{ owl: 'ru', steps: 3, cards: ['certa', 'invertida', 'sempre'] }],
                close: 'Passei!',
            },
            {
                id: 'sala-2-2',
                legs: [{ owl: 'nina', steps: 4, cards: ['certa', 'invertida', 'sempre'] }],
                close: 'Essa era rápida!',
            },
            {
                id: 'sala-2-3',
                legs: [
                    { owl: 'ru', steps: 3, cards: ['certa', 'invertida', 'sempre'] },
                    { owl: 'nina', steps: 3, cards: ['certa', 'invertida', 'sempre'] },
                ],
                close: 'Duas corujas!',
            },
        ],
    },

    /*
     * NÍVEL 3 — a mesma regra, a sala grande.
     *
     * Nenhuma ideia nova: dois trechos por sala, cada um com a sua guardiã, e
     * o Zé, que troca de estado depressa. Consolidar vale mais do que inventar
     * uma quarta coisa no fim do jogo.
     */
    {
        level: 3,
        rooms: [
            {
                id: 'sala-3-1',
                legs: [
                    { owl: 'nina', steps: 3, cards: ['certa', 'invertida', 'sempre'] },
                    { owl: 'ze', steps: 4, cards: ['certa', 'invertida', 'sempre'] },
                ],
                close: 'Que rapidez!',
            },
            {
                id: 'sala-3-2',
                legs: [
                    { owl: 'ze', steps: 4, cards: ['certa', 'invertida', 'sempre'] },
                    { owl: 'ru', steps: 4, cards: ['certa', 'invertida', 'sempre'] },
                ],
                close: 'Ninguém me viu!',
            },
            {
                id: 'sala-3-3',
                legs: [
                    { owl: 'ru', steps: 4, cards: ['certa', 'invertida', 'sempre'] },
                    { owl: 'nina', steps: 4, cards: ['certa', 'invertida', 'sempre'] },
                ],
                close: 'A última!',
            },
        ],
    },
]

/** Quantos trechos tem um nível. O progresso da plataforma é sobre isso. */
export const legsIn = (level: number): number => {
    const found = LEVELS.find(l => l.level === level) ?? LEVELS[0]
    return found.rooms.reduce((sum, room) => sum + room.legs.length, 0)
}

export const pointsFor = (afterLock: boolean) => (afterLock ? 5 : 10)

/**
 * Sala sem saída é o pior defeito possível deste jogo: a criança tenta para
 * sempre. Estas checagens rodam uma vez, no carregamento, e falham alto.
 */
export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        level.rooms.forEach(room => {
            if (!room.legs.length) problems.push(`${room.id}: sala sem trecho`)

            room.legs.forEach((leg, index) => {
                const where = `${room.id} trecho ${index + 1}`
                const cycle = owl(leg.owl).cycle
                const offered = cards(leg.cards)

                if (offered.length < 2) problems.push(`${where}: menos de duas cartas`)
                if (leg.steps < 2 || leg.steps > 7) problems.push(`${where}: ${leg.steps} passos`)
                if (STUCK_STEPS * STEP_MS <= cycle.awake) {
                    problems.push(`${where}: esperar a coruja passar conta como desistir`)
                }

                const offsets = sampleOffsets(cycle)
                const winners = offered.filter(c =>
                    offsets.every(at => simulateLeg(c, cycle, leg.steps, at) === 'chegou'))

                if (winners.length !== 1) {
                    problems.push(`${where}: ${winners.length} cartas atravessam sempre — tem de ser uma`)
                }

                offered
                    .filter(c => !winners.includes(c))
                    .forEach(c => {
                        const lucky = offsets.some(at => simulateLeg(c, cycle, leg.steps, at) === 'chegou')
                        if (lucky) problems.push(`${where}: a carta ${c.id} às vezes dá certo por sorte`)
                    })
            })
        })
    })

    return problems
}

/** Qual das cartas oferecidas resolve o trecho. A dica e a trava usam isso. */
export function solverIndex(offered: Card[], cycle: Cycle, steps: number): number {
    const offsets = sampleOffsets(cycle)
    return offered.findIndex(c =>
        offsets.every(at => simulateLeg(c, cycle, steps, at) === 'chegou'))
}
