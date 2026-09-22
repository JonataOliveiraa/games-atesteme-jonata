import type Phaser from 'phaser'

/** As grades vieram MEDIDAS das folhas entregues, não do `TEXTURAS.md`. */
export const SHEETS = {
    coisas: { key: 'coisas', frameWidth: 256, frameHeight: 256 },
    bichinhos: { key: 'bichinhos', frameWidth: 512, frameHeight: 512 },
    arquivista: { key: 'arquivista', frameWidth: 256, frameHeight: 256 },
} as const

export const IMAGES = { fundo: 'bg-arquivo' } as const

/** Quadros de `coisas.png`. */
export const COISA = {
    ursinho: 0,
    bola: 1,
    livro: 2,
    caixa: 3,
    planta: 4,
    chapeu: 5,
} as const

/** Quadros de `arquivista.png`. */
export const TUCA_F = {
    esperando: 0,
    apontando: 1,
    feliz: 2,
    curioso: 3,
    comemorando: 4,
    espiando: 5,
    acenando: 6,
    cochilando: 7,
} as const

/** Toda textura é opcional: sem ela o desenho de reserva assume. */
export function has(scene: Phaser.Scene, key: string): boolean {
    return scene.textures.exists(key)
}
