export type MissionId = 'cafe' | 'festa' | 'feira' | 'acampamento'

export type PhaseKind = 'partir' | 'resolver' | 'combinar'

export type TrackId = 'voce' | 'colega'

export type ScoreKey = 'completo' | 'limpo' | 'rapido' | 'reuso'

export interface PartDef {
    id: string
    label: string
    detail: string
    minutes: number
    needs: string[]
    track?: TrackId
    reusable?: boolean
    splitsInto?: string[]
}

export interface Candidate {
    id: string
    label: string
    detail: string
    fits: boolean
    reason: string
}

export interface StepDef {
    id: string
    text: string
    hint: string
}

export interface SolveTask {
    partId: string
    title: string
    prompt: string
    steps: StepDef[]
    answer: string[]
    explain: string
    hint: string
}

export interface SplitTask {
    cardTitle: string
    cardText: string
    slots: number
    candidates: Candidate[]
    explain: string
    hint: string
    secondPass?: {
        parentId: string
        cardText: string
        slots: number
        candidates: Candidate[]
        explain: string
        hint: string
    }
}

export interface CombineTask {
    prompt: string
    tracks: TrackId[]
    blocks: string[]
    bestMinutes: number
    parMinutes: number
    explain: string
    hint: string
}

interface BasePhase {
    id: string
    mission: MissionId
    ask: string
    hintDeep: string
}

export interface SplitPhase extends BasePhase {
    kind: 'partir'
    task: SplitTask
}

export interface SolvePhase extends BasePhase {
    kind: 'resolver'
    task: SolveTask
}

export interface CombinePhase extends BasePhase {
    kind: 'combinar'
    task: CombineTask
}

export type PhaseConfig = SplitPhase | SolvePhase | CombinePhase

export interface MissionDef {
    id: MissionId
    name: string
    brief: string[]
    before: string
    after: string
    parts: Record<string, PartDef>
    doneLine: string
}

export interface LevelConfig {
    level: 1 | 2 | 3
    title: string
    objective: string
    missions: MissionId[]
    useDeps: boolean
    useClock: boolean
    useTracks: boolean
    useReuse: boolean
    phases: PhaseConfig[]
}

export interface PlanBlock {
    partId: string
    label: string
    track: TrackId
    start: number
    end: number
    minutes: number
    reused: boolean
}

export interface PlanTrace {
    blocks: PlanBlock[]
    totalMinutes: number
    bestMinutes: number
    valid: boolean
    brokenDep?: { partId: string; needs: string }
}

export interface ScoreCard {
    completo: number
    limpo: number
    rapido: number
    reuso: number
    summary: string
}

export interface MissionResult {
    mission: MissionId
    wrongPicks: number
    wrongOrder: number
    reusedCount: number
    minutes: number
    bestMinutes: number
}

export interface SlotState {
    index: number
    partId: string | null
    locked: boolean
}