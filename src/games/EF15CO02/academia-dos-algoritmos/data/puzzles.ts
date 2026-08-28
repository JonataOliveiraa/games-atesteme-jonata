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
  /*
   * A MOCHILA ABERTA PRECISA PARECER ABERTA.
   *
   * Ela desenhava `item-mochila` sempre, e o único sinal de estar aberta
   * era um brilho em volta. No nível 2 isso quebra o enigma inteiro: a
   * bifurcação PERGUNTA se a mochila está aberta, e a criança tinha de
   * responder olhando para um brilho — enquanto o desenho, que é onde ela
   * olha, dizia a mesma coisa nos dois casos.
   *
   * O brilho continua, como reforço. Quem conta a história é o desenho.
   */
  mochila: {
    id: 'mochila',
    texture: (m) => (m.facts.has('mochila-aberta') ? 'item-mochila-aberta' : 'item-mochila'),
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
const SUPPLY_TEXTURES = ['item-caderno', 'item-lanche', 'item-bloco-montar']

/** Os alvos do nível 3: cada um nasce seco ou já molhado, e isso se VÊ. */
const TARGETS = ['alvo-1', 'alvo-2']

TARGETS.forEach((id) => {
  OBJECTS[id] = {
    id,
    texture: (m) => (m.facts.has(`${id}-molhado`) ? 'item-poca' : 'item-planta'),
    glows: (m) => m.facts.has(`${id}-pronto`),
  }
})

/** Qual alvo a vez atual olha. O contador anda a cada estação de checagem. */
const currentTarget = (m: World) => TARGETS[Math.min(m.counter, TARGETS.length - 1)]

THREE.forEach((n) => {
  // O canteiro nao troca de desenho: quem mostra a rega e a agua caindo
  // (`garden.pour`). O brilho marca os que ja foram.
  OBJECTS[`canteiro-${n}`] = {
    id: `canteiro-${n}`,
    texture: () => 'item-planta',
    glows: (m) => m.facts.has(`canteiro-${n}-regado`),
  }
  OBJECTS[`material-${n}`] = {
    id: `material-${n}`,
    texture: () => SUPPLY_TEXTURES[n - 1],
    hidden: (m) => m.facts.has(`material-${n}-guardado`),
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
  id: 'guardar-material',
  label: 'guardar',
  texture: 'item-caderno',
  glyph: 'put',
  target: 'mochila',
  source: (m) => `material-${Math.min(m.counter + 1, 3)}`,
  blame: 'mochila',
  apply: (m) => {
    if (!m.facts.has('mochila-aberta')) return 'A mochila está fechada.'
    m.counter += 1
    m.facts.add(`material-${m.counter}-guardado`)
    return null
  },
})

define({
  id: 'se-seco-regar',
  label: 'se seco, regar',
  texture: 'item-planta',
  glyph: 'drops',
  target: (m) => currentTarget(m),
  source: 'regador',
  requires: 'alvo-seco',
  apply: (m) => {
    if (m.inHand !== 'o regador') return 'O regador não está na mão.'
    m.facts.add(`${currentTarget(m)}-pronto`)
    m.counter += 1
    return null
  },
})

define({
  id: 'se-molhado-seguir',
  label: 'se molhado, seguir',
  texture: 'item-poca',
  glyph: 'walk',
  target: (m) => currentTarget(m),
  requires: 'alvo-molhado',
  apply: (m) => {
    m.facts.add(`${currentTarget(m)}-pronto`)
    m.counter += 1
    return null
  },
})

define({
  id: 'se-fechada-abrir',
  label: 'se fechada, abrir',
  texture: 'item-mochila',
  glyph: 'unlock',
  target: 'mochila',
  requires: 'mochila-fechada',
  apply: (m) => {
    m.facts.add('mochila-aberta')
    return null
  },
})

define({
  id: 'se-aberta-seguir',
  label: 'se aberta, seguir',
  texture: 'item-mochila-aberta',
  glyph: 'walk',
  target: 'mochila',
  requires: 'mochila-aberta',
  apply: () => null,
})

export const CONDITIONS: Record<string, Condition> = {
  'alvo-seco': {
    id: 'alvo-seco',
    label: 'seco',
    question: 'ESTÁ SECO?',
    test: (m) => !m.facts.has(`${currentTarget(m)}-molhado`),
  },
  'alvo-molhado': {
    id: 'alvo-molhado',
    label: 'molhado',
    question: 'ESTÁ MOLHADO?',
    test: (m) => m.facts.has(`${currentTarget(m)}-molhado`),
  },
  'mochila-fechada': {
    id: 'mochila-fechada',
    label: 'fechada',
    question: 'ESTÁ FECHADA?',
    test: (m) => !m.facts.has('mochila-aberta'),
  },
  'regador-cheio': {
    id: 'regador-cheio',
    label: 'cheio',
    question: 'TEM ÁGUA?',
    test: (m) => m.facts.has('regador-cheio'),
  },
  'mochila-aberta': {
    id: 'mochila-aberta',
    label: 'aberta',
    question: 'ESTÁ ABERTA?',
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

    // Carta SE cuja condição não vale: o passo trava, e a frase diz o que
    // ele esperava encontrar. É o que faz a criança olhar o caminho.
    if (a.requires && !CONDITIONS[a.requires]?.test(world)) {
      const esperado = CONDITIONS[a.requires]?.label ?? ''
      const recado = `Esta carta só serve quando está ${esperado}.`
      beats.push({ slot, action: actionId, ...extra, error: recado })
      return recado
    }

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
const check = (about: string): Station => ({ kind: 'check', about })
const loop = (each: string[]): Station => ({ kind: 'loop', each })
const CANTEIROS = ['canteiro-1', 'canteiro-2', 'canteiro-3']
const SUPPLIES = ['material-1', 'material-2', 'material-3']

/*
 * A ficha do EF15CO02 divide as três estruturas por nível:
 *   N1 sequência · N2 repetição · N3 seleção condicional
 *
 * O cinto só traz o que o algoritmo usa. A exceção é o N3: lá as DUAS
 * cartas SE aparecem de propósito, porque escolher entre elas olhando o
 * caminho é a atividade — a que não serve não é distrator, é a outra
 * metade da decisão. A ordem dos discos é sorteada na montagem.
 */
const TRAIL_PUZZLES: TrailPuzzle[] = [
  trail(
    'canteiros',
    ['item-planta', 'item-planta', 'item-planta'],
    [walk('regador'), walk(), loop(CANTEIROS)],
    ['pegar-regador', 'encher-regador', 'regar-canteiro'],
    () => emptyWorld(),
    (m) => m.counter === 3 && CANTEIROS.every((c) => m.facts.has(`${c}-regado`))
  ),
  trail(
    'material',
    SUPPLY_TEXTURES,
    [walk('mochila'), loop(SUPPLIES)],
    ['abrir-mochila', 'guardar-material'],
    () => emptyWorld(),
    (m) => m.counter === 3 && SUPPLIES.every((s) => m.facts.has(`${s}-guardado`))
  ),
]

/*
 * NÍVEL 3 — OLHE O CAMINHO
 *
 * Da ficha: *"entram cartas SE com condição visível adiante — o SE certo
 * depende de OLHAR o caminho"*. A coisa fica à vista com o estado dela
 * desenhado (planta seca ou poça; mochila aberta ou fechada) e o cinto
 * traz as duas cartas SE. A que não se encaixa TRAVA o passo.
 *
 * O sorteio dá SEMPRE um de cada quando há dois alvos: as duas cartas são
 * usadas exatamente uma vez, e a criança precisa descobrir QUAL vai ONDE.
 */
const oneOfEach = (): World => {
  const molhado = Math.random() < 0.5 ? 'alvo-1' : 'alvo-2'
  return emptyWorld({
    inHand: 'o regador',
    facts: new Set(['regador-cheio', `${molhado}-molhado`]),
  })
}

const CHECK_PUZZLES: TrailPuzzle[] = [
  trail(
    'olhar-uma',
    ['item-planta'],
    [check('alvo-1')],
    ['se-seco-regar', 'se-molhado-seguir'],
    () =>
      emptyWorld({
        inHand: 'o regador',
        facts: new Set(
          Math.random() < 0.5 ? ['regador-cheio', 'alvo-1-molhado'] : ['regador-cheio']
        ),
      }),
    (m) => m.facts.has('alvo-1-pronto')
  ),
  trail(
    'olhar-duas',
    ['item-planta', 'item-poca'],
    [check('alvo-1'), check('alvo-2')],
    ['se-seco-regar', 'se-molhado-seguir'],
    oneOfEach,
    (m) => TARGETS.every((t) => m.facts.has(`${t}-pronto`))
  ),
  trail(
    'olhar-a-mochila',
    [...SUPPLY_TEXTURES],
    [check('mochila'), loop(SUPPLIES)],
    ['se-fechada-abrir', 'se-aberta-seguir', 'guardar-material'],
    () => (Math.random() < 0.5 ? emptyWorld({ facts: new Set(['mochila-aberta']) }) : emptyWorld()),
    (m) => SUPPLIES.every((s) => m.facts.has(`${s}-guardado`))
  ),
]

LEVELS.push(
  {
    number: 2,
    kind: 'trail',
    idea: 'repetir',
    scenery: 'garden',
    puzzles: TRAIL_PUZZLES,
  },
  {
    number: 3,
    kind: 'trail',
    idea: 'olhar e escolher',
    scenery: 'garden',
    puzzles: CHECK_PUZZLES,
  }
)

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
    if (st.kind === 'step' || st.kind === 'check') {
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
