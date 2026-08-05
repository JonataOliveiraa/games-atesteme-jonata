export const C = {
  sky: 0xf0edfa,
  panel: 0xffffff,
  panelSoft: 0xf5f3fd,
  border: 0xd6cfee,
  ink: 0x241f3a,
  inkSoft: 0x6b6486,
  violet: 0x6b4fd8,
  violetDark: 0x3d2a86,
  violetSoft: 0xe9e3fb,
  amber: 0xf0a12b,
  amberSoft: 0xfdf0da,
  green: 0x35ab6a,
  greenSoft: 0xe2f5ea,
  red: 0xdf6a63,
  redSoft: 0xfbe9e7,
  grey: 0xa8a2bd,
  greySoft: 0xeeecf5,
  white: 0xffffff,
  shadow: 0x241f3a,

  stage: 0x1b1730,
  stageEdge: 0x0f0c1e,
  film: 0x2f2850,
  filmHole: 0x6b4fd8,
  balloon: 0xffffff,
  balloonEdge: 0x3d2a86,
  spotlight: 0xffe6a8,
  night: 0x14161a,
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
  gloss: 0.22,
  overlay: 0.55,
  dim: 0.5,
  stageVeil: 0.28,
}

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')