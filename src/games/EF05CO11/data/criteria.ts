import type { CriterionDef, CriterionId } from '../types'

export const CRITERIA: CriterionDef[] = [
  { id: 'levar', label: 'Dá pra levar', hint: 'cabe na mochila e vai junto' },
  { id: 'rapido', label: 'Fica pronto rápido', hint: 'não demora nada' },
  { id: 'criar', label: 'Serve pra criar', hint: 'desenhar, escrever, gravar' },
  { id: 'falar', label: 'Muita gente vê', hint: 'todo mundo junto, ao mesmo tempo' },
  { id: 'guardar', label: 'Guarda muita coisa', hint: 'cabe muito arquivo dentro' },
  { id: 'custo', label: 'Custa pouco', hint: 'não é caro' },
]

export const CRITERION: Record<CriterionId, CriterionDef> = CRITERIA.reduce(
  (acc, def) => ({ ...acc, [def.id]: def }),
  {} as Record<CriterionId, CriterionDef>,
)