export type RobotPartId = 'head' | 'body' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg';

export interface RobotPartDef {
  id: RobotPartId;
  label: string;
  cardAssetKey: string;
  anchorAssetKey: string;
  anchorGlowAssetKey: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  timeLimit: number;
  missingParts: RobotPartId[]; // 2 a 6 peças, NA ORDEM de montagem
}

export interface RuntimeGameBridge {
  emit: (data: { type: string; gameId: string; stage: number; [key: string]: any }) => void;
}

declare global {
  interface Window {
    runtimeGameBridge?: RuntimeGameBridge;
  }
}