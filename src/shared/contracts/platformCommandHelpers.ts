import { gameBridge } from "../bridge/gameBridge"

export function startGameCommand(
  gameId: string,
  points: number,
  stage: number,
  lives: number
) {
  gameBridge.send({
    type: "START_GAME",
    gameId,
    points,
    stage,
    lives,
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