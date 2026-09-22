export type Forma = 'fila' | 'grade' | 'ficha' | 'teia'

/** Um campo da ficha: o rótulo diz que TIPO de coisa mora ali. */
export type TipoCampo = 'bicho' | 'cor' | 'tamanho'

export interface NoTeia {
    /** Quadro de `bichinhos.png`, ou de `coisas.png` quando `coisa` é true. */
    frame: number
    coisa?: boolean
    /** Posição dentro da moldura, de 0 a 1. */
    x: number
    y: number
}

/**
 * Uma estrutura na tela. Nos níveis 1 e 2 a fase tem uma; no nível 3 tem duas,
 * lado a lado — e é aí que a criança precisa **identificar** qual serve.
 */
export interface Estrutura {
    forma: Forma
    /** `fila`: quantos buracos. */
    fila?: number
    /** `grade`: o recorte usado. */
    grade?: { linhas: number; colunas: number }
    /** `ficha`: os campos, de cima para baixo. */
    ficha?: TipoCampo[]
    /** `teia`: os pontos e os fios que faltam entre eles. */
    teia?: { nos: NoTeia[]; ligacoes: Array<[number, number]> }
}

export interface Peca {
    id: string
    /** Em qual estrutura da fase ela mora. Sem isto, a primeira. */
    alvo?: number
    /** `fila`: o quadro de `coisas.png` — e a ordem também é o tamanho. */
    objeto?: number
    ordem?: number
    /** `grade`: onde ela mora. */
    linha?: number
    coluna?: number
    /** `ficha`: qual campo ela preenche, e o que ela mostra. */
    campo?: number
    tipo?: TipoCampo
    /** O desenho do valor: índice do bichinho, da cor ou do tamanho. */
    valor?: number
    /** `teia`: as duas pontas do fio. */
    de?: number
    para?: number
}

export interface Fase {
    id: string
    estruturas: Estrutura[]
    pecas: Peca[]
    /** Uma linha, e ela só aparece no SEGUNDO erro. */
    dica: string
}

export interface LevelConfig {
    level: number
    fases: Fase[]
}

/**
 * ONDE A PEÇA MORA — derivado dela mesma, nunca escrito à mão.
 *
 * Um campo `buracoCerto` no dado poderia mentir: uma peça de ordem 2 apontando
 * para o buraco 4, e o jogo ensinaria errado sem ninguém notar. Aqui a resposta
 * sai das propriedades que já descrevem a peça.
 */
export function buracoDaPeca(est: Estrutura, p: Peca): number | undefined {
    switch (est.forma) {
        case 'fila':
            return p.ordem
        case 'grade':
            return p.linha === undefined || p.coluna === undefined
                ? undefined
                : p.linha * 3 + p.coluna
        case 'ficha':
            return p.campo
        case 'teia': {
            const ligacoes = est.teia?.ligacoes ?? []
            const i = ligacoes.findIndex(
                ([a, b]) => (a === p.de && b === p.para) || (a === p.para && b === p.de),
            )
            return i < 0 ? undefined : i
        }
    }
}
