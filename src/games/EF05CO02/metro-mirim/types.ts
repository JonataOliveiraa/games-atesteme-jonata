/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A MECÂNICA, EM QUATRO LINHAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   A tela é um grafo. `Station` é vértice, `Link` é aresta POSSÍVEL (o que a
 *   cidade permite ligar) e `Edge` é aresta CONSTRUÍDA (o trilho que existe).
 *
 *   A criança gasta um número contado de peças transformando `Link` em `Edge`,
 *   e o veredito é uma busca em largura sobre as `Edge` que ela montou — nunca
 *   um gabarito guardado aqui.
 */

export interface Station {
    id: string
    label: string
    /** o nome como destino — "ao Mercado", "à Escola". Tira a concordância do código. */
    dative: string
    /** quadro na folha `estacoes.png` */
    art: number
    x: number
    y: number
}

/** Uma ligação que a cidade permite: aparece tracejada, ainda sem trilho. */
export interface Link {
    a: string
    b: string
}

/** Um trilho construído. Mesmo formato do `Link`, outro significado. */
export interface Edge {
    a: string
    b: string
}

export interface Rider {
    id: string
    /** quadro na folha `passageiros.png` (0..3; chegando é `art + 4`) */
    art: number
    name: string
    from: string
    to: string
    /** a fala dele no ato da conversa, em voz de criança */
    line: string
    /** quantos trilhos ele aguenta. Sem isso, ele não tem pressa. */
    rush?: number
}

export interface PhaseDef {
    id: string
    /** o tamanho do mapa desta fase — maior que a tela, a câmera passeia nele */
    world: { w: number; h: number }
    stations: Station[]
    links: Link[]
    /** quantas peças a bandeja começa tendo */
    tray: number
    riders: Rider[]
}

export interface LevelDef {
    level: number
    title: string
    /** o que fazer, escrito no HUD */
    goal: string
    /** a frase do painel de fim de nível */
    closing: string
    phases: PhaseDef[]
}

/** Os três atos: a conversa, a construção e a partida. */
export type Act = 'conversa' | 'construcao' | 'partida'

export type Mode = 'entrando' | 'conversa' | 'montando' | 'correndo' | 'travado' | 'fim'
