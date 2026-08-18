/**
 * Paleta do Tribunal do Verdadeiro ou Falso.
 *
 * O jogo é uma sala de audiência: madeira escura, latão e papel creme. As
 * cores de veredicto (verde/vermelho) são as únicas saturadas da tela — é o
 * que faz a criança olhar para os botões antes de qualquer outra coisa.
 *
 * Regra: nenhum literal de cor fora deste arquivo. Se uma cena precisa de um
 * tom novo, ele nasce aqui com nome.
 */
export const C = {
    // ── madeira da sala ────────────────────────────────────────────────
    ink: 0x1a1008,
    wood: 0x2a1a0d,
    woodMid: 0x3b2718,
    woodLight: 0x53381f,

    // ── latão: bordas, filetes, texto de origem ────────────────────────
    brass: 0xffcc80,
    brassDim: 0xffe0b2,
    brassDark: 0xc98b3a,

    // ── papel ──────────────────────────────────────────────────────────
    cream: 0xfff3e0,
    panel: 0xfff6e8,
    panelEdge: 0xe8dcc6,

    // ── veredicto ──────────────────────────────────────────────────────
    green: 0x22c55e,
    greenDeep: 0x14532d,
    greenSoft: 0x86efac,
    red: 0xef4444,
    redDeep: 0x7f1d1d,
    redSoft: 0xfca5a5,

    // ── acento da plataforma (modais, tutorial, faixas) ────────────────
    amber: 0xf57c00,
    amberDeep: 0x9a3f00,
    gold: 0xffd700,
    navy: 0x25327a,

    // ── neutros ────────────────────────────────────────────────────────
    slate: 0x3b3b3b,
    muted: 0x8d6e63,
    overlay: 0x12324a,
    shadow: 0x000000,
    white: 0xffffff,
} as const

/**
 * Alfas nomeados. `veil` é o escurecimento de fundo dos modais; `shadow` é a
 * sombra projetada de qualquer superfície; `gloss` é a faixa de brilho no
 * topo dos cartões, que dá volume sem custar textura.
 */
export const A = {
    veil: 0.58,
    shadow: 0.26,
    gloss: 0.22,
    inset: 0.34,
    dim: 0.45,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
} as const

/**
 * Corpo de texto pensado para 3º ano lendo em tablet com Scale.FIT: tudo
 * encolhe junto, então o que garante legibilidade é o tamanho em coordenadas
 * de jogo. Nada abaixo de 17px na área jogável.
 */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '25px',
    hudHint: '18px',
    help: '30px',

    cardSource: '20px',
    cardText: '34px',
    cardTextLong: '30px',
    badge: '20px',

    answerLabel: '34px',
    answerCaption: '20px',

    explainTitle: '20px',
    explainLabel: '18px',
    explainValue: '23px',

    toast: '21px',
    stamp: '40px',
} as const

/**
 * Acima deste número de caracteres a sentença passa a usar `cardTextLong`.
 * O corte foi medido: com 34px, frases acima de ~58 caracteres quebram em
 * três linhas e o cartão invade a faixa dos botões.
 */
export const LONG_SENTENCE = 58

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** Velocidade da máquina de escrever, em ms por caractere. */
export const TYPE_MS = {
    /** Sentença julgada: a criança precisa ler cada palavra, inclusive o NÃO. */
    sentence: 18,
    /** Linha de explicação: já vem depois do veredicto, pode correr um pouco. */
    explain: 10,
} as const
