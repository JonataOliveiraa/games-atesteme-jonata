/**
 * O Dia Sem Internet — EF05CO06.
 *
 * **Um assunto por nível, e cada nível traz o gesto que o assunto pede:**
 *
 * | Nível | Mundo | Assunto | Gesto |
 * |---|---|---|---|
 * | 1 | `room` | onde cada coisa mora | arrastar em pé |
 * | 2 | `room` | a desconexão: o cabo arrebenta | — |
 * | 3 | `air` | a nuvem chega por ONDA, e cada aparelho tem o seu alcance | arrastar deitado |
 *
 * O veredito nunca sai de um gabarito guardado no arquivo: ele é a comparação
 * entre o que o pedido quer, onde o arquivo mora e o que está cortado **no
 * instante do toque**. É por isso que a mesma nuvem é resposta certa antes do
 * estalo e errada depois, sem que nada nela mude — e por isso que, no nível 3,
 * o mesmo celular abre e deixa de abrir a mesma foto.
 */

export type Place = 'pc' | 'drive' | 'phone' | 'cloud'

export const PLACES: Place[] = ['pc', 'drive', 'phone', 'cloud']

export interface PlaceDef {
    id: Place
    /** O nome no botão, em caixa alta. */
    name: string
    /** Precisa de ligação para ser alcançado? Só a nuvem. */
    needsWire: boolean
    /**
     * É um aparelho nas mãos da criança?
     *
     * No mundo `air` são estes que ganham botão, e é a eles que o corte tira o
     * ALCANCE — não à nuvem, que continua lá inteira. É a diferença entre
     * "a internet caiu" e "este aqui ficou sem sinal", e o nível 3 existe para
     * a criança sentir que são coisas diferentes.
     */
    device: boolean
}

export type FileId = 'musica' | 'video' | 'foto' | 'jogo' | 'desenho' | 'dever'

export interface FileDef {
    id: FileId
    name: string
    /** Como o pedido chama esta coisa: "Quero <want>." */
    want: string
    frame: number
}

export interface SlotDef {
    file: FileId
    place: Place
}

export interface AskDef {
    file: FileId
    /**
     * Quem está SEM ligação quando este pedido chega.
     *
     * É um campo do PEDIDO, e não do mundo, porque é ele que faz o jogo andar:
     * quando um pedido lista alguém que o anterior não listava, o jogo sabe que
     * aquela ligação acabou de arrebentar e toca o estalo (`GameScene`).
     *
     * - nível 1: sempre vazio — nada arrebenta;
     * - nível 2: `['cloud']` no segundo pedido — o cabo da casa;
     * - nível 3: `['pc']` ou `['phone']` — o aparelho que perdeu o sinal.
     */
    cut?: Place[]
}

export interface PhaseDef {
    id: string
    slots: SlotDef[]
    asks: AskDef[]
}

export interface LevelDef {
    level: number
    /**
     * Em que mundo o nível acontece, e é a única chave que o resto lê.
     *
     * - `room` — o quarto em pé: o computador e o pen drive na mesa, a nuvem a
     *   860 px no céu, ligados por cabo. O botão pergunta **de que lugar isso
     *   abre**;
     * - `air` — o mundo deitado: o computador à esquerda, o celular à direita, a
     *   nuvem por cima dos dois, sem fio nenhum. O botão pergunta **que aparelho
     *   consegue abrir isso agora**.
     */
    world: 'room' | 'air'
    subtitle: string
    message: string
    phases: PhaseDef[]
}

export type WrongReason = 'offline' | 'notHere' | 'noReach'

export type Verdict = { kind: 'opens' } | { kind: 'wrong'; why: WrongReason }

export type Mode = 'intro' | 'asking' | 'busy' | 'done'
