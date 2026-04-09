import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/useGame";
import { games } from "../data/games";
import { useBeepSound } from "../hooks/useBeepSound";

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    coins,
    lives,
    consumeLife,
    buyLife,
    addCoins,
    loseLifeOnFailure,
    ensureLivesForGame,
    setCurrentGame,
    activateGameHint,
    usedHintsByGame,
  } = useGame();

  const { playBeep } = useBeepSound({
    frequency: 700,
    duration: 80,
    volume: 0.14,
    type: "sine",
  });

  const game = games.find((item) => item.slug === slug);

  const hintAvailable = slug && !usedHintsByGame.includes(slug) ? 1 : 0;

  useEffect(() => {
    if (slug) {
      ensureLivesForGame(slug);
      setCurrentGame(slug);
    }

    return () => {
      setCurrentGame(null);
    };
  }, [slug, ensureLivesForGame, setCurrentGame]);

  const handleHintClick = () => {
    if (!slug) return;

    playBeep();

    const result = activateGameHint(slug);

    if (result.success) {
      alert("Mostre a dica. Dica usada com sucesso por 10 moedas.");
      return;
    }

    if (result.reason === "already_used") {
      alert("A dica deste jogo já foi usada.");
      return;
    }

    if (result.reason === "not_enough_coins") {
      alert("Você não tem moedas suficientes para usar a dica deste jogo.");
    }
  };

  const handleLifeClick = () => {
    playBeep();

    if (lives > 0) {
      const confirmedUse = window.confirm("Deseja usar 1 vida agora?");

      if (!confirmedUse) return;

      const consumed = consumeLife();

      if (!consumed) {
        alert("Você ganhou mais uma vida!");
        return;
      }

      alert("Vida consumida com sucesso.");
      return;
    }

    const confirmedBuy = window.confirm(
      "Você está sem vidas. Deseja trocar 20 moedas por 1 vida e usá-la agora?"
    );

    if (!confirmedBuy) return;

    const bought = buyLife();

    if (!bought) {
      alert("Você não tem moedas suficientes para comprar uma vida.");
      return;
    }

    const consumed = consumeLife();

    if (!consumed) {
      alert("Você ganhou mais uma vida!");
      return;
    }

    alert("Vida comprada e consumida com sucesso.");
  };

  const handleSingleCorrect = () => {
    playBeep();
    addCoins(10);
  };

  const handleCombo = () => {
    playBeep();
    addCoins(10);
  };

  const handlePerfectGame = () => {
    playBeep();
    addCoins(10);
  };

  const handleFailure = () => {
    playBeep();
    loseLifeOnFailure();
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

  return (
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
        Categoria: <strong>{game.category}</strong>
      </p>

      <div className="game-topbar">
        <div className="player-box">
          <div className="player-avatar">H</div>
          <div className="player-info">
            <span className="player-label">Jogadora</span>
            <strong>Helena</strong>
          </div>
        </div>

        <div className="game-resources">
          <button className="resource-button" onClick={handleHintClick}>
            <span className="resource-icon">💡</span>
            <div className="resource-text">
              <span>Dica</span>
              <strong>{hintAvailable}</strong>
            </div>
          </button>

          <button className="resource-button" onClick={handleLifeClick}>
            <span className="resource-icon">💗</span>
            <div className="resource-text">
              <span>Vidas</span>
              <strong>{lives}</strong>
            </div>
          </button>

          <div className="resource-card">
            <span className="resource-icon">💰</span>
            <div className="resource-text">
              <span>Moedas</span>
              <strong>{coins}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="game-area">
        <div className="game-screen">
          <h2>Área do jogo</h2>
          <p>O jogo vai rodar centralizado aqui.</p>

          <div className="game-actions">
            <button onClick={handleSingleCorrect}>
              Simular acerto (+10 moedas)
            </button>

            <button onClick={handleCombo}>
              Simular 3 acertos seguidos (+10 moedas)
            </button>

            <button onClick={handlePerfectGame}>
              Simular jogo sem erros (+5 moedas)
            </button>

            <button onClick={handleFailure}>
              Simular erro (-1 vida)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}