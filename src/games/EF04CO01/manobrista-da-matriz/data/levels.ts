import type { Cell, LevelDef } from '../types'

export const POINTS = 10
export const REQUESTS = 4

export const guideKey = (level: number) => `__manobristaGuide-l${level}`

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Achar a vaga',
        message: 'Primeiro a LINHA, depois a COLUNA. Onde elas se cruzam é a vaga!',
        rows: 3,
        cols: 3,
        parked: [],
        requests: [
            { kind: 'park', to: [2, 3], guided: true },
            { kind: 'park', to: [1, 2] },
            { kind: 'park', to: [3, 2] },
            { kind: 'park', to: [1, 3] },
        ],
    },
    {
        level: 2,
        title: 'Pátio cheio',
        message: 'Com o pátio cheio, a coordenada continua mostrando o caminho.',
        rows: 3,
        cols: 4,
        parked: [
            { at: [1, 1], color: 5 },
            { at: [1, 4], color: 3 },
            { at: [2, 2], color: 0 },
            { at: [3, 3], color: 4 },
            { at: [3, 1], color: 2 },
        ],
        requests: [
            { kind: 'park', to: [2, 3] },
            { kind: 'park', to: [1, 2] },
            { kind: 'park', to: [3, 4] },
            { kind: 'park', to: [2, 1] },
        ],
    },
    {
        level: 3,
        title: 'Cada pátio, um jeito de contar',
        message: 'Números, letras ou um mapinha: tudo mostra a mesma vaga.',
        rows: 3,
        cols: 4,
        parked: [
            { at: [1, 2], color: 0 },
            { at: [2, 4], color: 5 },
            { at: [3, 4], color: 2 },
            { at: [2, 1], color: 4 },
        ],
        requests: [
            { kind: 'park', to: [1, 4], scheme: 'lc', face: 'front' },
            { kind: 'park', to: [2, 3], scheme: 'colLetters', face: 'back' },
            { kind: 'park', to: [3, 2], scheme: 'rowLetters', face: 'front' },
            { kind: 'park', to: [1, 1], scheme: 'map', face: 'back' },
        ],
    },
]

/** a vaga da demonstração do tutorial (o 1º pedido repete ela) */
export const DEMO_CELL: Cell = [2, 3]

export const sameCell = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1]

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = (i: number) => `N${level.level}-${i + 1}`
        if (level.requests.length !== REQUESTS) problems.push(`N${level.level}: precisa de ${REQUESTS} pedidos`)
        const taken = level.parked.map(p => p.at)
        const inside = (c: Cell) => c[0] >= 1 && c[0] <= level.rows && c[1] >= 1 && c[1] <= level.cols
        taken.forEach(c => !inside(c) && problems.push(`N${level.level}: carro parado fora da grade`))
        level.requests.forEach((r, i) => {
            if (!inside(r.to)) problems.push(`${tag(i)}: vaga fora da grade`)
            if (taken.some(t => sameCell(t, r.to))) problems.push(`${tag(i)}: a vaga já está ocupada`)
            if (level.level < 3 && r.to[0] === r.to[1]) problems.push(`${tag(i)}: linha igual à coluna esconde a troca L↔C`)
            if (level.level < 3 && (r.scheme || r.face)) problems.push(`${tag(i)}: numeração e frente/ré só no N3`)
            if (level.level === 3 && !r.face) problems.push(`${tag(i)}: o N3 diz de frente ou de ré`)
            taken.push(r.to)
        })
        if (level.level === 3) {
            const schemes = new Set(level.requests.map(r => r.scheme ?? 'lc'))
            if (schemes.size !== level.requests.length) problems.push('N3: cada pedido usa uma representação diferente')
            const faces = new Set(level.requests.map(r => r.face))
            if (faces.size < 2) problems.push('N3: precisa de pedidos de frente e de ré')
        }
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[manobrista-da-matriz] níveis inválidos', PROBLEMS)
