import type { Kind, LevelDef, Place, Rule, SignRow, Slot, ThingDef, Tool, WaveDef } from '../types'

export const POINTS = 5
export const MIN_GAP = 240
export const SURPRISE_GAP = 360
export const RUN_GAP = 260
export const PAIR_GAP = 400
export const GROUP_GAP = 480
export const PAIR_SPREAD = 2
export const MAX_ROWS = 4

export const guideKey = (level: number) => `ef02co03-l${level}`
export const placeKey = (place: Place) => `ef02co03-${place}`
export const SIGN_KEY: Record<Exclude<Rule, 'free'>, string> = {
    things: 'ef02co03-sign',
    tools: 'ef02co03-tools',
}

export const TOOLS: Tool[] = ['blower', 'water', 'pull']
export const KINDS: Kind[] = ['leaves', 'fire', 'sheep']

export const TOOL_FOR: Record<Kind, Tool> = {
    leaves: 'blower',
    fire: 'water',
    sheep: 'pull',
}

export const KIND_FOR: Record<Tool, Kind> = {
    blower: 'leaves',
    water: 'fire',
    pull: 'sheep',
}

const L = (slot: Slot, gap: number): ThingDef => ({ kind: 'leaves', slot, gap })
const F = (slot: Slot, gap: number): ThingDef => ({ kind: 'fire', slot, gap })
const S = (slot: Slot, gap: number): ThingDef => ({ kind: 'sheep', slot, gap })

const run = (kind: Kind, ...slots: Slot[]): ThingDef[] =>
    slots.map((slot, k) => ({ kind, slot, gap: k === 0 ? GROUP_GAP : RUN_GAP }))

const pick = (...pairs: [Kind, Slot, Kind, Slot][]): ThingDef[] =>
    pairs.flatMap(([kind, slot, other, away], k) => [
        { kind, slot, gap: k === 0 ? GROUP_GAP : PAIR_GAP },
        { kind: other, slot: away, gap: 0, decoy: true },
    ])

const sequence = (place: Place, ...groups: ThingDef[][]): WaveDef => ({
    place,
    things: groups
        .flatMap((list, group) => list.map(thing => ({ ...thing, group })))
        .map((thing, k) => (k === 0 ? { ...thing, gap: 0 } : thing)),
})

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        speed: 100,
        rule: 'free',
        waves: [
            { place: 'earth', things: [L(2, 0), L(0, 260), L(4, 0), L(1, 280), F(3, 380), L(3, 360), L(0, 260)] },
            { place: 'earth', things: [L(1, 0), L(3, 0), L(2, 280), L(4, 260), S(0, 380), L(0, 360), L(2, 0), L(4, 260)] },
            { place: 'earth', things: [L(0, 0), L(4, 0), F(2, 380), L(2, 360), S(4, 380), L(1, 360), L(3, 0), L(2, 280)] },
        ],
    },
    {
        level: 2,
        speed: 105,
        rule: 'things',
        waves: [
            sequence('earth', run('leaves', 2, 0, 3), run('fire', 1, 4), run('sheep', 2), run('leaves', 0, 3)),
            sequence('earth', run('fire', 3, 0), run('leaves', 2, 4, 1), run('sheep', 3, 0), run('fire', 2)),
            sequence('space', run('leaves', 1, 3), run('sheep', 4, 0), run('fire', 2, 4), run('leaves', 0, 2)),
        ],
    },
    {
        level: 3,
        speed: 110,
        rule: 'tools',
        waves: [
            sequence(
                'space',
                pick(['leaves', 1, 'fire', 3], ['leaves', 4, 'sheep', 1]),
                pick(['fire', 3, 'leaves', 0], ['fire', 0, 'sheep', 3]),
                pick(['sheep', 2, 'fire', 4]),
            ),
            sequence(
                'space',
                pick(['fire', 4, 'sheep', 1]),
                pick(['sheep', 0, 'leaves', 4], ['sheep', 3, 'fire', 0]),
                pick(['leaves', 2, 'fire', 0], ['leaves', 1, 'sheep', 4]),
            ),
            sequence(
                'moon',
                pick(['sheep', 1, 'leaves', 4], ['sheep', 4, 'fire', 1]),
                pick(['leaves', 4, 'sheep', 1]),
                pick(['fire', 2, 'leaves', 0], ['fire', 3, 'sheep', 0]),
            ),
        ],
    },
]

const PLACES: Record<number, Place[]> = {
    1: ['earth', 'earth', 'earth'],
    2: ['earth', 'earth', 'space'],
    3: ['space', 'space', 'moon'],
}

const RULES: Record<number, Rule> = { 1: 'free', 2: 'things', 3: 'tools' }

export const totalThings = (level: LevelDef) =>
    level.waves.reduce((sum, wave) => sum + wave.things.filter(thing => !thing.decoy).length, 0)

export function signRows(wave: WaveDef, rule: Rule): SignRow[] {
    const rows: SignRow[] = []
    if (rule === 'free') return rows
    wave.things.forEach(thing => {
        if (thing.group === undefined || thing.decoy) return
        rows[thing.group] ??= rule === 'tools' ? { tool: TOOL_FOR[thing.kind], count: 0 } : { kind: thing.kind, count: 0 }
        rows[thing.group].count += 1
    })
    return rows
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        const rule = level.rule
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (RULES[level.level] && rule !== RULES[level.level]) problems.push(`${tag}: regra ${rule}`)
        const places = level.waves.map(wave => wave.place).join()
        if (PLACES[level.level] && places !== PLACES[level.level].join()) problems.push(`${tag}: lugares ${places}`)
        const kinds = new Set<Kind>()
        level.waves.forEach((wave, w) => {
            const where = `${tag}/onda ${w + 1}`
            const list = wave.things
            const rows = signRows(wave, rule)
            if (list[0]?.gap !== 0) problems.push(`${where}: o primeiro vão não é 0`)
            if (rule === 'free' && !list.some(t => t.kind !== 'leaves')) problems.push(`${where}: sem surpresa`)
            if (rule !== 'free') {
                if (rows.length < 2 || rows.length > MAX_ROWS) problems.push(`${where}: ${rows.length} linhas na placa`)
                if (Array.from(rows).some(row => !row)) problems.push(`${where}: grupo vazio na placa`)
                rows.forEach((row, r) => {
                    const prev = rows[r - 1]
                    if (prev && row && prev.kind === row.kind && prev.tool === row.tool) problems.push(`${where}: linhas ${r} e ${r + 1} iguais`)
                })
            }
            list.forEach((thing, k) => {
                const at = `${where}/${k + 1}`
                if (!thing.decoy) kinds.add(thing.kind)
                if (thing.slot < 0 || thing.slot > 4) problems.push(`${at}: posição ${thing.slot}`)
                if ((rule === 'free') !== (thing.group === undefined)) problems.push(`${at}: grupo errado para a regra ${rule}`)
                if (thing.decoy && rule !== 'tools') problems.push(`${at}: isca fora do N3`)
                const row = thing.group === undefined ? undefined : rows[thing.group]
                if (row && rule === 'things' && thing.kind !== row.kind) problems.push(`${at}: coisa diferente da linha da placa`)
                if (row && rule === 'tools') {
                    const fits = TOOL_FOR[thing.kind] === row.tool
                    if (thing.decoy && fits) problems.push(`${at}: a isca é resolvida pela ferramenta da placa`)
                    if (!thing.decoy && !fits) problems.push(`${at}: a ferramenta da placa não resolve esta coisa`)
                }
                if (k === 0) return
                const prev = list[k - 1]
                if (thing.group !== undefined && prev.group !== undefined && thing.group !== prev.group && thing.group !== prev.group + 1) {
                    problems.push(`${at}: grupo fora de ordem`)
                }
                if (rule === 'tools' && !thing.decoy && !prev.decoy) problems.push(`${where}/${k}: coisa sem isca`)
                const from = rule === 'tools' && thing.decoy ? list.slice(0, k - 1).filter(t => !t.decoy).pop() : undefined
                if (from && Math.min(from.slot, prev.slot) < thing.slot && thing.slot < Math.max(from.slot, prev.slot)) {
                    problems.push(`${at}: a isca fica no caminho entre uma coisa e a próxima`)
                }
                if (thing.gap === 0) {
                    if (Math.abs(thing.slot - prev.slot) < PAIR_SPREAD) problems.push(`${at}: par junto perto demais`)
                    if (thing.group !== prev.group) problems.push(`${at}: par junto entre grupos`)
                    if (rule === 'tools') {
                        if (!thing.decoy || prev.decoy) problems.push(`${at}: par sem isca`)
                    } else if (thing.kind !== 'leaves' || prev.kind !== 'leaves') {
                        problems.push(`${at}: par junto que não é de folhas`)
                    }
                    return
                }
                if (thing.decoy) problems.push(`${at}: isca sem par`)
                const opens = thing.group !== undefined && thing.group !== prev.group
                const need = opens ? GROUP_GAP : rule === 'tools' ? PAIR_GAP : rule === 'things' ? RUN_GAP : MIN_GAP
                if (thing.gap < need) problems.push(`${at}: vão ${thing.gap} curto (mínimo ${need})`)
                const surprise = thing.kind !== 'leaves' || prev.kind !== 'leaves'
                if (rule === 'free' && surprise && thing.gap < SURPRISE_GAP) problems.push(`${at}: vão curto em volta da surpresa`)
            })
            if (rule === 'tools' && list.length && !list[list.length - 1].decoy) problems.push(`${where}: a última coisa não tem isca`)
        })
        if (!KINDS.every(kind => kinds.has(kind))) problems.push(`${tag}: faltam tipos de coisa`)
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[nave-multiuso]', PROBLEMS)
