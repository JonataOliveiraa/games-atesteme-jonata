export type EthicLevelNumber = 1 | 2 | 3;

export interface EthicAction {
  label: string;
  isEthical: boolean;
}

export interface EthicSituation {
  file: string;
  owner: string;
  emoji: string;
  situation: string;
  actions: EthicAction[];
}

export interface EthicDecision {
  situation: string;
  actions: EthicAction[];
}

export interface EthicScenario {
  decisions: EthicDecision[];
}

export interface DilemmaQuestion {
  q: string;
  correct: string;
  options: string[];
}

export interface EthicDilemma {
  context: string;
  q1: DilemmaQuestion;
  q2: DilemmaQuestion;
}

export interface EthicLevel {
  level: EthicLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  n1Situations?: EthicSituation[];
  n2Scenarios?: EthicScenario[];
  n3Dilemmas?: EthicDilemma[];
}
