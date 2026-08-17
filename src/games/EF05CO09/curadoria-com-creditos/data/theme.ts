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

  paper: 0xfdf7e8,
  paperEdge: 0xe6dcc2,
  paperLine: 0xd8ccae,
  cork: 0xd8b489,
  corkDark: 0xb08a5f,
  easel: 0xb98d5e,
  easelDark: 0x8e6740,
  string: 0x8a7350,
  night: 0x14161a,  
}

export const SEAL_COLOR: Record<'verde' | 'amarelo' | 'vermelho', number> = {
  verde: C.green,
  amarelo: C.amber,
  vermelho: C.red,
}

export const SEAL_SOFT: Record<'verde' | 'amarelo' | 'vermelho', number> = {
  verde: C.greenSoft,
  amarelo: C.amberSoft,
  vermelho: C.redSoft,
}

export const A = {
  veil: 0.34,
  shadow: 0.16,
  gloss: 0.22,
  overlay: 0.52,
  dim: 0.5,
  paperShade: 0.08,
}

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')