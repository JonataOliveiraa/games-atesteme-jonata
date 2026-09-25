export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    star: 4,
    burst: 8,
    rocket: 12,
    board: 20,
    console: 30,
    hint: 40,
    hud: 500,
}

export const HUD = {
    h: 82,
    cy: 41,
    pillX: 20,
    pillY: 17,
    pillW: 132,
    pillH: 48,
    dotX: 186,
    dotGap: 42,
    dotR: 14,
    titleX: 640,
    livesX: 1020,
    helpX: 1208,
    helpR: 29,
    helpHit: 112,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O LAYOUT SAIU DO FUNDO ENTREGUE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A imagem é 1672 × 941, então cada pixel dela vale 0,766 daqui. Medindo:
 *
 *     céu totalmente vazio      y   0..200
 *     bandeirinhas e telhados   y 200..360
 *     multidão olhando p/ cima  y 360..494
 *     chão de terra, livre      y 494..720
 *
 * Duas decisões que saem daí:
 *
 * 1. O ESTOURO FICA NO CÉU VAZIO, um pouco acima das bandeirinhas. Ele pode
 *    passar por cima dos telhados — fogo estoura acima da cidade —, mas nunca
 *    entra na faixa da multidão, senão some no meio dela.
 *
 * 2. TUDO QUE SE TOCA CABE NUMA FAIXA SÓ, no chão, e na ordem de leitura:
 *    **placa → torneiras → foguete → LANÇAR**. A criança lê o pedido, ajusta e
 *    aperta sem o olho subir e descer.
 */
export const SKY = {
    burstX: 700,
    burstY: 236,
    burstR: 132,

    /**
     * O VARAL DOS FOGOS GUARDADOS.
     *
     * Cada cor que acerta vira um lampião pendurado aqui, no alto à esquerda:
     * um lugar só dele, longe do estouro e do pedido, onde a coleção do nível se
     * lê de relance. Solto no meio do céu, um fogo guardado se confundia com um
     * fogo acontecendo.
     */
    rack: { y: 136, x: [86, 162, 238], r: 20, lineY: 112 },
}

/** A faixa do chão: tudo que a criança toca mora aqui. */
export const BOARD = { x: 16, y: 408, w: 400, h: 312 }

/**
 * O miolo claro da placa, em fração da célula da folha.
 *
 * A peça não preenche a célula de 400 × 400: a tábua ocupa o meio e sobra
 * margem transparente. Texto posicionado pela caixa cheia cai na moldura ou
 * fora dela — foi o que aconteceu na primeira montagem. Estas quatro frações
 * saem do desenho entregue e é delas que o conteúdo da placa se pendura.
 */
export const BOARD_INNER = { left: 0.11, right: 0.91, top: 0.2, bottom: 0.725 }

export const TAPS = {
    cx: [510, 690, 870],
    cy: 592,
    size: 168,
    hitW: 184,
    hitH: 214,
    labelY: 500,
    valueY: 688,
}

export const ROCKET = { cx: 1000, cy: 596, size: 190 }

export const LAUNCH = { cx: 1178, cy: 586, size: 152, hitW: 196, hitH: 208, labelY: 690 }

/**
 * O mestre da festa.
 *
 * Ele entra UMA VEZ por nível, quando as três rodadas fecham — e por isso pode
 * ser grande: não disputa espaço com nada durante a partida, porque durante a
 * partida ele não está lá. Fica em pé no chão, à esquerda, com os pés na faixa
 * de terra que o fundo entregou.
 */
export const MASTER_AT = { cx: 116, cy: 380, w: 216, h: 324 }

/** O balão de fala. */
export const HINT = { cx: 640, cy: 392, w: 560, h: 96 }
