export const C = {
  ink: 0x0d1b2a,
  inkSoft: 0x1b2a3d,
  inkMid: 0x46586e,
  steel: 0x2b4a6f,
  cream: 0xf4f7fb,
  creamEdge: 0xdce5ef,
  white: 0xffffff,
  shadow: 0x000000,

  inBlue: 0x2f80ed,
  inBlueSoft: 0xd6e7fb,
  inBlueDark: 0x1c5bb0,

  outAmber: 0xf2A03D,
  outAmberSoft: 0xfde6cc,
  outAmberDark: 0xbf6f1c,

  green: 0x2fae72,
  greenSoft: 0xd4f0e2,
  red: 0xd9534f,
  redSoft: 0xfadcda,
  glow: 0x7fd4ff,
} as const

export const A = {
  veil: 0.34,
  shadow: 0.2,
  gloss: 0.24,
  dim: 0.4,
} as const

export const FONT = {
  black: 'Arial Black, Arial',
  body: 'Arial',
} as const

export const SIZE = {
  hudLevel: '20px',
  hudTitle: '26px',
  taskTitle: '30px',
  taskText: '22px',
  portLabel: '38px',
  portHelper: '20px',
  cardLabel: '21px',
  railLabel: '20px',
  button: '25px',
  bubble: '22px',
  dialog: '28px',
  boardTitle: '24px',
  boardHelper: '18px',
} as const

export const TYPE_MS = {
  dialog: 12,
  aside: 16,
} as const

export const OP_NAME = 'Vico'

export const OP_MOOD: Record<string, string> = {
  'op-01': 'neutro',
  'op-02': 'apontando ao lado',
  'op-03': 'ensinando',
  'op-04': 'acerto',
  'op-05': 'confuso',
  'op-06': 'feliz',
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

export const ICON_FALLBACK = 'ic-texto'