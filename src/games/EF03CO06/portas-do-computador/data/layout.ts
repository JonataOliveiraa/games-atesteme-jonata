import type { DeviceId } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    computer: 2,
    cable: 3,
    chip: 4,
    door: 6,
    goal: 7,
    info: 10,
    fx: 12,
    banner: 30,
    veil: 18,
    kid: 20,
    balloon: 40,
    finale: 60,
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

/** o computador (gabinete): o PNG cabe nesta caixa, centrado embaixo */
export const COMPUTER = { x: 640, bottom: 692, w: 400, h: 560 } as const

/** a janela de vidro do gabinete, com a placa e o processador por dentro */
export const WINDOW = { x: 640, y: 420, w: 300, h: 290 } as const
export const CHIP = { x: 640, y: 420, size: 100, labelY: 334 } as const

/** os lugares do objetivo, na faixa de luzes do alto do gabinete */
export const GOAL = { y: 172, gap: 54, r: 22, icon: 40 } as const

/** os aparelhos ficam do lado de fora, ligados por um fio na porta do gabinete */
export const DOOR = { w: 150, h: 150, size: 92, plateDY: 52, plateH: 30, socketW: 18, socketH: 34 } as const
export const DOOR_AT: Record<DeviceId, { x: number; y: number }> = {
    mic: { x: 290, y: 272 },
    camera: { x: 290, y: 432 },
    keyboard: { x: 290, y: 592 },
    speaker: { x: 990, y: 272 },
    screen: { x: 990, y: 432 },
    printer: { x: 990, y: 592 },
}

/** a calçada: a informação entra pela esquerda e para aqui */
export const PORCH = { x: 110, feet: 640, startX: -120, plateDY: 26 } as const
export const INFO_H = 150
export const WALK_MS = 1500

export const KID = { x: 270, feet: 716, h: 470, outX: -260 } as const
export const ASK = { x: 700, y: 286, w: 440, pad: 22, buttonH: 52 } as const

export const SHOT = {
    wide: { x: W / 2, y: H / 2, zoom: 1 },
    kid: { x: 500, y: 410, zoom: 1.32 },
    zoom: 1.6,
    ms: 520,
} as const

export const BANNER = { x: 640, y: 360, w: 900, h: 130 } as const
export const FIN = { x: 640, y: 380, w: 900, h: 520, rowY0: -110, rowGap: 108, iconSize: 80 } as const
