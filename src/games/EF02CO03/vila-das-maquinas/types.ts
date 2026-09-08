export type MachineId = 'sweeper' | 'drone' | 'oven'

export type Command = 'sweep' | 'turn' | 'fly' | 'drop' | 'bake' | 'beep'

export type Need = 'clean' | 'highDelivery' | 'bakeFood'

export type ProblemId = 'leaves' | 'rawBread' | 'roofCat'

export type LevelNumber = 1 | 2 | 3

export type Phase = 'intro' | 'tutorial' | 'choosing' | 'running' | 'done'

export type PlaqueState = 'off' | 'on' | 'dead'

export interface CommandDef {
    id: Command
    frame: number
    label: string
    color: number
}

export interface MachineDef {
    id: MachineId
    name: string
    frame: number
    actionFrame: number
    commands: Command[]
    color: number
    dark: number
}

export interface MissionStep {
    need: Need
    requiredCommands: Command[]
    hints: Partial<Record<MachineId, string>>
}

export interface MissionDef {
    id: string
    problem: ProblemId
    label: string
    shelf: MachineId[]
    steps: MissionStep[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    message: string
    missions: MissionDef[]
}

export interface Point {
    x: number
    y: number
}

/** Onde a máquina para, onde as plaquinhas param e onde o problema mora. */
export interface Anchors {
    machine: Point
    strip: Point
    focus: Point
}
