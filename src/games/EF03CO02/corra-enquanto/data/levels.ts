import type { LevelDef } from '../types'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'O laço no dedo',
        windowMs: 1200,
        speed: 260,
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
                id: 'l1-esteira',
                rule: 'enquanto-esteira-parada',
                signal: 'esteira',
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
]

export const stepsInLevel = (level: LevelDef) =>
    level.stretches.reduce((total, s) => total + s.segments.length, 0)
