import type Phaser from 'phaser'

export const SHEETS = {
    people: { key: 'pessoas', frameWidth: 256, frameHeight: 256 },
    /** A folha chegou 1200 × 800: 4 × 2 de 300 × 400. */
    postman: { key: 'carteiro', frameWidth: 300, frameHeight: 400 },
    flying: { key: 'jornal-voando', frameWidth: 256, frameHeight: 256 },
} as const

export const IMAGES = {
    kiosk: 'bg-banca',
} as const

/** Toda textura é opcional: sem ela o painter desenha o placeholder. */
export function has(scene: Phaser.Scene, key: string): boolean {
    return scene.textures.exists(key)
}
