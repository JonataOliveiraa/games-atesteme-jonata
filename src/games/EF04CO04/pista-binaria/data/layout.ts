import { BLOCK_HOLE, BLOCK_SHEET, MACHINE_SCREEN, MACHINE_SHEET, SHIP_SHEET } from './art'

/**
 * Tela fixa de 1280 × 720, com `Scale.FIT`. Nada aqui é relativo.
 *
 * ── A ESCALA ENCOLHEU (revisão 3) ─────────────────────────────────────────
 *
 * A primeira montagem tinha bloco de 200, botões de 480 × 208 e máquina de
 * 380: cada peça sozinha era legível e o conjunto parecia brinquedo de criança
 * de dois anos. Agora cabe uma FILA de caixas na tela ao mesmo tempo, que é o
 * que dá ritmo ao jogo.
 *
 * O piso continua sendo o dedo — a conta é o tamanho real num celular de
 * 390 px (fator 0,30):
 *
 *   botão            320 × 132  →  96 × 40 px reais
 *   quadradinho          ~76    →  23 px reais
 *   vão entre os botões  320    →  96 px reais
 */
export const W = 1280
export const H = 720

/**
 * O cabeçalho, no padrão do catálogo: pílula do NÍVEL e bolinhas de FASE à
 * esquerda, o que fazer no meio, vidas e `?` à direita.
 */
export const HUD = {
    h: 92,
    cy: 46,
    pillX: 20,
    pillY: 22,
    pillW: 132,
    pillH: 48,
    dotX: 188,
    dotGap: 44,
    dotR: 15,
    titleX: 660,
    livesX: 1020,
    helpX: 1206,
    helpR: 30,
    helpHit: 136,
} as const

/** A altura em que a fila voa. */
export const LANE_Y = 330

export const LANE = {
    top: 244,
    bottom: 416,
} as const

/* ─────────────────────────────────────────────── a máquina, à esquerda */

const MACHINE_SCALE = 0.78

export const MACHINE = {
    x: 168,
    y: 254,
    scale: MACHINE_SCALE,
    cell: MACHINE_SHEET.frameWidth * MACHINE_SCALE,
    /** centro da tela, em coordenada LOCAL (nativa) do contêiner */
    screenX: (MACHINE_SCREEN.cx - 0.5) * MACHINE_SHEET.frameWidth,
    screenY: (MACHINE_SCREEN.cy - 0.5) * MACHINE_SHEET.frameHeight,
    screenW: MACHINE_SCREEN.w * MACHINE_SHEET.frameWidth,
    screenH: MACHINE_SCREEN.h * MACHINE_SHEET.frameHeight,
    /** a grade cabe pela ALTURA do furo (178 nativos), não pela largura */
    grid: 5,
    pixel: 33,
} as const

/* ──────────────────────────────────────────────────── a nave, no meio */

const SHIP_SCALE = 0.46

export const SHIP = {
    x: 420,
    y: LANE_Y,
    scale: SHIP_SCALE,
    cell: SHIP_SHEET.frameWidth * SHIP_SCALE,
    noseX: 420 + (591 / 600 - 0.5) * SHIP_SHEET.frameWidth * SHIP_SCALE,
} as const

/* ────────────────────────────────── a fila de caixas, vindo da direita */

const BLOCK_SCALE = 0.38

export const BLOCK = {
    scale: BLOCK_SCALE,
    size: BLOCK_SHEET.frameWidth * BLOCK_SCALE,
    spawnX: 1360,
    /** onde a primeira caixa encosta e a fila para de andar */
    stopX: 660,
    /** distância entre uma caixa e a seguinte, no voo e na fila parada */
    gap: 232,
    holeX: (BLOCK_HOLE.cx - 0.5) * BLOCK_SHEET.frameWidth * BLOCK_SCALE,
    holeY: (BLOCK_HOLE.cy - 0.5) * BLOCK_SHEET.frameHeight * BLOCK_SCALE,
    /** o quadradinho: o menor lado do furo, com folga de papel */
    inner: Math.round(BLOCK_HOLE.h * BLOCK_SHEET.frameHeight * BLOCK_SCALE) - 12,
} as const

/** O tiro sai da proa e é rápido: o gesto tem que parecer instantâneo. */
export const SHOT = {
    speed: 1350,
    size: 56,
} as const

/* ─────────────────────────────────────────────── os dois botões */

export const BUTTON = {
    y: 622,
    w: 320,
    h: 132,
    oneX: 320,
    zeroX: 960,
    shapeDX: -70,
    shape: 78,
    digitDX: 70,
} as const

export const DEPTH = {
    bg: 0,
    veil: 1,
    lane: 2,
    motes: 3,
    machine: 10,
    block: 20,
    ship: 30,
    shot: 36,
    flight: 40,
    buttons: 50,
    hud: 60,
    frame: 70,
    reveal: 120,
} as const
