export interface Subtask {
  id: string
  label: string
}

/** slots: lista ordenada de posições da linha do tempo.
 *  Cada posição contém 1 id (sequencial) ou 2 ids (lane paralela — Nível 3). */
export interface DecompChallenge {
  id: string
  mainTask: string
  subtasks: Subtask[]
  slots: string[][]
}

export interface LevelConfig {
  level: 1 | 2 | 3
  challenges: DecompChallenge[]
  title: string
  objective: string
  tip: string
}
