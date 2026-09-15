export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    veil: 1,
    board: 6,
    cell: 10,
    guide: 14,
    cellFx: 18,
    cannon: 30,
    drop: 40,
    splash: 44,
    panel: 60,
    fx: 200,
    hud: 500,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O CABEÇALHO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Da esquerda para a direita: a pílula do NÍVEL, os murais concluídos, o nome
 * do mural, as vidas e o `?`.
 *
 * A pílula segue o formato dominante do catálogo — `NÍVEL n`, sem o total, em
 * pílula no canto esquerdo. É o que fazem trinta jogos, entre eles o vizinho
 * direto Batalha das Coordenadas, do mesmo EF04CO01. Os quinze jogos que
 * escrevem `NÍVEL n de N` são da leva anterior (EF02 e EF03); a leva nova
 * deixou o total para a barra de progresso da tela de conclusão.
 *
 * São duas informações diferentes e as duas precisam estar na tela: a pílula
 * diz em que NÍVEL a criança está, e os pontos ao lado dizem quantos murais
 * daquele nível ela já fechou. Sem a pílula, três pontos apagados significam
 * a mesma coisa no nível 1 e no nível 3.
 *
 * Os pontos começam em 188 porque a pílula termina em 152; o nome do mural foi
 * para o centro da tela, longe dos dois.
 */
export const HUD = {
    h: 92,
    cy: 46,
    pillX: 20,
    pillY: 22,
    pillW: 132,
    pillH: 48,
    dotX: 188,
    dotGap: 42,
    dotR: 14,
    titleX: 640,
    livesX: 1020,
    helpX: 1206,
    helpR: 30,
    helpHit: 136,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A MATRIZ
 * ══════════════════════════════════════════════════════════════════════════
 *
 * 4 × 4 em 536 px, o que dá 134 px por célula — cerca de 40 px reais num
 * celular a 30%, que é o piso de alvo tocável infantil. O §1 do planejamento
 * derrubou as grades 5 × 5 e 6 × 6 do briefing exatamente por isso: o que
 * cresce de nível para nível é o comando, não a mira.
 *
 * Os rótulos moram FORA da grade, acima das colunas e à esquerda das linhas.
 * É o que deixa linha e coluna distinguíveis por posição, e não por cor.
 */
export const GRID = {
    x: 150,
    y: 150,
    size: 536,
    n: 4,
    cell: 134,
    /** A faixa de rótulos, do lado de fora. */
    labelBand: 46,
    labelGap: 8,
}

export const cellCenter = (row: number, col: number) => ({
    x: GRID.x + (col - 0.5) * GRID.cell,
    y: GRID.y + (row - 0.5) * GRID.cell,
})

/** O painel da direita: pedido em cima, dica no meio, canhão embaixo. */
export const PROMPT = { x: 750, y: 140, w: 450, h: 96 }
export const HINT = { x: 750, y: 252, w: 450, h: 108 }
export const CANNON = { x: 985, y: 540, w: 232 }

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS CARTÕES DO NÍVEL 2
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Em LINHA, e não empilhados como o §7 previa. Empilhados, três cartões de 136
 * px mais o pedido, a dica e o canhão não cabem nos 620 px de altura da
 * direita: ou o cartão encolhia para 84 px — 25 px reais num celular, abaixo
 * do alvo tocável — ou o canhão saía da tela.
 *
 * Deitados, cada um fica com 142 × 124, que a 30% dá 43 × 37 px reais, e ainda
 * sobra faixa para a dica e para o canhão no lugar de sempre.
 */
export const CARDS = {
    y: 244,
    h: 124,
    w: 142,
    xs: [750, 902, 1054],
}

/** No nível 2 a dica desce, porque os cartões ocupam a faixa do meio. */
export const HINT_L2 = { x: 750, y: 390, w: 450, h: 96 }

export const HELP = { x: HUD.helpX, y: HUD.cy }
