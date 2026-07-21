export interface ActionCard {
  id: string
  label: string
}

export interface Subproblem {
  id: string
  label: string
  correctCardIds: string[]  // ordered if challenge.orderedWithin === true
}

export interface DecompChallenge {
  id: string
  mainTask: string
  subproblems: Subproblem[]
  allCards: ActionCard[]
  orderedWithin?: boolean   // N2: position within each subproblem matters
}

export interface LevelConfig {
  level: 1 | 2 | 3
  challenges: DecompChallenge[]
  title: string
  objective: string
  tip: string
}
