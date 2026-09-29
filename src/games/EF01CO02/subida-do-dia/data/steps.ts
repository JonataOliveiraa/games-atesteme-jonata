import type { Art, StepDef } from '../types'
import { STEPS } from './files'

export const STEP_DEFS: StepDef[] = [
    { id: 'wash-soap', problem: 'wash', cell: 1 },
    { id: 'wash-rinse', problem: 'wash', cell: 2 },
    { id: 'wash-dry', problem: 'wash', cell: 3 },
    { id: 'bean-soil', problem: 'bean', cell: 4 },
    { id: 'bean-seed', problem: 'bean', cell: 6 },
    { id: 'bean-water', problem: 'bean', cell: 7 },
    { id: 'grandma-gate', problem: 'grandma', cell: 8 },
    { id: 'grandma-bridge', problem: 'grandma', cell: 9 },
    { id: 'grandma-bakery', problem: 'grandma', cell: 10 },
]

const BY_ID = new Map(STEP_DEFS.map(step => [step.id, step]))

export const stepById = (id: string): StepDef | undefined => BY_ID.get(id)

export const stepArt = (id: string): Art => ({ id, key: STEPS, frame: BY_ID.get(id)?.cell ?? 0 })
