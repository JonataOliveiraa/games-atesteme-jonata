export interface OrigamiStep {
    id: number;
    label: string;
    assetKey?: string; 
}

export interface LevelConfig {
    id: number;
    name: string;
    steps: OrigamiStep[];
    timeLimit: number;
}

// --- ADICIONE ESTE BLOCO ABAIXO ---
export interface RuntimeGameBridge {
  emit: (data: {
    type: string;
    gameId: string;
    stage: number;
    [key: string]: any;
  }) => void;
}

declare global {
  interface Window {
    runtimeGameBridge?: RuntimeGameBridge;
  }
}