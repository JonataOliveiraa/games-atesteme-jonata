export type Direction = "up" | "right" | "down" | "left"

export type RobotCommand = {
    type: "move"
    direction: Direction
}

export interface GridPoint {
    x: number
    y: number
}

export interface RepeatPhase {
    /** Texto curto que aparece no cartão de missão. */
    goal: string
    gridSize: { cols: number; rows: number }
    start: GridPoint
    direction: Direction
    target: GridPoint
    /** Pegada obrigatória no caminho. Opcional. */
    checkpoint?: GridPoint
    obstacles: GridPoint[]
    /** Menor solução possível — dá estrela de eficiência. */
    minBlocks: number
    maxBlocks: number
}

export interface RepeatLevel {
    level: 1 | 2 | 3
    title: string
    objective: string
    /** Segundos por fase. Vale bônus, não derrota. */
    timeLimit: number
    phases: RepeatPhase[]
}

export interface GameSceneData {
    level?: number
    phase?: number
    score?: number
    hits?: number
    errors?: number
    skipIntro?: boolean
}