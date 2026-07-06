import type { BuildingLevel } from "../types";

export const LEVELS: BuildingLevel[] = [
  {
    level: 1,
    title: "Laço Simples",
    objective: "Quantas janelas o limpador precisa limpar? Escolha o número correto!",
    detail: "O limpador de janelas vai limpar todas as janelas de um andar. Conte as janelas e escolha o número certo para o laço.",
    tip: "Conte as janelas sujas no prédio e escolha o número igual.",
    timeLimit: 35,
    n1Rounds: [
      { floors: 1, windows: 3, options: [2, 3, 4], correct: 3 },
      { floors: 1, windows: 4, options: [3, 4, 5], correct: 4 },
      { floors: 1, windows: 5, options: [4, 5, 6], correct: 5 },
    ],
  },
  {
    level: 2,
    title: "Laço Aninhado",
    objective: "Programe o limpador: ajuste quantos andares e janelas por andar!",
    detail: "O prédio tem vários andares. Use dois laços: o externo percorre os andares, o interno percorre as janelas de cada andar.",
    tip: "Conte os andares (laço externo, azul) e as janelas por andar (laço interno, verde).",
    timeLimit: 45,
    n2Rounds: [
      { floors: 2, windows: 4, label: "2 andares, 4 janelas por andar" },
      { floors: 3, windows: 3, label: "3 andares, 3 janelas por andar" },
    ],
  },
  {
    level: 3,
    title: "Eficiência dos Laços",
    objective: "Algumas janelas já estão limpas! Quantas vão ser limpas pelo algoritmo?",
    detail: "O limpador percorre TODAS as janelas, mas as que já estão limpas ficam com brilho dourado. Programe os laços e preveja quantas serão limpas.",
    tip: "Some todas as janelas e subtraia as que já estão limpas (marcadas em dourado).",
    timeLimit: 55,
    n3Rounds: [
      {
        floors: 4,
        windows: 5,
        alreadyClean: [[0, 2], [1, 4], [3, 0], [3, 3]],
        totalDirty: 16,
        options: [12, 15, 16, 20],
        correct: 16,
      },
      {
        floors: 3,
        windows: 4,
        alreadyClean: [[0, 1], [1, 3], [2, 0]],
        totalDirty: 9,
        options: [8, 9, 10, 12],
        correct: 9,
      },
    ],
  },
];
