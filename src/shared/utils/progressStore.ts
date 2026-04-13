import type { GameCode, GameProgress, RoundResult } from '../types/game'

const KEY = (code: GameCode) => `bncc-progress-${code}`

export const progressStore = {
  save(code: GameCode, progress: GameProgress): void {
    localStorage.setItem(KEY(code), JSON.stringify(progress))
  },

  load(code: GameCode): GameProgress | null {
    const raw = localStorage.getItem(KEY(code))
    if (!raw) return null
    try {
      return JSON.parse(raw) as GameProgress
    } catch {
      return null
    }
  },

  saveRound(result: RoundResult): void {
    const existing = progressStore.load(result.gameCode)
    const progress: GameProgress = existing ?? {
      gameCode: result.gameCode,
      currentLevel: result.level,
      roundsCompleted: 0,
      results: [],
      lastPlayed: Date.now(),
    }

    progressStore.save(result.gameCode, {
      ...progress,
      currentLevel: result.level,
      roundsCompleted: progress.roundsCompleted + 1,
      results: [...progress.results, result],
      lastPlayed: Date.now(),
    })
  },

  /**
   * Retorna critérios dominados (≥80% acerto em ≥3 rodadas) e fracos.
   * Critério dominado: das últimas 3 rodadas com aquele criterion, ≥80% de acertos.
   */
  report(code: GameCode): { dominated: string[]; weak: string[] } {
    const p = progressStore.load(code)
    if (!p) return { dominated: [], weak: [] }

    const byCriterion = new Map<string, RoundResult[]>()
    for (const r of p.results) {
      const arr = byCriterion.get(r.criterion) ?? []
      arr.push(r)
      byCriterion.set(r.criterion, arr)
    }

    const dominated: string[] = []
    const weak: string[] = []

    for (const [criterion, rounds] of byCriterion) {
      if (rounds.length < 3) continue
      const last3 = rounds.slice(-3)
      const totalHits = last3.reduce((s, r) => s + r.hits, 0)
      const totalAttempts = last3.reduce((s, r) => s + r.hits + r.errors, 0)
      if (totalAttempts === 0) continue
      const pct = totalHits / totalAttempts
      if (pct >= 0.8) {
        dominated.push(criterion)
      } else {
        weak.push(criterion)
      }
    }

    return { dominated, weak }
  },
}
