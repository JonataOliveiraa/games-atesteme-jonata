/**
 * EF03CO08 — usar uma ferramenta digital para se expressar em diferentes formatos.
 * A criança guarda as férias no tablet: FOTO para o que se VÊ, SOM para o que se OUVE.
 * O que guardar é escolha dela; o formato tem de conseguir guardar aquilo.
 */

export type BeachId = 'rainbow' | 'bird' | 'crab' | 'icecream' | 'dolphin' | 'castle' | 'wave' | 'music'
export type FarmId = 'frog' | 'butterfly' | 'rooster' | 'cow' | 'dog' | 'bees' | 'duck' | 'tractor'
export type NightId = 'owl' | 'moon' | 'cricket' | 'fireflies' | 'campfire' | 'star' | 'pondFrog' | 'lantern'
export type ThingId = BeachId | FarmId | NightId
export type Tool = 'photo' | 'sound'
export type DudaPose = 'smile' | 'talk' | 'cheer' | 'oops' | 'present' | 'bow'

export interface Beat {
    ms: number
    see: boolean
    hear: boolean
}

/** como a figura aparece enquanto a coisa se vê */
export type Motion = 'still' | 'hop' | 'walk' | 'flutter' | 'bob' | 'drive' | 'blink' | 'flicker' | 'streak'

export interface Look {
    sheet: 'coisas-sitio' | 'coisas-noite'
    cell: number
    /** quadro de quando também faz barulho (a vaca mugindo, o fogo estalando) */
    alt?: number
    size: number
    /** onde a figura fica, em relação ao centro da coisa */
    dx?: number
    dy?: number
    motion: Motion
}

export interface ThingDef {
    id: ThingId
    x: number
    y: number
    /** área em que o centro do visor "pega" a coisa */
    w: number
    h: number
    cycle: Beat[]
    /** de onde as notas sobem: de trás do esconderijo, ou da própria coisa */
    notes: { x: number; y: number; spread: number }
    /** a figura genérica (N2 e N3); a praia tem animações próprias */
    look?: Look
    /** legenda do cartão de som e da apresentação */
    label: string
    noPhoto?: string
    noSound?: string
    /** duas legendas prontas para a apresentação, por formato (N2 e N3) */
    captions?: Partial<Record<Tool, [string, string]>>
}

export interface Moment {
    things: ThingId[]
    /** quantas páginas este momento enche */
    pages: number
    guided?: boolean
    /** balão de estreia, com a câmera indo até a coisa */
    lesson?: { thing: ThingId; text: string }
}

export interface LevelDef {
    level: number
    title: string
    message: string
    goal: string
    /** o fundo do mundo largo */
    bg: string
    titles: [string, string, string]
    /** a apresentação pede uma legenda por página */
    captions: boolean
    moments: Moment[]
}

export type Page =
    | { tool: 'photo'; thing: ThingId; key: string }
    | { tool: 'sound'; thing: ThingId }

export type Mode = 'intro' | 'guide' | 'play' | 'capture' | 'jam' | 'panel' | 'finale' | 'done'
