import type { TrackId } from '../types'

export const C = {
  bg: 0x24324f,
  bgDeep: 0x172239,
  bgSoft: 0x33456b,
  panel: 0xfff8e8,
  panelSoft: 0xffefd1,
  ink: 0x263044,
  inkSoft: 0x5b6478,
  muted: 0x8b93a5,
  white: 0xffffff,
  accent: 0xffb23f,
  accentDeep: 0xd98716,
  success: 0x3bb273,
  successSoft: 0xdff3e7,
  error: 0xe65f5c,
  errorSoft: 0xfbe3e2,
  warning: 0xffd166,
  shadow: 0x0d1526,
  sequence: 0x4f8df7,
  repeat: 0x8b5cf6,
  condition: 0xf97343,
  debug: 0xe65f5c,
  final: 0x3bb273,
} as const

export const A = {
  solid: 1,
  veil: 0.66,
  panel: 0.98,
  soft: 0.18,
  shadow: 0.26,
  gloss: 0.28,
  disabled: 0.34,
  glow: 0.4,
} as const

export const TRACK_COLOR: Record<TrackId, number> = {
  sequencia: C.sequence,
  repeticao: C.repeat,
  condicao: C.condition,
  depuracao: C.debug,
  final: C.final,
}

export const F = {
  tiny: '16px',
  small: '20px',
  body: '24px',
  strong: '28px',
  title: '34px',
  huge: '46px',
} as const

export const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`