export const W = 1280
export const H = 720

export const DEPTH = {
    scene: 0,
    crowd: 10,
    rope: 20,
    fighter: 30,
    marker: 40,
    board: 60,
    cards: 70,
    balloon: 90,
    hud: 100,
    fx: 200,
    overlay: 400,
}

export const HUD = {
    h: 72,
    cy: 36,

    pillX: 20,
    pillY: 15,
    pillW: 168,
    pillH: 42,

    titleX: 660,
    titleY: 24,
    titleW: 620,
    hintY: 52,
    hintW: 700,

    helpX: 1218,
    helpR: 26,
    helpHit: 122,

    livesX: 1040,
}

/** A placa do robô: o valor que ele está pedindo. */
export const PLATE = {
    cx: 640,
    cy: 120,
    w: 330,
    h: 74,
}

/** O cartão da frase, com o buraco no meio. */
export const BOARD = {
    cx: 640,
    cy: 238,
    w: 1140,
    h: 132,
    holeW: 214,
    holeH: 78,
    gap: 16,
    fontSize: 40,
}

export const GROUND = 520

export const FIGHTER = {
    size: 220,
    childX: 210,
    childY: 420,
    robotX: 1070,
    /** 4px abaixo da criança: o robô segura a corda mais alto no desenho. */
    robotY: 424,
}

/**
 * A corda liga as duas pontas que já vêm desenhadas nos sprites. Os números
 * saem da medida da folha, não do olho: a ponta da criança para em 0,864 da
 * célula e a do robô em 0,112, e a corda desenhada tem 28 de 500 de grossura.
 */
export const ROPE = {
    y: 441,
    /**
     * Onde a corda ENCOSTA na mão, medido no sprite parado. O marcador anda
     * entre estes dois.
     */
    left: 290,
    right: 985,
    /**
     * Onde a corda é DESENHADA. Ela entra por baixo dos dois: quando o sprite
     * inclina no puxão, a ponta dele anda até 22px e abriria um vão. Como a
     * corda fica atrás das figuras (depth 20 contra 30), a sobra some.
     */
    drawLeft: 258,
    drawRight: 1036,
    thickness: 13,
    /** Altura da corda.png. A textura encolhe junto com a grossura. */
    textureHeight: 26,
    marker: 40,
    trackY: 470,
    /** Marcas do lado da criança; vencer é chegar na última. */
    steps: 5,
    /** Até onde o robô consegue arrastar. A corda para aí. */
    robotSteps: 2,
}

export const ropeCenter = () => (ROPE.left + ROPE.right) / 2

export const ropeStep = () => (ropeCenter() - ROPE.left) / ROPE.steps

export const markerX = (position: number) => ropeCenter() - position * ropeStep()

export const CARD = {
    w: 420,
    h: 130,
    cy: 620,
    leftX: 390,
    rightX: 890,
}

export const THINK = {
    x: 340,
    y: 700,
    w: 600,
    h: 14,
}

export const boardBounds = () => ({ x: BOARD.cx, y: BOARD.cy, w: BOARD.w, h: BOARD.h })

export const plateBounds = () => ({ x: PLATE.cx, y: PLATE.cy, w: PLATE.w + 40, h: PLATE.h + 40 })

export const cardsBounds = () => ({
    x: BOARD.cx,
    y: CARD.cy,
    w: CARD.rightX - CARD.leftX + CARD.w + 40,
    h: CARD.h + 40,
})
