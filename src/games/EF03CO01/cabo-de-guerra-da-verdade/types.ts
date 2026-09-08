export type Token = 'plain' | 'negated'

export type LevelNumber = 1 | 2 | 3

export type Phase = 'intro' | 'tutorial' | 'playing' | 'locked' | 'done'

export type Side = 'child' | 'robot'

export type Pose = 'wait' | 'pull' | 'think' | 'cheer'

export interface Statement {
    id: string
    before: string
    after: string
    /** O fato, sem negação nenhuma, é verdadeiro? */
    factValue: boolean
    /** O valor que o robô pede nesta rodada. */
    asked: boolean
    explain: string
}

export interface LevelDef {
    level: LevelNumber
    name: string
    /** Segundos até o robô puxar sozinho. */
    thinkSeconds: number
    /** O que está escrito nas duas cartas. */
    labels: Record<Token, string>
    statements: Statement[]
}
