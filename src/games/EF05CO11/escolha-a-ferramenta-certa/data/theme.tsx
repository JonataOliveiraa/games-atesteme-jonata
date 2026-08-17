export const C = {
  sky: 0xe8f1f7,
  panel: 0xffffff,
  panelSoft: 0xf1f6fb,
  border: 0xc2d6e6,
  ink: 0x182a3a,
  inkSoft: 0x5d7286,
  teal: 0x1f8f9e,
  tealDark: 0x11616d,
  tealSoft: 0xdcf1f3,
  amber: 0xef9a1f,
  amberSoft: 0xfdeed6,
  green: 0x2da35c,
  greenSoft: 0xe1f3e8,
  red: 0xd9584f,
  redSoft: 0xfae7e5,
  grey: 0x9db0c0,
  greySoft: 0xecf1f6,
  metal: 0x8fa3b4,
  metalDark: 0x5b6f80,
  white: 0xffffff,
  shadow: 0x11616d,
}

export const A = {
  veil: 0.3,
  shadow: 0.16,
  gloss: 0.22,
  overlay: 0.54,
  dim: 0.5,
  blocked: 0.35,
}

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')