/**
 * ══════════════════════════════════════════════════════════════════════════
 *  check-tela — nenhum componente compartilhado pode chumbar 1280x720
 * ══════════════════════════════════════════════════════════════════════════
 *
 * POR QUE ESTE SCRIPT EXISTE
 *
 * `EF01CO03/oficina-dos-algoritmos` roda em 960x540. E o unico dos 45, e vai
 * continuar assim — refazer o jogo em 1280x720 custaria mais do que vale.
 *
 * Enquanto `createLoadingScreen`, `createTutorial`, `showLevelComplete` e o
 * `FX` tratavam `const W = 1280` como se fosse o canvas, o resultado naquele
 * jogo era: cartao de carregamento com metade para fora da tela, vinheta
 * escurecendo so dois lados, e a camera do `punchZoom` voltando para um
 * "centro" que la e o canto de baixo a direita.
 *
 * O conserto foi ler `scene.scale`. Este script existe para (a) provar que a
 * mudanca e IDENTIDADE nos 44 jogos de 1280x720 e (b) impedir que a proxima
 * pessoa reponha um numero chumbado sem perceber.
 *
 *   node scripts/check-tela.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath e nao `.pathname`: o caminho do projeto tem espacos, e
// `.pathname` devolve %20 — que o fs nao acha.
const RAIZ = fileURLToPath(new URL('..', import.meta.url))
const falhas = []
const notas = []

const reprovar = (msg) => falhas.push(msg)

// ── A: os componentes de tela cheia leem a tela, nao uma constante ────────
//
// A regra e simples: em `src/shared`, `1280` e `720` so podem aparecer numa
// declaracao chamada DESIGN_* (que e fallback declarado) ou num comentario.
// Qualquer outro lugar e medida chumbada.

const COMPARTILHADOS = [
  'src/shared/loading/createLoadingScreen.ts',
  'src/shared/tutorial/createTutorial.ts',
  'src/shared/level/showLevelComplete.ts',
  'src/shared/effects/FX.ts',
]

const semComentarios = (txt) =>
  txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

for (const rel of COMPARTILHADOS) {
  const caminho = join(RAIZ, rel)
  if (!existsSync(caminho)) { reprovar(`${rel}: nao existe`); continue }

  const codigo = semComentarios(readFileSync(caminho, 'utf8'))

  for (const linha of codigo.split('\n')) {
    if (!/\b(1280|720)\b/.test(linha)) continue
    if (/\bDESIGN_[WH]\s*=/.test(linha)) continue          // o fallback declarado
    reprovar(`${rel}: medida chumbada fora de DESIGN_*  →  ${linha.trim()}`)
  }

  if (!/scene\.scale/.test(codigo))
    reprovar(`${rel}: nao le \`scene.scale\` em lugar nenhum — nao sabe o tamanho da tela`)

  // `W`/`H` de MODULO sao o erro original. Depois do conserto eles so existem
  // como const local ou destructuring; se alguem repuser um no topo, o TS nem
  // reclama (o nome resolve) e o bug volta calado.
  if (/^const [WH] = /m.test(codigo))
    reprovar(`${rel}: voltou a ter \`const W\`/\`const H\` de modulo`)
}

// ── B: em 1280x720 a conta nova e a identidade ───────────────────────────
//
// Esta e a MESMA formula de createLoadingScreen. Se ela mudar la, muda aqui.

const PROJETO_W = 1280
const PROJETO_H = 720

const enquadrar = (telaW, telaH) => {
  const k = Math.min(telaW / PROJETO_W, telaH / PROJETO_H)
  return { k, x: (telaW - PROJETO_W * k) / 2, y: (telaH - PROJETO_H * k) / 2 }
}

{
  const { k, x, y } = enquadrar(1280, 720)
  if (k !== 1 || x !== 0 || y !== 0)
    reprovar(`1280x720 deixou de ser identidade: k=${k} deslocamento=(${x}, ${y})`)
  else
    notas.push('1280x720 → k=1, deslocamento (0, 0): os 44 jogos veem a tela de sempre')
}

// ── C: cada jogo, o tamanho que ele declara, e o que a conta faz nele ────

const JOGOS = join(RAIZ, 'src/games')
const tamanhos = new Map()

for (const skill of readdirSync(JOGOS)) {
  const dirSkill = join(JOGOS, skill)
  for (const slug of readdirSync(dirSkill)) {
    const index = join(dirSkill, slug, 'index.ts')
    if (!existsSync(index)) continue
    const txt = readFileSync(index, 'utf8')
    // `width: 1280` ou `width: W`, com o W vindo de `data/layout.ts`.
    const medir = (campo) => {
      const m = txt.match(new RegExp(`^\\s*${campo}:\\s*([A-Za-z_$][\\w$]*|\\d+)`, 'm'))
      if (!m) return null
      if (/^\d+$/.test(m[1])) return Number(m[1])
      const layout = join(dirSkill, slug, 'data', 'layout.ts')
      if (!existsSync(layout)) return null
      const decl = readFileSync(layout, 'utf8')
        .match(new RegExp(`export const ${m[1]}\\s*=\\s*(\\d+)`))
      return decl ? Number(decl[1]) : null
    }
    const w = medir('width')
    const h = medir('height')
    if (w === null || h === null) {
      reprovar(`${skill}/${slug}: nao deu para descobrir o tamanho da tela no index.ts`)
      continue
    }
    tamanhos.set(`${skill}/${slug}`, [w, h])
  }
}

for (const [jogo, [w, h]] of tamanhos) {
  const { k, x, y } = enquadrar(w, h)

  // o cartao da tela de carregamento, depois de escalado, cabe?
  const cartaoW = 680 * k
  const cartaoH = 280 * k
  if (cartaoW > w + 0.5 || cartaoH > h + 0.5)
    reprovar(`${jogo} (${w}x${h}): o cartao de carregamento nao cabe (${cartaoW.toFixed(0)}x${cartaoH.toFixed(0)})`)

  if (x < -0.5 || y < -0.5)
    reprovar(`${jogo} (${w}x${h}): deslocamento negativo (${x}, ${y}) — conteudo para fora`)

  if (w !== 1280 || h !== 720)
    notas.push(`${jogo}: ${w}x${h} (fora do padrao) → k=${k}, deslocamento (${x}, ${y})`)
}

notas.push(`${tamanhos.size} jogos com tamanho declarado no index.ts`)

// ── veredito ─────────────────────────────────────────────────────────────

for (const n of notas) console.log('  ·', n)

if (falhas.length) {
  console.error('\nREPROVADO:')
  for (const f of falhas) console.error('  ✗', f)
  process.exit(1)
}

console.log('\nOK — nenhum componente compartilhado chumba o tamanho da tela.')
