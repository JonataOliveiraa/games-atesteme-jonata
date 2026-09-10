import type { Rule, RuleId, SignalId, Stretch } from '../types'

/** Os quadros de `sinais.png`, na grade 4 x 2 de 400. */
export const SIGNAL_FRAME: Record<SignalId, { on: number; off: number }> = {
    chuva: { on: 0, off: 1 },
    semaforo: { on: 2, off: 3 },
    luz: { on: 4, off: 5 },
}

/**
 * A caixa alfa de cada quadro de `sinais.png`, medida no arquivo, em fração do
 * quadro de 400. Sem isso o objeto flutua, e a lâmpada tem outro motivo para
 * estar aqui: acesa ela ganha raios e fica mais alta que apagada, então a
 * escala sai sempre do quadro APAGADO — senão ela encolhe ao acender.
 */
export const SIGNAL_BOX: Record<number, { h: number; base: number }> = {
    0: { h: 0.84, base: 0.955 },
    1: { h: 0.745, base: 0.9 },
    2: { h: 0.8675, base: 0.9325 },
    3: { h: 0.8675, base: 0.9125 },
    4: { h: 0.935, base: 0.9725 },
    5: { h: 0.7975, base: 0.975 },
    6: { h: 0.8475, base: 0.9325 },
    7: { h: 0.79, base: 0.9225 },
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
    'enquanto-luz-acesa': {
        id: 'enquanto-luz-acesa',
        kind: 'enquanto',
        watches: 'luz',
        keepsWhile: true,
        text: 'ENQUANTO a lâmpada estiver acesa',
        action: 'corra na luz',
    },
    'enquanto-luz-apagada': {
        id: 'enquanto-luz-apagada',
        kind: 'enquanto',
        watches: 'luz',
        keepsWhile: false,
        text: 'ENQUANTO a lâmpada estiver apagada',
        action: 'corra no escuro',
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

    'ate-chuva-parar': {
        id: 'ate-chuva-parar',
        kind: 'ate',
        watches: 'chuva',
        keepsWhile: true,
        text: 'corra ATÉ a chuva parar',
        action: 'corra com o guarda-chuva',
    },
    'ate-chuva-comecar': {
        id: 'ate-chuva-comecar',
        kind: 'ate',
        watches: 'chuva',
        keepsWhile: false,
        text: 'corra ATÉ a chuva começar',
        action: 'corra no sol',
    },
    'ate-luz-acender': {
        id: 'ate-luz-acender',
        kind: 'ate',
        watches: 'luz',
        keepsWhile: false,
        text: 'corra ATÉ a lâmpada acender',
        action: 'corra no escuro',
    },
    'ate-sinal-fechar': {
        id: 'ate-sinal-fechar',
        kind: 'ate',
        watches: 'semaforo',
        keepsWhile: true,
        text: 'atravesse ATÉ o sinal fechar',
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
