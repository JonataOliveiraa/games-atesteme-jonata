import type { Code, Instrument, Word } from '../types'

export const WORDS: Word[] = ['SOL', 'PEIXE', 'LUA']

export interface WordInfo {
    frame: number
    beats: number
    color: number
    colorDark: number
    instrument: Instrument
}

export const ISLAND: Record<Word, WordInfo> = {
    SOL: {
        frame: 0,
        beats: 1,
        color: 0xe5484d,
        colorDark: 0xa32a2e,
        instrument: 'chocalho',
    },
    PEIXE: {
        frame: 1,
        beats: 2,
        color: 0x3e7bfa,
        colorDark: 0x2350ad,
        instrument: 'splash',
    },
    LUA: {
        frame: 2,
        beats: 3,
        color: 0xf5c542,
        colorDark: 0xb98d15,
        instrument: 'tambor',
    },
}

export const CODE_TITLE: Record<Code, string> = {
    batidas: 'BATIDAS',
    cor: 'CORES',
    figura: 'DESENHOS',
    som: 'SONS',
}
