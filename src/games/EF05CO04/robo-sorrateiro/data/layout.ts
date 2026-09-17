export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    path: 10,
    glow: 12,
    hidden: 26,
    prop: 30,
    robot: 34,
    cone: 38,
    owl: 40,
    ring: 44,
    veil: 70,
    card: 80,
    balloon: 60,
    hud: 100,
    tip: 120,
    fx: 200,
    frame: 300,
} as const

export const HUD = {
    h: 92,
    cy: 44,
    livesX: 44,
    livesY: 44,
    /** O selo do nível, logo depois das vidas. */
    levelX: 208,
    levelW: 150,
    missionX: 648,
    dotX: 1112,
    dotGap: 34,
    dotR: 11,
    helpX: 1216,
    helpR: 30,
    helpHit: 120,
} as const

/** A sala vive entre o HUD e a borda de baixo. */
export const ROOM = { top: 88, bottom: 700 } as const

/**
 * O trajeto mora no tapete do `bg-biblioteca.png`: o meio da imagem é chão
 * livre, e `y = 470` cai dentro dele em qualquer borda da tela.
 */
export const PATH = { y: 470, startX: 160, endX: 1060 } as const

export const DOOR = { x: 1152, y: 424, h: 168 } as const

/** A coruja fica acima do trajeto, com o aro de tempo por cima dela. */
export const OWL = { y: 196, h: 140, ringDy: -74, ringR: 42, coneDy: 40 } as const

/** Os móveis ficam atrás da linha de passos; o robô se agacha atrás deles. */
export const PROP = { dy: -58, h: 104 } as const

export const ROBOT = { h: 122, hideDy: -76 } as const

/**
 * As cartas moram na FAIXA DE BAIXO da tela. Tudo acima delas é a câmera do
 * jogo, e é ali que a coruja e o robô precisam caber quando ela chega perto.
 */
export const CARD = {
    cy: 600,
    two: { w: 560, h: 211, gap: 56 },
    three: { w: 396, h: 149, gap: 36 },
} as const

/**
 * A Mel fica no canto de baixo à direita, logo acima das cartas, VIRADA PARA A
 * ESQUERDA — o quadro de perfil da folha olha para a direita, então ele é
 * espelhado; sem isso ela fala olhando para fora da tela.
 */
export const MEL = {
    x: 1168,
    base: 492,
    h: 232,
    balloonX: 988,
    balloonY: 196,
    balloonW: 432,
    balloonH: 116,
    wrap: 372,
} as const

/** O balão do robô: curto, preso na cabeça dele. */
export const BUBBLE = { dy: -132, padX: 26, h: 64, max: 420 } as const

export function stepX(index: number, total: number): number {
    const span = (PATH.endX - PATH.startX) / total
    return PATH.startX + span * (index + 0.5)
}

export function cardSlots(count: number): { x: number; w: number; h: number }[] {
    const size = count >= 3 ? CARD.three : CARD.two
    const total = count * size.w + (count - 1) * size.gap
    const left = W / 2 - total / 2
    return Array.from({ length: count }, (_, i) => ({
        x: left + i * (size.w + size.gap) + size.w / 2,
        w: size.w,
        h: size.h,
    }))
}
