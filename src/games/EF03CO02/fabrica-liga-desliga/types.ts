export type RuleId = 'ovenLit' | 'trayFull' | 'whistle'

export type Watch = 'oven' | 'tray' | 'whistle'

export type IconId = 'flame' | 'belt' | 'tray' | 'whistle'

export interface Rule {
    id: RuleId
    kind: 'while' | 'until'
    watch: Watch
    text: [string, string]
    icon: IconId
    jam: string
}

export interface StepDef {
    rule: RuleId
    lead?: number
    lit?: number
    out?: number
    quota?: number
    whistleAt?: number
}

export interface PhaseDef {
    id: string
    steps: StepDef[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    grace: number
    speed: number
    spacing: number
    phases: PhaseDef[]
}

export interface World {
    lit: boolean
    trayCount: number
    trayCap: number
    whistled: boolean
}

export interface Mark {
    t: number
    on: boolean
}

export interface Track {
    rule: Mark[]
    belt: Mark[]
    end: number
}

export type Mode = 'intro' | 'guide' | 'play' | 'jam' | 'shift' | 'finale' | 'done' | 'panel'
