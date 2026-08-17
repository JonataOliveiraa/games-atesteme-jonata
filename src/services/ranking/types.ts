import type { Game } from "../../types/game";
import type { UserGameHistory } from "../../types/platform";

export type RankingPeriod = "day" | "week" | "month" | "all";

export type RankingScope = "general" | "game";

export interface RankingEntry {
  position: number;
  playerName: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface CurrentRankingUser {
  name: string;
  avatar: string;
}

export interface RankingContextData {
  games: Game[];
  history: UserGameHistory[];
  currentPoints: number;
  currentUser: CurrentRankingUser;
}

export interface RankingResult {
  entries: RankingEntry[];
  currentUserEntry: RankingEntry | null;
}

export interface RankingGameOption {
  id: string;
  title: string;
  category: string;
  icon: string;
  slug: string;
}
