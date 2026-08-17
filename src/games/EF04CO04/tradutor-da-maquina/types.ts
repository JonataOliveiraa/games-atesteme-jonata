export type TranslatorLevelNumber = 1 | 2 | 3;
export type TranslatorLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export const LETTER_CODE: Record<TranslatorLetter, string> = {
  A: "000",
  B: "001",
  C: "010",
  D: "011",
  E: "100",
  F: "101",
  G: "110",
  H: "111",
};

export interface N1Round {
  letter: TranslatorLetter;
  options: string[];
  correct: string;
}

export interface N2Word {
  word: string;
  letters: TranslatorLetter[];
  codes: string[];
}

export interface N3Word {
  code: string;
  groups: string[];
  letters: TranslatorLetter[];
  options: string[][];
}

export interface TranslatorLevel {
  level: TranslatorLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  n1Rounds?: N1Round[];
  n2Words?: N2Word[];
  n3Words?: N3Word[];
}
