/**
 * Expedição Pixel — EF04CO05.
 *
 * A HABILIDADE: codificar informação para a máquina — binária e atributos de
 * pixel (RGB). A cor de um fogo de artifício é feita de três quantidades de luz,
 * e o estado das três torneiras É o código: `1 0 1`.
 *
 * Não é metáfora de RGB. A soma é aditiva de verdade, e por isso vermelho mais
 * verde dá AMARELO — a descoberta do nível 2, e o que acontece em cada pontinho
 * da tela de um celular.
 */

/** Quanto de um canal. Nos níveis 1 e 2 só 0 e 3 existem. */
export type Step = 0 | 1 | 2 | 3

export type Channel = 'r' | 'g' | 'b'

export interface Mix {
    r: Step
    g: Step
    b: Step
}

/** Quantas paradas a torneira tem: fechada/aberta, ou quanto de luz. */
export type TapSteps = 2 | 4

export interface Round {
    id: string
    /** O que a placa escreve. Cor sem nome não serve para quem não enxerga cor. */
    nome: string
    /** A resposta como três quantidades. Nunca uma cor hexadecimal. */
    target: Mix
    /** A frase do mestre quando o fogo acerta. */
    successLine: string
}

export interface LevelDef {
    level: number
    title: string
    /** Uma ideia nova por nível, dita em uma linha. */
    objective: string
    tapSteps: TapSteps
    rounds: Round[]
}

/** O estado que governa toque, animação e pausa. */
export type Phase = 'misturando' | 'voando' | 'travado' | 'pausado' | 'fim'
