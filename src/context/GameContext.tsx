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
  GameLivesMap,
  UserGameHistory,
} from "../types/platform";

const EXTRA_LIFE_COST = 20;
const UNLOCK_COST = 30;
const CORRECT_POINTS = 5;
const WRONG_POINTS = -5;
const STREAK_BONUS_POINTS = 5;
const NO_ERROR_BONUS_POINTS = 5;

type PlatformState = {
  points: number;
  extraLifeCost: number;
  unlockCost: number;
  blockedGames: BlockedGamesMap;
  gameLives: GameLivesMap;
  history: UserGameHistory[];
  gameStreaks: Record<string, number>;
  gameErrorCounts: Record<string, number>;
};

export type GameContextType = {
  points: number;
  extraLifeCost: number;
  unlockCost: number;
  history: UserGameHistory[];
  blockedGames: BlockedGamesMap;
  gameLives: GameLivesMap;
  blockedGamesCount: number;
  handleGameEvent: (event: GameEventPayload) => void;
  isGameBlocked: (gameId: string) => boolean;
  getGameBlockedUntil: (gameId: string) => string | null;
  getBlockedGames: () => BlockedGamesMap;
  getGameLives: (gameId: string) => number;
  buyExtraLife: (gameId: string) => boolean;
  unlockGameAccess: (gameId: string) => boolean;
  resetProgress: () => void;
};

type Props = {
  children: ReactNode;
};

const INITIAL_STATE: PlatformState = {
  points: 1000000000,
  extraLifeCost: EXTRA_LIFE_COST,
  unlockCost: UNLOCK_COST,
  blockedGames: {},
  gameLives: {},
  history: [],
  gameStreaks: {},
  gameErrorCounts: {},
};

function normalizeGameId(gameId: string): string {
  return resolveGameId(gameId) ?? gameId;
}

function getBlockedUntilAfterTwoDays(): string {
  const now = new Date();
  now.setDate(now.getDate() + 2);
  return now.toISOString();
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
    extraLifeCost: parsed.extraLifeCost ?? INITIAL_STATE.extraLifeCost,
    unlockCost: parsed.unlockCost ?? INITIAL_STATE.unlockCost,
    blockedGames: parsed.blockedGames ?? {},
    gameLives: parsed.gameLives ?? {},
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
      const nextGameLives = { ...prev.gameLives };
      const nextGameStreaks = { ...prev.gameStreaks };
      const nextGameErrorCounts = { ...prev.gameErrorCounts };

      const historyItems: UserGameHistory[] = [];
      let nextPoints = prev.points;

      const currentLives =
        normalizedGameId in nextGameLives ? nextGameLives[normalizedGameId] : 1;

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

          if (currentLives <= 0) {
  const blockedUntil = getBlockedUntilAfterTwoDays();

  nextBlockedGames[normalizedGameId] = blockedUntil;
  nextGameLives[normalizedGameId] = 0;

  historyItems.unshift(
    createHistoryItem(normalizedGameId, event.stage, "GAME_OVER", 0),
    createHistoryItem(normalizedGameId, event.stage, "BLOCKED", 0)
  );

  nextGameStreaks[normalizedGameId] = 0;
  nextGameErrorCounts[normalizedGameId] = 0;

  break;
}

const updatedLives = Math.max(0, currentLives - 1);
nextGameLives[normalizedGameId] = updatedLives;

historyItems.unshift(
  createHistoryItem(normalizedGameId, event.stage, "LOST_LIFE", 0)
);

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

          const blockedUntil = getBlockedUntilAfterTwoDays();
          nextBlockedGames[normalizedGameId] = blockedUntil;
          nextGameLives[normalizedGameId] = 0;

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
        gameLives: nextGameLives,
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

  const getGameLives = useCallback(
    (gameId: string) => {
      const normalizedGameId = normalizeGameId(gameId);

      if (normalizedGameId in state.gameLives) {
        return state.gameLives[normalizedGameId];
      }

      return 1;
    },
    [state.gameLives]
  );

  const buyExtraLife = useCallback((gameId: string) => {
    const normalizedGameId = normalizeGameId(gameId);
    const atual = stateRef.current;

    if (atual.points < atual.extraLifeCost) {
      return false;
    }

    setState((prev) => {
      if (prev.points < prev.extraLifeCost) {
        return prev;
      }

      const nextLives = { ...prev.gameLives };
      const currentLives =
        normalizedGameId in nextLives ? nextLives[normalizedGameId] : 1;

      nextLives[normalizedGameId] = currentLives + 1;

      return normalizeState({
        ...prev,
        points: prev.points - prev.extraLifeCost,
        gameLives: nextLives,
        history: [
          createHistoryItem(
            normalizedGameId,
            0,
            "BOUGHT_EXTRA_LIFE",
            -prev.extraLifeCost
          ),
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

    if (atual.points < atual.unlockCost) {
      return false;
    }

    setState((prev) => {
      const blockedUntil = prev.blockedGames[normalizedGameId];

      if (!isBlockStillActive(blockedUntil)) {
        return prev;
      }

      if (prev.points < prev.unlockCost) {
        return prev;
      }

      const nextBlockedGames = { ...prev.blockedGames };
      const nextGameLives = { ...prev.gameLives };

      delete nextBlockedGames[normalizedGameId];
      nextGameLives[normalizedGameId] = 0;

      return normalizeState({
        ...prev,
        points: prev.points - prev.unlockCost,
        blockedGames: nextBlockedGames,
        gameLives: nextGameLives,
        history: [
          createHistoryItem(
            normalizedGameId,
            0,
            "UNLOCKED_BY_POINTS",
            -prev.unlockCost
          ),
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
      extraLifeCost: state.extraLifeCost,
      unlockCost: state.unlockCost,
      history: state.history,
      blockedGames: state.blockedGames,
      gameLives: state.gameLives,
      blockedGamesCount,
      handleGameEvent,
      isGameBlocked,
      getGameBlockedUntil,
      getBlockedGames,
      getGameLives,
      buyExtraLife,
      unlockGameAccess,
      resetProgress,
    }),
    [
      state.points,
      state.extraLifeCost,
      state.unlockCost,
      state.history,
      state.blockedGames,
      state.gameLives,
      blockedGamesCount,
      handleGameEvent,
      isGameBlocked,
      getGameBlockedUntil,
      getBlockedGames,
      getGameLives,
      buyExtraLife,
      unlockGameAccess,
      resetProgress,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}