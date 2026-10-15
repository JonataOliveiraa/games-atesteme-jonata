import type { Fig, Question, Why } from '../types'

interface Name {
    one: string
    many: string
    /** artigo: "a FLOR", "o CORAÇÃO" */
    art: 'a' | 'o'
}

export const NAME: Record<Fig, Name> = {
    flower: { one: 'FLOR', many: 'FLORES', art: 'a' },
    star: { one: 'ESTRELA', many: 'ESTRELAS', art: 'a' },
    heart: { one: 'CORAÇÃO', many: 'CORAÇÕES', art: 'o' },
}

const how = (fig: Fig) => (NAME[fig].art === 'a' ? 'Quantas' : 'Quantos')
const by = (fig: Fig) => (NAME[fig].art === 'a' ? 'pela' : 'pelo')
const word = (fig: Fig, n: number) => (n === 1 ? NAME[fig].one : NAME[fig].many).toLowerCase()

export const ASK = (q: Question) =>
    q.kind === 'count'
        ? `${how(q.fig)} ${NAME[q.fig].many} tem no rolo?`
        : `Saiu mais ${NAME[q.a].one} ou mais ${NAME[q.b].one}?`

export const TAG = { more: 'MAIS', same: 'IGUAL' }

/** a faixa do carimbo errado: o que vinha ali, e por quê */
export const WRONG_STAMP: Record<Why, (fig: Fig) => string> = {
    first: fig => `O pedido começa ${by(fig)} ${NAME[fig].one}!`,
    newTurn: fig => `Volta nova: começa ${by(fig)} ${NAME[fig].one}!`,
    innerAgain: () => 'O laço de dentro ainda não acabou.',
    afterInner: fig => `O de dentro acabou: agora ${NAME[fig].art} ${NAME[fig].one}.`,
    next: fig => `Agora vinha ${NAME[fig].art} ${NAME[fig].one}.`,
}

/** a faixa da resposta errada, depois da contagem no varal */
export function wrongAnswer(q: Question, counts: number[]) {
    if (q.kind === 'count') return `Saíram ${counts[0]} ${counts[0] === 1 ? NAME[q.fig].one : NAME[q.fig].many}.`
    const [a, b] = counts
    const verdict = a === b ? 'IGUAL!' : `mais ${NAME[a > b ? q.a : q.b].one}!`
    return `${a} ${word(q.a, a)} e ${b} ${word(q.b, b)}: ${verdict}`
}

export const TEACH = {
    start: 'Carimbe o que o pedido manda.',
    times: (n: number, fig: Fig) => `${n} vezes: ${n} ${word(fig, n)}.`,
    yourTurn: 'Sua vez!',
    block: 'O bloco todo repete.',
    nested: 'Um laço dentro do outro.',
    restart: 'O de dentro recomeça.',
}

export const HELP = {
    order: 'Carimbe o que o pedido manda.',
    tab: 'O número diz quantas vezes.',
    ask: 'O rolo está fechado. Responda pelo pedido!',
    block: 'O laço repete o bloco inteiro, na mesma ordem.',
    inner: 'O de dentro roda inteiro a cada volta.',
}
