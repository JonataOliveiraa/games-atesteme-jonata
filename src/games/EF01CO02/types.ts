export type RobotPartId = 'head' | 'body' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg';

export interface RobotPartDef {
  id: RobotPartId;
  label: string;
  cardAssetKey: string;
  anchorAssetKey: string;
  anchorGlowAssetKey: string;
}

export interface PhaseConfig {
  id: number;
  name: string;
  timeLimit: number;
  missingParts: RobotPartId[];
}

export interface LevelConfig {
  level: 1 | 2 | 3;
  title: string;
  objective: string;
  phases: PhaseConfig[];
  name: string;
}

export interface RuntimeGameBridge {
  emit: (data: { type: string; gameId: string; stage: number; [key: string]: any }) => void;
}

declare global {
  interface Window {
    runtimeGameBridge?: RuntimeGameBridge;
  }
}