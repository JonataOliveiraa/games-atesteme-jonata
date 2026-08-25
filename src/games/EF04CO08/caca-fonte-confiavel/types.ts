/**
 * Caça à Fonte Confiável — EF04CO08.
 *
 * ── O ERRO QUE ESTE JOGO NÃO PODE COMETER ────────────────────────────────
 *
 * A versão anterior entregava os critérios já avaliados: cada página vinha com
 * `criteriaResults: { author: true, date: true... }` e um resumo que era
 * literalmente `"✓✓✓✓✓"` contra `"✗✗✗✗✗"`. A criança não lia página nenhuma —
 * contava os vistos que o jogo já tinha dado. A habilidade inteira acontecia
 * antes de ela chegar.
 *
 * Aqui não existe visto pronto. Existe o que está ESCRITO na página: quem
 * assina, de quando é, que endereço é aquele e de onde a página tirou o que
 * diz. O julgamento é todo da criança.
 *
 * ── E O QUE A BNCC PEDE DE VERDADE ───────────────────────────────────────
 *
 * O exemplo oficial fala em "comparando páginas que tratam do mesmo tema, mas
 * com informações diferentes como por exemplo em uma biografia". O nó é o
 * CONFLITO: duas páginas sobre o mesmo assunto que discordam num fato, e uma
 * delas está errada. Sem isso não há o que verificar.
 *
 * Por isso toda página deste jogo carrega uma `resposta` — o que ELA afirma —
 * e num mesmo caso as respostas não batem.
 */

export type CaseState = 'lendo' | 'revelando' | 'solved'

/**
 * As quatro coisas que se olha numa página, sempre nesta ordem.
 *
 * Elas são o "bloco de critérios de verificação" que o briefing pede — só que
 * distribuído sobre as próprias páginas, onde é usado, em vez de morar numa
 * caixa à parte que a criança teria que consultar e traduzir. Cada uma tem um
 * ícone fixo, e é o ícone que ensina a ordem de leitura.
 */
export type Criterio = 'endereco' | 'autor' | 'data' | 'fonte'

export const CRITERIOS: Criterio[] = ['endereco', 'autor', 'data', 'fonte']

/** Uma linha da página: o que está escrito, e se aquilo pesa a favor ou contra. */
export interface Linha {
    /** Curto. É para ser varrido com o olho, não lido em voz alta. */
    texto: string
    /** Ponto forte da página, ou ponto fraco. */
    bom: boolean
    /**
     * A linha que RESOLVE o caso.
     *
     * Não é "a linha ruim": é a que, sozinha, decide em quem confiar. Num caso
     * do Nível 3 são duas — as de duas páginas que copiaram a mesma fonte
     * velha —, e grifar qualquer uma delas conta como justificar a decisão.
     */
    decisiva?: boolean
}

export interface Pagina {
    /** As chaves batem com `Criterio` de propósito: `pagina[criterio]`. */
    endereco: Linha
    autor: Linha
    data: Linha
    fonte: Linha
    /** O que ESTA página responde à pergunta do caso. */
    resposta: string
    /** A verdade, revelada só no fim. */
    confiavel: boolean
    /** A frase do carimbo, na revelação. */
    veredito: string
}

export interface Caso {
    id: string
    pergunta: string
    /** Duas páginas nos Níveis 1 e 2; três no Nível 3. */
    paginas: Pagina[]
    /** Índice da página em que se deve confiar. */
    certa: number
    /** A frase que aponta a pista decisiva, na revelação. */
    porque: string
    successLine: string
}

export interface Level {
    level: number
    title: string
    objective: string
    tip: string
    /**
     * A chave da textura do tema, comum aos três casos do nível.
     *
     * Um tema por nível, e não por caso: são três perguntas diferentes sobre o
     * mesmo assunto. Além de caber no orçamento de arte, isso faz a criança
     * reconhecer os sites que erram sempre — que é metade do que se aprende
     * verificando fontes.
     */
    tema: string
    cases: Caso[]
}

/** Onde a página guarda cada critério. As chaves são iguais aos nomes. */
export const linhaDe = (p: Pagina, c: Criterio): Linha => p[c]
