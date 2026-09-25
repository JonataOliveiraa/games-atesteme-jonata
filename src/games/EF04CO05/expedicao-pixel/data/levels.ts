import type { Channel, LevelDef, Mix, Step, TapSteps } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS RODADAS, E A REGRA QUE AS JULGA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── A PROGRESSÃO PLANEJADA ───────────────────────────────────────────────
 *
 *   N1  cada torneira é uma cor     → vermelho, azul, verde
 *   N2  as luzes se somam           → amarelo, rosa, branco   ← a descoberta
 *   N3  não é só aberta: é quanto   → laranja, verde-água, roxo
 *
 * ── POR QUE ESTA ORDEM ───────────────────────────────────────────────────
 *
 * O nível 1 ensina o gesto e o mapa das três torneiras. O 2 é o "uau": ninguém
 * precisa contar que vermelho mais verde dá amarelo, a criança abre as duas e vê
 * — e é o oposto do que ela conhece de tinta. O 3 troca a pergunta de "quais"
 * para "quanto", e é aí que a tentativa e erro para de funcionar: com quatro
 * posições em três torneiras são 64 combinações, e só sai quem entendeu que cada
 * torneira controla uma quantidade.
 *
 * O BRANCO fecha o nível 2 de propósito: as três juntas dão branco, que é a
 * razão de a luz do dia parecer sem cor. É a última coisa que a criança
 * esperaria de uma mistura.
 */

export const POINTS_CLEAN = 10
export const POINTS_AFTER_STALL = 5

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Cada torneira é uma cor',
        objective: 'Abra a torneira da cor que a festa pediu.',
        tapSteps: 2,
        rounds: [
            {
                id: 'f1-1',
                nome: 'VERMELHO',
                target: { r: 3, g: 0, b: 0 },
            },
            {
                id: 'f1-2',
                nome: 'AZUL',
                target: { r: 0, g: 0, b: 3 },
            },
            {
                id: 'f1-3',
                nome: 'VERDE',
                target: { r: 0, g: 3, b: 0 },
            },
        ],
    },

    {
        level: 2,
        title: 'As luzes se somam',
        objective: 'Abra mais de uma torneira ao mesmo tempo.',
        tapSteps: 2,
        rounds: [
            {
                id: 'f2-1',
                nome: 'AMARELO',
                target: { r: 3, g: 3, b: 0 },
            },
            {
                id: 'f2-2',
                nome: 'ROSA',
                target: { r: 3, g: 0, b: 3 },
            },
            {
                id: 'f2-3',
                nome: 'BRANCO',
                target: { r: 3, g: 3, b: 3 },
            },
        ],
    },

    {
        level: 3,
        title: 'Não é só acesa: é quanto',
        objective: 'Agora cada torneira abre em quatro posições.',
        tapSteps: 4,
        rounds: [
            {
                id: 'f3-1',
                nome: 'LARANJA',
                target: { r: 3, g: 2, b: 0 },
            },
            {
                id: 'f3-2',
                nome: 'VERDE-ÁGUA',
                target: { r: 0, g: 3, b: 2 },
            },
            {
                id: 'f3-3',
                nome: 'ROXO',
                target: { r: 2, g: 0, b: 3 },
            },
        ],
    },
]

export const TOTAL_ROUNDS = LEVELS.reduce((sum, l) => sum + l.rounds.length, 0)

export const CHANNELS: Channel[] = ['r', 'g', 'b']

export const CHANNEL_NAME: Record<Channel, string> = {
    r: 'VERMELHO',
    g: 'VERDE',
    b: 'AZUL',
}

/* ────────────────────────────────────────────────── a regra, como função */

/**
 * O passo vira luz. É o ÚNICO lugar onde 0–3 vira 0–255.
 *
 * A criança vê `3`; o computador guarda 255. A ponte entre os dois mora aqui, e
 * é a última frase que o jogo diz.
 */
export const toRgb = (m: Mix) => ({ r: m.r * 85, g: m.g * 85, b: m.b * 85 })

/** A cor que o foguete acende, que o estouro pinta e que a placa mostra. */
export const toColor = (m: Mix): number => {
    const { r, g, b } = toRgb(m)
    return (r << 16) | (g << 8) | b
}

export const matches = (a: Mix, b: Mix) => a.r === b.r && a.g === b.g && a.b === b.b

/** Direção da diferença, canal por canal: −1 falta, +1 passou, 0 bate. */
export const gap = (made: Mix, target: Mix): Record<Channel, -1 | 0 | 1> => {
    const one = (c: Channel) => (made[c] < target[c] ? -1 : made[c] > target[c] ? 1 : 0)
    return { r: one('r'), g: one('g'), b: one('b') }
}

/**
 * O que o toque faz com a torneira.
 *
 * Com duas paradas ela abre e fecha; com quatro, percorre o quanto. É o mesmo
 * gesto e o mesmo controle — o nível 3 só acrescenta posições.
 */
export const nextStep = (current: Step, steps: TapSteps): Step =>
    steps === 2 ? (current === 0 ? 3 : 0) : (((current + 1) % 4) as Step)

/** O número embaixo da torneira: `1` no abre/fecha, `0..3` no quanto. */
export const digitOf = (value: Step, steps: TapSteps): string =>
    steps === 2 ? (value > 0 ? '1' : '0') : String(value)

export const isDark = (m: Mix) => m.r === 0 && m.g === 0 && m.b === 0

/**
 * Por que o fogo não bateu.
 *
 * Diz a DIREÇÃO, nunca o valor: "faltou vermelho" manda olhar; "abra a segunda
 * torneira" dispensa olhar. E nunca é "tente de novo", que não diz o que ver.
 */
export function missText(made: Mix, target: Mix): string {
    if (isDark(made)) return 'O foguete subiu apagado! Abra pelo menos uma torneira.'

    const d = gap(made, target)
    const falta = CHANNELS.find(c => d[c] < 0)
    if (falta) return `Quase! Faltou ${CHANNEL_NAME[falta]} nesse fogo.`
    const sobra = CHANNELS.find(c => d[c] > 0)
    if (sobra) return `Passou: tinha ${CHANNEL_NAME[sobra]} demais nesse fogo.`
    return 'Olhe a cor da placa e compare com a sua luz.'
}

/** O canal mais longe do alvo. É ele que pulsa depois do segundo erro. */
export function worstChannel(made: Mix, target: Mix): Channel {
    return CHANNELS.reduce(
        (worst, c) => (Math.abs(made[c] - target[c]) > Math.abs(made[worst] - target[worst]) ? c : worst),
        'r' as Channel,
    )
}

/**
 * Confere as rodadas ao carregar.
 *
 * A terceira regra é a que importa: uma rodada com os três canais iguais pede
 * preto (não estoura) ou branco (que só tem lugar no fim do nível 2), e nenhuma
 * das duas ensina o que o nível está ensinando.
 */
export function validateLevels(): void {
    LEVELS.forEach(level => {
        if (!level.rounds.length) throw new Error(`[fogos] nível ${level.level} sem rodada`)

        level.rounds.forEach(round => {
            const valores = CHANNELS.map(c => round.target[c])

            if (valores.some(v => v < 0 || v > 3)) {
                throw new Error(`[fogos] ${round.id}: quantidade fora de 0..3`)
            }
            if (level.tapSteps === 2 && valores.some(v => v !== 0 && v !== 3)) {
                throw new Error(`[fogos] ${round.id}: a torneira só abre e fecha neste nível`)
            }
            if (isDark(round.target)) {
                throw new Error(`[fogos] ${round.id}: fogo apagado não estoura`)
            }
            if (!round.nome.trim()) {
                throw new Error(`[fogos] ${round.id}: a placa precisa do nome da cor`)
            }
        })
    })
}
