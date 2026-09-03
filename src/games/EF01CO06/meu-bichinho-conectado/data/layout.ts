export const W = 1280
export const H = 720

/**
 * A coluna de jogo vai até x 900; a prateleira mora depois disso. O fundo
 * `bg-quarto` deixa o tapete no centro e a parede da direita limpa, então o
 * bichinho pisa no tapete e a prateleira não cobre brinquedo nenhum.
 */
/**
 * O header diz DUAS coisas: em que nível a criança está e em que fase do
 * nível. O número vive nas pílulas, para quem lê; os selos contam a mesma
 * fase em desenho, para quem ainda não lê.
 */
export const HUD = {
    y: 18,
    h: 56,
    cy: 46,
    levelX: 28,
    levelW: 186,
    phaseX: 228,
    phaseW: 208,
    stampX: 458,
    stampSize: 68,
    stampGap: 16,
    livesX: 1104,
    helpX: 1224,
    helpR: 30,
}

/** O pedido: pictograma grande e legenda curta, num balão acima do bichinho. */
export const ASK = {
    cx: 560,
    cy: 178,
    w: 652,
    h: 152,
    r: 36,
    iconX: -216,
    iconSize: 112,
    labelX: -132,
    labelDY: -26,
    phraseDY: 28,
    tailY: 76,
}

export const PET = {
    x: 560,
    y: 448,
    size: 268,
}

/**
 * Os amiguinhos do pedido coletivo.
 *
 * Ficam à ESQUERDA do bichinho, apertados, e não em volta dele: a direita do
 * tapete é por onde o aparelho entra em cena (`STAGE`), e um amiguinho ali
 * levava o aparelho a aterrissar em cima dele. Os pés alinham com os do
 * bichinho, em y 582.
 */
export const FRIENDS = [
    /* amarelo, à frente e maior */
    { frame: 0, x: 344, y: 502, size: 164, depth: 19 },
    /* verde, um passo atrás: mais alto e menor, como quem está mais longe */
    { frame: 2, x: 452, y: 468, size: 138, depth: 17 },
]

/** Onde o artefato encena a função depois de sair da prateleira. */
export const STAGE = {
    x: 790,
    y: 402,
    size: 168,
}

/** A moldura da estante. A arrumação de dentro depende de quantos aparelhos há. */
export const SHELF = {
    y: 96,
    h: 600,
    cy: 396,
    r: 34,
    nicheR: 26,
}

export interface ShelfArrangement {
    cx: number
    w: number
    nicheW: number
    nicheH: number
    iconSize: number
    iconDY: number
    labelDY: number
    slots: Array<{ x: number; y: number }>
    /** Centro vertical de cada fileira, para desenhar as tábuas. */
    rows: number[]
}

/** Até 3 aparelhos: uma coluna. Alvo de 296 × 152 (~90 × 46 px reais). */
const COLUMN = {
    cx: 1092,
    w: 336,
    nicheW: 296,
    nicheH: 152,
    gap: 28,
    iconSize: 96,
    iconDY: -22,
    labelDY: 52,
}

/**
 * Quatro aparelhos: 2 × 2.
 *
 * Empilhar os quatro numa coluna só deixaria cada nicho com 123px de altura,
 * cerca de 37px reais num celular de 390px — abaixo do piso de 44 que o
 * planejamento fixou. Na grade o alvo fica MAIOR do que na coluna
 * (158 × 196, uns 48 × 60 reais), e a estante ganha uma fileira em vez de
 * apertar quatro.
 *
 * A estante larga começa em x 898, e o balão do pedido termina em 886: são
 * doze pixels de folga de propósito, para o balão não encostar na moldura de
 * madeira.
 */
const GRID = {
    cx: 1084,
    w: 372,
    nicheW: 158,
    nicheH: 196,
    gapX: 14,
    gapY: 24,
    iconSize: 84,
    iconDY: -28,
    labelDY: 68,
}

export function shelfArrangement(count: number): ShelfArrangement {
    if (count <= 3) {
        const total = count * COLUMN.nicheH + (count - 1) * COLUMN.gap
        const start = SHELF.cy - total / 2 + COLUMN.nicheH / 2
        const rows = Array.from({ length: count },
            (_, i) => start + i * (COLUMN.nicheH + COLUMN.gap))

        return {
            cx: COLUMN.cx, w: COLUMN.w,
            nicheW: COLUMN.nicheW, nicheH: COLUMN.nicheH,
            iconSize: COLUMN.iconSize, iconDY: COLUMN.iconDY, labelDY: COLUMN.labelDY,
            slots: rows.map(y => ({ x: COLUMN.cx, y })),
            rows,
        }
    }

    const cols = 2
    const rowCount = Math.ceil(count / cols)
    const totalH = rowCount * GRID.nicheH + (rowCount - 1) * GRID.gapY
    const startY = SHELF.cy - totalH / 2 + GRID.nicheH / 2
    const rows = Array.from({ length: rowCount },
        (_, r) => startY + r * (GRID.nicheH + GRID.gapY))

    const totalW = cols * GRID.nicheW + GRID.gapX
    const startX = GRID.cx - totalW / 2 + GRID.nicheW / 2

    const slots = Array.from({ length: count }, (_, i) => ({
        x: startX + (i % cols) * (GRID.nicheW + GRID.gapX),
        y: rows[Math.floor(i / cols)],
    }))

    return {
        cx: GRID.cx, w: GRID.w,
        nicheW: GRID.nicheW, nicheH: GRID.nicheH,
        iconSize: GRID.iconSize, iconDY: GRID.iconDY, labelDY: GRID.labelDY,
        slots,
        rows,
    }
}

export const TOAST = {
    cx: 560,
    y: 636,
    w: 660,
    h: 84,
    r: 26,
}

export const ALBUM = {
    cx: 640,
    cy: 372,
    w: 830,
    h: 330,
    r: 34,
    cardW: 232,
    cardH: 190,
    gap: 26,
}
