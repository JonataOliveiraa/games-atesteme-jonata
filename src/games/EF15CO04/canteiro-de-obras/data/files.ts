/**
 * Quem manda no tamanho da célula é o ARQUIVO, não o TEXTURAS.md: as folhas
 * chegaram em 1600 × 1200 (4 × 3 de 400) e a Tuca em 2048 × 512 (4 × 1 de 512).
 */
export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    'pecas-praca': { frameWidth: 400, frameHeight: 400 },
    'pecas-festa': { frameWidth: 400, frameHeight: 400 },
    'pecas-horta': { frameWidth: 400, frameHeight: 400 },
    tuca: { frameWidth: 512, frameHeight: 512 },
}

export const BG = 'bg-canteiro'
export const TUCA_SHEET = 'tuca'

/** A ordem das células é contrato: 0 esperando, 1 explicando, 2 comemorando, 3 apontando. */
export const POSE = {
    calm: 0,
    talk: 1,
    cheer: 2,
    point: 3,
} as const

export type Pose = (typeof POSE)[keyof typeof POSE]
