import { useState } from "react";
import GameCard from "../components/GameCard";
import type { Game } from "../types/game";

const games: Game[] = [
  {
    id: 1,
    title: "Quiz de Conhecimentos",
    description: "Teste seus conhecimentos com perguntas de diversas categorias.",
    category: "Trivia",
    points: 50,
    icon: "🧠",
    slug: "quiz-de-conhecimentos",
  },
  {
    id: 2,
    title: "Jogo da Memória",
    description: "Encontre todos os pares de cartas no menor tempo possível.",
    category: "Memória",
    points: 30,
    icon: "🧩",
    slug: "jogo-da-memoria",
  },
  {
    id: 3,
    title: "Acerte o Alvo",
    description: "Clique nos alvos que aparecem na tela e acumule pontos.",
    category: "Reflexo",
    points: 40,
    icon: "🎯",
    slug: "acerte-o-alvo",
  },
  {
    id: 4,
    title: "Palavra Secreta",
    description: "Descubra a palavra correta com base nas dicas recebidas.",
    category: "Lógica",
    points: 35,
    icon: "🔤",
    slug: "palavra-secreta",
  },
  {
    id: 5,
    title: "Corrida do Saber",
    description: "Avance casas ao acertar perguntas e complete o percurso.",
    category: "Perguntas",
    points: 45,
    icon: "🏁",
    slug: "corrida-do-saber",
  },
  {
    id: 6,
    title: "Desafio Matemático",
    description: "Resolva contas e problemas no menor tempo possível.",
    category: "Matemática",
    points: 60,
    icon: "➗",
    slug: "desafio-matematico",
  },
  {
    id: 7,
    title: "Caça ao Número",
    description: "Encontre os números corretos antes do tempo acabar.",
    category: "Atenção",
    points: 25,
    icon: "🔢",
    slug: "caca-ao-numero",
  },
  {
    id: 8,
    title: "Sequência Lógica",
    description: "Complete as sequências corretamente para avançar.",
    category: "Raciocínio",
    points: 55,
    icon: "🧩",
    slug: "sequencia-logica",
  },
  {
    id: 9,
    title: "Desafio das Cores",
    description: "Associe cores e padrões corretamente para vencer.",
    category: "Percepção",
    points: 20,
    icon: "🎨",
    slug: "desafio-das-cores",
  },
  {
    id: 10,
    title: "Montando Palavras",
    description: "Organize letras para formar as palavras corretas.",
    category: "Português",
    points: 40,
    icon: "✍️",
    slug: "montando-palavras",
  },
  {
    id: 11,
    title: "Conta Rápida",
    description: "Resolva operações matemáticas com rapidez.",
    category: "Cálculo",
    points: 35,
    icon: "🧮",
    slug: "conta-rapida",
  },
  {
    id: 12,
    title: "Labirinto Inteligente",
    description: "Encontre o melhor caminho até a saída.",
    category: "Estratégia",
    points: 50,
    icon: "🌀",
    slug: "labirinto-inteligente",
  },
];

const ITEMS_PER_PAGE = 6;

export default function GamesPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = games.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section>
      <h1 className="page-title">Jogos</h1>
      <p className="page-subtitle">
        Escolha um jogo, divirta-se e acumule pontos!
      </p>

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
              onClick={() => setCurrentPage(pageNumber)}
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