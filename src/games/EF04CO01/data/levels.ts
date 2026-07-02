import type { BattleLevel } from "../types";

export const LEVELS: BattleLevel[] = [
  {
    level: 1,
    title: "Encontre a Célula",
    objective: "Toque na célula correta da grade de coordenadas!",
    detail: "Uma coordenada será exibida (ex: B-3). Toque na célula correspondente na grade.",
    tip: "Letras = linhas (A, B, C, D) · Números = colunas (1, 2, 3, 4)",
    timeLimit: 35,
    gridSize: 4,
    n1Targets: ["A-1", "B-3", "C-2", "D-4", "A-3"],
  },
  {
    level: 2,
    title: "Qual é a Coordenada?",
    objective: "Descubra a coordenada do objeto na grade!",
    detail: "Um objeto aparece na grade. Escolha a opção de coordenada correta entre as 4 alternativas.",
    tip: "Primeiro veja a linha (letra), depois a coluna (número).",
    timeLimit: 45,
    gridSize: 4,
    n2Objects: [
      { pos: { row: 0, col: 0 }, emoji: "🌟", options: ["A-1", "B-3", "C-2", "D-4"], correct: "A-1" },
      { pos: { row: 0, col: 2 }, emoji: "💎", options: ["A-2", "A-3", "B-1", "C-3"], correct: "A-3" },
      { pos: { row: 1, col: 1 }, emoji: "🗺️", options: ["B-1", "B-2", "C-3", "A-4"], correct: "B-2" },
      { pos: { row: 2, col: 3 }, emoji: "⚓", options: ["C-4", "D-3", "A-2", "B-4"], correct: "C-4" },
      { pos: { row: 2, col: 0 }, emoji: "🏆", options: ["D-1", "C-1", "A-3", "B-2"], correct: "C-1" },
    ],
  },
  {
    level: 3,
    title: "Batalha das Coordenadas",
    objective: "Encontre todos os navios escondidos na grade 5×5!",
    detail: "Clique nas células para atacar. Encontre os 4 navios antes do tempo acabar!",
    tip: "Use as coordenadas para registrar onde você já atacou.",
    timeLimit: 55,
    gridSize: 5,
    ships: [
      { row: 0, col: 0 },
      { row: 1, col: 2 },
      { row: 3, col: 1 },
      { row: 4, col: 3 },
    ],
  },
];
