import type { Bird, Bug, Cap, Cor, Field, Fish, FishField, Glow, Group, Home, Hue, Kind, Structure, Tone } from '../types'

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
    look: 'Olhe como eles estão!',
    ask: 'Como eles estavam?',
    cap: 'A linha diz o chapéu.',
    duck: 'Do maior para o menor!',
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

export const MEET: Record<Home, string> = {
    fila: 'FILA: um atrás do outro.',
    grade: 'GRADE: linhas e colunas.',
    ficha: 'FICHA: cada valor tem nome.',
    teia: 'TEIA: fios ligando as coisas.',
    solto: 'SOLTO: uma coisa sozinha.',
}

export const RULE: Record<Structure, string> = {
    fila: 'da maior para a menor',
    grade: 'linha da flor, coluna da cor',
    ficha: 'leia o nome de cada linha',
    teia: 'o fio liga os dois',
    jeito: 'Olhe bem!',
}

export const ASK: Record<Group, string> = {
    patos: 'Como eles estavam?',
    cogumelos: 'Como eles estavam?',
    peixes: 'Como eles estavam?',
    vagalumes: 'Como eles estavam?',
    caracol: 'Como o 7 estava?',
}

export const JEITO_RULE: Record<Group, string> = {
    patos: 'do maior para o menor',
    cogumelos: 'linha do chapéu, coluna da cor',
    peixes: 'leia o nome de cada linha',
    vagalumes: 'o fio liga os dois',
    caracol: 'uma coisa sozinha',
}

export const PEBBLE_TEXT = '7'

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

const WAY_WHY: Record<Group, string> = {
    patos: 'Eles andam um atrás do outro: é FILA!',
    cogumelos: 'Tem linha e coluna: é GRADE!',
    peixes: 'Cada valor tem nome: é FICHA!',
    vagalumes: 'Os fios ligam um ao outro: é TEIA!',
    caracol: 'Um número sozinho: é SOLTO!',
}

const FISH_FIELD_NAME: Record<FishField, string> = { corpo: 'CORPO', rabo: 'RABO' }

export const WHY = {
    line: 'Tem uma formiga maior!',
    row: (k: Kind) => `Aqui é lugar de ${KIND_NAME[k]}!`,
    col: (t: Tone) => `Aqui é lugar de flor ${TONE_NAME[t]}!`,
    field: fieldWhy,
    edge: edgeWhy,
    way: (g: Group) => WAY_WHY[g],
    duck: 'Tem um patinho maior!',
    cap: (c: Cap) => `Aqui é lugar de chapéu ${c}!`,
    hue: (h: Hue) => `Aqui é lugar de cogumelo ${h}!`,
    fish: (f: FishField, home: Fish) => `Nessa ficha, o ${FISH_FIELD_NAME[f]} é ${COR_MASC[home[f]]}!`,
    glow: (a: Glow, b: Glow) => `O fio liga o ${a} ao ${b}!`,
} as const
