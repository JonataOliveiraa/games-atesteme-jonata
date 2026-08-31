import type {
    Language, LevelDef, Message, PhaseDef, SubjectDef, SubjectId,
} from '../types'

export const SUBJECTS: Record<SubjectId, SubjectDef> = {
    festa: { id: 'festa', word: 'FESTA', phrase: 'A festa é sábado!', texture: 'bolo' },
    lapis: { id: 'lapis', word: 'LÁPIS', phrase: 'Traga o lápis amarelo', texture: 'lapis' },
    treino: { id: 'treino', word: 'TREINO', phrase: 'O treino mudou de hora', texture: 'relogio' },
    parabens: { id: 'parabens', word: 'PARABÉNS', phrase: 'Feliz aniversário!', texture: 'presente' },
}

const ALL_SUBJECTS = Object.values(SUBJECTS)

/**
 * Assuntos do mesmo mundo. É por aqui que o nível 3 aperta: o distrator deixa
 * de ser qualquer coisa e passa a ser algo parecido, que só se separa olhando
 * direito. Subir dificuldade por semelhança, e não por velocidade, é o que
 * respeita uma criança que está comparando.
 */
const NEAR: Record<SubjectId, SubjectId> = {
    festa: 'parabens',
    parabens: 'festa',
    lapis: 'treino',
    treino: 'lapis',
}

// ─────────────────────────────────────────────────── a regra é um teste

/**
 * O veredito. As DUAS condições importam: sem a primeira qualquer plaquinha
 * serve; sem a segunda a criança passaria desenho para desenho, e o jogo
 * viraria "ache a figura igual" — memória, não linguagem.
 */
export const sameInformation = (ball: Message, plaque: Message) =>
    ball.subject.id === plaque.subject.id && ball.language !== plaque.language

// ─────────────────────────────────────────────────── níveis e fases

const phase = (players: number, languages: Language[], nearMiss = false): PhaseDef =>
    ({ players, languages, nearMiss })

const TWO: Language[] = ['desenho', 'fala']
const THREE: Language[] = ['desenho', 'fala', 'palavra']

/**
 * Três níveis, TRÊS FASES cada. A fase é uma travessia inteira: três passes
 * até o destino.
 *
 * A palavra escrita só entra no nível 2 — criança de 1º ano está aprendendo a
 * ler, e a ideia de "a mesma coisa dita de outro jeito" precisa estar de pé
 * antes, com duas linguagens que ela lê de olho.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Fala e desenho',
        phases: [phase(3, TWO), phase(3, TWO), phase(4, TWO)],
    },
    {
        level: 2,
        name: 'Entra a palavra',
        phases: [phase(4, THREE), phase(5, THREE), phase(5, THREE)],
    },
    {
        level: 3,
        name: 'Quadra cheia',
        phases: [phase(5, THREE, true), phase(6, THREE, true), phase(6, THREE, true)],
    },
]

/** Três passes por fase: dois colegas e a entrega no destino. */
export const PASSES_PER_PHASE = 3

export const passesInLevel = (level: LevelDef) => level.phases.length * PASSES_PER_PHASE

export const TOTAL_PASSES = LEVELS.reduce((sum, l) => sum + passesInLevel(l), 0)

export const passesBefore = (levelNumber: number) =>
    LEVELS.slice(0, levelNumber - 1).reduce((sum, l) => sum + passesInLevel(l), 0)

// ─────────────────────────────────────────────────── montagem da fase

const pick = <T>(list: T[], rng: () => number) => list[Math.floor(rng() * list.length) % list.length]

export interface PhasePlan {
    subject: SubjectDef
    /** A corrente de linguagens: a de partida e uma por passe. */
    chain: Language[]
}

/**
 * A corrente é sorteada de uma vez, antes de começar: cada parada muda de
 * linguagem, e nenhuma se repete duas vezes seguidas.
 */
export function planPhase(p: PhaseDef, rng: () => number): PhasePlan {
    const subject = pick(ALL_SUBJECTS, rng)
    const chain: Language[] = [pick(p.languages, rng)]

    while (chain.length <= PASSES_PER_PHASE) {
        const options = p.languages.filter(l => l !== chain[chain.length - 1])
        chain.push(pick(options, rng))
    }

    return { subject, chain }
}

/**
 * As plaquinhas de uma parada. Exatamente UMA está certa; as outras falam de
 * assuntos diferentes, e o desta parada nunca aparece duas vezes.
 */
export function dealPlaques(
    p: PhaseDef,
    plan: PhasePlan,
    right: Language,
    count: number,
    rng: () => number,
): Message[] {
    const out: Message[] = [{ subject: plan.subject, language: right }]

    const pool = p.nearMiss
        ? [SUBJECTS[NEAR[plan.subject.id]], ...ALL_SUBJECTS]
        : ALL_SUBJECTS
    const others = pool.filter(s => s.id !== plan.subject.id)

    while (out.length < count) {
        out.push({ subject: pick(others, rng), language: pick(p.languages, rng) })
    }

    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

// ─────────────────────────────────────────────────── as frases

export const KEY_LINE = 'Olha: a mensagem é a mesma, só mudou o jeito de viajar!'

export const PHASE_CHEER = [
    'A mensagem chegou!',
    'Passe perfeito!',
    'Entregue no destino!',
]

/** O erro diz o que não bateu, nunca qual é o certo. */
export const missSentence = (plaque: Message) =>
    `Esse colega fala de OUTRA coisa: ${plaque.subject.phrase.toLowerCase()}`

export const starsFor = (firstTry: number, total: number) => {
    const pct = total > 0 ? firstTry / total : 0
    return pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1
}
