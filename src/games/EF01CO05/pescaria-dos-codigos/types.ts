export type Beats = 1 | 2 | 3

export type Hue = 'red' | 'blue' | 'yellow'

export type Mark = { kind: 'beats'; n: Beats } | { kind: 'hue'; hue: Hue }

export type CodeId = 'beats-hue'

export interface CodeDef {
    id: CodeId
    pairs: [Mark, Mark][]
}

export interface ClueDef {
    clue: Mark
    school: Mark[]
}

export interface LevelDef {
    level: number
    code: CodeId
    clues: number
    schoolSize: number
    legend: 'always'
    speed: number
    spacing: number
    beam: number
}

export type FishPose = 'swim' | 'hooked' | 'happy' | 'yuck'

export type BoatPose = 'idle' | 'cast' | 'reel' | 'cheer' | 'oops'

export type Mode = 'intro' | 'guide' | 'fish' | 'hook' | 'panel' | 'done'

export interface Point {
    x: number
    y: number
}
