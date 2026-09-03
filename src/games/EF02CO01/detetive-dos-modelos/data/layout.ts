export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    ground: 4,
    plate: 10,
    zone: 20,
    zoneArt: 24,
    zoneFace: 28,
    album: 46,
    detective: 52,
    hud: 70,
    vehicle: 90,
    fx: 140,
    lock: 160,
    overlay: 400,
}

export const HUD = {
    plate: { x: 12, y: 8, w: 1256, h: 68, r: 24 },
    pipCy: 42,
    dotR: 11,
    dotGap: 32,
    groupGap: 26,
    help: { x: 1214, y: 42, r: 30 },
}

export const ZONES = {
    top: 92,
    cy: 248,
    h: 250,
    gap: 24,
    wide: 336,
    narrow: 272,
}

export const MAT = {
    top: 398,
    bottom: 596,
    x: 640,
    y: 464,
    size: 136,
    nameY: 572,
    touchY: 472,
    touch: { w: 268, h: 168 },
}

export const DETECTIVE = { x: 146, y: 486, size: 196 }

export const ALBUM = {
    top: 600,
    cy: 652,
    w: 118,
    h: 84,
    gap: 18,
}

export const VEHICLE_FRAME = { w: 256, h: 256 }

export function zoneWidth(count: number) {
    return count > 3 ? ZONES.narrow : ZONES.wide
}

export function zoneX(index: number, count: number) {
    const w = zoneWidth(count)
    const total = count * w + (count - 1) * ZONES.gap
    return W / 2 - total / 2 + w / 2 + index * (w + ZONES.gap)
}

export function albumX(index: number, count: number) {
    const total = count * ALBUM.w + (count - 1) * ALBUM.gap
    return W / 2 - total / 2 + ALBUM.w / 2 + index * (ALBUM.w + ALBUM.gap)
}
