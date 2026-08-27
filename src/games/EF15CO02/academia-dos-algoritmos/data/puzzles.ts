import type {
  Action,
  Beat,
  Condition,
  World,
  Level,
  SceneObject,
  Piece,
  Result,
  Station,
  TrailPuzzle,
  Glyph,
} from '../types'

const emptyWorld = (extra: Partial<World> = {}): World => ({
  inHand: null,
  facts: new Set<string>(),
  counter: 0,
  ...extra,
})

export const OBJECTS: Record<string, SceneObject> = {
  escova: {
    id: 'escova',
    texture: (m) =>
      m.facts.has('dentes-limpos')
        ? 'escova-boca'
        : m.facts.has('pasta-na-escova')
          ? 'item-escova'
          : 'item-escova-sem-pasta',
  },
  pasta: { id: 'pasta', texture: () => 'item-pasta-dente' },
  mochila: {
    id: 'mochila',
    texture: () => 'item-mochila',
    glows: (m) => m.facts.has('mochila-aberta'),
  },
  caderno: {
    id: 'caderno',
    texture: () => 'item-caderno',
    hidden: (m) => m.facts.has('caderno-guardado'),
  },
  lanche: {
    id: 'lanche',
    texture: () => 'item-lanche',
    hidden: (m) => m.facts.has('lanche-guardado'),
  },
  regador: {
    id: 'regador',
    texture: () => 'item-regador',
    glows: (m) => m.facts.has('regador-cheio'),
  },
  planta: { id: 'planta', texture: () => 'item-planta' },
}

export const ACTIONS: Record<string, Action> = {}
const define = (a: Action) => {
  ACTIONS[a.id] = a
  return a
}

define({
  id: 'pegar-escova',
  label: 'pegar escova',
  texture: 'item-escova-sem-pasta',
  glyph: 'pick',
  target: 'escova',
  apply: (m) => {
    if (m.inHand) return `A mão já está ocupada com ${m.inHand}.`
    m.inHand = 'a escova'
    return null
  },
})

define({
  id: 'por-pasta',
  label: 'pôr pasta',
  texture: 'item-pasta-dente',
  glyph: 'put',
  target: 'escova',
  source: 'pasta',
  apply: (m) => {
    if (m.inHand !== 'a escova') return 'A escova não está na mão.'
    if (m.facts.has('pasta-na-escova')) return 'A escova já tem pasta.'
    m.facts.add('pasta-na-escova')
    return null
  },
})

define({
  id: 'escovar',
  label: 'escovar',
  texture: 'escova-boca',
  glyph: 'sparkle',
  target: 'escova',
  apply: (m) => {
    if (m.inHand !== 'a escova') return 'A escova não está na mão.'
    if (!m.facts.has('pasta-na-escova')) return 'A escova está sem pasta.'
    m.facts.add('dentes-limpos')
    return null
  },
})

define({
  id: 'abrir-mochila',
  label: 'abrir mochila',
  texture: 'item-mochila',
  glyph: 'unlock',
  target: 'mochila',
  apply: (m) => {
    if (m.facts.has('mochila-aberta')) return 'A mochila já está aberta.'
    m.facts.add('mochila-aberta')
    return null
  },
})

const keep = (id: string, label: string, thing: string, fact: string) =>
  define({
    id,
    label,
    texture: OBJECTS[thing].texture(emptyWorld()),
    glyph: 'put',
    target: 'mochila',
    source: thing,
    apply: (m) => {
      if (!m.facts.has('mochila-aberta')) return 'A mochila está fechada.'
      if (m.facts.has(fact)) return 'Isso já está guardado.'
      m.facts.add(fact)
      return null
    },
  })

keep('por-caderno', 'pôr caderno', 'caderno', 'caderno-guardado')
keep('por-lanche', 'pôr lanche', 'lanche', 'lanche-guardado')

define({
  id: 'fechar-mochila',
  label: 'fechar mochila',
  texture: 'item-mochila',
  glyph: 'lock',
  target: 'mochila',
  apply: (m) => {
    if (!m.facts.has('mochila-aberta')) return 'A mochila já está fechada.'
    m.facts.delete('mochila-aberta')
    m.facts.add('mochila-fechada')
    return null
  },
})

define({
  id: 'pegar-regador',
  label: 'pegar regador',
  texture: 'item-regador',
  glyph: 'pick',
  target: 'regador',
  apply: (m) => {
    if (m.inHand) return `A mão já está ocupada com ${m.inHand}.`
    m.inHand = 'o regador'
    return null
  },
})

define({
  id: 'encher-regador',
  label: 'encher',
  texture: 'item-regador',
  glyph: 'drop',
  target: 'regador',
  apply: (m) => {
    if (m.inHand !== 'o regador') return 'O regador não está na mão.'
    if (m.facts.has('regador-cheio')) return 'O regador já está cheio.'
    m.facts.add('regador-cheio')
    return null
  },
})

define({
  id: 'regar',
  label: 'regar',
  texture: 'item-planta',
  glyph: 'drops',
  target: 'planta',
  source: 'regador',
  apply: (m) => {
    if (m.inHand !== 'o regador') return 'O regador não está na mão.'
    if (!m.facts.has('regador-cheio')) return 'O regador está vazio.'
    m.counter += 1
    m.facts.add(`planta-${m.counter}-regada`)
    return null
  },
})


const THREE = [1, 2, 3]

THREE.forEach((n) => {
  OBJECTS[`canteiro-${n}`] = {
    id: `canteiro-${n}`,
    texture: (m) => (m.facts.has(`canteiro-${n}-molhado`) ? 'item-poca' : 'item-planta'),
    glows: (m) => m.facts.has(`canteiro-${n}-regado`),
  }
  OBJECTS[`brinquedo-${n}`] = {
    id: `brinquedo-${n}`,
    texture: () => 'item-brinquedo',
    hidden: (m) => m.facts.has(`brinquedo-${n}-guardado`),
  }
})

OBJECTS.walker = { id: 'walker', texture: () => 'personagem-lia' }

define({
  id: 'seguir',
  label: 'seguir',
  texture: '',
  glyph: 'walk',
  target: 'walker',
  apply: () => null,
})

define({
  id: 'regar-canteiro',
  label: 'regar',
  texture: 'item-planta',
  glyph: 'drops',
  target: (m) => `canteiro-${Math.min(m.counter + 1, 3)}`,
  source: 'regador',
  apply: (m) => {
    if (m.inHand !== 'o regador') return 'O regador não está na mão.'
    if (!m.facts.has('regador-cheio')) return 'O regador está vazio.'
    m.counter += 1
    m.facts.add(`canteiro-${m.counter}-regado`)
    return null
  },
})

define({
  id: 'guardar-brinquedo',
  label: 'guardar',
  texture: 'item-brinquedo',
  glyph: 'put',
  target: 'mochila',
  source: (m) => `brinquedo-${Math.min(m.counter + 1, 3)}`,
  blame: 'mochila',
  apply: (m) => {
    if (!m.facts.has('mochila-aberta')) return 'A mochila está fechada.'
    m.counter += 1
    m.facts.add(`brinquedo-${m.counter}-guardado`)
    return null
  },
})

export const CONDITIONS: Record<string, Condition> = {
  'regador-cheio': {
    id: 'regador-cheio',
    label: 'cheio',
    test: (m) => m.facts.has('regador-cheio'),
  },
  'mochila-aberta': {
    id: 'mochila-aberta',
    label: 'aberta',
    test: (m) => m.facts.has('mochila-aberta'),
  },
}

const MAX_BEATS = 60

type Solvable = {
  initialWorld: () => World
  reached: (m: World) => boolean
  missing?: string
}

export function simulate(
  track: (Piece | null)[],
  puzzle: Solvable,
  world: World = puzzle.initialWorld()
): { result: Result; beats: Beat[] } {
  const beats: Beat[] = []
  const used: number[] = []

  const runAction = (actionId: string, slot: number, extra: Partial<Beat> = {}) => {
    const a = ACTIONS[actionId]
    if (!a) return `O passo "${actionId}" não existe.`

    const error = a.apply(world)
    beats.push({ slot, action: actionId, ...extra, ...(error ? { error } : {}) })
    return error
  }

  for (let slot = 0; slot < track.length; slot++) {
    const piece = track[slot]
    if (!piece) continue

    used.push(slot)
    if (beats.length > MAX_BEATS) break

    if (piece.kind === 'action') {
      const error = runAction(piece.action, slot)
      if (error) {
        return {
          result: { end: 'stuck', atSlot: slot, reason: error, track: used },
          beats,
        }
      }
      continue
    }

    if (piece.kind === 'repeat') {
      for (let loop = 1; loop <= piece.times; loop++) {
        const error = runAction(piece.action, slot, { loop: { current: loop, total: piece.times } })
        if (error) {
          return {
            result: { end: 'stuck', atSlot: slot, reason: error, track: used },
            beats,
          }
        }
      }
      continue
    }

    const cond = CONDITIONS[piece.condition]
    const passed = cond ? cond.test(world) : false
    const chosen = passed ? piece.then : piece.otherwise

    if (!chosen) {
      beats.push({ slot, action: '', branch: passed ? 'then' : 'otherwise' })
      continue
    }

    const error = runAction(chosen, slot, { branch: passed ? 'then' : 'otherwise' })
    if (error) {
      return {
        result: { end: 'stuck', atSlot: slot, reason: error, track: used },
        beats,
      }
    }
  }

  if (puzzle.reached(world)) {
    return { result: { end: 'done', track: used }, beats }
  }
  return { result: { end: 'missing', reason: puzzle.missing ?? '', track: used }, beats }
}

const step = (actionId: string): Piece => ({ kind: 'action', action: actionId })

export const LEVELS: Level[] = [
  {
    number: 1,
    kind: 'bench',
    idea: 'ordem',
    scenery: 'room',
    puzzles: [
      {
        request: 'Escove os dentes.',
        objects: ['escova', 'pasta'],
        offer: [step('escovar'), step('pegar-escova'), step('por-pasta')],
        slots: 3,
        initialWorld: () => emptyWorld(),
        reached: (m) => m.facts.has('dentes-limpos'),
        missing: 'Os dentes ainda não foram escovados.',
      },
      {
        request: 'Guarde o caderno e o lanche, e feche a mochila.',
        objects: ['mochila', 'caderno', 'lanche'],
        offer: [step('por-lanche'), step('fechar-mochila'), step('abrir-mochila'), step('por-caderno')],
        slots: 4,
        initialWorld: () => emptyWorld(),
        reached: (m) =>
          m.facts.has('caderno-guardado') &&
          m.facts.has('lanche-guardado') &&
          m.facts.has('mochila-fechada'),
        missing: 'Ainda falta alguma coisa na mochila.',
      },
      {
        request: 'Regue a planta.',
        objects: ['regador', 'planta'],
        offer: [step('regar'), step('encher-regador'), step('pegar-regador')],
        slots: 3,
        initialWorld: () => emptyWorld(),
        reached: (m) => m.facts.has('planta-1-regada'),
        missing: 'A planta continua sem água.',
      },
    ],
  },
]

export const TOTAL_PUZZLES = LEVELS.reduce((n, level) => n + level.puzzles.length, 0)

/** O que a mão segura, em id de coisa: é o que a Lia carrega desenhado. */
export const HELD: Record<string, string> = {
  'o regador': 'regador',
  'a escova': 'escova',
}

const trail = (
  id: string,
  goal: string[],
  stations: Station[],
  belt: string[],
  initialWorld: () => World,
  reached: (m: World) => boolean
): TrailPuzzle => ({ id, goal, trail: stations, belt, initialWorld, reached })

const walk = (object?: string): Station => ({ kind: 'step', object })
const loop = (each: string[]): Station => ({ kind: 'loop', each })
const fork = (about: string, condition: string, ask: Glyph): Station => ({
  kind: 'fork',
  about,
  condition,
  ask,
})

const CANTEIROS = ['canteiro-1', 'canteiro-2', 'canteiro-3']
const BRINQUEDOS = ['brinquedo-1', 'brinquedo-2', 'brinquedo-3']

/** Meio a meio, e a criança não vê qual saiu: é o que obriga a bifurcação. */
const maybe = (fact: string) => () =>
  Math.random() < 0.5 ? emptyWorld({ facts: new Set([fact]) }) : emptyWorld()

const TRAIL_PUZZLES: TrailPuzzle[] = [
  trail(
    'canteiros',
    ['item-planta', 'item-planta', 'item-planta'],
    [walk('regador'), walk(), loop(CANTEIROS)],
    ['pegar-regador', 'encher-regador', 'regar-canteiro', 'seguir'],
    () => emptyWorld(),
    (m) => m.counter === 3 && CANTEIROS.every((c) => m.facts.has(`${c}-regado`))
  ),
  trail(
    'brinquedos',
    ['item-brinquedo', 'item-brinquedo', 'item-brinquedo'],
    [walk('mochila'), loop(BRINQUEDOS)],
    ['abrir-mochila', 'guardar-brinquedo', 'fechar-mochila', 'seguir'],
    () => emptyWorld(),
    (m) => m.counter === 3 && BRINQUEDOS.every((b) => m.facts.has(`${b}-guardado`))
  ),
  trail(
    'regador-misterioso',
    ['item-planta'],
    [walk('regador'), fork('regador', 'regador-cheio', 'drop'), walk('canteiro-1')],
    ['pegar-regador', 'encher-regador', 'regar-canteiro', 'seguir'],
    maybe('regador-cheio'),
    (m) => m.counter === 1 && m.facts.has('canteiro-1-regado')
  ),
  trail(
    'mochila-misteriosa',
    ['item-brinquedo'],
    [fork('mochila', 'mochila-aberta', 'unlock'), walk('brinquedo-1')],
    ['abrir-mochila', 'guardar-brinquedo', 'seguir', 'fechar-mochila'],
    maybe('mochila-aberta'),
    (m) => m.counter === 1 && m.facts.has('brinquedo-1-guardado')
  ),
  trail(
    'jardim-inteiro',
    ['item-planta', 'item-planta', 'item-planta'],
    [walk('regador'), fork('regador', 'regador-cheio', 'drop'), loop(CANTEIROS)],
    ['pegar-regador', 'encher-regador', 'regar-canteiro', 'seguir'],
    maybe('regador-cheio'),
    (m) => m.counter === 3 && CANTEIROS.every((c) => m.facts.has(`${c}-regado`))
  ),
]

LEVELS.push({
  number: 2,
  kind: 'trail',
  idea: 'repetir e decidir',
  scenery: 'garden',
  puzzles: TRAIL_PUZZLES,
})

/** Quantos gestos o caminho pede. A bifurcação pede dois: um por ramo. */
export const slotCount = (stations: Station[]) =>
  stations.reduce((n, s) => n + (s.kind === 'fork' ? 2 : 1), 0)

/**
 * O caminho desenhado vira algoritmo.
 *
 * A forma é do problema; os gestos são da criança. Um laço sobre três canteiros
 * é `repetir 3x`; a bifurcação é o `se`, com um ramo em cada lado.
 */
export function buildPieces(stations: Station[], placed: (string | null)[]): (Piece | null)[] {
  const out: (Piece | null)[] = []
  let i = 0
  for (const st of stations) {
    if (st.kind === 'step') {
      const a = placed[i++]
      out.push(a ? { kind: 'action', action: a } : null)
    } else if (st.kind === 'loop') {
      const a = placed[i++]
      out.push(a ? { kind: 'repeat', times: st.each.length, action: a } : null)
    } else {
      const yes = placed[i++]
      const no = placed[i++]
      out.push({ kind: 'if', condition: st.condition, then: yes, otherwise: no })
    }
  }
  return out
}
