import { useMemo } from "react";
import GameCard from "../components/GameCard";
import FilterSelect from "../components/FilterSelect";
import { useBeepSound } from "../hooks/useBeepSound";
import { getGamesByRound, getGamesByYearCode } from "../data/gameIndex";
import { ROUNDS } from "../data/catalog";
import { YEAR_CODES } from "../data/skills";
import { useGame } from "../context/useGame";
import { useSearchParams } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

/** O filtro "sem filtro". String vazia porque é o que some da URL. */
const TODOS = "";

export default function GamesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { blockedGamesCount } = useGame();

  const { playBeep } = useBeepSound({
    frequency: 760,
    duration: 60,
    volume: 0.1,
    type: "sine",
  });

  /*
    Os dois filtros vêm da URL, e não de um useState, pelo mesmo motivo que a
    página já vinha: assim a seleção sobrevive ao recarregar, volta certa no
    botão de voltar do navegador e pode ser mandada por link para alguém.
  */
  const requestedRound = searchParams.get("rodada") ?? TODOS;
  const requestedYear = searchParams.get("ano") ?? TODOS;

  /*
    Os dois filtros se somam por interseção — "2ª rodada E 3º ano". Cada
    resolver já devolve a lista inteira quando não reconhece o valor, então
    "sem filtro" cai no caso geral sem precisar de um ramo só para ele.
  */
  const filtrar = useMemo(
    () => (round: string, year: string) => {
      const doAno = new Set(getGamesByYearCode(year).map((g) => g.id));
      return getGamesByRound(round).filter((g) => doAno.has(g.id));
    },
    []
  );

  const visibleGames = useMemo(
    () => filtrar(requestedRound, requestedYear),
    [filtrar, requestedRound, requestedYear]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(visibleGames.length / ITEMS_PER_PAGE)
  );

  /*
    A página é limitada ao total DEPOIS dos filtros. Trocar um filtro já volta
    para a página 1, mas uma URL escrita à mão (?ano=EF04&page=9) chegaria numa
    fatia vazia — e uma grade vazia parece jogo sumido, não página inexistente.
  */
  const currentPage = Math.min(
    Math.max(1, Number(searchParams.get("page")) || 1),
    totalPages
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentGames = visibleGames.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /** Escreve a URL inteira de uma vez: os três parâmetros andam juntos. */
  const apply = (round: string, year: string, page: number) => {
    playBeep();

    const params: Record<string, string> = {};
    if (round !== TODOS) params.rodada = round;
    if (year !== TODOS) params.ano = year;
    if (page > 1) params.page = String(page);

    setSearchParams(params);
  };

  const setPage = (page: number) => apply(requestedRound, requestedYear, page);

  /* Filtro novo, contagem nova: a página antiga pode nem existir mais. */
  const setRound = (round: string) => apply(round, requestedYear, 1);
  const setYear = (year: string) => apply(requestedRound, year, 1);

  const goToNextPage = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  /*
    O número na opção conta com o OUTRO filtro já aplicado. Assim "EF04 (3)"
    dentro da 2ª rodada quer dizer três jogos de verdade, e nenhuma linha da
    lista promete um resultado que a escolha não entrega.
  */
  const roundOptions = [
    {
      value: TODOS,
      label: "Todas as rodadas",
      count: filtrar(TODOS, requestedYear).length,
    },
    ...ROUNDS.map((r) => ({
      value: r.key as string,
      label: r.label,
      count: filtrar(r.key, requestedYear).length,
    })),
  ];

  const yearOptions = [
    {
      value: TODOS,
      label: "Todos os anos",
      count: filtrar(requestedRound, TODOS).length,
    },
    ...YEAR_CODES.map((y) => ({
      value: y.code as string,
      /* O código E o ano por extenso: numa lista aberta cabem os dois, e
         "EF15" sozinho não conta a ninguém que é transversal. */
      label: `${y.code} · ${y.label}`,
      count: filtrar(requestedRound, y.code).length,
    })),
  ];

  /* O valor selecionado é o RECONHECIDO, não o que veio na URL: `?ano=EF09`
     mostra a lista inteira, então quem tem que aparecer no botão é "Todos os
     anos" — senão a grade diz uma coisa e o filtro não diz nenhuma. */
  const activeRound = roundOptions.some((o) => o.value === requestedRound)
    ? requestedRound
    : TODOS;
  const activeYear = yearOptions.some((o) => o.value === requestedYear)
    ? requestedYear
    : TODOS;

  return (
    <section>
      <h1 className="page-title">Jogos</h1>
      <p className="page-subtitle">
        Escolha um jogo, divirta-se e acumule pontos!
      </p>

      <div className="games-filters">
        <FilterSelect
          legend="Ano"
          value={activeYear}
          options={yearOptions}
          onChange={setYear}
        />

        <FilterSelect
          legend="Rodada"
          value={activeRound}
          options={roundOptions}
          onChange={setRound}
        />
      </div>

      {blockedGamesCount > 0 && (
        <div className="blocked-banner">
          Você possui {blockedGamesCount} jogo
          {blockedGamesCount > 1 ? "s" : ""} bloqueado
          {blockedGamesCount > 1 ? "s" : ""}. Os outros continuam liberados.
        </div>
      )}

      {visibleGames.length === 0 ? (
        <p className="games-empty">
          Nenhum jogo nesta combinação de ano e rodada.
        </p>
      ) : (
        <div className="games-grid">
          {currentGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

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
              onClick={() => setPage(pageNumber)}
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
