export type ListLevelNumber = 1 | 2 | 3;
export type Suit = "copas" | "ouros" | "paus" | "espadas" | "coringa";
export type LevelMode = "insert" | "replace" | "mixed";

export type CardData = {
  id: string;
  label: string;
  value: number;
  suit: Suit;
  joker?: boolean;
};

export type ListLevel = {
  level: ListLevelNumber;
  title: string;
  objective: string;
  instruction: string;
  mode: LevelMode;
  timeLimit: number;
  initialCards: CardData[];
  actionCards: CardData[];
  targetValue?: number;
  expectedCards: CardData[];
  hint: string;
  successMessage: string;
};
