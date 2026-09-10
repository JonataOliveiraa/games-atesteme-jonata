/**
 * MISSÃO EM PEDAÇOS — EF03CO03, decomposição.
 *
 * O jogo dá uma TAREFA com oito objetos. A criança CORTA a tarefa no meio: cada
 * metade vai num painel, e cada painel vira uma FASE de plataforma. Volta das
 * duas viagens, ela FAZ A TAREFA na fase final, com o que trouxe.
 *
 * A parte não existe nos dados: ela é o conteúdo de um painel.
 */

export type LevelNumber = 1 | 2 | 3

export interface Item {
    id: string
    /**
     * A plaquinha embaixo do objeto. Diz O QUE ELE É — e, quando o desenho
     * sozinho não basta, o que ele FAZ: "Colher de misturar" contra "Espátula
     * de espalhar". Nunca diz de que metade ele é: isso é a decisão da criança.
     */
    name: string
    /** O mesmo objeto dentro de uma frase, com artigo: "a colher", "o ovo". */
    label: string
    /** O quadro na folha do item, `itens-nN-a` ou `itens-nN-b`. */
    frame: number
    jobId: string
}

/**
 * UMA ESTAÇÃO: um lugar do mapa onde a tarefa acontece de verdade.
 *
 * Nas tarefas com estação a viagem deixa de terminar na bancada. A criança
 * junta os quatro objetos da metade e leva CADA PAR até o ponto onde ele serve:
 * a chaleira e a jarra até o fogareiro, os fósforos e a luva até acender. Cada
 * estação atendida troca de desenho — e o desenho é um quadro do `final-nN`, a
 * mesma folha que conta o resultado.
 *
 * É por isso que a arte não precisou de folha nova: o estado que antes só
 * aparecia na tela final agora aparece no mundo, onde a criança está.
 */
export interface Station {
    id: string
    x: number
    /** Os itens que ela consome, todos de uma vez. */
    needs: string[]
    /** As estações que precisam estar prontas antes desta. */
    after?: string[]
    /** O quadro de `final-nN` que ela mostra depois de atendida. */
    frame: number
    /** O que o topo diz quando ela acontece. */
    line: string
    /** O que o topo diz se a criança chegar sem o que falta. */
    hint: string
}

export interface Job {
    id: string
    /**
     * O nome do grupo, escrito no alto do painel: "Massa do bolo", "Comida".
     *
     * O painel deixou de ser um espaço anônimo que a criança batiza pelo
     * conteúdo: agora ele diz de saída qual metade guarda. O corte ficou mais
     * fácil e mais explícito — e mais perto de classificar do que de decompor.
     */
    name: string
    /** Como o trabalho entra na frase da trava: "do bolo", "da comida". */
    partOf: string
    /** A metade que precisa estar pronta antes desta. Só o nível 3 usa. */
    requires?: string
    /**
     * As estações desta metade. Quando existem, a viagem NÃO termina na bancada:
     * ela termina quando a última estação foi atendida, e a tarefa não tem fase
     * final — a receita já aconteceu no mundo.
     */
    stations?: Station[]
}

/** Um passo da FASE FINAL: tocar num item que já pode ser usado. */
export interface Step {
    itemId: string
    /** Os passos que precisam ter acontecido antes deste. */
    after?: string[]
    /** O que a criança lê quando o passo acontece. */
    line: string
    /** O que a criança lê se tocar antes da hora. */
    hint: string
}

export interface Solid {
    x: number
    /** O topo, que é onde o herói pisa. */
    y: number
    w: number
}

/** Uma vaga de item no mapa. `high` marca as que ficam em cima de plataforma. */
export interface Spot {
    x: number
    y: number
}

export interface Rock {
    x: number
}

export interface RunMap {
    length: number
    /** Os buracos no chão. */
    gaps: { x: number; w: number }[]
    platforms: Solid[]
    /** As pedras: bloqueiam a passagem e dão o pulo. Não custam vida. */
    rocks: Rock[]
    /**
     * O lixo do caminho — meia fedida, barata, peixe morto.
     *
     * Ele ocupa as vagas que antes recebiam os itens da OUTRA metade. Aqueles
     * eram o erro de cabeça no meio da corrida; o lixo é obstáculo puro, e a
     * decisão de dividir passou a viver só no corte e na fase final.
     */
    trash: Spot[]
    /** Onde nascem os quatro itens DESTA viagem. */
    tripSpots: Spot[]
    checkpoints: number[]
    benchX: number
}

export interface Task {
    id: string
    name: string
    /** A folha dos oito objetos desta tarefa. */
    sheetKey: string
    /** A folha dos estados da fase final, se existir. */
    finalKey: string
    /** O que a criança lê no cartão de abertura. */
    brief: string
    items: Item[]
    /** Sempre dois: a tarefa é cortada no MEIO. */
    jobs: [Job, Job]
    steps: Step[]
    /**
     * O quadro de `final-nN` por QUANTIDADE de passos feitos — `states[0]` é o
     * estado inicial e `states[n]` o estado depois de n passos.
     *
     * É por contagem, e não por passo, porque no piquenique a ordem é livre: se
     * a arte viesse presa a um item, tocar na corda primeiro pularia direto para
     * o piquenique posto.
     */
    states: number[]
    /** A frase que fecha a fase final. */
    finalLine: string
    map: RunMap
}

export interface LevelDef {
    level: LevelNumber
    name: string
    tasks: Task[]
}

/** Uma viagem é só uma lista de itens: a metade da tarefa que vai num painel. */
export type Trip = Item[]

export type Mode = 'intro' | 'plan' | 'choose' | 'run' | 'bench' | 'finale' | 'trava' | 'done'
