/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A HABILIDADE, EM TRÊS LINHAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * EF04CO01 pede reconhecer objetos representáveis por MATRIZ, onde cada
 * componente tem posição definida por coordenadas, e fazer manipulações
 * simples sobre essa representação.
 *
 * Aqui o objeto é uma fachada de 16 janelas. A criança localiza pela
 * coordenada (nível 1), lê a coordenada de uma janela apontada (nível 2) e
 * move ou copia o estado de uma célula para outra (nível 3).
 */

export type LevelNumber = 1 | 2 | 3

/**
 * Linha e coluna, ambas 1-based.
 *
 * `row` 1 é a de cima e `col` 1 é a da esquerda — a convenção fica escrita ao
 * lado da matriz e não muda entre níveis. A ordem de leitura é sempre L antes
 * de C, que é a confusão que o jogo existe para desfazer.
 */
export interface Cell {
    row: number
    col: number
}

/** Um passo em uma direção. Nunca dois ao mesmo tempo. */
export interface Shift {
    row: -1 | 0 | 1
    col: -1 | 0 | 1
}

/**
 * Uma célula já pintada, com a tinta que está nela.
 *
 * `ink` é índice na paleta de `theme.ts`, não uma cor solta: o nível 3 precisa
 * comparar tintas ("a laranja saiu daqui e chegou ali") e comparar índices é
 * mais honesto do que comparar números hexadecimais espalhados nos dados.
 */
export interface PaintedCell extends Cell {
    ink?: number
}

export type Task =
    | { kind: 'paint'; target: Cell; ink?: number }
    | { kind: 'read'; highlighted: Cell; options: [Cell, Cell, Cell]; ink?: number }
    /** Em mover e copiar a cor NÃO se escolhe: ela vem da célula de origem. */
    | { kind: 'move' | 'copy'; source: Cell; shift: Shift }

export type TaskKind = Task['kind']

export interface Mural {
    id: string
    /** Nome do padrão que os pedidos constroem, mostrado no fim do mural. */
    title: string
    initialPainted: PaintedCell[]
    tasks: Task[]
}

export interface LevelDef {
    level: LevelNumber
    murals: Mural[]
}

export type Mode = 'intro' | 'asking' | 'firing' | 'reveal' | 'done'
