import { useEffect, useRef } from "react";
import PhaserCanvas from "./PhaserCanvas";
import { gameBridge } from "../../shared/bridge/gameBridge";
import type { PlatformEvent } from "../../shared/contracts/platformEvents";
import type { PlatformCommand } from "../../shared/contracts/platformCommands";
import type Phaser from "phaser";

interface GameLauncherProps {
  gameId: string;
  level: 1 | 2 | 3;
  points: number;
  lives: number;
  config: Phaser.Types.Core.GameConfig;
  onPlatformEvent: (event: PlatformEvent) => void;
}

export default function GameLauncher({
  gameId,
  level,
  points,
  lives,
  config,
  onPlatformEvent,
}: GameLauncherProps) {
  const latestHandlerRef = useRef(onPlatformEvent);

  useEffect(() => {
    latestHandlerRef.current = onPlatformEvent;
  }, [onPlatformEvent]);

  useEffect(() => {
    const unsubscribe = gameBridge.onGameEvent((event) => {
      if (event.gameId !== gameId) return;
      latestHandlerRef.current(event);
    });

    return () => {
      unsubscribe();
    };
  }, [gameId]);

// envia START_GAME apenas quando o launcher entra
  useEffect(() => {
  const startCommand: PlatformCommand = {
    type: "START_GAME",
    gameId,
    points,
    stage: level,
    lives,
  };

  const id = window.setTimeout(() => {
    gameBridge.send(startCommand);
  }, 0);

  return () => window.clearTimeout(id);
}, [gameId]);

return <PhaserCanvas key={gameId} gameId={gameId} config={config} />;
}
