import type { DeviceId, LevelDef, Mission } from '../types'
import { DEVICES, INPUTS, OUTPUTS, VERBS } from './devices'

export const POINTS = 10
export const MISSIONS = 4
export const ASK_MAX = 44

export const guideKey = (level: number) => `__pinballEntradaSaidaGuide-l${level}`

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'A saída',
        message: 'A informação SAI por um aparelho de saída.',
        hello: 'Oi! Eu sou a Lily. Vou fazer pedidos ao computador. Me ajuda?',
        bye: 'Obrigada! Ouvi, vi e imprimi tudo!',
        inputs: ['keyboard'],
        outputs: OUTPUTS,
        descentMs: 2400,
        missions: [
            { ask: 'Quero OUVIR uma música!', pose: 'listen', input: 'keyboard', output: 'speaker', carries: 'letters', becomes: 'music', outputs: ['speaker', 'screen'] },
            { ask: 'Quero VER um desenho animado!', pose: 'look', input: 'keyboard', output: 'screen', carries: 'letters', becomes: 'cartoon', outputs: ['speaker', 'screen'] },
            { ask: 'Quero meu desenho no PAPEL!', pose: 'paper', input: 'keyboard', output: 'printer', carries: 'letters', becomes: 'drawing', debut: 'printer' },
            { ask: 'Quero ESCUTAR uma história!', pose: 'listen', input: 'keyboard', output: 'speaker', carries: 'letters', becomes: 'story' },
        ],
    },
    {
        level: 2,
        title: 'A entrada',
        message: 'A informação ENTRA por um aparelho de entrada.',
        hello: 'Agora eu vou CANTAR, ESCREVER e MOSTRAR coisas ao computador!',
        bye: 'O computador pegou tudo o que eu fiz!',
        inputs: INPUTS,
        outputs: ['screen'],
        descentMs: 900,
        missions: [
            { ask: 'Vou CANTAR uma música!', pose: 'sing', input: 'mic', output: 'screen', carries: 'voice', becomes: 'voice' },
            { ask: 'Vou ESCREVER meu nome!', pose: 'write', input: 'keyboard', output: 'screen', carries: 'letters', becomes: 'name' },
            { ask: 'Vou MOSTRAR meu desenho!', pose: 'show', input: 'camera', output: 'screen', carries: 'drawing', becomes: 'drawing' },
            { ask: 'Vou FALAR um recado!', pose: 'call', input: 'mic', output: 'screen', carries: 'voice', becomes: 'voice' },
        ],
    },
    {
        level: 3,
        title: 'O caminho todo',
        message: 'ENTRA por um aparelho, é PROCESSADA e SAI por outro.',
        hello: 'Agora é o caminho todo: da ENTRADA até a SAÍDA!',
        bye: 'Entrou, processou e saiu. Valeu!',
        inputs: INPUTS,
        outputs: OUTPUTS,
        descentMs: 1800,
        missions: [
            { ask: 'Vou CANTAR e quero OUVIR!', pose: 'sing', input: 'mic', output: 'speaker', carries: 'voice', becomes: 'music' },
            { ask: 'Vou MOSTRAR meu desenho e quero no PAPEL!', pose: 'show', input: 'camera', output: 'printer', carries: 'drawing', becomes: 'drawing' },
            { ask: 'Vou ESCREVER meu nome e quero VER!', pose: 'write', input: 'keyboard', output: 'screen', carries: 'letters', becomes: 'name' },
            { ask: 'Vou ESCREVER um convite e quero no PAPEL!', pose: 'write', input: 'keyboard', output: 'printer', carries: 'letters', becomes: 'invite' },
        ],
    },
]

export const outputsOf = (level: LevelDef, mission: Mission) => mission.outputs ?? level.outputs
export const choosesInput = (level: LevelDef) => level.inputs.length > 1
export const choosesOutput = (level: LevelDef, mission: Mission) => outputsOf(level, mission).length > 1

const says = (mission: Mission, device: DeviceId) => {
    const words = mission.ask.toUpperCase().split(/[^A-ZÀ-Ú]+/)
    return VERBS[device].some(v => words.includes(v))
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = (i: number) => `N${level.level}-${i + 1}`
        if (level.missions.length !== MISSIONS) problems.push(`N${level.level}: precisa de ${MISSIONS} missões`)
        const usedIn = new Set<DeviceId>()
        const usedOut = new Set<DeviceId>()
        const pairs = new Set<string>()
        level.missions.forEach((m, i) => {
            const fail = (msg: string) => problems.push(`${tag(i)}: ${msg}`)
            const outs = outputsOf(level, m)
            if (!level.inputs.includes(m.input)) fail('entrada fora da mesa')
            if (!outs.includes(m.output)) fail('saída fora da mesa')
            if (DEVICES[m.input].row !== 'input' || DEVICES[m.output].row !== 'output') fail('fileira trocada')
            if (choosesInput(level) && !says(m, m.input)) fail(`o pedido não diz a entrada (${VERBS[m.input].join('/')})`)
            if (choosesOutput(level, m) && !says(m, m.output)) fail(`o pedido não diz a saída (${VERBS[m.output].join('/')})`)
            ;[...INPUTS, ...OUTPUTS].forEach(d => {
                const asked = d === m.input || d === m.output
                if (!asked && says(m, d) && (level.inputs.includes(d) || outs.includes(d))) fail(`o pedido também aponta ${d}`)
            })
            if (m.ask.length > ASK_MAX) fail(`pedido longo: ${m.ask}`)
            if (m.debut && !outs.includes(m.debut)) fail('estreia de aparelho que não está na mesa')
            usedIn.add(m.input)
            usedOut.add(m.output)
            pairs.add(`${m.input}>${m.output}`)
            const answer = (x: Mission) => (choosesInput(level) ? x.input : '') + (choosesOutput(level, x) ? x.output : '')
            if (i >= 2 && answer(m) === answer(level.missions[i - 1]) && answer(m) === answer(level.missions[i - 2]))
                fail('a mesma resposta 3 vezes seguidas')
        })
        if (level.level === 1) {
            if (level.inputs.join() !== 'keyboard') problems.push('N1: entrada só o teclado')
            const first = level.missions.findIndex(m => outputsOf(level, m).includes('printer'))
            if (first !== 2) problems.push('N1: a impressora estreia na missão 3')
            if (!level.missions[first]?.debut) problems.push('N1: a impressora precisa do balão de estreia')
            OUTPUTS.forEach(d => !usedOut.has(d) && problems.push(`N1: falta a saída ${d}`))
        }
        if (level.level === 2) {
            if (level.outputs.join() !== 'screen') problems.push('N2: saída só a tela')
            INPUTS.forEach(d => !usedIn.has(d) && problems.push(`N2: falta a entrada ${d}`))
        }
        if (level.level === 3) {
            if (pairs.size !== MISSIONS) problems.push('N3: pares repetidos')
            INPUTS.forEach(d => !usedIn.has(d) && problems.push(`N3: falta a entrada ${d}`))
            OUTPUTS.forEach(d => !usedOut.has(d) && problems.push(`N3: falta a saída ${d}`))
        }
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[pinball-de-entrada-e-saida] níveis inválidos', PROBLEMS)
