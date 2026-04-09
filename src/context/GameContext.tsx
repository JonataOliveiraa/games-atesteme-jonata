import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GameContext } from "./gameContextInstance";

type GameState = {
  coins: number;
  hints: number;
  lives: number;
  playedGames: string[];
  usedHintsByGame: string[];
  currentGameSlug: string | null;
};

export type GameContextType = {
  coins: number;
  hints: number;
  lives: number;
  playedGames: string[];
  usedHintsByGame: string[];
  currentGameSlug: string | null;
  buyHint: () => boolean;
  buyLife: () => boolean;
  consumeLife: () => boolean;
  addCoins: (amount: number) => void;
  loseLifeOnFailure: () => boolean;
  ensureLivesForGame: (slug: string) => void;
  setCurrentGame: (slug: string | null) => void;
  activateGameHint: (
    slug: string
  ) => { success: boolean; reason?: "already_used" | "not_enough_coins" };
};

const STORAGE_KEY = "atesteme-game-data";

const initialState: GameState = {
  coins: 0,
  hints: 0,
  lives: 3,
  playedGames: [],
  usedHintsByGame: [],
  currentGameSlug: null,
};

function getInitialState(): GameState {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) return initialState;

  try {
    return JSON.parse(savedData) as GameState;
  } catch {
    return initialState;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const buyHint = useCallback((): boolean => {
    if (state.coins < 10) return false;

    setState((prev) => ({
      ...prev,
      coins: prev.coins - 10,
      hints: prev.hints + 1,
    }));

    return true;
  }, [state.coins]);

  const buyLife = useCallback((): boolean => {
    if (state.coins < 20) return false;

    setState((prev) => ({
      ...prev,
      coins: prev.coins - 20,
      lives: prev.lives + 1,
    }));

    return true;
  }, [state.coins]);

  const consumeLife = useCallback((): boolean => {
    if (state.lives <= 0) return false;

    setState((prev) => ({
      ...prev,
      lives: prev.lives - 1,
    }));

    return true;
  }, [state.lives]);

  const addCoins = useCallback((amount: number): void => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  }, []);

  const loseLifeOnFailure = useCallback((): boolean => {
    if (state.lives <= 0) return false;

    setState((prev) => ({
      ...prev,
      lives: prev.lives - 1,
    }));

    return true;
  }, [state.lives]);

  const ensureLivesForGame = useCallback((slug: string): void => {
    setState((prev) => {
      const isFirstGameEver = prev.playedGames.length === 0;
      const alreadyVisited = prev.playedGames.includes(slug);

      let updatedLives = prev.lives;

      if (isFirstGameEver && prev.lives < 3) {
        updatedLives = 3;
      }

      if (!alreadyVisited && prev.lives <= 0) {
        updatedLives = 1;
      }

      return {
        ...prev,
        currentGameSlug: slug,
        lives: updatedLives,
        playedGames: alreadyVisited
          ? prev.playedGames
          : [...prev.playedGames, slug],
      };
    });
  }, []);

  const setCurrentGame = useCallback((slug: string | null): void => {
    setState((prev) => ({
      ...prev,
      currentGameSlug: slug,
    }));
  }, []);

  const activateGameHint = useCallback(
    (
      slug: string
    ): { success: boolean; reason?: "already_used" | "not_enough_coins" } => {
      if (state.usedHintsByGame.includes(slug)) {
        return { success: false, reason: "already_used" };
      }

      if (state.coins < 10) {
        return { success: false, reason: "not_enough_coins" };
      }

      setState((prev) => ({
        ...prev,
        coins: prev.coins - 10,
        usedHintsByGame: [...prev.usedHintsByGame, slug],
      }));

      return { success: true };
    },
    [state.usedHintsByGame, state.coins]
  );

  const value = useMemo<GameContextType>(
    () => ({
      coins: state.coins,
      hints: state.hints,
      lives: state.lives,
      playedGames: state.playedGames,
      usedHintsByGame: state.usedHintsByGame,
      currentGameSlug: state.currentGameSlug,
      buyHint,
      buyLife,
      consumeLife,
      addCoins,
      loseLifeOnFailure,
      ensureLivesForGame,
      setCurrentGame,
      activateGameHint,
    }),
    [
      state.coins,
      state.hints,
      state.lives,
      state.playedGames,
      state.usedHintsByGame,
      state.currentGameSlug,
      buyHint,
      buyLife,
      consumeLife,
      addCoins,
      loseLifeOnFailure,
      ensureLivesForGame,
      setCurrentGame,
      activateGameHint,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}