export type LevelNumber = 1 | 2 | 3

export type SignalId = 'chuva' | 'esteira' | 'semaforo'

export type RuleId =
    | 'enquanto-chove'
    | 'enquanto-sol'
    | 'enquanto-esteira-ligada'
    | 'enquanto-esteira-parada'
    | 'enquanto-sinal-verde'
    | 'enquanto-sinal-vermelho'

export interface Rule {
    id: RuleId
    kind: 'enquanto' | 'ate'
    watches: SignalId
    /** O valor do sinal que mantém o laço rodando. */
    keepsWhile: boolean
    /** A frase da ficha, como a criança lê. */
    text: string
    /** O verbo do laço. */
    action: string
}

export interface Segment {
    on: boolean
    ms: number
}

export interface Stretch {
    id: string
    rule: RuleId
    signal: SignalId
    segments: Segment[]
    /** Quanto tempo de corrida sobra depois da última mudança. */
    tailMs: number
}

export interface LevelDef {
    level: LevelNumber
    name: string
    windowMs: number
    speed: number
    stretches: Stretch[]
}

export type Mode = 'intro' | 'running' | 'blocked' | 'demo' | 'done'
