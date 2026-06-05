export type MachineId = "calculator" | "folder" | "stamper" | "mixer";

export type CommandId =
  | "add2"
  | "double"
  | "fold"
  | "crease"
  | "stampStar"
  | "stampOk"
  | "addFruit"
  | "blend";

export interface MachineDefinition {
  id: MachineId;
  name: string;
  shortName: string;
  icon: string;
  color: number;
  acceptedCommands: CommandId[];
}

export interface CommandDefinition {
  id: CommandId;
  label: string;
  icon: string;
  machine: MachineId;
}

export interface ProgramStep {
  machine: MachineId;
  command: CommandId;
}

export interface FactoryLevel {
  level: 1 | 2 | 3;
  title: string;
  objective: string;
  prompt: string;
  timeLimit: number;
  availableMachines: MachineId[];
  availableCommands: CommandId[];
  solution: ProgramStep[];
  startLabel?: string;
  successProduct: string;
  hint: string;
}
