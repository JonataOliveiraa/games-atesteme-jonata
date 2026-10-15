export const W = 1280
export const H = 720

export const DEPTH = {
    floor: 0,
    /** o véu que apaga o chão: o cenário recua e as peças do jogo ficam na frente */
    wash: 1,
    rails: 2,
    route: 3,
    /** as sombras das peças, no chão: acima do trilho aceso, abaixo de tudo o que anda */
    shadow: 4,
    lever: 6,
    train: 8,
    shed: 10,
    plaque: 11,
    board: 18,
    sign: 18,
    fx: 24,
    banner: 30,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

/** a placa da regra, pendurada no alto */
export const SIGN = { x: 640, y: 56, w: 450, h: 100 } as const

/** o quadro com a etiqueta do trem parado: uma linha por campo */
export const BOARD = {
    x: 300,
    y: 268,
    w: 500,
    h: 286,
    rowsTop: -88,
    rowGap: 72,
    pillX: -130,
    pillW: 150,
    pillH: 56,
    valueX: -36,
} as const

/** medidas da ui.png: o centro da tábua da placa (abaixo das correntes) e o do painel da plaquinha (acima dos pés), em fração da altura da peça */
export const UI_ART = { signPlankY: 0.76, plaquePanelY: 0.42 } as const

/** bitola (distância entre os dois trilhos), passo dos dormentes e espessura; `bed` é a largura do leito de brita, e `edge` a borda dele */
export const RAIL = { gauge: 34, sleeperGap: 26, sleeperLen: 56, sleeperW: 14, width: 6, bed: 74, edge: 4 } as const

/** a sombra de cada peça no chão (deslocamento na tela) */
export const SHADOW = { x: 6, y: 10, alpha: 0.24 } as const
/** o contorno branco parado dos controles principais (alavanca, PARTIR, CARIMBAR) */
export const RIM = 5

/** comprimentos na tela (ao longo do trilho) */
export const TRAIN = { loco: 150, wagon: 140, gap: 6, crate: 78, speed: 260 } as const

/** a altura do sinal; a posição vem do mapa */
export const SIGNAL = { h: 110 } as const
/** as medidas da alavanca; a base (centro e pivô do cabo) vem do mapa */
export const LEVER = { base: 80, handle: 90, tilt: 32, hitW: 150, hitH: 170 } as const
export const GO = { x: 430, y: 676, w: 220, h: 72 } as const

/** a faixa do erro fica na faixa livre entre a etiqueta e o trilho, sem cobrir o trem nem os galpões */
export const BANNER = { x: 320, y: 480, w: 620, h: 96 } as const

// ───────────────────────────────────────────── N2 e N3 (pátio largo; o mundo anda, isto fica fixo na tela)

/** a etiqueta comprida, logo abaixo da placa: os campos lado a lado */
export const STRIP = { x: 640, y: 166, w: 1210, h: 96, pad: 34, barcode: 130, pillW: 118, pillH: 48, gap: 12 } as const

/** o CARIMBAR (N3), à esquerda do PARTIR */
export const STAMP_BUTTON = { x: 180, y: 676, w: 220, h: 72 } as const

/** o recado do N3: o painel preso no posto (no mundo) */
export const NOTE = { w: 300, h: 190 } as const
/** o posto do carimbo (no mundo) e a ferramenta que voa até a etiqueta */
export const BOOTH = { size: 150, tool: 120, mark: 96 } as const

/** a faixa do erro no pátio largo: no pé da tela, por cima dos botões (já desligados), sem cobrir trem, galpão nem recado */
export const WIDE_BANNER = { x: 640, y: 664, w: 760, h: 96 } as const

/** arrastar: a partir de quantos pixels deixa de ser toque; teclas A/D (←/→) andam a esta velocidade (px/s); a UI fixa volta `lookHold` ms depois de o pátio parar */
export const CAMERA = { dragSlop: 14, keySpeed: 900, panMs: 900, followLerp: 0.12, lookHold: 200 } as const
