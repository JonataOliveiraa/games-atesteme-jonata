import type { SubjectDef, SubjectId } from '../types'

export const SUBJECTS: Record<SubjectId, SubjectDef> = {
    mushroom: { id: 'mushroom', name: 'COGUMELO', article: 'o', motion: 'still', size: 78, moving: 'o cogumelo' },
    butterfly: { id: 'butterfly', name: 'BORBOLETA', article: 'a', motion: 'flutter', size: 62, moving: 'a borboleta voando' },
    sunflower: { id: 'sunflower', name: 'GIRASSOL', article: 'o', motion: 'still', size: 176, moving: 'o girassol' },
    frog: { id: 'frog', name: 'SAPO', article: 'o', motion: 'hop', size: 70, moving: 'o sapo pulando' },
    lake: { id: 'lake', name: 'LAGO', article: 'o', motion: 'ripple', size: 140, moving: 'o lago com ondinhas' },
    waterfall: { id: 'waterfall', name: 'CACHOEIRA', article: 'a', motion: 'flow', size: 330, moving: 'a água caindo' },
    duck: { id: 'duck', name: 'PATO', article: 'o', motion: 'swim', size: 74, moving: 'o pato nadando' },
    bluecrystal: { id: 'bluecrystal', name: 'CRISTAL AZUL', article: 'o', motion: 'still', size: 110, moving: 'o cristal' },
    crystal: { id: 'crystal', name: 'CRISTAL', article: 'o', motion: 'still', size: 120, moving: 'o cristal' },
    drops: { id: 'drops', name: 'GOTAS', article: 'as', motion: 'drip', size: 130, moving: 'as gotas pingando' },
    glowmoss: { id: 'glowmoss', name: 'MUSGO QUE BRILHA', article: 'o', motion: 'still', size: 104, moving: 'o musgo', glows: true },
    glowshroom: { id: 'glowshroom', name: 'COGUMELO QUE BRILHA', article: 'o', motion: 'still', size: 118, moving: 'o cogumelo', glows: true },
    cavefish: { id: 'cavefish', name: 'PEIXE-CEGO', article: 'o', motion: 'swim', size: 84, moving: 'o peixe-cego nadando' },
    fireflies: { id: 'fireflies', name: 'VAGA-LUMES', article: 'os', motion: 'blink', size: 34, moving: 'os vaga-lumes piscando', glows: true },
    stalagmite: { id: 'stalagmite', name: 'ESTALAGMITE', article: 'a', motion: 'still', size: 176, moving: 'a estalagmite' },
    nest: { id: 'nest', name: 'NINHO', article: 'o', motion: 'still', size: 84, moving: 'o ninho' },
    boulder: { id: 'boulder', name: 'PEDRA GRANDE', article: 'a', motion: 'still', size: 250, moving: 'a pedra' },
    ladybug: { id: 'ladybug', name: 'JOANINHA', article: 'a', motion: 'still', size: 100, moving: 'a joaninha' },
    bigtree: { id: 'bigtree', name: 'ÁRVORE GIGANTE', article: 'a', motion: 'still', size: 222, moving: 'a árvore' },
    ants: { id: 'ants', name: 'FORMIGAS', article: 'as', motion: 'march', size: 30, moving: 'as formigas andando' },
    anthill: { id: 'anthill', name: 'FORMIGUEIRO', article: 'o', motion: 'still', size: 190, moving: 'o formigueiro' },
    bee: { id: 'bee', name: 'ABELHA', article: 'a', motion: 'buzz', size: 52, moving: 'a abelha voando' },
}

export const moves = (id: SubjectId) => SUBJECTS[id].motion !== 'still'

export const DETAIL_MAX = 120
export const WHOLE_MIN = 170
