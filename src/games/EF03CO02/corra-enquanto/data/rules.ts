import type { Rule, RuleId, SignalId, Stretch } from '../types'

/** Os quadros de `sinais.png`, na grade 4 x 2 de 400. */
export const SIGNAL_FRAME: Record<SignalId, { on: number; off: number }> = {
    chuva: { on: 0, off: 1 },
    semaforo: { on: 2, off: 3 },
    esteira: { on: 4, off: 5 },
}

export const FLAG_FRAME = 6

export const RULES: Record<RuleId, Rule> = {
    'enquanto-chove': {
        id: 'enquanto-chove',
        kind: 'enquanto',
        watches: 'chuva',
        keepsWhile: true,
        text: 'ENQUANTO estiver chovendo',
        action: 'corra com o guarda-chuva',
    },
    'enquanto-sol': {
        id: 'enquanto-sol',
        kind: 'enquanto',
        watches: 'chuva',
        keepsWhile: false,
        text: 'ENQUANTO fizer sol',
        action: 'corra com o guarda-chuva',
    },
    'enquanto-esteira-ligada': {
        id: 'enquanto-esteira-ligada',
        kind: 'enquanto',
        watches: 'esteira',
        keepsWhile: true,
        text: 'ENQUANTO a esteira estiver ligada',
        action: 'ande junto',
    },
    'enquanto-esteira-parada': {
        id: 'enquanto-esteira-parada',
        kind: 'enquanto',
        watches: 'esteira',
        keepsWhile: false,
        text: 'ENQUANTO a esteira estiver parada',
        action: 'atravesse por cima',
    },
    'enquanto-sinal-verde': {
        id: 'enquanto-sinal-verde',
        kind: 'enquanto',
        watches: 'semaforo',
        keepsWhile: true,
        text: 'ENQUANTO o sinal estiver verde',
        action: 'atravesse',
    },
    'enquanto-sinal-vermelho': {
        id: 'enquanto-sinal-vermelho',
        kind: 'enquanto',
        watches: 'semaforo',
        keepsWhile: false,
        text: 'ENQUANTO o sinal estiver vermelho',
        action: 'atravesse',
    },
}

/** A condição do laço, testada a cada quadro. É a única regra do jogo. */
export const holds = (rule: Rule, signalOn: boolean) => signalOn === rule.keepsWhile

/** Quanto tempo de laço o trecho pede, se a criança acertar tudo. */
export const runsWhen = (stretch: Stretch) => RULES[stretch.rule].keepsWhile

export const runningMs = (stretch: Stretch) =>
    stretch.segments.reduce(
        (total, seg) => total + (seg.on === runsWhen(stretch) ? seg.ms : 0),
        0,
    ) + stretch.tailMs

/** O trecho inteiro, contando as paradas. Serve para a linha do tempo. */
export const totalMs = (stretch: Stretch) =>
    stretch.segments.reduce((total, seg) => total + seg.ms, 0) + stretch.tailMs
