import { useState } from "react";
import GameCard from "../components/GameCard";
import { useBeepSound } from "../hooks/useBeepSound";
import { games } from "../data/games";
import { useGame } from "../context/useGame";

const ITEMS_PER_PAGE = 6;

export default function GamesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { canPlay, blockedUntil } = useGame();

  const { playBeep } = useBeepSound({
    frequency: 760,
    duration: 60,
    volume: 0.1,
    type: "sine",
  });

  const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = games.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      playBeep();
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      playBeep();
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    playBeep();
    setCurrentPage(pageNumber);
  };

  return (
    <section>
      <h1 className="page-title">Jogos</h1>
      <p className="page-subtitle">
        Escolha um jogo, divirta-se e acumule pontos!
      </p>

      {!canPlay && (
        <div className="blocked-banner">
          Você está bloqueada para jogar no momento.
          {blockedUntil && (
            <span>
              {" "}
              Liberação automática em:{" "}
              <strong>{new Date(blockedUntil).toLocaleString("pt-BR")}</strong>
            </span>
          )}
        </div>
      )}

      <div className="games-grid">
        {currentGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="pagination-arrow"
        >
          {"<"}
        </button>

        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              className={
                pageNumber === currentPage
                  ? "pagination-button active"
                  : "pagination-button"
              }
              onClick={() => handlePageClick(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="pagination-arrow"
        >
          {">"}
        </button>
      </div>
    </section>
  );
}