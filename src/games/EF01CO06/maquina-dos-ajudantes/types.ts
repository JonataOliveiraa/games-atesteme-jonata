export type DeviceId = 'clock' | 'lullaby' | 'phone' | 'tablet' | 'dance' | 'tablet-call'

export type DeviceArt = 'clock' | 'speaker' | 'phone' | 'tablet'

export type Person = 'sleeper' | 'baby' | 'missing-grandma' | 'bored' | 'party'

export type Pose = 'before' | 'helped' | 'funny'

export type Side = 0 | 1

export interface RoundDef {
    id: string
    device: DeviceId
    rooms: [Person, Person]
}

export interface LevelDef {
    level: number
    rounds: RoundDef[]
}

export type Mode = 'intro' | 'guide' | 'deliver' | 'closed' | 'reveal' | 'open' | 'fly' | 'done' | 'panel'

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface Point {
    x: number
    y: number
}
