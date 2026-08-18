/**
 * Modelo de dados do Formato Certo. Ver MECANICA.md §2.
 */

export type FormatId = 'date' | 'pixels' | 'text'

export type FieldKind = 'slot' | 'pixel'

export type PieceKind = 'numero' | 'mes' | 'cor' | 'palavra' | 'intrusa'

/**
 * Uma peça arrastável.
 *
 * `format` é `null` nas intrusas — elas não pertencem a formato nenhum e por
 * isso não encaixam em lugar nenhum. É a dica silenciosa da bandeja.
 */
export interface Piece {
    id: string
    kind: PieceKind
    /** O que aparece escrito na peça. */
    label: string
    /**
     * O que o leitor escreve ao ler esta peça.
     *
     * Quase sempre igual a `label`, mas não sempre: a peça de cor mostra uma
     * gota e lê "vermelho". Sem este campo o leitor teria que adivinhar como
     * escrever cada tipo — foi esse acoplamento que deixou a versão anterior
     * com um `drawPieceSymbol` de 35 linhas cheio de `if`.
     */
    reads: string
    /** Cor do ponto. Só em `kind: 'cor'`. */
    tone?: number
    format: FormatId | null
}

/**
 * Um campo dentro de uma caixa.
 *
 * A ORDEM do array de campos é a ordem de leitura. Não existe índice
 * separado: trocar duas peças de campo muda o que o leitor escreve, e é assim
 * que o Nível 3 funciona sem nenhuma regra extra.
 */
export interface Field {
    id: string
    /** Rótulo acima do poço: 'Dia', 'Mês', 'Ano', '1º', 'Ponto 1'. */
    label: string
    kind: FieldKind
    /** Qual peça este campo espera. */
    accepts: string
}

export interface FormatBoxSpec {
    id: string
    format: FormatId
    /** 'Data' */
    title: string
    /** 'dia, mês e ano' */
    subtitle: string
    fields: Field[]
    /** Nível 3: estado inicial defeituoso. fieldId → pieceId */
    preset?: Record<string, string>
}

export type Defect = 'ordem' | 'campo' | 'intrusa'

export interface Mission {
    id: string
    /** O pedido, em português normal. */
    request: string
    requestIcon: FormatId
    /** Nível 1: os três formatos oferecidos para escolha. */
    offer?: FormatId[]
    /** As caixas a preencher. Uma no N1 e N3, duas no N2. */
    boxes: FormatBoxSpec[]
    pieces: Piece[]
    /** Segundos. Herda do nível se ausente. */
    time?: number
    /** Só documenta a intenção; a lógica lê o `preset`. */
    defect?: Defect
    successLine: string
    hint: string
}

export interface Level {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    time: number
    missions: Mission[]
}

/* ─────────────────────────────────────────────── leitura do leitor */

/** Uma célula lida: o campo, o que estava nele e se era o esperado. */
export interface ReadCell {
    field: Field
    piece: Piece | null
    ok: boolean
}

export interface BoxReading {
    box: FormatBoxSpec
    cells: ReadCell[]
    ok: boolean
    /** Frase honesta quando falha. Vazia quando `ok`. */
    failure: string
}

/** Fase da missão. Ver MECANICA.md §1. */
export type MissionState =
    | 'briefing'
    | 'choosing'
    | 'filling'
    | 'reading'
    | 'solved'
    | 'timeout'
