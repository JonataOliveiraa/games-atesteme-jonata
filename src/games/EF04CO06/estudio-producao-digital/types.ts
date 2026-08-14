export type StudioLevelNumber = 1 | 2 | 3;
export type FormatType = "text" | "slides" | "video";

export interface N1Briefing {
  text: string;
  correct: FormatType;
}

export interface N2Task {
  format: FormatType;
  items: string[];
  /** Sequence of display-index positions the player must tap in order */
  correctOrder: number[];
}

export interface N3Production {
  type: FormatType;
  items: string[];
  /** Indices of items that contain errors (marked with ❌) */
  errors: number[];
}

export interface StudioProductionLevel {
  level: StudioLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  n1Briefings?: N1Briefing[];
  n2Tasks?: N2Task[];
  n3Productions?: N3Production[];
}
