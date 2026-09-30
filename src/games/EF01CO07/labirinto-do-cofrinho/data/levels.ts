import type { Cell, Dir, LevelDef, MazeDef, Spot } from '../types'
import { CHILD_NAME, PEOPLE, TRAP_LINE } from './people'

export const POINTS = { cross: 10, person: 20, refuse: 10 } as const
export const GUIDE_KEY = 'ef01co07-l1'
export const COLS = 11
export const ROWS = 7

const GARDEN_TOP = [
    '########M##',
    '#....#....#',
    '#.##.#.##.#',
    'S.##...##.E',
    '#.##.#.##.#',
    '#....#....#',
    '###########',
]

const GARDEN_BOTTOM = [
    '###########',
    '#....#....#',
    '#.##.#.##.#',
    'S.##...##.E',
    '#.##.#.#M.#',
    '#....#....#',
    '###########',
]

const SHORTCUT_WALLS = [
    '#.........#',
    '#.#######.#',
    '#.#M###M#.#',
    'S.........E',
    '#.#######.#',
    '#.........#',
    '###########',
]

const SHORTCUT_BRIDGES = [
    '#.........#',
    '#.###.###.#',
    '#.#M#.#M#.#',
    'S.........E',
    '#.###.###.#',
    '#.........#',
    '###########',
]

const OFFER_AT_EXIT = [
    '#.........#',
    '#.###.###.#',
    '#.#M#.#M#.#',
    'S.........E',
    '#.###.###T#',
    '#.....#####',
    '###########',
]

const OFFER_AT_START = [
    '#.........#',
    '#.###.###.#',
    '#.#M#.#M#.#',
    'S.........E',
    '#T###.###.#',
    '#####.....#',
    '###########',
]

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        mazes: [
            { id: 'jardim-mae', rows: GARDEN_TOP, trusted: 'mom', stranger: 'neighbor', trap: null },
            { id: 'jardim-pai', rows: GARDEN_BOTTOM, trusted: 'dad', stranger: 'mascot', trap: null },
        ],
        magnets: 1,
        shortcut: false,
        edgeHoldMs: 600,
        reach: 4,
        speed: 300,
        message: 'Meus dados são meus tesouros: só mostro para quem cuida de mim.',
    },
    {
        level: 2,
        mazes: [
            { id: 'atalho-prof', rows: SHORTCUT_WALLS, trusted: 'teacher', stranger: 'neighbor', trap: null },
            { id: 'atalho-mae', rows: SHORTCUT_BRIDGES, trusted: 'mom', stranger: 'mascot', trap: null },
        ],
        magnets: 2,
        shortcut: true,
        edgeHoldMs: 600,
        reach: 4,
        speed: 300,
        message: 'O caminho mais curto nem sempre é o mais seguro.',
    },
    {
        level: 3,
        mazes: [
            { id: 'figurinha-pai', rows: OFFER_AT_EXIT, trusted: 'dad', stranger: 'neighbor', trap: 'mascot' },
            { id: 'figurinha-mae', rows: OFFER_AT_START, trusted: 'mom', stranger: 'mascot', trap: 'neighbor' },
        ],
        magnets: 2,
        shortcut: true,
        edgeHoldMs: 600,
        reach: 4,
        speed: 300,
        message: 'Nem por uma figurinha: meus dados não se trocam.',
    },
]

export const DIRS: Record<Dir, Spot> = {
    up: { c: 0, r: -1 },
    down: { c: 0, r: 1 },
    left: { c: -1, r: 0 },
    right: { c: 1, r: 0 },
}

const DIR_ORDER: Dir[] = ['down', 'up', 'right', 'left']

export const spotKey = (s: Spot) => `${s.c},${s.r}`
export const same = (a: Spot, b: Spot) => a.c === b.c && a.r === b.r
export const add = (s: Spot, d: Dir): Spot => ({ c: s.c + DIRS[d].c, r: s.r + DIRS[d].r })

export const cellOf = (maze: MazeDef, s: Spot): Cell | undefined => maze.rows[s.r]?.[s.c] as Cell | undefined

export const isOpen = (maze: MazeDef, s: Spot): boolean => {
    const k = cellOf(maze, s)
    return k === '.' || k === 'S' || k === 'E'
}

export const openNeighbors = (maze: MazeDef, s: Spot): Spot[] =>
    DIR_ORDER.map(d => add(s, d)).filter(n => isOpen(maze, n))

export function findAll(maze: MazeDef, kind: Cell): Spot[] {
    const out: Spot[] = []
    maze.rows.forEach((row, r) => [...row].forEach((k, c) => k === kind && out.push({ c, r })))
    return out
}

export const startOf = (maze: MazeDef): Spot => findAll(maze, 'S')[0]
export const exitOf = (maze: MazeDef): Spot => findAll(maze, 'E')[0]
export const magnetsOf = (maze: MazeDef): Spot[] => findAll(maze, 'M')

export function fieldOf(maze: MazeDef): Spot[] {
    const seen = new Map<string, Spot>()
    magnetsOf(maze).forEach(m => openNeighbors(maze, m).forEach(n => seen.set(spotKey(n), n)))
    return [...seen.values()]
}

const fieldCache = new WeakMap<MazeDef, Set<string>>()

export function fieldKeys(maze: MazeDef): Set<string> {
    let keys = fieldCache.get(maze)
    if (!keys) {
        keys = new Set(fieldOf(maze).map(spotKey))
        fieldCache.set(maze, keys)
    }
    return keys
}

export const inField = (maze: MazeDef, s: Spot): boolean => fieldKeys(maze).has(spotKey(s))

export const canStep = (maze: MazeDef, from: Spot, to: Spot): boolean =>
    Math.abs(from.c - to.c) + Math.abs(from.r - to.r) === 1 && isOpen(maze, to)

export function fieldOwner(maze: MazeDef, s: Spot): Spot | undefined {
    return magnetsOf(maze).find(m => Math.abs(m.c - s.c) + Math.abs(m.r - s.r) === 1)
}

export function nicheDir(maze: MazeDef, m: Spot): Dir {
    return DIR_ORDER.find(d => isOpen(maze, add(m, d))) ?? 'down'
}

export function bfs(maze: MazeDef, from: Spot, to: Spot, avoid: Set<string> = new Set()): Spot[] | null {
    const prev = new Map<string, Spot | null>([[spotKey(from), null]])
    const queue: Spot[] = [from]
    while (queue.length) {
        const s = queue.shift() as Spot
        if (same(s, to)) {
            const path: Spot[] = []
            let at: Spot | null = s
            while (at) {
                path.unshift(at)
                at = prev.get(spotKey(at)) ?? null
            }
            return path
        }
        openNeighbors(maze, s).forEach(n => {
            const k = spotKey(n)
            if (prev.has(k) || avoid.has(k)) return
            prev.set(k, s)
            queue.push(n)
        })
    }
    return null
}

export const safePath = (maze: MazeDef) => bfs(maze, startOf(maze), exitOf(maze), fieldKeys(maze))
export const shortestPath = (maze: MazeDef) => bfs(maze, startOf(maze), exitOf(maze))

export function routeTo(maze: MazeDef, from: Spot, to: Spot, reach: number): Spot[] | null {
    if (!isOpen(maze, to) || same(from, to)) return null
    const avoid = new Set(fieldKeys(maze))
    avoid.delete(spotKey(to))
    const safe = bfs(maze, from, to, avoid)
    if (safe && safe.length - 1 <= reach) return safe.slice(1)
    const any = bfs(maze, from, to)
    return any && any.length - 1 <= reach ? any.slice(1) : null
}

export function reachable(maze: MazeDef, from: Spot, reach: number): Spot[] {
    const depth = new Map<string, number>([[spotKey(from), 0]])
    const queue: Spot[] = [from]
    const out: Spot[] = []
    while (queue.length) {
        const s = queue.shift() as Spot
        const d = depth.get(spotKey(s)) as number
        if (d >= reach) continue
        openNeighbors(maze, s).forEach(n => {
            const k = spotKey(n)
            if (depth.has(k)) return
            depth.set(k, d + 1)
            out.push(n)
            queue.push(n)
        })
    }
    return out
}

export const trapOf = (maze: MazeDef): Spot | undefined => findAll(maze, 'T')[0]

export function trapDoor(maze: MazeDef): Spot | undefined {
    const trap = trapOf(maze)
    return trap ? openNeighbors(maze, trap)[0] : undefined
}

export const dirBetween = (from: Spot, to: Spot): Dir =>
    to.c > from.c ? 'right' : to.c < from.c ? 'left' : to.r > from.r ? 'down' : 'up'

function checkMaze(level: LevelDef, maze: MazeDef, tag: string, problems: string[]) {
    if (maze.rows.length !== ROWS || maze.rows.some(row => row.length !== COLS)) {
        problems.push(`${tag}: não é ${COLS} × ${ROWS}`)
        return
    }
    const starts = findAll(maze, 'S')
    const exits = findAll(maze, 'E')
    if (starts.length !== 1 || exits.length !== 1) {
        problems.push(`${tag}: precisa de um S e um E`)
        return
    }
    const start = starts[0]
    const exit = exits[0]
    if (start.c !== 0) problems.push(`${tag}: S fora da borda esquerda`)
    if (exit.c !== COLS - 1) problems.push(`${tag}: E fora da borda direita`)

    const magnets = magnetsOf(maze)
    if (magnets.length !== level.magnets) problems.push(`${tag}: ${magnets.length} ímãs, o nível pede ${level.magnets}`)
    magnets.forEach(m => {
        if (!openNeighbors(maze, m).length) problems.push(`${tag}: ímã em ${spotKey(m)} sem caminho ao lado`)
        if (nicheDir(maze, m) !== 'down') problems.push(`${tag}: o nicho do ímã em ${spotKey(m)} tem de abrir para baixo`)
    })

    const safe = safePath(maze)
    const shortest = shortestPath(maze)
    if (!safe) problems.push(`${tag}: sem caminho seguro`)
    if (!shortest) problems.push(`${tag}: sem caminho de S a E`)
    if (safe && shortest && !level.shortcut && safe.length > shortest.length * 1.25) {
        problems.push(`${tag}: caminho seguro longo demais sem atalho`)
    }
    if (safe && shortest && level.shortcut) {
        if (!shortest.some(s => inField(maze, s))) problems.push(`${tag}: o caminho mais curto não passa pelo campo, não há atalho`)
        if (safe.length > shortest.length * 2) problems.push(`${tag}: caminho seguro mais que o dobro do atalho`)
    }
    if (safe && safe.slice(0, 3).some(s => inField(maze, s))) problems.push(`${tag}: a saída de S começa no campo`)

    const field = fieldOf(maze)
    const crossesField = field.some(f => bfs(maze, start, f) && bfs(maze, f, exit))
    if (!crossesField) problems.push(`${tag}: nenhum caminho passa pelo campo, o ímã não é escolha`)

    maze.rows.forEach((row, r) =>
        [...row].forEach((k, c) => {
            if (k !== '.') return
            if (openNeighbors(maze, { c, r }).length < 2) problems.push(`${tag}: beco em ${c},${r}`)
        }),
    )

    const nearDoor = [start, exit, ...openNeighbors(maze, start), ...openNeighbors(maze, exit)]
    field.forEach(f => {
        if (openNeighbors(maze, f).length >= 3) problems.push(`${tag}: campo em ${spotKey(f)} é bifurcação`)
        if (nearDoor.some(d => same(d, f))) problems.push(`${tag}: campo em ${spotKey(f)} encosta na entrada ou na saída`)
    })

    if (!PEOPLE[maze.trusted].trusted) problems.push(`${tag}: ${maze.trusted} não é de confiança`)
    if (PEOPLE[maze.stranger].trusted) problems.push(`${tag}: ${maze.stranger} é de confiança`)
    if (!PEOPLE[maze.trusted].line.includes(CHILD_NAME)) problems.push(`${tag}: quem cuida não chama a ${CHILD_NAME} pelo nome`)
    if (PEOPLE[maze.stranger].line.includes(CHILD_NAME)) problems.push(`${tag}: o desconhecido sabe o nome da ${CHILD_NAME}`)
    checkTrap(level, maze, tag, problems)
}

function checkTrap(level: LevelDef, maze: MazeDef, tag: string, problems: string[]) {
    const cells = findAll(maze, 'T')
    if (!maze.trap) {
        if (cells.length) problems.push(`${tag}: casinha T sem ninguém`)
        return
    }
    if (level.level < 3) problems.push(`${tag}: pedido no caminho só no N3`)
    if (cells.length !== 1) {
        problems.push(`${tag}: pedido precisa de exatamente uma casinha T`)
        return
    }
    if (PEOPLE[maze.trap].trusted) problems.push(`${tag}: quem pede no caminho é de confiança`)
    if (maze.trap === maze.stranger || maze.trap === maze.trusted) problems.push(`${tag}: quem pede no caminho repete a saída`)
    if (TRAP_LINE.includes(CHILD_NAME)) problems.push(`${tag}: quem pede no caminho sabe o nome da ${CHILD_NAME}`)
    const door = trapDoor(maze)
    if (!door) {
        problems.push(`${tag}: casinha T sem passagem ao lado`)
        return
    }
    if (inField(maze, door)) problems.push(`${tag}: casinha T encosta no campo`)
    if (bfs(maze, startOf(maze), exitOf(maze), new Set([spotKey(door)]))) problems.push(`${tag}: dá para fugir do pedido sem passar ao lado`)
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.mazes.length < 1 || level.mazes.length > 5) problems.push(`${tag}: ${level.mazes.length} labirintos`)
        if (level.level === 1 && level.mazes.length !== 2) problems.push(`${tag}: N1 tem 2 labirintos`)
        if (level.reach < 2 || level.reach > 6) problems.push(`${tag}: alcance ${level.reach} fora de 2 a 6`)
        level.mazes.forEach(maze => checkMaze(level, maze, `${tag}/${maze.id}`, problems))
        if (level.level === 3 && level.mazes.some(m => !m.trap)) problems.push(`${tag}: todo labirinto do N3 tem um pedido no caminho`)
        const trusted = level.mazes.map(m => m.trusted)
        const strangers = level.mazes.map(m => m.stranger)
        if (new Set(trusted).size !== trusted.length) problems.push(`${tag}: quem cuida se repete`)
        if (new Set(strangers).size !== strangers.length) problems.push(`${tag}: o desconhecido se repete`)
    })
    return [...new Set(problems)]
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[labirinto-do-cofrinho]', PROBLEMS)
