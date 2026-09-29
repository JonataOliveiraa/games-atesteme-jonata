import type { Color, ItemDef, Shape, Size } from '../types'

export const SIZE_SCALE: Record<Size, number> = {
    big: 1,
    small: 0.6,
}

const FRUITS: ItemDef[] = [
    { id: 'apple-red', tray: 'fruits', kind: 'apple', color: 'red', cell: 0 },
    { id: 'apple-yellow', tray: 'fruits', kind: 'apple', color: 'yellow', cell: 1 },
    { id: 'apple-green', tray: 'fruits', kind: 'apple', color: 'green', cell: 2 },
    { id: 'strawberry', tray: 'fruits', kind: 'strawberry', color: 'red', cell: 3 },
    { id: 'cherry', tray: 'fruits', kind: 'cherry', color: 'red', cell: 4 },
    { id: 'banana', tray: 'fruits', kind: 'banana', color: 'yellow', cell: 5 },
    { id: 'pear-yellow', tray: 'fruits', kind: 'pear', color: 'yellow', cell: 6 },
    { id: 'pear-green', tray: 'fruits', kind: 'pear', color: 'green', cell: 7 },
    { id: 'grape-green', tray: 'fruits', kind: 'grape', color: 'green', cell: 11 },
]

const SHAPE_CELL: Record<Shape, number> = { round: 8, square: 9, triangle: 10 }
const SHAPE_KIND: Record<Shape, string> = { round: 'circle', square: 'square', triangle: 'triangle' }
const COLORS: Color[] = ['red', 'yellow', 'green', 'blue', 'pink']

const SHAPES: ItemDef[] = (Object.keys(SHAPE_CELL) as Shape[]).flatMap(shape =>
    COLORS.map(color => ({
        id: `${SHAPE_KIND[shape]}-${color}`,
        tray: 'shapes' as const,
        kind: SHAPE_KIND[shape],
        color,
        cell: SHAPE_CELL[shape],
        shape,
    })),
)

export const ITEM_DEFS: ItemDef[] = [...FRUITS, ...SHAPES]

const BY_ID = new Map(ITEM_DEFS.map(item => [item.id, item]))

export const itemById = (id: string): ItemDef | undefined => BY_ID.get(id)
