export type Kid = 'nina' | 'duda' | 'bia' | 'caio' | 'rafa'
export type Adult = 'prof' | 'mae' | 'vovo'
export type Sender = Kid | Adult | 'turma' | 'escola' | 'pet' | 'unknown'
export type Place = 'sala' | 'patio' | 'quarto' | 'festa'
export type Mood =
    | 'idle'
    | 'pose'
    | 'cover'
    | 'hurt'
    | 'silly'
    | 'wave'
    | 'open'
    | 'closed'
    | 'worried'
    | 'hug'
    | 'ask'
    | 'thumb'
    | 'key'
    | 'eat'
    | 'no'
export type Thing = 'diaryOpen' | 'diaryClosed' | 'cake' | 'drawing' | 'key' | 'trash' | 'coin' | 'poster' | 'spam' | 'list' | 'stranger'
export type AppId = 'camera' | 'gallery' | 'chat' | 'pet' | 'music' | 'settings' | 'flashlight' | 'map'
export type TaskId =
    | 'mural'
    | 'diary'
    | 'password'
    | 'party'
    | 'funny'
    | 'forwardPhoto'
    | 'forwardFace'
    | 'forwardNumber'
    | 'forwardList'
    | 'map'
    | 'poster'
    | 'coins'
    | 'flashlight'
export type DemoKind = 'photo' | 'forward' | 'permission'
export type Verb = 'collect' | 'keep' | 'transfer' | 'use'
export type State = 'intro' | 'play' | 'help' | 'done' | 'finale'

export interface Task {
    id: TaskId
    verb: Verb
    place: Place
    night: boolean
    clock: string
    asker: Sender
    order: string
}

export interface Demo {
    kind: DemoKind
    place: Place
    clock: string
    asker: Sender
    order: string
}

export interface LevelDef {
    level: number
    title: string
    message: string
    day: string
    apps: AppId[]
    demo: Demo
    tasks: Task[]
}

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export type Shot =
    | { kind: 'kid'; who: Kid; mood: Mood; place: Place }
    | { kind: 'thing'; thing: Thing; place: Place }
    | { kind: 'place'; place: Place }

export type Message =
    | { from: 'me' | 'them'; text: string }
    | { from: 'me' | 'them'; photo: string }

