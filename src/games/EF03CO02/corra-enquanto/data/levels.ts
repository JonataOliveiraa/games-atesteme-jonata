import type { LevelDef } from '../types'

/**
 * A última faixa de cada trecho é sempre a que corre: é nela que o robô cobre
 * o resto do caminho até a bandeira. Por isso um número ímpar de mudanças
 * obriga o trecho a começar parado — e a primeira mudança vira a senha para
 * começar a correr.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'O laço no dedo',
        windowMs: 1800,
        speed: 260,
        timeFactor: 2,
        stretches: [
            {
                id: 'l1-chuva',
                rule: 'enquanto-chove',
                signal: 'chuva',
                segments: [
                    { on: true, ms: 4200 },
                    { on: false, ms: 3400 },
                ],
                tailMs: 3200,
            },
            {
                id: 'l1-luz',
                rule: 'enquanto-luz-apagada',
                signal: 'luz',
                segments: [
                    { on: false, ms: 4000 },
                    { on: true, ms: 3200 },
                ],
                tailMs: 3000,
            },
            {
                id: 'l1-semaforo',
                rule: 'enquanto-sinal-verde',
                signal: 'semaforo',
                segments: [
                    { on: true, ms: 3600 },
                    { on: false, ms: 3000 },
                ],
                tailMs: 3000,
            },
        ],
    },
    {
        level: 2,
        name: 'O laço que diz onde para',
        windowMs: 1400,
        speed: 290,
        timeFactor: 1.9,
        stretches: [
            {
                id: 'l2-chuva',
                rule: 'ate-chuva-parar',
                signal: 'chuva',
                segments: [
                    { on: false, ms: 2600 },
                    { on: true, ms: 3600 },
                    { on: false, ms: 2800 },
                ],
                tailMs: 3000,
            },
            {
                id: 'l2-luz',
                rule: 'ate-luz-acender',
                signal: 'luz',
                segments: [
                    { on: true, ms: 2600 },
                    { on: false, ms: 3400 },
                    { on: true, ms: 2600 },
                ],
                tailMs: 2800,
            },
            {
                id: 'l2-semaforo',
                rule: 'ate-sinal-fechar',
                signal: 'semaforo',
                segments: [
                    { on: false, ms: 2400 },
                    { on: true, ms: 3400 },
                    { on: false, ms: 2600 },
                ],
                tailMs: 2800,
            },
        ],
    },
    {
        level: 3,
        name: 'Tudo misturado',
        windowMs: 1100,
        speed: 320,
        timeFactor: 1.8,
        stretches: [
            {
                id: 'l3-chuva',
                rule: 'ate-chuva-comecar',
                signal: 'chuva',
                segments: [
                    { on: false, ms: 3000 },
                    { on: true, ms: 2400 },
                    { on: false, ms: 2800 },
                    { on: true, ms: 2400 },
                ],
                tailMs: 2600,
            },
            {
                id: 'l3-luz',
                rule: 'enquanto-luz-acesa',
                signal: 'luz',
                segments: [
                    { on: true, ms: 2800 },
                    { on: false, ms: 2400 },
                    { on: true, ms: 2600 },
                    { on: false, ms: 2200 },
                ],
                tailMs: 2600,
            },
            {
                id: 'l3-semaforo',
                rule: 'ate-sinal-fechar',
                signal: 'semaforo',
                segments: [
                    { on: true, ms: 2600 },
                    { on: false, ms: 2200 },
                    { on: true, ms: 2400 },
                    { on: false, ms: 2200 },
                ],
                tailMs: 2600,
            },
        ],
    },
]

export const stepsInLevel = (level: LevelDef) =>
    level.stretches.reduce((total, s) => total + s.segments.length, 0)
