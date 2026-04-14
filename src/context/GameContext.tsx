import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GameContext } from "./gameContextInstance";
import type { GameEventPayload, UserGameHistory } from "../types/platform";

type PlatformState = {
  points: number;
  isBlocked: boolean;
  blockedUntil: string | null;
  unlockCost: number;
  history: UserGameHistory[];
};

export type GameContextType = {
  points: number;
  isBlocked: boolean;
  blockedUntil: string | null;
  unlockCost: number;
  history: UserGameHistory[];
  canPlay: boolean;
  handleGameEvent: (event: GameEventPayload) => void;
  unlockAccess: () => boolean;
};

const STORAGE_KEY = "atesteme-platform-data-v2";

const initialState: PlatformState = {
  points: 0,
  isBlocked: false,
  blockedUntil: null,
  unlockCost: 30,
  history: [],
};

function isBlockStillActive(blockedUntil: string | null): boolean {
  if (!blockedUntil) return false;
  return new Date(blockedUntil).getTime() > Date.now();
}

function getBlockedUntilAfterTwoDays(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString();
}

function createHistoryItem(params: {
  gameId: string;
  stage: number;
  eventType: UserGameHistory["eventType"];
  pointsEarned: number;
}): UserGameHistory {
  return {
    gameId: params.gameId,
    stage: params.stage,
    eventType: params.eventType,
    pointsEarned: params.pointsEarned,
    createdAt: new Date().toISOString(),
  };
}

function normalizeState(state: PlatformState): PlatformState {
  if (state.isBlocked && !isBlockStillActive(state.blockedUntil)) {
    return {
      ...state,
      isBlocked: false,
      blockedUntil: null,
      history: [
        createHistoryItem({
          gameId: "platform",
          stage: 0,
          eventType: "UNLOCKED_BY_TIME",
          pointsEarned: 0,
        }),
        ...state.history,
      ],
    };
  }

  return state;
}

function getInitialState(): PlatformState {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) return initialState;

  try {
    const parsed = JSON.parse(savedData) as PlatformState;
    return normalizeState(parsed);
  } catch {
    return initialState;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlatformState>(getInitialState);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((prev) => normalizeState(prev));
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const canPlay = !state.isBlocked

  const handleGameEvent = useCallback((event: GameEventPayload) => {
    setState((prev) => {
      const historyItems: UserGameHistory[] = [
        createHistoryItem({
          gameId: event.gameId,
          stage: event.stage,
          eventType: event.type,
          pointsEarned: event.pointsEarned,
        }),
      ];

      const nextPoints = Math.max(0, prev.points + event.pointsEarned);

      const nextState: PlatformState = {
       ...prev,
      points: nextPoints,
       history: [...historyItems, ...prev.history],
      };
      if (event.type === "GAME_OVER") {
        nextState.isBlocked = true;
        nextState.blockedUntil = getBlockedUntilAfterTwoDays();

        nextState.history = [
          createHistoryItem({
            gameId: event.gameId,
            stage: event.stage,
            eventType: "BLOCKED",
            pointsEarned: 0,
          }),
          ...nextState.history,
        ];
      }

      return normalizeState(nextState);
    });
  }, []);

  const unlockAccess = useCallback((): boolean => {
    if (!state.isBlocked || !isBlockStillActive(state.blockedUntil)) {
      return false;
    }

    if (state.points < state.unlockCost) {
      return false;
    }

    setState((prev) => ({
      ...prev,
      points: prev.points - prev.unlockCost,
      isBlocked: false,
      blockedUntil: null,
      history: [
        createHistoryItem({
          gameId: "platform",
          stage: 0,
          eventType: "UNLOCKED_BY_POINTS",
          pointsEarned: 0,
        }),
        ...prev.history,
      ],
    }));

    return true;
  }, [state.isBlocked, state.blockedUntil, state.points, state.unlockCost]);

  const value = useMemo<GameContextType>(
    () => ({
      points: state.points,
      isBlocked: state.isBlocked && isBlockStillActive(state.blockedUntil),
      blockedUntil:
        state.isBlocked && isBlockStillActive(state.blockedUntil)
          ? state.blockedUntil
          : null,
      unlockCost: state.unlockCost,
      history: state.history,
      canPlay,
      handleGameEvent,
      unlockAccess,
    }),
    [
      state.points,
      state.isBlocked,
      state.blockedUntil,
      state.unlockCost,
      state.history,
      canPlay,
      handleGameEvent,
      unlockAccess,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}