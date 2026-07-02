export type InvestigationLevelNumber = 1 | 2 | 3;

export interface SafetyInfo {
  text: string;
  icon: string;
  isSafe: boolean;
  explanation: string;
}

export interface ConsequenceScenario {
  scenario: string;
  personEmoji: string;
  correct: string;
  wrong: [string, string];
}

export interface InvestigationStep {
  q: string;
  correct: string;
  wrong: [string, string];
}

export interface IncidentCase {
  incident: string;
  personEmoji: string;
  step1: InvestigationStep;
  step2: InvestigationStep;
}

export interface InvestigationLevel {
  level: InvestigationLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  safetyInfos?: SafetyInfo[];
  scenarios?: ConsequenceScenario[];
  incidents?: IncidentCase[];
}
