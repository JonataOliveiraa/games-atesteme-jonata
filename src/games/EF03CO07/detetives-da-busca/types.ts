export type SearchLevelNumber = 1 | 2 | 3;

export type FilterId = "all" | "images" | "videos" | "sites" | "news" | "kids";

export type ResultId =
  | "penguin-info"
  | "penguin-cartoon"
  | "ice-cream"
  | "jaguar-photo"
  | "car-brand"
  | "jaguar-video"
  | "moon-encyclopedia"
  | "moon-myth"
  | "moon-video";

export type StrategyId = "specific-words" | "first-result" | "short-word";

export interface KeywordOption {
  id: string;
  label: string;
  quality: "weak" | "ok" | "best";
}

export interface FilterOption {
  id: FilterId;
  label: string;
}

export interface SearchResult {
  id: ResultId;
  title: string;
  source: string;
  snippet: string;
  type: FilterId;
  baseRank: number;
  tags: string[];
  explanation: string;
}

export interface StrategyOption {
  id: StrategyId;
  label: string;
}

export interface SearchLevel {
  level: SearchLevelNumber;
  title: string;
  objective: string;
  timeLimit: number;
  keywords: KeywordOption[];
  filters: FilterOption[];
  results: SearchResult[];
  correctKeywordId: string;
  correctFilterId: FilterId;
  correctResultId: ResultId;
  strategyOptions?: StrategyOption[];
  correctStrategyId?: StrategyId;
  hint: string;
  successMessage: string;
}
