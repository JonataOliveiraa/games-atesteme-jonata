export const W = 1280
export const H = 720

export const DEPTH = {
    scenery: 0,
    ground: 6,
    obstacleBack: 10,
    rabbit: 20,
    obstacleFront: 24,
    mark: 8,
    panel: 60,
    card: 70,
    hud: 80,
    balloon: 100,
    fx: 120,
    edge: 140,
    overlay: 400,
}

/**
 * A trilha do programa. Painel baixo de propósito: o percurso inteiro precisa
 * caber embaixo dele sem que nada seja cortado.
 */
export const TRACK = { x: 16, y: 10, w: 1248, h: 140, r: 28 }

/**
 * Os quadrados CRESCEM quando sao poucos. Com tres passos sobrava meia tela
 * vazia entre a pilula e o relogio, e a ordem — que e o assunto do jogo —
 * ficava sendo a coisa menor da tela.
 */
export const SLOT = { max: 122, min: 96, gap: 20, cy: 80, from: 232, to: 902 }

export const HELP = { x: 1210, y: 80, r: 30 }

/**
 * Nivel, fase e relogio moram nas PONTAS do painel da trilha. Os quadrados
 * ficam no meio, e nunca chegam a 388 pela esquerda nem passam de 892 pela
 * direita — mesmo com cinco deles.
 */
export const LEVEL_PILL = { x: 36, y: 26, w: 172, h: 36 }

export const PHASE_PIPS = { cx: 122, y: 84, gap: 28, r: 8 }

export const CLOCK = { x: 946, y: 80, r: 19, w: 128 }

/**
 * O chão. A linha nasce onde o capim do `bg-campo` começa — por isso o fundo
 * é desenhado deslocado para cima, para o horizonte dele bater com este
 * número em vez de o número perseguir a arte.
 */
/**
 * A terra e grossa de proposito: um buraco so parece buraco se o chao tiver
 * espessura para abrir. Com a faixa fina, as paredes do poco viravam dois
 * tocos plantados.
 */
export const GROUND = { y: 436, grass: 26, dirt: 66 }

/**
 * O fundo sobe para o capim dele bater com a linha de cima. E o numero
 * persegue a arte, nao o contrario: o horizonte do `bg-campo` fica em 70 % da
 * altura, e 0,70 x 720 - 436 da isto.
 */
export const BG_OFFSET_Y = -68

/** O percurso ocupa a faixa entre a trilha e a paleta, e NÃO rola. */
export const COURSE = { top: 160, firstX: 250, lastX: 1010 }

/**
 * As patas do coelho ficam em 98,5 % da altura do quadro — medido no PNG, e
 * nao chutado. Por isso o centro dele mora a 48,5 % do tamanho acima do chao:
 * assim ele PISA na grama em vez de flutuar ou afundar.
 */
/**
 * A altura do pulo e o teto do painel de cima brigam: as orelhas do coelho
 * chegam a 4 % do topo do quadro, entao um pulo alto demais some atras da
 * trilha. 160 e o maior valor que ainda deixa o coelho inteiro na tela e
 * mesmo assim passa por cima do tronco erguido.
 */
/**
 * A altura do pulo e o teto do painel brigam: as orelhas do coelho chegam a
 * 4 % do topo do quadro. Com a pedra no lugar do tronco erguido, o pulo nao
 * precisa mais ser alto — 130 passa por cima de tudo e mantem o coelho
 * inteiro abaixo da trilha.
 */
export const RABBIT = { size: 152, startX: 86, exitX: 1220, jumpH: 130, footRatio: 0.485 }

/**
 * Cada obstaculo tem tamanho proprio e um centro calculado a partir da caixa
 * real do desenho. Os numeros abaixo saem de tres medidas:
 *
 *  - o tronco e o tunel APOIAM no chao (base do desenho em 436);
 *  - o buraco alinha o TOPO da terra dele com a linha do chao — ele e o chao
 *    aberto, nao um objeto em cima dele;
 *  - o galho fica entre a cabeca do coelho em pe (316) e a cabeca dele
 *    abaixado (362): alto o bastante para passar deitado, baixo o bastante
 *    para bater andando. E a geometria que ensina, sem uma palavra;
 *  - o buraco e a pedra nao estao aqui: os dois sao Graphics.
 */
export const OBSTACLE_SPEC: Record<string, { size: number; cy: number }> = {
    tronco: { size: 190, cy: 343 },
    tunel: { size: 200, cy: 337 },
    galho: { size: 240, cy: 250 },
    buraco: { size: 0, cy: 0 },
    pedra: { size: 0, cy: 0 },
    livre: { size: 0, cy: 0 },
}

/** A pedra e desenhada em Graphics, como o buraco. */
export const ROCK = { w: 134, h: 98 }

/** O vao que o chao abre num buraco, um pouco menor que o desenho da terra. */
export const HOLE_GAP = 172

/** A paleta e o VAI, na base. */
export const PALETTE = { x: 16, y: 528, w: 1248, h: 180, r: 28 }

export const CARD = { w: 190, h: 128, cy: 618, xs: [250, 478, 706] }

export const GO = { x: 1046, y: 618, r: 78 }

export const BALLOON = { x: 640, y: 250, w: 560 }

export const REPLAY = { titleY: 300, cardY: 430, gap: 122, size: 104 }
