import type { DeviceId, LevelDef } from '../types'
import { DEVICES } from './devices'
import { fitting, verdict } from './rules'
import { LEVEL_TEXT, PROBLEM_TEXT, why } from './words'

export const POINTS = 10

export const guideKey = (level: number) => `ef05co11-rota-l${level}`

const N1: LevelDef = {
    level: 1,
    ...LEVEL_TEXT[1],
    zone: 'vila',
    devices: ['buzina', 'farol', 'mensagem', 'limpador'],
    problems: [
        { id: 'escuro', kind: 'escuro', need: 'luz', ...PROBLEM_TEXT.escuro, drive: 4600 },
        { id: 'chuva', kind: 'chuva', need: 'limpar', ...PROBLEM_TEXT.chuva, drive: 3400 },
        { id: 'cachorro', kind: 'cachorro', need: 'avisar', audience: 'bicho', ...PROBLEM_TEXT.cachorro, drive: 3600 },
        { id: 'entrega', kind: 'entrega', need: 'avisar', audience: 'pessoa', quiet: true, ...PROBLEM_TEXT.entrega, drive: 3200 },
    ],
}

const N2: LevelDef = {
    level: 2,
    ...LEVEL_TEXT[2],
    zone: 'serra',
    headlights: true,
    village: true,
    devices: ['buzina', 'gps', 'mensagem', 'altofalante'],
    problems: [
        { id: 'bifurcacao', kind: 'bifurcacao', need: 'caminho', way: -1, ...PROBLEM_TEXT.bifurcacao, drive: 2600 },
        { id: 'vaca', kind: 'vaca', need: 'avisar', audience: 'bicho', ...PROBLEM_TEXT.vaca, drive: 2600 },
        { id: 'vizinho', kind: 'vizinho', need: 'avisar', audience: 'pessoa', far: true, quiet: true, ...PROBLEM_TEXT.vizinho, drive: 2400 },
        { id: 'ponte', kind: 'ponte', need: 'avisar', audience: 'pessoa', crowd: true, far: true, ...PROBLEM_TEXT.ponte, drive: 2400 },
    ],
}

const N3: LevelDef = {
    level: 3,
    ...LEVEL_TEXT[3],
    zone: 'terra',
    headlights: true,
    signal: true,
    devices: ['gps', 'mapa', 'radio', 'mensagem'],
    problems: [
        { id: 'semsinal', kind: 'bifurcacao', need: 'caminho', offline: true, way: 1, ...PROBLEM_TEXT.semsinal, drive: 2600 },
        {
            id: 'atoleiro',
            kind: 'atoleiro',
            need: 'avisar',
            audience: 'pessoa',
            far: true,
            radio: true,
            offline: true,
            ...PROBLEM_TEXT.atoleiro,
            drive: 2600,
        },
        { id: 'ruanova', kind: 'bifurcacao', need: 'caminho', newRoad: true, way: -1, ...PROBLEM_TEXT.ruanova, drive: 3800 },
        { id: 'cida', kind: 'entrega', need: 'avisar', audience: 'pessoa', quiet: true, ...PROBLEM_TEXT.cida, drive: 3200 },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = `N${level.level}`
        if (level.problems.length > 5) problems.push(`${tag}: mais de 5 problemas`)
        if (level.devices.length > 4) problems.push(`${tag}: mais de 4 botões na central`)
        const on = new Set<DeviceId>()
        let lastSlot = -1
        level.problems.forEach(problem => {
            const free = level.devices.filter(id => !on.has(id))
            const fit = fitting(problem, free)
            if (free.length < 2) problems.push(`${tag} ${problem.id}: menos de 2 botões livres`)
            if (fit.length !== 1) problems.push(`${tag} ${problem.id}: ${fit.length} tecnologias adequadas`)
            free
                .filter(id => verdict(problem, id) !== 'fit' && !why(problem, id))
                .forEach(id => problems.push(`${tag} ${problem.id}: ${id} sem frase do porquê`))
            if (!fit.length) return
            const slot = level.devices.indexOf(fit[0])
            if (slot === lastSlot) problems.push(`${tag} ${problem.id}: o certo no mesmo lugar do anterior`)
            lastSlot = slot
            if (DEVICES[fit[0]].stays) on.add(fit[0])
        })
    })
    if (problems.length) throw new Error(`Rota da Madrugada — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
