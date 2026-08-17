import { useMemo, useState } from "react";
import { games } from "../data/games";
import { useGame } from "../context/useGame";
import {
  getGameRanking,
  getGeneralRanking,
} from "../services/ranking/rankingService";
import type {
  RankingEntry,
  RankingPeriod,
  RankingScope,
} from "../services/ranking/types";
import type { Game } from "../types/game";

const ITEMS_PER_PAGE = 5;

const PERIOD_OPTIONS: Array<{
  value: RankingPeriod;
  label: string;
}> = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "all", label: "Geral" },
];

function getStoredAvatar(): string {
  const userPhoto = localStorage.getItem("userPhoto");
  const userAvatar = localStorage.getItem("userAvatar");
  return userPhoto || userAvatar || "👤";
}

function renderPosition(position: number) {
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return `${position}º`;
}

export default function RankingPage() {
  const { points, history } = useGame();

  const [scope, setScope] = useState<RankingScope>("general");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rankingData = useMemo(
    () => ({
      games,
      history,
      currentPoints: points,
      currentUser: {
        name: "Você",
        avatar: getStoredAvatar(),
      },
    }),
    [history, points]
  );

  const filteredGames = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return games;

    return games.filter(
      (game) =>
        game.title.toLowerCase().includes(term) ||
        game.category.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const rankingResult = useMemo(() => {
    if (scope === "general") {
      return getGeneralRanking(rankingData, selectedPeriod);
    }

    if (!selectedGame) {
      return { entries: [], currentUserEntry: null };
    }

    return getGameRanking(rankingData, selectedGame, selectedPeriod);
  }, [rankingData, scope, selectedGame, selectedPeriod]);

  const totalPages = Math.max(
    1,
    Math.ceil(rankingResult.entries.length / ITEMS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEntries = rankingResult.entries.slice(startIndex, endIndex);

  const handleScopeChange = (newScope: RankingScope) => {
    setScope(newScope);
    setSelectedGame(null);
    setSearchTerm("");
    setSelectedPeriod("all");
    setCurrentPage(1);
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setCurrentPage(1);
  };

  const handlePeriodChange = (period: RankingPeriod) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (safeCurrentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (safeCurrentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <section className="ranking-page">
      <h1 className="page-title">Ranking</h1>
      <p className="page-subtitle">
        Acompanhe sua posição geral e também seu desempenho em cada jogo.
      </p>

      <div className="ranking-toolbar">
        <div className="ranking-scope-switch">
          <button
            type="button"
            className={
              scope === "general"
                ? "ranking-scope-button active"
                : "ranking-scope-button"
            }
            onClick={() => handleScopeChange("general")}
          >
            Ranking geral
          </button>

          <button
            type="button"
            className={
              scope === "game"
                ? "ranking-scope-button active"
                : "ranking-scope-button"
            }
            onClick={() => handleScopeChange("game")}
          >
            Ranking por jogo
          </button>
        </div>

        <div className="ranking-period-filter">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                selectedPeriod === option.value
                  ? "ranking-period-button active"
                  : "ranking-period-button"
              }
              onClick={() => handlePeriodChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {scope === "general" && rankingResult.currentUserEntry && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div>
                <h3>Sua posição</h3>
                <strong>{rankingResult.currentUserEntry.position}º</strong>
                <p>no ranking geral</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div>
                <h3>Seus pontos</h3>
                <strong>{rankingResult.currentUserEntry.score}</strong>
                <p>pontuação atual</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div>
                <h3>Modo</h3>
                <strong>Geral</strong>
                <p>todos os jogos</p>
              </div>
            </div>
          </div>

          <div className="ranking-user-card">
            <div className="ranking-user-avatar">
              {getStoredAvatar().startsWith("data:image") ? (
                <img src={getStoredAvatar()} alt="Avatar do usuário" />
              ) : (
                getStoredAvatar()
              )}
            </div>

            <div className="ranking-user-main">
              <span className="ranking-user-label">Sua posição atual</span>
              <strong className="ranking-user-position">
                {renderPosition(rankingResult.currentUserEntry.position)}
              </strong>
              <p className="ranking-user-message">
                {rankingResult.currentUserEntry.position <= 3
                  ? "🎉 Parabéns! Você está no pódio!"
                  : "💪 Continue jogando para subir no ranking!"}
              </p>
            </div>

            <div className="ranking-user-points">
              {rankingResult.currentUserEntry.score} pts
            </div>
          </div>
        </>
      )}

      {scope === "game" && !selectedGame && (
        <>
          <div className="ranking-search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar jogo por nome ou categoria"
            />
          </div>

          <div className="ranking-games-grid">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                type="button"
                className="ranking-game-button"
                onClick={() => handleSelectGame(game)}
              >
                <div className="ranking-game-card">
                  <div className="ranking-game-card-top">
                    <div className="ranking-game-icon-box">{game.icon}</div>
                  </div>

                  <div className="ranking-game-card-content">
                    <h3>{game.title}</h3>
                    <p>{game.description}</p>

                    <div className="ranking-game-meta">
                      <span>{game.category}</span>
                      <span>+{game.points} pts</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {scope === "game" && selectedGame && (
        <>
          <div className="ranking-selected-card">
            <div className="ranking-selected-top">
              <button
                type="button"
                className="ranking-back-button"
                onClick={() => {
                  setSelectedGame(null);
                  setCurrentPage(1);
                }}
              >
                ← Voltar
              </button>
            </div>

            <div className="ranking-selected-info">
              <div className="ranking-selected-icon">{selectedGame.icon}</div>

              <div>
                <h2>{selectedGame.title}</h2>
                <p>{selectedGame.category}</p>
              </div>
            </div>
          </div>

          {rankingResult.currentUserEntry && (
            <div className="ranking-user-card">
              <div className="ranking-user-avatar">
                {getStoredAvatar().startsWith("data:image") ? (
                  <img src={getStoredAvatar()} alt="Avatar do usuário" />
                ) : (
                  getStoredAvatar()
                )}
              </div>

              <div className="ranking-user-main">
                <span className="ranking-user-label">Sua posição atual</span>
                <strong className="ranking-user-position">
                  {renderPosition(rankingResult.currentUserEntry.position)}
                </strong>
                <p className="ranking-user-message">
                  {rankingResult.currentUserEntry.position <= 3
                    ? "🎉 Parabéns! Você está no pódio!"
                    : "💪 Continue jogando para subir no ranking!"}
                </p>
              </div>

              <div className="ranking-user-points">
                {rankingResult.currentUserEntry.score} pts
              </div>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">{selectedGame.icon}</div>
              <div>
                <h3>Jogo</h3>
                <strong>{selectedGame.title}</strong>
                <p>{selectedGame.category}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div>
                <h3>Sua posição</h3>
                <strong>
                  {rankingResult.currentUserEntry
                    ? `${rankingResult.currentUserEntry.position}º`
                    : "-"}
                </strong>
                <p>neste jogo</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div>
                <h3>Seus pontos</h3>
                <strong>
                  {rankingResult.currentUserEntry
                    ? rankingResult.currentUserEntry.score
                    : 0}
                </strong>
                <p>neste jogo</p>
              </div>
            </div>
          </div>
        </>
      )}

      {(scope === "general" || selectedGame) && (
        <>
          <div className="ranking-table-card">
            {currentEntries.length === 0 ? (
              <div className="ranking-empty">
                Nenhuma pontuação registrada para este período.
              </div>
            ) : (
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Jogador</th>
                    <th>Pontuação</th>
                  </tr>
                </thead>

                <tbody>
                  {currentEntries.map((entry: RankingEntry) => (
                    <tr
                      key={`${entry.playerName}-${entry.position}`}
                      className={entry.isCurrentUser ? "ranking-row-current-user" : ""}
                    >
                      <td className="ranking-cell-position">
                        {renderPosition(entry.position)}
                      </td>

                      <td className="ranking-cell-player">
                        {entry.avatar.startsWith("data:image") ? (
                          <img
                            src={entry.avatar}
                            alt="Avatar"
                            className="player-avatar-img"
                          />
                        ) : (
                          <span className="player-avatar-emoji">
                            {entry.avatar}
                          </span>
                        )}
                        {entry.playerName}
                        {entry.isCurrentUser && (
                          <span className="ranking-user-badge">(Você)</span>
                        )}
                      </td>

                      <td className="ranking-cell-score">{entry.score} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={safeCurrentPage === 1}
                className="pagination-arrow"
              >
                {"<"}
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    className={
                      pageNumber === safeCurrentPage
                        ? "pagination-button active"
                        : "pagination-button"
                    }
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={goToNextPage}
                disabled={safeCurrentPage === totalPages}
                className="pagination-arrow"
              >
                {">"}
              </button>
            </div>
          )}

          <div className="ranking-footer-note">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(endIndex, rankingResult.entries.length)} de{" "}
            {rankingResult.entries.length} jogadores
          </div>
        </>
      )}
    </section>
  );
}