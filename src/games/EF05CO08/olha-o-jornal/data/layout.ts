export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    scene: 10,
    people: 20,
    postman: 24,
    paper: 30,
    fx: 40,
    card: 50,
    controls: 60,
    hud: 100,
    sign: 120,
    frame: 140,
} as const

export const HUD = {
    h: 82,
    accent: 3,
    levelX: 24,
    levelY: 30,
    dotsY: 60,
    dotR: 7,
    dotGap: 22,
    livesX: 1090,
    livesY: 41,
    helpCx: 1232,
    helpCy: 41,
    helpR: 27,
    /** O vão livre do meio: o enunciado tem largura própria, nunca "a tela". */
    midX: 300,
    midW: 760,
} as const

export const READ = { promptY: 122 } as const

/**
 * O CARTÃO TEM UM TAMANHO SÓ, E A BANCA ROLA DE LADO.
 *
 * A grade que encolhia o cartão conforme o número de jornais chegou a 30 px de
 * manchete com quatro capas — 9 px reais no celular, o piso do projeto. Agora
 * o cartão é sempre 400 × 460 e o que muda é **quantos cabem na janela**: dois
 * cabem inteiros, três e quatro pedem rolagem. A legibilidade deixou de
 * depender do conteúdo da fase.
 */
export const CARD = {
    w: 400,
    h: 460,
    nameH: 52,
    nameFont: 28,
    headlineTop: 64,
    headlineH: 148,
    headlineFont: 38,
    ruleY: 224,
    clueTop: 248,
    clueGap: 58,
    clueFont: 25,
    clueIconX: 36,
    clueTextX: 78,
} as const

export const STRIP = {
    /** A janela recortada onde os cartões passam. */
    x: 218,
    w: 984,
    cy: 400,
    gap: 36,
    /** Sobra em cima e embaixo para a sombra e o pulo do cartão não serem cortados. */
    padY: 26,
    arrowLeftCx: 166,
    arrowRightCx: 1246,
    arrowCy: 400,
    arrowR: 33,
    railY: 668,
    railW: 360,
    railH: 10,
    /** Acima disto o toque virou arrasto, e não vale como escolha. */
    tapSlop: 14,
} as const

export const READ_POSTMAN = { cx: 108, base: 716, h: 196 } as const

/**
 * OS FUNDOS, E A LINHA DO CHÃO DE CADA UM.
 *
 * A fração saiu do `GetPixel` em cada folha: é onde o cenário encosta no chão.
 * Ela é POR FUNDO porque a arte não chega com a mesma — travar um número só
 * poria uma das praças com todo mundo flutuando.
 *
 * `tiles` marca o fundo que pode ser repetido de lado: as bordas esquerda e
 * direita da praça casam em céu, muro e chão, então ela vira uma rua sem fim
 * quando o carteiro anda.
 */
export const BACKDROPS = {
    praca: { key: 'bg-praca', groundFrac: 0.7024, tiles: true },
    escola: { key: 'bg-escola', groundFrac: 0.7354, tiles: false },
    rua: { key: 'bg-rua', groundFrac: 0.6716, tiles: false },
} as const

export type BackdropId = keyof typeof BACKDROPS

export const SQUARE = {
    personCell: 176,
    personGap: 62,

    postmanCx: 175,
    postmanH: 230,
    /** A folha é 300 × 400: manter a proporção, senão ele achata. */
    postmanRatio: 300 / 400,
    /** Onde a mão fica no quadro SOLTANDO, em fração da célula. */
    handFx: 0.85,
    handFy: 0.3,

    /** O arco é sempre o MESMO desenho: 40°, e a força sai do alvo. */
    angleDeg: 40,
    gravity: 1600,
    burstR: 150,

    aimMin: 520,
    aimMax: 1240,
    aimStep: 36,

    /** Onde o próximo grupo pousa na tela depois da caminhada. */
    walkTo: 820,
    walkSpeed: 640,
    /**
     * Quanto o carteiro ANDA ALÉM do necessário para não parar em cima de quem
     * já leu. Quem ficou para trás tem de sair da tela, não encostar nele.
     */
    walkClear: 260,
} as const

export const CTRL = {
    leftCx: 112,
    rightCx: 272,
    arrowCy: 618,
    arrowW: 144,
    arrowH: 144,
    throwCx: 1176,
    throwCy: 618,
    throwR: 68,
} as const

/**
 * Caixas alfa medidas nas folhas (PLANEJAMENTO MODAL §7), refeitas em
 * 18/09/2026 quando `pessoas.png` foi regerado.
 *
 * `originX` sai do quadro PARADO de cada pessoa, nunca da caixa do quadro
 * informado: o jornal aberto alarga a caixa para um lado, e ancorar por ela
 * faria o corpo escorregar de lado a cada troca de estado.
 */
export const PEOPLE_BOX = [
    { originX: 0.5078, footPad: 3 },
    { originX: 0.5371, footPad: 4 },
    { originX: 0.5215, footPad: 2 },
    { originX: 0.541, footPad: 1 },
] as const

/** Oito estados do mesmo corpo: ancora pela CÉLULA, senão ele afunda ao comemorar. */
export const POSTMAN = {
    cellW: 300,
    cellH: 400,
    footPad: 2,
} as const

export const POSE = {
    offer: 0,
    ready: 1,
    windUp: 2,
    release: 3,
    follow: 4,
    reload: 5,
    cheer: 6,
    down: 7,
} as const

export const PAPER_BOX = [
    { originX: 0.5234, originY: 0.5254 },
    { originX: 0.5645, originY: 0.457 },
    { originX: 0.5176, originY: 0.5059 },
] as const
