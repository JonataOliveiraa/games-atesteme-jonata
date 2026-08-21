import type { FormatId } from '../types'

export const TEX = {
    bg: 'bg-oficina',
    markMes: 'marca-mes',
    markCor: 'marca-cor',
    markPalavra: 'marca-palavra',
    markIntrusa: 'marca-intrusa',
} as const

export const SEAL: Record<FormatId, string> = {
    date: 'selo-data',
    pixels: 'selo-pixels',
    text: 'selo-texto',
}

export const hasTex = (scene: Phaser.Scene, key: string): boolean =>
    scene.textures.exists(key)

export function fitImage(
    image: Phaser.GameObjects.Image,
    maxW: number,
    maxH: number,
): Phaser.GameObjects.Image {
    image.setScale(Math.min(maxW / image.width, maxH / image.height))
    return image
}
