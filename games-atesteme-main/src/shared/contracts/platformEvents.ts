export type PlatformEvent =
  | {
      type: "GAME_READY";
      gameId: string;
    }
  | {
      type: "CHECKPOINT";
      gameId: string;
      progress: number;
      score: number;
      stage: number;
      hits?: number;
      errors?: number;
    }
  | {
      type: "CORRECT_ANSWER";
      gameId: string;
      pointsEarned: number;
      stage: number;
    }
  | {
      type: "WRONG_ANSWER";
      gameId: string;
      pointsEarned: number;
      stage: number;
    }
  | {
      type: "GAME_OVER";
      gameId: string;
      stage: number;
    }
  | {
      type: "GAME_COMPLETED";
      gameId: string;
      stage: number;
    };