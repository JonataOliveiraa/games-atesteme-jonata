export const W = 1280
export const H = 720

export const DEPTH = {
    ground: 0,
    road: 2,
    scenery: 6,
    gate: 14,
    item: 20,
    car: 30,
    weather: 40,
    cloud: 46,
    fx: 60,
    hud: 100,
    overlay: 400,
}

/**
 * Header de ponta a ponta com TRÊS blocos que não se cruzam: pontos à
 * esquerda, placa da regra no meio, bandeirinhas de trecho e `?` à direita.
 * Embaixo, o painel do carro fecha a moldura e dá endereço fixo ao recado.
 */
export const HEADER = { x: 0, y: 0, w: W, h: 96, accent: 5 }

/** O recado do copiloto mora na grama à esquerda, num endereço que não muda. */
export const COPILOT = { x: 164, y: 636, w: 312, h: 108, faceR: 21 }

export const SIGN = { x: 640, y: 50, w: 600, h: 78, tabW: 190 }

/** Nível e trechos à esquerda, no padrão do Ateliê de Códigos Digitais. */
export const PROGRESS = {
    cy: 50,
    pillX: 24,
    pillY: 29,
    pillW: 176,
    pillH: 42,
    dotsX: 226,
    gap: 32,
    dotR: 9,
}

export const HELP = { x: 1234, y: 50, r: 30 }

/**
 * O aviso de placa nova mora entre a placa e o `?`, no único vão do header
 * que ninguém ocupa. Ele nunca cobre a placa: a criança precisa ver as duas
 * coisas ao mesmo tempo — que mudou, e para o quê.
 */
export const ALERT = { x: 1072, y: 50, w: 196, h: 66, picto: 40 }

/** A pista ocupa o meio; as duas margens ficam para o cenário do bioma. */
export const ROAD = {
    x: 340,
    w: 600,
    top: HEADER.h + HEADER.accent,
    shoulder: 18,
}
export const ROAD_RIGHT = ROAD.x + ROAD.w

export const laneWidth = (lanes: number) => ROAD.w / lanes
export const laneX = (lane: number, lanes: number) => ROAD.x + laneWidth(lanes) * (lane + 0.5)
export const laneLeft = (lane: number, lanes: number) => ROAD.x + laneWidth(lanes) * lane

export const CAR = { y: 600, w: 124, sheetW: 350, sheetH: 570 }
export const CAR_H = Math.round((CAR.w * CAR.sheetH) / CAR.sheetW)

/**
 * O item nasce logo abaixo do header e é resolvido quando encosta no capô.
 * `TRAVEL` é a distância que governa a velocidade do mundo inteiro: pista,
 * cenário e item andam no mesmo passo, porque no mundo quem se move é o carro.
 */
export const ITEM = {
    spawnY: 158,
    size: 92,
}

/**
 * Onde o item ENCOSTA no carro. A coleta é colisão de verdade entre as duas
 * caixas — passar por cima pega, e é isso que os olhos da criança dizem que
 * deveria acontecer. `fallMs` mede o tempo até aqui.
 */
export const TOUCH_Y = CAR.y - CAR_H / 2 - ITEM.size * 0.4
export const TRAVEL = TOUCH_Y - ITEM.spawnY

export const GATE = { h: 44 }

/**
 * A comemoração acontece NO MUNDO, com as peças que a criança recolheu, e só
 * depois entra o painel de fim de nível padrão dos 45 jogos.
 */
export const ALBUM = { titleY: 244, y: 348, gap: 92, size: 76 }
