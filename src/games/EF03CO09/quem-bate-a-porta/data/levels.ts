import type { Choice, LevelDef, Request } from '../types'
import { ASKERS, INFOS, labelOf } from './requests'

export const POINTS = 10
export const REQUESTS = 4
export const BALLOON_LINE = 28

export const guideKey = (level: number) => `__quemBateAPortaGuide-l${level}`
export const OPENING_KEY = '__quemBateAPortaOpening'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Minhas informações',
        message: 'Desenho e cor favorita a gente envia. Endereço e telefone, não.',
        goal: 'Cada porta é alguém da internet. Quem bate pede uma informação.',
        demo: [
            { asker: 'stranger', info: 'address' },
            { asker: 'school', info: 'drawing' },
        ],
        requests: [
            { asker: 'stranger', info: 'address', guided: true },
            { asker: 'school', info: 'drawing', guided: true },
            { asker: 'stranger', info: 'phone' },
            { asker: 'class', info: 'color' },
        ],
    },
    {
        level: 2,
        title: 'As informações do amigo',
        message: 'Informação do amigo é dele. Antes de enviar, pergunte!',
        goal: 'Algumas informações são do Davi. Antes de enviar, pergunte a ele!',
        demo: [{ asker: 'class', info: 'nickname', owner: 'davi' }],
        requests: [
            { asker: 'class', info: 'nickname', owner: 'davi', guided: true },
            { asker: 'class', info: 'friendPhoto', owner: 'davi', guided: true },
            { asker: 'stranger', info: 'phone', owner: 'davi' },
            { asker: 'school', info: 'drawing' },
        ],
    },
    {
        level: 3,
        title: 'Quem pede importa',
        message: 'A mesma foto vai para a vovó, mas não para um desconhecido.',
        goal: 'Agora preste atenção em QUEM pede. E lembre: o que a gente envia não volta.',
        demo: [],
        erase: 'trip',
        requests: [
            { asker: 'class', info: 'address' },
            { asker: 'grandma', info: 'trip' },
            { asker: 'stranger', info: 'trip' },
            { asker: 'class', info: 'drawing' },
        ],
    },
]

/**
 * A regra do jogo (PLANEJAMENTO §8):
 * - informação pessoal: ENVIAR só para a família;
 * - informação que não é pessoal: ENVIAR para quem a gente conhece.
 * Do Davi (N2), a resposta dele sai desta mesma regra: "Pode mandar!" é ENVIAR.
 */
export function ruleOf(r: Request): Choice {
    if (INFOS[r.info].personal) return ASKERS[r.asker].family ? 'send' : 'keep'
    return ASKERS[r.asker].known ? 'send' : 'keep'
}

export const answerOf = (r: Request): Choice => ruleOf(r)

/** o Davi deixa? */
export const ownerAllows = (r: Request) => ruleOf(r) === 'send'

export type Verdict = 'ok' | 'forwarded' | 'unasked' | 'refused' | 'missed'

/**
 * Com informação do Davi, enviar sem perguntar é erro (mesmo que ele fosse deixar),
 * e não enviar o que ele deixaria também é: era só perguntar.
 */
export function judge(r: Request, choice: Choice, asked: boolean): Verdict {
    const right = ruleOf(r)
    if (choice === 'send') {
        if (r.owner && !asked) return 'unasked'
        if (right === 'keep') return r.owner ? 'refused' : 'forwarded'
        return 'ok'
    }
    return right === 'send' ? 'missed' : 'ok'
}

/** o que foi enviado sem poder sai pela porta de quem recebeu e vai adiante */
export const spreads = (r: Request) => ASKERS[r.asker].spreads && INFOS[r.info].personal

/** combinações cinzentas, fora do jogo */
function gray(r: Request): string | null {
    if (!INFOS[r.info].personal && !ASKERS[r.asker].known) return 'não pessoal para desconhecido'
    return null
}

const balloonOf = (r: Request) => `${ASKERS[r.asker].verb} seu ${labelOf(r)}?`

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = (i: number) => `N${level.level}-${i + 1}`
        if (level.requests.length !== REQUESTS) problems.push(`N${level.level}: precisa de ${REQUESTS} pedidos`)
        const answers = level.requests.map(answerOf)
        if (!answers.includes('send') || !answers.includes('keep')) problems.push(`N${level.level}: precisa de ENVIAR e NÃO ENVIAR`)
        ;[...level.demo, ...level.requests].forEach((r, i) => {
            const fail = (msg: string) => problems.push(`${tag(i)}: ${msg}`)
            const why = gray(r)
            if (why) fail(`caso cinzento (${why})`)
            if (r.owner && level.level < 2) fail('informação de colega só a partir do N2')
            if (r.asker === 'grandma' && level.level < 3) fail('a vovó só bate no N3')
            if (balloonOf(r).length > BALLOON_LINE * 2) fail('o balão não cabe')
        })
        if (level.level === 2 && !level.requests.some(r => r.owner && ownerAllows(r))) problems.push('N2: o Davi precisa deixar pelo menos uma vez')
        if (level.level === 2 && !level.requests.some(r => r.owner && !ownerAllows(r))) problems.push('N2: o Davi precisa dizer NÃO pelo menos uma vez')
        answers.forEach((a, i) => {
            if (i >= 2 && a === answers[i - 1] && a === answers[i - 2]) problems.push(`${tag(i)}: a mesma resposta 3 vezes seguidas`)
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[quem-bate-a-porta] níveis inválidos', PROBLEMS)
