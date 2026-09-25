/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS TRÊS FOLHAS, MEDIDAS NO ARQUIVO ENTREGUE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O TEXTURAS.md pediu 1280 × 640 nas peças e 640 × 420 no mestre. O que chegou
 * tem outras medidas, e quem cede é o código — a grade continua certa:
 *
 *     bg-festa        1672 × 941  →  imagem única
 *     festa-pecas     1600 × 800  →  4 × 2 de 400 × 400
 *     mestre-npc      1000 × 750  →  2 × 1 de 500 × 750
 */
export const SHEET = {
    fair: 'ep-bg-festa',
    props: 'ep-festa-pecas',
    master: 'ep-mestre',
} as const

export const PROPS_SHEET = { frameWidth: 400, frameHeight: 400 }

export const MASTER_SHEET = { frameWidth: 500, frameHeight: 750 }

/**
 * Os quadros usados da folha de peças.
 *
 * `tapOn` e `rocket` são os dois que o código tinge/acende: o bulbo e o corpo do
 * foguete chegaram SEM COR justamente para isso.
 */
export const PROPS = {
    tapOff: 0,
    tapOn: 1,
    rocketReady: 2,
    rocketFlying: 3,
    buttonUp: 4,
    buttonDown: 5,
    sign: 6,
} as const

export const MASTER = { talking: 0, cheering: 1 } as const
