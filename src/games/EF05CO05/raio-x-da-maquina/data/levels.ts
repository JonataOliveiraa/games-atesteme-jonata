import { part } from './parts'
import type { Category, LevelDef, PartDef, Verdict } from '../types'

/** A pergunta do nível 3: ela nunca cita nome nem função. */
export const MUTE_QUESTION = 'Qual peça acabou de fazer isso?'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        mode: 'nome',
        machines: [
            {
                id: 'm1',
                bays: ['tela', 'chip', 'disco', 'cabo'],
                requests: [
                    {
                        id: 'm1-r1',
                        asks: 'processador',
                        text: 'Preciso do PROCESSADOR. É ele que faz as contas. Toque nele.',
                    },
                    {
                        id: 'm1-r2',
                        asks: 'armazenamento',
                        text: 'Agora o DISCO RÍGIDO. É ele que guarda para depois. Toque nele.',
                    },
                    {
                        id: 'm1-r3',
                        asks: 'saida',
                        text: 'Agora o MONITOR. É nele que o desenho aparece. Toque nele.',
                    },
                ],
            },
            {
                id: 'm2',
                bays: ['pente', 'fonte', 'teclado', 'altofalante'],
                requests: [
                    {
                        id: 'm2-r1',
                        asks: 'entrada',
                        text: 'Preciso do TECLADO. É por ele que as palavras entram. Toque nele.',
                    },
                    {
                        id: 'm2-r2',
                        asks: 'saida',
                        text: 'Agora o ALTO-FALANTE. É por ele que o som sai. Toque nele.',
                    },
                    {
                        id: 'm2-r3',
                        asks: 'memoria',
                        text: 'Agora a MEMÓRIA RAM. Ela segura o que estou usando agora. Toque nela.',
                    },
                ],
            },
            {
                id: 'm3',
                bays: ['camera', 'pente', 'pendrive', 'cooler'],
                requests: [
                    {
                        id: 'm3-r1',
                        asks: 'entrada',
                        text: 'Preciso da CÂMERA. É por ela que a foto entra em mim. Toque nela.',
                    },
                    {
                        id: 'm3-r2',
                        asks: 'memoria',
                        text: 'De novo a MEMÓRIA RAM: ela segura a foto enquanto eu trabalho. Toque nela.',
                    },
                    {
                        id: 'm3-r3',
                        asks: 'armazenamento',
                        text: 'Agora o PENDRIVE. Ele guarda a foto para o ano que vem. Toque nele.',
                    },
                ],
            },
        ],
    },

    {
        level: 2,
        mode: 'funcao',
        machines: [
            {
                id: 'm4',
                bays: ['tela', 'chip', 'disco', 'cabo'],
                requests: [
                    { id: 'm4-r1', asks: 'processador', text: 'Preciso fazer a conta 7 + 8. Quem faz isso aqui dentro?' },
                    { id: 'm4-r2', asks: 'armazenamento', text: 'Preciso guardar este desenho para amanhã. Quem guarda?' },
                    { id: 'm4-r3', asks: 'saida', text: 'Preciso mostrar o desenho para a turma. Quem mostra?' },
                ],
            },
            {
                id: 'm5',
                bays: ['pente', 'fonte', 'teclado', 'altofalante'],
                requests: [
                    { id: 'm5-r1', asks: 'entrada', text: 'Alguém vai digitar uma palavra. Por onde ela entra em mim?' },
                    { id: 'm5-r2', asks: 'saida', text: 'Preciso tocar esta música para fora. Quem toca?' },
                    { id: 'm5-r3', asks: 'memoria', text: 'Preciso segurar o desenho só enquanto pintam. Quem segura?' },
                ],
            },
            {
                id: 'm6',
                bays: ['camera', 'pente', 'pendrive', 'cooler'],
                requests: [
                    { id: 'm6-r1', asks: 'entrada', text: 'Vão tirar uma foto. Por onde ela entra em mim?' },
                    { id: 'm6-r2', asks: 'memoria', text: 'Vão ajustar as cores. Quem segura a foto enquanto isso?' },
                    { id: 'm6-r3', asks: 'armazenamento', text: 'Agora guarde a foto para o ano que vem. Quem guarda?' },
                ],
            },
        ],
    },

    {
        level: 3,
        mode: 'mudo',
        machines: [
            {
                id: 'm7',
                bays: ['teclado', 'chip', 'tela', 'cooler'],
                requests: [
                    { id: 'm7-r1', asks: 'entrada', text: MUTE_QUESTION },
                    { id: 'm7-r2', asks: 'processador', text: MUTE_QUESTION },
                    { id: 'm7-r3', asks: 'saida', text: MUTE_QUESTION },
                ],
            },
            {
                id: 'm8',
                bays: ['camera', 'pente', 'disco', 'cabo'],
                requests: [
                    { id: 'm8-r1', asks: 'entrada', text: MUTE_QUESTION },
                    { id: 'm8-r2', asks: 'memoria', text: MUTE_QUESTION },
                    { id: 'm8-r3', asks: 'armazenamento', text: MUTE_QUESTION },
                ],
            },
            {
                id: 'm9',
                bays: ['altofalante', 'pendrive', 'pente', 'fonte'],
                requests: [
                    { id: 'm9-r1', asks: 'saida', text: MUTE_QUESTION },
                    { id: 'm9-r2', asks: 'armazenamento', text: MUTE_QUESTION },
                    { id: 'm9-r3', asks: 'memoria', text: MUTE_QUESTION },
                ],
            },
        ],
    },
]

export function pointsFor(machines: number, clean: boolean): number {
    const full = 30 / machines
    return clean ? full : full / 2
}

export function verdict(chosen: PartDef, asks: Category): Verdict {
    if (chosen.category === asks) return { kind: 'right' }
    return {
        kind: 'wrong',
        reason: chosen.category === 'nenhuma' ? 'intruder' : 'other',
        hint: chosen.hint,
    }
}

export function answerIndex(bays: string[], asks: Category): number {
    return bays.findIndex(id => part(id).category === asks)
}

export function validateLevels(levels: LevelDef[], hasTrial: (partId: string) => boolean): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        if (level.machines.length > 5) {
            problems.push(`nível ${level.level}: mais de 5 fases`)
        }

        level.machines.forEach(machine => {
            if (machine.bays.length !== 4) {
                problems.push(`${machine.id}: são 4 baias, e esta tem ${machine.bays.length}`)
            }

            const parts = machine.bays.map(part)

            if (!parts.some(p => p.category === 'nenhuma')) {
                problems.push(`${machine.id}: sem intruso, o último pedido sai por eliminação`)
            }

            machine.requests.forEach(request => {
                const hits = parts.filter(p => p.category === request.asks)
                if (hits.length !== 1) {
                    problems.push(`${request.id}: ${hits.length} baias respondem "${request.asks}", e tem de ser 1`)
                }
                if (level.mode === 'mudo' && hits.length === 1 && !hasTrial(hits[0].id)) {
                    problems.push(`${request.id}: no nível mudo a resposta precisa ter desafio (${hits[0].id} não tem)`)
                }
            })

            const asked = new Set(machine.requests.map(r => r.asks))
            if (asked.size !== machine.requests.length) {
                problems.push(`${machine.id}: dois pedidos cobram a mesma função`)
            }
        })
    })

    return problems
}
