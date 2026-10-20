import type { LevelDef, PhaseDef, Piece, PieceKind } from '../types'
import { pieceById, ramps, spot, works } from './logic'

export const POINTS = 10

export const guideKey = (level: number) => `ef15co02-circuito-l${level}`

const p = (id: string, kind: PieceKind, c: number, r: number): Piece => ({ id, kind, c, r })

const N1: LevelDef = {
    level: 1,
    title: 'A ordem de montar',
    message: 'O manual é um algoritmo: uma lista de passos, um depois do outro. Se a ordem muda, a peça fica sem apoio e cai.',
    phases: [
        {
            id: 'rampa-no-bloco',
            bell: 2,
            pieces: [p('b0', 'block', 0, 0), p('r1', 'ramp', 0, 1), p('r2', 'ramp', 1, 0)],
            tray: ['r1', 'r2', 'b0'],
        },
        {
            id: 'torre',
            bell: 2,
            pieces: [p('b0', 'block', 0, 0), p('b1', 'block', 0, 1), p('r2', 'ramp', 0, 2), p('r3', 'ramp', 1, 0)],
            tray: ['b1', 'r3', 'r2', 'b0'],
        },
        {
            id: 'duas-torres',
            bell: 2,
            pieces: [
                p('b0', 'block', 0, 0),
                p('b1', 'block', 0, 1),
                p('r2', 'ramp', 0, 2),
                p('b3', 'block', 1, 0),
                p('r4', 'ramp', 1, 1),
            ],
            tray: ['r4', 'b1', 'b3', 'r2', 'b0'],
        },
    ],
}

export const LEVELS: LevelDef[] = [N1]

function check(phase: PhaseDef) {
    const fail = (why: string) => {
        throw new Error(`[circuito-de-bolinha] ${phase.id}: ${why}`)
    }
    const cells = new Map<string, Piece>()
    phase.pieces.forEach(piece => {
        const key = spot(piece.c, piece.r)
        if (cells.has(key)) fail(`duas peças em ${key}`)
        cells.set(key, piece)
    })
    phase.pieces.forEach(piece => {
        if (piece.c === phase.bell) fail(`${piece.id} está na coluna do sino`)
        if (piece.r > 0 && cells.get(spot(piece.c, piece.r - 1))?.kind !== 'block') fail(`${piece.id} sem bloco embaixo no modelo`)
        if (piece.kind === 'ramp' && cells.has(spot(piece.c, piece.r + 1))) fail(`peça em cima da rampa ${piece.id}`)
    })
    const path = ramps(phase)
    if (!path.length) fail('sem rampa')
    path.forEach((ramp, i) => {
        const next = path[i + 1]
        if (next) {
            if (next.c !== ramp.c + 1) fail(`${next.id} não está na coluna seguinte a ${ramp.id}`)
            if (next.r >= ramp.r) fail(`${next.id} não está mais baixa que ${ramp.id}`)
        } else if (ramp.c + 1 !== phase.bell) fail(`${ramp.id} não termina no sino`)
    })
    const topOf = (c: number) => Math.max(...phase.pieces.filter(x => x.c === c).map(x => x.r))
    path.forEach(ramp => {
        if (ramp.r !== topOf(ramp.c)) fail(`${ramp.id} não é o topo da coluna`)
    })
    if (phase.tray.length !== phase.pieces.length || new Set(phase.tray).size !== phase.tray.length) fail('bandeja diferente das peças')
    const tray = phase.tray.map(id => pieceById(phase, id) ?? fail(`página ${id} sem peça`))
    if (works(tray)) fail('a ordem da bandeja já monta')
    const bottomUp = [...phase.pieces].sort((a, b) => a.r - b.r)
    if (!works(bottomUp)) fail('nenhuma ordem monta')
    if (!phase.pieces.some(x => x.r > 0)) fail('nenhuma peça depende de outra')
    if (phase.pieces.length < 3 || phase.pieces.length > 5) fail('o manual tem de 3 a 5 páginas')
}

export function validateLevels() {
    LEVELS.forEach(level => level.phases.forEach(check))
}

if (import.meta.env.DEV) validateLevels()
