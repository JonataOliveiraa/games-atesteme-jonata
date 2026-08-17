/**
 * Código de habilidade da BNCC.
 *
 * ANTES este tipo se chamava `GameCode` e era usado como identidade do jogo.
 * Agora ele é só o que sempre foi: um código de habilidade curricular,
 * usado como TAG. A identidade do jogo é `Game["id"]`.
 */
export type SkillCode =
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

/**
 * @deprecated Use `SkillCode`. Alias mantido só para os arquivos que
 * ainda não migraram — apague quando o TypeScript parar de reclamar.
 */
export type GameCode = SkillCode

export type GameLevel = 1 | 2 | 3

export type Eixo = 'Pensamento Computacional' | 'Mundo Digital' | 'Cultura Digital'

/**
 * Anos escolares cobertos por um código de habilidade.
 * EF15 = "1º ao 5º ano" (anos iniciais inteiros), por isso a tabela
 * explícita em vez de um parseInt no meio da string.
 */
export const YEARS_BY_SKILL_PREFIX: Record<string, number[]> = {
  EF01: [1],
  EF02: [2],
  EF03: [3],
  EF04: [4],
  EF05: [5],
  EF15: [1, 2, 3, 4, 5],
}

export function yearsOfSkill(code: SkillCode): number[] {
  return YEARS_BY_SKILL_PREFIX[code.slice(0, 4)] ?? []
}

export interface GameMeta {
  /** identidade do jogo, não mais o código da habilidade */
  id: string
  name: string
  skills: SkillCode[]
  eixo: Eixo
  objeto: string
  habilidade: string
}

export interface RoundResult {
  /** identidade do jogo */
  gameId: string
  level: GameLevel
  criterion: string
  hits: number
  errors: number
  durationMs: number
  timestamp: number
}

export interface GameProgress {
  gameId: string
  currentLevel: GameLevel
  roundsCompleted: number
  results: RoundResult[]
  lastPlayed: number
}
