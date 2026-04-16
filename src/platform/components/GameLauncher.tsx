import { useEffect, useRef, useState } from "react";
import type { GameCode, GameLevel, RoundResult } from "../../shared/types/game";
import type { GameEventPayload } from "../../types/platform";
import { EventBus } from "../../shared/EventBus";
import { progressStore } from "../../shared/utils/progressStore";
import PhaserCanvas from "./PhaserCanvas";
import type Phaser from "phaser";

interface GameLauncherProps {
  gameCode: GameCode;
  level: GameLevel;
  /** Nome do jogo exibido na tela de início */
  gameName?: string;
  /** Descrição breve exibida na tela de início */
  gameDescription?: string;
  /** Emoji/ícone do jogo exibido na tela de início */
  gameIcon?: string;
  config: Phaser.Types.Core.GameConfig;
  onComplete: (event: GameEventPayload) => void;
  onExit: () => void;
}

/**
 * Componente React responsável por:
 * 1. Exibir tela de início ("Vamos Jogar!") antes de inicializar o Phaser
 * 2. Renderizar <PhaserCanvas> com o GameConfig do jogo após o clique
 * 3. Ouvir eventos do EventBus vindos das Scenes Phaser
 * 4. Persistir progresso via progressStore
 * 5. Gerenciar progressão de níveis (1 → 2 → 3) autonomamente
 * 6. Notificar o pai nos eventos de pontuação e saída
 *
 * Fluxo de progressão de nível:
 *   scene-ready  → emite set-level (apenas na primeira vez)
 *   round-complete → salva progresso → após 800 ms emite set-level com próximo nível
 *                    (ou GAME_COMPLETED quando nível 3 termina)
 *   set-level    → GameScene faz scene.restart({ level }) → scene-ready dispara novamente
 *                  (hasInitializedRef continua true → sem re-emissão desnecessária)
 */
export default function GameLauncher({
  gameCode,
  level,
  gameName,
  gameDescription,
  gameIcon,
  config,
  onComplete,
  onExit,
}: GameLauncherProps) {
  /** Controla se o jogo já foi iniciado pelo jogador */
  const [started, setStarted] = useState(false);

  /** Impede dupla inicialização (React StrictMode / remounts) */
  const hasInitializedRef = useRef(false);

  /** Nível atual rastreado internamente — começa no nível passado pela prop */
  const currentLevelRef = useRef<GameLevel>(level);

  /** Timer de transição entre níveis — limpo no unmount */
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!started) return;

    const handleSceneReady = () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;
      EventBus.emit("set-level", { level: currentLevelRef.current });
    };

    const handleGameEvent = (event: GameEventPayload) => {
      onComplete(event);
    };

    const handleRoundComplete = (result: RoundResult) => {
      progressStore.saveRound(result);

      // Aguarda animação de celebração no Phaser (≈800 ms) antes de trocar nível
      transitionTimerRef.current = setTimeout(() => {
        if (currentLevelRef.current < 3) {
          const nextLevel = (currentLevelRef.current + 1) as GameLevel;
          currentLevelRef.current = nextLevel;
          EventBus.emit("set-level", { level: nextLevel });
        } else {
          // Todos os 3 níveis concluídos!
          onComplete({
            type: "GAME_COMPLETED",
            gameId: gameCode,
            stage: 3,
            pointsEarned: 0,
          });
        }
      }, 800);
    };

    const handleRequestExit = () => {
      onExit();
    };

    EventBus.on("scene-ready",    handleSceneReady);
    EventBus.on("game-event",     handleGameEvent);
    EventBus.on("round-complete", handleRoundComplete);
    EventBus.on("request-exit",   handleRequestExit);

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      EventBus.off("scene-ready",    handleSceneReady);
      EventBus.off("game-event",     handleGameEvent);
      EventBus.off("round-complete", handleRoundComplete);
      EventBus.off("request-exit",   handleRequestExit);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, gameCode, onComplete, onExit]);

  // ── Tela de início ──────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="game-start-screen">
        {gameIcon && <span className="game-start-icon">{gameIcon}</span>}

        <h1 className="game-start-title">
          {gameName ?? "Pronto para jogar?"}
        </h1>

        {gameDescription && (
          <p className="game-start-description">{gameDescription}</p>
        )}

        <div className="game-start-levels">
          <span>⭐</span>
          <span>⭐</span>
          <span>⭐</span>
          <span className="game-start-levels-label">3 Níveis de Desafio</span>
        </div>

        <div className="game-start-tip">
          <span className="game-start-tip-icon">💡</span>
          Arraste cada peça para a base com a mesma característica!
        </div>

        <button
          type="button"
          className="game-start-btn"
          onClick={() => setStarted(true)}
        >
          ▶&nbsp;&nbsp;Vamos Jogar!
        </button>
      </div>
    );
  }

  // ── Jogo ativo ──────────────────────────────────────────────────────────
  return <PhaserCanvas config={config} />;
}
