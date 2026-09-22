import type { FeatureKind, LevelDef, LevelNumber, TrickKind } from '../types'

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  NÍVEL 1 — "Faça igual"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * SÓ O NÍVEL 1 EXISTE POR ENQUANTO, e é de propósito: o INSTRUCOES.md manda
 * entregar um nível para teste antes de abrir os três. Os níveis 2 (GIRAR e
 * REPITA 3×) e 3 (SE, com o corrimão molhado sorteado) estão desenhados no
 * PLANEJAMENTO.md e entram depois, sem mexer nesta forma.
 *
 * A fase CRESCE dentro do nível — 3, 4 e 5 manobras — em vez de repetir a
 * mesma coisa três vezes.
 */

const L1: FeatureKind[][] = [
    ['plano', 'rampa', 'caixote'],
    ['plano', 'caixote', 'plano', 'rampa'],
    ['plano', 'rampa', 'caixote', 'plano', 'rampa'],
]

const CARDS: TrickKind[] = ['empurrar', 'subir', 'pular']

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Faça igual',
        phases: L1.map(marks => ({ marks, palette: CARDS })),
    },
]

/**
 * A REGRA, e ela é uma FUNÇÃO — nunca um gabarito guardado na carta.
 *
 * O veredito sai do encontro entre o marco e a manobra que caiu naquela
 * posição, e é por isso que a mesma carta acerta num espaço e derruba no
 * outro. É essa dependência que faz a ORDEM ser o conteúdo do jogo.
 */
export function solves(feature: FeatureKind, trick: TrickKind | null): boolean {
    if (!trick) return false
    if (feature === 'plano') return trick === 'empurrar'
    if (feature === 'rampa') return trick === 'subir'
    return trick === 'pular'
}

/** A manobra que o fantasma faz em cada marco: é a linha a copiar. */
export function ghostLine(marks: FeatureKind[]): TrickKind[] {
    return marks.map(feature => CARDS.find(card => solves(feature, card)) as TrickKind)
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  AS PALAVRAS — todas elas cabem na boca de quem tem 6 anos
 * ═══════════════════════════════════════════════════════════════════════
 *
 * A primeira versão falava em "linha", "manobra", "caixote" e "DROP". Nenhuma
 * dessas palavras uma criança de 6 anos conhece: "linha" para ela é linha de
 * costura, "drop" não é português, e "caixote" ela nunca viu escrito.
 *
 * O jogo passou a falar de **CAMINHO** — que é o que ela vê desenhado no chão —,
 * de **CAIXA**, de **RAMPA** e de **VAI**. Nenhum termo de skate, nenhum termo
 * de programação. A única palavra difícil que sobrou é ALGORITMO, e ela é
 * difícil DE PROPÓSITO: é o nome que a habilidade manda ensinar, e ele só
 * aparece no fim, depois de ela ter feito um.
 */

/**
 * O que o balão diz quando ele cai. Diz O QUE ESTAVA ALI — nunca "tente de
 * novo" e nunca a resposta. Curto porque é balão, não enunciado.
 */
export function fallSentence(feature: FeatureKind): string {
    if (feature === 'rampa') return 'Aqui tem uma rampa!'
    if (feature === 'caixote') return 'Aqui tem uma caixa!'
    return 'Aqui não tem nada!'
}

export const PHASE_CHEER = ['Boa!', 'Mandou bem!', 'Que legal!']

export const ALGORITHM_LINE = 'Esses passos na ordem certa têm um nome: ALGORITMO!'

export const TOTAL_MARKS = LEVELS.reduce(
    (total, level) => total + level.phases.reduce((sum, phase) => sum + phase.marks.length, 0),
    0,
)

export function marksInLevel(level: LevelDef): number {
    return level.phases.reduce((sum, phase) => sum + phase.marks.length, 0)
}

export function marksBefore(level: LevelNumber): number {
    return LEVELS.filter(item => item.level < level).reduce(
        (total, item) => total + marksInLevel(item),
        0,
    )
}
