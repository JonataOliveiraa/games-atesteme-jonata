/**
 * ══════════════════════════════════════════════════════════════════════════
 *  VERIFICADOR DA ACADEMIA DOS ALGORITMOS
 * ══════════════════════════════════════════════════════════════════════════
 *
 *     node --experimental-strip-types scripts/check-academia.ts
 *
 * Confere o que não dá para ver lendo o código:
 *
 *   · todo caso tem solução — e um caso impossível NÃO aparece em revisão,
 *     porque nenhum arquivo guarda a resposta certa. Só simulando;
 *   · a ideia nova de cada nível é OBRIGATÓRIA. Um Nível 2 que dá para vencer
 *     sem o bloco `REPETIR` não ensina repetição, e essa falha é invisível:
 *     o jogo funciona, só não ensina;
 *   · a geometria fecha — nada fora da bancada, nada sobreposto, alvo de toque
 *     grande o bastante para um dedo de criança;
 *   · o texto cabe no orçamento.
 *
 * Este verificador já pagou o preço dele duas vezes. Na primeira rodada mostrou
 * que dava para vencer o Nível 3 sem tocar no bloco de condição. Na segunda,
 * que a criança veria o estado do mundo antes de montar o algoritmo — e aí
 * montaria para o que estava vendo, o que dá no mesmo.
 */

import {
  NIVEIS,
  simular,
  TOTAL_CASOS,
} from '../src/games/EF15CO02/academia-dos-algoritmos/data/casos.ts'
import {
  BANCADA,
  CENA,
  COLUNA,
  HUD,
  PRATELEIRA,
  TRILHA,
} from '../src/games/EF15CO02/academia-dos-algoritmos/data/layout.ts'
import { SIZE } from '../src/games/EF15CO02/academia-dos-algoritmos/data/theme.ts'
import type { Caso, Mundo, Peca } from '../src/games/EF15CO02/academia-dos-algoritmos/types.ts'

let falhas = 0
const ok = (m: string) => console.log('  ok    ' + m)
const erro = (m: string) => {
  console.log('  FALHA ' + m)
  falhas++
}
const secao = (t: string) => console.log('\n' + t)

/* ─────────────────────────────────────────── geometria ─────────── */

secao('GEOMETRIA')

/** O menor lado de um alvo de toque. Dedo de criança, tela de celular. */
const ALVO_MINIMO = 60

/** Os três andares de dentro da bancada, de cima para baixo. */
const andares = [
  { nome: 'CENA', topo: CENA.y, base: CENA.y + CENA.h },
  {
    nome: 'TRILHA',
    topo: TRILHA.cy - TRILHA.alturaEspaco / 2,
    base: TRILHA.cy + TRILHA.alturaEspaco / 2,
  },
  {
    nome: 'PRATELEIRA',
    topo: PRATELEIRA.cy - PRATELEIRA.altura / 2,
    base: PRATELEIRA.cy + PRATELEIRA.altura / 2,
  },
]

const fundoDaBancada = BANCADA.y + BANCADA.h
andares.forEach((f, i) => {
  if (f.topo < BANCADA.y || f.base > fundoDaBancada) {
    erro(`${f.nome} sai da bancada (${f.topo}..${f.base}; bancada ${BANCADA.y}..${fundoDaBancada})`)
  }
  const acima = andares[i - 1]
  if (acima && f.topo < acima.base) {
    erro(`${f.nome} invade ${acima.nome} (${acima.nome} acaba em ${acima.base}, ${f.nome} começa em ${f.topo})`)
  }
})
if (falhas === 0) ok(`os ${andares.length} andares empilham dentro da bancada`)

/** A bancada e a coluna do treinador não podem se encostar. */
if (BANCADA.x + BANCADA.w > COLUNA.x) {
  erro(`a bancada acaba em ${BANCADA.x + BANCADA.w} e a coluna começa em ${COLUNA.x}`)
} else {
  ok(`bancada 0..${BANCADA.x + BANCADA.w}, coluna ${COLUNA.x}..${COLUNA.x + COLUNA.w}`)
}

const maisEspacos = Math.max(...NIVEIS.flatMap((n) => n.casos.map((c) => c.espacos)))
const larguraTrilha = maisEspacos * TRILHA.larguraEspaco + (maisEspacos - 1) * TRILHA.gap
if (larguraTrilha > CENA.w) {
  erro(`a trilha de ${maisEspacos} espaços mede ${larguraTrilha}, e a bancada dá ${CENA.w}`)
} else {
  ok(`trilha de ${maisEspacos} espaços: ${larguraTrilha}px de ${CENA.w}`)
}

const maisBlocos = Math.max(...NIVEIS.flatMap((n) => n.casos.map((c) => c.oferta.length)))
const larguraOferta = maisBlocos * PRATELEIRA.largura + (maisBlocos - 1) * PRATELEIRA.gap
if (larguraOferta > CENA.w) {
  erro(`a oferta de ${maisBlocos} blocos mede ${larguraOferta}, e a bancada dá ${CENA.w}`)
} else {
  ok(`oferta de ${maisBlocos} blocos: ${larguraOferta}px de ${CENA.w}`)
}

/** Os objetos da cena também precisam caber lado a lado. */
const maisObjetos = Math.max(
  ...NIVEIS.flatMap((n) =>
    n.casos.map((c) => new Set(c.oferta.map((p) => (p.tipo === 'se' ? p.entao : p.acao))).size)
  )
)
const larguraObjetos = maisObjetos * CENA.objeto.tamanho + (maisObjetos - 1) * CENA.objeto.gap
if (larguraObjetos > CENA.w) {
  erro(`${maisObjetos} objetos medem ${larguraObjetos}, e a cena dá ${CENA.w}`)
} else {
  ok(`até ${maisObjetos} objetos na cena: ${larguraObjetos}px de ${CENA.w}`)
}

const alvos: [string, number, number][] = [
  ['espaço da trilha', TRILHA.larguraEspaco, TRILHA.alturaEspaco],
  ['bloco da oferta', PRATELEIRA.largura, PRATELEIRA.altura],
  ['botão executar', COLUNA.botao.w, COLUNA.botao.h],
  ['botão de ajuda', HUD.ajuda.r * 2, HUD.ajuda.r * 2],
]
alvos.forEach(([nome, w, h]) => {
  const menor = Math.min(w, h)
  if (menor < ALVO_MINIMO) erro(`${nome}: ${w}x${h} — o menor lado (${menor}) está abaixo de ${ALVO_MINIMO}px`)
  else ok(`${nome}: ${w}x${h}`)
})

/* ─────────────────────────────────────────── texto ─────────── */

secao('TEXTO')

const tamanhos = Object.entries(SIZE).map(
  ([k, v]) => [k, typeof v === 'number' ? v : parseInt(v, 10)] as const
)
tamanhos.forEach(([nome, px]) => {
  if (px < 24) erro(`SIZE.${nome} = ${px}px, abaixo do piso de 24px`)
})
if (tamanhos.every(([, px]) => px >= 24)) ok(`as ${tamanhos.length} medidas de letra estão em 24px ou mais`)

/** O pedido é a única frase para ler. Acima disto ele não cabe no balão. */
const TETO_DO_PEDIDO = 52
NIVEIS.forEach((n) =>
  n.casos.forEach((c, i) => {
    if (c.pedido.length > TETO_DO_PEDIDO) {
      erro(`N${n.numero} caso ${i + 1}: pedido com ${c.pedido.length} caracteres (teto ${TETO_DO_PEDIDO}) — "${c.pedido}"`)
    }
    if (c.duvida && c.duvida.length > 46) {
      erro(`N${n.numero} caso ${i + 1}: dúvida com ${c.duvida.length} caracteres (teto 46)`)
    }
  })
)
ok(`os ${TOTAL_CASOS} pedidos cabem em ${TETO_DO_PEDIDO} caracteres`)

/* ─────────────────────────────────────────── os casos ─────────── */

secao('CASOS')

const rotulo = (p: Peca) =>
  p.tipo === 'acao'
    ? p.acao
    : p.tipo === 'repetir'
      ? `REPETIR${p.vezes}×${p.acao}`
      : `SE ${p.condicao}`

/** Todas as trilhas possíveis com aquela oferta naqueles espaços. */
function combinacoes(oferta: Peca[], espacos: number): (Peca | null)[][] {
  let r: (Peca | null)[][] = [[]]
  for (let i = 0; i < espacos; i++) {
    const novo: (Peca | null)[][] = []
    for (const c of r) {
      novo.push([...c, null])
      for (const p of oferta) novo.push([...c, p])
    }
    r = novo
  }
  return r
}

/**
 * OS MUNDOS POSSÍVEIS DE UM CASO.
 *
 * A aleatoriedade mora dentro de `mundoInicial`, e de fora não dá para saber
 * quais mundos ela produz — então a gente sorteia bastante e junta os
 * diferentes. Vinte tentativas encontram os dois de um sorteio meio a meio com
 * folga de sobra.
 *
 * Uma solução só conta como solução se funcionar em TODOS eles. É a diferença
 * entre resolver o problema e ter dado sorte.
 */
function mundosPossiveis(caso: Caso): Mundo[] {
  const porAssinatura = new Map<string, Mundo>()
  for (let i = 0; i < 20; i++) {
    const m = caso.mundoInicial()
    porAssinatura.set([...m.fatos].sort().join(','), m)
  }
  return [...porAssinatura.values()]
}

for (const nivel of NIVEIS) {
  for (const [i, caso] of nivel.casos.entries()) {
    const nome = `N${nivel.numero} caso ${i + 1}`
    const mundos = mundosPossiveis(caso)

    /*
     * A INVARIANTE QUE SEGURA O NÍVEL 3 EM PÉ.
     *
     * Um caso com mais de um mundo possível PRECISA se declarar incerto, senão
     * a cena mostra o estado antes de a criança montar o algoritmo — e aí ela
     * monta para o mundo que está vendo, vence, e nunca precisa do bloco que
     * decide.
     *
     * O nível continuaria funcionando. Só deixaria de ensinar, que é uma falha
     * que nenhum teste de tela pega.
     */
    if (mundos.length > 1 && !caso.mundoIncerto) {
      erro(`${nome}: tem ${mundos.length} mundos possíveis mas não declara \`mundoIncerto\` — a criança veria a resposta.`)
      continue
    }
    if (mundos.length === 1 && caso.mundoIncerto) {
      erro(`${nome}: declara \`mundoIncerto\` mas só existe um mundo — a interrogação mentiria.`)
      continue
    }
    if (caso.mundoIncerto && !caso.duvida) {
      erro(`${nome}: mundo incerto sem \`duvida\` — a interrogação não diria sobre o quê.`)
      continue
    }

    let solucoes = 0
    let semIdeiaNova = 0
    let menor: Peca[] | null = null

    for (const trilha of combinacoes(caso.oferta, caso.espacos)) {
      const serveEmTodos = mundos.every((base) => {
        /* cópia: `simular` escreve no mundo que recebe */
        const mundo: Mundo = { ...base, fatos: new Set(base.fatos) }
        return simular(trilha, caso, mundo).resultado.fim === 'chegou'
      })
      if (!serveEmTodos) continue

      solucoes++
      const usadas = trilha.filter(Boolean) as Peca[]
      if (!menor || usadas.length < menor.length) menor = usadas

      const usouLaco = usadas.some((p) => p.tipo === 'repetir')
      const usouSe = usadas.some((p) => p.tipo === 'se')
      if (nivel.numero === 2 && !usouLaco) semIdeiaNova++
      if (nivel.numero === 3 && caso.oferta.some((p) => p.tipo === 'se') && !usouSe) semIdeiaNova++
    }

    if (solucoes === 0) {
      erro(`${nome} é IMPOSSÍVEL — nenhuma combinação chega ao fim em todos os mundos`)
      continue
    }

    if (semIdeiaNova > 0) {
      erro(`${nome}: ${semIdeiaNova} solução(ões) vencem sem a ideia do nível (${nivel.ideia}). Funciona, mas não ensina.`)
      continue
    }

    ok(`${nome}: ${solucoes} solução(ões), ${mundos.length} mundo(s) — ${(menor ?? []).map(rotulo).join(' → ')}`)
  }
}

console.log(
  falhas === 0 ? `\n${TOTAL_CASOS} casos conferidos, nenhuma falha.\n` : `\n${falhas} falha(s).\n`
)

process.exit(falhas === 0 ? 0 : 1)
