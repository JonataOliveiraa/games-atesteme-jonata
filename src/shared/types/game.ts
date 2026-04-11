export type GameCode =
  | 'EF01CO01' | 'EF01CO02' | 'EF01CO03' | 'EF01CO04' | 'EF01CO05'
  | 'EF01CO06' | 'EF01CO07'
  | 'EF02CO01' | 'EF02CO02' | 'EF02CO03' | 'EF02CO04' | 'EF02CO05' | 'EF02CO06'
  | 'EF03CO01' | 'EF03CO02' | 'EF03CO03' | 'EF03CO04' | 'EF03CO05'
  | 'EF03CO06' | 'EF03CO07' | 'EF03CO08' | 'EF03CO09'
  | 'EF04CO01' | 'EF04CO02' | 'EF04CO03' | 'EF04CO04' | 'EF04CO05'
  | 'EF04CO06' | 'EF04CO07' | 'EF04CO08'
  | 'EF05CO01' | 'EF05CO02' | 'EF05CO03' | 'EF05CO04' | 'EF05CO05'
  | 'EF05CO06' | 'EF05CO07' | 'EF05CO08' | 'EF05CO09' | 'EF05CO10' | 'EF05CO11'
  | 'EF15CO01' | 'EF15CO02' | 'EF15CO03' | 'EF15CO04'

export type GameLevel = 1 | 2 | 3

export type Eixo = 'Pensamento Computacional' | 'Mundo Digital' | 'Cultura Digital'

export interface GameMeta {
  code: GameCode
  name: string
  year: string
  eixo: Eixo
  objeto: string
  habilidade: string
}

export interface RoundResult {
  gameCode: GameCode
  level: GameLevel
  criterion: string
  hits: number
  errors: number
  durationMs: number
  timestamp: number
}

export interface GameProgress {
  gameCode: GameCode
  currentLevel: GameLevel
  roundsCompleted: number
  results: RoundResult[]
  lastPlayed: number
}
