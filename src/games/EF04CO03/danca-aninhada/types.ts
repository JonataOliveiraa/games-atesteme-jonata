/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A HABILIDADE, EM TRÊS LINHAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * EF04CO03 pede CRIAR e SIMULAR algoritmos com sequências e repetições
 * simples e aninhadas, definidas e indefinidas.
 *
 * Aqui a criança monta uma ficha de coreografia e toca em DANÇAR. O nível 1
 * tem um laço só; o 2 põe um laço DENTRO do outro; o 3 troca o número do laço
 * externo por uma condição que muda durante a apresentação.
 *
 * ── POR QUE A FICHA É UMA ÁRVORE ─────────────────────────────────────────
 *
 * Nada aqui guarda "a resposta certa" como uma lista de movimentos. A ficha
 * vira uma árvore de comandos, a árvore é EXECUTADA, e o que se compara é o
 * traço da execução com o pedido. É o que faz o nível 3 poder existir: um
 * programa sem número, rodado duas vezes com durações diferentes de luz.
 */

export type LevelNumber = 1 | 2 | 3

/** Os três passos. O nome pedagógico está na estrutura, não no movimento. */
export type Move = 'step' | 'clap' | 'spin'

/** A condição do laço indefinido. `lightOn` é o distrator plausível. */
export type Signal = 'lightOff' | 'lightOn'

/**
 * Os espaços editáveis da ficha.
 *
 * São poucos e têm nome fixo porque cada um precisa ser CULPÁVEL: quando a
 * dança diverge do pedido, o jogo aponta o espaço responsável, e para isso
 * cada movimento executado carrega de qual espaço ele saiu.
 */
export type SlotId = 'outer' | 'lead1' | 'lead2' | 'innerTimes' | 'innerMove' | 'after'

export type SlotValue =
    | { kind: 'times'; times: number }
    | { kind: 'move'; move: Move }
    | { kind: 'signal'; signal: Signal }

export type SlotKind = SlotValue['kind']

export type Values = Partial<Record<SlotId, SlotValue>>

/**
 * O FORMATO da ficha de uma fase — quais espaços existem, e não o que vai
 * neles. Quem decide o conteúdo é a criança.
 *
 *   leading   movimentos direto no corpo do laço externo (nível 1)
 *   nested    existe um laço DENTRO do externo (níveis 2 e 3)
 *   trailing  movimento depois do laço interno, ainda dentro do externo
 */
export interface SheetDef {
    outer: 'times' | 'until'
    leading: 0 | 1 | 2
    nested: boolean
    trailing: boolean
}

export type Command =
    | { kind: 'move'; move: Move; slot: SlotId }
    | { kind: 'repeat'; times: number; body: Command[]; slot: SlotId }
    | { kind: 'repeatUntil'; signal: Signal; body: Command[]; slot: SlotId }

/** Um movimento executado, com o endereço dele no algoritmo. */
export interface Beat {
    move: Move
    /** volta do laço externo, 1-based */
    outer: number
    /** volta do laço interno, ou `null` quando o movimento está fora dele */
    inner: number | null
    slot: SlotId
}

export interface Trace {
    beats: Beat[]
    rounds: number
    /** `limit` é a trava de seis refrões: a cena para com aviso, nunca congela. */
    stopped: 'end' | 'limit'
}

export type Reason = 'move' | 'innerMore' | 'innerLess' | 'roundsMore' | 'roundsLess' | 'signal' | 'limit'

/** A PRIMEIRA diferença entre o que o pedido queria e o que a ficha fez. */
export interface Divergence {
    /** índice do movimento na execução; pode ser igual ao total, quando faltou. */
    index: number
    slot: SlotId
    expected: Move | null
    got: Move | null
    reason: Reason
}

export interface PhaseDef {
    id: string
    /** O nome da coreografia, no cabeçalho e no fecho da fase. */
    title: string
    /** O refrão: a sequência que se repete. */
    pattern: Move[]
    /** Quantas vezes o refrão aparece. Ausente no nível 3: quem decide é a luz. */
    rounds?: number
    sheet: SheetDef
    /** Nível 3: em quantos refrões a luz apaga, nos dois ensaios. */
    signalPlans?: [number, number]
}

export interface LevelDef {
    level: LevelNumber
    phases: PhaseDef[]
}

export type Mode = 'building' | 'dancing' | 'locked' | 'reveal' | 'done'
