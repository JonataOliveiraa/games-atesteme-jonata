import { useContext } from "react";
import { GameContext } from "./gameContextInstance"
import type { GameContextType } from "./GameContext";

export function useGame(): GameContextType {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame deve ser usado dentro de GameProvider");
  }

  return context;
}