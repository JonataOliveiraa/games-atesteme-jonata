export type GameEventType =
  | "GAME_OVER"
  | "PHASE_COMPLETED"
  | "GAME_COMPLETED"
  | "CORRECT_ANSWER"
  | "WRONG_ANSWER"
  | "STREAK_BONUS"
  | "NO_ERROR_BONUS"
  | "BLOCKED"
  | "UNLOCKED_BY_POINTS"
  | "UNLOCKED_BY_TIME"
  | "BOUGHT_EXTRA_LIFE"
  | "LOST_LIFE";

export type GameEventPayload = {
  type:
    | "GAME_OVER"
    | "PHASE_COMPLETED"
    | "GAME_COMPLETED"
    | "CORRECT_ANSWER"
    | "WRONG_ANSWER"
    | "STREAK_BONUS"
    | "NO_ERROR_BONUS";
  gameId: string;
  stage: number;
  pointsEarned: number;
};

export type UserGameHistory = {
  gameId: string;
  stage: number;
  eventType: GameEventType;
  pointsEarned: number;
  createdAt: string;
};

export type BlockedGamesMap = Record<string, string>;
export type GameLivesMap = Record<string, number>;