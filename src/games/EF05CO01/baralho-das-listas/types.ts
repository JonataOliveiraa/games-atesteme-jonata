/**
 * Baralho das Listas — EF05CO01.
 *
 * ── O QUE A HABILIDADE PEDE, E O QUE O JOGO ANTIGO NÃO FAZIA ─────────────
 *
 * A habilidade fala em "listas que estabelecem uma organização na qual há um
 * número VARIÁVEL de itens dispostos em SEQUÊNCIA, fazendo manipulações
 * simples". Variável e sequência são as duas palavras que importam: a lista
 * cresce e encolhe, e a ordem tem que sobreviver a isso.
 *
 * E o exemplo oficial dá quatro tarefas, não uma:
 *
 *   1. incluir cartas novas MANTENDO A ORDEM
 *   2. REGISTRAR AS CARTAS VIZINHAS
 *   3. substituir por curinga, ou retirar, todas as cartas de um valor
 *   4. BUSCAR uma carta "que pode ou não estar no monte"
 *
 * A versão anterior tinha três telas de um caso cada e nunca falava de
 * vizinhos nem de busca. O "pode ou não estar" — que é a parte mais difícil e
 * mais bonita do enunciado, porque ensina que só dá para concluir que não tem
 * DEPOIS de olhar tudo — não existia em lugar nenhum.
 *
 * Aqui as quatro tarefas viram os quatro verbos, e todo caso é uma sequência
 * deles. Os vizinhos aparecem sozinhos a cada passo, como o enunciado pede.
 */

/**
 * `perdido` = a barra de tempo zerou e o caso acabou sem ser resolvido.
 *
 * Ele existe para que TODOS os manipuladores de toque, que já testam
 * `state !== 'jogando'`, fiquem mortos de graça — sem precisar de uma flag
 * paralela que alguém esqueceria de ligar em um dos oito lugares.
 */
export type CaseState = 'jogando' | 'resolvendo' | 'solved' | 'perdido'

/** O curinga não tem valor de ordem: ele ocupa o lugar de quem saiu. */
export const CORINGA = 0
/** O J vale 11 — é a maior carta que este baralho tem. */
export const VALOR_J = 11

export type Naipe = 'copas' | 'espadas' | 'coringa'

export interface Carta {
    /**
     * Identidade dentro da lista.
     *
     * Duas cartas de 7 na mesma lista são objetos diferentes e precisam
     * continuar diferentes quando a lista se reorganiza — senão a animação
     * troca uma pela outra no meio do caminho.
     */
    id: string
    valor: number
    naipe: Naipe
}

/** As quatro manipulações do enunciado. */
export type Verbo = 'inserir' | 'remover' | 'substituir' | 'buscar'

export interface Passo {
    verbo: Verbo
    /** O que fazer, numa frase. */
    objetivo: string
    /** `inserir`: a carta que está na mão. */
    carta?: Carta
    /** `remover`, `substituir`, `buscar`: o valor em questão. */
    valor?: number
    /**
     * `buscar`: se a carta está mesmo na lista.
     *
     * Quando é `false`, o único jeito de acertar é conferir a lista inteira e
     * só então dizer que não tem. É a tarefa 4 do enunciado, e a razão de a
     * busca existir neste jogo.
     */
    existe?: boolean
    dica: string
}

export interface Caso {
    id: string
    /** A lista como ela começa. */
    lista: Carta[]
    /** Um passo nos Níveis 1 e 2; dois ou três no Nível 3. */
    passos: Passo[]
    /**
     * Quantas ações bastam para resolver o caso inteiro.
     *
     * É o "pontuação considera ordem preservada e número de ações" do briefing.
     * Cada tentativa errada também conta como ação — senão sair tentando espaço
     * por espaço até acertar valeria o mesmo que localizar a posição.
     */
    acoesMinimas: number
    successLine: string
}

export interface Level {
    level: number
    title: string
    objective: string
    tip: string
    cases: Caso[]
}

/** Onde uma carta está e quem são os vizinhos dela. */
export interface Vizinhanca {
    /** `undefined` quando é a primeira: ninguém antes. */
    anterior?: Carta
    alvo?: Carta
    /** `undefined` quando é a última: ninguém depois. */
    seguinte?: Carta
    /**
     * Na busca, o que vem depois ainda está DE COSTAS.
     *
     * A casa vazia com um risco quer dizer "não tem ninguém deste lado", e
     * durante a busca isso seria mentira — e mentira que entrega o jogo, porque
     * a criança concluiria que a lista acabou. A resposta certa ali é "ainda não
     * sei", e ela se desenha como um verso de carta.
     */
    depoisOculto?: boolean
}

/** A textura de uma carta. O nome do arquivo é o contrato. */
export function texturaDe(carta: Carta): string {
    if (carta.naipe === 'coringa') return 'card-joker'
    const naipe = carta.naipe === 'copas' ? 'heart' : 'spade'
    const rotulo = carta.valor === VALOR_J ? 'j' : `${carta.valor}`
    return `card-${naipe}-${rotulo}`
}

/** O que se lê na carta: número, ou J, ou a estrela do curinga. */
export function rotuloDe(carta: Carta): string {
    if (carta.naipe === 'coringa') return '★'
    return carta.valor === VALOR_J ? 'J' : `${carta.valor}`
}

/**
 * Onde uma carta de valor `v` DEVE entrar numa lista ordenada.
 *
 * Devolve o índice do espaço, de 0 (antes de todas) a `lista.length` (depois
 * de todas). Curingas são pulados: eles não têm valor de ordem, ficam onde
 * estão e não atrapalham quem chega.
 */
export function posicaoCerta(lista: Carta[], v: number): number {
    let i = 0
    while (i < lista.length) {
        const c = lista[i]
        if (c.naipe !== 'coringa' && c.valor > v) break
        i += 1
    }
    return i
}

/** Os vizinhos de quem for entrar no espaço `gap`. */
export function vizinhosDoGap(lista: Carta[], gap: number): Vizinhanca {
    return {
        anterior: gap > 0 ? lista[gap - 1] : undefined,
        seguinte: gap < lista.length ? lista[gap] : undefined,
    }
}

/**
 * A carta de que o passo trata — a que a coluna da direita mostra.
 *
 * ── POR QUE ISTO EXISTE ──────────────────────────────────────────────────
 *
 * `inserir` já carrega a carta: ela está na mão. Os outros três verbos
 * carregavam só um NÚMERO, e esse número aparecia unicamente escrito no meio da
 * frase do objetivo. Era o que tornava o Nível 2 incompreensível: para procurar
 * o 7 a criança tinha que sustentar "sete" de cabeça enquanto comparava seis
 * cartas desenhadas — dois trabalhos ao mesmo tempo, e o difícil não era o do
 * jogo.
 *
 * Quando o valor está na lista, mostramos a carta de verdade. Quando não está
 * — que é justamente o caso da busca vazia, o mais importante do nível — ela é
 * montada no naipe do monte, porque comparar copas com espadas acrescentaria
 * uma diferença que não interessa a esta habilidade.
 */
export function cartaDoPasso(passo: Passo, lista: Carta[]): Carta | undefined {
    if (passo.carta) return passo.carta
    if (passo.valor === undefined) return undefined

    const naLista = lista.find(c => c.naipe !== 'coringa' && c.valor === passo.valor)
    if (naLista) return naLista

    const naipe = lista.find(c => c.naipe !== 'coringa')?.naipe ?? 'copas'
    return { id: `foco-${passo.valor}`, valor: passo.valor, naipe }
}

/** O que a coluna da direita escreve em cima da carta, para cada verbo. */
export const ROTULO_FOCO: Record<Verbo, string> = {
    inserir: 'NA SUA MÃO',
    buscar: 'PROCURE ESTA',
    remover: 'TIRE ESTA',
    substituir: 'TROQUE ESTA',
}

/** Os vizinhos da carta que está no índice `i`. */
export function vizinhosDaCarta(lista: Carta[], i: number): Vizinhanca {
    return {
        anterior: i > 0 ? lista[i - 1] : undefined,
        alvo: lista[i],
        seguinte: i < lista.length - 1 ? lista[i + 1] : undefined,
    }
}

/**
 * Os vizinhos da carta que acabou de ser VIRADA na busca.
 *
 * Só se sabe o que veio antes. O que vem depois continua de costas — e é essa a
 * diferença entre andar numa lista e olhar uma lista de cima.
 */
export function vizinhosNaBusca(lista: Carta[], i: number): Vizinhanca {
    return {
        anterior: i > 0 ? lista[i - 1] : undefined,
        alvo: lista[i],
        depoisOculto: i < lista.length - 1,
    }
}
