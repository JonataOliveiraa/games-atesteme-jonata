import type { CritterDef } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS FOLHAS, MEDIDAS — não estimadas
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  `footPad` e `originX` saíram da varredura do canal alfa de cada célula
 *  (`bichinhos.png`, 4 × 2 de 400 × 500). Sem eles o bichinho desliza de lado
 *  e afunda no balcão a cada troca de quadro.
 *
 *  A ESCALA É UMA SÓ PARA A FAMÍLIA, e sai da célula — não da caixa alfa. Os
 *  com chapéu medem ~435 px de altura e os sem medem ~405: normalizar cada um
 *  pela própria altura encolheria justamente quem usa chapéu, e o chapéu é um
 *  termo do jogo.
 */
export const CRITTER_SHEET = {
    key: 'bichinhos',
    frameWidth: 400,
    frameHeight: 500,
    footPad: [6, 2, 6, 6, 4, 4, 10, 8],
    originX: [0.49, 0.5025, 0.4912, 0.5138, 0.5075, 0.5075, 0.4975, 0.4988],
} as const

/**
 * Onde cada atributo mora dentro da célula de 500 px de altura, contado a
 * partir da BASE da célula. É daqui que sai o realce que pulsa na conferência.
 */
export const CRITTER_ANCHOR = {
    hat: -368,
    glasses: -248,
    color: -112,
    /** O alto da cabeça: é a altura que a régua compara. */
    size: -400,
} as const

/** `atendente.png`, 4 × 1 de 400 × 600. Os quatro têm a mesma base. */
export const CLERK_SHEET = {
    key: 'atendente',
    frameWidth: 400,
    frameHeight: 600,
    footPad: 6,
} as const

/** Os quatro estados da atendente, na ordem da folha. */
export const CLERK = { calm: 0, point: 1, cheer: 2, think: 3 } as const

/**
 * Oito bichinhos com atributos FIXOS. Um bichinho que muda de atributo entre
 * cartazes destrói a comparação que a criança faz de cabeça quando ele
 * reaparece — e ele reaparece de propósito (o Pepe e a Mel voltam).
 *
 * O nível 1 usa cinco deles.
 */
export const CRITTERS: Record<string, CritterDef> = {
    bolota: { id: 'bolota', frame: 0, name: 'Bolota', color: 'blue', hat: true, glasses: false, big: true },
    tico: { id: 'tico', frame: 1, name: 'Tico', color: 'blue', hat: false, glasses: true, big: false },
    juju: { id: 'juju', frame: 2, name: 'Juju', color: 'green', hat: true, glasses: true, big: false },
    nina: { id: 'nina', frame: 3, name: 'Nina', color: 'green', hat: false, glasses: false, big: true },
    pepe: { id: 'pepe', frame: 4, name: 'Pepe', color: 'red', hat: false, glasses: true, big: true },
    tati: { id: 'tati', frame: 5, name: 'Tati', color: 'red', hat: true, glasses: false, big: false },
    mel: { id: 'mel', frame: 6, name: 'Mel', color: 'yellow', hat: true, glasses: true, big: true },
    rui: { id: 'rui', frame: 7, name: 'Rui', color: 'yellow', hat: false, glasses: false, big: false },
}

export const critterOf = (id: string): CritterDef => {
    const found = CRITTERS[id]
    if (!found) throw new Error(`[achados-e-perdidos] bichinho desconhecido: ${id}`)
    return found
}
