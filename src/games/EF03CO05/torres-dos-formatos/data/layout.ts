export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    lane: 10,
    bucket: 30,
    stored: 40,
    faller: 60,
    fx: 200,
    controls: 240,
    lock: 300,
    hud: 500,
    overlay: 5000,
}

export const HUD = {
    h: 70,
    cy: 34,
    pillX: 20,
    pillY: 11,
    pillW: 176,
    pillH: 48,
    markX: 216,
    markW: 26,
    markH: 34,
    markGap: 12,
    livesX: 352,
    helpX: 1226,
    helpR: 27,
    helpHit: 116,
}

/**
 * As pistas. Quantas existem muda por onda — duas no começo, quatro no fim —
 * e a largura acompanha, porque alvo grande é o que uma criança de oito anos
 * precisa quando decide com o dedo.
 */
export const LANE = {
    top: 82,
    /** Onde os pés do arquivo nascem e onde eles pousam. */
    spawnY: 244,
    landY: 496,
    maxPitch: 232,
    span: 940,
    width: 214,
    /** Quanto tempo o arquivo leva para deslizar uma pista inteira. */
    slideMs: 170,
}

export const BUCKET = { y: 556, w: 202, h: 112, icon: 74, dot: 13 }

export const FALLER = {
    /** Lado do quadro de 300 x 300 na tela. A criatura ocupa ~90% dele. */
    size: 184,
    /** Os pés ficam a 96% da altura do quadro. */
    originY: 0.96,
    /** O painel claro do corpo, medido na célula de 300 x 300. */
    panel: { cx: 0.5, cy: 0.558, w: 0.44, h: 0.32 },
}

export const CONTROLS = {
    y: 662,
    w: 300,
    h: 96,
    leftX: 250,
    rightX: 1030,
    hitW: 330,
    hitH: 124,
}
