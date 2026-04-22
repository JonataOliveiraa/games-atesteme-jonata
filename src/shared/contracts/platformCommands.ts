export type PlatformCommand =
  | {
      type: "START_GAME";
      gameId: string;
      points: number;
      stage: number;
      lives: number;
    }
  | {
      type: "PAUSE_GAME";
    }
  | {
      type: "RESUME_GAME";
    }
  | {
      type: "UNLOCK_GAME";
      gameId: string;
    };