export type BattleLevelNumber = 1 | 2 | 3;
export type CellState = "untouched" | "hit" | "miss";

export interface GridCell {
  row: number;
  col: number;
  state: CellState;
  hasShip?: boolean;
}

export interface CoordTarget {
  row: number;
  col: number;
  emoji?: string;
  options?: string[];
  correct?: string;
}

export interface BattleLevel {
  level: BattleLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  gridSize: number;
  /** N1: list of coord strings like "A-1" */
  n1Targets?: string[];
  /** N2: objects with position, emoji, MCQ options, correct answer */
  n2Objects?: Array<{
    pos: { row: number; col: number };
    emoji: string;
    options: string[];
    correct: string;
  }>;
  /** N3: ship positions (0-indexed) */
  ships?: Array<{ row: number; col: number }>;
}
