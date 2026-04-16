import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { useGame } from "../context/useGame";
import { games } from "../data/games";
import GameLauncher from "../platform/components/GameLauncher";
import type { GameCode, GameLevel } from "../shared/types/game";
import type { GameEventPayload } from "../types/platform";

const SLUG_TO_CODE: Record<string, GameCode> = {
  "base-dos-classificadores": "EF01CO01",
};

const GAME_CONFIG_LOADERS: Partial<
  Record<GameCode, () => Promise<{ default: Phaser.Types.Core.GameConfig }>>
> = {
  EF01CO01: () => import("../games/EF01CO01/index"),
};

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    points,
    unlockCost,
    handleGameEvent,
    isGameBlocked,
    getGameBlockedUntil,
    unlockGameAccess,
  } = useGame();

  const [gameConfig, setGameConfig] =
    useState<Phaser.Types.Core.GameConfig | null>(null);
  const [currentLevel] = useState<GameLevel>(1);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [cameFromGameOver, setCameFromGameOver] = useState(false);

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

  const handleGameEventFromPhaser = (event: GameEventPayload) => {
    if (!game) return;

    handleGameEvent({
      ...event,
      gameId: game.slug,
    });

    if (event.type === "GAME_OVER") {
      setCameFromGameOver(true);
      setShowGameOverModal(true);
    }
  };

  const handleUnlockAfterGameOver = () => {
    if (!game) return;

    const success = unlockGameAccess(game.slug);

    if (!success) {
      setFeedbackMessage(
        "Você não possui pontos suficientes para liberar este jogo."
      );
      setShowUnlockModal(false);
      return;
    }

    setFeedbackMessage(`O jogo "${game.title}" foi desbloqueado com sucesso.`);
    setShowUnlockModal(false);
    setShowGameOverModal(false);
    setCameFromGameOver(false);
  };

  const handleUnlockBlockedGame = () => {
    if (!game) return;

    const success = unlockGameAccess(game.slug);

    if (!success) {
      setFeedbackMessage(
        "Você não possui pontos suficientes para liberar este jogo."
      );
      setShowUnlockModal(false);
      return;
    }

    setFeedbackMessage(`O jogo "${game.title}" foi desbloqueado com sucesso.`);
    setShowUnlockModal(false);
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

  const blocked = isGameBlocked(game.slug);
  const blockedUntil = getGameBlockedUntil(game.slug);

  if (blocked && !cameFromGameOver) {
    return (
      <>
        <section>
          <button
            type="button"
            className="back-link"
            onClick={() => navigate("/")}
          >
            {"<"} Voltar
          </button>

          <h1 className="page-title">{game.title}</h1>
          <p className="page-subtitle">
            Este jogo está bloqueado porque suas tentativas foram esgotadas.
            {blockedUntil && (
              <>
                {" "}
                Liberação automática em{" "}
                <strong>{new Date(blockedUntil).toLocaleString("pt-BR")}</strong>.
              </>
            )}
          </p>

          <div
            className="rewards-grid"
            style={{ marginTop: "24px", maxWidth: 680 }}
          >
            <div className="reward-card">
              <div className="reward-top">
                <div className="reward-icon">🔒</div>
                <div>
                  <h3>Desbloquear este jogo</h3>
                  <p>
                    Você pode aguardar o prazo de 2 dias ou liberar agora usando
                    seus pontos.
                  </p>
                </div>
              </div>

              <div className="reward-bottom">
                <div>
                  <span className="reward-label">Custo</span>
                  <div className="reward-cost">{unlockCost} pontos</div>
                </div>

                <div className="reward-action">
                  <span>Seus pontos: {points}</span>
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    disabled={points < unlockCost}
                  >
                    Liberar acesso
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ConfirmModal
          isOpen={showUnlockModal}
          title="Liberar jogo"
          message={`Deseja liberar o jogo "${game.title}" por ${unlockCost} pontos?`}
          confirmText="Confirmar"
          cancelText="Cancelar"
          onConfirm={handleUnlockBlockedGame}
          onCancel={() => setShowUnlockModal(false)}
        />

        <ConfirmModal
          isOpen={!!feedbackMessage}
          title="Aviso"
          message={feedbackMessage ?? ""}
          confirmText="Fechar"
          cancelText=""
          onConfirm={() => setFeedbackMessage(null)}
          onCancel={() => setFeedbackMessage(null)}
        />
      </>
    );
  }

  return (
    <>
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
                Aqui o Phaser vai rodar o jogo. Por enquanto, essa área segue
                como placeholder para jogos ainda não implementados.
              </p>
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={showGameOverModal}
        title="Game over"
        message={
          blockedUntil
            ? `Você esgotou suas tentativas em "${game.title}". Este jogo foi bloqueado até ${new Date(
                blockedUntil
              ).toLocaleString(
                "pt-BR"
              )}. Os outros jogos continuam liberados.`
            : `Você esgotou suas tentativas em "${game.title}". Este jogo foi bloqueado por 2 dias. Os outros jogos continuam liberados.`
        }
        confirmText="Voltar para jogos"
        cancelText="Desbloquear agora"
        onConfirm={() => {
          setShowGameOverModal(false);
          setCameFromGameOver(false);
          navigate("/", { replace: true });
        }}
        onCancel={() => {
          setShowUnlockModal(true);
        }}
      />

      <ConfirmModal
        isOpen={showUnlockModal}
        title="Liberar jogo"
        message={`Deseja liberar o jogo "${game.title}" por ${unlockCost} pontos?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleUnlockAfterGameOver}
        onCancel={() => setShowUnlockModal(false)}
      />

      <ConfirmModal
        isOpen={!!feedbackMessage}
        title="Aviso"
        message={feedbackMessage ?? ""}
        confirmText="Fechar"
        cancelText=""
        onConfirm={() => setFeedbackMessage(null)}
        onCancel={() => setFeedbackMessage(null)}
      />
    </>
      <div className="game-area">
        {gameCode && gameConfig ? (
          <GameLauncher
            gameCode={gameCode}
            level={currentLevel}
            gameName={game.title}
            gameDescription={game.description}
            gameIcon={game.icon}
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