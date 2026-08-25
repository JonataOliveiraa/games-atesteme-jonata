/**
 * Ateliê de Códigos Digitais — EF04CO05.
 *
 * ── O JOGO INTEIRO SÃO DUAS PEÇAS ────────────────────────────────────────
 *
 *   uma GRADE   e   uma LEGENDA
 *
 * E uma regra só, do primeiro caso ao último: escolha na legenda, toque no
 * quadro. O que muda de oficina para oficina é apenas o que está na legenda —
 * dois valores, cinco tons, cinco cores ou doze letras.
 *
 * A encomenda e o quadro são a MESMA grade mostrada de dois jeitos: um mostra
 * o código, o outro mostra a imagem. É a frase da habilidade virando objeto —
 * a imagem É a matriz.
 */

export type CaseState = 'briefing' | 'escolhendo' | 'montando' | 'solved'

/** As quatro maneiras de codificar que este jogo conhece. */
export type Formato = 'bitmap' | 'cinza' | 'cor' | 'ascii'

/**
 * De que lado a criança trabalha.
 *
 *   decodificar → recebe o código, produz a imagem
 *   codificar   → recebe a imagem, produz o código
 *
 * O gesto é o mesmo nos dois; o que troca é o que a grade MOSTRA. É de
 * propósito: codificar um bitmap é literalmente marcar quais pixels são 1.
 */
export type Direcao = 'decodificar' | 'codificar'

/** Como uma grade se mostra: pintada, ou escrita. */
export type Face = 'imagem' | 'codigo'

/**
 * Uma opção da legenda.
 *
 * `color` é o que a célula vira quando pintada; `code` é como aquilo se
 * escreve; `char` só existe na oficina das letras, onde a "imagem" de um
 * código é a própria letra.
 */
export interface Tinta {
    code: string
    color: number
    char?: string
}

export interface Caso {
    id: string
    formato: Formato
    direcao: Direcao
    cols: number
    rows: number
    /**
     * A resposta, linha por linha: um índice da legenda por célula.
     *
     * Índice e não valor: assim a mesma grade serve para tom de cinza, cor e
     * letra sem o caso precisar saber o que cada oficina guarda.
     */
    art: number[][]
    /** O que aparece quando fecha: "um coração". */
    titulo: string
    /** Só no Nível 3: a encomenda em palavras, antes de escolher o formato. */
    pedido?: string
    question: string
    hint: string
    successLine: string
}

export interface Level {
    level: number
    title: string
    objective: string
    tip: string
    /** No Nível 3 a criança escolhe o formato antes de trabalhar. */
    escolhe: boolean
    /** Quais oficinas acendem na plaquinha do HUD. */
    oficinas: Formato[]
    cases: Caso[]
}
