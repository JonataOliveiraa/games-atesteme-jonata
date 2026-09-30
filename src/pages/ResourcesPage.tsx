import { useMemo, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { useGame } from "../context/useGame";
import { formatLives } from "../context/formatLives";
import { games, getGameById } from "../data/gameIndex";
import { useBeepSound } from "../hooks/useBeepSound";

type UnlockTarget = {
  id: string;
  title: string;
} | null;

export default function ResourcesPage() {
  const {
    points,
    lives,
    extraLifeCost,
    unlockLifeCost,
    history,
    isGameBlocked,
    getGameBlockedUntil,
    buyExtraLife,
    unlockGameAccess,
    resetProgress,
  } = useGame();

  const { playBeep } = useBeepSound({
    frequency: 720,
    duration: 80,
    volume: 0.14,
    type: "sine",
  });

  const [unlockTarget, setUnlockTarget] = useState<UnlockTarget>(null);
  const [showLifeModal, setShowLifeModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const blockedGamesList = useMemo(() => {
    return games.filter((game) => isGameBlocked(game.id));
  }, [isGameBlocked]);

  const blockedGamesCount = blockedGamesList.length;
  const recentHistory = history.slice(0, 8);
  const canUnlock = lives >= unlockLifeCost;
  const livesLabel = formatLives(lives);

  const getGameTitle = (gameId: string) => {
    const game = getGameById(gameId);
    return game ? game.title : gameId || "Plataforma";
  };

  const getHistoryLabel = (eventType: string) => {
    switch (eventType) {
      case "GAME_OVER":
        return "Game over";
      case "PHASE_COMPLETED":
        return "Fase concluída";
      case "GAME_COMPLETED":
        return "Jogo concluído";
      case "CORRECT_ANSWER":
        return "Acerto";
      case "WRONG_ANSWER":
        return "Erro";
      case "STREAK_BONUS":
        return "Bônus de sequência";
      case "NO_ERROR_BONUS":
        return "Bônus sem erros";
      case "BLOCKED":
        return "Jogo bloqueado";
      case "UNLOCKED_BY_POINTS":
        return "Desbloqueio por pontos";
      case "UNLOCKED_BY_LIFE":
        return "Desbloqueio por vida";
      case "UNLOCKED_BY_TIME":
        return "Desbloqueio por tempo";
      case "BOUGHT_EXTRA_LIFE":
        return "Vida comprada";
      case "LOST_LIFE":
        return "Perdeu ponto de vida";
      default:
        return eventType;
    }
  };

  const openUnlockModal = (gameId: string, gameTitle: string) => {
    setUnlockTarget({
      id: gameId,
      title: gameTitle,
    });
  };

  const closeUnlockModal = () => {
    setUnlockTarget(null);
  };

  const handleConfirmUnlock = () => {
    if (!unlockTarget) return;

    playBeep();

    const success = unlockGameAccess(unlockTarget.id);

    if (!success) {
      setFeedbackMessage(
        "Você está sem vidas para desbloquear este jogo."
      );
      setUnlockTarget(null);
      return;
    }

    setFeedbackMessage(
      `O jogo "${unlockTarget.title}" foi desbloqueado com sucesso.`
    );
    setUnlockTarget(null);
  };

  const handleConfirmBuyLife = () => {
    playBeep();
    setShowLifeModal(false);

    if (!buyExtraLife()) {
      setFeedbackMessage(
        "Você não possui pontos suficientes para comprar uma vida."
      );
      return;
    }

    setFeedbackMessage("Você comprou +1 vida.");
  };

  const handleConfirmReset = () => {
    resetProgress();
    setShowResetModal(false);
    setFeedbackMessage("Progresso resetado com sucesso.");
  };

  return (
    <section>
      <h1 className="page-title">Recursos</h1>
      <p className="page-subtitle">
        Acompanhe seus pontos, vidas e bloqueios dos jogos.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <h3>Pontos</h3>
            <strong>{points}</strong>
            <p>disponíveis</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div>
            <h3>Status</h3>

            <strong className="stat-main">
              {blockedGamesCount === 0
                ? "Todos liberados"
                : `${blockedGamesCount} jogo${
                    blockedGamesCount > 1 ? "s" : ""
                  } bloqueado${blockedGamesCount > 1 ? "s" : ""}`}
            </strong>

            {blockedGamesCount === 0 ? (
              <p className="stat-sub">
                Todos os jogos estão disponíveis para jogar.
              </p>
            ) : (
              <>
                <div className="status-tags">
                  {blockedGamesList.map((game) => (
                    <span key={game.id} className="status-tag">
                      {game.title}
                    </span>
                  ))}
                </div>

                <p className="stat-sub">
                  Os outros jogos continuam disponíveis.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div>
            <h3>Vidas</h3>
            <strong>{livesLabel}</strong>
            <p>
              Vida: {extraLifeCost} pontos · Desbloqueio: {unlockLifeCost} vida
            </p>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <h2>⭐ Troque seus pontos</h2>

        <button
          type="button"
          className="reset-dev-button"
          onClick={() => setShowResetModal(true)}
        >
          Resetar progresso
        </button>
      </div>

      <div className="rewards-grid">
        <div className="reward-card">
          <div className="reward-top">
            <div className="reward-icon">❤️</div>
            <div>
              <h3>Vida</h3>
              <p>Cada vida desbloqueia um jogo bloqueado.</p>
            </div>
          </div>

          <div className="reward-bottom">
            <div>
              <span className="reward-label">Custo</span>
              <div className="reward-cost">{extraLifeCost} pontos</div>
            </div>

            <div className="reward-action">
              <span>Suas vidas: {livesLabel}</span>
              <button
                type="button"
                onClick={() => setShowLifeModal(true)}
                disabled={points < extraLifeCost}
              >
                Comprar vida
              </button>
            </div>
          </div>
        </div>

        {blockedGamesList.length === 0 ? (
          <div className="reward-card">
            <div className="reward-top">
              <div className="reward-icon">✅</div>
              <div>
                <h3>Nenhum jogo bloqueado</h3>
                <p>
                  No momento, não há jogos bloqueados para desbloquear.
                </p>
              </div>
            </div>
          </div>
        ) : (
          blockedGamesList.map((game) => {
            const blockedUntil = getGameBlockedUntil(game.id);

            return (
              <div key={game.id} className="reward-card">
                <div className="reward-top">
                  <div className="reward-icon">{game.icon}</div>
                  <div>
                    <h3>{game.title}</h3>
                    <p>
                      Este jogo está bloqueado no momento.
                      {blockedUntil && (
                        <>
                          {" "}
                          Liberação automática em{" "}
                          <strong>
                            {new Date(blockedUntil).toLocaleString("pt-BR")}
                          </strong>
                          .
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="reward-bottom">
                  <div>
                    <span className="reward-label">Custo</span>
                    <div className="reward-cost">{unlockLifeCost} vida</div>
                  </div>

                  <div className="reward-action">
                    <span>Suas vidas: {livesLabel}</span>
                    <button
                      type="button"
                      onClick={() => openUnlockModal(game.id, game.title)}
                      disabled={!canUnlock}
                    >
                      Desbloquear
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="section-title-row">
        <h2>📋 Status dos jogos</h2>
      </div>

      <div className="history-list">
        {games.map((game) => {
          const blocked = isGameBlocked(game.id);
          const blockedUntil = getGameBlockedUntil(game.id);

          return (
            <div key={game.id} className="history-card">
              <div className="history-main">
                <strong>
                  {game.icon} {game.title}
                </strong>
                <span>{blocked ? "Bloqueado" : "Liberado"}</span>
              </div>

              <div className="history-meta">
                <span>Categoria: {game.category}</span>
                {blocked ? (
                  <span>
                    Bloqueado até{" "}
                    {blockedUntil
                      ? new Date(blockedUntil).toLocaleString("pt-BR")
                      : "-"}
                  </span>
                ) : (
                  <span>Disponível para jogar normalmente</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-title-row">
        <h2>📜 Histórico recente</h2>
      </div>

      <div className="history-list">
        {recentHistory.length === 0 ? (
          <div className="history-empty">Nenhum evento registrado ainda.</div>
        ) : (
          recentHistory.map((item, index) => (
            <div key={`${item.createdAt}-${index}`} className="history-card">
              <div className="history-main">
                <strong>{getGameTitle(item.gameId)}</strong>
                <span>{getHistoryLabel(item.eventType)}</span>
              </div>

              <div className="history-meta">
                <span>Fase: {item.stage}</span>
                <span>
                  Pontos: {item.pointsEarned > 0 ? "+" : ""}
                  {item.pointsEarned}
                </span>
                <span>{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={showLifeModal}
        title="Comprar vida"
        message={`Deseja comprar +1 vida por ${extraLifeCost} pontos?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirmBuyLife}
        onCancel={() => setShowLifeModal(false)}
      />

      <ConfirmModal
        isOpen={!!unlockTarget}
        title="Desbloquear jogo"
        message={
          unlockTarget
            ? `Deseja desbloquear o jogo "${unlockTarget.title}" usando ${unlockLifeCost} vida?`
            : ""
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirmUnlock}
        onCancel={closeUnlockModal}
      />

      <ConfirmModal
        isOpen={showResetModal}
        title="Resetar progresso"
        message="Deseja resetar todo o progresso? Isso vai zerar pontos, vidas, bloqueios e limpar o histórico."
        confirmText="Resetar"
        cancelText="Cancelar"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
        isDanger
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
    </section>
  );
}