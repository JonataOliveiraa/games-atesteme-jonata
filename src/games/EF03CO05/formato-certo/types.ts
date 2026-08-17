export type FormatId = "date" | "pixels" | "text";

export type DataPieceId =
  | "day-18"
  | "month-june"
  | "year-2026"
  | "color-red"
  | "color-blue"
  | "color-yellow"
  | "letter-a"
  | "dash"
  | "number-1"
  | "number-2"
  | "extra-star"
  | "extra-place"
  | "extra-street";

export type SlotId =
  | "day"
  | "month"
  | "year"
  | "pixel-1"
  | "pixel-2"
  | "pixel-3"
  | "char-1"
  | "char-2"
  | "char-3"
  | "char-4";

export interface FormatOption {
  id: FormatId;
  title: string;
  subtitle: string;
  color: number;
}

export interface DataPiece {
  id: DataPieceId;
  label: string;
  shortLabel: string;
  color: number;
  visual: "calendar" | "paint" | "letter" | "place" | "star";
}

export interface FormatSlot {
  id: SlotId;
  label: string;
  accepts: DataPieceId;
}

export interface FormatLevel {
  level: 1 | 2 | 3;
  title: string;
  scenario: string;
  instruction: string;
  timeLimit: number;
  requiredFormat: FormatId;
  slots: FormatSlot[];
  pieces: DataPiece[];
  resultTitle: string;
  resultText: string;
  successMessage: string;
  hint: string;
  mode: "date" | "pixels" | "text";
}
