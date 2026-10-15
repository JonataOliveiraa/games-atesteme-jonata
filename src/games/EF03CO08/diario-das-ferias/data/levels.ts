import type { LevelDef } from '../types'
import { BG_BEACH, BG_FARM, BG_NIGHT } from './files'
import { AIM, FOCUS } from './layout'
import { THINGS, cycleMs, hasHearOnly, hasSeeOnly, isActive, onlyHear, onlySee } from './things'
import { TEACH } from './words'

export const POINTS = 10
export const MAX_PAGES = 5
export const MAX_TARGETS = 4

export const guideKey = (level: number) => `__diarioDasFeriasGuide-l${level}`

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Praia de dia',
        message: 'A FOTO guarda o que a gente VÊ. O SOM guarda o que a gente OUVE.',
        goal: 'Vou guardar minhas férias no tablet pra mostrar pra turma!',
        bg: BG_BEACH,
        titles: ['Minhas férias na praia', 'Um dia muito legal!', 'Olha o que eu vi e ouvi!'],
        captions: false,
        moments: [
            { things: ['rainbow', 'bird'], pages: 2, guided: true },
            { things: ['crab', 'icecream'], pages: 1 },
            { things: ['dolphin', 'castle'], pages: 1, lesson: { thing: 'dolphin', text: TEACH.both } },
            { things: ['wave', 'music'], pages: 1 },
        ],
    },
    {
        level: 2,
        title: 'Sítio do vovô',
        message: 'Os bichos se escondem e aparecem: o jeito certo de guardar muda com a hora.',
        goal: 'No sítio do vovô, os bichos se escondem e aparecem!',
        bg: BG_FARM,
        titles: ['Férias no sítio do vovô', 'Os bichos do sítio', 'Olha o que eu vi e ouvi!'],
        captions: true,
        moments: [
            { things: ['frog', 'butterfly'], pages: 1, lesson: { thing: 'frog', text: TEACH.changes } },
            { things: ['rooster', 'cow'], pages: 1 },
            { things: ['dog', 'bees'], pages: 1 },
            { things: ['duck', 'tractor'], pages: 1 },
        ],
    },
    {
        level: 3,
        title: 'Acampamento à noite',
        message: 'No escuro, a FOTO só guarda o que tem luz. O resto a gente GRAVA.',
        goal: 'De noite, no acampamento, quase tudo fica no escuro!',
        bg: BG_NIGHT,
        titles: ['Uma noite no acampamento', 'Sons e luzes da noite', 'Minha aventura no escuro'],
        captions: true,
        moments: [
            { things: ['owl', 'moon'], pages: 1, lesson: { thing: 'owl', text: TEACH.dark } },
            { things: ['cricket', 'fireflies'], pages: 1 },
            { things: ['campfire', 'star'], pages: 1 },
            { things: ['pondFrog', 'lantern'], pages: 1 },
        ],
    },
]

export const pagesOf = (level: LevelDef) => level.moments.reduce((sum, m) => sum + m.pages, 0)

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    const diagonal = Math.hypot(FOCUS.w, FOCUS.h)
    levels.forEach(level => {
        const tag = (i: number) => `N${level.level}-${i + 1}`
        if (pagesOf(level) > MAX_PAGES) problems.push(`N${level.level}: mais de ${MAX_PAGES} páginas`)
        const ids = level.moments.flatMap(m => m.things)
        if (!ids.some(id => hasSeeOnly(THINGS[id]))) problems.push(`N${level.level}: falta um instante em que algo só se vê`)
        if (!ids.some(id => hasHearOnly(THINGS[id]))) problems.push(`N${level.level}: falta um instante em que algo só se ouve`)
        level.moments.forEach((m, i) => {
            const fail = (msg: string) => problems.push(`${tag(i)}: ${msg}`)
            if (m.things.length < 1 || m.things.length > 2) fail('precisa de 1 ou 2 coisas')
            if (m.things.length + 2 > MAX_TARGETS) fail(`mais de ${MAX_TARGETS} alvos`)
            if (m.pages < 1 || m.pages > m.things.length) fail('páginas fora do número de coisas')
            if (m.lesson && !m.things.includes(m.lesson.thing)) fail(`a estreia aponta para ${m.lesson.thing}, que não está no momento`)
            if (m.things.length === 2) {
                const [a, b] = m.things.map(id => THINGS[id])
                if (Math.hypot(a.x - b.x, a.y - b.y) <= diagonal) fail(`${a.id} e ${b.id} cabem no mesmo visor`)
            }
            if (m.guided) {
                const kinds = m.things.map(id => THINGS[id])
                if (kinds.filter(onlySee).length !== 1 || kinds.filter(onlyHear).length !== 1)
                    fail('o momento guiado precisa de um "só se vê" e um "só se ouve"')
            }
            m.things.forEach(id => {
                const def = THINGS[id]
                if (def.x < AIM.minX || def.x > AIM.maxX || def.y < AIM.minY || def.y > AIM.maxY) fail(`${id} fora do alcance da mira`)
                const active = def.cycle.filter(isActive)
                const share = active.reduce((s, b) => s + b.ms, 0) / cycleMs(def)
                if (share < 0.4) fail(`${id} ativo em menos de 40% do ciclo`)
                if (def.cycle.length > 1 && active.some(b => b.ms < 1200)) fail(`${id} com janela ativa menor que 1,2 s`)
                if (hasSeeOnly(def) && !def.noSound) fail(`${id} sem a frase do SOM errado`)
                if (hasHearOnly(def) && !def.noPhoto) fail(`${id} sem a frase da FOTO errada`)
                if (level.captions) {
                    if (def.cycle.some(b => b.see) && !def.captions?.photo) fail(`${id} sem legendas de FOTO`)
                    if (def.cycle.some(b => b.hear) && !def.captions?.sound) fail(`${id} sem legendas de SOM`)
                }
                if (def.id !== 'bird' && !def.look && def.cycle.some(b => b.see) && level.level > 1) fail(`${id} se vê mas não tem figura`)
            })
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[diario-das-ferias] níveis inválidos', PROBLEMS)
