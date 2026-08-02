export type ZoneType = "coletar" | "descartar" | "bloquear";
export type TriageLevelNumber = 1 | 2 | 3;

export interface DataCard {
  id: string;
  assetKey: string;
  label: string;
  context: string;
  correctZone: ZoneType;
  explanation: string;
}

export interface TriageLevel {
  level: TriageLevelNumber;
  title: string;
  objective: string;
  detail: string;
  tip: string;
  timeLimit: number;
  cards: DataCard[];
  activeZones: ZoneType[];
}
