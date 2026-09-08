/**
 * ══════════════════════════════════════════════════════════════════════════
 *  EF02CO04 — hardware e software
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A criança MONTA uma máquina. O chassi tem duas entradas: uma bandeja, que só
 * aceita coisa que se pega, e um leitor, que só aceita ordem. Com as duas
 * cheias acende o TESTAR, e é a criança quem faz a máquina rodar.
 *
 * A habilidade não é perguntada, é encenada: peça sozinha fica parada, ordem
 * sozinha não tem onde rodar, e o programa errado faz a peça certa fazer
 * besteira.
 */

export type ItemKind = 'hardware' | 'software'

export type LevelNumber = 1 | 2 | 3

/** As duas entradas do chassi. Cada uma só aceita um tipo. */
export type Slot = 'tray' | 'reader'

/** O que a máquina precisa fazer nesta montagem. */
export type Goal = 'music' | 'photo' | 'print' | 'dance' | 'draw' | 'write'

export interface LabItem {
    id: string
    label: string
    kind: ItemKind
    /** Quadro na folha `itens.png` (4 colunas x 5 linhas). */
    frame: number
    /**
     * Só para programa: o que ele manda fazer, em infinitivo.
     * É com isto que o erro vira frase concreta — "Câmera não sabe tocar
     * música" — em vez de "tente de novo".
     */
    verb?: string
    /**
     * Só para programa: qual pedido ele atende. É este campo, e não uma peça
     * escolhida a dedo na montagem, que decide se a máquina fez o que pediram.
     */
    goal?: Goal
}

/**
 * Uma montagem: um pedido e a prateleira de onde escolher.
 *
 * NÃO existe "a resposta" gravada aqui. Certo é qualquer par cujo programa
 * atenda o pedido e que mande na peça encaixada — e quase sempre há mais de
 * um. Escrever se faz com teclado, com tela ou com impressora.
 */
export interface Build {
    id: string
    goal: Goal
    shelf: string[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    /** No nível 1 a entrada certa brilha na primeira montagem. */
    teach: boolean
    builds: Build[]
}

/** O que aconteceu quando a criança apertou o TESTAR. */
export type Outcome = 'ok' | 'off-goal' | 'mismatch'

export type Phase = 'intro' | 'tutorial' | 'playing' | 'running' | 'done'
