export type Direction = "up" | "right" | "down" | "left";

export type RobotCommand = {
  type: "move";
  direction: Direction;
};

export interface GridPoint {
  x: number;
  y: number;
}

export interface RepeatLevel {
  level: 1 | 2 | 3;
  title: string;
  objective: string;
  timeLimit: number;
  gridSize: { cols: number; rows: number };
  start: GridPoint;
  direction: Direction;
  goal: GridPoint;
  obstacles: GridPoint[];
  minBlocks: number;
}
