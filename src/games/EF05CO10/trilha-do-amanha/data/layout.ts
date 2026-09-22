export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    hills: 4,
    ground: 8,
    decor: 12,
    solid: 16,
    puddle: 18,
    workshop: 20,
    person: 24,
    shadow: 28,
    hero: 32,
    carried: 34,
    wave: 60,
    balloon: 80,
    guide: 100,
    veil: 200,
    panel: 210,
    pad: 300,
    hud: 400,
    poster: 600,
    overlay: 5000,
}

export const WORLD = {
    width: 3840,
    groundY: 560,
    startX: 1080,
    /** O rio: a voz atravessa, o menino não. É o que faz a distância existir. */
    riverX: 500,
    riverW: 460,
    /** A margem de cá. O menino nunca passa daqui para a esquerda. */
    bankX: 1030,
    /** Até onde ele ainda está na margem, pronto para mandar o recado. */
    bankZone: 190,
    /**
     * Na margem a câmera olha um pouco adiante: sem isso, centrada no menino,
     * ela deixa a outra margem inteira para fora da tela.
     */
    bankLookAhead: 200,
    workshopX: 3470,
    workshopReach: 220,
    puddleX: 1860,
    puddleW: 300,
}

export const PHYS = {
    gravity: 1400,
    jump: 620,
    speed: 320,
    maxFall: 1400,
    coyoteMs: 120,
    bufferMs: 150,
    stepUp: 46,
    heroH: 150,
    heroHalfW: 34,
}

export const CAM = {
    lerp: 0.12,
    /** Quanto da pessoa tem de sobrar na borda quando a fase abre. */
    openMargin: 140,
    /** A altura que a camera mira enquanto acompanha a entrega. */
    lookY: 430,
    /** De perto: quem esta falando, e quem recebe. */
    nearZoom: 1.34,
    /** Na viagem: um pouco mais aberto, para caber o caminho. */
    travelZoom: 1.16,
    /** O balao da resposta abre para a direita: a camera desloca para ele caber. */
    replyShift: 150,
    /** A travessia da cena de abertura: lenta e linear, para o rio ter tamanho. */
    openPan: 2600,
    openBack: 1300,
}

export const HUD = {
    h: 72,
    cy: 36,
    pillX: 20,
    pillY: 14,
    pillW: 158,
    pillH: 44,
    dotsX: 200,
    dotGap: 38,
    dotR: 11,
    titleX: 640,
    titleW: 470,
    livesX: 1020,
    helpX: 1206,
    helpR: 27,
    helpHit: 120,
}

export const PAD = {
    left: { x: 110, y: 640, r: 80 },
    right: { x: 300, y: 640, r: 80 },
    jump: { x: 1150, y: 630, r: 90 },
    use: { x: 640, y: 630, w: 320, h: 140 },
    idleAlpha: 0.55,
    downAlpha: 0.95,
}

export const SHOP = {
    cx: [320, 640, 960],
    artCy: 340,
    artW: 240,
    artH: 260,
    nameCy: 512,
    nameW: 240,
    nameFont: 34,
    titleY: 116,
    noteY: 166,
}

export const SAY = {
    cardW: 1000,
    cardH: 100,
    gap: 15,
    firstCy: 300,
    font: 34,
    titleY: 178,
}

/** As camadas do fundo: onde cada tira encosta e o quanto ela anda. */
export const BG = {
    skyBottom: 580,
    skyFactor: 0.25,
    hillsBottom: 578,
    hillsH: 230,
    hillsFactor: 0.55,
}

/** Os quadros de `menino.png`, na ordem que `mensageiro.ts` usa. */
export const HERO_FRAME = {
    idle: 0,
    walk: [1, 2, 3, 4],
    jump: 5,
    call: 6,
    carry: 7,
}

/** `trilha.png`: a altura na trilha de cada um dos quatro objetos. */
export const PROPS = [
    { key: 'degrau', frame: 0, height: 40, solid: true },
    { key: 'caixa', frame: 1, height: 80, solid: true },
    { key: 'pedra', frame: 2, height: 44, solid: true },
    { key: 'arbusto', frame: 3, height: 48, solid: false },
] as const

/**
 * A trilha do nível 1, a mesma nas três fases. Toda caixa tem degrau dos dois
 * lados: subir andando é sempre possível, e o pulo nunca é o caminho.
 */
export const TRAIL: Array<{ x: number; prop: number }> = [
    { x: 1320, prop: 0 },
    { x: 1420, prop: 1 },
    { x: 1520, prop: 0 },
    { x: 1700, prop: 2 },
    { x: 2260, prop: 3 },
    { x: 2420, prop: 0 },
    { x: 2520, prop: 1 },
    { x: 2620, prop: 0 },
    { x: 2860, prop: 2 },
    { x: 3080, prop: 3 },
    { x: 3260, prop: 3 },
]

export const GUIDE_IDLE_MS = 6000

/**
 * Quanto uma frase fica na tela.
 *
 * Criança de dez anos lê por volta de três letras por décimo de segundo, e
 * ainda precisa de um respiro no fim para a frase assentar. Tempo fixo dava
 * conta das falas curtas e cortava as longas no meio.
 */
export const leitura = (texto: string) => Math.max(2400, 900 + texto.length * 62)
