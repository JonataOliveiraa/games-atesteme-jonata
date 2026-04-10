import { Link } from "react-router-dom";
import { useBeepSound } from "../hooks/useBeepSound";
import { useGame } from "../context/useGame";
import type { Game } from "../types/game";

type Props = {
  game: Game;
};

export default function GameCard({ game }: Props) {
  const { playBeep } = useBeepSound({
    frequency: 880,
    duration: 70,
    volume: 0.12,
    type: "sine",
  });

  const { canPlay, blockedUntil } = useGame();

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!canPlay) {
      event.preventDefault();
      alert(
        `Você está bloqueada para jogar no momento.${
          blockedUntil ? ` Liberação automática em: ${new Date(blockedUntil).toLocaleString("pt-BR")}.` : ""
        }`
      );
    }
  };

  return (
    <Link
      to={`/jogos/${game.slug}`}
      className="game-card-link"
      onMouseEnter={playBeep}
      onClick={handleClick}
    >
      <div className={`game-card ${!canPlay ? "game-card-disabled" : ""}`}>
        <div className="game-card-top">
          <div className="game-icon-box">{game.icon}</div>
        </div>

        <div className="game-card-content">
          <h3>{game.title}</h3>
          <p>{game.description}</p>

          <div className="game-meta">
            <span>{game.category}</span>
            <span>+{game.points} pts</span>
          </div>
        </div>
      </div>
    </Link>
  );
}