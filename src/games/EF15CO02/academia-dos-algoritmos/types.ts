export type World = {
  inHand: string | null
  facts: Set<string>
  counter: number
}

/** Um alvo que pode mudar com o mundo: a 2ª volta do laço rega o 2º canteiro. */
export type Target = string | ((w: World) => string)

export const at = (t: Target, w: World): string => (typeof t === 'string' ? t : t(w))

export type SceneObject = {
  id: string
  texture: (m: World) => string
  hidden?: (m: World) => boolean
  glows?: (m: World) => boolean
}

export type Action = {
  id: string
  label: string
  texture: string
  glyph: Glyph
  target: Target
  source?: Target
  /**
   * A coisa que aparece na bolha quando este passo trava.
   *
   * Sem isto seria adivinhação: `regar` recusa por causa do REGADOR vazio,
   * mas `guardar` recusa por causa da MOCHILA fechada — uma culpa a origem,
   * a outra o alvo. O padrão é a origem, e quem foge dele diz.
   */
  blame?: Target
  /**
   * Carta SE: só serve quando esta condição é verdadeira no mundo.
   *
   * É o que o nível 3 pede — a criança OLHA o caminho e escolhe a carta
   * que se encaixa no que vem pela frente. Pôr a outra trava o passo.
   */
  requires?: string
  /** null quando o passo rodou; a frase do que impediu quando travou. */
  apply: (m: World) => string | null
}

export type Glyph =
  | 'none'
  | 'pick'
  | 'put'
  | 'drop'
  | 'drops'
  | 'sparkle'
  | 'unlock'
  | 'lock'
  | 'stack'
  | 'repeat'
  | 'question'
  | 'check'
  | 'cross'
  | 'walk'
  | 'bang'

export type Piece =
  | { kind: 'action'; action: string }
  | { kind: 'repeat'; times: number; action: string }
  | { kind: 'if'; condition: string; then: string | null; otherwise: string | null }

export type Condition = {
  id: string
  label: string
  /** A pergunta escrita na placa da bifurcação. Curta, em caixa alta. */
  question: string
  test: (m: World) => boolean
}

export type Puzzle = {
  request: string
  objects: string[]
  offer: Piece[]
  slots: number
  initialWorld: () => World
  reached: (m: World) => boolean
  missing: string
}

/* ── nível 2: o caminho ──────────────────────────────────────────────── */

/**
 * A ESTAÇÃO — um pedaço do caminho da Lia.
 *
 * A forma do caminho É o enunciado: o laço já vem desenhado por cima dos três
 * canteiros, a bifurcação já vem aberta. A criança preenche os gestos.
 */
export type Station =
  | { kind: 'step'; object?: string }
  /** Um gesto só, repetido uma vez em cada coisa. */
  | { kind: 'loop'; each: string[] }
  /** Nível 3: a coisa está À VISTA, e a criança escolhe a carta que serve. */
  | { kind: 'check'; about: string }
  /** O caminho se abre em dois. Só a execução diz qual ramo a Lia toma. */
  | {
      kind: 'fork'
      /** A coisa que fica coberta por "?" até a execução. */
      about: string
      condition: string
      /** O símbolo que diz O QUE se pergunta: uma gota é "tem água?". */
      ask: Glyph
    }

export type TrailPuzzle = {
  id: string
  /** O que a placa do fim mostra. É o enunciado inteiro, em desenho. */
  goal: string[]
  trail: Station[]
  /** Os gestos do cinto, na ordem. */
  belt: string[]
  initialWorld: () => World
  reached: (m: World) => boolean
}

export type Scenery = 'room' | 'garden'

export type BenchLevel = {
  number: 1 | 2 | 3
  kind: 'bench'
  idea: string
  scenery: Scenery
  puzzles: Puzzle[]
}

export type TrailLevel = {
  number: 1 | 2 | 3
  kind: 'trail'
  idea: string
  scenery: Scenery
  puzzles: TrailPuzzle[]
}

export type Level = BenchLevel | TrailLevel

export type Result =
  | { end: 'done'; track: number[] }
  | { end: 'stuck'; atSlot: number; reason: string; track: number[] }
  | { end: 'missing'; reason: string; track: number[] }

export type Beat = {
  slot: number
  action: string
  loop?: { current: number; total: number }
  branch?: 'then' | 'otherwise'
  error?: string
}
