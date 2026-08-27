import { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import { useBeepSound } from "../hooks/useBeepSound";
import { useGame } from "../context/useGame";
import type { Game } from "../types/game";

type Props = {
  game: Game;
};

export default function GameCard(props: Props) {
  if (!props?.game) {
    console.warn("GameCard chamado sem props. Origem:", new Error().stack);
    return null;
  }
  const { game } = props;

  const { playBeep } = useBeepSound({
    frequency: 880,
    duration: 70,
    volume: 0.12,
    type: "sine",
  });

  const { isGameBlocked, getGameBlockedUntil, unlockGameAccess, unlockCost } =
    useGame();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const blocked = isGameBlocked(game.id);
  const blockedUntil = getGameBlockedUntil(game.id);

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!blocked) return;

    event.preventDefault();
    setShowUnlockModal(true);
  };

  const handleConfirmUnlock = () => {
    const success = unlockGameAccess(game.id);

    if (!success) {
      setFeedbackMessage(
        "Você não possui pontos suficientes para liberar este jogo."
      );
      setShowUnlockModal(false);
      return;
    }

    setFeedbackMessage(`O jogo "${game.title}" foi desbloqueado com sucesso.`);
    setShowUnlockModal(false);
  };

  return (
    <>
      <Link
        /* `/iframe/`, e não `/jogos/`: o card leva à página DA PLATAFORMA,
           que tem pontos, vidas e modais, e que desenha o jogo num iframe.
           `/jogos/<slug>` é o canvas puro, e existe para ser embutido. */
        to={`/iframe/${game.slug}`}
        className="game-card-link"
        onMouseEnter={playBeep}
        onClick={handleClick}
      >
        <div className={`game-card ${blocked ? "game-card-disabled" : ""}`}>
          <div
            className="game-card-top"
            style={
              game.thumbnail
                ? { backgroundImage: `url(${game.thumbnail})` }
                : undefined
            }
          />

          <div className="game-card-content">
            <h3>{game.title}</h3>
            <p>{game.description}</p>

            <div className="game-meta">
              <span>{game.category}</span>
              <span>{blocked ? "Bloqueado" : `+${game.points} pts`}</span>
            </div>
          </div>
        </div>
      </Link>

      <ConfirmModal
        isOpen={showUnlockModal}
        title="Jogo bloqueado"
        message={
          blockedUntil
            ? `O jogo "${game.title}" está bloqueado até ${new Date(
              blockedUntil
            ).toLocaleString(
              "pt-BR"
            )} porque suas tentativas foram esgotadas. Deseja liberar o acesso por ${unlockCost} pontos?`
            : `O jogo "${game.title}" está bloqueado porque suas tentativas foram esgotadas. Deseja liberar o acesso por ${unlockCost} pontos?`
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirmUnlock}
        onCancel={() => setShowUnlockModal(false)}
      />

      <ConfirmModal
        isOpen={!!feedbackMessage}
        title="Aviso"
        message={feedbackMessage ?? ""}
        confirmText="Fechar"
        cancelText=""
        onConfirm={() => setFeedbackMessage(null)}
        onCancel={() => setFeedbackMessage(null)}
      />
    </>
  );
}
