export type InfoPieceId =
  | "date-day"
  | "date-month"
  | "date-year"
  | "date-place-extra"
  | "date-color-extra"
  | "address-street"
  | "address-number"
  | "address-neighborhood"
  | "address-city"
  | "address-zip"
  | "address-age-extra"
  | "address-month-extra"
  | "character-name"
  | "character-age"
  | "character-city"
  | "character-color"
  | "character-pet"
  | "character-street-extra";

export type FieldId =
  | "day"
  | "month"
  | "year"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "zip"
  | "name"
  | "age"
  | "favorite-color"
  | "pet";

export interface InfoPiece {
  id: InfoPieceId;
  label: string;
  shortLabel: string;
  color: number;
}

export interface InfoField {
  id: FieldId;
  label: string;
  accepts: InfoPieceId;
}

export interface InfoLevel {
  level: 1 | 2 | 3;
  title: string;
  instruction: string;
  timeLimit: number;
  fields: InfoField[];
  pieces: InfoPiece[];
  resultTitle: string;
  resultText: string;
  successMessage: string;
  hint: string;
  mode: "invite" | "address" | "character";
}
