export const C = {
  sky: 0xf1f6ec,
  panel: 0xffffff,
  panelSoft: 0xf6faf2,
  border: 0xb9cdaa,
  ink: 0x24321f,
  inkSoft: 0x5f7055,
  violet: 0x548036,
  violetDark: 0x355522,
  violetSoft: 0xe6f0dd,
  amber: 0xd99a32,
  amberSoft: 0xf7efd9,
  green: 0x548036,
  greenSoft: 0xe3efda,
  red: 0xd54f3f,
  redSoft: 0xf8e4df,
  grey: 0x98a48f,
  greySoft: 0xe9eee4,
  white: 0xffffff,
  shadow: 0x1d2a18,

  stage: 0x162116,
  stageEdge: 0x0d150d,
  film: 0x2c3f24,
  filmHole: 0x548036,
  balloon: 0xffffff,
  balloonEdge: 0x355522,
  spotlight: 0xf7dda0,
  night: 0x111610,
}

export const CRITERION_COLOR: Record<'clareza' | 'mudanca' | 'reflexao', number> = {
  clareza: C.violet,
  mudanca: C.green,
  reflexao: C.amber,
}

export const CRITERION_SOFT: Record<'clareza' | 'mudanca' | 'reflexao', number> = {
  clareza: C.violetSoft,
  mudanca: C.greenSoft,
  reflexao: C.amberSoft,
}

export const A = {
  veil: 0.3,
  shadow: 0.16,
  gloss: 0.18,
  overlay: 0.55,
  dim: 0.5,
  stageVeil: 0.28,
}

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')