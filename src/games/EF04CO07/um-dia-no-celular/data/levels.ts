import type { AppId, LevelDef, TaskId } from '../types'
import {
    COINS,
    DEMO,
    DEMO2,
    DEMO3,
    DIARY,
    FUNNY,
    FWD_FACE,
    FWD_LIST,
    FWD_NUMBER,
    FWD_PHOTO,
    LIGHT,
    MAP,
    MURAL,
    PARTY,
    PASSWORD,
    POSTER,
    SHARE,
} from './words'

export const POINTS = 10
export const MAX_TASKS = 5

export const guideKey = (level: number) => `um-dia-no-celular-guide-${level}`

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Pedir e guardar',
        message: 'Você cuidou dos dados de todo mundo!',
        day: 'Terça-feira',
        apps: ['camera', 'chat', 'gallery', 'pet'],
        demo: { kind: 'photo', place: 'quarto', clock: '07:30', asker: 'vovo', order: DEMO.order },
        tasks: [
            { id: 'mural', verb: 'collect', place: 'sala', night: false, clock: '08:00', asker: 'prof', order: MURAL.order },
            { id: 'diary', verb: 'collect', place: 'patio', night: false, clock: '10:00', asker: 'duda', order: DIARY.order },
            { id: 'password', verb: 'keep', place: 'quarto', night: false, clock: '15:00', asker: 'caio', order: PASSWORD.order },
            { id: 'party', verb: 'collect', place: 'festa', night: false, clock: '16:30', asker: 'mae', order: PARTY.order },
            { id: 'funny', verb: 'keep', place: 'quarto', night: true, clock: '19:30', asker: 'nina', order: FUNNY.order },
        ],
    },
    {
        level: 2,
        title: 'Passar adiante',
        message: 'Você só passou adiante o que o dono deixou!',
        day: 'Quarta-feira',
        apps: ['camera', 'chat', 'gallery', 'pet'],
        demo: { kind: 'forward', place: 'quarto', clock: '07:30', asker: 'vovo', order: DEMO2.order },
        tasks: [
            { id: 'forwardPhoto', verb: 'transfer', place: 'sala', night: false, clock: '09:00', asker: 'prof', order: FWD_PHOTO.order },
            { id: 'forwardFace', verb: 'transfer', place: 'patio', night: false, clock: '10:30', asker: 'caio', order: FWD_FACE.order },
            { id: 'forwardNumber', verb: 'transfer', place: 'quarto', night: false, clock: '15:00', asker: 'caio', order: FWD_NUMBER.order },
            { id: 'forwardList', verb: 'transfer', place: 'quarto', night: true, clock: '19:00', asker: 'unknown', order: FWD_LIST.order },
        ],
    },
    {
        level: 3,
        title: 'Apps e autoria',
        message: 'Você usou os apps e as ideias dos outros com cuidado!',
        day: 'Quinta-feira',
        apps: ['camera', 'chat', 'gallery', 'pet', 'flashlight', 'map'],
        demo: { kind: 'permission', place: 'quarto', clock: '07:30', asker: 'mae', order: DEMO3.order },
        tasks: [
            { id: 'map', verb: 'use', place: 'patio', night: false, clock: '09:00', asker: 'prof', order: MAP.order },
            { id: 'poster', verb: 'use', place: 'sala', night: false, clock: '10:30', asker: 'prof', order: POSTER.order },
            { id: 'coins', verb: 'use', place: 'quarto', night: false, clock: '17:00', asker: 'pet', order: COINS.order },
            { id: 'flashlight', verb: 'use', place: 'quarto', night: true, clock: '20:00', asker: 'mae', order: LIGHT.order },
        ],
    },
]

const NEEDS: Partial<Record<TaskId, AppId[]>> = {
    diary: ['camera'],
    forwardFace: ['gallery'],
    forwardNumber: ['chat'],
    flashlight: ['flashlight'],
}

const SCRIPTED: TaskId[] = [
    'mural',
    'diary',
    'password',
    'party',
    'funny',
    'forwardPhoto',
    'forwardFace',
    'forwardNumber',
    'forwardList',
    'map',
    'poster',
    'coins',
    'flashlight',
]

const LIMIT = { order: 34, line: 36, chip: 34, button: 28 }

const LINES = [
    MURAL.yes,
    MURAL.oops,
    MURAL.happy,
    DIARY.duda,
    DIARY.agree,
    DIARY.thanks,
    DIARY.oops,
    PARTY.no,
    PARTY.thanks,
    PARTY.oopsFirst,
    PARTY.oopsAfter,
    FUNNY.oops,
    FWD_PHOTO.yes,
    FWD_PHOTO.oops,
    FWD_NUMBER.ask,
    FWD_NUMBER.thanks,
    MAP.found,
    MAP.lost,
    POSTER.caio,
    POSTER.thanks,
    POSTER.oops,
]

const CHIPS = [MURAL.ask, DIARY.refuse, PARTY.ask, PARTY.respect, PASSWORD.give, PASSWORD.keep]

const BUTTONS = [
    SHARE.send('escola'),
    SHARE.send('caio'),
    SHARE.send('unknown'),
    SHARE.ask('nina'),
    SHARE.ask('bia'),
    SHARE.ask('mae'),
    POSTER.credit,
    POSTER.mine,
    COINS.allow,
    COINS.deny,
]

export function validateLevels(levels: LevelDef[]) {
    const fail = (why: string) => {
        throw new Error(`[um-dia-no-celular] ${why}`)
    }
    levels.forEach(level => {
        if (level.tasks.length > MAX_TASKS) fail(`nível ${level.level} tem mais de ${MAX_TASKS} tarefas`)
        if (level.apps.length > 6) fail(`nível ${level.level} tem apps demais`)
        if (level.demo.order.length > LIMIT.order) fail(`pedido longo demais: "${level.demo.order}"`)
        const seen = new Set<TaskId>()
        level.tasks.forEach(task => {
            if (!SCRIPTED.includes(task.id)) fail(`tarefa sem roteiro: ${task.id}`)
            if (seen.has(task.id)) fail(`tarefa repetida no nível ${level.level}: ${task.id}`)
            seen.add(task.id)
            if (task.order.length > LIMIT.order) fail(`pedido longo demais: "${task.order}"`)
            if (!/^\d\d:\d\d$/.test(task.clock)) fail(`hora inválida: ${task.clock}`)
            ;(NEEDS[task.id] ?? []).forEach(app => {
                if (!level.apps.includes(app)) fail(`a tarefa ${task.id} precisa do app ${app} no nível ${level.level}`)
            })
        })
        const clocks = level.tasks.map(t => t.clock)
        if (clocks.some((c, i) => i > 0 && c <= clocks[i - 1])) fail(`as horas do nível ${level.level} não andam para a frente`)
    })
    LINES.forEach(line => {
        if (line.length > LIMIT.line) fail(`fala longa demais: "${line}"`)
    })
    CHIPS.forEach(chip => {
        if (chip.length > LIMIT.chip) fail(`sua fala longa demais: "${chip}"`)
    })
    BUTTONS.forEach(label => {
        if (label.length > LIMIT.button) fail(`botão longo demais: "${label}"`)
    })
}

validateLevels(LEVELS)
