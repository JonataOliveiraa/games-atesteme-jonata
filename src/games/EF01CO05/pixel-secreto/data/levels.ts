import type { PixelLevel } from "../types";

export const LEVELS: PixelLevel[] = [
  {
    level: 1,
    title: "Coração Secreto",
    objective: "Use a legenda para revelar a imagem escondida.",
    timeLimit: 30,
    imageName: "coração",
    palette: [
      { code: "A", label: "Rosa", color: 0xf472b6 },
      { code: "B", label: "Branco", color: 0xffffff, textColor: "#334155" },
    ],
    grid: [
      ["B", "A", "B", "A", "B"],
      ["A", "A", "A", "A", "A"],
      ["A", "A", "A", "A", "A"],
      ["B", "A", "A", "A", "B"],
      ["B", "B", "A", "B", "B"],
    ],
    hints: [
      { row: 0, col: 1 },
      { row: 0, col: 3 },
    ],
  },
  {
    level: 2,
    title: "Flor Codificada",
    objective: "Decodifique a matriz usando 3 códigos de cor.",
    timeLimit: 40,
    imageName: "flor",
    palette: [
      { code: "A", label: "Amarelo", color: 0xfacc15 },
      { code: "B", label: "Rosa", color: 0xfb7185 },
      { code: "C", label: "Verde", color: 0x22c55e },
    ],
    grid: [
  ["", "", "B", "B", "B", "", ""],
  ["", "B", "B", "A", "B", "B", ""],
  ["B", "B", "A", "A", "A", "B", "B"],
  ["", "B", "B", "A", "B", "B", ""],
  ["", "", "C", "C", "C", "", ""],
  ["", "", "C", "C", "C", "", ""],
],
  },
  {
    level: 3,
    title: "Robô Pixel",
    objective: "Revele a imagem sem dicas e complete a decodificação.",
    timeLimit: 50,
    imageName: "robô",
    palette: [
      { code: "A", label: "Azul", color: 0x38bdf8 },
      { code: "B", label: "Roxo", color: 0xa855f7 },
      { code: "C", label: "Cinza", color: 0x94a3b8 },
      { code: "D", label: "Preto", color: 0x1e293b },
    ],
    grid: [
      ["", "", "D", "", "", "D", "", ""],
      ["", "A", "A", "A", "A", "A", "A", ""],
      ["A", "A", "D", "A", "A", "D", "A", "A"],
      ["A", "A", "A", "B", "B", "A", "A", "A"],
      ["A", "C", "A", "A", "A", "A", "C", "A"],
      ["", "A", "A", "A", "A", "A", "A", ""],
      ["", "", "C", "", "", "C", "", ""],
      ["", "C", "C", "", "", "C", "C", ""],
    ],
  },
];
