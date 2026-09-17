export type Category =
    | 'entrada'
    | 'processador'
    | 'memoria'
    | 'armazenamento'
    | 'saida'
    | 'nenhuma'

export interface PartDef {
    id: string
    frame: number
    category: Category
    originX: number
    originY: number
    /**
     * O NOME da peça, o de verdade — o que vai na etiqueta da baia.
     *
     * Não é a categoria: o teclado se chama TECLADO, e "entrada" é o grupo a
     * que ele pertence. Quem ensina o grupo é a frase de confirmação e o álbum
     * do fim do nível.
     */
    name: string
    /** O que a peça diz quando a criança toca nela por engano. */
    hint: string
    /** O que a máquina fala no acerto, ligando o nome da peça ao grupo dela. */
    confirm: string
}

export interface RequestDef {
    id: string
    asks: Category
    /** A frase que a máquina fala. */
    text: string
}

export interface MachineDef {
    id: string
    /** Os ids das peças, na ordem das baias. */
    bays: string[]
    requests: RequestDef[]
}

/**
 * O que a máquina entrega de graça, e o que ela cobra.
 *
 * `nome`   — ela diz o NOME da peça e explica o que faz. Só apontar.
 * `funcao` — ela descreve a função, sem nome, e depois a criança testa a peça.
 * `mudo`   — ela não diz nada: o desafio roda ANTES, e é ele a pergunta.
 */
export type AskMode = 'nome' | 'funcao' | 'mudo'

export interface LevelDef {
    level: number
    mode: AskMode
    machines: MachineDef[]
}

export type Verdict =
    | { kind: 'right' }
    | { kind: 'wrong'; reason: 'other' | 'intruder'; hint: string }

export type Mode = 'intro' | 'asking' | 'busy' | 'done'
