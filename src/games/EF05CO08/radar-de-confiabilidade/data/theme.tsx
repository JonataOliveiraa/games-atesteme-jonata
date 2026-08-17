export const C = {
  sky: 0xeaf2fb,
  panel: 0xffffff,
  panelSoft: 0xf4f8fd,
  border: 0xc7d9ee,
  ink: 0x1f2d3d,
  inkSoft: 0x62748a,
  blue: 0x2f80ed,
  blueDark: 0x1c4e8a,
  green: 0x2fa85c,
  greenSoft: 0xe4f5ea,
  amber: 0xef9f2b,
  amberSoft: 0xfdf0da,
  red: 0xe0685c,
  redSoft: 0xfbe9e7,
  grey: 0x9fb0c2,
  greySoft: 0xeef2f7,
  white: 0xffffff,
  shadow: 0x1c4e8a,
}

export const A = {
  veil: 0.34,
  shadow: 0.16,
  gloss: 0.22,
  overlay: 0.52,
  dim: 0.5,
}

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')