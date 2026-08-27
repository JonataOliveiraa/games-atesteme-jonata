

/*
 * node --experimental-strip-types scripts/check-academia.ts
 *
 * Confere o que não dá para ver lendo o código: que todo caso tem solução,
 * que a geometria fecha em 1280x720, e que a cena tem arte para todo estado.
 */
import fs from 'node:fs'

import {
  ACTIONS,
  buildPieces,
  HELD,
  CONDITIONS,
  LEVELS,
  OBJECTS,
  simulate,
  slotCount,
  TOTAL_PUZZLES,
} from '../src/games/EF15CO02/academia-dos-algoritmos/data/puzzles.ts'
import {
  BENCH,
  STAGE,
  COLUMN,
  HUD,
  SHELF,
  TRACK,
} from '../src/games/EF15CO02/academia-dos-algoritmos/data/layout.ts'
import {
  BELT,
  H,
  LANE,
  W,
} from '../src/games/EF15CO02/academia-dos-algoritmos/data/layout.ts'
import { SIZE } from '../src/games/EF15CO02/academia-dos-algoritmos/data/theme.ts'
import { at } from '../src/games/EF15CO02/academia-dos-algoritmos/types.ts'
import type {
  BenchLevel,
  Puzzle,
  Station,
  TrailPuzzle,
  World,
  Piece,
} from '../src/games/EF15CO02/academia-dos-algoritmos/types.ts'

const BENCH_LEVELS = LEVELS.filter((l): l is BenchLevel => l.kind === 'bench')
const TRAIL_LEVELS = LEVELS.filter((l) => l.kind === 'trail')

let failures = 0
const ok = (m: string) => console.log('  ok    ' + m)
const fail = (m: string) => {
  console.log('  FALHA ' + m)
  failures++
}
const section = (t: string) => console.log('\n' + t)

section('GEOMETRIA')

const MIN_TAP = 60

const floors = [
  { name: 'CENA', top: STAGE.y, base: STAGE.y + STAGE.h },
  {
    name: 'TRILHA',
    top: TRACK.cy - TRACK.slotHeight / 2,
    base: TRACK.cy + TRACK.slotHeight / 2,
  },
  {
    name: 'PRATELEIRA',
    top: SHELF.cy - SHELF.height / 2,
    base: SHELF.cy + SHELF.height / 2,
  },
]

const benchBg = BENCH.y + BENCH.h
floors.forEach((f, i) => {
  if (f.top < BENCH.y || f.base > benchBg) {
    fail(`${f.name} sai da bancada (${f.top}..${f.base}; bancada ${BENCH.y}..${benchBg})`)
  }
  const above = floors[i - 1]
  if (above && f.top < above.base) {
    fail(`${f.name} invade ${above.name} (${above.name} acaba em ${above.base}, ${f.name} começa em ${f.top})`)
  }
})
if (failures === 0) ok(`os ${floors.length} andares empilham dentro da bancada`)

if (BENCH.x + BENCH.w > COLUMN.x) {
  fail(`a bancada acaba em ${BENCH.x + BENCH.w} e a coluna começa em ${COLUMN.x}`)
} else {
  ok(`bancada 0..${BENCH.x + BENCH.w}, coluna ${COLUMN.x}..${COLUMN.x + COLUMN.w}`)
}

const moreSlots = Math.max(...BENCH_LEVELS.flatMap((n) => n.puzzles.map((c) => c.slots)))
const trackWidth = moreSlots * TRACK.slotWidth + (moreSlots - 1) * TRACK.gap
if (trackWidth > STAGE.w) {
  fail(`a trilha de ${moreSlots} espaços mede ${trackWidth}, e a bancada dá ${STAGE.w}`)
} else {
  ok(`trilha de ${moreSlots} espaços: ${trackWidth}px de ${STAGE.w}`)
}

const moreBlocks = Math.max(...BENCH_LEVELS.flatMap((n) => n.puzzles.map((c) => c.offer.length)))
const offerWidth = moreBlocks * SHELF.width + (moreBlocks - 1) * SHELF.gap
if (offerWidth > STAGE.w) {
  fail(`a oferta de ${moreBlocks} blocos mede ${offerWidth}, e a bancada dá ${STAGE.w}`)
} else {
  ok(`oferta de ${moreBlocks} blocos: ${offerWidth}px de ${STAGE.w}`)
}

const moreObjects = Math.max(...BENCH_LEVELS.flatMap((n) => n.puzzles.map((c) => c.objects.length)))
const objectsWidth = moreObjects * STAGE.object.size + (moreObjects - 1) * STAGE.object.gap
if (objectsWidth > STAGE.w) {
  fail(`${moreObjects} objetos medem ${objectsWidth}, e a cena dá ${STAGE.w}`)
} else {
  ok(`até ${moreObjects} objetos na cena: ${objectsWidth}px de ${STAGE.w}`)
}

const targets: [string, number, number][] = [
  ['espaço da trilha', TRACK.slotWidth, TRACK.slotHeight],
  ['bloco da oferta', SHELF.width, SHELF.height],
  ['botão executar', COLUMN.button.w, COLUMN.button.h],
  ['botão de ajuda', HUD.help.r * 2, HUD.help.r * 2],
]
targets.forEach(([name, w, h]) => {
  const shortest = Math.min(w, h)
  if (shortest < MIN_TAP) fail(`${name}: ${w}x${h} — o menor lado (${shortest}) está abaixo de ${MIN_TAP}px`)
  else ok(`${name}: ${w}x${h}`)
})

section('TEXTO')

const sizes = Object.entries(SIZE).map(
  ([k, v]) => [k, typeof v === 'number' ? v : parseInt(v, 10)] as const
)
sizes.forEach(([name, px]) => {
  if (px < 24) fail(`SIZE.${name} = ${px}px, abaixo do piso de 24px`)
})
if (sizes.every(([, px]) => px >= 24)) ok(`as ${sizes.length} medidas de letra estão em 24px ou mais`)

const MAX_REQUEST_CHARS = 52
BENCH_LEVELS.forEach((n) =>
  n.puzzles.forEach((c, i) => {
    if (c.request.length > MAX_REQUEST_CHARS) {
      fail(`N${n.number} caso ${i + 1}: pedido com ${c.request.length} caracteres (teto ${MAX_REQUEST_CHARS}) — "${c.request}"`)
    }
  })
)
ok(`os ${TOTAL_PUZZLES} pedidos cabem em ${MAX_REQUEST_CHARS} caracteres`)

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2B00}-\u{2BFF}]|\u{FE0F}/u
const withEmoji = Object.values(ACTIONS).filter(
  (a) => EMOJI.test(a.glyph) || EMOJI.test(a.label)
)
if (withEmoji.length > 0) {
  fail(`emoji em: ${withEmoji.map((a) => a.id).join(', ')} — símbolo é desenhado, nunca emoji`)
} else {
  ok(`as ${Object.keys(ACTIONS).length} ações usam símbolo desenhado, sem emoji`)
}

const art = new Set(
  fs
    .readdirSync('src/assets/games/EF15CO02/academia-dos-algoritmos')
    .filter((f) => f.endsWith('.png'))
    .map((f) => f.replace('.png', ''))
)
const noArt = Object.values(ACTIONS).filter((a) => a.texture !== '' && !art.has(a.texture))
const mute = Object.values(ACTIONS).filter((a) => a.texture === '' && a.glyph === 'none')
if (mute.length > 0) fail(`gesto sem desenho nenhum: ${mute.map((a) => a.id).join(', ')}`)
if (noArt.length > 0) {
  fail(`textura faltando: ${noArt.map((a) => `${a.id} -> ${a.texture}`).join(', ')}`)
} else {
  ok(`as ${Object.keys(ACTIONS).length} texturas de ação existem na pasta`)
}

section('COISAS DA CENA')

const offeredActions = (puzzle: Puzzle): string[] => {
  const ids: string[] = []
  for (const p of puzzle.offer) {
    if (p.kind === 'action') ids.push(p.action)
    else if (p.kind === 'repeat') ids.push(p.action)
    else {
      ids.push(p.then)
      if (p.otherwise) ids.push(p.otherwise)
    }
  }
  return [...new Set(ids)]
}

/*
 * Busca limitada ao que uma trilha daquele tamanho consegue executar: o
 * `counter` cresce a cada volta, então "até parar de aparecer estado novo"
 * nunca fecha — a primeira versão comeu 4 GB no caso do regador.
 */
const reachableWorlds = (puzzle: Puzzle): World[] => {
  const signature = (m: World) => `${m.inHand ?? '-'}|${[...m.facts].sort().join(',')}|${m.counter}`
  const seen = new Map<string, World>()
  let frontier: World[] = []

  for (const m of possibleWorlds(puzzle)) {
    const k = signature(m)
    if (!seen.has(k)) {
      seen.set(k, m)
      frontier.push(m)
    }
  }

  const longestLoop = Math.max(1, ...puzzle.offer.map((p) => (p.kind === 'repeat' ? p.times : 1)))
  const maxSteps = puzzle.slots * longestLoop
  const ids = offeredActions(puzzle)

  for (let step = 0; step < maxSteps && frontier.length > 0; step++) {
    const nextWave: World[] = []
    for (const current of frontier) {
      for (const id of ids) {
        const action = ACTIONS[id]
        if (!action) continue
        const copy: World = { ...current, facts: new Set(current.facts) }
        if (action.apply(copy) !== null) continue
        const k = signature(copy)
        if (seen.has(k)) continue
        seen.set(k, copy)
        nextWave.push(copy)
      }
    }
    frontier = nextWave
  }

  return [...seen.values()]
}

let stagedOk = 0
for (const level of BENCH_LEVELS) {
  for (const [i, puzzle] of level.puzzles.entries()) {
    const name = `N${level.number} caso ${i + 1}`
    const onStage = new Set(puzzle.objects)

    if (onStage.size !== puzzle.objects.length) {
      fail(`${name}: objeto repetido em \`objetos\` — a coisa apareceria duas vezes na cena`)
      continue
    }

    const unknown = puzzle.objects.filter((id) => !OBJECTS[id])
    if (unknown.length > 0) {
      fail(`${name}: objeto sem definição: ${unknown.join(', ')}`)
      continue
    }

    const silentOnes = offeredActions(puzzle)
      .map((id) => ACTIONS[id])
      .filter((a) => {
        if (!a) return false
        const w = puzzle.initialWorld()
        return !onStage.has(at(a.target, w)) || (a.source && !onStage.has(at(a.source, w)))
      })
    if (silentOnes.length > 0) {
      fail(
        `${name}: ação sem coisa na cena para encenar: ${silentOnes.map((a) => a.id).join(', ')} — o passo rodaria sem animação`
      )
      continue
    }

    const worlds = reachableWorlds(puzzle)
    const lacking = new Set<string>()
    for (const m of worlds) {
      for (const id of puzzle.objects) {
        const t = OBJECTS[id].texture(m)
        if (!art.has(t)) lacking.add(`${id} -> ${t}`)
      }
    }
    if (lacking.size > 0) {
      fail(`${name}: textura de estado faltando: ${[...lacking].join(', ')}`)
      continue
    }

    stagedOk++
    ok(`${name}: ${puzzle.objects.length} coisa(s), ${worlds.length} estado(s) alcançável(is), toda arte na pasta`)
  }
}
if (stagedOk === TOTAL_PUZZLES) ok(`os ${TOTAL_PUZZLES} casos encenam com coisas de verdade`)


/* ─────────────────────────────────────────── o nível 2 ─────────── */

/*
 * O CAMINHO É O ENUNCIADO.
 *
 * No N2 a criança não monta a forma do algoritmo: ela recebe o caminho pronto
 * (o laço já abraça os três canteiros, a bifurcação já está aberta) e preenche
 * os gestos. Então a prova aqui é outra:
 *
 *   · existe preenchimento que vence em TODOS os mundos sorteados;
 *   · nenhum preenchimento vence com o MESMO gesto nos dois ramos — se
 *     vencesse, a bifurcação seria enfeite e a criança nunca teria decidido;
 *   · toda bifurcação tem mesmo dois mundos possíveis, senão a dúvida mente.
 */

section('NÍVEL 2 — A TELA')

const MAX_STATIONS = Math.max(
  ...TRAIL_LEVELS.flatMap((l) => (l.puzzles as TrailPuzzle[]).map((p) => p.trail.length))
)
const stationSpan = (LANE.x1 - LANE.x0) / MAX_STATIONS
const stationSlack = stationSpan - (LANE.stone.w + 44)
if (stationSlack < 0) {
  fail(`${MAX_STATIONS} estações não cabem no caminho: sobram ${Math.round(stationSlack)}px`)
} else {
  ok(`${MAX_STATIONS} estações no caminho: ${Math.round(stationSpan)}px cada, pedra de ${LANE.stone.w + 44}`)
}

const laneTargets: [string, number, number, number][] = [
  ['buraco de gesto', LANE.slot.r * 2, LANE.slot.r * 2, LANE.cy],
  ['gesto do cinto', BELT.token.r * 2, BELT.token.r * 2, BELT.cy],
  ['botão de andar', BELT.play.r * 2, BELT.play.r * 2, BELT.play.cy],
]
laneTargets.forEach(([name, w, h, cy]) => {
  const shortest = Math.min(w, h)
  if (shortest < MIN_TAP) fail(`${name}: ${w}x${h} — abaixo de ${MIN_TAP}px`)
  else if (cy + h / 2 > H) fail(`${name} passa do rodapé (${cy + h / 2} > ${H})`)
  else ok(`${name}: ${w}x${h}`)
})

const MAX_BELT = Math.max(
  ...TRAIL_LEVELS.flatMap((l) => (l.puzzles as TrailPuzzle[]).map((p) => p.belt.length))
)
const beltWidth = MAX_BELT * BELT.token.r * 2 + (MAX_BELT - 1) * (BELT.token.gap - BELT.token.r * 2)
const beltLeft = BELT.cx - beltWidth / 2
const beltRight = BELT.cx + beltWidth / 2
if (beltLeft < 12 || beltRight > BELT.play.cx - BELT.play.r - 20) {
  fail(`o cinto de ${MAX_BELT} gestos vai de ${Math.round(beltLeft)} a ${Math.round(beltRight)} e esbarra no botão`)
} else {
  ok(`cinto de ${MAX_BELT} gestos: ${Math.round(beltLeft)}..${Math.round(beltRight)}`)
}

const topOfLoop = LANE.loop.top - LANE.loop.pip.r - 8
const bottomOfFork = LANE.cy + LANE.fork.dy + LANE.slot.r
if (topOfLoop < HUD.h + 8) {
  fail(`o colchete do laço (${topOfLoop}) entra no HUD (${HUD.h})`)
} else if (bottomOfFork > BELT.cy - BELT.token.r - 10) {
  fail(`o ramo de baixo (${bottomOfFork}) encosta no cinto (${BELT.cy - BELT.token.r})`)
} else {
  ok(`caminho entre ${topOfLoop} e ${bottomOfFork}, livre do HUD e do cinto`)
}

const objectTop = LANE.object.cy - LANE.object.size / 2
if (objectTop < LANE.loop.top + 14) {
  fail(`a fileira de coisas (${objectTop}) bate no colchete (${LANE.loop.top})`)
} else {
  ok(`fileira de coisas em ${LANE.object.cy}, dentro do colchete`)
}

const wideLoop = Math.max(
  ...TRAIL_LEVELS.flatMap((l) =>
    (l.puzzles as TrailPuzzle[]).flatMap((p) =>
      p.trail.filter((st) => st.kind === 'loop').map((st) => (st.kind === 'loop' ? st.each.length : 0))
    )
  ),
  0
)
if (wideLoop > 0) {
  const need = (wideLoop - 1) * LANE.object.gap + LANE.object.size
  if (need > LANE.loop.halfWidth * 2) {
    fail(`${wideLoop} coisas medem ${need}px e o colchete só tem ${LANE.loop.halfWidth * 2}`)
  } else {
    ok(`${wideLoop} coisas dentro do colchete: ${need}px de ${LANE.loop.halfWidth * 2}`)
  }
}

/*
 * A LIA NÃO PODE TAPAR O QUE ELA MUDA.
 *
 * Ela anda na frente das coisas (é a camada de cima), então a cabeça dela não
 * pode subir até o meio do canteiro que ela está regando — senão a criança vê
 * a personagem e não vê o efeito.
 */
const liaHead = LANE.cy - LANE.lia.h + 12
const objectFoot = LANE.object.cy + LANE.object.size / 2
if (objectFoot - liaHead > 40) {
  fail(`a Lia (cabeça em ${liaHead}) tapa ${objectFoot - liaHead}px da coisa (pé em ${objectFoot})`)
} else {
  ok(`a Lia cobre ${Math.max(0, objectFoot - liaHead)}px do pé da coisa`)
}

const goalObjectFoot = LANE.cy + LANE.goal.objectDy + LANE.object.size / 2
if (goalObjectFoot > LANE.cy - 150) {
  fail('a coisa da placa do fim entra na placa')
} else if (LANE.cy + LANE.goal.objectDy - LANE.object.size / 2 < HUD.h) {
  fail('a coisa da placa do fim entra no HUD')
} else {
  ok(`coisa da placa do fim entre ${LANE.cy + LANE.goal.objectDy - LANE.object.size / 2} e ${goalObjectFoot}`)
}

if (LANE.goal.cx + LANE.goal.w / 2 > W - 10) {
  fail('a placa do objetivo sai da tela')
} else {
  ok(`placa do objetivo em ${LANE.goal.cx}, dentro da tela`)
}

section('NÍVEL 2 — O CAMINHO')

const trailWorlds = (puzzle: TrailPuzzle): World[] => {
  const bySignature = new Map<string, World>()
  for (let i = 0; i < 40; i++) {
    const w = puzzle.initialWorld()
    bySignature.set([...w.facts].sort().join(','), w)
  }
  return [...bySignature.values()]
}

const fillings = (belt: string[], slots: number): (string | null)[][] => {
  let r: (string | null)[][] = [[]]
  for (let i = 0; i < slots; i++) {
    const next: (string | null)[][] = []
    for (const c of r) {
      next.push([...c, null])
      for (const a of belt) next.push([...c, a])
    }
    r = next
  }
  return r
}

const forkSlots = (stations: Station[]): Array<[number, number]> => {
  const pairs: Array<[number, number]> = []
  let i = 0
  for (const st of stations) {
    if (st.kind === 'fork') {
      pairs.push([i, i + 1])
      i += 2
    } else i += 1
  }
  return pairs
}

for (const level of TRAIL_LEVELS) {
  for (const puzzle of level.puzzles as TrailPuzzle[]) {
    const name = `N${level.number} ${puzzle.id}`
    const slots = slotCount(puzzle.trail)
    const worlds = trailWorlds(puzzle)
    const forks = forkSlots(puzzle.trail)

    const unknownCond = puzzle.trail
      .filter((st) => st.kind === 'fork')
      .filter((st) => st.kind === 'fork' && !CONDITIONS[st.condition])
    if (unknownCond.length > 0) {
      fail(`${name}: bifurcação com condição que não existe`)
      continue
    }

    if (forks.length > 0 && worlds.length < 2) {
      fail(`${name}: tem bifurcação mas o mundo é sempre o mesmo — a dúvida mentiria`)
      continue
    }
    if (forks.length === 0 && worlds.length > 1) {
      fail(`${name}: o mundo sorteia mas não há bifurcação para decidir`)
      continue
    }

    const missingArt = puzzle.goal.filter((t) => !art.has(t))
    if (missingArt.length > 0) {
      fail(`${name}: a placa do objetivo pede arte que não existe: ${missingArt.join(', ')}`)
      continue
    }

    const onTrail = new Set<string>()
    for (const st of puzzle.trail) {
      if (st.kind === 'step' && st.object) onTrail.add(st.object)
      if (st.kind === 'loop') st.each.forEach((o) => onTrail.add(o))
      if (st.kind === 'fork') onTrail.add(st.about)
    }
    const ghost = [...onTrail].filter((id) => !OBJECTS[id])
    if (ghost.length > 0) {
      fail(`${name}: coisa no caminho sem definição: ${ghost.join(', ')}`)
      continue
    }

    const handless = new Set<string>()
    const blameless = puzzle.belt
      .map((id) => ACTIONS[id])
      .filter((x) => x?.blame && !OBJECTS[at(x.blame, puzzle.initialWorld())])
    if (blameless.length > 0) {
      fail(`${name}: a culpa de ${blameless.map((x) => x.id).join(', ')} aponta para coisa que não existe`)
      continue
    }

    let wins = 0
    let shortest: (string | null)[] | null = null
    let sameOnBothBranches = 0

    for (const filling of fillings(puzzle.belt, slots)) {
      const worksEverywhere = worlds.every((base) => {
        const world: World = { ...base, facts: new Set(base.facts) }
        const end = simulate(buildPieces(puzzle.trail, filling), puzzle, world).result.end
        if (world.inHand && !HELD[world.inHand]) handless.add(world.inHand)
        return end === 'done'
      })
      if (!worksEverywhere) continue

      wins++
      const used = filling.filter(Boolean).length
      if (!shortest || used < shortest.filter(Boolean).length) shortest = filling
      if (forks.some(([a, b]) => filling[a] !== null && filling[a] === filling[b])) {
        sameOnBothBranches++
      }
    }

    if (handless.size > 0) {
      fail(`${name}: a mão segura algo sem desenho: ${[...handless].join(', ')} (falta em HELD)`)
      continue
    }

    if (wins === 0) {
      fail(`${name} é IMPOSSÍVEL — nenhum preenchimento vence nos ${worlds.length} mundos`)
      continue
    }
    if (sameOnBothBranches > 0) {
      fail(
        `${name}: ${sameOnBothBranches} solução(ões) põem o mesmo gesto nos dois ramos — a bifurcação seria enfeite`
      )
      continue
    }

    const shape = puzzle.trail
      .map((st) => (st.kind === 'loop' ? `laço×${st.each.length}` : st.kind === 'fork' ? 'bifurca' : 'passo'))
      .join(' → ')
    ok(
      `${name}: ${slots} gestos, ${worlds.length} mundo(s), ${wins} solução(ões) — ${shape} — ${(shortest ?? [])
        .map((a) => a ?? '·')
        .join(' | ')}`
    )
  }
}

section('CASOS')

const label = (p: Piece) =>
  p.kind === 'action'
    ? p.action
    : p.kind === 'repeat'
      ? `REPETIR${p.times}×${p.action}`
      : `SE ${p.condition}`

/* Nenhum arquivo guarda a resposta certa, então a única prova é simular. */
function combinations(offer: Piece[], slots: number): (Piece | null)[][] {
  let r: (Piece | null)[][] = [[]]
  for (let i = 0; i < slots; i++) {
    const next: (Piece | null)[][] = []
    for (const c of r) {
      next.push([...c, null])
      for (const p of offer) next.push([...c, p])
    }
    r = next
  }
  return r
}

function possibleWorlds(puzzle: Puzzle): World[] {
  const bySignature = new Map<string, World>()
  for (let i = 0; i < 20; i++) {
    const m = puzzle.initialWorld()
    bySignature.set([...m.facts].sort().join(','), m)
  }
  return [...bySignature.values()]
}

for (const level of BENCH_LEVELS) {
  for (const [i, puzzle] of level.puzzles.entries()) {
    const name = `N${level.number} caso ${i + 1}`
    const worlds = possibleWorlds(puzzle)

    let solutions = 0
    let withoutTheIdea = 0
    let shortest: Piece[] | null = null

    for (const track of combinations(puzzle.offer, puzzle.slots)) {
      const worksEverywhere = worlds.every((base) => {
        const world: World = { ...base, facts: new Set(base.facts) }
        return simulate(track, puzzle, world).result.end === 'done'
      })
      if (!worksEverywhere) continue

      solutions++
      const used = track.filter(Boolean) as Piece[]
      if (!shortest || used.length < shortest.length) shortest = used

      const usedLoop = used.some((p) => p.kind === 'repeat')
      const usedIf = used.some((p) => p.kind === 'if')
      if (level.number === 2 && !usedLoop) withoutTheIdea++
      if (level.number === 3 && puzzle.offer.some((p) => p.kind === 'if') && !usedIf) withoutTheIdea++
    }

    if (solutions === 0) {
      fail(`${name} é IMPOSSÍVEL — nenhuma combinação chega ao fim em todos os mundos`)
      continue
    }

    if (withoutTheIdea > 0) {
      fail(`${name}: ${withoutTheIdea} solução(ões) vencem sem a ideia do nível (${level.idea}). Funciona, mas não ensina.`)
      continue
    }

    ok(`${name}: ${solutions} solução(ões), ${worlds.length} mundo(s) — ${(shortest ?? []).map(label).join(' → ')}`)
  }
}

console.log(
  failures === 0 ? `\n${TOTAL_PUZZLES} casos conferidos, nenhuma falha.\n` : `\n${failures} falha(s).\n`
)

process.exit(failures === 0 ? 0 : 1)
