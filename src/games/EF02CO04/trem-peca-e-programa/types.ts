export type Kind = 'part' | 'program'
export type Side = 'left' | 'right'

export type ItemId =
    | 'mouse'
    | 'keyboard'
    | 'speaker'
    | 'gamepad'
    | 'screen'
    | 'camera'
    | 'robot'
    | 'game'
    | 'music'
    | 'paint'
    | 'alarm'
    | 'photos'
    | 'dance'

export interface Item {
    id: ItemId
    name: string
    kind: Kind
    tricky: boolean
}

export interface PhaseDef {
    id: string
    items: ItemId[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
    wait: boolean
    order: [ItemId, ItemId]
}

export type Mode = 'intro' | 'guide' | 'drop' | 'choose' | 'slide' | 'depart' | 'finale' | 'done' | 'panel'
