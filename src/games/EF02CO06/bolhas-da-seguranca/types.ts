export type SituationKind = 'risk' | 'safe'

export type LevelNumber = 1 | 2 | 3

export type Outcome = 'protected' | 'late' | 'safe-touched'

export type Phase = 'intro' | 'tutorial' | 'playing' | 'done'

export type FloaterState = 'flying' | 'locked' | 'captured' | 'leaving'

export interface Situation {
    id: string
    kind: SituationKind
    /** Quadro na folha `situacoes.png` (4 colunas x 3 linhas). */
    frame: number
    /** Só para o cartão de reserva, enquanto a arte não existe. */
    label: string
    /** O cuidado, no risco; o porquê, no seguro. Uma linha. */
    seal: string
}

export interface RoundDef {
    id: string
    order: string[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    /** Segundos entre entrar na tela e alcançar a borda. */
    crossing: number
    maxVisible: number
    /** As cores das bolhas do nível: uma só no 1, a festa inteira no 2. */
    bubbleColors: number[]
    /** Quantas bolhas sobem no fundo. Cresce com o nível. */
    ambient: number
    rounds: RoundDef[]
}
