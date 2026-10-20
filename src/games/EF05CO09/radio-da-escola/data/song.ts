import type { ChartNote, Lane, Song } from '../types'

export const beatMs = (song: Song) => 60000 / song.bpm

export function notesOf(song: Song): ChartNote[] {
    const beat = beatMs(song)
    const notes: ChartNote[] = []
    ;[...song.chart].forEach((ch, i) => {
        const n = Number(ch)
        if (n >= 1 && n <= 4) notes.push({ lane: (n - 1) as Lane, t: (song.intro + i) * beat })
    })
    return notes
}

export const endMs = (song: Song) => (song.intro + song.chart.length + 2) * beatMs(song)

export const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12)
