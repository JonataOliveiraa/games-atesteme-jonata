/**
 * ══════════════════════════════════════════════════════════════════════
 *  PULO PROGRAMADO — EF01CO03
 * ══════════════════════════════════════════════════════════════════════
 *
 * A habilidade pede CRIAR e REORGANIZAR sequências de passos, e ligá-las à
 * palavra "algoritmo". Aqui a criança monta a lista inteira antes de o coelho
 * sair, aperta VAI, e assiste o programa dela rodar.
 *
 * A ordem existe ANTES da execução — é isso que separa este jogo de responder
 * uma pergunta por obstáculo. E ela continua editável depois: errou num passo,
 * troca aquela carta e roda de novo.
 */

export type LevelNumber = 1 | 2 | 3

/** As três cartas da paleta. */
export type ActionKind = 'pular' | 'abaixar' | 'andar'

/**
 * O que existe em cada marco do chão. `livre` não tem desenho — só a pegada,
 * porque "não tem nada aqui" precisa parecer não ter nada.
 *
 * `buraco` e `pedra` também não têm textura: são desenhados em Graphics
 * junto com o chão. Terra em PNG encostando em terra desenhada mostra a
 * emenda, e era a primeira coisa que o olho achava na tela.
 */
export type ObstacleKind = 'buraco' | 'tronco' | 'galho' | 'tunel' | 'livre' | 'pedra'

export type PlayState = 'intro' | 'tutorial' | 'building' | 'running' | 'locked' | 'replay' | 'ending'

export interface PhaseDef {
    marks: ObstacleKind[]
    /** Cartas disponíveis na paleta desta fase. */
    palette: ActionKind[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    phases: PhaseDef[]
}
