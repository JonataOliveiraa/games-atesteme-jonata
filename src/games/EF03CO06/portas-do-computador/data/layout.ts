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
/** side = do centro até a borda do corpo, medida no PNG (530 × 742, corpo x 18–513) */
export const COMPUTER = { x: 640, bottom: 700, w: 430, h: 600, side: 200 } as const

/** a janela de vidro do gabinete, com a placa e o processador por dentro */
export const WINDOW = { x: 642, y: 387, w: 279, h: 291 } as const
export const CHIP = { x: 638, y: 379, size: 94, labelY: 300 } as const

/** os lugares do objetivo, na faixa de luzes do alto do gabinete */
export const GOAL = { y: 191, gap: 46, r: 15, icon: 30 } as const

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
export const PORCH = { x: 150, feet: 640, startX: -120, plateDY: 26 } as const
export const INFO_H = 150

/** quem recebe fica no jardim da direita, com o pedido num balão em cima */
export const PERSON = { x: 1172, feet: 664, h: 250, startX: 1420 } as const
export const WISH_BALLOON = { y: 330, w: 210, h: 132, icon: 64, tail: 22 } as const

/** dentro da janela: onde a informação espera antes de sair (à direita do processador) */
export const OUT_SPOT = { x: WINDOW.x + 96, edge: WINDOW.x + WINDOW.w / 2 - 20 } as const
export const WALK_MS = 1500


export const SHOT = {
    wide: { x: W / 2, y: H / 2, zoom: 1 },
    open: { x: 640, y: 400, zoom: 1.35 },
    zoom: 1.6,
    ms: 520,
} as const

export const BANNER = { x: 640, y: 360, w: 900, h: 130 } as const
export const FIN = { x: 640, y: 380, w: 900, h: 520, rowY0: -110, rowGap: 108, iconSize: 80 } as const
