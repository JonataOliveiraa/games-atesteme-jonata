export type ActionType =
  | "start"
  | "prepare"
  | "build"
  | "test"
  | "finish";

export interface AlgorithmCard {
  id: string;
  label: string;
  emoji: string;
  type: ActionType;
  description: string;
}

export interface AlgorithmLevel {
  level: 1 | 2 | 3;
  title: string;
  objective: string;
  themeEmoji: string;
  timeLimit: number;
  cards: AlgorithmCard[];
  correctOrder: string[];
  distractors?: AlgorithmCard[];
  successMessage: string;
}
