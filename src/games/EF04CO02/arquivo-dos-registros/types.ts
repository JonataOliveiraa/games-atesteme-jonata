export type ArchiveLevelNumber = 1 | 2 | 3;

export interface PersonRecord {
  id: string;
  emoji: string;
  Nome: string;
  Cidade: string;
  Hobby: string;
  Idade: string;
  Animal: string;
}

export interface N1Question {
  field: keyof Omit<PersonRecord, "id" | "emoji">;
  value: string;
  recordIds: string[];
  correctId: string;
}

export interface N2Question {
  recordId: string;
  field: keyof Omit<PersonRecord, "id" | "emoji">;
  question: string;
  correct: string;
  options: [string, string, string, string];
}

export interface N3Question {
  question: string;
  correct: string;
  options: [string, string, string, string];
  explanation: string;
}

export interface ArchiveLevel {
  level: ArchiveLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  n1Questions?: N1Question[];
  n2Questions?: N2Question[];
  n3Questions?: N3Question[];
}
