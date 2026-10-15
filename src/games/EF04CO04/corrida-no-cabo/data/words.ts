const NAME: Record<string, { name: string; art: 'a' | 'o' }> = {
    estrela: { name: 'estrela', art: 'a' },
    coracao: { name: 'coração', art: 'o' },
    sol: { name: 'sol', art: 'o' },
    foguete: { name: 'foguete', art: 'o' },
}

const the = (id: string) => (NAME[id] ? `${NAME[id].art} ${NAME[id].name}` : `a letra ${id}`)
const of = (id: string) => `${NAME[id]?.art === 'a' ? 'da' : 'do'} ${NAME[id]?.name ?? id}`
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const ORDER = 'Mande'
export const TABLE_TITLE = 'Combinado'

export const TEACH = {
    cable: 'O fio liga os computadores.',
    stuck: (id: string) => `${cap(the(id))} não passa no fio.`,
    code: (id: string) => `Só passa o código ${of(id)}: 1 e 0.`,
    car: 'O carrinho leva o código pelo fio.',
    gate: 'Em cada portal, toque 1 ou 0.',
    read: 'O outro computador leu o código!',
    yourTurn: 'Sua vez! Teclado: 1 e 0.',
    word: (word: string) => `Agora, uma palavra: ${word}!`,
    letterCode: 'Cada letra tem seu código.',
    ascii: 'Agora, o código de verdade!',
    everyone: 'Todo computador usa este código.',
}

export const WAIT = '1 ou 0?'

export const HELP = {
    code: 'Siga o código, número por número.',
    gates: 'Toque 1 ou 0 em cada portal.',
}

export const SAY = {
    unknown: (code: string) => `${code} não está no combinado. O computador não entende!`,
    flipped: (want: string, got: string) => `Um número trocado, e ${the(want)} virou ${NAME[got] ? NAME[got].name : the(got)}!`,
    other: (want: string, got: string, code: string) => `Chegou ${the(got)}! ${cap(the(want))} é ${code}.`,
}
