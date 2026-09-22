/**
 * ══════════════════════════════════════════════════════════════════════
 *  MARATONA DO ALGORITMO — EF15CO02
 * ══════════════════════════════════════════════════════════════════════
 *
 * A habilidade pede CONSTRUIR e SIMULAR algoritmos. Aqui a criança monta o
 * CAMINHO inteiro antes da descida, aperta VAI, e assiste o caminho dela
 * acontecer no parque.
 *
 * A ordem existe ANTES da execução — é isso que separa este jogo de escolher
 * uma carta por obstáculo enquanto o skatista já está andando. E ela continua
 * editável depois: caiu numa manobra, troca aquela carta e desce de novo.
 *
 * NÍVEL 1 — "Faça igual". É o game of S.K.A.T.E.: o FANTASMA desce primeiro e
 * mostra o caminho, e a criança reproduz. O pedido não é uma placa escrita, é
 * uma descida que ela viu acontecer — a instrução mais clara que existe para
 * uma criança de 6 anos.
 */

export type LevelNumber = 1 | 2 | 3

/** As cartas do nível 1. GIRAR, REPITA e SE entram nos níveis 2 e 3. */
export type TrickKind = 'empurrar' | 'subir' | 'pular'

/**
 * O que existe em cada marco do parque.
 *
 * `plano` não tem desenho — só a marca no chão, porque "não tem nada aqui"
 * precisa parecer não ter nada. `rampa` e `caixote` são Graphics: o código
 * PRECISA saber onde fica o lábio da rampa para animar a subida, e geometria
 * que a regra consulta é geometria que o código desenha.
 */
export type FeatureKind = 'plano' | 'rampa' | 'caixote'

export type PlayState =
    | 'intro'
    | 'tutorial'
    | 'ghost'
    | 'building'
    | 'running'
    | 'locked'
    | 'replay'
    | 'ending'

export interface PhaseDef {
    /** Os marcos do parque, na ordem em que o skatista passa por eles. */
    marks: FeatureKind[]
    /** As cartas disponíveis nesta fase. */
    palette: TrickKind[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    phases: PhaseDef[]
}
