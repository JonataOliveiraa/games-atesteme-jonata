import type { DoorId } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    world: 0,
    buttons: 8,
    balloon: 11,
    fx: 12,
    flying: 13,
    banner: 30,
    opening: 40,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

/** o corredor (coordenadas do mundo, antes do zoom) */
export const FLOOR = 470
export const DOOR = { h: 240, plateDy: 185, badgeDy: 54, badgeGap: 46, badge: 40, half: 86 } as const
export const DOOR_X: Record<DoorId, number> = { grandma: 186, class: 375, davi: 565, school: 755, stranger: 944 }
export const PERSON = { h: 194, dy: 4 } as const
/** a turma (três crianças) é larga: encolhe para caber no vão */
export const PERSON_SCALE: Partial<Record<DoorId, number>> = { class: 0.8 }

/** as portinhas lá longe, na parede que some no corredor: aonde vai o que é passado adiante */
export const FAR: Array<{ x: number; floor: number; h: number }> = [
    { x: 1089, floor: 451, h: 161 },
    { x: 1145, floor: 425, h: 120 },
    { x: 1187, floor: 405, h: 89 },
    { x: 1219, floor: 390, h: 65 },
    { x: 1243, floor: 380, h: 48 },
]
/** a parede do fundo vem em perspectiva: as portinhas ficam estreitas */
export const FAR_SQUEEZE = 0.55

export type Shot = { x: number; y: number; zoom: number }

export const SHOT = {
    /** o plano aberto corta o chão vazio e as bordas: as portas ficam no meio da tela */
    wide: { x: 640, y: 335, zoom: 1.12 },
    door: { dx: 140, y: 350, zoom: 1.8 },
    forward: { x: 1000, y: 385, zoom: 1.9 },
    ms: 650,
} as const

/** interface fixa na tela (fora do zoom) */
export const BUTTONS = {
    y: 652,
    w: 270,
    h: 100,
    icon: 64,
    two: { send: 470, keep: 810 },
    three: { send: 345, ask: 640, keep: 935 },
} as const
export const BALLOON = { w: 470, h: 236, gap: 30, icon: 92, y: 300 } as const

/** a abertura: a câmera entra na tela do tablet */
export const TABLET = { x: 807, y: 323, w: 300, h: 211 } as const

export const BANNER = { x: 640, y: 636, w: 1000, h: 124 } as const
