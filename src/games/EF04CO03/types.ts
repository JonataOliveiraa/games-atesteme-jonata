export type LoopLevelNumber = 1 | 2 | 3;

export interface N1Round {
  floors: number;
  windows: number;
  options: number[];
  correct: number;
}

export interface N2Round {
  floors: number;
  windows: number;
  label: string;
}

export interface N3Round {
  floors: number;
  windows: number;
  alreadyClean: [number, number][];
  totalDirty: number;
  options: number[];
  correct: number;
}

export interface BuildingLevel {
  level: LoopLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  n1Rounds?: N1Round[];
  n2Rounds?: N2Round[];
  n3Rounds?: N3Round[];
}
