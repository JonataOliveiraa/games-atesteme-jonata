export type SafetyChoice = {
  id: string;
  text: string;
  isSafe: boolean;
  feedback: string;
};

export type SafetyScene = {
  id: string;
  title: string;
  device: "celular" | "tablet" | "computador" | "jogo" | "app";
  emoji: string;
  situation: string;
  question: string;
  choices: SafetyChoice[];
  checklistItem: string;
};

export type SafetyLevel = {
  level: 1 | 2 | 3;
  title: string;
  objective: string;
  timeLimit: number;
  scenes: SafetyScene[];
};
