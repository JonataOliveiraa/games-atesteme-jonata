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
  help: { cx: 1226, cy: 34, r: 30 },
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

/** O nível 2 não tem bancada: tem um caminho, e o caminho é o enunciado. */
export const LANE = {
  cy: 392,
  x0: 110,
  x1: 1060,
  /** Onde a Lia começa, fora da primeira estação. */
  startX: 62,
  stone: { w: 208, h: 92, radius: 26 },
  slot: { r: 52 },
  /** A fileira de coisas, acima do caminho. */
  object: { cy: 240, size: 96, gap: 104 },
  /** O laço: um colchete que abraça a estação inteira. */
  loop: { top: 172, halfWidth: 152, pip: { r: 9, gap: 26 } },
  /** A bifurcação: o poste da dúvida e os dois ramos. */
  fork: { dy: 84, postDx: -118, markDx: -62, slotDx: 34 },
  goal: { cx: 1168, cy: 392, w: 156, radius: 22, icon: 52, gap: 8, objectDy: -210 },
  lia: { h: 140 },
}

export const BELT = {
  cy: 636,
  token: { r: 54, gap: 130 },
  cx: 500,
  play: { cx: 1160, cy: 636, r: 52 },
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
