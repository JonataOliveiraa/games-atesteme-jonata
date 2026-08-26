/**
 * Paleta do Investigação: Dados em Risco.
 *
 * Sala de investigação: parede fria, papel creme, e três cores com um
 * significado só cada uma. Nenhum literal de cor fora daqui.
 */
export const C = {
    // ── sala ───────────────────────────────────────────────────────────
    ink: 0x1b2333,
    inkSoft: 0x24304a,
    inkMid: 0x38486a,
    wood: 0x8a5628,

    /** Interface: HUD, pastilha tocável, botão. */
    probe: 0x4f8ef7,
    probeSoft: 0xdbe9fd,
    probeDark: 0x1d4ed8,

    /** DADO EXPOSTO. Só isso. */
    risk: 0xf59e0b,
    riskSoft: 0xfdecd0,
    riskDark: 0xb4740a,

    /** SEGURO / acerto. Só isso. */
    safe: 0x22c55e,
    safeSoft: 0xd8f3df,

    /** Quem passou a saber. Cinza neutro, e é de propósito (ver §2.1). */
    unknown: 0x8ea3bd,

    // ── superfícies ────────────────────────────────────────────────────
    paper: 0xfff6e8,
    paperEdge: 0xe8dcc6,
    cream: 0xfff9f0,
    slate: 0x3b3b3b,
    muted: 0x7b6b5a,
    white: 0xffffff,
    shadow: 0x000000,
} as const

/**
 * ── §2.1 — NÃO EXISTE VERMELHO NESTE JOGO ───────────────────────────────
 *
 * O assunto já é delicado: uma criança de 8 anos descobrindo que o que ela
 * posta pode ser visto por gente que ela não conhece. Vermelho, sirene e
 * silhueta encapuzada transformariam a aula em susto, e medo não ensina — ele
 * só faz a criança parar de contar as coisas para os adultos.
 *
 * Por isso o dado exposto é ÂMBAR ("olha isso"), o desconhecido é CINZA NEUTRO,
 * e o que sobe na tela não é ameaça: é quantidade. A lição é "muita gente que
 * você não conhece passou a saber", não "alguém vem te pegar".
 */

export const A = {
    veil: 0.42,
    shadow: 0.24,
    gloss: 0.22,
    dim: 0.5,
    off: 0.45,
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

/** Nada abaixo de 17px na área jogável — 3º ano, com Scale.FIT. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '25px',
    hudHint: '18px',

    question: '26px',
    questionLong: '23px',

    from: '19px',
    msg: '24px',
    msgSmall: '21px',

    impact: '22px',
    watchLabel: '17px',

    optFrom: '18px',
    optMsg: '21px',

    button: '23px',
    toast: '21px',
    help: '30px',
} as const

export const TYPE_MS = { question: 16 } as const

/** Acima disso a pergunta encolhe. */
export const LONG_QUESTION = 56

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
