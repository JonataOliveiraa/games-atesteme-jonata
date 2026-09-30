import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { GameContext } from "./gameContextInstance";
import { resolveGameId } from "../data/gameIndex";
import { STORAGE_KEY, readPersistedState } from "./migrateState";
import type {
  BlockedGamesMap,
  GameEventPayload,
  UserGameHistory,
} from "../types/platform";

/**
 * ══════════════════════════════════════════════════════════════════════
 *  AS VIDAS SÃO DA PLATAFORMA, A DERROTA É DO JOGO
 * ══════════════════════════════════════════════════════════════════════
 *
 * O jogo não sabe que vidas existem. Ele decide sozinho quando a partida
 * foi perdida e emite `GAME_OVER`; aqui, isso bloqueia o jogo por 24 horas.
 *
 * A vida é a moeda que desfaz o bloqueio antes do prazo: uma vida, um jogo
 * desbloqueado. Perder NÃO gasta vida, e ter vidas NÃO evita o bloqueio.
 *
 * O saldo começa infinito porque isto é o protótipo. `JSON.stringify` grava
 * `Infinity` como `null`, e o `??` do `loadInitialState` devolve o saldo
 * inicial — então trocar esta constante por um número é a mudança inteira.
 */
const INITIAL_LIVES = Infinity;
const EXTRA_LIFE_COST = 20;
const UNLOCK_LIFE_COST = 1;
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000;
const CORRECT_POINTS = 5;
const WRONG_POINTS = -5;
const STREAK_BONUS_POINTS = 5;
const NO_ERROR_BONUS_POINTS = 5;

type PlatformState = {
  points: number;
  lives: number;
  extraLifeCost: number;
  blockedGames: BlockedGamesMap;
  history: UserGameHistory[];
  gameStreaks: Record<string, number>;
  gameErrorCounts: Record<string, number>;
};

export type GameContextType = {
  points: number;
  lives: number;
  extraLifeCost: number;
  unlockLifeCost: number;
  history: UserGameHistory[];
  blockedGames: BlockedGamesMap;
  blockedGamesCount: number;
  handleGameEvent: (event: GameEventPayload) => void;
  isGameBlocked: (gameId: string) => boolean;
  getGameBlockedUntil: (gameId: string) => string | null;
  getBlockedGames: () => BlockedGamesMap;
  buyExtraLife: () => boolean;
  unlockGameAccess: (gameId: string) => boolean;
  resetProgress: () => void;
};

type Props = {
  children: ReactNode;
};

const INITIAL_STATE: PlatformState = {
  points: 1000000000,
  lives: INITIAL_LIVES,
  extraLifeCost: EXTRA_LIFE_COST,
  blockedGames: {},
  history: [],
  gameStreaks: {},
  gameErrorCounts: {},
};

function normalizeGameId(gameId: string): string {
  return resolveGameId(gameId) ?? gameId;
}

function getBlockedUntil(): string {
  return new Date(Date.now() + BLOCK_DURATION_MS).toISOString();
}

function createHistoryItem(
  gameId: string,
  stage: number,
  eventType: UserGameHistory["eventType"],
  pointsEarned: number
): UserGameHistory {
  return {
    gameId: normalizeGameId(gameId),
    stage,
    eventType,
    pointsEarned,
    createdAt: new Date().toISOString(),
  };
}

function isBlockStillActive(blockedUntil: string | null | undefined): boolean {
  if (!blockedUntil) return false;
  return new Date(blockedUntil).getTime() > Date.now();
}

function normalizeBlockedGames(
  blockedGames: BlockedGamesMap,
  history: UserGameHistory[]
): { blockedGames: BlockedGamesMap; history: UserGameHistory[] } {
  const nextBlockedGames: BlockedGamesMap = {};
  const newHistoryItems: UserGameHistory[] = [];

  Object.entries(blockedGames).forEach(([gameId, blockedUntil]) => {
    if (isBlockStillActive(blockedUntil)) {
      nextBlockedGames[gameId] = blockedUntil;
      return;
    }

    newHistoryItems.push(createHistoryItem(gameId, 0, "UNLOCKED_BY_TIME", 0));
  });

  if (newHistoryItems.length === 0) {
    return {
      blockedGames: nextBlockedGames,
      history,
    };
  }

  return {
    blockedGames: nextBlockedGames,
    history: [...newHistoryItems, ...history],
  };
}

function normalizeState(state: PlatformState): PlatformState {
  const normalized = normalizeBlockedGames(state.blockedGames, state.history);

  return {
    ...state,
    blockedGames: normalized.blockedGames,
    history: normalized.history,
  };
}

function loadInitialState(): PlatformState {
  const parsed = readPersistedState() as Partial<PlatformState> | null;

  if (!parsed) {
    return INITIAL_STATE;
  }

  return normalizeState({
    points: parsed.points ?? INITIAL_STATE.points,
    lives: parsed.lives ?? INITIAL_STATE.lives,
    extraLifeCost: parsed.extraLifeCost ?? INITIAL_STATE.extraLifeCost,
    blockedGames: parsed.blockedGames ?? {},
    history: parsed.history ?? [],
    gameStreaks: parsed.gameStreaks ?? {},
    gameErrorCounts: parsed.gameErrorCounts ?? {},
  });
}

export function GameProvider({ children }: Props) {
  const [state, setState] = useState<PlatformState>(loadInitialState);

  /**
   * ══════════════════════════════════════════════════════════════════════
   *  O ESPELHO DO ESTADO, PARA QUEM PRECISA DE RESPOSTA NA HORA
   * ══════════════════════════════════════════════════════════════════════
   *
   * `setState(prev => ...)` roda DEPOIS. Marcar `let deu = true` lá dentro
   * não adianta: quando a função retorna, a variável ainda vale `false`, e
   * quem chamou lê "não deu certo" para uma operação que deu.
   *
   * Foi exatamente o bug do "Desbloquear jogo": o desbloqueio acontecia (os
   * pontos saíam, o jogo liberava), `unlockGameAccess` devolvia `false`, a
   * página desistia antes de fechar o modal — e o GAME OVER ficava na tela
   * por cima de um jogo já liberado.
   *
   * Com o espelho, a decisão é tomada sobre o estado ATUAL e devolvida na
   * mesma batida. O atualizador continua com as mesmas guardas, para que uma
   * segunda chamada não cobre duas vezes.
   */
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((prev) => normalizeState(prev));
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const handleGameEvent = useCallback((event: GameEventPayload) => {
    setState((prev) => {
      const normalizedGameId = normalizeGameId(event.gameId);

      const nextBlockedGames = { ...prev.blockedGames };
      const nextGameStreaks = { ...prev.gameStreaks };
      const nextGameErrorCounts = { ...prev.gameErrorCounts };

      const historyItems: UserGameHistory[] = [];
      let nextPoints = prev.points;

      switch (event.type) {
        case "CORRECT_ANSWER": {
          nextPoints += CORRECT_POINTS;
          historyItems.push(
            createHistoryItem(
              normalizedGameId,
              event.stage,
              "CORRECT_ANSWER",
              CORRECT_POINTS
            )
          );

          const nextStreak = (nextGameStreaks[normalizedGameId] ?? 0) + 1;
          nextGameStreaks[normalizedGameId] = nextStreak;

          if (nextStreak % 3 === 0) {
            nextPoints += STREAK_BONUS_POINTS;
            historyItems.unshift(
              createHistoryItem(
                normalizedGameId,
                event.stage,
                "STREAK_BONUS",
                STREAK_BONUS_POINTS
              )
            );
          }

          break;
        }

        case "WRONG_ANSWER": {
          nextPoints = Math.max(0, nextPoints + WRONG_POINTS);
          historyItems.push(
            createHistoryItem(
              normalizedGameId,
              event.stage,
              "WRONG_ANSWER",
              WRONG_POINTS
            )
          );

          nextGameStreaks[normalizedGameId] = 0;
          nextGameErrorCounts[normalizedGameId] =
            (nextGameErrorCounts[normalizedGameId] ?? 0) + 1;

          break;
        }

        case "GAME_COMPLETED": {
          historyItems.push(
            createHistoryItem(normalizedGameId, event.stage, "GAME_COMPLETED", 0)
          );

          const errorCount = nextGameErrorCounts[normalizedGameId] ?? 0;
          if (errorCount === 0) {
            nextPoints += NO_ERROR_BONUS_POINTS;
            historyItems.unshift(
              createHistoryItem(
                normalizedGameId,
                event.stage,
                "NO_ERROR_BONUS",
                NO_ERROR_BONUS_POINTS
              )
            );
          }

          nextGameStreaks[normalizedGameId] = 0;
          nextGameErrorCounts[normalizedGameId] = 0;
          break;
        }

        case "GAME_OVER": {
          historyItems.push(
            createHistoryItem(normalizedGameId, event.stage, "GAME_OVER", 0)
          );

          nextBlockedGames[normalizedGameId] = getBlockedUntil();

          historyItems.unshift(
            createHistoryItem(normalizedGameId, event.stage, "BLOCKED", 0)
          );

          nextGameStreaks[normalizedGameId] = 0;
          nextGameErrorCounts[normalizedGameId] = 0;
          break;
        }

        case "PHASE_COMPLETED": {
          historyItems.push(
            createHistoryItem(normalizedGameId, event.stage, "PHASE_COMPLETED", 0)
          );
          break;
        }

        default:
          break;
      }

      return normalizeState({
        ...prev,
        points: nextPoints,
        blockedGames: nextBlockedGames,
        history: [...historyItems, ...prev.history],
        gameStreaks: nextGameStreaks,
        gameErrorCounts: nextGameErrorCounts,
      });
    });
  }, []);

  const isGameBlocked = useCallback(
    (gameId: string) => {
      const normalizedGameId = normalizeGameId(gameId);
      const blockedUntil = state.blockedGames[normalizedGameId];
      return isBlockStillActive(blockedUntil);
    },
    [state.blockedGames]
  );

  const getGameBlockedUntil = useCallback(
    (gameId: string) => {
      const normalizedGameId = normalizeGameId(gameId);
      const blockedUntil = state.blockedGames[normalizedGameId];
      return isBlockStillActive(blockedUntil) ? blockedUntil : null;
    },
    [state.blockedGames]
  );

  const getBlockedGames = useCallback(() => {
    return state.blockedGames;
  }, [state.blockedGames]);

  const buyExtraLife = useCallback(() => {
    const atual = stateRef.current;

    if (atual.points < atual.extraLifeCost) {
      return false;
    }

    setState((prev) => {
      if (prev.points < prev.extraLifeCost) {
        return prev;
      }

      return normalizeState({
        ...prev,
        points: prev.points - prev.extraLifeCost,
        lives: prev.lives + 1,
        history: [
          createHistoryItem("", 0, "BOUGHT_EXTRA_LIFE", -prev.extraLifeCost),
          ...prev.history,
        ],
      });
    });

    return true;
  }, []);

  const unlockGameAccess = useCallback((gameId: string) => {
    const normalizedGameId = normalizeGameId(gameId);
    const atual = stateRef.current;

    if (!isBlockStillActive(atual.blockedGames[normalizedGameId])) {
      return false;
    }

    if (atual.lives < UNLOCK_LIFE_COST) {
      return false;
    }

    setState((prev) => {
      const blockedUntil = prev.blockedGames[normalizedGameId];

      if (!isBlockStillActive(blockedUntil)) {
        return prev;
      }

      if (prev.lives < UNLOCK_LIFE_COST) {
        return prev;
      }

      const nextBlockedGames = { ...prev.blockedGames };

      delete nextBlockedGames[normalizedGameId];

      return normalizeState({
        ...prev,
        lives: prev.lives - UNLOCK_LIFE_COST,
        blockedGames: nextBlockedGames,
        history: [
          createHistoryItem(normalizedGameId, 0, "UNLOCKED_BY_LIFE", 0),
          ...prev.history,
        ],
      });
    });

    return true;
  }, []);

  const resetProgress = useCallback(() => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const blockedGamesCount = useMemo(() => {
    return Object.values(state.blockedGames).filter((blockedUntil) =>
      isBlockStillActive(blockedUntil)
    ).length;
  }, [state.blockedGames]);

  const value = useMemo<GameContextType>(
    () => ({
      points: state.points,
      lives: state.lives,
      extraLifeCost: state.extraLifeCost,
      unlockLifeCost: UNLOCK_LIFE_COST,
      history: state.history,
      blockedGames: state.blockedGames,
      blockedGamesCount,
      handleGameEvent,
      isGameBlocked,
      getGameBlockedUntil,
      getBlockedGames,
      buyExtraLife,
      unlockGameAccess,
      resetProgress,
    }),
    [
      state.points,
      state.lives,
      state.extraLifeCost,
      state.history,
      state.blockedGames,
      blockedGamesCount,
      handleGameEvent,
      isGameBlocked,
      getGameBlockedUntil,
      getBlockedGames,
      buyExtraLife,
      unlockGameAccess,
      resetProgress,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}