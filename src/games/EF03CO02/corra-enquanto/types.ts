export type LevelNumber = 1 | 2 | 3

export type SignalId = 'chuva' | 'luz' | 'semaforo'

export type RuleId =
    | 'enquanto-chove'
    | 'enquanto-sol'
    | 'enquanto-luz-acesa'
    | 'enquanto-luz-apagada'
    | 'enquanto-sinal-verde'
    | 'enquanto-sinal-vermelho'
    | 'ate-chuva-parar'
    | 'ate-chuva-comecar'
    | 'ate-luz-acender'
    | 'ate-sinal-fechar'

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
    /** Quanto tempo o cronômetro dá, em cima do tempo ideal do trecho. */
    timeFactor: number
    stretches: Stretch[]
}

export type Mode = 'intro' | 'running' | 'demo' | 'done'
