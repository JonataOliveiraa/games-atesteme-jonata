import { games } from "../data/games";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GameContext } from "./gameContextInstance"
import type {
  BlockedGamesMap,
  GameEventPayload,
  UserGameHistory,
} from "../types/platform";

const STORAGE_KEY = "platform-state-v2";

type PlatformState = {
  points: number;
  unlockCost: number;
  blockedGames: BlockedGamesMap;
  history: UserGameHistory[];
};

export type GameContextType = {
  points: number;
  unlockCost: number;
  history: UserGameHistory[];
  blockedGames: BlockedGamesMap;
  blockedGamesCount: number;
  handleGameEvent: (event: GameEventPayload) => void;
  isGameBlocked: (gameId: string) => boolean;
  getGameBlockedUntil: (gameId: string) => string | null;
  getBlockedGames: () => BlockedGamesMap;
  unlockGameAccess: (gameId: string) => boolean;
  resetProgress: () => void;
};

type Props = {
  children: ReactNode;
};

const INITIAL_STATE: PlatformState = {
  points: 0,
  unlockCost: 30,
  blockedGames: {},
  history: [],
};

const GAME_CODE_TO_SLUG: Record<string, string> = {
  EF01CO01: "base-dos-classificadores",
};

function normalizeGameId(gameId: string): string {
  const gameBySlug = games.find((game) => game.slug === gameId);
  if (gameBySlug) return gameBySlug.slug;

  return GAME_CODE_TO_SLUG[gameId] ?? gameId;
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

    newHistoryItems.push(
      createHistoryItem(gameId, 0, "UNLOCKED_BY_TIME", 0)
    );
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
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return INITIAL_STATE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PlatformState>;

    return normalizeState({
      points: parsed.points ?? INITIAL_STATE.points,
      unlockCost: parsed.unlockCost ?? INITIAL_STATE.unlockCost,
      blockedGames: parsed.blockedGames ?? {},
      history: parsed.history ?? [],
    });
  } catch {
    return INITIAL_STATE;
  }
}

export function GameProvider({ children }: Props) {
  const [state, setState] = useState<PlatformState>(loadInitialState);

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

    const historyItems: UserGameHistory[] = [
      createHistoryItem(
        normalizedGameId,
        event.stage,
        event.type,
        event.pointsEarned
      ),
    ];

    const nextPoints = Math.max(0, prev.points + event.pointsEarned);

    const nextBlockedGames = { ...prev.blockedGames };

    if (event.type === "GAME_OVER") {
      const blockedUntil = getBlockedUntilAfterTwoDays();

      nextBlockedGames[normalizedGameId] = blockedUntil;

      historyItems.unshift(
        createHistoryItem(normalizedGameId, event.stage, "BLOCKED", 0)
      );
    }

    return normalizeState({
      ...prev,
      points: nextPoints,
      blockedGames: nextBlockedGames,
      history: [...historyItems, ...prev.history],
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

  const unlockGameAccess = useCallback((gameId: string) => {
  const normalizedGameId = normalizeGameId(gameId);
  let unlocked = false;

  setState((prev) => {
    const blockedUntil = prev.blockedGames[normalizedGameId];

    if (!isBlockStillActive(blockedUntil)) {
      return prev;
    }

    if (prev.points < prev.unlockCost) {
      return prev;
    }

    const nextBlockedGames = { ...prev.blockedGames };
    delete nextBlockedGames[normalizedGameId];

    unlocked = true;

    return normalizeState({
      ...prev,
      points: prev.points - prev.unlockCost,
      blockedGames: nextBlockedGames,
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

  return unlocked;
}, []);

  const blockedGamesCount = useMemo(() => {
    return Object.values(state.blockedGames).filter((blockedUntil) =>
      isBlockStillActive(blockedUntil)
    ).length;
  }, [state.blockedGames]);

  /*botão reset para teste*/
  const resetProgress = useCallback(() => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<GameContextType>(
    () => ({
      points: state.points,
      unlockCost: state.unlockCost,
      history: state.history,
      blockedGames: state.blockedGames,
      blockedGamesCount,
      handleGameEvent,
      isGameBlocked,
      getGameBlockedUntil,
      getBlockedGames,
      unlockGameAccess,
      resetProgress,
    }),
    [
      state.points,
      state.unlockCost,
      state.history,
      state.blockedGames,
      blockedGamesCount,
      handleGameEvent,
      isGameBlocked,
      getGameBlockedUntil,
      getBlockedGames,
      unlockGameAccess,
      resetProgress,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}