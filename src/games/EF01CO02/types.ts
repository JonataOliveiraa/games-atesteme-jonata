export interface RobotPart {
    id: number;
    label: string;
    assetKey: string; 
}

export interface OrigamiStep {
    id: number;
    label: string;
    assetKey: string;
}

export interface LevelConfig {
    id: number;
    name: string;
    steps: RobotPart[];
    timeLimit: number;
}

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