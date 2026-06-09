import type { LevelConfig } from '../types'
import { MISSIONS_L1, MISSIONS_L2, MISSIONS_L3 } from './missions'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    availableApps: ['relogio', 'calculadora'],
    missions: MISSIONS_L1,
    timeLimit: 25,
  },
  {
    level: 2,
    availableApps: ['relogio', 'calculadora', 'pasta', 'gravador'],
    missions: MISSIONS_L2,
    timeLimit: 35,
  },
  {
    level: 3,
    availableApps: ['relogio', 'calculadora', 'pasta', 'gravador', 'desenho', 'player'],
    missions: MISSIONS_L3,
    timeLimit: 45,
  },
]
