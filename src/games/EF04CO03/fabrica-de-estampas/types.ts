/**
 * EF04CO03 — simular algoritmos com repetições simples e aninhadas. A criança é a máquina:
 * lê o pedido escrito como laço e carimba o tecido posição por posição.
 */

export type Fig = 'flower' | 'star' | 'heart'

export interface Loop {
    times: number
    body: Array<Fig | Loop>
}

export type Question =
    | { kind: 'count'; fig: Fig; options: [number, number, number] }
    | { kind: 'compare'; a: Fig; b: Fig }

export interface Order {
    loop: Loop
    question: Question
}

export interface LevelDef {
    level: number
    title: string
    message: string
    /** a ordem de treino que o próprio jogo carimba no tutorial */
    demo?: Order
    orders: Order[]
}

/**
 * Por que a figura vem ali, para a faixa do erro:
 * - `first`: o começo do pedido;
 * - `newTurn`: a volta de fora acabou de fechar, o bloco recomeça;
 * - `innerAgain`: o laço de dentro fechou uma volta e roda de novo;
 * - `afterInner`: o laço de dentro acabou e o bloco segue;
 * - `next`: a figura seguinte do bloco.
 */
export type Why = 'first' | 'newTurn' | 'innerAgain' | 'afterInner' | 'next'

/** uma posição do tecido, já expandida */
export interface Step {
    fig: Fig
    /** o caminho da figura no pedido ("1", "0.0"…) */
    at: string
    /** os laços que fecham uma volta com esta carimbada, de dentro para fora ("" é o de fora) */
    closes: string[]
    why: Why
}

export type Mode = 'intro' | 'guide' | 'stamp' | 'busy' | 'ask' | 'check' | 'jam' | 'panel' | 'finale' | 'done'
