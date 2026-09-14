export type LevelNumber = 1 | 2 | 3

export type InputId = 'keyboard' | 'mouse' | 'microphone' | 'camera'
export type OutputId = 'monitor' | 'speaker' | 'printer'
export type DeviceId = InputId | OutputId

export type Medium = 'typed-text' | 'pointer' | 'sound' | 'image'
export type Carrier = 'screen' | 'audio' | 'paper'
export type Side = 'input' | 'output'

export type Content = 'voice' | 'drawing' | 'photo' | 'letters' | 'pointer'

export interface ChallengeDef {
    id: string
    prompt: string
    source: Medium
    input?: InputId
    output?: OutputId
    options: [DeviceId, DeviceId]
    goal: { medium: Medium; carrier: Carrier }
    need: string
}

export interface LevelDef {
    level: LevelNumber
    title: string
    challenges: ChallengeDef[]
}

export interface Outcome {
    input: InputId
    output: OutputId
    captured: Content | null
    rendered: boolean
    solved: boolean
}

export type Mode = 'intro' | 'choosing' | 'running' | 'success' | 'done'
