/**
 * Layout único do Investigação: Dados em Risco — 1280x720.
 *
 * Uma coluna, em faixas. Sem personagem-guia, então a largura inteira é do jogo.
 *
 *   HUD        10–94
 *   PERGUNTA  104–144
 *   MENSAGEM  150–440
 *   IMPACTO   460–566
 *   QUEM VIU  580–700
 *
 * No Nível 3 as faixas de impacto e de desconhecidos não existem: as duas
 * versões da mensagem ocupam de 150 a 560.
 */
export const W = 1280
export const H = 720

export const HUD = {
    x: 16,
    y: 10,
    w: W - 32,
    h: 84,
    r: 26,
    cy: 52,

    pillX: 42,
    pillY: 32,
    pillW: 134,
    pillH: 40,

    dotsX: 202,
    dotsMaxW: 190,
    dotR: 8,

    titleX: 660,
    titleY: 40,
    titleW: 600,
    hintY: 70,
    hintW: 620,

    helpX: 1216,
    helpR: 27,
}

export const QUESTION = { cx: 640, cy: 124, wrap: 1120 }

/** O post, no Nível 1 e 2. */
export const MSG = {
    cx: 640,
    cy: 295,
    w: 1040,
    h: 290,
    r: 28,
    /** Cabeçalho "de: Lia", no topo do cartão. */
    fromDY: -104,
    avatarX: -468,
    avatarSize: 52,
    fromX: -428,
    /** Centro vertical do bloco de texto. */
    textCY: 22,
    wrap: 940,
    lineH: 70,
}

/**
 * A pastilha de informação.
 *
 * 56px de altura mais o respiro do `lineH` dá alvo confortável para dedo de
 * criança de 8 anos, com `Scale.FIT` encolhendo tudo junto.
 */
export const PILL = {
    h: 56,
    padX: 22,
    r: 28,
    /** Espaço entre uma pastilha/palavra e a seguinte. */
    gap: 10,
    sealDX: 14,
    sealSize: 40,
}

export const IMPACT = {
    cx: 640,
    cy: 513,
    w: 940,
    h: 106,
    r: 24,
    iconX: -418,
    iconSize: 62,
    textX: -362,
    wrap: 720,
}

export const WATCH = {
    cx: 640,
    y: 644,
    labelY: 590,
    size: 62,
    gap: 14,
    /** Acima disso a fileira aperta em vez de estourar a tela. */
    max: 14,
    rowW: 1100,
}

/** Nível 3: as duas versões, lado a lado. */
export const OPT = {
    cy: 355,
    w: 560,
    h: 410,
    gap: 40,
    r: 28,
    fromDY: -158,
    avatarX: -228,
    avatarSize: 46,
    fromX: -194,
    textCY: -10,
    wrap: 470,
    lineH: 56,
    sealDY: 150,
    sealSize: 64,
}

export const TOAST = {
    y: 660,
    hiddenY: 790,
    w: 800,
    h: 76,
    r: 22,
}
