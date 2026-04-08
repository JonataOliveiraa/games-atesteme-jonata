import { Link } from "react-router-dom";
import type { Game } from "../types/game";

type Props = {
  game: Game;
};

export default function GameCard({ game }: Props) {
  return (
    <Link to={`/jogos/${game.slug}`} className="game-card-link">
      <div className="game-card">
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