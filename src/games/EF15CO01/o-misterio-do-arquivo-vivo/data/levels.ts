import { COISA } from './files'
import type { Estrutura, Fase, Forma, LevelConfig, NoTeia, Peca, TipoCampo } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS TRÊS NÍVEIS
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   1. ARRUMAR o que já é fácil de ver — tamanho e cruzamento.
 *   2. ARRUMAR as duas que precisam de leitura — o campo e a ligação.
 *   3. ESCOLHER entre duas estruturas na mesma tela.
 *
 * O verbo da BNCC é **identificar**, e ele mora no nível 3. Os dois primeiros
 * existem para construir o vocabulário que a escolha exige: ninguém identifica
 * uma matriz sem nunca ter montado uma.
 */

/* ─────────────────────────────── fábricas ─────────────────────────────── */

/** A fila: a MESMA coisa em tamanhos diferentes. Nunca objetos diferentes —
 *  "qual é maior, um chapéu ou um livro?" não tem resposta. */
const fila = (objeto: number, quantos: number, alvo = 0): Peca[] =>
    Array.from({ length: quantos }, (_, i) => ({
        id: `f${alvo}${objeto}-${i}`, alvo, objeto, ordem: i,
    }))

/** A grade: uma fichinha por cruzamento de linha (bichinho) com coluna (cor). */
const grade = (linhas: number, colunas: number, alvo = 0): Peca[] => {
    const out: Peca[] = []
    for (let l = 0; l < linhas; l++) {
        for (let c = 0; c < colunas; c++) {
            out.push({ id: `g${alvo}${l}${c}`, alvo, linha: l, coluna: c })
        }
    }
    return out
}

/** A ficha: um valor por campo, na ordem dos campos. */
const ficha = (campos: TipoCampo[], valores: number[], alvo = 0): Peca[] =>
    campos.map((tipo, i) => ({
        id: `c${alvo}${i}`, alvo, campo: i, tipo, valor: valores[i],
    }))

/** A teia: um fio por ligação que falta. */
const fios = (ligacoes: Array<[number, number]>, alvo = 0): Peca[] =>
    ligacoes.map(([de, para], i) => ({ id: `t${alvo}${i}`, alvo, de, para }))

const bicho = (frame: number, x: number, y: number): NoTeia => ({ frame, x, y })
const coisa = (frame: number, x: number, y: number): NoTeia => ({ frame, coisa: true, x, y })

const E = {
    fila: (n: number): Estrutura => ({ forma: 'fila', fila: n }),
    grade: (linhas: number, colunas: number): Estrutura => ({ forma: 'grade', grade: { linhas, colunas } }),
    ficha: (campos: TipoCampo[]): Estrutura => ({ forma: 'ficha', ficha: campos }),
    teia: (nos: NoTeia[], ligacoes: Array<[number, number]>): Estrutura => ({ forma: 'teia', teia: { nos, ligacoes } }),
}

/* ─────────────── os pontos das teias, sempre bem afastados ────────────── */

/** Um triângulo: três pontos, três fios. É a teia mais simples que existe. */
const TRIO: NoTeia[] = [bicho(0, 0.5, 0.12), bicho(1, 0.12, 0.86), bicho(2, 0.88, 0.86)]
const TRIO_LIGA: Array<[number, number]> = [[0, 1], [1, 2], [0, 2]]

/** Um quadrado: quatro pontos, e só as quatro laterais — sem as diagonais. */
const QUARTETO: NoTeia[] = [
    bicho(0, 0.14, 0.16), bicho(1, 0.86, 0.16),
    coisa(COISA.ursinho, 0.86, 0.84), coisa(COISA.bola, 0.14, 0.84),
]
const QUARTETO_LIGA: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 0]]

/* ══════════════════════════════════ NÍVEL 1 ════════════════════════════ */

const N1: Fase[] = [
    { id: '1.1', estruturas: [E.fila(4)], pecas: fila(COISA.ursinho, 4), dica: 'Comece pelo menorzinho.' },
    { id: '1.2', estruturas: [E.fila(5)], pecas: fila(COISA.bola, 5), dica: 'Comece pela menorzinha.' },
    { id: '1.3', estruturas: [E.grade(2, 2)], pecas: grade(2, 2), dica: 'Ache a linha do bichinho e a coluna da cor.' },
    { id: '1.4', estruturas: [E.grade(3, 2)], pecas: grade(3, 2), dica: 'Ache a linha do bichinho e a coluna da cor.' },
    { id: '1.5', estruturas: [E.grade(3, 3)], pecas: grade(3, 3), dica: 'Ache a linha do bichinho e a coluna da cor.' },
]

/* ══════════════════════════════════ NÍVEL 2 ════════════════════════════ */

/**
 * "A FICHA E OS AMIGOS".
 *
 * A ficha abre porque é a mais fácil de ler: o rótulo está do lado do buraco, e
 * o valor certo carrega o mesmo pictograma. A teia entra depois, com três
 * pontos antes de quatro.
 */
const CAMPOS_3: TipoCampo[] = ['bicho', 'cor', 'tamanho']

const N2: Fase[] = [
    {
        id: '2.1',
        estruturas: [E.ficha(['bicho', 'cor'])],
        pecas: ficha(['bicho', 'cor'], [0, 0]),
        dica: 'Cada coisa vai na linha do desenho igual.',
    },
    {
        id: '2.2',
        estruturas: [E.ficha(CAMPOS_3)],
        pecas: ficha(CAMPOS_3, [2, 1, 2]),
        dica: 'Cada coisa vai na linha do desenho igual.',
    },
    {
        id: '2.3',
        estruturas: [E.teia(TRIO, TRIO_LIGA)],
        pecas: fios(TRIO_LIGA),
        dica: 'Olhe os dois do cartão e ache o fio entre eles.',
    },
    {
        id: '2.4',
        estruturas: [E.teia(QUARTETO, QUARTETO_LIGA)],
        pecas: fios(QUARTETO_LIGA),
        dica: 'Olhe os dois do cartão e ache o fio entre eles.',
    },
    {
        id: '2.5',
        estruturas: [E.ficha(CAMPOS_3)],
        pecas: ficha(CAMPOS_3, [1, 2, 0]),
        dica: 'Cada coisa vai na linha do desenho igual.',
    },
]

/* ══════════════════════════════════ NÍVEL 3 ════════════════════════════ */

/**
 * "CADA COISA NA SUA PRATELEIRA".
 *
 * **Duas estruturas na tela, e a bagunça mistura as peças das duas.** É aqui
 * que a criança *identifica* — e ela só consegue porque passou os dois
 * primeiros níveis montando cada uma com a mão.
 *
 * As peças se entregam pela forma: a coisa de tamanho é um objeto solto, a
 * fichinha tem contorno colorido, o valor de campo é um cartão quadrado, o fio
 * é um cartão comprido com duas pontas. Nenhuma cabe na estrutura errada, e o
 * erro mostra por quê.
 */
const N3: Fase[] = [
    {
        id: '3.1',
        estruturas: [E.fila(3), E.grade(2, 2)],
        pecas: [...fila(COISA.livro, 3, 0), ...grade(2, 2, 1)],
        dica: 'Tamanho vai na tábua. Bichinho com cor vai na grade.',
    },
    {
        id: '3.2',
        estruturas: [E.ficha(CAMPOS_3), E.fila(3)],
        pecas: [...ficha(CAMPOS_3, [0, 2, 1], 0), ...fila(COISA.chapeu, 3, 1)],
        dica: 'A ficha tem linhas com nome. A tábua vai do menor ao maior.',
    },
    {
        id: '3.3',
        estruturas: [E.teia(TRIO, TRIO_LIGA), E.grade(2, 2)],
        pecas: [...fios(TRIO_LIGA, 0), ...grade(2, 2, 1)],
        dica: 'Cartão com dois vira fio. Bichinho com cor vai na grade.',
    },
    {
        id: '3.4',
        estruturas: [E.ficha(['bicho', 'cor']), E.teia(TRIO, TRIO_LIGA)],
        pecas: [...ficha(['bicho', 'cor'], [1, 2], 0), ...fios(TRIO_LIGA, 1)],
        dica: 'Um sozinho vai na ficha. Dois ligados viram fio.',
    },
    {
        id: '3.5',
        estruturas: [E.grade(2, 2), E.fila(4)],
        pecas: [...grade(2, 2, 0), ...fila(COISA.planta, 4, 1)],
        dica: 'Tamanho vai na tábua. Bichinho com cor vai na grade.',
    },
]

export const LEVELS: LevelConfig[] = [
    { level: 1, fases: N1 },
    { level: 2, fases: N2 },
    { level: 3, fases: N3 },
]

/** O nome da estrutura, dito só DEPOIS de a criança ter montado. */
export const NOME: Record<Forma, { kid: string; tec: string }> = {
    fila: { kid: 'FILA', tec: 'lista' },
    grade: { kid: 'GRADE', tec: 'matriz' },
    ficha: { kid: 'FICHA', tec: 'registro' },
    teia: { kid: 'TEIA', tec: 'grafo' },
}

/** A regra da fase, em uma linha, no começo dela. Palavras de 1º ano. */
export const ABERTURA: Record<Forma, string> = {
    fila: 'Do menor para o maior!',
    grade: 'Cada um no seu quadradinho!',
    ficha: 'Cada um na sua linha!',
    teia: 'Ligue os dois do cartão!',
}

/** No nível 3 são duas de uma vez, então a frase fala das duas. */
export const ABERTURA_DUPLA = 'Duas prateleiras! Veja onde cada um cabe.'
