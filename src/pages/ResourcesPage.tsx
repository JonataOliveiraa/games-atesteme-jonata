import { useGame } from "../context/useGame";

const TOTAL_GAMES = 12;

export default function ResourcesPage() {
  const {
    coins,
    lives,
    currentGameSlug,
    usedHintsByGame,
    buyLife,
  } = useGame();

  const currentGameHintUsed =
    currentGameSlug ? usedHintsByGame.includes(currentGameSlug) : false;

  const currentGameHintStatus = currentGameSlug
    ? currentGameHintUsed
      ? "Usada"
      : "Disponível"
    : "Nenhum jogo em andamento";

  const usedHintsInOtherGames = currentGameSlug
    ? usedHintsByGame.filter((slug) => slug !== currentGameSlug).length
    : usedHintsByGame.length;

  const remainingHintsInOtherGames = currentGameSlug
    ? Math.max(TOTAL_GAMES - 1 - usedHintsInOtherGames, 0)
    : Math.max(TOTAL_GAMES - usedHintsInOtherGames, 0);

  const handleBuyLife = () => {
    const success = buyLife();

    if (!success) {
      alert("Você não tem moedas suficientes para comprar uma vida.");
    }
  };

  return (
    <section>
      <h1 className="page-title">Recursos</h1>
      <p className="page-subtitle">
        Acompanhe seus recursos e o status das dicas nos jogos.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🪙</div>
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
            <strong>{currentGameHintStatus}</strong>
            <p>
              {currentGameSlug
                ? `Jogo atual: ${currentGameSlug}`
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
            <div className="reward-icon">💗</div>
            <div>
              <h3>Vida</h3>
              <p>
                Compre 1 vida extra para continuar jogando quando precisar.
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
              <button onClick={handleBuyLife}>Trocar</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}