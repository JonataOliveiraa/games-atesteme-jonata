import type { AtelierLevel, BinaryGrid, N2Message, N3Color } from "../types";

export const LEVELS: AtelierLevel[] = [
  {
    level: 1,
    title: "Oficina Binária",
    objective: "Reproduza o padrão de pixels na grade clicável!",
    detail: "Cada célula branca = 0, célula preta = 1. Clique para alternar.",
    tip: "Compare linha por linha com o padrão-alvo à esquerda.",
    timeLimit: 35,
  },
  {
    level: 2,
    title: "Oficina ASCII",
    objective: "Decodifique a mensagem binária em letras!",
    detail: "Use a tabela de referência (A=000...H=111) para descobrir as letras.",
    tip: "Cada grupo de 3 dígitos representa uma letra.",
    timeLimit: 45,
  },
  {
    level: 3,
    title: "Oficina RGB",
    objective: "Misture as cores para criar a cor pedida!",
    detail: "Ajuste os canais Vermelho (R), Verde (G) e Azul (B) usando os controles.",
    tip: "A prévia mostra a cor resultante em tempo real.",
    timeLimit: 55,
  },
];

export const PATTERNS_N1: BinaryGrid[] = [
  // Padrão 1: xadrez simples
  [
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
  ],
  // Padrão 2: cruz
  [
    [0, 0, 1, 0],
    [0, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
  ],
];

// Codificação ASCII simplificada: A=000, B=001, C=010, D=011, E=100, F=101, G=110, H=111
export const ASCII_MAP: Record<string, string> = {
  "000": "A",
  "001": "B",
  "010": "C",
  "011": "D",
  "100": "E",
  "101": "F",
  "110": "G",
  "111": "H",
};

export const MESSAGES_N2: N2Message[] = [
  {
    encoded: "010  000  001",
    groups: ["010", "000", "001"],
    correctLetters: ["C", "A", "B"],
    allOptions: [
      ["C", "A", "E"],
      ["A", "B", "G"],
      ["B", "D", "F"],
    ],
  },
  {
    encoded: "001  100  011",
    groups: ["001", "100", "011"],
    correctLetters: ["B", "E", "D"],
    allOptions: [
      ["B", "A", "F"],
      ["E", "C", "H"],
      ["D", "G", "A"],
    ],
  },
  {
    encoded: "110  000  001",
    groups: ["110", "000", "001"],
    correctLetters: ["G", "A", "B"],
    allOptions: [
      ["G", "E", "C"],
      ["A", "D", "H"],
      ["B", "F", "G"],
    ],
  },
];

export const TARGET_COLORS_N3: N3Color[] = [
  { r: 255, g: 0,   b: 0,   name: "Vermelho" },
  { r: 0,   g: 0,   b: 255, name: "Azul" },
  { r: 255, g: 255, b: 0,   name: "Amarelo" },
  { r: 128, g: 0,   b: 128, name: "Roxo" },
];
