import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { useGame } from "../context/useGame";
import { games } from "../data/games";
import GameFrame from "../platform/components/GameFrame";
import type { GameCode } from "../shared/types/game";
import type { PlatformEvent } from "../shared/contracts/platformEvents";
import type { GameEventPayload } from "../types/platform";
import type Phaser from "phaser";

const SLUG_TO_CODE: Record<string, GameCode> = {
  "base-dos-classificadores":  "EF01CO01",
  "trilha-do-passo-a-passo":     "EF01CO02",
  "oficina-dos-algoritmos":    "EF01CO03",
  "pixel-secreto":             "EF01CO05",
  "desktop-digital-infantil":  "EF01CO06",
  "guardioes-dos-dados":       "EF01CO07",
  "hangar-dos-modelos":        "EF02CO01",
};

const GAME_CONFIG_LOADERS: Partial<
  Record<GameCode, () => Promise<{ default: Phaser.Types.Core.GameConfig }>>
> = {
  EF01CO01: () => import("../games/EF01CO01/index"),
  EF01CO02: () => import("../games/EF01CO02/index"),
  EF01CO03: () => import("../games/EF01CO03/index"),
  EF01CO05: () => import("../games/EF01CO05/index"),
  EF01CO06: () => import("../games/EF01CO06/index"),
  EF01CO07: () => import("../games/EF01CO07/index"),
  EF02CO01: () => import("../games/EF02CO01/index"),
};

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    points,
    extraLifeCost,
    unlockCost,
    handleGameEvent,
    isGameBlocked,
    getGameBlockedUntil,
    getGameLives,
    buyExtraLife,
    unlockGameAccess,
  } = useGame();

  const [gameConfig, setGameConfig] =
    useState<Phaser.Types.Core.GameConfig | null>(null);

  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [showPostUnlockLifeModal, setShowPostUnlockLifeModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [, setCheckpoint] = useState<{
    progress: number;
    score: number;
    stage: number;
    hits?: number;
    errors?: number;
  } | null>(null);

  const streakRef = useRef(0);
  const errorCountRef = useRef(0);
  const lifePurchasePendingRef = useRef(false);
  const alreadyOfferedExtraLifeRef = useRef(false);

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

  const gameLives = getGameLives(game.slug);
  const blocked = isGameBlocked(game.slug);
  const blockedUntil = getGameBlockedUntil(game.slug);

  const dispatchPlatformGameEvent = (event: {
    type: "GAME_OVER" | "GAME_COMPLETED" | "CORRECT_ANSWER" | "WRONG_ANSWER";
    gameId: string;
    stage: number;
    pointsEarned?: number;
  }) => {
    const payload: GameEventPayload = {
      type: event.type,
      gameId: event.gameId,
      stage: event.stage,
      pointsEarned: event.pointsEarned ?? 0,
    };

    handleGameEvent(payload);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, type });
  };

  const handlePlatformEvent = (event: PlatformEvent) => {
    switch (event.type) {
      case "GAME_READY":
        return;

      case "CHECKPOINT": {
        setCheckpoint({
          progress: event.progress,
          score: event.score,
          stage: event.stage,
          hits: event.hits,
          errors: event.errors,
        });

        const nextStage = event.stage as 1 | 2 | 3;

        if (nextStage === 1 || nextStage === 2 || nextStage === 3) {
          setCurrentLevel(nextStage);
        }

        return;
      }

      case "CORRECT_ANSWER": {
        dispatchPlatformGameEvent({
          type: "CORRECT_ANSWER",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: event.pointsEarned,
        });

        streakRef.current += 1;

        if (streakRef.current > 0 && streakRef.current % 3 === 0) {
          showToast("+5 pontos • +5 bônus 🔥 x3 sequência", "success");
        } else {
          showToast("+5 pontos", "success");
        }

        return;
      }

      case "WRONG_ANSWER": {
        dispatchPlatformGameEvent({
          type: "WRONG_ANSWER",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: event.pointsEarned,
        });

        streakRef.current = 0;
        errorCountRef.current += 1;

       setTimeout(() => {
  const livesAfterError = Math.max(gameLives - 1, 0);

  showToast(
    `-5 pontos • -1 vida (${livesAfterError} restante${
      livesAfterError === 1 ? "" : "s"
    })`,
    "error"
  );

  if (gameLives === 1 && !alreadyOfferedExtraLifeRef.current) {
    alreadyOfferedExtraLifeRef.current = true;
    setShowNoLivesModal(true);
  }
}, 100);

if (gameLives <= 0) {
  setShowNoLivesModal(false);
  setShowGameOverModal(true);
}

        return;
      }

      case "GAME_COMPLETED": {
        dispatchPlatformGameEvent({
          type: "GAME_COMPLETED",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: 0,
        });

        if (errorCountRef.current === 0) {
          showToast("⭐ +5 bônus sem erros", "success");
        } else {
          showToast("Fase concluída!", "success");
        }

        if (currentLevel < 3) {
          setCurrentLevel((prev) => (prev + 1) as 1 | 2 | 3);
        } else {
          setCurrentLevel(1);

          window.setTimeout(() => {
            setHasStartedGame(false);
            setShowCongratsModal(true);
          }, 2400);
        }

        streakRef.current = 0;
        errorCountRef.current = 0;
        return;
      }

      case "GAME_OVER": {
        dispatchPlatformGameEvent({
          type: "GAME_OVER",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: 0,
        });

        streakRef.current = 0;
        setShowNoLivesModal(false);
        setShowGameOverModal(true);
        return;
      }
    }
  };

  const handleBuyLife = () => {
  if (lifePurchasePendingRef.current) return;

  if (points < extraLifeCost) {
    showToast("Pontos insuficientes para comprar uma vida.", "error");
    return;
  }

  buyExtraLife(game.slug);

  lifePurchasePendingRef.current = true;
  window.setTimeout(() => {
    lifePurchasePendingRef.current = false;
  }, 2000);

  showToast("+1 vida adquirida ❤️", "success");
  setShowNoLivesModal(false);
  setShowPostUnlockLifeModal(false);
};

  const handleUnlock = () => {
    if (points < unlockCost) {
      showToast("Pontos insuficientes para desbloquear este jogo.", "error");
      return;
    }

    const success = unlockGameAccess(game.slug);

    if (!success) {
      showToast("Não foi possível desbloquear este jogo agora.", "error");
      return;
    }

    setShowUnlockModal(false);
    setShowGameOverModal(false);
    setCurrentLevel(1);
    setHasStartedGame(false);
    setShowPostUnlockLifeModal(true);
    showToast("Jogo desbloqueado com sucesso.", "success");
  };

  const handleCongratsPlayAgain = () => {
    setShowCongratsModal(false);
    setCurrentLevel(1);
    setHasStartedGame(false);
  };

  const handleCongratsExit = () => {
    setShowCongratsModal(false);
    setCurrentLevel(1);
    navigate("/");
  };

  const handleExit = () => {
    navigate(-1);
  };

  if (blocked && !showGameOverModal && !showUnlockModal) {
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
            Este jogo está bloqueado porque houve game over.
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
            style={{ marginTop: "24px", maxWidth: 760 }}
          >
            <div className="reward-card">
              <div className="reward-top">
                <div className="reward-icon">🔒</div>
                <div>
                  <h3>Desbloquear este jogo</h3>
                  <p>
                    Você pode aguardar o prazo ou desbloquear agora usando{" "}
                    {unlockCost} pontos.
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
                    Desbloquear jogo
                  </button>
                </div>
              </div>
            </div>

            <div className="reward-card">
              <div className="reward-top">
                <div className="reward-icon">❤️</div>
                <div>
                  <h3>Vidas atuais</h3>
                  <p>
                    Depois do desbloqueio, você pode escolher comprar vidas
                    extras para voltar mais segura ao jogo.
                  </p>
                </div>
              </div>

              <div className="reward-bottom">
                <div>
                  <span className="reward-label">Vidas</span>
                  <div className="reward-cost">{gameLives}</div>
                </div>

                <div className="reward-action">
                  <span>Comprar vida: {extraLifeCost} pontos</span>
                  <button
                    type="button"
                    onClick={handleBuyLife}
                    disabled={points < extraLifeCost}
                  >
                    Comprar vida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ConfirmModal
          isOpen={showUnlockModal}
          title="Desbloquear jogo"
          message={`Deseja desbloquear o jogo "${game.title}" por ${unlockCost} pontos?`}
          confirmText="Confirmar"
          cancelText="Cancelar"
          onConfirm={handleUnlock}
          onCancel={() => setShowUnlockModal(false)}
        />

        <ConfirmModal
          isOpen={showPostUnlockLifeModal}
          title="Jogo desbloqueado"
          message={`O jogo "${game.title}" foi desbloqueado e está com 0 vidas. Deseja comprar +1 vida por ${extraLifeCost} pontos agora?`}
          confirmText="Comprar vida"
          cancelText="Depois"
          onConfirm={handleBuyLife}
          onCancel={() => setShowPostUnlockLifeModal(false)}
        />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <section>
        <button className="back-link" onClick={handleExit}>
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
              <span className="resource-icon">❤️</span>
              <div className="resource-text">
                <span>Vidas</span>
                <strong>{gameLives}</strong>
              </div>
            </div>

            <div className="resource-card">
              <span className="resource-icon">🎮</span>
              <div className="resource-text">
                <span>Status</span>
                <strong>{blocked ? "Bloqueado" : "Liberado"}</strong>
              </div>
            </div>

            <div className="resource-card">
              <span className="resource-icon">🏁</span>
              <div className="resource-text">
                <span>Nível</span>
                <strong>{currentLevel}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="game-area">
          {gameCode && gameConfig ? (
            hasStartedGame ? (
              <GameFrame
                gameId={game.slug}
                level={currentLevel}
                points={points}
                lives={gameLives}
                config={gameConfig}
                onPlatformEvent={handlePlatformEvent}
              />
            ) : (
              <div className="game-screen">
                <h2>{game.title}</h2>
                <p>
                  Prepare-se para começar. Você está com <strong>{gameLives}</strong>{" "}
                  vida{gameLives !== 1 ? "s" : ""}.
                </p>

                <div className="game-actions">
                  <button
                    type="button"
                    onClick={() => {
                      alreadyOfferedExtraLifeRef.current = false;
                      setHasStartedGame(true);
                    }}
                  >
                    {currentLevel === 1
                      ? "Iniciar jogo"
                      : `Continuar no nível ${currentLevel}`}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyLife}
                    disabled={points < extraLifeCost}
                  >
                    Comprar +1 vida
                  </button>
                </div>
              </div>
            )
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
        isOpen={showNoLivesModal}
        title="Você ficou sem vidas"
        message={`Você está com 0 vidas. Deseja comprar +1 vida por ${extraLifeCost} pontos ou continuar mesmo assim?`}
        confirmText="Comprar vida"
        cancelText="Continuar assim"
        onConfirm={handleBuyLife}
        onCancel={() => setShowNoLivesModal(false)}
      />

      <ConfirmModal
        isOpen={showGameOverModal}
        title="Game over"
        message={
          blockedUntil
            ? `Você errou novamente e está sem vidas disponíveis. O jogo "${game.title}" foi bloqueado até ${new Date(
                blockedUntil
              ).toLocaleString("pt-BR")}.`
            : `Você errou novamente sem vidas disponíveis. O jogo "${game.title}" foi bloqueado.`
        }
        confirmText="Voltar para jogos"
        cancelText="Desbloquear agora"
        onConfirm={() => {
          setShowGameOverModal(false);
          navigate("/", { replace: true });
        }}
        onCancel={() => {
          setShowUnlockModal(true);
        }}
      />

      <ConfirmModal
        isOpen={showUnlockModal}
        title="Desbloquear jogo"
        message={`Deseja desbloquear o jogo "${game.title}" por ${unlockCost} pontos?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleUnlock}
        onCancel={() => setShowUnlockModal(false)}
      />

      <ConfirmModal
        isOpen={showCongratsModal}
        title="🏆 Parabéns! Você concluiu o jogo!"
        message={`Você completou todos os 3 níveis de "${game.title}". Excelente trabalho! Deseja jogar novamente ou voltar aos jogos?`}
        confirmText="Jogar novamente"
        cancelText="Voltar aos jogos"
        onConfirm={handleCongratsPlayAgain}
        onCancel={handleCongratsExit}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
