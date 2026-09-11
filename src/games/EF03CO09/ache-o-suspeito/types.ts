export type LevelNumber = 1 | 2 | 3

export type Owner = 'self' | 'peer'

export type Audience = 'teacher' | 'closed-group' | 'school-site' | 'public' | 'unknown'

export type DataKind =
    | 'address'
    | 'phone'
    | 'live-location'
    | 'school-routine'
    | 'vehicle-plate'
    | 'peer-image'
    | 'peer-story'
    | 'school-work'
    | 'preference'

export type Movement = 'still' | 'horizontal' | 'vertical'

export interface TargetCard {
    id: string
    message: string
    destination: string
    owner: Owner
    audience: Audience
    kind: DataKind
    consent?: boolean
    note: string
}

export interface Wave {
    id: string
    movement: Movement
    cards: TargetCard[]
}

export interface LevelDef {
    level: LevelNumber
    waves: Wave[]
}

export type Mode = 'intro' | 'choosing' | 'flying' | 'impact' | 'done'
