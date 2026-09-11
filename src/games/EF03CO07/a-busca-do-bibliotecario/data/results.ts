import type { ResultDef } from '../types'

export const RESULTS: ResultDef[] = [
    { id: 'tucano-real', frame: 0, type: 'image', terms: ['TUCANO', 'FOTO', 'ANIMAL'] },
    { id: 'tucano-pelucia', frame: 1, type: 'image', terms: ['TUCANO', 'PELÚCIA', 'BRINQUEDO'] },
    { id: 'tucano-desenho', frame: 2, type: 'image', terms: ['TUCANO', 'DESENHO', 'PAPEL'] },

    { id: 'vulcao-erupcao', frame: 3, type: 'video', terms: ['VULCÃO', 'ERUPÇÃO', 'VÍDEO', 'LAVA'] },
    { id: 'vulcao-calmo', frame: 4, type: 'image', terms: ['VULCÃO', 'CALMO', 'MONTANHA', 'FOTO'] },
    { id: 'vulcao-maquete', frame: 5, type: 'image', terms: ['VULCÃO', 'ERUPÇÃO', 'MAQUETE', 'ESCOLA'] },

    { id: 'baleia-real', frame: 6, type: 'image', terms: ['BALEIA', 'FOTO', 'ANIMAL', 'MAR'] },
    { id: 'baleia-pelucia', frame: 7, type: 'image', terms: ['BALEIA', 'PELÚCIA', 'BRINQUEDO', 'FOTO'] },
    { id: 'baleia-desenho', frame: 8, type: 'image', terms: ['BALEIA', 'DESENHO', 'PAPEL'] },
]

export const resultOf = (id: string) => RESULTS.find(result => result.id === id)!

export const scoreOf = (result: ResultDef, terms: string[]) => {
    const hits = terms.filter(term => result.terms.includes(term)).length
    return hits * 10 - (terms.length - hits) * 3
}

export const rankResults = (pool: string[], terms: string[]) =>
    pool
        .map((id, index) => ({ id, index, score: scoreOf(resultOf(id), terms) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)

export const rankOf = (pool: string[], terms: string[], id: string) =>
    rankResults(pool, terms).findIndex(item => item.id === id)
