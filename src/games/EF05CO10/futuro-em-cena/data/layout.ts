export const W = 1280
export const H = 720

export const HEADER = { h: 100, chipX: 36, chipW: 208, chipH: 62, textX: 276, titleY: 40, subY: 74 }

export const STAGE_WITH_STRIP = { x: 36, y: 118, w: 624, h: 392 }
export const STAGE_FULL = { x: 36, y: 118, w: 624, h: 552 }

export const stageBox = (hasStrip: boolean) => (hasStrip ? STAGE_WITH_STRIP : STAGE_FULL)

export const CHAR = { dx: -150, maxW: 226, ratioWithStrip: 0.7, ratioFull: 0.62, footPad: 16 }

export const BALLOON = { w: 322, pad: 26, minTop: 62 }

export const STRIP = {
  cy: 604,
  slotW: 190,
  slotH: 132,
  gapX: 208,
  h: 132,
}

export const PANEL = {
  x: 692,
  y: 118,
  w: 552,
  h: 552,
  cx: 968,
  stepPillY: 150,
  titleY: 194,
  hintY: 246,
  optionW: 490,
  optionH: 88,
  optionGap: 96,
  optionFirstY: 344,
  backX: 820,
  backY: 628,
  footerY: 626,
  actionY: 628,
  actionW: 500,
  actionH: 74,
}

export const MESSAGE_LIST = { optionH: 74, optionGap: 78, optionFirstY: 304 }

export const MASCOTE = { w: 152, h: 213 }
