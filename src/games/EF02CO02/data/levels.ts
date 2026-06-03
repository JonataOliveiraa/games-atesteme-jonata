import type { RepeatLevel } from "../types";

export const LEVELS: RepeatLevel[] = [
  {
    level: 1,
    title: "Primeiro Desfile",
    objective: "Toque 4 vezes na seta para a direita para levar o robô até a estrela.",
    timeLimit: 45,
    gridSize: { cols: 6, rows: 5 },
    start: { x: 0, y: 2 },
    direction: "right",
    goal: { x: 4, y: 2 },
    obstacles: [],
    minBlocks: 4,
  },
  {
    level: 2,
    title: "Curva do Robô",
    objective: "Use uma seta por casa para desviar dos cones e chegar à estrela.",
    timeLimit: 60,
    gridSize: { cols: 7, rows: 6 },
    start: { x: 1, y: 4 },
    direction: "up",
    goal: { x: 5, y: 1 },
    obstacles: [
      { x: 3, y: 4 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
    ],
    minBlocks: 7,
  },
  {
    level: 3,
    title: "Desfile Otimizado",
    objective: "Chegue ao palco tocando nas setas, uma casa por vez.",
    timeLimit: 75,
    gridSize: { cols: 8, rows: 6 },
    start: { x: 0, y: 5 },
    direction: "right",
    goal: { x: 7, y: 1 },
    obstacles: [
      { x: 2, y: 5 },
      { x: 2, y: 4 },
      { x: 5, y: 3 },
      { x: 5, y: 2 },
    ],
    minBlocks: 11,
  },
];
