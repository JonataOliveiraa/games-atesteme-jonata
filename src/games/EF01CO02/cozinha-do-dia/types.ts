export type ObjectId =
    | 'bowl'
    | 'cereal'
    | 'milk'
    | 'bun'
    | 'sausage'
    | 'ketchup'
    | 'banana'
    | 'lid'
    | 'button'
    | 'bread'
    | 'cheese'
    | 'cup'
    | 'scoop'
    | 'syrup'
    | 'cookie'
    | 'cream'
    | 'berry'
export type AnimalId = 'cat' | 'dog' | 'monkey'
export type DishId = 'cereal' | 'hotdog' | 'smoothie' | 'sandwich' | 'sundae' | 'pave'
export type StepAction = 'place' | 'pour' | 'press'
export type MessKind = 'scatter' | 'spill' | 'splash' | 'overflow' | 'bounce' | 'rattle' | 'burst' | 'slip' | 'puddle'
export type Pose = 'wait' | 'eat' | 'yuck'
export type State = 'intro' | 'demo' | 'choose' | 'play' | 'pour' | 'busy' | 'help' | 'error' | 'finale' | 'done'

export interface Vec {
    x: number
    y: number
}

export interface Rect extends Vec {
    w: number
    h: number
}

export interface Mess {
    kind: MessKind
    frame: string
    item?: ObjectId
}

export interface StepDef {
    object: ObjectId
    action: StepAction
    frame: string
    messes: Partial<Record<ObjectId, Mess>>
}

export interface OrderDef {
    animal: AnimalId
    dish: DishId
    start: string
    goal: string
    bench: ObjectId[]
    steps: StepDef[]
    decoy?: ObjectId[]
    decoyFirst?: boolean
}

export interface LevelDef {
    level: number
    title: string
    message: string
    lit: boolean
    choose: boolean
    orders: OrderDef[]
}
