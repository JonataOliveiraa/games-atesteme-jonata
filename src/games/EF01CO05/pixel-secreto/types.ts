export type PixelCode = "A" | "B" | "C" | "D" | "";

export type PixelCell = {
  code: PixelCode;
  revealed?: boolean;
};

export type PixelPaletteItem = {
  code: Exclude<PixelCode, "">;
  label: string;
  color: number;
  textColor?: string;
};

export type PixelLevel = {
  level: 1 | 2 | 3;
  title: string;
  objective: string;
  timeLimit: number;
  imageName: string;
  palette: PixelPaletteItem[];
  grid: PixelCode[][];
  hints?: Array<{ row: number; col: number }>;
};
