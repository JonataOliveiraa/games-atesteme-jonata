export interface TechItem {
  id: string
  label: string
  textureKey: string
}

export interface Situation {
  id: string
  prompt: string
  options: string[]    // ids de TechItem, 3 ou 4 opções
  correctId: string
  justification: string
}

export interface CityLocation {
  id: string
  label: string
  textureKey: string
  x: number
  y: number
  situationId: string
}

export interface LevelConfig {
  level: 1 | 2 | 3
  useMap: boolean
  perSituationTimer?: number   // segundos; usado apenas no Nível 3
  locations?: CityLocation[]
  situations: Situation[]
  title: string
  objective: string
  tip: string
}
