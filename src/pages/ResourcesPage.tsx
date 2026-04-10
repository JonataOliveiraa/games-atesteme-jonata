import { useGame } from "../context/useGame";
import { games } from "../data/games";
import { useBeepSound } from "../hooks/useBeepSound";

export default function ResourcesPage() {
  const {
    points,
    isBlocked,
    blockedUntil,
    unlockCost,
    history,
    unlockAccess,
  } = useGame();

  const { playBeep } = useBeepSound({
    frequency: 720,
    duration: 80,
    volume: 0.14,
    type: "sine",
  });

  const handleUnlock = () => {
    const confirmed = window.confirm(
      `Deseja trocar ${unlockCost} pontos para desbloquear o acesso agora?`
    );

    if (!confirmed) return;

    playBeep();

    const success = unlockAccess();

    if (!success) {
      alert("Você não possui pontos suficientes ou já está liberada.");
      return;
    }

    alert("Acesso desbloqueado com sucesso.");
  };

  const recentHistory = history.slice(0, 8);

  const getGameTitle = (gameId: string) => {
    if (gameId === "platform") return "Plataforma";

    const game = games.find((item) => item.slug === gameId);
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
      case "STREAK_BONUS":
        return "Bônus de sequência";
      case "NO_ERROR_BONUS":
        return "Bônus sem erros";
      case "BLOCKED":
        return "Usuária bloqueada";
      case "UNLOCKED_BY_POINTS":
        return "Desbloqueio por pontos";
      case "UNLOCKED_BY_TIME":
        return "Desbloqueio por tempo";
      default:
        return eventType;
    }
  };

  return (
    <section>
      <h1 className="page-title">Recursos</h1>
      <p className="page-subtitle">
        Acompanhe seus pontos, status de acesso e histórico da plataforma.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <h3>Pontos</h3>
            <strong>{points}</strong>
            <p>acumulados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔓</div>
          <div>
            <h3>Status</h3>
            <strong>{isBlocked ? "Bloqueada" : "Liberada"}</strong>
            <p>
              {isBlocked && blockedUntil
                ? `Até ${new Date(blockedUntil).toLocaleString("pt-BR")}`
                : "Você pode jogar normalmente"}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div>
            <h3>Custo de desbloqueio</h3>
            <strong>{unlockCost}</strong>
            <p>pontos necessários</p>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <h2>⭐ Troque seus pontos</h2>
      </div>

      <div className="rewards-grid">
        <div className="reward-card">
          <div className="reward-top">
            <div className="reward-icon">🔓</div>
            <div>
              <h3>Desbloquear acesso</h3>
              <p>
                Use seus pontos para desbloquear a plataforma antes do prazo de 2
                dias terminar.
              </p>
            </div>
          </div>

          <div className="reward-bottom">
            <div>
              <span className="reward-label">Custo</span>
              <div className="reward-cost">{unlockCost} pontos</div>
            </div>

            <div className="reward-action">
              <span>Status: {isBlocked ? "Bloqueada" : "Liberada"}</span>
              <button
                onClick={handleUnlock}
                disabled={!isBlocked || points < unlockCost}
              >
                Trocar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <h2>📜 Histórico recente</h2>
      </div>

      <div className="history-list">
        {recentHistory.length === 0 ? (
          <div className="history-empty">
            Nenhum evento registrado ainda.
          </div>
        ) : (
          recentHistory.map((item, index) => (
            <div key={`${item.createdAt}-${index}`} className="history-card">
              <div className="history-main">
                <strong>{getGameTitle(item.gameId)}</strong>
                <span>{getHistoryLabel(item.eventType)}</span>
              </div>

              <div className="history-meta">
                <span>Fase: {item.stage}</span>
                <span>Pontos: +{item.pointsEarned}</span>
                <span>{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}