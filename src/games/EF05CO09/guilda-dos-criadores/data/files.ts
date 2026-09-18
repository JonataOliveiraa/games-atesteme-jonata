import type Phaser from 'phaser'

/**
 * As grades vieram MEDIDAS das folhas, não do `TEXTURAS.md`: `artistas.png`
 * chegou 1200 × 1200, ou seja célula de 300, e não os 256 que o documento
 * pedia. Quem manda é o arquivo.
 */
export const SHEETS = {
    obras: { key: 'obras', frameWidth: 512, frameHeight: 352 },
    artistas: { key: 'artistas', frameWidth: 300, frameHeight: 300 },
    marcas: { key: 'carimbos-e-marcas', frameWidth: 256, frameHeight: 256 },
} as const

export const IMAGES = { salao: 'bg-salao' } as const

/** Toda textura é opcional: sem ela o painter desenha o reserva. */
export function has(scene: Phaser.Scene, key: string): boolean {
    return scene.textures.exists(key)
}
