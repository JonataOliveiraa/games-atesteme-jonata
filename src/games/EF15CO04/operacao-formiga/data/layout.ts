export const W = 1280
export const H = 720

/** Profundidade na tela (fora do mundo). */
export const DEPTH = {
    world: 0,
    trail: 60,
    controls: 70,
    done: 74,
    header: 100,
    hud: 106,
    card: 110,
    caption: 125,
    banner: 140,
    hand: 150,
} as const

/** Profundidade dentro do mundo. Bichos, pedras e pedaços no chão vão por y (`WD.actor + y`). */
export const WD = {
    bg: 0,
    decor: 2,
    trail: 4,
    plate: 6,
    outline: 7,
    placed: 8,
    actor: 100,
    wind: 900,
    veil: 1000,
    cutting: 1100,
    gauge: 1200,
    hint: 1210,
} as const

export const HEADER = {
    h: 96,
    dividers: [282, 1150],
} as const

export const HUD = {
    y: 48,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 184,
    pipGap: 26,
    pipR: 10,
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
} as const

/** O cartão do pedido, no meio do cabeçalho. */
export const CARD = {
    x: 716,
    y: 48,
    h: 70,
    icon: 52,
    slot: 46,
    gap: 10,
    pad: 14,
    crown: 30,
    /** O cartão em árvore (N2): a mãe em cima, as filhas penduradas embaixo. */
    treeH: 88,
    tslot: 32,
    tgap: 6,
    groupGap: 16,
    floor: 21,
    /** O cartão das tarefas (N3): a gota, as amigas e a folhinha. */
    taskGap: 24,
} as const

export const MAP = {
    left: 40,
    right: 1240,
    top: 124,
    bottom: 700,
    scale: 0.3,
} as const

export const FRUIT_AT = { x: 280, y: 330 } as const
export const BUSH_AT = { x: 262, y: 262 } as const

export const WALL = {
    x: 740,
    half: 34,
    gapTop: 390,
    gapBottom: 490,
    /** As pedras do muro: centro x, pé y, célula (1, 2 ou 3) e largura. */
    stones: [
        { x: 742, y: 168, cell: 3, w: 128 },
        { x: 736, y: 250, cell: 1, w: 132 },
        { x: 744, y: 330, cell: 2, w: 124 },
        { x: 738, y: 404, cell: 1, w: 132 },
        { x: 742, y: 580, cell: 2, w: 124 },
        { x: 736, y: 660, cell: 3, w: 128 },
        { x: 744, y: 742, cell: 1, w: 132 },
    ],
} as const

export const WIND = {
    left: 840,
    right: 950,
    puffs: [
        { x: 896, y: 262 },
        { x: 902, y: 668 },
    ],
} as const

export const PLATE = { x: 1040, y: 236, r: 96 } as const
export const QUEEN = { x: 1182, y: 420, w: 176 } as const
export const MOUND = { x: 1090, y: 650, w: 230 } as const
export const HOLE = { x: 1090, y: 572, r: 88 } as const

export const ANT = {
    start: { x: 1000, y: 480 },
    r: 18,
    /** Do pé ao meio do corpo, em px do mundo. */
    body: 26,
    speed: 290,
    carrySpeed: 255,
    w: 86,
    cell: 192,
    foot: 182,
    /** Onde fica o centro do pedaço carregado, em px da célula. */
    hold: { x: 110, y: 34 },
    step: 0.13,
    /** N2: o maior lado do pedaço na cabeça, para a formiga não sumir embaixo dele. */
    carryMax: 70,
} as const

export const DECOR = {
    tufts: [
        { x: 90, y: 180 },
        { x: 470, y: 160 },
        { x: 560, y: 470 },
        { x: 620, y: 690 },
        { x: 990, y: 700 },
        { x: 1230, y: 200 },
        { x: 860, y: 132 },
    ],
} as const

export const JOY = {
    x: 150,
    y: 610,
    r: 70,
    base: 84,
    knob: 38,
    grabMaxX: 430,
    grabMinY: 440,
} as const

export const CUT = {
    zoom: 2.6,
    at: { x: 520, y: 420 },
    /** O medidor, acima e à direita da fruta (onde a formiga não costuma estar), em px do mundo. */
    gaugeDX: 188,
    gaugeDY: -64,
    /** Quanto cada corte afasta os dois lados, em px de arte. */
    part: 7,
    /** Quanto os pedaços se espalham ao sair do corte, em px do mundo. */
    spread: 26,
    doneX: 1150,
    doneY: 630,
    doneR: 62,
    /** O pedaço entalado fica no chão a esta distância da fresta. */
    stuckDX: 92,
    minSwipe: 40,
} as const

export const CAPTION = {
    x: 640,
    y: 158,
} as const

export const BANNER = {
    x: 640,
    y: 176,
    /** A faixa da folha suja fica embaixo do prato, para a sujeira aparecer. */
    lowY: 430,
    w: 900,
    h: 84,
} as const

export const HAND = {
    r: 24,
    stroke: 6,
    wave: 5,
    spread: 2.6,
} as const

export const ORDER = {
    /** O balão do pedido da rainha, em px do mundo, relativo ao pé dela. */
    dx: 18,
    dy: -238,
    r: 44,
} as const

export const PHERO = {
    every: 34,
    life: 5200,
    r: 3.2,
} as const

export const LENS = {
    /** Zoom das cenas de abertura e demonstração. */
    zoom: 1.75,
    at: { x: 640, y: 420 },
} as const

/** O N3: a folha gigante, vista de cima, no lugar da fruta. */
export const GIANT = {
    at: { x: 282, y: 334 },
    /** A folha (960 × 600 de arte, numa imagem de 1024 × 768) aparece com esta largura no mundo. */
    w: 240,
    leafW: 960,
    leafH: 600,
    imageW: 1024,
    imageH: 768,
    /** A sujeira, em px do mundo. */
    dirtW: 54,
    /** Quanto o dedo passa por cima de uma sujeira até ela sumir, em px de tela. */
    rub: 70,
    /** O raio da sujeira para o dedo, em px do mundo. */
    hit: 26,
    zoom: 2.6,
    /** A folha erguida fica com o centro esta altura acima do pé da formiga. */
    lift: 112,
    touch: 22,
    rearm: 40,
} as const

export const FRIEND = {
    w: 82,
    wake: 52,
    /** A distância entre uma amiga e a seguinte na fila, pelo rastro. */
    gap: 50,
    speed: 330,
    pace: 0.7,
    /** Onde cada amiga fica em volta da formiga, carregando a folha. */
    ring: [
        { x: -58, y: 4 },
        { x: 58, y: 4 },
        { x: 0, y: 30 },
    ],
    zzz: { dx: 20, dy: -58 },
} as const

/** O caminho largo do N3: sem as duas pedras de cima, o muro só começa aqui. */
export const WIDE = {
    bottom: 300,
    skip: [168, 250],
    dots: [
        { x: 640, y: 440 },
        { x: 628, y: 392 },
        { x: 620, y: 344 },
        { x: 622, y: 296 },
        { x: 640, y: 252 },
        { x: 684, y: 222 },
        { x: 740, y: 212 },
        { x: 796, y: 222 },
        { x: 840, y: 252 },
        { x: 858, y: 296 },
    ],
} as const

export const GAUGE = {
    /** O medidor fica a esta folga, em px do mundo, da borda direita do item. */
    gap: 26,
} as const
