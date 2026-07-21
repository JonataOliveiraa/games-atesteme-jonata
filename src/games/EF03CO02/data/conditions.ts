import type { MazeChallenge, SimulationResult } from '../types'

export const CONDITION_LABELS: Record<string, string> = {
  path_clear:   'Enquanto o caminho estiver livre',
  not_at_goal:  'Enquanto não chegar ao objetivo',
  count_lt_2:   'Enquanto andou menos de 2 passos',
  count_lt_3:   'Enquanto andou menos de 3 passos',
  count_lt_4:   'Enquanto andou menos de 4 passos',
  count_lt_5:   'Enquanto andou menos de 5 passos',
  count_lt_6:   'Enquanto andou menos de 6 passos',
  count_lt_7:   'Enquanto andou menos de 7 passos',
}

export function conditionHolds(
  conditionId: string,
  ctx: { col: number; goalCol: number; walls: number[]; corridorLength: number; stepsTaken: number },
): boolean {
  if (conditionId === 'path_clear') {
    const next = ctx.col + 1
    return next < ctx.corridorLength && !ctx.walls.includes(next)
  }
  if (conditionId === 'not_at_goal') {
    return ctx.col !== ctx.goalCol
  }
  if (conditionId.startsWith('count_lt_')) {
    const n = parseInt(conditionId.replace('count_lt_', ''), 10)
    return ctx.stepsTaken < n
  }
  return false
}

export function simulate(challenge: MazeChallenge, conditionId: string): SimulationResult {
  let col = 0
  let steps = 0
  let crashed = false
  const path = [0]
  const goalCol = challenge.goalCol ?? -1

  while (conditionHolds(conditionId, { col, goalCol, walls: challenge.walls, corridorLength: challenge.corridorLength, stepsTaken: steps })) {
    const nextCol = col + 1
    if (nextCol >= challenge.corridorLength) break
    if (challenge.walls.includes(nextCol)) { crashed = true; break }
    col = nextCol
    steps++
    path.push(col)
  }

  return { finalCol: col, crashed, path }
}
