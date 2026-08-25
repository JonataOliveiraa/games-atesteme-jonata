import { useMemo, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { useGame } from "../context/useGame";
import { games, getGameById } from "../data/gameIndex";
import { useBeepSound } from "../hooks/useBeepSound";

type UnlockTarget = {
  id: string;
  title: string;
} | null;

type LifeTarget = {
  id: string;
  title: string;
} | null;

export default function ResourcesPage() {
  const {
    points,
    extraLifeCost,
    unlockCost,
    history,
    isGameBlocked,
    getGameBlockedUntil,
    getGameLives,
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
  const [lifeTarget, setLifeTarget] = useState<LifeTarget>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const blockedGamesList = useMemo(() => {
    return games.filter((game) => isGameBlocked(game.id));
  }, [isGameBlocked]);

  const blockedGamesCount = blockedGamesList.length;
  const recentHistory = history.slice(0, 8);

  const getGameTitle = (gameId: string) => {
    const game = getGameById(gameId);
    return game ? game.title : gameId;
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

  const openLifeModal = (gameId: string, gameTitle: string) => {
    setLifeTarget({
      id: gameId,
      title: gameTitle,
    });
  };

  const closeLifeModal = () => {
    setLifeTarget(null);
  };

  const handleConfirmUnlock = () => {
    if (!unlockTarget) return;

    playBeep();

    const success = unlockGameAccess(unlockTarget.id);

    if (!success) {
      setFeedbackMessage(
        "Você não possui pontos suficientes para desbloquear este jogo."
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
    if (!lifeTarget) return;

    playBeep();

    const success = buyExtraLife(lifeTarget.id);

    if (!success) {
      setFeedbackMessage(
        "Você não possui pontos suficientes para comprar um ponto de vida extra."
      );
      setLifeTarget(null);
      return;
    }

    setFeedbackMessage(
      `Você comprou +1 ponto de vida para o jogo "${lifeTarget.title}".`
    );
    setLifeTarget(null);
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
            <h3>Custos</h3>
            <p>
              <strong>Vida: {extraLifeCost} pontos</strong>
            </p>
            <p>
              <strong>Desbloqueio: {unlockCost} pontos</strong>
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
                    <div className="reward-cost">{unlockCost} pontos</div>
                  </div>

                  <div className="reward-action">
                    <span>Seus pontos: {points}</span>
                    <button
                      type="button"
                      onClick={() => openUnlockModal(game.id, game.title)}
                      disabled={points < unlockCost}
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
          const lives = getGameLives(game.id);

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
                <span>Vidas: {lives}</span>
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

              <div className="history-meta" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => openLifeModal(game.id, game.title)}
                  disabled={points < extraLifeCost}
                >
                  Comprar ponto de vida
                </button>
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
        isOpen={!!lifeTarget}
        title="Comprar ponto de vida"
        message={
          lifeTarget
            ? `Deseja comprar +1 ponto de vida para o jogo "${lifeTarget.title}" por ${extraLifeCost} pontos?`
            : ""
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirmBuyLife}
        onCancel={closeLifeModal}
      />

      <ConfirmModal
        isOpen={!!unlockTarget}
        title="Desbloquear jogo"
        message={
          unlockTarget
            ? `Deseja desbloquear o jogo "${unlockTarget.title}" por ${unlockCost} pontos?`
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