import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/useGame";
import { games } from "../data/games";
import GameLauncher from "../platform/components/GameLauncher";
import type { GameCode, GameLevel } from "../shared/types/game";
import type { GameEventPayload } from "../types/platform";

// Mapa de slug -> código BNCC
const SLUG_TO_CODE: Record<string, GameCode> = {
  "base-dos-classificadores": "EF01CO01",
};

// Só os jogos já implementados
const GAME_CONFIG_LOADERS: Partial<
  Record<GameCode, () => Promise<{ default: Phaser.Types.Core.GameConfig }>>
> = {
  EF01CO01: () => import("../games/EF01CO01/index"),
};

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { points, canPlay, blockedUntil, handleGameEvent } = useGame();

  const [gameConfig, setGameConfig] =
    useState<Phaser.Types.Core.GameConfig | null>(null);
  const [currentLevel] = useState<GameLevel>(1);

  const game = games.find((item) => item.slug === slug);
  const gameCode = slug ? SLUG_TO_CODE[slug] : undefined;

  useEffect(() => {
    let cancelled = false;

    async function loadGameConfig() {
      if (!gameCode) return;

      const loader = GAME_CONFIG_LOADERS[gameCode];
      if (!loader) return;

      try {
        const mod = await loader();
        if (!cancelled) {
          setGameConfig(mod.default);
        }
      } catch (error) {
        console.error("Erro ao carregar configuração do jogo:", error);
      }
    }

    loadGameConfig();

    return () => {
      cancelled = true;
    };
  }, [gameCode]);

  const playBeep = () => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YTAAAAAA"
      );
      void audio.play();
    } catch (error) {
      console.error("Erro ao tocar som:", error);
    }
  };

  const handleCorrectAnswer = () => {
    playBeep();
    handleGameEvent({
      type: "CORRECT_ANSWER",
      gameId: slug ?? "unknown-game",
      stage: currentLevel,
      pointsEarned: 5,
    });
    alert("Acerto registrado. +5 pontos.");
  };

  const handleStreakBonus = () => {
    playBeep();
    handleGameEvent({
      type: "STREAK_BONUS",
      gameId: slug ?? "unknown-game",
      stage: currentLevel,
      pointsEarned: 5,
    });
    alert("Bônus de sequência registrado. +5 pontos.");
  };

  const handleNoErrorBonus = () => {
    playBeep();
    handleGameEvent({
      type: "NO_ERROR_BONUS",
      gameId: slug ?? "unknown-game",
      stage: currentLevel,
      pointsEarned: 5,
    });
    alert("Bônus por jogo sem erros registrado. +5 pontos.");
  };

  const handlePhaseCompleted = () => {
    playBeep();
    handleGameEvent({
      type: "PHASE_COMPLETED",
      gameId: slug ?? "unknown-game",
      stage: currentLevel,
      pointsEarned: 0,
    });
    alert("Fase concluída registrada.");
  };

  const handleGameCompleted = () => {
    playBeep();
    handleGameEvent({
      type: "GAME_COMPLETED",
      gameId: slug ?? "unknown-game",
      stage: currentLevel,
      pointsEarned: 0,
    });
    alert("Conclusão do jogo registrada.");
  };

  const handleGameOver = () => {
    playBeep(); 
    handleGameEvent({
      type: "GAME_OVER",
      gameId: slug ?? "unknown-game",
      stage: currentLevel,
      pointsEarned: 0,
    });
    alert("Game over registrado. A plataforma foi bloqueada por 2 dias.");
    navigate("/", { replace: true });
  };

  const handleGameEventFromPhaser = (event: GameEventPayload) => {
    handleGameEvent(event);

    if (event.type === "GAME_OVER") {
      alert("Game over registrado. A plataforma foi bloqueada por 2 dias.");
      navigate("/", { replace: true });
    }
  };

  const handleExit = () => {
    navigate(-1);
  };

  if (!game) {
    return (
      <section>
        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/")}
        >
          {"<"} Voltar
        </button>

        <h1 className="page-title">Jogo não encontrado</h1>
        <p className="page-subtitle">
          Não encontramos um jogo com esse identificador.
        </p>
      </section>
    );
  }

  if (!canPlay) {
    return (
      <section>
        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/")}
        >
          {"<"} Voltar
        </button>

        <h1 className="page-title">Acesso bloqueado</h1>
        <p className="page-subtitle">
          Você não pode abrir jogos agora.
          {blockedUntil && (
            <>
              {" "}
              Liberação automática em{" "}
              <strong>{new Date(blockedUntil).toLocaleString("pt-BR")}</strong>.
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section>
      <button className="back-link" onClick={() => navigate(-1)}>
        {"<"} Voltar
      </button>

      <h1 className="page-title">{game.title}</h1>

      <div className="game-topbar">
        <div className="player-box">
          <div className="player-avatar">H</div>
          <div className="player-info">
            <span className="player-label">Jogador(a)</span>
            <strong>Nome do usuário</strong>
          </div>
        </div>

        <div className="game-resources">
          <div className="resource-card">
            <span className="resource-icon">⭐</span>
            <div className="resource-text">
              <span>Pontos</span>
              <strong>{points}</strong>
            </div>
          </div>

          <div className="resource-card">
            <span className="resource-icon">🎮</span>
            <div className="resource-text">
              <span>Status</span>
              <strong>Liberado</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="game-area">
        {gameCode && gameConfig ? (
          <GameLauncher
            gameCode={gameCode}
            level={currentLevel}
            points={points}
            config={gameConfig}
            onComplete={handleGameEventFromPhaser}
            onExit={handleExit}
          />
        ) : gameCode ? (
          <div className="game-screen">
            <p style={{ color: "var(--muted)" }}>Carregando jogo...</p>
          </div>
        ) : (
          <div className="game-screen">
            <h2>Área do jogo</h2>
            <p>
              Aqui o Phaser vai rodar o jogo. Por enquanto, os botões abaixo
              simulam os eventos que o jogo vai enviar para a plataforma.
            </p>

            <div className="game-actions">
              <button onClick={handleCorrectAnswer}>
                Simular acerto (+5 pontos)
              </button>

              <button onClick={handleStreakBonus}>
                Simular 3 acertos seguidos (+5 pontos)
              </button>

              <button onClick={handleNoErrorBonus}>
                Simular jogo sem erros (+5 pontos)
              </button>

              <button onClick={handlePhaseCompleted}>
                Simular conclusão de fase
              </button>

              <button onClick={handleGameCompleted}>
                Simular conclusão do jogo
              </button>

              <button onClick={handleGameOver}>Simular game over</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}