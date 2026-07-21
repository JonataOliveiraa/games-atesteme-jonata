import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  { id: 1, name: 'Primeira Montagem', timeLimit: 30, missingParts: ['head', 'left_arm'] },
  { id: 2, name: 'Montagem Dupla',    timeLimit: 40, missingParts: ['head', 'body', 'right_arm', 'left_leg'] },
  { id: 3, name: 'Robô Completo',     timeLimit: 55, missingParts: ['head', 'body', 'left_arm', 'right_arm', 'left_leg', 'right_leg'] },
  { id: 4, name: 'Montagem Tripla',    timeLimit: 50, missingParts: ['head', 'body', 'right_arm'] },
  { id: 5, name: 'Seja rápido agora',     timeLimit: 23, missingParts: ['head', 'body', 'left_arm', 'right_arm', 'left_leg', 'right_leg'] },
];