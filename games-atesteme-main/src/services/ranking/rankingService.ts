import type { Game } from "../../types/game";
import type { RankingContextData, RankingPeriod, RankingResult } from "./types";
import {
  getGameRankingLocal,
  getGeneralRankingLocal,
} from "./rankingLocalService";

export function getGeneralRanking(
  data: RankingContextData,
  period: RankingPeriod
): RankingResult {
  return getGeneralRankingLocal(data, period);
}

export function getGameRanking(
  data: RankingContextData,
  game: Game,
  period: RankingPeriod
): RankingResult {
  return getGameRankingLocal(data, game, period);
}