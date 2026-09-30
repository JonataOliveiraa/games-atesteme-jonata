import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { useGame } from "../context/useGame";
import { formatLives } from "../context/formatLives";
import { getGameBySlug, loadGameConfig } from "../data/gameIndex";
import { getGameInstructions } from "../data/gameInstructions";
import GameFrame from "../platform/components/GameFrame";
import type { PlatformEvent } from "../shared/contracts/platformEvents";
import type { GameEventPayload } from "../types/platform";
import type Phaser from "phaser";
import { EventBus } from "../shared/EventBus";
import { gameBridge } from "../shared/bridge/gameBridge";
import { ESPERA_PARA_VER_O_ERRO_MS } from "../shared/bridge/partida";
import { useBeepSound } from "../hooks/useBeepSound";
import SkillInfoButton from "../components/SkillInfoButton";

const GAMES_WITH_IN_GAME_COMPLETION_SCREEN = new Set([
  "garra-dos-grupos",
  "pescaria-dos-codigos",
  "maquina-dos-ajudantes",
  "labirinto-do-cofrinho",
  "subida-do-dia",
  "balao-do-recado",
  "decolagem-passo-a-passo",
  "canteiro-de-obras",
  "achados-e-perdidos",
  "maratona-do-algoritmo",
  "trilha-do-amanha",
  "guilda-dos-criadores",
  "olha-o-jornal",
  "dia-sem-internet",
  "maestro-do-sistema",
  "raio-x-da-maquina",
  "robo-sorrateiro",
  "portoes-logicos",
  "metro-mirim",
  "oficina-dos-algoritmos",
  "pixel-secreto",
  "ilha-dos-codigos",
  "guardioes-dos-dados",
  "desfile-do-robo-repetidor",
  "serie-do-campeao",
  "fabrica-de-maquinas",
  "vila-das-maquinas",
  "fuga-do-laboratorio",
  "bolhas-da-seguranca",
  "cabo-de-guerra-da-verdade",
  "missao-em-pedacos",
  "corrida-do-cotidiano",
  "corra-enquanto",
  "corrida-dos-parecidos",
  "ritmo-da-rotina",
  "pulo-programado",
  "passe-da-mensagem",
  "detetive-dos-modelos",
  "montador-de-informacoes",
  "a-busca-do-bibliotecario",
  "torres-dos-formatos",
  "caverna-dos-dados",
  "formato-certo",
  "central-de-entrada-e-saida",
  "fase-de-entrada-e-saida",
  "detetives-da-busca",
  "estudio-multiformato",
  "show-de-formatos",
  "ache-o-suspeito",
  "investigacao-dados-risco",
  "batalha-das-coordenadas",
  "arquivo-dos-registros",
  "predio-dos-lacos",
  "tradutor-da-maquina",
  "pista-binaria",
  "atelier-codigos-digitais",
  "expedicao-pixel",
  "estudio-producao-digital",
  "mesa-de-edicao",
  "missao-etica-digital",
  "guardiao-etico",
  "duelo-das-fontes",
  "revezamento-em-lista",
  "caca-fonte-confiavel",
  "baralho-das-listas",
  "mapas-em-rede",
  "arena-da-logica",
  "sistema-operacional",
  "cidade-das-decisoes",
  "monte-seu-computador",
  "missao-arquivo-seguro",
  "futuro-em-cena",
  "escolha-a-ferramenta-certa",
  "kit-do-solucionador"
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
  points: number
): string {
  const query = new URLSearchParams({
    embed: "1",
    inline: "1",
    stage: String(stage),
    points: String(points),
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
    lives,
    extraLifeCost,
    unlockLifeCost,
    handleGameEvent,
    isGameBlocked,
    getGameBlockedUntil,
    buyExtraLife,
    unlockGameAccess,
  } = useGame();

  const [gameConfig, setGameConfig] =
    useState<Phaser.Types.Core.GameConfig | null>(null);

  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);

  const [showGameOverModal, setShowGameOverModal] = useState(false);
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
  const gameOverTimerRef = useRef<number | undefined>(undefined);

  // saiu do jogo (ou da página) antes de o modal abrir: ele não abre mais
  useEffect(
    () => () => window.clearTimeout(gameOverTimerRef.current),
    [hasStartedGame]
  );

  const game = slug ? getGameBySlug(slug) : undefined;

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
        ? urlDoJogoEmbutido(game.slug, currentLevel, points)
        : "",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game, hasStartedGame]
  );

  useEffect(() => {
    const exitGame = () => {
      setHasStartedGame(false);
      navigate(-1);
    };

    const backToStart = () => {
      setHasStartedGame(false);
    };

    const closeGameModals = () => {
      setShowGameOverModal(false);
    };

    window.addEventListener("pixel-secret-exit-game", exitGame);
    EventBus.on("exit-game", exitGame);
    EventBus.on("game-back-to-start", backToStart);
    EventBus.on("close-game-modals", closeGameModals);

    return () => {
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

  const blocked = isGameBlocked(game.id);
  const blockedUntil = getGameBlockedUntil(game.id);
  const canUnlock = lives >= unlockLifeCost;
  const livesLabel = formatLives(lives);

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

      /*
       * O erro aqui é só aviso e pontos. Quem decide a derrota é o jogo: se
       * este erro encerrou a partida, o `GAME_OVER` vem logo atrás.
       */
      case "WRONG_ANSWER": {
        dispatchPlatformGameEvent({
          type: "WRONG_ANSWER",
          gameId: event.gameId,
          stage: event.stage,
          pointsEarned: event.pointsEarned,
        });

        streakRef.current = 0;
        errorCountRef.current += 1;

        showToast("-5 pontos", "error");

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

        /*
         * O bloqueio já foi gravado acima, na hora. O modal espera: o jogo
         * segue mostrando o erro por `ESPERA_PARA_VER_O_ERRO_MS` antes de
         * alguma coisa cobri-lo.
         */
        window.clearTimeout(gameOverTimerRef.current);
        gameOverTimerRef.current = window.setTimeout(() => {
          gameBridge.send({ type: 'PAUSE_GAME' });
          setShowGameOverModal(true);
        }, ESPERA_PARA_VER_O_ERRO_MS);

        return;
      }
    }
  };

  const handleBuyLife = () => {
    if (!buyExtraLife()) {
      showToast("Pontos insuficientes para comprar uma vida.", "error");
      return;
    }

    showToast("+1 vida adquirida ❤️", "success");
  };

  const handleUnlock = () => {
    if (!blocked) {
      setShowGameOverModal(false);
      setCurrentLevel(1);
      setHasStartedGame(false);
      showToast("Este jogo já está liberado.", "success");
      return;
    }

    if (!canUnlock) {
      showToast("Você está sem vidas para desbloquear este jogo.", "error");
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
    showToast("Jogo desbloqueado com 1 vida.", "success");
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
    setShowInstructions(false);
    setHasStartedGame(true);
  };


  const gameInstructions = getGameInstructions(game.slug);

  useEffect(() => {
    const hasBlockingOverlay = showGameOverModal;

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
  }, [showGameOverModal]);

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

          <h1 className="page-title game-title-row">
          {game.title}
          <SkillInfoButton skill={game.skill} />
        </h1>
          <p className="page-subtitle">
            Este jogo está bloqueado por 24 horas porque houve game over.
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
                    {unlockLifeCost} vida.
                  </p>
                </div>
              </div>

              <div className="reward-bottom">
                <div>
                  <span className="reward-label">Custo</span>
                  <div className="reward-cost">{unlockLifeCost} vida</div>
                </div>

                <div className="reward-action">
                  <span>Suas vidas: {livesLabel}</span>
                  <button
                    type="button"
                    onClick={handleUnlock}
                    disabled={!canUnlock}
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
                  <h3>Vidas</h3>
                  <p>Cada vida desbloqueia um jogo bloqueado.</p>
                </div>
              </div>

              <div className="reward-bottom">
                <div>
                  <span className="reward-label">Vidas</span>
                  <div className="reward-cost">{livesLabel}</div>
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

        <h1 className="page-title game-title-row">
          {game.title}
          <SkillInfoButton skill={game.skill} />
        </h1>

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
                <strong>{livesLabel}</strong>
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
              O jogo foi bloqueado por 24 horas.
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
              {!blocked ? (
                <>Este jogo já está liberado. Você pode voltar aos jogos ou iniciar novamente.</>
              ) : canUnlock ? (
                <>Você pode desbloquear agora usando {unlockLifeCost} vida. Você tem {livesLabel} vida{lives === 1 ? '' : 's'}.</>
              ) : (
                <>Você está sem vidas. Compre uma vida por {extraLifeCost} pontos para desbloquear.</>
              )}
            </p>

            <div className="game-over-actions">
              {blocked && canUnlock && (
                <button
                  type="button"
                  className="game-over-primary-btn"
                  onClick={handleUnlock}
                >
                  Desbloquear jogo
                </button>
              )}

              {blocked && !canUnlock && (
                <button
                  type="button"
                  className="game-over-primary-btn"
                  onClick={handleBuyLife}
                  disabled={points < extraLifeCost}
                >
                  Comprar vida
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
