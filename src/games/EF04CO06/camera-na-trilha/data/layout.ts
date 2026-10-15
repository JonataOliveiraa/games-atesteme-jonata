export const W = 1280
export const H = 720

export const DEPTH = {
    ground: 0,
    water: 1,
    world: 10,
    dark: 26,
    frame: 30,
    controls: 100,
    header: 105,
    minimap: 108,
    order: 110,
    card: 120,
    hud: 130,
    banner: 140,
    mural: 200,
} as const

export const worldDepth = (y: number) => DEPTH.world + y / 4000

export const HEADER = { h: 112, dividers: [286, 994], hideAfter: 140, showAfter: 380, ease: 110 } as const

export const HUD = {
    levelX: 24,
    levelW: 120,
    levelH: 42,
    y: 56,
    pipsX: 174,
    pipGap: 32,
    pipR: 11,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1236,
    helpY: 56,
    helpR: 30,
    helpHit: 96,
} as const

export const ORDER = {
    x: 640,
    y: 56,
    w: 676,
    h: 96,
    pillDX: -268,
    pillW: 140,
    pillH: 70,
    iconDX: -145,
    iconSize: 76,
    textDX: -92,
    textW: 312,
    nameDY: -17,
    hintDY: 22,
    slotDX: 284,
    slotW: 100,
    slotH: 84,
} as const

export const MINIMAP = { x: 1098, y: 56, w: 180 } as const

export const JOY = { x: 150, y: 590, r: 70, knob: 70, base: 180, baseDY: 22, tilt: 0.55, grabMaxX: 440, grabMinY: 400 } as const

export const APP = { x: 1180, modeY: 476, modeW: 132, modeH: 122, iconDY: -26, labelDY: 20, shutterY: 612, shutterR: 60, hit: 132 } as const

export const BANNER = { x: 640, y: 650, w: 700, h: 92 } as const

export const FRAME = { w: 320, h: 240, aheadX: 230, aheadY: 220, lift: 50, inset: 24, zoom: 0.5 } as const

export const HERO = { speed: 300, height: 142, radius: 24 } as const

export const CAMERA = { follow: 140, lookAhead: 0.5, biasY: -16, closeZoom: 2, closeMs: 800 } as const

export const VIDEO = { ms: 3000, frames: 6, lostMs: 400 } as const

export const POLAROID = { w: 300, h: 286, photoX: 20, photoY: 24, photoW: 263, photoH: 199 } as const

export const FILM = { w: 384, h: 269, openX: 32, openY: 50, openW: 320, openH: 170 } as const

export const TOOLS = { x: 1050, size: 96, light: 640, zoom: 512 } as const

export const LIGHT = { aura: 105, auraOn: 150, beam: 0.72, sparkle: 70 } as const

export const MURAL = { x: 640, y: 365, w: 1120, h: 670, cols: [300, 640, 980], rows: [250, 482], photoW: 196, filmW: 270, captionDY: 118, bigPhotoW: 470, bigFilmW: 620, bigY: 300, buttonY: 650 } as const

