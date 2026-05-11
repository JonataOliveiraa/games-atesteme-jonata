import GameLauncher from "./GameLauncher";
import IframeGameFrame from "./IframeGameFrame";
import type Phaser from "phaser";
import type { PlatformEvent } from "../../shared/contracts/platformEvents";

interface GameFrameProps {
  gameId: string;
  level: 1 | 2 | 3;
  points: number;
  lives: number;
  config: Phaser.Types.Core.GameConfig;
  onPlatformEvent: (event: PlatformEvent) => void;
  mode?: "local" | "iframe";
  src?: string;
}

export default function GameFrame({
  gameId,
  level,
  points,
  lives,
  config,
  onPlatformEvent,
  mode = "local",
  src,
}: GameFrameProps) {
  if (mode === "iframe" && src) {
    return (
      <IframeGameFrame
        gameId={gameId}
        level={level}
        points={points}
        lives={lives}
        src={src}
        onPlatformEvent={onPlatformEvent}
      />
    );
  }

  return (
    <GameLauncher
      key={gameId}
      gameId={gameId}
      level={level}
      points={points}
      lives={lives}
      config={config}
      onPlatformEvent={onPlatformEvent}
    />
  );
}