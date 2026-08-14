export type StudioLevelNumber = 1 | 2 | 3;
export type FormatId = "drawing" | "text" | "audio" | "photo";

export interface FormatOption {
  id: FormatId;
  label: string;
  icon: string;
  color: number;
}

export interface FormatMatchTask {
  id: string;
  goal: string;
  correctFormat: FormatId;
  hint: string;
}

export interface DrawingChallenge {
  type: "drawing";
  theme: string;
  instruction: string;
  colors: number[];
  minStrokes: number;
}

export interface TextChallenge {
  type: "text";
  theme: string;
  instruction: string;
  wordBank: string[];
  minWords: number;
}

export type CreativeChallenge = DrawingChallenge | TextChallenge;

export interface CreationCycle {
  goal: string;
  correctFormat: FormatId;
  formatOptions: FormatId[];
  challenge: CreativeChallenge;
}

export interface StudioLevel {
  level: StudioLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  formatMatchTasks?: FormatMatchTask[];
  drawChallenge?: DrawingChallenge;
  textChallenge?: TextChallenge;
  creationCycles?: CreationCycle[];
}
