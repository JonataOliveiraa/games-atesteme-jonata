export interface RobotPart {
    id: number;
    label: string;
    assetKey: string; 
}

export type LevelLayoutMode = 'regular' | 'compact' | 'stg';

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
    layoutMode: LevelLayoutMode;
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
