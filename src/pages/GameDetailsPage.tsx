import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { useGame } from "../context/useGame";
import { getGameBySlug, loadGameConfig } from "../data/gameIndex";
import { getGameInstructions } from "../data/gameInstructions";
import GameFrame from "../platform/components/GameFrame";
import type { PlatformEvent } from "../shared/contracts/platformEvents";
import type { GameEventPayload } from "../types/platform";
import type Phaser from "phaser";
import { EventBus } from "../shared/EventBus";
import { gameBridge } from "../shared/bridge/gameBridge";
import { useBeepSound } from "../hooks/useBeepSound";

const GAMES_WITH_IN_GAME_COMPLETION_SCREEN = new Set([
  "oficina-dos-algoritmos",
  "pixel-secreto",
  "ilha-dos-codigos",
  "guardioes-dos-dados",
  "desfile-do-robo-repetidor",
  "fabrica-de-maquinas",
  "corrida-dos-parecidos",
  "ritmo-da-rotina",
  "pulo-programado",
  "passe-da-mensagem",
  "montador-de-informacoes",
  "formato-certo",
  "central-de-entrada-e-saida",
  "detetives-da-busca",
  "estudio-multiformato",
  "investigacao-dados-risco",
  "batalha-das-coordenadas",
  "arquivo-dos-registros",
  "predio-dos-lacos",
  "tradutor-da-maquina",
  "atelier-codigos-digitais",
  "estudio-producao-digital",
  "missao-etica-digital",
  "caca-fonte-confiavel",
  "baralho-das-listas",
  "mapas-em-rede",
  "arena-da-logica",
  "sistema-operacional",
  "cidade-das-decisoes",
  "monte-seu-computador",
  "missao-arquivo-seguro",
  "futuro-em-cena",
  "escolha-a-ferramenta-certa"
]);

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  COMO ESTA PÁGINA RODA O JOGO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `"iframe"` — o jogo roda dentro de um `<iframe>` apontado para a própria
 * rota dele com `?embed=1&inline=1`, e conversa com esta página só por
 * `postMessage`. É a MESMA montagem que a Atesteme vai fazer, exercitada
 * todo dia por nós antes de ser exercitada por eles.
 *
 * `"local"` — o Phaser é montado ao lado desta página, no mesmo contexto JS.
 * Era o único jeito até agosto/2026, e continua aqui como caminho de volta:
 * se o iframe der problema a um dia da apresentação, trocar esta constante
 * devolve o comportamento antigo inteiro, sem tocar em mais nada.
 *
 * Trocar isto NÃO muda o que os 45 jogos fazem. Eles emitem pelo
 * `runtimeGameBridge`, que já entrega nos dois lugares.
 */
const MODO_DO_JOGO: "iframe" | "local" = "iframe";

/**
 * A URL que vai no `src` do iframe.
 *
 * É o mesmo link que uma pessoa abriria no navegador, mais o contexto — e é
 * assim de propósito: o dia em que a Atesteme montar o `src` dela, vai ser
 * esta linha, com `returnBase` e `attempt` no lugar do `inline`.
 *
 * ── ESTA URL PRECISA SER ESTÁVEL ─────────────────────────────────────────
 *
 * Trocar o `src` de um iframe é RECARREGAR a página de dentro. Se `points`
 * entrasse aqui como valor vivo, cada acerto reiniciaria o jogo do zero — e o
 * sintoma ("o jogo volta para o começo quando eu pontuo") não pareceria em
 * nada com a causa.
 *
 * Por isso os valores são congelados no instante em que a partida começa. É o
 * contexto de ABERTURA, que é justamente o que a query serve; o que muda
 * depois anda pelos eventos, não pela URL.
 */
function urlDoJogoEmbutido(
  slug: string,
  stage: 1 | 2 | 3,
  points: number,
  lives: number
): string {
  const query = new URLSearchParams({
    embed: "1",
    inline: "1",
    stage: String(stage),
    points: String(points),
    lives: String(lives),
  });

  return `/jogos/${encodeURIComponent(slug)}?${query}`;
}

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { playBeep } = useBeepSound({
    frequency: 720,
    duration: 70,
    volume: 0.12,
    type: "sine",
  });

  const {
    points,
    extraLifeCost,
    unlockCost,
    handleGameEvent,
    isGameBlocked,
    getGameBlockedUntil,
    getGameLives,
    buyExtraLife,
    unlockGameAccess,
  } = useGame();

  const [gameConfig, setGameConfig] =
    useState<Phaser.Types.Core.GameConfig | null>(null);

  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [showPostUnlockLifeModal, setShowPostUnlockLifeModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [, setCheckpoint] = useState<{
    progress: number;
    score: number;
    stage: number;
    hits?: number;
    errors?: number;
  } | null>(null);

  const streakRef = useRef(0);
  const errorCountRef = useRef(0);
  const lifePurchasePendingRef = useRef(false);
  const alreadyOfferedExtraLifeRef = useRef(false);

  const game = slug ? getGameBySlug(slug) : undefined;
  const isPixelSecreto = game?.slug === "pixel-secreto";

  useEffect(() => {
    let cancelled = false;

    if (!game) return;

    loadGameConfig(game)
      .then((mod) => {
        if (!cancelled) {
          setGameConfig(mod.default);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar configuração do jogo:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [game]);

  useEffect(() => {
    if (game && slug && game.slug !== slug) {
      navigate(`/iframe/${game.slug}`, { replace: true });
    }
  }, [game, slug, navigate]);

  /*
   * O `src` do iframe, congelado na abertura da partida.
   *
   * As dependências são só o jogo e o "já começou" — de propósito. `points` e
   * `currentLevel` mudam durante a partida, e qualquer um deles na lista
   * recarregaria o iframe no meio do jogo. Ver `urlDoJogoEmbutido`.
   */
  const srcDoJogo = useMemo(
    () =>
      game
        ? urlDoJogoEmbutido(game.slug, currentLevel, points, getGameLives(game.id))
        : "",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game, hasStartedGame]
  );

  useEffect(() => {
    const openExtraLifeModal = () => {
      setShowNoLivesModal(true);
    };

    const exitGame = () => {
      setHasStartedGame(false);
      navigate(-1);
    };

    const backToStart = () => {
      setHasStartedGame(false);
    };

    const closeGameModals = () => {
      setShowNoLivesModal(false);
      setShowGameOverModal(false);
    };

    window.addEventListener("pixel-secret-show-extra-life-modal", openExtraLifeModal);
    window.addEventListener("pixel-secret-exit-game", exitGame);
    EventBus.on("exit-game", exitGame);
    EventBus.on("game-back-to-start", backToStart);
    EventBus.on("close-game-modals", closeGameModals);

    return () => {
      window.removeEventListener("pixel-secret-show-extra-life-modal", openExtraLifeModal);
      window.removeEventListener("pixel-secret-exit-game", exitGame);
      EventBus.off("exit-game", exitGame);
      EventBus.off("game-back-to-start", backToStart);
      EventBus.off("close-game-modals", closeGameModals);
    };
  }, [navigate]);

  if (!game) {
    return (
      <section>
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
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

  const gameLives = getGameLives(game.id);
  const blocked = isGameBlocked(game.id);
  const blockedUntil = getGameBlockedUntil(game.id);

  const resumePixelSecreto = () => {
    if (!isPixelSecreto) return;
    window.dispatchEvent(new CustomEvent("pixel-secret-resume-game"));
  };

  const dispatchPixelFinalGameOver = (event: PlatformEvent) => {
    const blockedDate = new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString();

    handleGameEvent({
      type: "GAME_OVER",
      gameId: event.gameId,
      stage: "stage" in event ? event.stage : currentLevel,
      pointsEarned: 0,
    });

    window.dispatchEvent(
      new CustomEvent("pixel-secret-show-final-game-over", {
        detail: {
          blockedUntil: blockedDate,
          unlockCost,
        },
      })
    );
  };

  const dispatchPlatformGameEvent = (event: {
    type: "GAME_OVER" | "GAME_COMPLETED" | "CORRECT_ANSWER" | "WRONG_ANSWER";
    gameId: string;
    stage: number;
    pointsEarned?: number;
  }) => {
    const payload: GameEventPayload = {
      type: event.type,
      gameId: event.gameId,
      stage: event.stage,
      pointsEarned: event.pointsEarned ?? 0,
    };

    handleGameEvent(payload);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, type });
  };

  const handlePlatformEvent = (event: PlatformEvent) => {
    switch (event.type) {
      case "GAME_READY":
        return;

      case "CHECKPOINT": {
        setCheckpoint({
          progress: event.progress,
          score: event.score,
          stage: event.stage,
          hits: event.hits,
          errors: event.errors,
        });

        const nextStage = event.stage as 1 | 2 | 3;

        if (nextStage === 1 || nextStage === 2 || nextStage === 3) {
          setCurrentLevel(nextStage);
        }

        return;
      }

      case "CORRECT_ANSWER": {
        dispatchPlatformGameEvent({
          type: "CORRECT_ANSWER",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: event.pointsEarned,
        });

        streakRef.current += 1;

        if (streakRef.current > 0 && streakRef.current % 3 === 0) {
          showToast("+5 pontos • +5 bônus 🔥 x3 sequência", "success");
        } else {
          showToast("+5 pontos", "success");
        }

        return;
      }

      case "WRONG_ANSWER": {
        const livesBeforeError = gameLives;
        const livesAfterError = Math.max(livesBeforeError - 1, 0);

        if (livesBeforeError <= 0) {
          // Jogador já está sem vidas — não deduzir pontos, ir direto ao game over
          dispatchPlatformGameEvent({
            type: "GAME_OVER",
            gameId: event.gameId,
            stage: event.stage,
            pointsEarned: 0,
          });

          gameBridge.send({ type: 'PAUSE_GAME' });
          setShowNoLivesModal(false);
          setShowGameOverModal(true);

          return;
        }

        dispatchPlatformGameEvent({
          type: "WRONG_ANSWER",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: event.pointsEarned,
        });

        streakRef.current = 0;
        errorCountRef.current += 1;

        showToast(
          `-5 pontos • -1 vida (${livesAfterError} restante${livesAfterError === 1 ? "" : "s"
          })`,
          "error"
        );

        if (livesAfterError === 0) {
          gameBridge.send({ type: 'PAUSE_GAME' });
          setShowNoLivesModal(true);
        }

        return;
      }

      case "GAME_COMPLETED": {
        dispatchPlatformGameEvent({
          type: "GAME_COMPLETED",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: 0,
        });

        if (errorCountRef.current === 0) {
          showToast("⭐ +5 bônus sem erros", "success");
        } else {
          showToast("Fase concluída!", "success");
        }

        if (currentLevel < 3) {
          setCurrentLevel((prev) => (prev + 1) as 1 | 2 | 3);
        } else {
          setCurrentLevel(1);

          if (!GAMES_WITH_IN_GAME_COMPLETION_SCREEN.has(game.slug)) {
            window.setTimeout(() => {
              setHasStartedGame(false);
              setShowCongratsModal(true);
            }, 2400);
          }
        }

        streakRef.current = 0;
        errorCountRef.current = 0;
        return;
      }

      case "GAME_OVER": {
        dispatchPlatformGameEvent({
          type: "GAME_OVER",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: 0,
        });

        streakRef.current = 0;
        gameBridge.send({ type: 'PAUSE_GAME' });
        setShowNoLivesModal(false);
        setShowGameOverModal(true);

        return;
      }
    }
  };

  const handleBuyLife = () => {
    if (lifePurchasePendingRef.current) return;

    if (points < extraLifeCost) {
      showToast("Pontos insuficientes para comprar uma vida.", "error");
      resumePixelSecreto();
      return;
    }

    buyExtraLife(game.id);

    lifePurchasePendingRef.current = true;
    window.setTimeout(() => {
      lifePurchasePendingRef.current = false;
    }, 2000);

    showToast("+1 vida adquirida ❤️", "success");
    setShowNoLivesModal(false);
    setShowPostUnlockLifeModal(false);
    resumePixelSecreto();
  };

  const handleUnlock = () => {
    if (!blocked) {
      setShowGameOverModal(false);
      setCurrentLevel(1);
      setHasStartedGame(false);
      showToast("Este jogo já está liberado.", "success");
      return;
    }

    if (points < unlockCost) {
      showToast("Pontos insuficientes para desbloquear este jogo.", "error");
      return;
    }

    const success = unlockGameAccess(game.id);

    if (!success) {
      showToast("Não foi possível desbloquear este jogo agora.", "error");
      return;
    }

    setShowGameOverModal(false);
    setCurrentLevel(1);
    setHasStartedGame(false);
    setShowPostUnlockLifeModal(true);
    showToast("Jogo desbloqueado com sucesso.", "success");
  };

  const handleCongratsPlayAgain = () => {
    setShowCongratsModal(false);
    setCurrentLevel(1);
    setHasStartedGame(false);
  };

  const handleCongratsExit = () => {
    setShowCongratsModal(false);
    setCurrentLevel(1);
    navigate(-1);
  };

  const handleExit = () => {
    navigate(-1);
  };

  const startGame = () => {
    playBeep();
    alreadyOfferedExtraLifeRef.current = false;
    setShowInstructions(false);
    setHasStartedGame(true);
  };


  const gameInstructions = getGameInstructions(game.slug);

  useEffect(() => {
    const hasBlockingOverlay =
      showNoLivesModal ||
      showGameOverModal;

    const elements = document.querySelectorAll(
      ".phaser-container, .phaser-container canvas, .game-iframe, iframe"
    );

    elements.forEach((element) => {
      if (hasBlockingOverlay) {
        element.classList.add("game-input-blocked");
      } else {
        element.classList.remove("game-input-blocked");
      }
    });

    return () => {
      elements.forEach((element) => {
        element.classList.remove("game-input-blocked");
      });
    };
  }, [showNoLivesModal, showGameOverModal]);

  if (blocked && !hasStartedGame && !showGameOverModal) {
    return (
      <>
        <section>
          <button
            type="button"
            className="back-link"
            onClick={() => navigate(-1)}
          >
            {"<"} Voltar
          </button>

          <h1 className="page-title">{game.title}</h1>
          <p className="page-subtitle">
            Este jogo está bloqueado porque houve game over.
            {blockedUntil && (
              <>
                {" "}
                Liberação automática em{" "}
                <strong>{new Date(blockedUntil).toLocaleString("pt-BR")}</strong>.
              </>
            )}
          </p>

          <div
            className="rewards-grid"
            style={{ marginTop: "24px", maxWidth: 760 }}
          >
            <div className="reward-card">
              <div className="reward-top">
                <div className="reward-icon">🔒</div>
                <div>
                  <h3>Desbloquear este jogo</h3>
                  <p>
                    Você pode aguardar o prazo ou desbloquear agora usando{" "}
                    {unlockCost} pontos.
                  </p>
                </div>
              </div>

              <div className="reward-bottom">
                <div>
                  <span className="reward-label">Custo</span>
                  <div className="reward-cost">{unlockCost} pontos</div>
                </div>

                <div className="reward-action">
                  <span>Seus pontos: {points}</span>
                  <button
                    type="button"
                    onClick={handleUnlock}
                    disabled={points < unlockCost}
                  >
                    Desbloquear jogo
                  </button>
                </div>
              </div>
            </div>

            <div className="reward-card">
              <div className="reward-top">
                <div className="reward-icon">❤️</div>
                <div>
                  <h3>Vidas atuais</h3>
                  <p>
                    Depois do desbloqueio, você pode escolher comprar vidas
                    extras para voltar mais segura ao jogo.
                  </p>
                </div>
              </div>

              <div className="reward-bottom">
                <div>
                  <span className="reward-label">Vidas</span>
                  <div className="reward-cost">{gameLives}</div>
                </div>

                <div className="reward-action">
                  <span>Comprar vida: {extraLifeCost} pontos</span>
                  <button
                    type="button"
                    onClick={handleBuyLife}
                    disabled={points < extraLifeCost}
                  >
                    Comprar vida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ConfirmModal
          isOpen={showPostUnlockLifeModal}
          title="Jogo desbloqueado"
          message={`O jogo "${game.title}" foi desbloqueado e está com 0 vidas. Deseja comprar +1 vida por ${extraLifeCost} pontos agora?`}
          confirmText="Comprar vida"
          cancelText="Depois"
          onConfirm={handleBuyLife}
          onCancel={() => setShowPostUnlockLifeModal(false)}
        />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <section>
        <button className="back-link" onClick={handleExit}>
          {"<"} Voltar
        </button>

        <h1 className="page-title">{game.title}</h1>

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
              <span className="resource-icon">❤️</span>
              <div className="resource-text">
                <span>Vidas</span>
                <strong>{gameLives}</strong>
              </div>
            </div>

            <div className="resource-card">
              <span className="resource-icon">🎮</span>
              <div className="resource-text">
                <span>Status</span>
                <strong>{blocked ? "Bloqueado" : "Liberado"}</strong>
              </div>
            </div>

            <div className="resource-card">
              <span className="resource-icon">🏁</span>
              <div className="resource-text">
                <span>Nível</span>
                <strong>{currentLevel}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="game-area">
          {game && gameConfig ? (
            /*
             * TODOS os jogos passam pela capa.
             *
             * Havia aqui uma exceção para a `trilha-do-passo-a-passo`, que
             * pulava a capa porque tinha uma tela de início DENTRO do Phaser.
             * Essa tela virou código morto em algum momento — o método existia
             * e ninguém mais o chamava —, e a exceção continuou de pé. O
             * resultado era o pior dos dois mundos: o jogo abria direto no
             * tabuleiro, sem a capa da plataforma e sem a dele.
             *
             * Exceção por nome de jogo é uma dívida com juros: ela sobrevive à
             * razão que a criou, porque nada no código a liga ao motivo.
             */
            hasStartedGame ? (
              <GameFrame
                gameId={game.id}
                level={currentLevel}
                points={points}
                lives={gameLives}
                config={gameConfig}
                onPlatformEvent={handlePlatformEvent}
                mode={MODO_DO_JOGO}
                src={srcDoJogo}
              />
            ) : (
              <div
                className={`game-screen game-entry-cover game-entry-${game.slug} ${showInstructions ? "game-entry-instructions" : ""
                  }`}
                style={
                  game.thumbnail
                    ? { backgroundImage: `url(${game.thumbnail})` }
                    : undefined
                }
              >
                <div className="game-entry-overlay">
                  {showInstructions ? (
                    <div className="game-instructions-panel">
                      <div className="game-instructions-tab">Como jogar</div>
                      <h1>{game.title}</h1>

                      <ul className="game-instructions-list">
                        {gameInstructions.map((instruction, index) => (
                          <li key={instruction}>
                            <span className="game-instruction-number">{index + 1}</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="game-entry-actions">
                        <button type="button" onClick={startGame}>
                          <span aria-hidden="true">▶</span>
                          Iniciar Game
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1>{game.title}</h1>

                      <div className="game-entry-actions">
                        <button type="button" onClick={startGame}>
                          <span aria-hidden="true">▶</span>
                          Iniciar
                        </button>

                        <button
                          type="button"
                          className="game-entry-secondary"
                          onClick={() => {
                            playBeep();
                            setShowInstructions(true);
                          }}
                        >
                          <span aria-hidden="true">⚙</span>
                          Instruções
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          ) : game ? (
            <div className="game-screen">
              <p style={{ color: "var(--muted)" }}>Carregando jogo...</p>
            </div>
          ) : (
            <div className="game-screen">
              <h2>Área do jogo</h2>
              <p>
                Aqui o Phaser vai rodar o jogo. Por enquanto, essa área segue como
                placeholder para jogos ainda não implementados.
              </p>
            </div>
          )}
        </div>
      </section>


      {/* TELA FULLSCREEN - PERDEU VIDA */}
      {showNoLivesModal && (
        <div
          className="game-over-overlay"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="game-over-modal">
            <h1 className="game-over-title error">Você cometeu um erro!</h1>

            <p className="game-over-text">
              Você perdeu ponto de vida.
              <br />
              Deseja comprar um ponto de vida ou continuar com 0 pontos de vida?
            </p>

            <p className="game-over-warning">
              Se você continuar com 0 vidas e errar novamente, será Game Over.
            </p>

            <div className="game-over-actions">
              <button
                type="button"
                className="game-over-primary-btn"
                onClick={() => {
                  handleBuyLife();
                  if (!isPixelSecreto) {
                    gameBridge.send({ type: 'RESUME_GAME' });
                  }
                }}
              >
                Comprar vida
              </button>

              <button
                type="button"
                className="game-over-secondary-btn"
                onClick={() => {
                  setShowNoLivesModal(false);
                  resumePixelSecreto();
                  if (!isPixelSecreto) {
                    gameBridge.send({ type: 'RESUME_GAME' });
                  }
                }}
              >
                Continuar assim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELA FULLSCREEN - GAME OVER */}
      {/* TELA FULLSCREEN - GAME OVER */}
      {showGameOverModal && (
        <div
          className="game-over-overlay"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="game-over-modal">
            <h1 className="game-over-title">GAME OVER</h1>

            <p className="game-over-text">
              O jogo foi bloqueado.
              {blockedUntil && (
                <>
                  <br />
                  Liberação automática em:
                  <br />
                  <strong>{new Date(blockedUntil).toLocaleString("pt-BR")}</strong>
                </>
              )}
            </p>

            <p className="game-over-warning">
              {blocked ? (
                <>Você pode desbloquear agora usando {unlockCost} pontos. Você tem {points} ponto{points !== 1 ? 's' : ''}.</>
              ) : (
                <>Este jogo já está liberado. Você pode voltar aos jogos ou iniciar novamente.</>
              )}
            </p>

            <div className="game-over-actions">
              {blocked && (
                <button
                  type="button"
                  className="game-over-primary-btn"
                  onClick={handleUnlock}
                  disabled={points < unlockCost}
                >
                  Desbloquear jogo
                </button>
              )}

              <button
                type="button"
                className="game-over-secondary-btn"
                onClick={() => {
                  setShowGameOverModal(false);
                  setHasStartedGame(false);
                  navigate(-1);
                }}
              >
                Voltar aos jogos
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showCongratsModal}
        title="🏆 Parabéns! Você concluiu o jogo!"
        message={`Você completou todos os 3 níveis de "${game.title}". Excelente trabalho! Deseja jogar novamente ou voltar aos jogos?`}
        confirmText="Jogar novamente"
        cancelText="Voltar aos jogos"
        onConfirm={handleCongratsPlayAgain}
        onCancel={handleCongratsExit}
      />

      <ConfirmModal
        isOpen={showPostUnlockLifeModal}
        title="Jogo desbloqueado"
        message={`O jogo "${game.title}" foi desbloqueado e está com 0 vidas. Deseja comprar +1 vida por ${extraLifeCost} pontos agora?`}
        confirmText="Comprar vida"
        cancelText="Depois"
        onConfirm={handleBuyLife}
        onCancel={() => setShowPostUnlockLifeModal(false)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
