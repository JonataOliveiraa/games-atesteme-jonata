import type { TranslatorLevel } from "../types";
import { LETTER_CODE } from "../types";

export { LETTER_CODE };

export const LEVELS: TranslatorLevel[] = [
  {
    level: 1,
    title: "Letra → Binário",
    objective: "Descubra o código binário de cada letra!",
    detail: "Use a tabela de referência para encontrar o código de 3 bits que representa cada letra.",
    tip: "Cada letra tem um código único de 3 dígitos (0 ou 1).",
    timeLimit: 35,
    n1Rounds: [
      { letter: "A", correct: "000", options: ["000", "001", "010"] },
      { letter: "C", correct: "010", options: ["000", "010", "111"] },
      { letter: "E", correct: "100", options: ["100", "001", "011"] },
      { letter: "G", correct: "110", options: ["110", "010", "100"] },
      { letter: "D", correct: "011", options: ["011", "000", "101"] },
    ],
  },
  {
    level: 2,
    title: "Palavra → Binário",
    objective: "Traduza cada letra da palavra para binário!",
    detail: "Cada palavra tem 3 letras. Encontre o código de cada letra em sequência para completar a tradução.",
    tip: "Observe a letra destacada no teclado e encontre seu código.",
    timeLimit: 45,
    n2Words: [
      { word: "CAB", letters: ["C", "A", "B"], codes: ["010", "000", "001"] },
      { word: "BED", letters: ["B", "E", "D"], codes: ["001", "100", "011"] },
      { word: "GAB", letters: ["G", "A", "B"], codes: ["110", "000", "001"] },
    ],
  },
  {
    level: 3,
    title: "Binário → Letra",
    objective: "Decodifique os grupos binários e descubra as letras!",
    detail: "Agora é o inverso! Veja o código binário no visor e descubra qual letra cada grupo representa.",
    tip: "Use a tabela de referência para converter cada grupo de 3 bits em uma letra.",
    timeLimit: 55,
    n3Words: [
      {
        code: "011 000 110",
        groups: ["011", "000", "110"],
        letters: ["D", "A", "G"],
        options: [
          ["D", "A", "C"],
          ["A", "B", "E"],
          ["G", "F", "H"],
        ],
      },
      {
        code: "010 100 101",
        groups: ["010", "100", "101"],
        letters: ["C", "E", "F"],
        options: [
          ["C", "A", "D"],
          ["E", "B", "G"],
          ["F", "H", "A"],
        ],
      },
    ],
  },
];
