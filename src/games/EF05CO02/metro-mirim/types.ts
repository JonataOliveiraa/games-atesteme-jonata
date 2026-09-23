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

/**
 * O SEGUNDO ATO DA FASE.
 *
 * A cidade não fica parada esperando a rede ficar pronta: quando o primeiro
 * trem chega, alguma coisa muda, e a criança projeta de novo em cima da rede
 * que ela mesma montou. É a diferença entre "monte um grafo" e "cuide de um
 * grafo" — e é o que separa os níveis 2 e 3 do 1.
 *
 * `chegada` abre uma estação nova com gente querendo ir até ela; `obra` fecha
 * o trilho MAIS USADO da rede que a criança montou, e ela precisa reconectar.
 * Nos dois casos vêm peças novas para a bandeja: consertar sem material seria
 * pedir o impossível.
 */
export type Twist =
    | {
          kind: 'chegada'
          station: Station
          /** As ligações que a estação nova abre. */
          links: Link[]
          tray: number
          riders: Rider[]
      }
    | {
          kind: 'obra'
          tray: number
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
    /** O que acontece depois da primeira partida. Sem isto, a fase tem um ato. */
    twist?: Twist
    /**
     * As ligações que a obra fechou. Só existe na fase VIVA, montada pela
     * cena — nunca nos dados: quem escolhe o trilho da obra é o tráfego da
     * rede que a criança montou, e isso não cabe num arquivo de dados.
     */
    closed?: Link[]
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
