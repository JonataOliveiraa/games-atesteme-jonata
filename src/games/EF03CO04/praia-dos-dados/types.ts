/**
 * EF03CO04 — relacionar dado e informação.
 * Cada dado do rádio ("o dono usa BONÉ") serve para várias pessoas da praia;
 * só o conjunto aponta UMA: o dono. A criança tira quem não combina.
 */

export type TraitId = 'cap' | 'hat' | 'glasses' | 'bucket' | 'ring' | 'ball' | 'fins'
export type Slot = 'head' | 'eyes' | 'hand' | 'feet'

export type BatherId =
    | 'leo'
    | 'bia'
    | 'ze'
    | 'duda'
    | 'rafa'
    | 'mari'
    | 'beto'
    | 'mei'
    | 'caio'
    | 'nena'
    | 'nico'
    | 'tati'

export type DogId = 'pacoca' | 'salsicha' | 'floco'

export type Hair = 'short' | 'braids' | 'bald' | 'ponytail' | 'kinky' | 'curlyLong' | 'bangs' | 'curly' | 'bun' | 'spiky' | 'afro'
export type Build = 'adult' | 'kid' | 'small'
export type Top = 'suit' | 'trunks' | 'open' | 'tank'

export interface Look {
    skin: number
    hair: number
    hairStyle: Hair
    suit: number
    top: Top
    beard?: number
    build: Build
}

export interface Bather {
    id: BatherId
    traits: TraitId[]
    look: Look
}

export interface PhaseDef {
    dog: DogId
    bays: BatherId[]
    data: TraitId[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    manualRadio: boolean
    phases: PhaseDef[]
}

export interface Solved {
    dog: DogId
    owner: BatherId
    data: TraitId[]
    useless: TraitId[]
}

export type Mode = 'intro' | 'guide' | 'radio' | 'play' | 'reunion' | 'jam' | 'finale' | 'done' | 'panel'
