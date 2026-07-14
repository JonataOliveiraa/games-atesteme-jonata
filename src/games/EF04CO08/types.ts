export type SourceLevelNumber = 1 | 2 | 3;

export interface CriteriaResults {
  author: boolean;
  date: boolean;
  site: boolean;
  language: boolean;
  sources: boolean;
}

export interface SimulatedPage {
  title: string;
  url: string;
  author: string | null;
  date: string;
  siteType: "official" | "educational" | "blog" | "unknown";
  language: "clear" | "sensational" | "vague";
  citesSources: boolean;
  snippet: string;
  credibilityScore: number;
  criteriaResults: CriteriaResults;
  label?: string;
  summary?: string;
}

export interface N2Comparison {
  pageA: SimulatedPage;
  pageB: SimulatedPage;
  correct: "A" | "B";
}

export interface N3Ranking {
  pages: SimulatedPage[];
  correctOrder: string[];
}

export interface SourceLevel {
  level: SourceLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  n1Pages?: SimulatedPage[];
  n2Comparisons?: N2Comparison[];
  n3Rankings?: N3Ranking[];
}

export const CRITERIA: Array<{ id: keyof CriteriaResults; label: string }> = [
  { id: "author",   label: "Tem autor identificado?" },
  { id: "date",     label: "Data recente (< 5 anos)?" },
  { id: "site",     label: "Site oficial/educativo?" },
  { id: "language", label: "Linguagem clara e objetiva?" },
  { id: "sources",  label: "Cita outras fontes?" },
];
