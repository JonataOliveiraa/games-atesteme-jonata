/**
 * Paleta do Chef dos Subproblemas.
 *
 * As seis primeiras cores são a paleta entregue. As derivadas existem só
 * para contraste de texto, borda e estado de erro — a identidade continua
 * sendo tinta escura + dourado + creme.
 */
export const C = {
    // paleta base
    ink: 0x050504,
    gold: 0xf0bc59,
    cream: 0xf7f6f2,
    lavender: 0x9b8aab,
    green: 0x6d7b55,
    greenLight: 0xabb97f,

    // derivadas
    inkSoft: 0x2a2620,
    inkMid: 0x4f463d,
    goldDark: 0xc4903a,
    goldSoft: 0xfde9c4,
    creamEdge: 0xe3ded1,
    lavenderDark: 0x6f6180,
    greenDark: 0x4c5840,
    greenSoft: 0xdfe8c8,
    red: 0xd94b4b,
    redSoft: 0xf9d9d9,
    shadow: 0x000000,
    white: 0xffffff,
} as const

export const A = {
    veil: 0.30,
    shadow: 0.20,
    gloss: 0.24,
    idle: 0.42,
    board: 0.30,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
} as const

/** Corpo de texto legível para 3º ano. Nada abaixo de 17px na tela de jogo. */
export const SIZE = {
    hudLevel: '20px',
    hudMission: '26px',
    cardTitle: '27px',
    cardText: '21px',
    plateLabel: '25px',
    plateLabelSmall: '21px',
    plateCount: '21px',
    slotNumber: '42px',
    slotHelper: '18px',
    chipLabel: '18px',
    button: '25px',
    bubble: '21px',
    boardTitle: '24px',
    boardHelper: '18px',
    dialog: '27px',
} as const

/**
 * Velocidade da máquina de escrever, em ms por caractere.
 *
 * `slow` é para a fala em foco, que a criança acompanha lendo — 20ms passava
 * rápido demais para quem ainda soletra. `quick` é para comentário de canto,
 * que só dá um retorno e não exige leitura atenta.
 */
export const TYPE_MS = {
    /** Fala com botão "Próximo": a criança segura o tempo que quiser. */
    dialog: 12,
    /**
     * Comentário de canto. Precisa ser MAIS lento que o diálogo, não mais
     * rápido: aqui não há botão segurando a leitura, e a próxima ação apaga
     * o balão. Com 4ms o texto aparecia inteiro e sumia sem ser lido.
     */
    aside: 16,
} as const

export type ChefFrameKey = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'

/** Documenta a intenção de cada pose — evita usar "assustada" para acerto. */
export const CHEF_MOOD: Record<ChefFrameKey, string> = {
    c1: 'neutro',
    c2: 'neutro 2',
    c3: 'dúvida / ensinando',
    c4: 'ok / encaixe certo',
    c5: 'feliz / fase resolvida',
    c6: 'provando comida / simulação',
    c7: 'assustada / erro',
    c8: 'perfeito / fim de nível',
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/**
 * Ícone garantido. Se um `iconKey` do conteúdo não tiver textura carregada,
 * cai no prato em vez de desenhar o quadrado verde de textura faltante.
 * Rede de segurança para quando o conteúdo referencia um asset antes de ele
 * existir — foi o que aconteceu com `icon-cesto` até a arte chegar.
 */
export const ICON_FALLBACK = 'icon-prato'
