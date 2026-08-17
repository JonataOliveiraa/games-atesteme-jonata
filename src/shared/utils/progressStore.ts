import type { GameProgress, RoundResult } from '../types/game'

const KEY = (gameId: string) => `bncc-progress-${gameId}`

export const progressStore = {
  save(gameId: string, progress: GameProgress): void {
    localStorage.setItem(KEY(gameId), JSON.stringify(progress))
  },

  load(gameId: string): GameProgress | null {
    const raw = localStorage.getItem(KEY(gameId))
    if (!raw) return null
    try {
      return JSON.parse(raw) as GameProgress
    } catch {
      return null
    }
  },

  saveRound(result: RoundResult): void {
    const existing = progressStore.load(result.gameId)
    const progress: GameProgress = existing ?? {
      gameId: result.gameId,
      currentLevel: result.level,
      roundsCompleted: 0,
      results: [],
      lastPlayed: Date.now(),
    }

    progressStore.save(result.gameId, {
      ...progress,
      currentLevel: result.level,
      roundsCompleted: progress.roundsCompleted + 1,
      results: [...progress.results, result],
      lastPlayed: Date.now(),
    })
  },

  report(gameId: string): { dominated: string[]; weak: string[] } {
    const p = progressStore.load(gameId)
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
