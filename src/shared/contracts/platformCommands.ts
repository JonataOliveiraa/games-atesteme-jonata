import { gameBridge } from "../bridge/gameBridge";

export type PlatformCommand =
  | {
      type: "START_GAME";
      gameId: string;
      points: number;
      stage: number;
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

export function startGameCommand(gameId: string, points: number, stage: number) {
  gameBridge.send({
    type: "START_GAME",
    gameId,
    points,
    stage,
  });
}

export function pauseGameCommand() {
  gameBridge.send({
    type: "PAUSE_GAME",
  });
}

export function resumeGameCommand() {
  gameBridge.send({
    type: "RESUME_GAME",
  });
}

export function unlockGameCommand(gameId: string) {
  gameBridge.send({
    type: "UNLOCK_GAME",
    gameId,
  });
}