import type { Entry, Kind } from '../types'

export const ORDER = 'Devolva os pixels'
export const ORDER_LETTERS = 'Devolva as letras'

/** balões de 2 a 5 palavras: quem explica é a animação de cada passo, e os controles aparecem só na demonstração */
export const TEACH = {
    pixels: 'Cada quadradinho é um pixel.',
    numbers: 'Cada pixel vira um número.',
    escaped: 'Fugiram! Devolva com o número.',
}

export const TEACH2 = {
    colors: 'Agora com cores!',
    lights: 'Cada cor são 3 luzes.',
    code: 'Amarelo é 110!',
    three: '3 números por cor.',
}

export const TEACH3 = {
    letters: 'Letras também viram números!',
    prefix: 'Todas começam com 0100.',
    smart: 'Cuidado: elas fogem!',
}

export const YOUR_TURN = 'Sua vez!'

export const HELP = {
    bit: 'Aceso é 1. Apagado é 0.',
    rgb: 'Ache a cor do fujão.',
    ascii: 'Ache a letra do fujão.',
} as const

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** 8 números se leem em duas metades: 0100 1111 */
const halves = (code: string) => (code.length === 8 ? `${code.slice(0, 4)} ${code.slice(4)}` : code)

export const SAY = {
    timeUp: 'O tempo acabou!',
    /** o código errado chegou, e o tablet mostrou outra coisa */
    wrong: (kind: Kind, want: Entry, got: Entry, code: string) => {
        if (kind === 'bit') return `Pixel ${want.name} é ${want.code}. Com ${code}, ele voltou ${got.name}!`
        if (kind === 'rgb') return `${cap(want.name)} é ${want.code}. Com ${code}, virou ${got.name}!`
        return `${want.id} é ${halves(want.code)}. Com ${halves(code)}, virou ${got.glyph === '?' ? 'um sinal estranho' : got.id}!`
    },
}
