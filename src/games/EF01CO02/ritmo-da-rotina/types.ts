/**
 * ══════════════════════════════════════════════════════════════════════
 *  RITMO DA ROTINA — EF01CO02
 * ══════════════════════════════════════════════════════════════════════
 *
 * A habilidade pede SEGUIR uma sequência de passos do dia a dia. Aqui a
 * sequência está desenhada no topo, e seguir é uma decisão de botão: o que é
 * o próximo passo entra no tambor, o que não é vai para o "agora não".
 *
 * O veredito nunca é um campo guardado na figura — é uma função do estado da
 * rotina no instante em que a figura chega ao alvo (ver `expectedHit`). A
 * mesma figura pede tambor numa hora e recusa na outra.
 */

export type LevelNumber = 1 | 2 | 3

/** Os dois botões: o tambor diz "é esse", o redondo diz "agora não". */
export type HitKind = 'yes' | 'no'

export type PlayState = 'intro' | 'tutorial' | 'running' | 'locked' | 'recap' | 'ending'

export type Scenery = 'quarto' | 'cozinha'

export interface StepDef {
    id: string
    label: string
    texture: string
}

export interface RoutineDef {
    id: string
    name: string
    scenery: Scenery
    steps: StepDef[]
}

/** Uma figura programada para entrar no caminho, com o tempo em que ela nasce. */
export interface Cue {
    step: StepDef
    /** Índice do passo na rotina, ou -1 se a figura não pertence a ela. */
    routineIndex: number
    /** Tempo (em batidas) em que a figura nasce. */
    beat: number
}

export interface FallingFigure extends Cue {
    x: number
    mistakes: number
    settled: boolean
}

/**
 * A FASE é uma rotina inteira. Três por nível, crescendo — a criança aprende
 * a rotina por extensão, e não por repetição da mesma coisa três vezes.
 */
export interface PhaseDef {
    routine: RoutineDef
    /** Figuras que não fazem parte desta rotina. */
    distractors: StepDef[]
    /** Passos da própria rotina que chegam fora de hora. */
    outOfOrder: number
    /** Batidas entre uma figura e a seguinte. */
    beatsBetween: number
    /** Meia-janela de acerto em PIXELS: ela é exatamente o anel que se vê. */
    windowPx: number
}

export interface LevelDef {
    level: LevelNumber
    name: string
    phases: PhaseDef[]
}
