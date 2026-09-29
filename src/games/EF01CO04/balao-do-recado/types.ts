export type Form = 'voice' | 'letter' | 'screen'

export type RecipientId = 'friend' | 'neighbor' | 'grandma'

export type SceneId =
    | 'friend-near'
    | 'neighbor-away'
    | 'neighbor-away-phone'
    | 'grandma-far'
    | 'grandma-near'
    | 'friend-far'
    | 'neighbor-asleep'

export type MessageId = 'party' | 'pencil' | 'practice'

export type FailId =
    | 'friend-fail-drop'
    | 'friend-fail-letter'
    | 'neighbor-fail-empty'
    | 'neighbor-fail-phone'
    | 'grandma-fail-far'
    | 'grandma-fail-letter'
    | 'grandma-near-fail-drop'
    | 'grandma-near-fail-letter'
    | 'friend-far-fail-far'
    | 'friend-far-fail-letter'
    | 'neighbor-asleep-fail-voice'
    | 'neighbor-asleep-fail-phone'

export type WindowState = 'wait' | 'happy' | 'fail'

export interface Point {
    x: number
    y: number
}

export interface Message {
    id: MessageId
    text: string
    icon: number
}

export interface Ring {
    t: number
    y: number
}

export interface WrongDef {
    form: Form
    fail: FailId
}

export interface ChoiceDef {
    right: Form
    wrongs: WrongDef[]
}

export interface BirdDef {
    t: number
    y: number
    amp: number
    period: number
}

export interface LegDef {
    recipient: RecipientId
    scene: SceneId
    rings: Ring[]
    windowT: number
    windowY: number
    choice: ChoiceDef
    bird: BirdDef | null
}

export interface FlightDef {
    scroll: number
    lift: number
    sink: number
    liftAccel: number
    sinkAccel: number
    slack: number
    ceiling: number
    floor: number
    startY: number
}

export interface LevelDef {
    level: number
    legs: LegDef[]
    flight: FlightDef
}

export type Mode = 'intro' | 'guide' | 'fly' | 'stuck' | 'deliver' | 'choose' | 'mural' | 'panel' | 'done'
