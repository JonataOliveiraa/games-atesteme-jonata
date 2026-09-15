/**
 * Pista Binária — EF04CO04.
 *
 * A mecânica inteira cabe em três linhas:
 *
 *      uma FILA de caixas vem vindo   →   cada uma tem um quadradinho CHEIO ou VAZIO
 *      a criança toca 1 ou 0          →   a nave ATIRA aquele dígito
 *      o dígito certo abre a caixa    →   o quadradinho vira um pedaço do desenho
 *
 * O código nunca aparece antes da resposta: ele é o tiro. E o desenho só existe
 * inteiro do outro lado, na máquina, remontado pelo que a criança transmitiu.
 */

export type Bit = 0 | 1

/** Uma FASE: um desenho inteiro atravessando o túnel. */
export interface PhaseDef {
    /** Quadrada, 5 × 5 ou 6 × 6. O código É este desenho. */
    art: Bit[][]
}

export interface LevelDef {
    level: number
    title: string
    /** As entregas do nível, na ordem. */
    phases: PhaseDef[]
    /** Velocidade da fila, em px por segundo. */
    speed: number
    closing: string
}

/**
 * O estado que governa toque, animação e pausa.
 *
 *   jogando     a fila anda; a caixa da frente encosta e ESPERA, sem custo
 *   travado     o dígito errado bateu: a fila para até o dígito certo
 *   entregando  a fase acabou e a figurinha está indo para o álbum
 */
export type Mode = 'intro' | 'jogando' | 'travado' | 'entregando' | 'fim'
