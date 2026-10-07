export type Critter = 'sapo' | 'coelho' | 'pato'

export type Item = 'chapeu' | 'guardachuva' | 'balao'

export type Form = 'one' | 'all' | 'none'

export type HotWord = 'NÃO' | 'TODOS' | 'NENHUM'

export interface Sentence {
    form: Form
    item: Item
    subject?: Critter
    not?: boolean
}

export interface PhaseDef {
    sentence: Sentence
    start: boolean[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    fresh: HotWord[]
    phases: PhaseDef[]
}

export type Mode = 'intro' | 'guide' | 'setup' | 'open' | 'panel' | 'done'

export type Rect = { x: number; y: number; w: number; h: number }

export type Vec = { x: number; y: number }

export type Word = { text: string; hot?: boolean }
