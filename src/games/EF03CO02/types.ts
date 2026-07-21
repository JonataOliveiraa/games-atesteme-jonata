export interface MazeChallenge {
  id: string
  corridorLength: number
  walls: number[]
  goalCol?: number              // usado em N1/N2
  conditionOptions?: string[]   // usado em N2 (escolha entre 3)
  fixedConditionId?: string     // usado em N1/N3 (condição já definida)
  predictMode?: boolean         // N3: pedir previsão do ponto de parada
  stepPredictMode?: boolean     // N1: responder verdadeiro/falso a cada passo
}

export interface LevelConfig {
  level: 1 | 2 | 3
  challenges: MazeChallenge[]
  title: string
  objective: string
  tip: string
}

export interface SimulationResult {
  finalCol: number
  crashed: boolean
  path: number[]
}
