export const W = 1280
export const H = 720

export const HUD = {
  x: 0,
  y: 0,
  w: W,
  h: 68,
  accent: 3,
  level: { x: 28, cy: 24 },
  dot: { r: 8, gap: 26, y: 48, x: 36 },
  // Longe da borda: 62px de margem a direita, e o toque e maior que o
  // desenho (68px) para caber o dedo.
  help: { cx: 1218, cy: 34, r: 27, touch: 68 },
}

export const BENCH = {
  x: 24,
  y: HUD.h + 12,
  w: 900,
  h: 620,
  radius: 28,
  pad: 20,
}

export const STAGE = {
  x: BENCH.x + BENCH.pad,
  y: BENCH.y + BENCH.pad,
  w: BENCH.w - BENCH.pad * 2,
  h: 214,
  radius: 20,
  object: { size: 118, gap: 60, cy: BENCH.y + BENCH.pad + 88 },
  focus: { dy: -28 },
}

/** Its own line: inside the stage it covered the very objects it explains. */
export const NOTICE = {
  cx: BENCH.x + BENCH.w / 2,
  cy: STAGE.y + STAGE.h + 36,
  w: BENCH.w - BENCH.pad * 2,
  h: 54,
  radius: 16,
}

export const TRACK = {
  cy: 452,
  slotWidth: 178,
  slotHeight: 108,
  gap: 46,
  radius: 18,
  badge: { dx: -74, dy: -38, r: 20 },
  arrow: { width: 26, height: 20 },
  head: { r: 14, dy: -74 },
}

export const SHELF = {
  cy: 594,
  board: { y: 640, h: 14 },
  width: 192,
  height: 112,
  gap: 26,
  radius: 18,
  icon: { dy: -24, size: 52 },
  label: { dy: 34 },
}

export const COLUMN = {
  cx: 1100,
  x: 944,
  w: 312,
  bubble: { cy: 168, w: 300, hMin: 116, hMax: 196, radius: 24 },
  button: { cy: 340, w: 280, h: 82, radius: 41 },
  trainer: { cy: 550, w: 280, h: 300 },
}

/**
 * O nível 2 em TRÊS FAIXAS, de cima para baixo.
 *
 *   1. o ALGORITMO — os buracos dos gestos e o colchete do laço
 *   2. as COISAS   — plantas, mochila, o que a Lia usa
 *   3. o CAMINHO   — as pedras, e a Lia andando
 *
 * Os buracos moravam na mesma linha do caminho, e a Lia passava por cima
 * deles a partida inteira. Pôr ela atrás resolvia a metade errada: os
 * ícones sumiam ou ela sumia. Separar as faixas resolve as duas, e de
 * quebra diz o que cada coisa é — em cima o programa, embaixo o mundo.
 *
 * A conta que não pode quebrar: o topo da Lia (332) fica abaixo do buraco
 * mais baixo da bifurcação (302), e os pés dela (424) ficam bem acima do
 * cinto (534).
 */
export const LANE = {
  /** Faixa 1: a linha dos buracos. */
  slotY: 200,
  /** Faixa 3: o caminho por onde ela anda. */
  cy: 424,
  x0: 110,
  x1: 1060,
  startX: 62,
  /** O quanto ela para antes da coisa: em cima dela o gesto fica escondido. */
  stand: 82,
  stone: { w: 208, h: 84, radius: 24 },
  slot: { r: 46 },
  /** Faixa 2. */
  object: { cy: 348, size: 88, gap: 104 },
  loop: { top: 116, bottom: 404, halfWidth: 152, pip: { r: 9, gap: 26 } },
  /*
   * A bifurcação lida como fluxograma: a placa da pergunta à esquerda,
   * dois fios saindo dela, um ✓ e um ✗ na dobra, e um buraco no fim de
   * cada fio. Antes era um disco preto solto com um `?` — e nos enigmas
   * em que a coisa perguntada mora noutra estação o disco não cobria
   * nada: ficava um `?` boiando, sem dizer sobre O QUE se perguntava.
   */
  fork: {
    dy: 56,
    postDx: -118,
    cardDx: -104,
    cardR: 50,
    elbowDx: -20,
    slotDx: 78,
    labelDy: 76,
  },
  goal: { cx: 1168, cy: 424, w: 156, radius: 22, icon: 52, gap: 8, objectDy: -180 },
  lia: { h: 104 },
}

export const BELT = {
  /*
   * O cinto subiu 46px para caber o NOME de cada gesto embaixo do disco.
   * O topo do disco (534) passa 6px abaixo do buraco mais baixo da
   * bifurcacao (528); a base do nome fica em 694, com folga ate 720.
   */
  cy: 590,
  token: { r: 56, gap: 176 },
  cx: 512,
  label: { dy: 90, size: '24px', wrap: 170 },
  play: { cx: 1168, cy: 596, r: 60 },
}

/** O quadro de versões: o que ela tentou, em ordem, sem uma palavra. */
export const VERSIONS = {
  cx: 640,
  cy: 400,
  w: 720,
  rowH: 74,
  radius: 26,
  chip: 26,
  gap: 62,
}
