import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useGame } from "../context/useGame";

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

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
    const success = consumeLife();

    if (!success) {
      const bought = buyLife();

      if (!bought) {
        alert("Você não tem vidas e também não possui 20 moedas para comprar uma nova vida.");
        return;
      }

      alert("Você estava sem vidas. Compramos 1 vida por 20 moedas.");
      return;
    }

    alert("Vida consumida com sucesso.");
  };

  return (
    <section>
      <Link to="/" className="back-link">
        {"<"} Voltar
      </Link>

      <h1 className="page-title">Jogo</h1>

      <p className="page-subtitle">
        Você abriu: <strong>{slug}</strong>
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
            <span className="resource-icon">🪙</span>
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

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button onClick={() => addCoins(5)}>
              Simular acerto (+5 moedas)
            </button>

            <button onClick={() => addCoins(10)}>
              Simular 3 acertos seguidos (+10 moedas)
            </button>

            <button onClick={() => addCoins(5)}>
              Simular jogo sem erros (+5 moedas)
            </button>

            <button onClick={() => loseLifeOnFailure()}>
              Simular erro (-1 vida)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}