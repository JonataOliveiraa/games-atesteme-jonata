export const W = 1280
export const H = 720

export const HUD = {
    h: 82,
    cy: 41,
    pillX: 20,
    pillY: 18,
    pillW: 126,
    pillH: 46,
    dotX: 176,
    dotGap: 42,
    dotR: 14,
    titleX: 560,
    livesX: 1006,
    helpX: 1212,
    helpR: 28,
    helpHit: 128,
} as const

/**
 * O papel ocupa a mesa inteira à esquerda e NÃO rola: tudo cabe na tela.
 * Termina em x 880 e em y 548; a coluna da direita começa em 900 e a bancada
 * de ferramentas em 562.
 */
export const PAPER = { x: 24, y: 96, w: 856, h: 452 } as const

/** A margem de segurança de qualquer item dentro do papel. */
export const PAPER_PAD = 20

/** A distância mínima entre dois itens: as zonas de toque são grandes. */
export const ITEM_GAP = 170

/**
 * O vidro mostra um círculo de raio `r / zoom` do papel — é o mesmo círculo
 * que encontra os itens, senão a lupa acharia coisa que ela não está mostrando.
 *
 * `grabLift` é o respiro que a lente ganha quando o dedo agarra o vidro em vez
 * do cabo: sem ele, o polegar tapa exatamente o que ela aumenta.
 */
export const LENS = {
    r: 96,
    rim: 16,
    zoom: 2.1,
    grabLift: 74,
    /**
     * Onde ela dorme no começo da fase.
     *
     * O cabo aponta para baixo à direita, então o ponto de descanso tem de ter
     * papel embaixo e à direita: parada embaixo, ela some atrás da bancada.
     * E longe o bastante de qualquer item para não achar nada sozinha.
     */
    parkX: 130,
    parkY: 240,
} as const

export const CARD = { w: 440, h: 150, gap: 26 } as const

/** A zona de toque do anel nunca é menor que isto, mesmo num item curto. */
export const RING_HIT = { w: 170, h: 140 } as const

/**
 * A bancada: as três ferramentas, com o nome embaixo de cada uma.
 * A ferramenta escolhida é o que o TOQUE no papel faz — arrastar a lupa
 * funciona sempre, com qualquer uma delas escolhida.
 */
export const TOOLS = {
    y: 562,
    h: 146,
    cy: 635,
    w: 190,
    xs: [130, 350, 570] as const,
    labelY: 684,
} as const

export const PLATE = { x: 900, y: 96, w: 364, h: 130 } as const
export const BALLOON = { x: 900, y: 238, w: 364, h: 96 } as const
export const VISITOR = { cx: 1082, y: 344, w: 300, h: 164 } as const
export const STAMP = { cx: 1082, cy: 620, w: 300, h: 150 } as const

export const DEPTH = {
    desk: 0,
    visitor: 6,
    balloon: 9,
    paper: 10,
    rings: 14,
    zoom: 20,
    lens: 22,
    card: 30,
    bench: 40,
    stamp: 42,
    hud: 60,
    frame: 70,
} as const
