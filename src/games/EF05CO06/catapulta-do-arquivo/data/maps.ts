import type { MapDef } from '../types'

/**
 * Os mapas do N1. Todos começam no mesmo planalto da catapulta (x 0–300, y 460) e são mais
 * largos que a tela: a criança arrasta para ver tudo. As bocas dos buracos ficam entre dois
 * trechos de chão, na mesma altura dos dois lados.
 */

export const VALE: MapDef = {
    width: 2000,
    ground: [
        [[0, 460], [300, 460], [420, 560], [620, 560]],
        [[720, 560], [860, 560], [940, 480], [1080, 480]],
        [[1180, 480], [1260, 480], [1340, 580], [1500, 580]],
        [[1600, 580], [1760, 580], [1860, 400], [2000, 400]],
    ],
    holes: [
        { x0: 620, x1: 720, device: 'hdInterno' },
        { x0: 1080, x1: 1180, device: 'penDrive' },
        { x0: 1500, x1: 1600, device: 'hdInterno' },
    ],
    platforms: [{ x: 1300, y: 360, w: 200 }],
    springs: [{ x: 820 }],
    clouds: [{ x: 1380, y: 190, sway: 60 }],
}

export const MESA: MapDef = {
    width: 2200,
    ground: [
        [[0, 460], [300, 460], [400, 540], [560, 540]],
        [[660, 540], [760, 540], [800, 500], [1000, 500], [1040, 540], [1140, 540]],
        [[1240, 540], [1340, 540], [1420, 430], [1620, 470]],
        [[1730, 470], [1820, 430], [1880, 560], [2060, 560], [2160, 380], [2200, 380]],
    ],
    holes: [
        { x0: 560, x1: 660, device: 'cartao' },
        { x0: 1140, x1: 1240, device: 'hdExterno' },
        { x0: 1620, x1: 1730, device: 'hdInterno' },
    ],
    platforms: [{ x: 1500, y: 300, w: 160 }],
    springs: [{ x: 1290 }],
    clouds: [{ x: 640, y: 150, sway: 40 }],
}

export const CANION: MapDef = {
    width: 2400,
    ground: [
        [[0, 460], [300, 460], [380, 600], [520, 600]],
        [[620, 600], [700, 600], [780, 520], [900, 520]],
        [[1000, 520], [1100, 520], [1200, 620], [1400, 620]],
        [[1500, 620], [1600, 620], [1700, 460], [1900, 460]],
        [[2000, 460], [2200, 460], [2300, 300], [2400, 300]],
    ],
    holes: [
        { x0: 520, x1: 620, device: 'hdInterno' },
        { x0: 900, x1: 1000, device: 'hdInterno' },
        { x0: 1400, x1: 1500, device: 'cartao' },
        { x0: 1900, x1: 2000, device: 'penDrive' },
    ],
    platforms: [
        { x: 1150, y: 390, w: 220 },
        { x: 1640, y: 300, w: 160 },
    ],
    springs: [{ x: 660 }],
    clouds: [{ x: 2060, y: 180, sway: 70 }],
}

export const SERRA: MapDef = {
    width: 2600,
    ground: [
        [[0, 460], [300, 460], [420, 560], [600, 560]],
        [[700, 560], [820, 560], [900, 440], [1000, 440]],
        [[1100, 440], [1200, 440], [1300, 600], [1700, 600]],
        [[1800, 600], [1900, 600], [1980, 500], [2110, 540]],
        [[2230, 540], [2400, 490], [2480, 340], [2600, 340]],
    ],
    holes: [
        { x0: 600, x1: 700, device: 'penDrive' },
        { x0: 1000, x1: 1100, device: 'hdExterno' },
        { x0: 1700, x1: 1800, device: 'cartao' },
        { x0: 2110, x1: 2230, device: 'hdInterno' },
    ],
    platforms: [
        { x: 1420, y: 420, w: 200 },
        { x: 1600, y: 300, w: 160 },
    ],
    springs: [{ x: 760 }, { x: 1360 }],
    clouds: [
        { x: 460, y: 140, sway: 40 },
        { x: 960, y: 120, sway: 60 },
    ],
}
