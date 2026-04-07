export default function ResourcesPage() {
  return (
    <section>
      <h1 className="page-title">Recursos</h1>
      <p className="page-subtitle">
        Acompanhe sua pontuação e troque por recompensas.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div>
            <h3>Pontuação Total</h3>
            <strong>0</strong>
            <p>pontos acumulados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💡</div>
          <div>
            <h3>Dicas</h3>
            <strong>0</strong>
            <p>disponíveis</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💗</div>
          <div>
            <h3>Vidas Extra</h3>
            <strong>0</strong>
            <p>disponíveis</p>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <h2>⭐ Troque seus pontos</h2>
      </div>

      <div className="rewards-grid">
        <div className="reward-card">
          <div className="reward-top">
            <div className="reward-icon">💡</div>
            <div>
              <h3>Dica</h3>
              <p>
                Receba uma dica para te ajudar a avançar nos jogos. Use quando
                estiver em dúvida!
              </p>
            </div>
          </div>

          <div className="reward-bottom">
            <div>
              <span className="reward-label">Custo</span>
              <div className="reward-cost">100 pts</div>
            </div>

            <div className="reward-action">
              <span>Possui: 0</span>
              <button>Trocar</button>
            </div>
          </div>
        </div>

        <div className="reward-card">
          <div className="reward-top">
            <div className="reward-icon">💗</div>
            <div>
              <h3>Vida Extra</h3>
              <p>
                Ganhe mais uma chance nos jogos. Ideal para quando você está quase
                vencendo!
              </p>
            </div>
          </div>

          <div className="reward-bottom">
            <div>
              <span className="reward-label">Custo</span>
              <div className="reward-cost">150 pts</div>
            </div>

            <div className="reward-action">
              <span>Possui: 0</span>
              <button>Trocar</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}