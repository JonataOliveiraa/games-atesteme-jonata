export const W = 1280
export const H = 720

export const DEPTH = {
    desk: 0,
    playBg: 8,
    play: 10,
    header: 38,
    panel: 40,
    order: 44,
    controls: 60,
    fx: 70,
    banner: 80,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 41,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 41,
    helpR: 32,
    helpHit: 80,
} as const

/** o cabeçalho de ponta a ponta: faixa 1 (0–82) nível, ordem e ?; faixa 2 (82–164) o combinado */
export const HEADER = { row: 82, height: 164, margin: 24 } as const

/** "Mande ⭐ = [ ][ ][ ][ ]" no meio do espaço livre da faixa 1, alinhado com os cartões da faixa 2 */
export const ORDER = { x: 740, y: 41, h: 66, slot: 56, slotSmall: 44, slotGap: 8, figure: 50, word: 108 } as const

/** o combinado na faixa 2: rótulo à esquerda e os cartões espalhados por igual no resto */
export const TABLE = { y: 123, labelX: 114, labelW: 180, cardW: 236, cardWide: 300, cardH: 62, gap: 18, figure: 46 } as const

/** o painel dos botões, à esquerda: 1 em cima, 0 embaixo, como as portas */
export const CONTROLS = { x: 92, one: 440, zero: 600, size: 124, hit: 140, panelY: 520, panelW: 158, panelH: 336 } as const

/**
 * A vista geral (a mesa): dois computadores de tamanho normal, cada um na sua mesa, e um fio fino
 * entre eles. As posições dos aparelhos são medidas na célula da arte (512 × 512); o pé da mesa (y 506) fica no chão.
 */
export const DESK = { floor: 690, scale: 0.775, laptopX: 270, computerX: 1010, cable: 7 } as const
export const DEVICE_CELL = { w: 512, h: 512, foot: 506 } as const
export const LAPTOP = { port: { x: 423, y: 349 }, screen: { x: 133, y: 138, w: 255, h: 142 } } as const
export const COMPUTER = { port: { x: 76, y: 210 }, screen: { x: 104, y: 100, w: 311, h: 181 } } as const

/** o mergulho no fio: o fio de 7 px vira o tubo de 190 px */
export const DIVE = { from: 0.3, inMs: 1300, outMs: 1150, fadeAt: 0.55, spark: 520 } as const

/** a corrida, dentro do fio: só o tubo, os portais e o carrinho */
/** o miolo claro do tubo vai de -62 a +62; as faixas 1 e 0 (±34) passam no meio das janelas do portal */
export const PLAY = { tube: 190, lane: 34, top: 330, bottom: 520, carX: 500, endX: 1060, lead: 700, before: 420, tail: 660, plug: 1.06 } as const

export const CAR = { size: 96, front: 46, back: 44 } as const

/**
 * reach: onde o carrinho freia se não houver escolha.
 * lock: a partir daqui a faixa não muda mais (tempo de chegar à porta).
 */
export const GATE = { reach: 150, lock: 90, clear: 40, glow: 66, digit: 142 } as const

/** medido no portal da arte (célula de 350): o meio entre as janelas e a distância entre elas */
export const GATE_ART = { left: 87, top: 16, width: 145, height: 314, centerX: 159, windowsMid: 175.5, windowGap: 91 } as const

export const DRIVE = { accel: 600, brake: 1200, flowStep: 36, flowMax: 4, laneRate: 11 } as const

/** a faixa do erro fica embaixo, entre os dois computadores */
export const BANNER = { x: 640, y: 668, w: 760, h: 84 } as const
