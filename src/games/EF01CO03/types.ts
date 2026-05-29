export type ActionType =
  | "start"
  | "prepare"
  | "build"
  | "test"
  | "finish";

export interface AlgorithmCard {
  id: string;
  label: string;
  assetKey: string;
  type: ActionType;
  description: string;
}

export interface AlgorithmLevel {
  level: 1 | 2 | 3;
  title: string;
  objective: string;
  themeAssetKey: string;
  timeLimit: number;
  cards: AlgorithmCard[];
  correctOrder: string[];
  distractors?: AlgorithmCard[];
  successMessage: string;
}
