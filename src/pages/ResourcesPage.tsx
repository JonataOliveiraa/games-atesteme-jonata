import { useGame } from "../context/useGame";
import { games } from "../data/games";
import { useBeepSound } from "../hooks/useBeepSound";

const TOTAL_GAMES = games.length;

export default function ResourcesPage() {
  const {
    coins,
    lives,
    currentGameSlug,
    usedHintsByGame,
    buyLife,
    activateGameHint,
  } = useGame();

  const { playBeep } = useBeepSound({
    frequency: 720,
    duration: 80,
    volume: 0.14,
    type: "sine",
  });

  const currentGame = games.find((game) => game.slug === currentGameSlug);

  const currentGameHintAvailable =
    currentGameSlug && !usedHintsByGame.includes(currentGameSlug) ? 1 : 0;

  const usedHintsInOtherGames = currentGameSlug
    ? usedHintsByGame.filter((slug) => slug !== currentGameSlug).length
    : usedHintsByGame.length;

  const remainingHintsInOtherGames = currentGameSlug
    ? Math.max(TOTAL_GAMES - 1 - usedHintsInOtherGames, 0)
    : Math.max(TOTAL_GAMES - usedHintsInOtherGames, 0);

  const handleBuyHintForCurrentGame = () => {
    if (!currentGameSlug) {
      alert("Abra um jogo primeiro para usar a dica do jogo atual.");
      return;
    }

    playBeep();

    const result = activateGameHint(currentGameSlug);

    if (result.success) {
      alert("Dica do jogo atual ativada com sucesso por 10 moedas.");
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

  const handleBuyLife = () => {
  if (lives > 0) {
    alert("Você só pode comprar uma vida por aqui quando suas vidas estiverem zeradas.");
    return;
  }

  const confirmed = window.confirm(
    "Deseja trocar 20 moedas por 1 vida?"
  );

  if (!confirmed) return;

  playBeep();

  const success = buyLife();

  if (!success) {
    alert("Você não tem moedas suficientes para comprar uma vida.");
    return;
  }

  alert("Vida comprada com sucesso.");
};

  const canBuyHint =
    Boolean(currentGameSlug) && currentGameHintAvailable === 1 && coins >= 10;

  const canBuyLife = lives === 0 && coins >= 20;

  return (
    <section>
      <h1 className="page-title">Recursos</h1>
      <p className="page-subtitle">
        Acompanhe seus recursos e o status das dicas nos jogos.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <h3>Moedas</h3>
            <strong>{coins}</strong>
            <p>acumuladas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💗</div>
          <div>
            <h3>Vidas</h3>
            <strong>{lives}</strong>
            <p>disponíveis</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💡</div>
          <div>
            <h3>Dica do jogo atual</h3>
            <strong>{currentGame ? currentGameHintAvailable : "--"}</strong>
            <p>
              {currentGame
                ? `Jogo atual: ${currentGame.title}`
                : "Abra um jogo para acompanhar"}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧩</div>
          <div>
            <h3>Dicas em outros jogos</h3>
            <strong>{remainingHintsInOtherGames}</strong>
            <p>ainda disponíveis</p>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <h2>⭐ Troque suas moedas</h2>
      </div>

      <div className="rewards-grid">
        <div className="reward-card">
          <div className="reward-top">
            <div className="reward-icon">💡</div>
            <div>
              <h3>Dica do jogo atual</h3>
              <p>
                Troque 10 moedas para liberar a dica do jogo que está aberto no
                momento.
              </p>
            </div>
          </div>

          <div className="reward-bottom">
            <div>
              <span className="reward-label">Custo</span>
              <div className="reward-cost">10 moedas</div>
            </div>

            <div className="reward-action">
              <span>
                Disponível: {currentGame ? currentGameHintAvailable : "--"}
              </span>
              <button onClick={handleBuyHintForCurrentGame} disabled={!canBuyHint}>
                Trocar
              </button>
            </div>
          </div>
        </div>

        <div className="reward-card">
          <div className="reward-top">
            <div className="reward-icon">💗</div>
            <div>
              <h3>Vida</h3>
              <p>
                Compre 1 vida extra por 20 moedas. Esta troca só fica disponível
                quando suas vidas estiverem zeradas.
              </p>
            </div>
          </div>

          <div className="reward-bottom">
            <div>
              <span className="reward-label">Custo</span>
              <div className="reward-cost">20 moedas</div>
            </div>

            <div className="reward-action">
              <span>Possui: {lives}</span>
              <button onClick={handleBuyLife} disabled={!canBuyLife}>
                Trocar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}