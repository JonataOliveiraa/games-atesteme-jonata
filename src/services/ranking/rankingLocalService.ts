import type { Game } from "../../types/game";
import type { UserGameHistory } from "../../types/platform";
import type {
  CurrentRankingUser,
  RankingContextData,
  RankingEntry,
  RankingPeriod,
  RankingResult,
} from "./types";

type MockPlayer = {
  name: string;
  avatar: string;
  baseScore: number;
};

const MOCK_PLAYERS: MockPlayer[] = [
  { name: "JoãoMaster", avatar: "👑", baseScore: 320 },
  { name: "MariaGamer", avatar: "⭐", baseScore: 295 },
  { name: "PedroPro", avatar: "🎯", baseScore: 270 },
  { name: "AnaNinja", avatar: "🥷", baseScore: 250 },
  { name: "LucasFlash", avatar: "⚡", baseScore: 230 },
  { name: "CarlaStorm", avatar: "🌪️", baseScore: 210 },
  { name: "RafaelGênio", avatar: "🧠", baseScore: 190 },
  { name: "BeatrizSpeed", avatar: "🏃", baseScore: 170 },
  { name: "ThiagoFoco", avatar: "🎯", baseScore: 150 },
  { name: "FernandaÁgil", avatar: "🔥", baseScore: 130 },
];

function getPeriodStart(period: RankingPeriod): number | null {
  const now = new Date();

  switch (period) {
    case "day": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start.getTime();
    }
    case "week": {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return start.getTime();
    }
    case "month": {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      return start.getTime();
    }
    case "all":
    default:
      return null;
  }
}

function filterHistoryByPeriod(
  history: UserGameHistory[],
  period: RankingPeriod
): UserGameHistory[] {
  const start = getPeriodStart(period);

  if (start === null) {
    return history;
  }

  return history.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    return createdAt >= start;
  });
}

function sumPoints(history: UserGameHistory[]): number {
  return history.reduce((total, item) => total + item.pointsEarned, 0);
}

function getUserGeneralScore(
  history: UserGameHistory[],
  currentPoints: number,
  period: RankingPeriod
): number {
  if (period === "all") {
    return Math.max(0, currentPoints);
  }

  const filteredHistory = filterHistoryByPeriod(history, period);
  return Math.max(0, sumPoints(filteredHistory));
}

function getUserGameScore(
  history: UserGameHistory[],
  gameId: string,
  period: RankingPeriod
): number {
  const filteredHistory = filterHistoryByPeriod(history, period);
  const gameHistory = filteredHistory.filter((item) => item.gameId === gameId);

  return Math.max(0, sumPoints(gameHistory));
}

function createStableNumber(seed: string): number {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function buildMockEntries(
  scopeKey: string,
  period: RankingPeriod
): RankingEntry[] {
  const periodWeight: Record<RankingPeriod, number> = {
    day: 20,
    week: 45,
    month: 90,
    all: 140,
  };

  return MOCK_PLAYERS.map((player) => {
    const variationSeed = `${scopeKey}-${period}-${player.name}`;
    const variation = createStableNumber(variationSeed) % periodWeight[period];

    return {
      position: 0,
      playerName: player.name,
      score: player.baseScore + variation,
      avatar: player.avatar,
      isCurrentUser: false,
    };
  });
}

function buildCurrentUserEntry(
  currentUser: CurrentRankingUser,
  score: number
): RankingEntry {
  return {
    position: 0,
    playerName: currentUser.name,
    score,
    avatar: currentUser.avatar,
    isCurrentUser: true,
  };
}

function sortAndPosition(entries: RankingEntry[]): RankingResult {
  const sorted = [...entries]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));

  const currentUserEntry =
    sorted.find((entry) => entry.isCurrentUser) ?? null;

  return {
    entries: sorted,
    currentUserEntry,
  };
}

export function getGeneralRankingLocal(
  data: RankingContextData,
  period: RankingPeriod
): RankingResult {
  const userScore = getUserGeneralScore(
    data.history,
    data.currentPoints,
    period
  );

  const mockEntries = buildMockEntries("general", period);
  const currentUserEntry = buildCurrentUserEntry(data.currentUser, userScore);

  return sortAndPosition([...mockEntries, currentUserEntry]);
}

export function getGameRankingLocal(
  data: RankingContextData,
  game: Game,
  period: RankingPeriod
): RankingResult {
  const userScore = getUserGameScore(data.history, game.id, period);

  const mockEntries = buildMockEntries(game.id, period).map((entry) => ({
    ...entry,
    score: entry.score + game.points,
  }));

  const currentUserEntry = buildCurrentUserEntry(data.currentUser, userScore);

  return sortAndPosition([...mockEntries, currentUserEntry]);
}