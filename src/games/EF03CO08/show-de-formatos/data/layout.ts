export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    spot: 6,
    host: 20,
    screen: 30,
    art: 32,
    band: 34,
    screenUi: 36,
    film: 44,
    tab: 50,
    card: 60,
    curtain: 90,
    fx: 200,
    hud: 500,
}

export const HUD = {
    h: 78,
    cy: 38,
    pillX: 20,
    pillY: 14,
    pillW: 216,
    pillH: 48,
    titleX: 706,
    titleW: 880,
    helpX: 1226,
    helpR: 27,
    helpHit: 116,
}

export const SCREEN = { cx: 620, cy: 264, w: 452, h: 352, pad: 16 }

export const CINEMA = { x: 640, y: 366, scale: 1.42 }

export const HOST = { cx: 160, feet: 512, h: 384 }

export const FILM = { cx: 1070, w: 184, h: 108, ys: [150, 268, 386] }

export const TAB = { cx: 620, cy: 483, w: 148, h: 62, gap: 14 }

export const CARD = {
    cy: 614,
    gap: 64,
    wide: { w: 430, h: 148 },
    tall: { w: 300, h: 180 },
}

export const PRESENT = { cx: 640, cy: 614, w: 380, h: 120 }

export const screenBox = () => ({
    x: SCREEN.cx - SCREEN.w / 2 + SCREEN.pad,
    y: SCREEN.cy - SCREEN.h / 2 + SCREEN.pad,
    w: SCREEN.w - SCREEN.pad * 2,
    h: SCREEN.h - SCREEN.pad * 2,
})
