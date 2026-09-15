/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A HABILIDADE, EM TRÊS LINHAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * EF04CO02 pede reconhecer objetos representáveis por REGISTROS, onde cada
 * componente é identificado por um NOME, e fazer manipulações sobre essa
 * representação.
 *
 * Aqui o objeto é uma ficha de avistamento de um posto de pesquisa no fundo
 * do mar. A criança preenche os campos nomeados (nível 1), corrige um valor
 * que não bate com a pista (nível 2) e atualiza um campo quando a situação
 * muda (nível 3).
 */

export type LevelNumber = 1 | 2 | 3

/**
 * Os quatro campos do registro.
 *
 * A lista é FECHADA de propósito: um registro cujos nomes de campo mudam de
 * fase para fase deixa de ser um registro e vira um formulário aleatório. O
 * que muda entre níveis é quantos campos aparecem, nunca quais existem.
 */
export type FieldId = 'creature' | 'color' | 'place' | 'status'

export type SightingRecord = Record<FieldId, string>
export type PartialSighting = Partial<SightingRecord>

export type CreatureId = 'octopus' | 'fish' | 'crab'

/**
 * A pista.
 *
 * `truth` é o registro COMPLETO e verdadeiro daquele avistamento; `sentence`
 * é a mesma coisa dita em português para a criança ler. O veredito sai da
 * comparação com `truth`, nunca de um campo "resposta" guardado à parte — é
 * o que permite os níveis 2 e 3 existirem sem gabarito paralelo.
 */
export interface Clue {
    creatureId: CreatureId
    truth: SightingRecord
    sentence: string
}

/** Uma novidade do nível 3: uma nota e o registro depois dela. */
export interface Change {
    note: string
    next: SightingRecord
    options: string[]
}

/**
 * O nível 3 NÃO tem pista.
 *
 * Em preencher e corrigir existe um registro verdadeiro contra o qual comparar,
 * e a pista é ele dito em português. Em atualizar não existe: a ficha JÁ está
 * certa, e o que chega é uma novidade que a torna desatualizada. Guardar um
 * `truth` ali seria inventar um gabarito paralelo justamente onde o §9 mandou
 * derivar a resposta da diferença entre o registro anterior e o novo.
 */
export type Task =
    | { kind: 'fill'; clue: Clue; initial: PartialSighting; fieldIds: FieldId[] }
    | { kind: 'correct'; clue: Clue; initial: SightingRecord; fieldIds: FieldId[]; options: string[] }
    | {
          kind: 'update'
          creatureId: CreatureId
          initial: SightingRecord
          fieldIds: FieldId[]
          changes: Change[]
      }

export type TaskKind = Task['kind']

/** Uma fase: uma ficha de uma criatura e um ferrolho da cápsula. */
export interface Phase {
    id: string
    /** Nome da ficha, mostrado no cabeçalho. */
    title: string
    task: Task
}

export interface LevelDef {
    level: LevelNumber
    phases: Phase[]
}

export type Mode = 'intro' | 'asking' | 'placing' | 'reveal' | 'done'
