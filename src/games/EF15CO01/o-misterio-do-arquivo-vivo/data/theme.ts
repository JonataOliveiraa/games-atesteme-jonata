/**
 * O fundo entregue é CLARO — parede creme, rodapé verde-água, chão de madeira.
 * Então o contorno e o texto são escuros, e o destaque é o âmbar quente do
 * facho de luz que já está pintado lá.
 */
export const C = {
    tinta: 0x4a3526,
    madeira: 0xc08a52,
    madeiraEscura: 0x8a5a2b,
    creme: 0xfff6e8,
    papel: 0xf3e2c8,
    verdeAgua: 0x6aa39b,
    teal: 0x3e8c84,
    ambar: 0xf2a93b,
    coral: 0xe5705a,
    verde: 0x6bbf59,
    sombra: 0x3a2818,
} as const

export const CSS = {
    tinta: '#4a3526',
    creme: '#fff6e8',
    papel: '#f3e2c8',
    ambar: '#f2a93b',
    teal: '#3e8c84',
} as const

/**
 * AS TRÊS COLUNAS DA GRADE: cor **e** forma, nunca só cor.
 *
 * A fichinha tem o contorno nesta forma e nesta cor, e o cabeçalho da coluna
 * mostra a mesma forma vazia. Criança que não distingue cor casa pela forma.
 */
export const COLUNAS = [
    { id: 'azul', cor: 0x3f8fd0, forma: 'circulo' as const },
    { id: 'verde', cor: 0x62b054, forma: 'triangulo' as const },
    { id: 'vermelho', cor: 0xe06a63, forma: 'quadrado' as const },
]

/** As três linhas da grade, na ordem dos quadros de `bichinhos.png`. */
export const LINHAS = [
    { id: 'coelho', frame: 0 },
    { id: 'peixe', frame: 1 },
    { id: 'abelha', frame: 2 },
]
