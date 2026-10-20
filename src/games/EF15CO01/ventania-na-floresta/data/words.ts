import type { Bird, Bug, Cor, Field, Home, Kind, Structure, Tone } from '../types'

export const OPENING = {
    hello: 'Oi! Eu cuido da floresta.',
    wind: 'Que ventania! Bagunçou tudo!',
    go: 'Vamos pôr tudo no lugar!',
} as const

export const TEACH = {
    line: 'Da maior para a menor!',
    row: 'A linha diz a flor.',
    col: 'A coluna diz a cor.',
    card: 'A ficha diz como é.',
    labels: 'Olhe o nome de cada linha.',
    web: 'O fio liga os dois.',
    homes: 'Cada coisa tem sua casa.',
    go: 'Sua vez!',
} as const

export const LABEL = {
    level: 'Nível',
    fila: 'FILA',
    grade: 'GRADE',
    ficha: 'FICHA',
    teia: 'TEIA',
} as const

export const HOME_LABEL: Record<Home, string> = {
    fila: 'FILA',
    grade: 'GRADE',
    ficha: 'FICHA',
    teia: 'TEIA',
    solto: 'SOLTO',
}

export const RULE: Record<Structure, string> = {
    fila: 'da maior para a menor',
    grade: 'linha da flor, coluna da cor',
    ficha: 'leia o nome de cada linha',
    teia: 'o fio liga os dois',
    redemoinho: 'Onde mora?',
}

export const PIECE_TEXT = {
    badge: '6',
    number: '7',
    word: 'OI',
} as const

const KIND_NAME: Record<Kind, string> = {
    margarida: 'margarida',
    tulipa: 'tulipa',
    estrela: 'flor estrela',
}

const TONE_NAME: Record<Tone, string> = {
    amarela: 'amarela',
    azul: 'azul',
    rosa: 'rosa',
}

const COR_FEM: Record<Cor, string> = { laranja: 'laranja', verde: 'verde', roxo: 'roxa' }
const COR_MASC: Record<Cor, string> = { laranja: 'laranja', verde: 'verde', roxo: 'roxo' }

const BUG_NAME: Record<Bug, { name: string; fem: boolean }> = {
    joaninha: { name: 'joaninha', fem: true },
    borboleta: { name: 'borboleta', fem: true },
    grilo: { name: 'grilo', fem: false },
    caracol: { name: 'caracol', fem: false },
}

const fieldWhy = (field: Field, nest: Bird) => {
    if (field === 'pena') return `Nessa ficha, a PENA é ${COR_FEM[nest.pena]}!`
    if (field === 'bico') return `Nessa ficha, o BICO é ${COR_MASC[nest.bico]}!`
    return nest.topete ? 'Nessa ficha, tem TOPETE!' : 'Nessa ficha, não tem TOPETE!'
}

const edgeWhy = (a: Bug, b: Bug) => {
    const from = BUG_NAME[a]
    const to = BUG_NAME[b]
    return `O fio liga ${from.fem ? 'a' : 'o'} ${from.name} ${to.fem ? 'à' : 'ao'} ${to.name}!`
}

const HOME_WHY: Record<Home, string> = {
    fila: 'Isso tem ordem: é uma FILA!',
    grade: 'Isso tem linha e coluna: é uma GRADE!',
    ficha: 'Cada valor tem um nome: é uma FICHA!',
    teia: 'Isso liga um ao outro: é uma TEIA!',
    solto: 'Isso está sozinho: é SOLTO!',
}

export const WHY = {
    line: 'Tem uma formiga maior!',
    row: (k: Kind) => `Aqui é lugar de ${KIND_NAME[k]}!`,
    col: (t: Tone) => `Aqui é lugar de flor ${TONE_NAME[t]}!`,
    field: fieldWhy,
    edge: edgeWhy,
    home: (h: Home) => HOME_WHY[h],
} as const
