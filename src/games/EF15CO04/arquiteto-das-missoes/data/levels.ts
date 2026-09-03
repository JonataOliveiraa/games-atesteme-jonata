import type { IconId, LevelDef, MissionDef } from '../types'
import { CAFE, FESTA, HORTA } from './missions'

/**
 * Um nível, uma missão. O pedido cresce de 2 para 4 partes — é essa a subida
 * de dificuldade: quanto maior o pedido, mais trabalho dá parti-lo.
 */
export const LEVELS: LevelDef[] = [
    { level: 1, name: 'Café da Manhã', missions: [CAFE] },
    { level: 2, name: 'Festa da Escola', missions: [FESTA] },
    { level: 3, name: 'Horta da Escola', missions: [HORTA] },
]

/**
 * A ordem dos frames no sheet da missão. É a mesma regra para todas:
 * objetivo, partes, distratoras, e então os passos na ordem das partes.
 */
export function iconOrder(mission: MissionDef): IconId[] {
    return [
        mission.goalIcon,
        ...mission.parts.map(part => part.icon),
        ...mission.decoys.map(decoy => decoy.icon),
        ...mission.parts.flatMap(part => part.steps.map(step => step.icon)),
    ]
}

export const missionsOf = (level: LevelDef) => level.missions
