import { C } from './theme'
import { PARTS } from './parts'
import type {
    BootResult,
    BootStage,
    BootStep,
    BuildChallenge,
    Category,
    PartId,
    View,
} from '../types'

interface StageDef {
    stage: BootStage
    view: View
    /** Categorias verificadas nesta etapa. */
    cats: Category[]
    /** Basta uma peça da categoria, em vez de todas. */
    anyOf: boolean
    caption: string
    color: number
    /** Mostrada quando a etapa falha. */
    failure: string
}

const STAGES: StageDef[] = [
    {
        stage: 'estrutura', view: 'oficina', cats: ['estrutura'], anyOf: false,
        caption: 'Tudo no lugar', color: C.cinza,
        failure: 'As peças não têm onde se encaixar.',
    },
    {
        stage: 'energia', view: 'oficina', cats: ['energia'], anyOf: false,
        caption: 'Chegou energia', color: C.amarelo,
        failure: 'Nada acendeu. Sem energia, nenhuma peça funciona.',
    },
    {
        stage: 'entrada', view: 'mesa', cats: ['entrada'], anyOf: true,
        caption: 'Você digitou', color: C.azul,
        failure: 'Ligado e parado. Ninguém consegue mandar nada para ele.',
    },
    {
        stage: 'processamento', view: 'oficina', cats: ['processamento'], anyOf: false,
        caption: 'Ele calculou', color: C.laranja,
        failure: 'Acendeu, mas não faz nada. Falta quem processe.',
    },
    {
        stage: 'memoria', view: 'oficina', cats: ['memoria'], anyOf: false,
        caption: 'Guardou o que está usando agora', color: C.roxo,
        failure: 'Travou. O processador não tem onde pôr o que está usando agora.',
    },
    {
        stage: 'armazenamento', view: 'oficina', cats: ['armazenamento'], anyOf: false,
        caption: 'Salvou para sempre', color: C.verde,
        failure: 'Funcionou! Mas ao desligar tudo some. Falta onde guardar.',
    },
    {
        stage: 'saida', view: 'mesa', cats: ['saida'], anyOf: true,
        caption: 'E mostrou para você', color: C.ciano,
        failure: 'Está funcionando... mas você não tem como ver.',
    },
]

const byStage = (ids: PartId[], def: StageDef) =>
    ids.filter(id => def.cats.includes(PARTS[id].category))

export function simulateBoot(
    ch: BuildChallenge,
    installed: Set<PartId>,
): BootResult {
    const steps: BootStep[] = []

    if (ch.exactSet) {
        const extra = [...installed].find(id => !ch.required.includes(id))
        if (extra) {
            return {
                ok: false, steps, failedAt: 'estrutura', missing: null, extra,
                message: `${PARTS[extra].label} não era necessário para este computador.`,
            }
        }
    }

    for (const def of STAGES) {
        const wanted = byStage(ch.required, def)
        if (!wanted.length) continue

        const has = wanted.filter(id => installed.has(id))
        const enough = def.anyOf ? has.length > 0 : has.length === wanted.length

        if (!enough) {
            const missing = wanted.find(id => !installed.has(id)) ?? null
            return {
                ok: false, steps, failedAt: def.stage, missing, extra: null,
                message: def.failure,
            }
        }

        steps.push({
            stage: def.stage,
            view: def.view,
            parts: has,
            caption: def.caption,
            color: def.color,
        })
    }

    return {
        ok: true, steps, failedAt: 'ok', missing: null, extra: null,
        message: 'O computador ligou e respondeu.',
    }
}

/** Quanto do boot já é possível — usada para liberar o botão LIGAR. */
export function bootReady(ch: BuildChallenge, installed: Set<PartId>): boolean {
    return ch.required.every(id => installed.has(id))
}

/** Agrupamento usado no Mapa do Fluxo ao fim da fase. */
export const FLOW_ORDER: Category[] = [
    'entrada',
    'processamento',
    'memoria',
    'armazenamento',
    'saida',
]