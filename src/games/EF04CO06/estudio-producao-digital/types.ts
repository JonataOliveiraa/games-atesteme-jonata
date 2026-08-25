/**
 * Estúdio de Produção Digital — EF04CO06.
 *
 * ── POR QUE NINGUÉM DIGITA NADA AQUI ─────────────────────────────────────
 *
 * "Editor simplificado porém real" é uma armadilha: editor de verdade é folha
 * em branco, folha em branco não tem resposta, e sem resposta não existe jogo.
 * E um teclado na tela, para 4º ano no celular, seria castigo.
 *
 * Então o jogo troca DIGITAR por DECIDIR. A criança não escreve o título: ela
 * escolhe entre três títulos possíveis. Editar é decidir o que entra — e é
 * exatamente essa decisão que a habilidade quer treinar.
 */

/**
 * As telas de um trabalho, na ordem.
 *
 *   pedido     → o que a escola quer, grande, antes de qualquer escolha
 *   midia      → só no Nível 3: cartaz, slides ou vídeo?
 *   passo      → uma decisão por tela, uma por espaço da obra
 *   publicando → as peças se juntam e o botão PUBLICAR aparece
 *   jurados    → os carimbos caem
 */
export type CaseState =
    | 'pedido' | 'midia' | 'passo' | 'publicando' | 'jurados' | 'solved'

/** As três mídias do estúdio. */
export type Formato = 'texto' | 'apresentacao' | 'video'

/** Como a peça se desenha: um pedaço de texto, ou uma imagem. */
export type TipoPeca = 'texto' | 'imagem'

/**
 * Uma opção da caixa de ferramentas.
 *
 * `bom` é o que a banca vai olhar, e `critica` é o que ela diz quando a
 * escolha não serve. A crítica mora JUNTO da opção porque ela fala daquela
 * escolha, não do caso: "COISAS LEGAIS não diz do que se trata" vale em
 * qualquer briefing onde alguém escolher COISAS LEGAIS.
 */
export interface Opcao {
    /** O conteúdo: uma frase, ou a chave da textura quando `tipo` é imagem. */
    valor: string
    bom: boolean
    critica?: string
}

export interface Slot {
    /** O papel dela na obra: TÍTULO, CENA, NARRAÇÃO... */
    papel: string
    tipo: TipoPeca
    /**
     * Espaço que dá para publicar sem preencher.
     *
     * É o que faz o selo RECURSOS ter sentido: a criança descobre que recurso
     * é escolha, e não obrigação, quando a banca aprova a obra e mesmo assim
     * comenta o que ficou de fora.
     */
    opcional?: boolean
    opcoes: Opcao[]
}

export interface Caso {
    id: string
    formato: Formato
    /** O pedido, em uma ou duas frases. */
    briefing: string
    /** Para quem a obra é — metade das decisões sai daqui. */
    publico: string
    slots: Slot[]
    /** O template do Nível 1: peças que já vêm montadas. */
    pronto?: Array<{ slot: number; opcao: number }>
    /** Só no Nível 3: por que os outros formatos não servem para este pedido. */
    porque?: Partial<Record<Formato, string>>
    successLine: string
}

export interface Level {
    level: number
    title: string
    objective: string
    tip: string
    /** No Nível 3 a criança escolhe a mídia antes de produzir. */
    escolhe: boolean
    cases: Caso[]
}

/** Os três selos da banca — os mesmos critérios do briefing da habilidade. */
export type Selo = 'clareza' | 'recursos' | 'adequacao'

export interface Veredito {
    clareza: boolean
    recursos: boolean
    adequacao: boolean
    aprovado: boolean
    /** O espaço que a banca mandou rever. −1 quando não há nada a rever. */
    revisar: number
    linha: string
}
