export const W = 1280
export const H = 720

export const HEADER = { h: 72, left: 306, right: 1190 }

export const HUD = {
    y: 36,
    levelX: 22,
    levelW: 118,
    levelH: 40,
    pipsX: 168,
    pipGap: 30,
    pipR: 10,
    helpX: 1236,
    helpY: 36,
    helpR: 24,
    helpHit: 84,
    livesX: 60,
    livesY: 120,
    livesSize: 26,
}

export const ORDER = { x: 640, y: 36, avatar: 50, gap: 14 }

export const WORLD = { w: 820 }

export const PERSON = { x: 250, feet: 712, h: 486, slide: 460 }

export const BALLOON = { x: 372, y: 90, w: 440, pad: 22, nameGap: 6, tailDx: 70 }

export const CHIPS = { right: 764, bottom: 700, w: 384, h: 82, gap: 14 }

export const REMOTE = { x: 330, y: 352, r: 166, nameY: 556 }

export const PHONE_ART = {
    w: 330,
    h: 537,
    body: { x: 55, y: 34, w: 223, h: 428 },
    screen: { x: 80, y: 65, w: 173, h: 367, r: 17 },
}

const PHONE_SCALE = 1.59
const BODY_MID = PHONE_ART.body.x + PHONE_ART.body.w / 2

export const PHONE = {
    cx: 1010,
    top: 76,
    scale: PHONE_SCALE,
    w: Math.round(PHONE_ART.body.w * PHONE_SCALE),
    h: Math.round(PHONE_ART.body.h * PHONE_SCALE),
    artX: Math.round(1010 - BODY_MID * PHONE_SCALE),
    artY: Math.round(76 - PHONE_ART.body.y * PHONE_SCALE),
}

export const SCREEN = {
    x: Math.round(PHONE.cx + (PHONE_ART.screen.x - BODY_MID) * PHONE_SCALE),
    y: Math.round(PHONE.top + (PHONE_ART.screen.y - PHONE_ART.body.y) * PHONE_SCALE),
    w: Math.round(PHONE_ART.screen.w * PHONE_SCALE),
    h: Math.round(PHONE_ART.screen.h * PHONE_SCALE),
    r: Math.round(PHONE_ART.screen.r * PHONE_SCALE),
}

export const STATUS = { h: 32 }

export const HOME = {
    clockY: 112,
    dateY: 160,
    grids: {
        small: { cols: [86, 189], rows: [290, 422], icon: 90, labelDy: 64, label: 19 },
        full: { cols: [46, 137, 228], rows: [272, 392], icon: 72, labelDy: 50, label: 15 },
    },
}

export const BANNER = { x: 8, y: 40, w: 259, h: 112, avatarX: 36, textX: 66, textW: 182 }

export const CHAT = {
    barH: 64,
    backX: 18,
    avatarX: 54,
    nameX: 82,
    listTop: 104,
    inputH: 64,
    camX: 34,
    pillX: 64,
    pillW: 150,
    sendX: 244,
    replyW: 251,
    replyH: 74,
    replyGap: 10,
    bubbleMaxW: 186,
    photoW: 132,
    photoH: 187,
}

export const CAMERA = { vfY: 32, vfH: 389, barY: 421, modeY: 446, shutterY: 514, shutterR: 36, thumbX: 50, flipX: 225 }

export const GALLERY = { photoY: 54, photoH: 389, barY: 452, buttons: [69, 206], buttonY: 518, buttonW: 124, buttonH: 112 }

export const LOCK = { clockY: 176, textY: 246 }

export const PHOTO = { w: 275, h: 389, res: 2 }

export const ZOOM = { max: 1.45, context: 190, pad: 28, small: 120 }

export const CITY = {
    road: 30,
    cols: [92, 206],
    rows: [196, 436],
    route: [
        { x: 92, y: 516 },
        { x: 92, y: 436 },
        { x: 206, y: 436 },
        { x: 206, y: 112 },
    ],
}

export const DEPTH = {
    bg: 0,
    night: 1,
    veil: 2,
    dim: 3,
    shadow: 9,
    person: 10,
    balloon: 14,
    chips: 16,
    phone: 20,
    screen: 21,
    screenUi: 23,
    banner: 25,
    hand: 27,
    ring: 30,
    fly: 40,
    header: 50,
    hud: 52,
    flash: 60,
}
