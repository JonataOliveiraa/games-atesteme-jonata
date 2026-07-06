export type AtelierLevelNumber = 1 | 2 | 3;
export type BinaryCell = 0 | 1;
export type BinaryGrid = BinaryCell[][];

export interface AtelierLevel {
  level: AtelierLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
}

export interface N1Data {
  patterns: BinaryGrid[];
}

export interface N2Message {
  encoded: string;
  groups: string[];
  correctLetters: string[];
  allOptions: string[][];
}

export interface N3Color {
  r: number;
  g: number;
  b: number;
  name: string;
}
