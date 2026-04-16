export type Attribute = 'cor' | 'forma' | 'tamanho'

export type Color = 'vermelho' | 'azul' | 'verde' | 'amarelo'
export type Shape = 'circulo' | 'quadrado' | 'triangulo' | 'retangulo'
export type Size = 'pequeno' | 'medio' | 'grande'

export interface GameItem {
  id: string
  color: Color
  shape: Shape
  size: Size
  /** Frame no texture atlas — vazio enquanto não houver atlas real */
  frame: string
}

export interface ClassifierBase {
  id: string
  rule: { attribute: Attribute; value: string }
  /** Chave de texto exibida na UIScene */
  labelKey: string
  /** Chave de áudio de narração da regra */
  audioKey: string
  x: number
  y: number
}

export interface LevelConfig {
  level: 1 | 2 | 3
  criterion: Attribute
  items: GameItem[]
  bases: ClassifierBase[]
  /** Limite de tempo em segundos (somente nível 3) */
  timeLimit?: number
}
