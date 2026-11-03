import type { Art, StepDef } from '../types'
import { STEPS } from './files'

export const STEP_DEFS: StepDef[] = [
    { id: 'wash-tap', routine: 'wash', cell: 0 },
    { id: 'wash-soap', routine: 'wash', cell: 1 },
    { id: 'wash-rinse', routine: 'wash', cell: 2 },
    { id: 'wash-dry', routine: 'wash', cell: 3 },
    { id: 'bean-soil', routine: 'bean', cell: 4 },
    { id: 'bean-hole', routine: 'bean', cell: 5 },
    { id: 'bean-seed', routine: 'bean', cell: 6 },
    { id: 'bean-water', routine: 'bean', cell: 7 },
    { id: 'grandma-gate', routine: 'grandma', cell: 8 },
    { id: 'grandma-bridge', routine: 'grandma', cell: 9 },
    { id: 'grandma-bakery', routine: 'grandma', cell: 10 },
    { id: 'tangram-square', routine: 'tangram', cell: 11 },
    { id: 'tangram-roof', routine: 'tangram', cell: 12 },
    { id: 'tangram-door', routine: 'tangram', cell: 13 },
    { id: 'hat-half', routine: 'hat', cell: 14 },
    { id: 'hat-corners', routine: 'hat', cell: 15 },
    { id: 'hat-hem', routine: 'hat', cell: 16 },
    { id: 'paint-paper', routine: 'paint', cell: 17 },
    { id: 'paint-open', routine: 'paint', cell: 18 },
    { id: 'paint-dip', routine: 'paint', cell: 19 },
    { id: 'paint-brush', routine: 'paint', cell: 20 },
    { id: 'shoes-sock', routine: 'shoes', cell: 21 },
    { id: 'shoes-shoe', routine: 'shoes', cell: 22 },
    { id: 'shoes-lace', routine: 'shoes', cell: 23 },
    { id: 'sandwich-bread', routine: 'sandwich', cell: 24 },
    { id: 'sandwich-open', routine: 'sandwich', cell: 25 },
    { id: 'sandwich-spread', routine: 'sandwich', cell: 26 },
    { id: 'sandwich-close', routine: 'sandwich', cell: 27 },
]

const BY_ID = new Map(STEP_DEFS.map(step => [step.id, step]))

export const stepById = (id: string): StepDef | undefined => BY_ID.get(id)

export const stepArt = (id: string): Art => ({ id, key: STEPS, frame: BY_ID.get(id)?.cell ?? 0 })
