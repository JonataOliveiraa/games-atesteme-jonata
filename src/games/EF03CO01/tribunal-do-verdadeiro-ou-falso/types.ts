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

export interface LogicSentence {
  id: string
  source: string          // NOVO — veículo/origem da "notícia"
  text: string
  hasNegation: boolean
  negationWord?: string
  correctValue: boolean
  explanation: string
}

// types.ts
export interface LogicSentence {
  id: string
  source: string
  text: string
  core: string          // a informação central, SEM a negação
  coreValue: boolean    // essa informação central é verdade?
  hasNegation: boolean
  negationWord?: string
  correctValue: boolean
  explanation: string
}