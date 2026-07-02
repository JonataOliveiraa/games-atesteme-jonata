import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { useGame } from "../context/useGame";
import { games } from "../data/games";
import GameFrame from "../platform/components/GameFrame";
import type { GameCode } from "../shared/types/game";
import type { PlatformEvent } from "../shared/contracts/platformEvents";
import type { GameEventPayload } from "../types/platform";
import type Phaser from "phaser";
import { EventBus } from "../shared/EventBus";
import { gameBridge } from "../shared/bridge/gameBridge";
import { useBeepSound } from "../hooks/useBeepSound";

const SLUG_TO_CODE: Record<string, GameCode> = {
  "base-dos-classificadores": "EF01CO01",
  "trilha-do-passo-a-passo": "EF01CO02",
  "oficina-dos-algoritmos": "EF01CO03",
  "pixel-secreto": "EF01CO05",
  "desktop-digital-infantil": "EF01CO06",
  "guardioes-dos-dados": "EF01CO07",
  "hangar-dos-modelos": "EF02CO01",
  "desfile-do-robo-repetidor": "EF02CO02",
  "fabrica-de-maquinas": "EF02CO03",
  "museu-vivo-do-computador": "EF02CO04",
  "checklist-do-jogador-seguro": "EF02CO06",
  "tribunal-do-verdadeiro-ou-falso": "EF03CO01",
  "cidade-das-tecnologias": "EF02CO05",
  "chef-dos-subproblemas": "EF03CO03",
  "labirinto-do-enquanto": "EF03CO02",
  "montador-de-informacoes": "EF03CO04",
  "formato-certo": "EF03CO05",
  "central-de-entrada-e-saida": "EF03CO06",
  "detetives-da-busca": "EF03CO07",
  "estudio-multiformato": "EF03CO08",
  "investigacao-dados-risco": "EF03CO09",
  "batalha-das-coordenadas": "EF04CO01",
  "arquivo-dos-registros": "EF04CO02",
  "baralho-das-listas": "EF05CO01",
};

const GAME_CONFIG_LOADERS: Partial<
  Record<GameCode, () => Promise<{ default: Phaser.Types.Core.GameConfig }>>
> = {
  EF01CO01: () => import("../games/EF01CO01/index"),
  EF01CO02: () => import("../games/EF01CO02/index"),
  EF01CO03: () => import("../games/EF01CO03/index"),
  EF01CO05: () => import("../games/EF01CO05/index"),
  EF01CO06: () => import("../games/EF01CO06/index"),
  EF01CO07: () => import("../games/EF01CO07/index"),
  EF02CO01: () => import("../games/EF02CO01/index"),
  EF02CO02: () => import("../games/EF02CO02/index"),
  EF02CO03: () => import("../games/EF02CO03/index"),
  EF02CO04: () => import("../games/EF02CO04/index"),
  EF02CO06: () => import("../games/EF02CO06/index"),
  EF03CO01: () => import("../games/EF03CO01/index"),
  EF02CO05: () => import("../games/EF02CO05/index"),
  EF03CO03: () => import("../games/EF03CO03/index"),
  EF03CO02: () => import("../games/EF03CO02/index"),
  EF03CO04: () => import("../games/EF03CO04/index"),
  EF03CO05: () => import("../games/EF03CO05/index"),
  EF03CO06: () => import("../games/EF03CO06/index"),
  EF03CO07: () => import("../games/EF03CO07/index"),
  EF03CO08: () => import("../games/EF03CO08/index"),
  EF03CO09: () => import("../games/EF03CO09/index"),
  EF04CO01: () => import("../games/EF04CO01/index"),
  EF04CO02: () => import("../games/EF04CO02/index"),
  EF05CO01: () => import("../games/EF05CO01/index"),
};

const GAMES_WITH_IN_GAME_COMPLETION_SCREEN = new Set([
  "oficina-dos-algoritmos",
  "pixel-secreto",
  "guardioes-dos-dados",
  "desfile-do-robo-repetidor",
  "fabrica-de-maquinas",
  "montador-de-informacoes",
  "formato-certo",
  "central-de-entrada-e-saida",
  "detetives-da-busca",
  "estudio-multiformato",
  "investigacao-dados-risco",
  "batalha-das-coordenadas",
  "arquivo-dos-registros",
  "baralho-das-listas",
]);

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

  const game = games.find((item) => item.slug === slug);
  const gameCode = slug ? SLUG_TO_CODE[slug] : undefined;
  const isPixelSecreto = game?.slug === "pixel-secreto";
  const startsInsidePhaser = gameCode === "EF01CO02";

  useEffect(() => {
    let cancelled = false;

    async function loadGameConfig() {
      if (!gameCode) return;

      const loader = GAME_CONFIG_LOADERS[gameCode];
      if (!loader) return;

      try {
        const mod = await loader();
        if (!cancelled) {
          setGameConfig(mod.default);
        }
      } catch (error) {
        console.error("Erro ao carregar configuração do jogo:", error);
      }
    }

    loadGameConfig();

    return () => {
      cancelled = true;
    };
  }, [gameCode]);

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

  const gameLives = getGameLives(game.slug);
  const blocked = isGameBlocked(game.slug);
  const blockedUntil = getGameBlockedUntil(game.slug);

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
          `-5 pontos • -1 vida (${livesAfterError} restante${
            livesAfterError === 1 ? "" : "s"
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

    buyExtraLife(game.slug);

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

    const success = unlockGameAccess(game.slug);

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

  const instructionsBySlug: Record<string, string[]> = {
    "oficina-dos-algoritmos": [
      "Arraste os cartões para os espaços numerados.",
      "Monte todos os passos antes de testar.",
      "A ordem certa completa a fase; erros custam pontos e vidas.",
    ],
    "pixel-secreto": [
      "Observe a legenda de cores.",
      "Pinte os espaços corretos da grade.",
      "Complete a imagem escondida para avançar.",
    ],
    "base-dos-classificadores": [
      "Observe as características de cada item.",
      "Arraste para a base correspondente.",
      "Classifique tudo para concluir a fase.",
    ],
    "guardioes-dos-dados": [
      "Leia cada situação com atenção.",
      "Escolha a atitude mais segura.",
      "Proteja os dados para avançar.",
    ],
    "desktop-digital-infantil": [
      "Explore os aplicativos disponíveis.",
      "Use a ferramenta certa para cada missão.",
      "Complete as missões para avançar.",
    ],
    "hangar-dos-modelos": [
      "Compare os veículos apresentados.",
      "Use atributos como rodas, motor e meio.",
      "Classifique corretamente para vencer.",
    ],
    "desfile-do-robo-repetidor": [
      "Escolha uma seta para cada casa do caminho.",
      "Use o botão Dica para ver a regra especial do caminho.",
      "Desvie dos cones e respeite o limite de comandos do nível.",
      "Execute o programa para levar o robô até a estrela.",
    ],
    "fabrica-de-maquinas": [
      "Observe qual produto a fábrica precisa produzir.",
      "Arraste as máquinas embaralhadas para a esteira na ordem correta.",
      "Clique em Iniciar Produção para testar a sequência.",
      "Se a esteira parar, leia a dica e reorganize as etapas.",
    ],
    "museu-vivo-do-computador": [
      "Leia a pergunta no painel à direita.",
      "Toque nos itens do museu que respondem à pergunta.",
      "Clique em Confirmar para validar sua escolha.",
      "Hardware você toca; software é o programa que roda dentro dele.",
    ],
    "checklist-do-jogador-seguro": [
      "Toque em cada item para ativar ou desativar a configuração.",
      "Senha forte e perfil privado devem ficar ativados.",
      "Compras, câmera e conversas com estranhos devem ficar desativados.",
      "Fique atento: novos avisos de risco podem aparecer durante a rodada.",
    ],
    "tribunal-do-verdadeiro-ou-falso": [
      "Leia a sentença apresentada com atenção.",
      "Fique de olho na palavra NÃO — ela pode inverter o sentido da frase.",
      "Toque em Verdadeiro ou Falso para julgar.",
      "No nível 3 você tem 10 segundos por sentença!",
    ],
    "cidade-das-tecnologias": [
      "Toque em cada local do mapa para ver a situação.",
      "Escolha a tecnologia mais adequada para cada caso.",
      "Leia a explicação para entender o motivo da escolha certa.",
      "No nível 3 você decide rápido, sem mapa, com 30 segundos por situação.",
    ],
    "chef-dos-subproblemas": [
      "Toque nas subtarefas para colocá-las na linha do tempo.",
      "Organize-as na ordem certa para resolver a missão principal.",
      "Toque em uma subtarefa já colocada para devolvê-la e trocar a ordem.",
      "No nível 3, duas subtarefas podem ocupar a mesma faixa paralela.",
    ],
    "labirinto-do-enquanto": [
      "Observe a condição do bloco 'enquanto' antes de executar.",
      "O robô se move para frente enquanto a condição for verdadeira.",
      "No nível 2, escolha a condição certa entre as opções.",
      "No nível 3, clique na coluna onde você acha que o robô vai parar antes de executar.",
    ],
    "montador-de-informacoes": [
      "Observe qual informação precisa ser formada.",
      "Arraste cada dado solto para o campo correto.",
      "Clique em Validar informação para testar a combinação.",
      "Dados isolados podem não informar muito, mas juntos formam uma informação útil.",
    ],
    "formato-certo": [
      "Observe qual informação precisa ser guardada.",
      "Escolha a caixa de formato mais adequada.",
      "Arraste os dados para os campos na ordem certa.",
      "Clique em Verificar formato para testar se a informação pode ser lida.",
    ],
    "central-de-entrada-e-saida": [
      "Observe o pedido da central.",
      "Arraste o dispositivo correto para Entrada ou Saída.",
      "Entrada leva informação para o computador; Saída mostra ou toca informação para fora.",
      "Clique em Testar conexão para verificar sua escolha.",
    ],
    "detetives-da-busca": [
      "Leia a pergunta da missão.",
      "Escolha palavras-chave e filtros para melhorar os resultados.",
      "Compare os cartões e selecione a resposta mais útil.",
      "No desafio final, marque também a estratégia de busca usada.",
    ],
    "estudio-multiformato": [
      "No Nível 1, leia a tarefa e toque no formato digital certo (Desenho, Texto, Som ou Foto).",
      "No Nível 2, pinte manchas no canvas para criar um desenho e selecione palavras para a mensagem.",
      "Toque em 'Publicar no Mural' quando sua criação estiver pronta.",
      "No Nível 3, escolha o formato correto para cada missão, crie e publique.",
    ],
    "investigacao-dados-risco": [
      "No Nível 1, decida se cada informação é Segura ou Perigosa de compartilhar.",
      "No Nível 2, leia o cenário e toque na consequência correta do compartilhamento.",
      "No Nível 3, analise o incidente em dois passos: identifique o erro e escolha a atitude certa.",
      "Dados pessoais como endereço, senha e nome da escola nunca devem ser compartilhados online.",
    ],
    "batalha-das-coordenadas": [
      "No Nível 1, toque na célula da grade que corresponde à coordenada chamada (ex: B-3).",
      "No Nível 2, observe onde está o objeto e selecione a coordenada correta entre as opções.",
      "No Nível 3, clique nas células para atacar e encontre todos os navios escondidos.",
      "Coordenadas têm linha (letra) e coluna (número): A-1 é linha A, coluna 1.",
    ],
    "arquivo-dos-registros": [
      "No Nível 1, leia a pergunta e toque na ficha que tem o valor correto no campo pedido.",
      "No Nível 2, examine a ficha aberta e selecione o valor correto do campo perguntado.",
      "No Nível 3, percorra todos os registros e responda à pergunta sobre o conjunto.",
      "Cada ficha é um registro com campos nomeados — como Nome, Cidade, Hobby e Animal.",
    ],
  };

  const gameInstructions =
    instructionsBySlug[game.slug] ?? [
      "Observe o desafio na tela.",
      "Interaja com os elementos do jogo.",
      "Complete o objetivo para ganhar pontos.",
    ];

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
          {gameCode && gameConfig ? (
            hasStartedGame || startsInsidePhaser ? (
              <GameFrame
                gameId={game.slug}
                level={currentLevel}
                points={points}
                lives={gameLives}
                config={gameConfig}
                onPlatformEvent={handlePlatformEvent}
              />
            ) : (
              <div
                className={`game-screen game-entry-cover game-entry-${game.slug} ${
                  showInstructions ? "game-entry-instructions" : ""
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
          ) : gameCode ? (
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
              Você perdeu uma vida.
              <br />
              Deseja comprar uma vida ou continuar com 0 vidas?
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
