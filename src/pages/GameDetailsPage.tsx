import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/useGame";
import { games } from "../data/games";
import { useBeepSound } from "../hooks/useBeepSound";

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { points, canPlay, blockedUntil, handleGameEvent } = useGame();

  const { playBeep } = useBeepSound({
    frequency: 700,
    duration: 80,
    volume: 0.14,
    type: "sine",
  });

  const game = games.find((item) => item.slug === slug);

  useEffect(() => {
    if (!canPlay) {
      navigate("/", { replace: true });
    }
  }, [canPlay, navigate]);

  const handleCorrectAnswer = () => {
    playBeep();
    handleGameEvent({
      type: "CORRECT_ANSWER",
      gameId: slug ?? "unknown-game",
      stage: 1,
      pointsEarned: 10,
    });
    alert("Acerto registrado. +10 pontos.");
  };

  const handleStreakBonus = () => {
    playBeep();
    handleGameEvent({
      type: "STREAK_BONUS",
      gameId: slug ?? "unknown-game",
      stage: 1,
      pointsEarned: 10,
    });
    alert("Bônus de sequência registrado. +10 pontos.");
  };

  const handleNoErrorBonus = () => {
    playBeep();
    handleGameEvent({
      type: "NO_ERROR_BONUS",
      gameId: slug ?? "unknown-game",
      stage: 1,
      pointsEarned: 10,
    });
    alert("Bônus por jogo sem erros registrado. +10 pontos.");
  };

  const handlePhaseCompleted = () => {
    playBeep();
    handleGameEvent({
      type: "PHASE_COMPLETED",
      gameId: slug ?? "unknown-game",
      stage: 1,
      pointsEarned: 0,
    });
    alert("Fase concluída registrada.");
  };

  const handleGameCompleted = () => {
    playBeep();
    handleGameEvent({
      type: "GAME_COMPLETED",
      gameId: slug ?? "unknown-game",
      stage: 1,
      pointsEarned: 0,
    });
    alert("Conclusão do jogo registrada.");
  };

  const handleGameOver = () => {
    playBeep();
    handleGameEvent({
      type: "GAME_OVER",
      gameId: slug ?? "unknown-game",
      stage: 1,
      pointsEarned: 0,
    });
    alert("Game over registrado. A plataforma foi bloqueada por 2 dias.");
    navigate("/", { replace: true });
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

  if (!canPlay) {
    return (
      <section>
        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/")}
        >
          {"<"} Voltar
        </button>

        <h1 className="page-title">Acesso bloqueado</h1>
        <p className="page-subtitle">
          Você não pode abrir jogos agora.
          {blockedUntil && (
            <>
              {" "}
              Liberação automática em{" "}
              <strong>{new Date(blockedUntil).toLocaleString("pt-BR")}</strong>.
            </>
          )}
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
            <span className="player-label">Jogador(a)</span>
            <strong>Nome do usuário</strong>
          </div>
        </div>

        <div className="game-resources">
          <div className="resource-card">
            <span className="resource-icon">⭐</span>
            <div className="resource-text">
              <span>Pontos</span>
              <strong>{points}</strong>
            </div>
          </div>

          <div className="resource-card">
            <span className="resource-icon">🎮</span>
            <div className="resource-text">
              <span>Status</span>
              <strong>Liberado</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="game-area">
        <div className="game-screen">
          <h2>Área do jogo</h2>
          <p>
            Aqui o Phaser vai rodar o jogo. Por enquanto, os botões abaixo
            simulam os eventos que o jogo vai enviar para a plataforma.
          </p>

          <div className="game-actions">
            <button onClick={handleCorrectAnswer}>
              Simular acerto (+10 pontos)
            </button>

            <button onClick={handleStreakBonus}>
              Simular 3 acertos seguidos (+10 pontos)
            </button>

            <button onClick={handleNoErrorBonus}>
              Simular jogo sem erros (+10 pontos)
            </button>

            <button onClick={handlePhaseCompleted}>
              Simular conclusão de fase
            </button>

            <button onClick={handleGameCompleted}>
              Simular conclusão do jogo
            </button>

            <button onClick={handleGameOver}>
              Simular game over
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}