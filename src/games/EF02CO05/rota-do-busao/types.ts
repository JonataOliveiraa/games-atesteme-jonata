export type RiderId =
    | 'clock'
    | 'fridge'
    | 'speaker'
    | 'phone'
    | 'tv'
    | 'microwave'
    | 'computer'
    | 'projector'
    | 'camera'
    | 'cardMachine'
    | 'scale'
    | 'trafficLight'
    | 'pencil'
    | 'wateringCan'

export type SituationId =
    | 'time'
    | 'iceCream'
    | 'music'
    | 'grandma'
    | 'cartoon'
    | 'soup'
    | 'rollCall'
    | 'story'
    | 'photo'
    | 'fare'
    | 'fruit'
    | 'cross'
    | 'notebook'
    | 'garden'

export type SceneryId = 'houseA' | 'houseB' | 'houseC' | 'tree' | 'school' | 'market' | 'square' | 'lamp'

export type Place = 'home' | 'school' | 'town'

export type Glyph = 'clock' | 'flake' | 'note' | 'ring' | 'star' | 'heat' | 'light' | 'drop'

export interface Rider {
    id: RiderId
    name: string
    tech: boolean
    place: Place
    line: string
    glyph: Glyph
}

export interface Situation {
    id: SituationId
    text: string
    owner: RiderId
    place: Place
}

export interface StopDef {
    situation: SituationId
    riders: RiderId[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    ridersPerStop: 2 | 3
    scenery: SceneryId[]
    stops: StopDef[]
}

export type Mode = 'intro' | 'guide' | 'drive' | 'choose' | 'act' | 'finale' | 'done' | 'panel'
