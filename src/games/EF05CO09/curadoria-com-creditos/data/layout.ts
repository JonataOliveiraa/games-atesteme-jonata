export const W = 1280
export const H = 720

export const PANEL = { x: 72, y: 142, w: 1136, h: 486 }

export const EASEL = {
  cx: 306,
  cy: 384,
  w: 420,
  h: 432,
  tilt: -1.6,
  thumbBox: 232,
  kindDy: -196,
  thumbDy: -60,
  titleDy: 88,
  originDy: 152,
  sealDx: 150,
  sealDy: -152,
  sealR: 52,
}

export const TAG = {
  x: 556,
  y: 168,
  w: 628,
  h: 432,
  cx: 870,
  holeX: 598,
  holeY: 200,
  headerY: 200,
  licenseY: 246,
  slotW: 548,
  slotH: 74,
  slotGap: 84,
  slotBlockCy: 394,
  prefixDx: 132,
  stampY: 556,
  stampW: 340,
  stampH: 66,
}

export const SHEET = {
  x: 140,
  y: 364,
  w: 1000,
  handleY: 386,
  questionY: 436,
  optionW: 880,
  optionH: 70,
  optionFirstY: 502,
  optionGap: 82,
}

export const MURAL = {
  ribbonY: 178,
  slotW: 232,
  slotH: 260,
  slotCy: 340,
  firstX: 226,
  gapX: 268,
  statusY: 496,
  publishY: 560,
  publishW: 380,
  publishH: 68,
}

export const MASCOTE = 88

export const HUD = {
  depth: 100,
  plate: { x: 26, y: 16, w: 212, h: 58 },
  labelX: 56,
  levelY: 34,
  phaseY: 60,
  instructionX: W / 2 - 120,
  instructionY: 44,
  subX: W / 2 - 70,
  subY: 88,
  tally: { x: 984, y: 20, w: 244, h: 52, firstX: 1004, gapX: 74, cy: 46, r: 13 },
  help: { cx: 948, cy: 46, r: 23, touch: 54 },
  // sob a caixa de selos, alinhada à borda direita dela: o canto do tempo e
  // o canto do placar são o mesmo canto, e nada disso cruza o texto do meio
  timer: { cx: 1130, cy: 100, w: 196, h: 18 },
}
