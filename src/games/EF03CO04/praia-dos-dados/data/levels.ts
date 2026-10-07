import type { BatherId, LevelDef, PhaseDef } from '../types'
import { BATHER, SLOT, has } from './cast'
import { SAY } from './words'

export const POINTS = 10
export const BAYS = 6
export const SAY_MAX = 30
export const PROTEST_MAX = 36

export const guideKey = (level: number) => `__praiaDosDadosGuide-l${level}`

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Um dado só não basta',
        message: 'Dois dados juntos acharam cada dono.',
        manualRadio: false,
        phases: [
            { dog: 'pacoca', bays: ['ze', 'leo', 'mari', 'nico', 'caio', 'beto'], data: ['cap', 'bucket'] },
            { dog: 'salsicha', bays: ['bia', 'rafa', 'duda', 'mei', 'mari', 'nena'], data: ['hat', 'ring'] },
            { dog: 'floco', bays: ['tati', 'duda', 'nico', 'leo', 'ze', 'caio'], data: ['glasses', 'ball'] },
        ],
    },
    {
        level: 2,
        title: 'Três dados',
        message: 'Às vezes dois dados ainda não bastam.',
        manualRadio: false,
        phases: [
            { dog: 'pacoca', bays: ['duda', 'beto', 'bia', 'tati', 'leo', 'nico'], data: ['cap', 'glasses', 'fins'] },
            { dog: 'salsicha', bays: ['ze', 'caio', 'rafa', 'mei', 'nena', 'duda'], data: ['fins', 'ball', 'hat'] },
            { dog: 'floco', bays: ['mari', 'tati', 'ze', 'bia', 'mei', 'duda'], data: ['ring', 'glasses', 'fins'] },
        ],
    },
    {
        level: 3,
        title: 'Nem todo dado ajuda',
        message: 'Um dado que todos têm não separa ninguém.',
        manualRadio: true,
        phases: [
            { dog: 'pacoca', bays: ['ze', 'leo', 'caio', 'mari', 'beto', 'tati'], data: ['cap', 'glasses', 'bucket'] },
            { dog: 'salsicha', bays: ['leo', 'ze', 'duda', 'beto', 'mei', 'tati'], data: ['glasses', 'fins', 'ring'] },
            { dog: 'floco', bays: ['bia', 'rafa', 'mari', 'nena', 'caio', 'nico'], data: ['hat', 'fins', 'ball'] },
        ],
    },
]

/** Quem continua na praia depois de cada dado (índice 0 = antes do primeiro). */
export function narrow(phase: PhaseDef): BatherId[][] {
    const steps: BatherId[][] = [phase.bays.slice()]
    phase.data.forEach(t => steps.push(steps[steps.length - 1].filter(id => has(id, t))))
    return steps
}

export const ownerOf = (phase: PhaseDef) => narrow(phase)[phase.data.length][0]

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        let lastOwnerBay = -1
        level.phases.forEach((phase, p) => {
            const tag = `N${level.level}-${p + 1}`
            const fail = (msg: string) => problems.push(`${tag}: ${msg}`)
            if (phase.bays.length !== BAYS || new Set(phase.bays).size !== BAYS) fail('precisa de 6 banhistas diferentes')
            if (phase.bays.some(id => !BATHER[id])) fail('banhista fora do elenco')
            const slots = phase.data.map(t => SLOT[t])
            if (new Set(slots).size !== slots.length) fail('dois dados do mesmo traço')
            phase.data.forEach(t => {
                if (phase.bays.filter(id => has(id, t)).length < 2) fail(`${t} sozinho já aponta alguém`)
                if (SAY.datum(t).length > SAY_MAX) fail(`fala longa: ${SAY.datum(t)}`)
            })

            const steps = narrow(phase)
            const n = phase.data.length
            if (steps[n].length !== 1) fail(`sobram ${steps[n].length} no fim`)
            if (n > 0 && steps[n - 1].length < 2) fail('antes do último dado já sobra um')
            const removed = phase.data.map((_, d) => steps[d].length - steps[d + 1].length)
            const idle = removed.filter(r => r === 0).length

            if (level.level === 1 && n !== 2) fail('N1 tem 2 dados')
            if (level.level === 2 && n !== 3) fail('N2 tem 3 dados')
            if (level.level === 3 && n !== 3) fail('N3 tem 3 dados')
            if (level.level < 3 && idle > 0) fail('dado que não tira ninguém fora do N3')
            if (level.level === 3 && (idle !== 1 || removed[n - 1] === 0)) fail('N3: um dado que não tira ninguém, e não o último')
            if (level.manualRadio !== (level.level === 3)) fail('rádio manual só no N3')

            const owner = steps[n][0]
            if (owner) {
                const bay = phase.bays.indexOf(owner)
                if (bay === lastOwnerBay) fail('dono na mesma baia da fase anterior')
                lastOwnerBay = bay
                phase.data.forEach(t => {
                    if (SAY.keptOwner(t, phase.dog).length > PROTEST_MAX) fail(`protesto longo: ${SAY.keptOwner(t, phase.dog)}`)
                })
            }
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[praia-dos-dados] níveis inválidos', PROBLEMS)
