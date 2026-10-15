/**
 * EF05CO02: grafos — objetos do mundo real representados por pontos ligados
 * por linhas, e manipulações simples sobre eles. A árvore da família é o grafo:
 * cada pessoa é um ponto, e as linhas ligam casais e pais a filhos.
 */

export type State = 'intro' | 'demo' | 'pick' | 'fly' | 'alive' | 'error' | 'help' | 'done' | 'finale'

export type Species = 'cat' | 'dog' | 'rabbit'

export type Kin = 'grandpa' | 'grandma' | 'dad' | 'mom' | 'kid' | 'brother'

export type Human =
    | 'me'
    | 'grandpa'
    | 'grandma'
    | 'dad'
    | 'mom'
    | 'uncle'
    | 'aunt'
    | 'sister'
    | 'brother'
    | 'cousinBoy'
    | 'cousinGirl'
    | 'grandpaM'
    | 'grandmaM'
    | 'auntM'
    | 'baby'

export type Animal = `${Species}.${Kin}`

export type Role = Human | Animal

export type Mood = 'calm' | 'talk' | 'scared' | 'cheer' | 'worried'

export type HairStyle = 'short' | 'curly' | 'spiky' | 'long' | 'pigtails' | 'bun' | 'pony' | 'bob' | 'cap'

export type Stage = 'park' | 'beach' | 'yard'

export interface Look {
    skin: number
    hair: number
    style: HairStyle
    shirt: number
    kid?: boolean
    tuft?: boolean
    glasses?: 'round' | 'half'
    mustache?: boolean
    beard?: boolean
    freckles?: boolean
    earrings?: boolean
    bow?: number
    cap?: number
}

export interface PersonDef {
    role: Role
    label: string
    look: Look
    why: string
    link?: string
    whyLink?: string
    species?: Species
}

export interface Vec {
    x: number
    y: number
}

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface Size {
    w: number
    h: number
}

export interface SlotDef {
    id: string
    x: number
    y: number
    accepts: Role[]
}

export interface FamilyDef {
    parents: string[]
    children: string[]
}

export interface HomeDef {
    role: Role
    slot: string
}

export interface PhaseDef {
    id: string
    news?: string
    slots: SlotDef[]
    families: FamilyDef[]
    people: HomeDef[]
    fixed: Role[]
    rounds?: Role[][]
}

export interface LevelDef {
    level: number
    stage: Stage
    title: string
    goal: string
    message: string
    card: Size
    rows: number[]
    links?: boolean
    phases: PhaseDef[]
}
