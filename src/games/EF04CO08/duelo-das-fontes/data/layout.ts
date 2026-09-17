export const W = 1280
export const H = 720

export const DEPTH = {
    scene: 0,
    counter: 10,
    robot: 20,
    neighbour: 30,
    sign: 40,
    slip: 60,
    speech: 70,
    buttons: 80,
    hud: 100,
    fx: 200,
    frame: 300,
} as const

export const HUD = {
    h: 82,
    cy: 41,

    pillX: 20,
    pillY: 18,
    pillW: 168,
    pillH: 46,

    dotX: 214,
    dotGap: 34,
    dotR: 9,

    goalX: 640,

    livesX: 1020,

    helpX: 1206,
    helpR: 27,
    helpHit: 136,
} as const

/**
 * O papel que o robô sopra. Ele é a NOTÍCIA, e precisa parecer uma: papel
 * branco de verdade, borda de baixo rasgada, e uma etiqueta escrita dizendo o
 * que ele é. Sem a etiqueta, ele é mais uma caixa de texto no meio de outras
 * três — e a criança não sabe qual delas é a coisa julgada.
 */
export const HEADLINE = {
    x: 30,
    y: 84,
    w: 920,
    h: 118,
    iconR: 46,
    iconCX: 110,
    textX: 186,
    wrap: 720,
    tagW: 132,
    tagH: 34,
} as const

/** Endereço fixo das três vozes: o robô, o bilhete âmbar e o fecho. */
export const SPEECH = {
    x: 30,
    y: 210,
    w: 920,
    h: 70,
    /** O CONTINUAR mora DENTRO da faixa, encostado na ponta direita. */
    nextW: 226,
    nextH: 46,
    nextPad: 24,
    wrap: 600,
} as const

/**
 * Os vizinhos. A célula inteira é o alvo de toque, e ela é calculada a partir
 * de QUANTOS são: com dois, cada um fica com 430 px (129 px reais num celular
 * de 390) e a plaquinha cabe uma frase por linha.
 *
 * Dois é o padrão do nível 1. Três é para depois, quando a criança já souber
 * que a pergunta é "quem podia saber disso?".
 */
export const CELL = {
    y: 288,
    h: 272,
    gap: 60,
    left: 30,
    right: 950,
} as const

export function cells(count: number): Array<{ x: number; w: number; cx: number }> {
    const span = CELL.right - CELL.left
    const w = Math.round((span - CELL.gap * (count - 1)) / count)
    return Array.from({ length: count }, (_, i) => {
        const x = CELL.left + i * (w + CELL.gap)
        return { x, w, cx: x + w / 2 }
    })
}

/** O busto entra atrás da plaquinha, que cobre o terço de baixo dele. */
export const BUST = {
    h: 214,
    bottom: 502,
} as const

export const SIGN = {
    y: 444,
    h: 116,
} as const

/**
 * A plaquinha aperta quando entra o terceiro vizinho: a célula cai de 430 para
 * 296 px, e a resposta tem de caber do mesmo jeito. Encolhe o ícone, o vão e o
 * corpo do texto — nunca o número de palavras, que é limite de conteúdo.
 */
export function signFor(count: number) {
    return count >= 3
        ? { iconR: 25, textPad: 76, sizes: [27, 24, 21], pad: 14 }
        : { iconR: 32, textPad: 112, sizes: [31, 28, 25], pad: 22 }
}

/**
 * A plaquinha de identidade: quem é aquela pessoa e de onde ela fala. Fica
 * sobre o peito, logo acima da plaquinha de resposta, e NÃO some quando ela
 * responde — identidade é permanente, resposta é da rodada.
 */
export const BADGE = {
    y: 396,
    h: 46,
    iconR: 17,
    padX: 18,
} as const

export const BUTTONS = {
    y: 578,
    h: 132,
    w: 430,
    spreadX: 40,
    holdX: 520,
} as const

/**
 * O robô fica FORA da área de jogo (que acaba em x = 950) e não tem zona de
 * toque nenhuma: é o personagem que quer que a criança erre, e o dedo que
 * decide não pode esbarrar nele. Ele escala pela BASE — os pés ficam no chão.
 */
export const ROBOT = {
    cx: 1116,
    baseY: 566,
    h: 300,
    minScale: 0.62,
    maxScale: 1.18,
    step: 0.1,
} as const

/** Onde o tampo do balcão cruza a tela, medido no `bg-balcao.png`. */
export const COUNTER_Y = 472
