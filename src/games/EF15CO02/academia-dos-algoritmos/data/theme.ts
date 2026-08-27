export const C = {
  ink: 0x1c0f04,
  glass: 0x3d2412,
  wood: 0x8a5a2b,
  darkWood: 0x4a2f14,
  brass: 0xf2b544,
  cream: 0xfff3dc,
  dim: 0xb99a76,
  matte: 0x33200e,
  green: 0x5ec36a,
  coral: 0xff7a6b,
  white: 0xffffff,
  black: 0x000000,
  shadow: 0x000000,
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** Every label in the game: white with a thick black stroke, no exceptions. */
export const TEXT = {
  color: C.white,
  stroke: C.black,
  thickness: 7,
}

export const ALPHA = {
  veil: 0.58,
  glass: 0.86,
  empty: 0.4,
  shadow: 0.32,
}

export const FONT = {
  black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
  body: 'DynaPuff, Arial, sans-serif',
}

/** 24px floor: this skill spans years 1 to 5, and the youngest sets the size. */
export const SIZE = {
  request: 32,
  requestMin: 26,
  block: '25px',
  badge: '30px',
  button: '32px',
  notice: '26px',
  help: '32px',
}

export const TIMING = {
  beat: 620,
  flight: 320,
  stuck: 800,
}
