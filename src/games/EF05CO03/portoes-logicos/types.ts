/**
 * ══════════════════════════════════════════════════════════════════════════
 *  EF05CO03 — negação, conjunção e disjunção sobre valores verdadeiro/falso
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Cada criaturinha é um punhado de sentenças que já têm valor verdade: `é
 * azul` é verdadeira para a Bibi e falsa para a Mila. A placa do portão é uma
 * dessas sentenças, às vezes negada, e escolher o portão é dizer se ela vale
 * para quem está na trilha.
 *
 * O portão de baixo mostra SEMPRE a negação do de cima. É o que garante que
 * exista exatamente um portão verdadeiro para qualquer criaturinha — ver a §6
 * do PLANEJAMENTO.md, onde está a conta que descarta o par `E` × `OU` como
 * portões concorrentes.
 */

export type Cor = 'azul' | 'verde' | 'vermelha'

export type Atributo = Cor | 'chapeu' | 'oculos' | 'pequena'

export interface Criatura {
    id: string
    nome: string
    frame: number
    cor: Cor
    chapeu: boolean
    oculos: boolean
    pequena: boolean
}

/** Um termo da frase. `negado` é a tarja pequena sobre o ícone — chega no nível 3. */
export interface Termo {
    atributo: Atributo
    negado: boolean
}

export type Operador = 'e' | 'ou'

/**
 * Uma frase de placa. Com `op` e `right` ausentes é a frase de um termo só, que
 * é a do nível 1; o modelo já aceita as compostas para os níveis seguintes não
 * exigirem uma segunda estrutura.
 */
export interface Frase {
    left: Termo
    op?: Operador
    right?: Termo
}

export type Lane = 'cima' | 'baixo'

export interface Onda {
    id: string
    /** A frase da placa DE CIMA. A de baixo é a negação desta. */
    frase: Frase
    /** Ordem de entrada na trilha; ids repetem à vontade dentro da onda. */
    turma: string[]
    /** Liga o marco de altura na bifurcação. Só faz sentido quando a frase fala de tamanho. */
    marco?: boolean
}

export interface NivelDef {
    nivel: number
    nome: string
    objetivo: string
    ondas: Onda[]
}

/** Governa se o relógio anda e se o toque faz alguma coisa. */
export type Modo = 'abertura' | 'marchando' | 'esperando' | 'entrando' | 'travado' | 'foto' | 'fim'
