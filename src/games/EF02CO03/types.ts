export type FactoryStageId =
  | "shirt-separate"
  | "shirt-cut"
  | "shirt-sew"
  | "shirt-buttons"
  | "shirt-iron"
  | "plush-separate"
  | "plush-cut"
  | "plush-sew"
  | "plush-fill"
  | "plush-details"
  | "backpack-separate"
  | "backpack-cut"
  | "backpack-sew"
  | "backpack-straps"
  | "backpack-zipper";

export interface FactoryStage {
  id: FactoryStageId;
  label: string;
  shortLabel: string;
  icon: string;
  color: number;
}

export interface ProductStage {
  label: string;
  icon: string;
  color: number;
  assetKey?: string;
}

export interface FactoryLevel {
  level: 1 | 2 | 3;
  title: string;
  objective: string;
  prompt: string;
  timeLimit: number;
  stages: FactoryStage[];
  solution: FactoryStageId[];
  productName: string;
  productStages: ProductStage[];
  successMessage: string;
  hint: string;
}
