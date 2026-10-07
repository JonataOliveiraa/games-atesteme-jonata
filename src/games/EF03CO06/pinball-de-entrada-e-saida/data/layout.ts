import type { DeviceId } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    cable: 1,
    table: 2,
    lights: 3,
    walls: 4,
    device: 6,
    processor: 7,
    flipper: 8,
    ball: 10,
    fx: 12,
    visor: 16,
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

/** a mesa é a caixa do computador; os aparelhos ficam do lado de fora */
export const TABLE = { left: 430, right: 850, top: 128, bottom: 716, cx: 640, wall: 20 } as const

/** o visor do pedido, em cima da mesa */
export const VISOR = { x: 640, y: 62, w: 540, h: 112, textW: 480 } as const

/** as colunas de fora: ENTRADA à esquerda, SAÍDA à direita */
export const SIDE = { inputX: 228, outputX: 1052, headerY: 150, headerW: 176, headerH: 42, size: 100, cardW: 170, cardH: 148, plateDY: 56 } as const

/** cada aparelho tem lugar fixo, fio próprio e porta própria na parede */
export const SLOT: Record<DeviceId, { y: number; port: number }> = {
    keyboard: { y: 258, port: 162 },
    mic: { y: 414, port: 198 },
    camera: { y: 570, port: 234 },
    speaker: { y: 258, port: 330 },
    screen: { y: 414, port: 425 },
    printer: { y: 570, port: 520 },
}

export const PORT = { h: 34, door: 66 } as const

export const FUNNEL = { y0: 270, y1: 302, inner: 50 } as const

export const PROCESSOR = { x: 640, y: 386, r: 46, size: 116, labelY: 450 } as const
export const POPS = [
    { x: 522, y: 486, r: 20 },
    { x: 758, y: 486, r: 20 },
] as const

export const FLIPPER = { leftX: 548, rightX: 732, y: 644, length: 84, thick: 18, rest: 28, up: -24 } as const
export const INLANE = { y0: 584 } as const

export const BALL = { r: 16, badge: 40, speedMax: 17, kick: 15 } as const

/** a Lily só entra no começo e no fim do nível */
export const KID = { x: 270, feet: 716, h: 470, outX: -260 } as const
export const ASK = { x: 700, y: 286, w: 440, pad: 22, buttonH: 52 } as const

/** enquadramentos da câmera */
export const SHOT = {
    wide: { x: W / 2, y: H / 2, zoom: 1 },
    kid: { x: 500, y: 410, zoom: 1.32 },
    visor: { x: 640, y: 200, zoom: 1.5 },
    zoom: 1.65,
    ms: 620,
} as const

export const FIN = { x: 640, y: 392, w: 1120, h: 590, rowY0: -150, rowGap: 104, iconSize: 64 } as const
