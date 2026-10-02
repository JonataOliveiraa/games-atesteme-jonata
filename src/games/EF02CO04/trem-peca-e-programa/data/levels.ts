import Phaser from 'phaser'
import type { ItemId, LevelDef, PhaseDef } from '../types'
import { ITEMS, TRAINING } from './items'

export const guideKey = (level: number) => `__tremPecaEProgramaGuide-l${level}`
export const POINTS = 10
export const NAME_MAX = 16

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Peça ou programa?',
        message: 'Peça que a gente toca = HARDWARE. Programa que dá ordens = SOFTWARE.',
        wait: true,
        order: ['music', 'speaker'],
        phases: [
            { id: 'n1-viagem-1', items: ['mouse', 'keyboard', 'game', 'music'] },
            { id: 'n1-viagem-2', items: ['speaker', 'gamepad', 'paint', 'alarm'] },
        ],
    },
]

const runOf = (list: ItemId[]) => {
    let longest = 1
    let run = 1
    for (let i = 1; i < list.length; i++) {
        run = ITEMS[list[i]].kind === ITEMS[list[i - 1]].kind ? run + 1 : 1
        longest = Math.max(longest, run)
    }
    return longest
}

export function shuffleItems(phase: PhaseDef, first: boolean): ItemId[] {
    let best = [...phase.items]
    for (let tries = 0; tries < 60; tries++) {
        const list = Phaser.Utils.Array.Shuffle([...phase.items])
        if (first && ITEMS[list[0]].kind !== 'part') continue
        best = list
        if (runOf(list) <= 2) return list
    }
    return best
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.phases.length < 1 || level.phases.length > 5) problems.push(`${tag}: ${level.phases.length} fases`)
        const all = level.phases.flatMap(phase => phase.items)
        if (new Set(all).size !== all.length) problems.push(`${tag}: item repetido no nível`)
        level.order.forEach(id => {
            if (!all.includes(id)) problems.push(`${tag}: a cena de ordem usa ${id}, que não aparece`)
        })
        if (ITEMS[level.order[0]].kind !== 'program' || ITEMS[level.order[1]].kind !== 'part') {
            problems.push(`${tag}: a cena de ordem é programa → peça`)
        }
        level.phases.forEach(phase => {
            const where = `${tag}/${phase.id}`
            if (phase.items.length !== 4) problems.push(`${where}: ${phase.items.length} itens`)
            const parts = phase.items.filter(id => ITEMS[id].kind === 'part').length
            if (parts !== 2) problems.push(`${where}: ${parts} peças (são 2 + 2)`)
            phase.items.forEach(id => {
                if (level.level === 1 && ITEMS[id].tricky) problems.push(`${where}: ${id} é capcioso (fica no N2)`)
                if (TRAINING.includes(id)) problems.push(`${where}: ${id} é do treino`)
                if (ITEMS[id].name.length > NAME_MAX) problems.push(`${where}: nome de ${id} não cabe`)
            })
        })
        if (level.level === 1 && !level.wait) problems.push(`${tag}: no N1 o item espera na agulha`)
    })
    if (ITEMS[TRAINING[0]].kind !== 'part' || ITEMS[TRAINING[1]].kind !== 'program') {
        problems.push('treino: o 1º é peça e o 2º é programa')
    }
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[trem-peca-e-programa]', PROBLEMS)
