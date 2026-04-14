import { useEffect, useRef } from "react";
import type { GameCode, GameLevel, RoundResult } from "../../shared/types/game";
import type { GameEventPayload } from "../../types/platform";
import { EventBus } from "../../shared/EventBus";
import { progressStore } from "../../shared/utils/progressStore"
import PhaserCanvas from "./PhaserCanvas";
import type Phaser from "phaser";

interface GameLauncherProps {
  gameCode: GameCode;
  level: GameLevel;
  points: number
  config: Phaser.Types.Core.GameConfig;
  onComplete: (event: GameEventPayload) => void;
  onExit: () => void;
}

/**
 * Componente React responsável por:
 * 1. Renderizar o <PhaserCanvas> com o GameConfig do jogo
 * 2. Ouvir os eventos do EventBus vindos das Scenes Phaser
 * 3. Persistir o progresso via progressStore
 * 4. Notificar o pai (GameDetailsPage) nos eventos de pontuação/estado e saída
 */
export default function GameLauncher({
  level,
  points,
  config,
  onComplete,
  onExit,
}: GameLauncherProps) {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const handleSceneReady = () => {
      if (hasInitializedRef.current) return;

      hasInitializedRef.current = true;
      EventBus.emit("set-level", { level, points });
    };

    const handleGameEvent = (event: GameEventPayload) => {
      onComplete(event);
    };

    const handleRoundComplete = (result: RoundResult) => {
      progressStore.saveRound(result);
    };

    const handleRequestExit = () => {
      onExit();
    };

    EventBus.on("scene-ready", handleSceneReady);
    EventBus.on("game-event", handleGameEvent);
    EventBus.on("round-complete", handleRoundComplete);
    EventBus.on("request-exit", handleRequestExit);

    return () => {
      EventBus.off("scene-ready", handleSceneReady);
      EventBus.off("game-event", handleGameEvent);
      EventBus.off("round-complete", handleRoundComplete);
      EventBus.off("request-exit", handleRequestExit);
    };
  }, [level, points, onComplete, onExit]);

  return <PhaserCanvas config={config} />;
}