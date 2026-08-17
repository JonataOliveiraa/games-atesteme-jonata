import type { ProgramDef, ProgramId } from '../types'

export const PROGRAM_ORDER: ProgramId[] = [
    'navegador',
    'editor',
    'jogo',
    'player',
    'fotos',
    'impressao',
]

export const PROGRAMS: Record<ProgramId, ProgramDef> = {
    navegador: {
        id: 'navegador',
        name: 'Navegador',
        texture: 'programa-navegador',
        memoryBlocks: 2,
    },
    editor: {
        id: 'editor',
        name: 'Editor de texto',
        texture: 'programa-editor',
        memoryBlocks: 2,
    },
    jogo: {
        id: 'jogo',
        name: 'Jogo',
        texture: 'programa-jogo',
        memoryBlocks: 3,
    },
    player: {
        id: 'player',
        name: 'Player de música',
        texture: 'programa-player',
        memoryBlocks: 2,
    },
    fotos: {
        id: 'fotos',
        name: 'Visualizador de fotos',
        texture: 'programa-fotos',
        memoryBlocks: 2,
    },
    impressao: {
        id: 'impressao',
        name: 'Programa de impressão',
        texture: 'programa-impressao',
        memoryBlocks: 1,
    },
}

export const getProgram = (id: ProgramId): ProgramDef => PROGRAMS[id]
