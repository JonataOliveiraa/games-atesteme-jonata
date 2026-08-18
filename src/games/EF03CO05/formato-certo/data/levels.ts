import type { DataPiece, FormatLevel, FormatOption } from '../types'

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'date',
    title: 'Data',
    subtitle: 'dia, mês e ano',
    color: 0x38bdf8,
  },
  {
    id: 'pixels',
    title: 'Pixels',
    subtitle: 'pontos de cor',
    color: 0xf0b429,
  },
  {
    id: 'text',
    title: 'Sequência',
    subtitle: 'caractere por caractere',
    color: 0x7c3aed,
  },
]

const palette = {
  blue: 0x38bdf8,
  yellow: 0xfacc15,
  purple: 0x8b5cf6,
  green: 0x22c55e,
  red: 0xef4444,
  orange: 0xf59e0b,
}

export const LEVELS: FormatLevel[] = [
  {
    level: 1,
    title: 'Imagem em pixels',
    scenario: 'Guarde uma faixa colorida.',
    instruction: 'Monte: vermelho, azul e amarelo.',
    requiredFormat: 'pixels',
    mode: 'pixels',
    slots: [
      { id: 'pixel-1', label: 'Ponto 1', accepts: 'color-red' },
      { id: 'pixel-2', label: 'Ponto 2', accepts: 'color-blue' },
      { id: 'pixel-3', label: 'Ponto 3', accepts: 'color-yellow' },
    ],
    pieces: [
      { id: 'color-red', label: 'vermelho', shortLabel: 'vermelho', color: palette.red, visual: 'paint' },
      { id: 'color-blue', label: 'azul', shortLabel: 'azul', color: palette.blue, visual: 'paint' },
      { id: 'color-yellow', label: 'amarelo', shortLabel: 'amarelo', color: palette.yellow, visual: 'paint' },
      { id: 'day-18', label: '18', shortLabel: '18', color: palette.green, visual: 'calendar' },
      { id: 'extra-place', label: 'sala 4', shortLabel: 'sala 4', color: palette.purple, visual: 'place' },
    ],
    resultTitle: 'Imagem recuperada',
    resultText: 'vermelho | azul | amarelo',
    successMessage: 'A faixa apareceu porque cada ponto recebeu uma cor.',
    hint: 'Imagem usa pixels: pontos de cor.',
  },
  {
    level: 2,
    title: 'Data da viagem',
    scenario: 'Guarde a data da viagem.',
    instruction: 'Monte: 18, junho e 2026.',
    requiredFormat: 'date',
    mode: 'date',
    slots: [
      { id: 'day', label: 'Dia', accepts: 'day-18' },
      { id: 'month', label: 'Mês', accepts: 'month-june' },
      { id: 'year', label: 'Ano', accepts: 'year-2026' },
    ],
    pieces: [
      { id: 'day-18', label: '18', shortLabel: '18', color: palette.blue, visual: 'calendar' },
      { id: 'month-june', label: 'junho', shortLabel: 'junho', color: palette.orange, visual: 'calendar' },
      { id: 'year-2026', label: '2026', shortLabel: '2026', color: palette.green, visual: 'calendar' },
      { id: 'color-red', label: 'vermelho', shortLabel: 'vermelho', color: palette.red, visual: 'paint' },
      { id: 'extra-star', label: 'estrela', shortLabel: 'estrela', color: palette.yellow, visual: 'star' },
    ],
    resultTitle: 'Data recuperada',
    resultText: '18 de junho de 2026',
    successMessage: 'A data apareceu porque dia, mês e ano ficaram certos.',
    hint: 'Data usa três campos: dia, mês e ano.',
  },
  {
    level: 3,
    title: 'Código embaralhado',
    scenario: 'O código A-12 está bagunçado.',
    instruction: 'Arrume para ler A-12.',
    requiredFormat: 'text',
    mode: 'text',
    slots: [
      { id: 'char-1', label: '1º', accepts: 'letter-a' },
      { id: 'char-2', label: '2º', accepts: 'dash' },
      { id: 'char-3', label: '3º', accepts: 'number-1' },
      { id: 'char-4', label: '4º', accepts: 'number-2' },
    ],
    initialSlots: {
      'char-1': 'number-1',
      'char-2': 'letter-a',
      'char-3': 'dash',
      'char-4': 'number-2',
    },
    pieces: [
      { id: 'letter-a', label: 'A', shortLabel: 'A', color: palette.purple, visual: 'letter' },
      { id: 'dash', label: '-', shortLabel: '-', color: palette.orange, visual: 'letter' },
      { id: 'number-1', label: '1', shortLabel: '1', color: palette.blue, visual: 'letter' },
      { id: 'number-2', label: '2', shortLabel: '2', color: palette.green, visual: 'letter' },
      { id: 'color-blue', label: 'azul', shortLabel: 'azul', color: palette.blue, visual: 'paint' },
      { id: 'extra-street', label: 'rua', shortLabel: 'rua', color: palette.red, visual: 'place' },
    ],
    resultTitle: 'Código recuperado',
    resultText: 'A-12',
    successMessage: 'O código apareceu porque cada caractere ficou no lugar.',
    hint: 'Texto precisa estar na ordem certa.',
  },
]

export function shufflePieces(pieces: DataPiece[]) {
  return [...pieces].sort(() => Math.random() - 0.5)
}
