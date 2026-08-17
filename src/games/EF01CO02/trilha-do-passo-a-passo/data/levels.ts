import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Primeiros Encaixes',
    objective: 'Faltam duas peças em cada robô. Encaixe na ordem mostrada!',
    phases: [
      { id: 1, name: 'Cabeça e braço',  timeLimit: 25, missingParts: ['head', 'left_arm'] },
      { id: 2, name: 'Corpo e perna',   timeLimit: 25, missingParts: ['body', 'left_leg'] },
      { id: 3, name: 'Braço e cabeça',  timeLimit: 22, missingParts: ['right_arm', 'head'] },
      { id: 4, name: 'Corpo e perna',   timeLimit: 22, missingParts: ['body', 'right_leg'] },
    ],
  },
  {
    level: 2,
    title: 'Montagem Dupla',
    objective: 'Agora são quatro peças, mas só três aparecem por vez.',
    phases: [
      { id: 1, name: 'Meio robô',     timeLimit: 45, missingParts: ['body', 'head', 'left_arm', 'left_leg'] },
      { id: 2, name: 'De pé',         timeLimit: 45, missingParts: ['body', 'left_leg', 'right_leg', 'head'] },
      { id: 3, name: 'Braços abertos', timeLimit: 42, missingParts: ['body', 'right_arm', 'left_arm', 'head'] },
      { id: 4, name: 'Lado direito',  timeLimit: 42, missingParts: ['body', 'head', 'right_arm', 'right_leg'] },
    ],
  },
  {
    level: 3,
    title: 'Robô Completo',
    objective: 'Cuidado com os lados! Esquerdo e direito são peças diferentes.',
    phases: [
      { id: 1, name: 'Quase inteiro', timeLimit: 55, missingParts: ['body', 'head', 'left_arm', 'right_arm', 'left_leg'] },
      { id: 2, name: 'Falta um braço', timeLimit: 55, missingParts: ['body', 'head', 'left_leg', 'right_leg', 'right_arm'] },
      { id: 3, name: 'Do zero',       timeLimit: 65, missingParts: ['body', 'head', 'left_arm', 'right_arm', 'left_leg', 'right_leg'] },
      { id: 4, name: 'De baixo pra cima', timeLimit: 65, missingParts: ['body', 'left_leg', 'right_leg', 'left_arm', 'right_arm', 'head'] },
    ],
  },
];