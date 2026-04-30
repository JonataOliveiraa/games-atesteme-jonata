import type { MissionConfig, LevelConfig } from '../types'

const MISSION_FOLD_PAPER: MissionConfig = {
  id: 'mission-fold-paper',
  name: 'Dobrar um Barquinho',
  description: 'Siga os passos para dobrar um barquinho de papel!',
  theme: 'origami',
  objects: [
    { id: 'paper', x: 600, y: 400, frame: 'paper', state: 'initial' },
    { id: 'fold-line-1', x: 580, y: 380, frame: 'fold-line', state: 'initial' },
    { id: 'fold-line-2', x: 620, y: 420, frame: 'fold-line', state: 'initial' },
  ],
  steps: [
    {
      stepNumber: 1,
      action: {
        id: 'dobrar-centro',
        description: 'Dobre o papel ao meio',
        targetObjectId: 'paper',
      },
    },
    {
      stepNumber: 2,
      action: {
        id: 'marcar-dobra-1',
        description: 'Marque a primeira dobra',
        targetObjectId: 'fold-line-1',
      },
    },
    {
      stepNumber: 3,
      action: {
        id: 'marcar-dobra-2',
        description: 'Marque a segunda dobra',
        targetObjectId: 'fold-line-2',
      },
    },
  ],
  timeLimit: 60,
  lives: 2,
}

export const LEVELS: LevelConfig[] = [
  { level: 1, mission: MISSION_FOLD_PAPER },
]