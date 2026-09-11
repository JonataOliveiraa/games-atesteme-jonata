export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    board: 6,
    card: 20,
    cardFx: 26,
    trail: 40,
    ball: 44,
    copy: 50,
    band: 60,
    fx: 200,
    hud: 500,
}

export const HUD = {
    h: 92,
    cy: 46,
    avatarX: 56,
    avatarR: 30,
    ownerX: 96,
    ownerW: 84,
    ownerH: 34,
    dotX: 214,
    dotGap: 40,
    dotR: 13,
    orderX: 640,
    orderW: 640,
    livesX: 1058,
    helpX: 1226,
    helpR: 27,
    helpHit: 116,
}

export const CARD = { y: 112, w: 372, h: 340, xs: [420, 860] }

export const SLOT = {
    owner: { x: -CARD.w / 2 + 26, y: -CARD.h / 2 + 30 },
    icon: { x: -112, y: -26, size: 92 },
    message: { x: -50, y: -26, wrap: 200 },
    strip: { y: 64, h: 84, pad: 14 },
}

export const BAND = { cx: 640, cy: 556, w: 920, h: 88 }

export const BALL = { x: 640, y: 694 }

export const BIN = { x: 1118, y: 452 }

export const PUBLIC_EYE = { x: 1136, y: 516 }
