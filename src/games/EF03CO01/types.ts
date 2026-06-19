export interface LogicSentence {
  id: string
  text: string
  hasNegation: boolean
  negationWord?: string
  correctValue: boolean
  explanation: string
}

export interface LevelConfig {
  level: 1 | 2 | 3
  perSentenceTimer?: number   // segundos; usado apenas no Nível 3
  sentences: LogicSentence[]
  title: string
  objective: string
  tip: string
}
