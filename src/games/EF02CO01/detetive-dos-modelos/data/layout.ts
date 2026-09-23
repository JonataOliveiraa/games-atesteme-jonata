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

/** O header é uma barra reta de ponta a ponta: nível, bolinhas das fases e a ajuda. */
export const HUD = {
    bar: { h: 64 },
    pipCy: 32,
    dotR: 10,
    dotGap: 28,
    groupGap: 20,
    help: { x: 1236, y: 32, r: 24 },
}

export const ZONES = {
    top: 80,
    cy: 236,
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

/** O prato de exposição: centro da imagem e largura em tela. */
export const PEDESTAL = { y: 533, w: 310 }

export const DETECTIVE = { x: 150, y: 500, size: 240 }

/**
 * O balão da detetive mora no vão entre ela e o pedestal, e nunca sai dele:
 * à esquerda o rosto dela, à direita o veículo (o pedestal começa em x 485),
 * em cima os cartões (acabam em y 383), embaixo o álbum. Por isso ele é
 * estreito e cresce para baixo, com o pictograma EM CIMA da frase, e não ao
 * lado. A ponta aponta sempre para a boca.
 */
export const BUBBLE = { left: 276, w: 206, cy: 484, minTop: 392, tailX: 232, tailY: 500 }

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
