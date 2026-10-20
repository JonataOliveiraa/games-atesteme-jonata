export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    trash: 6,
    fish: 8,
    vila: 10,
    fisher: 14,
    tool: 18,
    line: 19,
    night: 22,
    sky: 24,
    rain: 26,
    surface: 27,
    zz: 28,
    sonar: 32,
    badge: 60,
    tap: 70,
    cards: 90,
    header: 100,
    hud: 106,
    caption: 130,
    banner: 140,
} as const

export const HEADER = { h: 90, dividers: [300, 1140] } as const

export const HUD = {
    y: 45,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 188,
    pipGap: 32,
    pipR: 11,
    helpX: 1214,
    helpY: 45,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 45,
    livesSize: 30,
} as const

export const GOAL = { x: 720, maxW: 790, disc: 29, icon: 50, gap: 14 } as const

export const BANK = { top: 452, edge: 450, foot: 535 } as const

export const WATER = { y: 470, left: 450, bed: 698 } as const

export const FISHER = {
    x: 405,
    y: 455,
    scale: 0.8,
    cellW: 256,
    cellH: 320,
    foot: 304 / 320,
    tip: { x: 244, y: 40 },
    hand: { x: 214, y: 132 },
    lift: { x: 128, y: 34 },
} as const

export const VILA = { x: 700, y: 408, scale: 0.48, foot: 180 / 192 } as const

export const ZONES = {
    small: { x: 505, y: 492, w: 180, h: 56 },
    school: { x: 640, y: 556, w: 300, h: 58 },
    big: { x: 790, y: 626, w: 270, h: 52 },
} as const

export const FISH_SIZE = { small: 0.58, big: 0.86, school: 0.9 } as const

export const SPEAR_SHORT = { x: 650, y: 520 } as const

export const HIT = { pad: 1.6, min: 58 } as const

export const WATER_HINT = { x: 760, y: 590 } as const

export const BADGE = { x: 18, y: 104, h: 76, portrait: 30, pad: 14 } as const

export const CARDS = { y: 400, w: 360, h: 168, gap: 26, titleY: 230 } as const

export const ASK = { x: 700, y: 300, w: 132, h: 112 } as const

export const CAPTION = { x: 760, y: 158 } as const

export const BANNER = { x: 640, y: 330, w: 980, h: 96 } as const

export const SONAR = { x: 770, y: 262, w: 320, h: 196, pad: 16 } as const

export const SKY = { left: 70, right: 1210, top: 128, low: 360, sunR: 34 } as const

export const TAP = { r: 30, stroke: 7, wave: 6, spread: 2.6 } as const

export const MARKET_BUBBLE = { x: 1130, y: 290, r: 96, ring: 8 } as const

export const SHOUT = { from: { x: 470, y: 330 }, rings: 4, gap: 150, short: 860 } as const

export const WIRE = { sag: 70, pulse: 9 } as const

export const TOOLBOX = { xs: [85, 220, 355], y: 600, w: 120, h: 150, icon: 76 } as const

export const PICKER = { y: 420, w: 330, h: 270, gap: 30, titleY: 200, art: 170 } as const

export const INVENT_SPOT = {
    robo: { from: { x: 1360, y: 462 }, stop: { x: 980, y: 462 } },
    bercario: { at: { x: 820, y: 470 } },
    drone: { from: { x: -120, y: 220 }, trees: [{ x: 120, y: 455 }, { x: 660, y: 410 }, { x: 1230, y: 410 }] },
} as const
