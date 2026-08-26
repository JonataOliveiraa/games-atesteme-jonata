/**
 * VERIFICADOR DO "CONTROLADOR DO SISTEMA" (EF05CO07).
 *
 *   node scripts/check-so.mjs
 *
 * ── POR QUE ISTO EXISTE ──────────────────────────────────────────────────
 *
 * Duas coisas deste jogo NÃO aparecem em revisão de código:
 *
 *   1. O ORÇAMENTO DE ATENÇÃO. A tela tem teto de sete blocos de texto e duas
 *      cores com significado. Nenhum commit "acrescenta 25 blocos" — cada um
 *      acrescenta um, e a conta só estoura três meses depois.
 *
 *   2. SE O NÍVEL 3 É JOGÁVEL. Sete pedidos, três vivos ao mesmo tempo, 26 s
 *      de paciência cada, peças que ficam ocupadas por 6 s. Se o roteiro for
 *      apertado demais, isso não se descobre lendo `niveis.ts` — só jogando,
 *      ou simulando.
 *
 * A simulação é PESSIMISTA de propósito: aqui a paciência corre o tempo todo,
 * inclusive durante animações e trocas. No jogo de verdade ela fica parada
 * fora do estado `pedindo`, então a folga real é sempre MAIOR que a medida.
 *
 * Qualquer mexida em `data/niveis.ts` ou `data/layout.ts` tem que passar por
 * aqui de novo.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const JOGO = resolve(RAIZ, 'src/games/EF05CO07/sistema-operacional')

const carregar = p => import(pathToFileURL(resolve(JOGO, p)).href)
const texto = p => readFileSync(resolve(JOGO, p), 'utf8')

const DADOS = await carregar('data/niveis.ts')
const L = await carregar('data/layout.ts')
const T = await carregar('data/theme.ts')

const { NIVEIS, USO_MS, ENTRE_PEDIDOS_MS, LUZES_INICIAIS, AJUDA_MS, MAX_PEDIDOS } = DADOS
const SRC = {
    effects: texto('scenes/effects.ts'),
    scene: texto('scenes/GameScene.ts'),
}

/* ═══════════════════════════════════════════════════════ o boletim */

let falhas = 0
const ok = m => console.log(`  \x1b[32m✓\x1b[0m ${m}`)
const erro = m => { falhas += 1; console.log(`  \x1b[31m✗ ${m}\x1b[0m`) }
const exigir = (cond, m) => (cond ? ok(m) : erro(m))
const secao = t => console.log(`\n\x1b[36m── ${t}\x1b[0m`)

/* ═══════════════════════════════════ 1. o orçamento de atenção */

secao('ORÇAMENTO DE ATENÇÃO')

const TETO_BLOCOS = 7
const TETO_CORES = 2

NIVEIS.forEach(n => {
    // 4 nomes de peça + a frase do pedido + o botão NÃO DÁ + o `?`
    const blocos = n.pecas.length + 3
    exigir(
        blocos <= TETO_BLOCOS,
        `Nível ${n.numero}: ${blocos} blocos de texto na tela (teto ${TETO_BLOCOS})`,
    )
    exigir(n.pecas.length <= 4, `Nível ${n.numero}: ${n.pecas.length} peças na fileira (máx. 4)`)
})

// os encaixes da memória e o trilho da fila entraram SEM RÓTULO — se alguém
// puser um, aparece aqui como um `add.text` a mais
const chamadasDeTexto = (SRC.effects.match(/scene\.add\.text\(/g) ?? []).length
exigir(
    chamadasDeTexto === 6,
    `6 lugares que desenham texto em effects.ts (achei ${chamadasDeTexto}): `
    + `? · NÃO DÁ · 3 pedaços da frase · nome da peça`,
)

const coresComSignificado = ['verde', 'vermelho']
exigir(
    coresComSignificado.every(c => c in T.C) && Object.keys(T.C).length === 10,
    `${TETO_CORES} cores com significado (verde = deu certo, vermelho = não dá); `
    + `o resto (${Object.keys(T.C).length - 2}) é cromo`,
)
exigir(T.A.veu === 0.15, `véu sobre o cenário em ${T.A.veu} — o fundo fica visível`)
exigir(
    ![T.TEMPO_TEMA.fill, T.TEMPO_TEMA.warn, T.TEMPO_TEMA.danger, T.TEMPO_TEMA.border]
        .some(c => c === T.C.verde || c === T.C.vermelho),
    'a barra de tempo é feita de cromo: nem verde nem vermelho entram nela',
)
exigir(
    !/label:\s*true/.test(SRC.scene),
    'a barra não escreve o `m:ss` dentro dela — seria o oitavo bloco de texto',
)
exigir(!/setBlur|blur\(/i.test(SRC.effects), 'nenhum desfoque no cenário')
exigir(
    Math.min(T.SIZE.frase, T.SIZE.fraseMin, parseInt(T.SIZE.peca), parseInt(T.SIZE.botao),
        parseInt(T.SIZE.ajuda)) >= 24,
    'nada abaixo de 24px na tela — isto é jogado no celular',
)
exigir(
    T.A.fila <= 0.5,
    `quem ainda nem chegou fica em ${T.A.fila} — bem mais fraco que quem espera`,
)

/* ═══════════════════════════════════════════════ 2. as frases */

secao('AS FRASES DO PEDIDO')

const TETO_CARACTERES = 30
const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

let frasesOk = true
let maiorFrase = 0
NIVEIS.forEach(n => {
    const nomes = new Map(n.pecas.map(p => [p.id, p.nome]))
    n.pedidos.forEach(p => {
        const inteira = p.frase.antes + p.frase.palavra + p.frase.depois
        maiorFrase = Math.max(maiorFrase, inteira.length)
        if (inteira.length > TETO_CARACTERES) {
            erro(`${p.id}: "${inteira}" tem ${inteira.length} caracteres (teto ${TETO_CARACTERES})`)
            frasesOk = false
        }
        if (semAcento(p.frase.palavra) !== semAcento(nomes.get(p.peca) ?? '')) {
            erro(`${p.id}: a palavra realçada é "${p.frase.palavra}", mas a peça é "${nomes.get(p.peca)}"`)
            frasesOk = false
        }
        if (!nomes.has(p.peca)) {
            erro(`${p.id}: pede "${p.peca}", que não está na fileira do Nível ${n.numero}`)
            frasesOk = false
        }
    })
})
if (frasesOk) {
    ok(`todas as frases numa linha só (a maior tem ${maiorFrase} de ${TETO_CARACTERES} caracteres)`)
    ok('a palavra realçada é SEMPRE o nome da peça pedida')
}

NIVEIS.forEach(n => exigir(
    n.tutorial.length === 4 && n.tutorial.every(f => f.length <= 56),
    `Nível ${n.numero}: tutorial com ${n.tutorial.length} falas curtas (máx. duas linhas do balão)`,
))

/* ═══════════════════════════════════════════════ 3. a geometria */

secao('GEOMETRIA (1280x720, igual nos três níveis)')

const faixa = (nome, de, ate) => ({ nome, de, ate })
const FAIXAS = [
    faixa('luzes / ?', 0, 90),
    faixa('pedido', L.PEDIDO.y, L.PEDIDO.y + L.PEDIDO.h),
    faixa('encaixes', L.SLOTS.cy - L.SLOTS.lado / 2, L.SLOTS.cy + L.SLOTS.lado / 2),
    faixa('peças', L.PECAS.cy - L.PECAS.alt / 2, L.PECAS.nomeCY + 14),
    faixa('fila / NÃO DÁ', L.FILA.cy - L.FILA.h / 2, L.FILA.cy + L.FILA.h / 2),
]
FAIXAS.forEach((f, i) => {
    const prox = FAIXAS[i + 1]
    if (!prox) return
    exigir(f.ate <= prox.de, `${f.nome} (${f.de}..${f.ate}) não encosta em ${prox.nome} (${prox.de}..)`)
})
exigir(
    FAIXAS[FAIXAS.length - 1].ate <= L.H,
    `a última faixa termina em ${FAIXAS[FAIXAS.length - 1].ate}, dentro dos ${L.H}px`,
)

const passo = L.PECAS.xs[1] - L.PECAS.xs[0]
exigir(
    L.PECAS.xs.every((x, i) => i === 0 || x - L.PECAS.xs[i - 1] === passo),
    `as quatro peças igualmente espaçadas (${passo}px)`,
)
exigir(passo >= L.PECAS.toqueW, `as áreas de toque não se sobrepõem (${passo}px de passo, ${L.PECAS.toqueW}px de área)`)
exigir(
    L.PECAS.xs[0] - L.PECAS.toqueW / 2 >= 0 && L.PECAS.xs[3] + L.PECAS.toqueW / 2 <= L.W,
    'nenhuma área de toque sai da tela',
)

exigir(
    !('anelR' in L.PEDIDO) && !('anelR' in L.FILA),
    'não existe mais anel de paciência: nem no balcão, nem no trilho',
)
exigir(
    L.FILA.gap > L.FILA.haloR * 2,
    `os halos do trilho não se tocam (${L.FILA.gap}px de passo, r=${L.FILA.haloR})`,
)
exigir(
    L.FILA.haloR * 2 > L.FILA.alt,
    `o halo (${L.FILA.haloR * 2}px) envolve o ícone (${L.FILA.alt}px) em vez de cortá-lo`,
)
exigir(L.FILA.gap >= L.FILA.toque, `as áreas de toque do trilho não se sobrepõem (${L.FILA.toque}px)`)

// o trilho, no seu tamanho máximo, não pode alcançar o botão NÃO DÁ
const trilhoMax = L.FILA.x + (MAX_PEDIDOS - 1) * L.FILA.gap + L.FILA.padX
exigir(
    trilhoMax < L.BOTAO.cx - L.BOTAO.w / 2,
    `o trilho cheio termina em ${trilhoMax}px e o NÃO DÁ começa em ${L.BOTAO.cx - L.BOTAO.w / 2}px`,
)

/*
 * OS ENCAIXES NÃO PODEM ALCANÇAR A ÁREA DE TOQUE DAS PEÇAS.
 *
 * Eles ficam por cima dela (depth 17 contra 15). Enquanto se sobrepunham, um
 * dedo no canto de cima da peça vizinha caía num encaixe VAZIO, que chama
 * `onPeca('memoria')` — peça errada, uma luz a menos por acertar a peça certa.
 */
/* ── a barra de tempo divide a faixa de cima com as luzes e o `?` ── */

const luzesFim = L.LUZES.x + 2 * L.LUZES.gap + L.LUZES.r
const relogioIni = L.TEMPO.cx + L.TEMPO.iconDX - L.TEMPO.iconR
const barraFim = L.TEMPO.cx + L.TEMPO.w / 2
const ajudaIni = L.AJUDA.x - L.AJUDA.r
exigir(
    luzesFim < relogioIni,
    `as 3 luzes acabam em ${luzesFim}px e o relógio da barra começa em ${relogioIni}px`,
)
exigir(
    barraFim < ajudaIni,
    `a barra de tempo acaba em ${barraFim}px e o botão ? começa em ${ajudaIni}px`,
)
exigir(
    L.TEMPO.cy - L.TEMPO.iconR >= 0 && L.TEMPO.cy + L.TEMPO.h / 2 <= 90,
    'a barra de tempo cabe inteira na faixa de cima (0..90)',
)
exigir(
    L.TEMPO.h >= 20 && L.TEMPO.w >= 180,
    `a barra tem ${L.TEMPO.w}x${L.TEMPO.h} — visível num celular`,
)

const encaixeBase = L.SLOTS.cy + (L.SLOTS.lado + 10) / 2
const pecaTopo = L.PECAS.cy - L.PECAS.toqueH / 2
exigir(
    encaixeBase < pecaTopo,
    `o toque dos encaixes acaba em ${encaixeBase}px e o das peças começa em ${pecaTopo}px`,
)

/* ── e tudo o que se toca é grande o bastante para um dedo de criança ── */

const ALVO_MIN = 60
const alvos = [
    ['peça', Math.min(L.PECAS.toqueW, L.PECAS.toqueH)],
    ['encaixe da memória', L.SLOTS.lado + 10],
    ['ícone do trilho', L.FILA.toque],
    ['botão NÃO DÁ', Math.min(L.BOTAO.w, L.BOTAO.h)],
    ['botão ?', L.AJUDA.r * 2],
]
alvos.forEach(([nome, lado]) => exigir(
    lado >= ALVO_MIN,
    `${nome}: alvo de ${lado}px (mínimo ${ALVO_MIN}px para celular)`,
))

/* ═══════════════════════════════════════════════ 4. as regras da casa */

secao('AS REGRAS QUE NÃO PODEM SE PERDER')

const vezesQueErra = (SRC.scene.match(/this\.errar\(\)/g) ?? []).length
exigir(
    vezesQueErra === 2,
    `só DUAS formas de perder uma luz (achei ${vezesQueErra} chamadas de errar()): `
    + 'peça errada · NÃO DÁ quando dava',
)
exigir(
    /if \(this\.estado === 'travado' \|\| this\.estado === 'fim'\) return\n\s*this\.erros/.test(SRC.scene),
    'depois da última luz, errar() não faz mais nada — travou() nunca roda duas vezes',
)
exigir(
    NIVEIS.every(n => !('paciencia' in n)),
    'nenhum nível tem relógio de paciência: não se perde luz por demorar',
)
exigir(
    /this\.tempo\.setRunning\(this\.estado === 'pedindo'\)/.test(SRC.scene),
    'a barra de tempo só anda no estado `pedindo` — parada em animação, tutorial e fim',
)
exigir(
    /tempoEsgotado[\s\S]{0,1400}this\.scene\.restart\(\{ nivel: this\.nivel\.numero/.test(SRC.scene),
    'tempo esgotado perde o NÍVEL e volta com a barra cheia — não perde o jogo',
)
exigir(
    !/tempoEsgotado[\s\S]{0,600}this\.errar\(\)/.test(SRC.scene),
    'tempo esgotado não tira luz: acabar o tempo não é a mesma coisa que errar',
)

/*
 * TELA JOGÁVEL É TELA DESTRANCADA.
 *
 * `estado = 'pedindo'` quer dizer "agora o toque faz alguma coisa". Se as zonas
 * continuarem trancadas nesse instante, o jogo fica exatamente como ficou
 * depois de trocar de atendido: o estado certo, e nada respondendo ao dedo.
 * Nenhum teste de geometria pega isso — só esta conta.
 */
const virarJogavel = [...SRC.scene.matchAll(/([\s\S]{0,260})this\.estado = 'pedindo'/g)]
const semDestravar = virarJogavel
    .filter(m => !/trancar\(false\)|runTutorial\(|this\.mudo = false/.test(m[1]))
exigir(
    virarJogavel.length >= 3 && semDestravar.length === 0,
    `a tela volta a aceitar toque em ${virarJogavel.length} lugares, e destranca nos ${virarJogavel.length}`,
)
exigir(LUZES_INICIAIS === 3, `${LUZES_INICIAIS} luzes — dá para contar sem saber ler`)
exigir(
    AJUDA_MS.releia < AJUDA_MS.mostra && AJUDA_MS.releia >= 6000,
    `quem trava recebe ajuda: releia aos ${AJUDA_MS.releia / 1000}s, a peça pisca aos ${AJUDA_MS.mostra / 1000}s`,
)
exigir(
    NIVEIS.filter(n => n.memoria).every(n => n.memoria.encaixes === 4),
    'a memória tem 4 encaixes — o pente de RAM desenhado tem 4 chips',
)
exigir(
    !/ocupacao\.set\('memoria'|USO_MS.*memoria/.test(SRC.scene),
    'a memória não tem relógio: programa aberto fica aberto até alguém fechar',
)
exigir(
    NIVEIS.every(n => n.pecas.some(p => n.semEnergia.includes(p.id))),
    'todo nível tem uma peça sem energia — o "não dá" nunca deixa de existir',
)

/* ═══════════════════════════════════════════════ 5. a simulação */

secao('A SIMULAÇÃO (uma criança de verdade consegue?)')

/**
 * Quanto cada animação segura a tela. Medido nos `duration` de `effects.ts`.
 * A criança não pode agir durante elas — e, nesta simulação, a paciência corre.
 */
const ANIM = {
    entra: 760,   // o próximo sai do trilho e sobe voando até a placa
    entrega: 620, // o ícone voa até a peça e pousa
    abre: 560,    // o ícone voa até o encaixe da memória
    fecha: 220,   // o programa achata e some
    recusa: 220,  // a placa some no NÃO DÁ
    devolve: 340, // o atendido desce de volta para a vaga dele
}

function simular(nivel, reacao) {
    const total = nivel.paciencia ?? Infinity
    const quantosAtivos = nivel.ativos ?? 1

    let restantes = nivel.pedidos.map((_, i) => i)
    let selecionado = restantes[0]
    const paciencia = new Map()
    const ocupacao = new Map()
    const abertos = new Array(nivel.memoria?.encaixes ?? 0).fill(null)
    nivel.memoria?.jaAbertos.forEach((p, i) => { abertos[i] = p })

    let t = 0
    let menorFolga = 1
    let desistiu = null
    const eventos = []

    const ativos = () => restantes.slice(0, quantosAtivos)
    const pedido = i => nivel.pedidos[i]

    let barra = 0

    /**
     * `naBarra` marca o tempo em que a cena estaria no estado `pedindo` — que é
     * o único em que o cronômetro anda. Animação, pausa entre pedidos, troca de
     * atendido e tutorial ficam de fora, exatamente como no jogo.
     */
    const avancar = (ms, naBarra = false) => {
        if (naBarra) barra += ms
        // as peças em uso se liberam sozinhas
        for (const [id, resta] of [...ocupacao]) {
            if (resta - ms <= 0) ocupacao.delete(id)
            else ocupacao.set(id, resta - ms)
        }
        if (total === Infinity) { t += ms; return }
        for (const i of ativos()) {
            const resta = (paciencia.get(i) ?? total) - ms
            paciencia.set(i, resta)
            menorFolga = Math.min(menorFolga, resta / total)
            if (resta <= 0 && desistiu === null) desistiu = i
        }
        t += ms
    }

    const resolver = i => {
        restantes = restantes.filter(j => j !== i)
        paciencia.delete(i)
        selecionado = restantes[0]
        if (restantes.length) avancar(ENTRE_PEDIDOS_MS + ANIM.entra)
    }

    avancar(ANIM.entra)

    let voltas = 0
    while (restantes.length && desistiu === null) {
        if (++voltas > 200) { eventos.push('o roteiro não fecha: a criança ficou em laço'); break }

        avancar(reacao, true) // a criança lê e decide — e é só isso que a barra conta
        if (desistiu !== null) break

        const p = pedido(selecionado)

        if (nivel.semEnergia.includes(p.peca)) {
            eventos.push(`${p.id}: NÃO DÁ`)
            avancar(ANIM.recusa)
            resolver(selecionado)
            continue
        }

        if (p.peca === 'memoria') {
            const livre = abertos.indexOf(null)
            if (livre < 0) {
                eventos.push(`${p.id}: memória cheia → fecha um programa`)
                avancar(ANIM.fecha)
                abertos[0] = null
                continue // e pensa de novo
            }
            eventos.push(`${p.id}: abre na memória (encaixe ${livre + 1})`)
            avancar(ANIM.abre)
            abertos[livre] = p.programa
            resolver(selecionado)
            continue
        }

        if (ocupacao.has(p.peca)) {
            const outro = ativos().find(i => i !== selecionado && !ocupacao.has(pedido(i).peca))
            if (outro !== undefined) {
                eventos.push(`${p.id}: ${p.peca} ocupada → atende ${pedido(outro).id} antes`)
                avancar(ANIM.devolve + ANIM.entra)
                selecionado = outro
                continue
            }
            eventos.push(`${p.id}: ${p.peca} ocupada e não há outro → espera ${Math.round(ocupacao.get(p.peca) / 100) / 10}s`)
            avancar(ocupacao.get(p.peca), true)
            continue
        }

        eventos.push(`${p.id}: entrega ${p.peca}`)
        avancar(ANIM.entrega)
        ocupacao.set(p.peca, USO_MS)
        resolver(selecionado)
    }

    return { t, barra, menorFolga, desistiu, eventos }
}

for (const nivel of NIVEIS) {
    for (const reacao of [3500, 6000]) {
        const r = simular(nivel, reacao)
        const seg = (r.t / 1000).toFixed(1)
        if (r.desistiu !== null) {
            erro(
                `Nível ${nivel.numero}, criança de ${reacao / 1000}s: `
                + `${nivel.pedidos[r.desistiu].id} DESISTIU aos ${seg}s`,
            )
            r.eventos.forEach(e => console.log(`      · ${e}`))
            continue
        }
        const sobra = Math.round((1 - r.barra / nivel.tempo) * 100)
        const linha = `Nível ${nivel.numero}, criança de ${reacao / 1000}s: resolvido em ${seg}s`
            + ` · ${(r.barra / 1000).toFixed(1)}s de cronômetro de ${nivel.tempo / 1000}s`
            + ` (sobra ${sobra}%)`
        exigir(sobra >= 40, linha)
    }
}

// o par 4-5 do Nível 1: o pedido 5 TEM que encontrar o monitor ainda em uso,
// senão o nível vira múltipla escolha
const n1 = simular(NIVEIS[0], 3500)
exigir(
    n1.eventos.some(e => /ocupada/.test(e)),
    'Nível 1: o pedido 5 encontra a peça do 4 ainda em uso (a resposta muda com o tempo)',
)
const n2 = simular(NIVEIS[1], 3500)
exigir(
    n2.eventos.some(e => /memória cheia/.test(e)),
    'Nível 2: a memória enche e obriga a fechar um programa',
)
const n3 = simular(NIVEIS[2], 3500)
exigir(
    n3.eventos.filter(e => /ocupada → atende/.test(e)).length >= 2,
    'Nível 3: o conflito de peça ocupada acontece DUAS vezes, e a saída é atender o outro',
)
/*
 * A invariante do Nível 3: nunca os dois pedidos vivos ficam travados ao mesmo
 * tempo. Se acontecesse, a criança ficaria olhando para duas peças ocupadas sem
 * nada para tocar — e a simulação registraria uma espera parada.
 */
exigir(
    !n3.eventos.some(e => /não há outro/.test(e)),
    'Nível 3: sempre existe um dos dois pedidos que dá para atender agora',
)

/* ═══════════════════════════════════════════════════════ o fim */

console.log()
if (falhas) {
    console.log(`\x1b[31m${falhas} verificação(ões) reprovada(s).\x1b[0m\n`)
    process.exit(1)
}
console.log('\x1b[32mTudo certo.\x1b[0m\n')
