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