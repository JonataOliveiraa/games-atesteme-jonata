export type GraphContext = 'mapa' | 'rede'

export type PhaseKind = 'representar' | 'rota' | 'consulta' | 'isomorfismo'

export interface GraphNode {
  id: string
  label: string
  textureKey: string
  x: number
  y: number
}

export interface GraphEdge {
  a: string
  b: string
  weight?: number
}

interface BasePhase {
  id: string
  kind: PhaseKind
  context: GraphContext
  name: string
  instruction: string
  nodes: GraphNode[]
}

/** Nível 1: o jogador arrasta de um nó ao outro para criar as arestas certas. */
export interface RepresentPhase extends BasePhase {
  kind: 'representar'
  rule: string
  edges: GraphEdge[]
}

/** Nível 2: arestas já desenhadas; o jogador toca nós em sequência montando a rota. */
export interface RoutePhase extends BasePhase {
  kind: 'rota'
  edges: GraphEdge[]
  startId: string
  endId: string
  mustPass?: string[]
  requireOptimal?: boolean
  explanation: string
}

/** Nível 3: pergunta de leitura sobre o grafo (vizinhança, distância). */
export interface QueryPhase extends BasePhase {
  kind: 'consulta'
  edges: GraphEdge[]
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

/** Nível 3: dois desenhos lado a lado — é o mesmo grafo? */
export interface IsomorphismPhase extends BasePhase {
  kind: 'isomorfismo'
  edges: GraphEdge[]
  altNodes: GraphNode[]
  altEdges: GraphEdge[]
  sameGraph: boolean
  explanation: string
}

export type PhaseConfig =
  | RepresentPhase
  | RoutePhase
  | QueryPhase
  | IsomorphismPhase

export interface LevelConfig {
  level: 1 | 2 | 3
  title: string
  objective: string
  timeLimit?: number
  phases: PhaseConfig[]
}