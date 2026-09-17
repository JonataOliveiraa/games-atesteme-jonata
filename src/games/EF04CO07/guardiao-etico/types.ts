/**
 * Guardião Ético — EF04CO07.
 *
 * A criança confere um papel antes de ele ser publicado: passa a lupa, acha o
 * que está escrito miúdo e tapa o que é de outra pessoa. O veredito nunca está
 * guardado num campo `certa`: ele sai de até onde aquele dado pode ir e de até
 * onde ESTE nível publica.
 */

export type PersonId = 'teo' | 'bia' | 'rafa' | 'duda' | 'estranho'

/**
 * A distância que um dado alcança.
 *
 * `ninguem` é o degrau que falta na régua dos destinos: telefone e endereço não
 * vão nem para o mural da sala, e é isso que dá trabalho para a criança já no
 * nível 1.
 */
export type Reach = 'ninguem' | 'turma' | 'escola' | 'mundo'

export type ItemKind =
    | 'telefone'
    | 'endereco'
    | 'rosto'
    | 'nome'
    | 'assinatura'
    | 'senha'
    | 'saude'

export type ArtKey = 'festa' | 'parque' | 'quadra' | 'dragao'

/** O que está escrito no papel e não pode ser achado: título, rodapé, recado. */
export interface Line {
    text: string
    x: number
    y: number
    size: number
    black?: boolean
    soft?: boolean
    wrap?: number
}

/** A foto ou o desenho colado no papel. */
export interface Glued {
    art: ArtKey
    x: number
    y: number
    w: number
    h: number
}

export interface Item {
    id: string
    kind: ItemKind
    /** O que está escrito no papel, em corpo miúdo. */
    text: string
    /** O que o cartão do achado mostra em corpo grande. */
    reading: string
    owner: PersonId
    /** Até onde este dado pode ir. A assinatura vai a 'mundo'. */
    reach: Reach
    /** Em coordenada do papel, canto superior esquerdo. */
    box: { x: number; y: number; w: number; h: number }
}

export interface Sheet {
    id: string
    /** Quem trouxe o papel. */
    who: PersonId
    /** Uma linha, curta. */
    ask: string
    /** O que ele diz quando o papel é carimbado. */
    praise: string
    lines: Line[]
    glued?: Glued
    items: Item[]
}

export interface LevelDef {
    level: number
    title: string
    closing: string
    goal: string
    destination: DestinationId
    /** O alcance vale para o nível INTEIRO. */
    reach: Reach
    sheets: Sheet[]
}

export type DestinationId =
    | 'muralDaSala'
    | 'jornalDaEscola'
    | 'siteDaEscola'

export type Mode = 'entrando' | 'procurando' | 'carimbando' | 'travado' | 'fim'

/**
 * A ferramenta escolhida é o que o TOQUE no papel faz.
 *
 * Arrastar a lupa funciona com qualquer uma delas escolhida: ela é um objeto
 * na mesa, não um modo. Trocar de ferramenta, tapar e destapar são de graça —
 * só CARIMBAR conta como resposta.
 */
export type ToolId = 'lupa' | 'marcador' | 'borracha'
