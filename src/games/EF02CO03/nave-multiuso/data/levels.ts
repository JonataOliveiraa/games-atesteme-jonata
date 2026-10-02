import type { Kind, LevelDef, Place, Slot, ThingDef, Tool } from '../types'

export const POINTS = 5
export const MIN_GAP = 240
export const SURPRISE_GAP = 360
export const PAIR_SPREAD = 2

export const guideKey = (level: number) => `ef02co03-l${level}`
export const placeKey = (place: Place) => `ef02co03-${place}`

export const TOOLS: Tool[] = ['blower', 'water', 'pull']

export const TOOL_FOR: Record<Kind, Tool> = {
    leaves: 'blower',
    fire: 'water',
    sheep: 'pull',
}

const L = (slot: Slot, gap: number): ThingDef => ({ kind: 'leaves', slot, gap })
const F = (slot: Slot, gap: number): ThingDef => ({ kind: 'fire', slot, gap })
const S = (slot: Slot, gap: number): ThingDef => ({ kind: 'sheep', slot, gap })

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        speed: 100,
        waves: [
            { place: 'earth', things: [L(2, 0), L(0, 260), L(4, 0), L(1, 280), F(3, 380), L(3, 360), L(0, 260)] },
            { place: 'earth', things: [L(1, 0), L(3, 0), L(2, 280), L(4, 260), S(0, 380), L(0, 360), L(2, 0), L(4, 260)] },
            { place: 'earth', things: [L(0, 0), L(4, 0), F(2, 380), L(2, 360), S(4, 380), L(1, 360), L(3, 0), L(2, 280)] },
        ],
    },
    {
        level: 2,
        speed: 110,
        waves: [
            { place: 'earth', things: [L(1, 0), L(3, 0), F(0, 380), L(4, 360), L(2, 260), S(2, 380), L(0, 360), L(4, 0)] },
            { place: 'earth', things: [L(2, 0), F(4, 380), L(4, 360), L(0, 0), F(1, 380), L(3, 360), S(0, 380), L(2, 360)] },
            { place: 'space', things: [L(2, 0), L(0, 260), L(4, 0), F(1, 380), L(3, 360), S(2, 380), L(2, 360), L(0, 260), L(4, 0)] },
        ],
    },
    {
        level: 3,
        speed: 120,
        waves: [
            { place: 'space', things: [L(0, 0), L(4, 0), L(2, 260), F(3, 380), L(1, 360), S(4, 380), L(0, 360), L(2, 260)] },
            { place: 'space', things: [L(1, 0), L(3, 0), S(0, 380), F(4, 380), L(2, 360), L(0, 260), L(4, 0), F(2, 380), L(1, 360)] },
            { place: 'moon', things: [L(2, 0), L(0, 260), L(4, 0), F(2, 380), L(1, 360), S(3, 380), L(3, 360), L(0, 260), F(4, 380), L(2, 360)] },
        ],
    },
]

const PLACES: Record<number, Place[]> = {
    1: ['earth', 'earth', 'earth'],
    2: ['earth', 'earth', 'space'],
    3: ['space', 'space', 'moon'],
}

export const totalThings = (level: LevelDef) => level.waves.reduce((sum, wave) => sum + wave.things.length, 0)

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        const places = level.waves.map(wave => wave.place).join()
        if (PLACES[level.level] && places !== PLACES[level.level].join()) problems.push(`${tag}: lugares ${places}`)
        const kinds = new Set<Kind>()
        level.waves.forEach((wave, w) => {
            const where = `${tag}/onda ${w + 1}`
            const list = wave.things
            if (list[0]?.gap !== 0) problems.push(`${where}: o primeiro vão não é 0`)
            if (!list.some(t => t.kind !== 'leaves')) problems.push(`${where}: sem surpresa`)
            list.forEach((thing, k) => {
                kinds.add(thing.kind)
                if (thing.slot < 0 || thing.slot > 4) problems.push(`${where}/${k + 1}: posição ${thing.slot}`)
                if (k === 0) return
                const prev = list[k - 1]
                if (thing.gap === 0) {
                    if (thing.kind !== 'leaves' || prev.kind !== 'leaves') problems.push(`${where}/${k + 1}: par junto que não é de folhas`)
                    if (Math.abs(thing.slot - prev.slot) < PAIR_SPREAD) problems.push(`${where}/${k + 1}: par junto perto demais`)
                    return
                }
                if (thing.gap < MIN_GAP) problems.push(`${where}/${k + 1}: vão ${thing.gap} < ${MIN_GAP}`)
                const surprise = thing.kind !== 'leaves' || prev.kind !== 'leaves'
                if (surprise && thing.gap < SURPRISE_GAP) problems.push(`${where}/${k + 1}: vão curto em volta da surpresa`)
            })
        })
        if (kinds.size !== 3) problems.push(`${tag}: faltam tipos de coisa`)
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[nave-multiuso]', PROBLEMS)
