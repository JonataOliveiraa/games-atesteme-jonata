export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    niche: 10,
    veil: 20,
    door: 30,
    explorer: 50,
    crystal: 60,
    altar: 70,
    bag: 80,
    ficha: 90,
    band: 140,
    fx: 200,
    lock: 260,
    hud: 500,
    overlay: 5000,
}

/** Header de ponta a ponta: nível, páginas do diário, vidas e `?`. Sem frase. */
export const HUD = {
    h: 78,
    cy: 38,
    pillX: 20,
    pillY: 14,
    pillW: 176,
    pillH: 48,
    pagesX: 216,
    pageW: 26,
    pageH: 34,
    pageGap: 12,
    livesX: 352,
    helpX: 1226,
    helpR: 27,
    helpHit: 116,
}

/**
 * A caverna. O cristal fica FECHADO até a picareta bater: a palavra é o que
 * cai de dentro dele, e por isso nenhum rótulo aparece antes da mineração.
 */
export const CAVE = {
    crystal: 162,
    hitW: 176,
    hitH: 180,
    /** O explorador para a esta distância: a ponta da picareta encosta na pedra. */
    stopGap: 122,
    /** Os pés ficam este tanto abaixo do centro do cristal. */
    footDrop: 132,
    footMin: 452,
    footMax: 604,
    startX: 150,
    startY: 592,
    exitX: 250,
    minX: 118,
}

/** Onde os cristais nascem, por quantidade. Embaralhado por galeria. */
export const SLOTS_BY_COUNT: Record<number, { x: number; y: number }[]> = {
    3: [
        { x: 322, y: 398 },
        { x: 596, y: 324 },
        { x: 854, y: 404 },
    ],
    4: [
        { x: 300, y: 390 },
        { x: 490, y: 320 },
        { x: 682, y: 420 },
        { x: 858, y: 332 },
    ],
    5: [
        { x: 300, y: 316 },
        { x: 318, y: 488 },
        { x: 578, y: 316 },
        { x: 596, y: 488 },
        { x: 856, y: 398 },
    ],
    6: [
        { x: 292, y: 316 },
        { x: 306, y: 488 },
        { x: 574, y: 316 },
        { x: 588, y: 488 },
        { x: 856, y: 316 },
        { x: 866, y: 488 },
    ],
}

export const EXPLORER = {
    frameW: 350,
    frameH: 500,
    /** A sola do sapato está a 95% da altura do quadro, nos dez quadros. */
    originY: 0.95,
    /** Escala pela profundidade: mais alto na trilha, menor. */
    nearScale: 0.47,
    farScale: 0.4,
    speedPxS: 520,
    stepMs: 170,
    swingMs: 200,
    altar: { x: 130, y: 424, scale: 0.34 },
}

/** A porta não existe até a informação nascer: ela aparece no vão do fundo. */
export const DOOR = {
    niche: { x: 1092, y: 246, h: 318 },
}

/** A faixa da informação e a placa, no alto do altar. */
export const BAND = { x: 640, y: 162, w: 860, h: 96 }
export const PLACA = { x: 640, y: 246, w: 820 }

export const ALTAR = {
    slab: { x: 640, y: 380, w: 840, h: 232 },
    slotY: 326,
    slotW: 202,
    slotH: 118,
    slotGap: 212,
    join: { x: 640, y: 448, w: 232, h: 92 },
    joinHitW: 264,
    joinHitH: 132,
}

export const FICHA = {
    w: 190,
    h: 104,
    icon: 56,
    font: '22px',
    hitW: 202,
    // 122 quando as fichas vêm em duas linhas; 136 quando vêm em uma.
    // No celular (fator 0,30) isso é a diferença entre 37 e 41 px reais.
    hitH: 122,
    hitTall: 136,
}

/** A palavra recém-minerada, ainda flutuando sobre a pedra. */
export const WORD = { w: 176, h: 98, icon: 52, font: '21px' }

/** Só existe no nível 3, quando um dado ficou para trás na caverna. */
export const BACK = { x: 132, y: 496, w: 176, h: 68, hitW: 204, hitH: 92 }

/** As fichas disponíveis, embaixo, à direita da bolsa aberta. */
export const BAGROW = { cx: 706, y: 600, gap: 224, rowGap: 118, perRow: 4 }

export const BAG = {
    explore: { x: 1194, y: 640, size: 130 },
    altar: { x: 118, y: 612, size: 150 },
}
