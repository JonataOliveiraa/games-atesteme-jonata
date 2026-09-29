export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    maquina: { frameWidth: 320, frameHeight: 320 },
    itens: { frameWidth: 256, frameHeight: 256 },
}

export const BG = 'bg-fliperama'
export const TRAY_TEX = 'bandeja'
export const MACHINE = 'maquina'
export const ITEMS = 'itens'

export const MACHINE_CELL = {
    clawOpen: 0,
    clawClosed: 1,
    clawStuck: 2,
    lock: 3,
    boxBack: 4,
    boxFront: 5,
    ribbon: 6,
    drop: 7,
} as const

export const ITEM_CELL = {
    cable: 12,
    guideHand: 13,
} as const
