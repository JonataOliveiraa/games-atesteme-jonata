import type { LevelConfig } from '../types'
import { MISSIONS_L1, MISSIONS_L2, MISSIONS_L3 } from './missions'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    availableApps: ['camera', 'calculadora'],
    missions: MISSIONS_L1,
    timeLimit: 20,
  },
  {
    level: 2,
    availableApps: ['camera', 'calculadora', 'desenho', 'gravador'],
    missions: MISSIONS_L2,
    timeLimit: 25,
  },
  {
    level: 3,
    availableApps: ['camera', 'calculadora', 'desenho', 'gravador', 'navegador', 'player'],
    missions: MISSIONS_L3,
    timeLimit: 30,
  },
]
