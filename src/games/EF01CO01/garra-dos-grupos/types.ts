export type Color = 'red' | 'yellow' | 'green' | 'blue' | 'pink'

export type Tray = 'fruits' | 'shapes'

export type Size = 'big' | 'small'

export type Shape = 'round' | 'square' | 'triangle'

export interface ItemDef {
    id: string
    tray: Tray
    kind: string
    color: Color
    cell: number
    shape?: Shape
}

export type Rule =
    | { feature: 'color'; color: Color; not?: boolean }
    | { feature: 'size'; size: Size; not?: boolean }
    | { feature: 'shape'; shape: Shape; not?: boolean }

export interface ItemRef {
    id: string
    size: Size
}

export interface Piece {
    def: ItemDef
    size: Size
}

export interface BoxDef {
    tray: Tray
    rule: Rule
    perBox: number
    items: ItemRef[]
    guide?: string
}

export interface LevelDef {
    level: number
    crossMs: number
    spinMs: number
    glowFromStart: boolean
    boxes: BoxDef[]
}

export interface Spot {
    index: number
    id: string
    x: number
    y: number
}

export type Mode = 'intro' | 'guide' | 'sweep' | 'busy' | 'panel' | 'done'
