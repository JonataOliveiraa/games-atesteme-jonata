import type { MapDef } from '../types'

/**
 * Os mapas dos três níveis. Todos começam no mesmo planalto da catapulta (x 0–300, y 460) e são mais
 * largos que a tela: a criança arrasta para ver tudo. Os aparelhos ficam em pé em trechos planos (ou numa
 * tábua). Entre dois trechos de chão fica a boca de um túnel, na mesma altura dos dois lados: o arquivo
 * que cai nela anda por baixo da terra e sai rolando em `exit`.
 */

export const VALE: MapDef = {
    width: 2000,
    ground: [[[0, 460], [300, 460], [380, 520], [1200, 520], [1260, 500], [1720, 500], [1780, 480], [2000, 480]]],
    tunnels: [],
    devices: [
        { x: 1000, device: 'penDrive' },
        { x: 1450, device: 'hdInterno' },
        { x: 1890, device: 'hdInterno' },
    ],
    platforms: [{ x: 1660, y: 330, w: 160 }],
    springs: [{ x: 1580 }],
    clouds: [],
}

export const MESA: MapDef = {
    width: 2200,
    ground: [
        [[0, 460], [300, 460], [380, 540], [720, 540], [1060, 600], [1210, 600], [1290, 550], [1430, 550], [1500, 520], [1600, 520]],
        [[1700, 520], [1740, 520], [1800, 480], [2200, 480]],
    ],
    tunnels: [{ x0: 1600, x1: 1700, exit: 1360 }],
    devices: [
        { x: 640, device: 'cartao' },
        { x: 1150, device: 'hdInterno' },
        { x: 1950, device: 'hdExterno' },
    ],
    platforms: [{ x: 1850, y: 340, w: 160 }],
    springs: [{ x: 2120 }],
    clouds: [{ x: 2050, y: 130, sway: 40 }],
}

export const CANION: MapDef = {
    width: 2400,
    ground: [
        [[0, 460], [300, 460], [380, 560], [560, 560], [620, 540], [900, 540]],
        [[1000, 540], [1210, 540], [1350, 550], [1490, 550], [1560, 600], [1740, 600], [2000, 520], [2400, 520]],
    ],
    tunnels: [{ x0: 900, x1: 1000, exit: 1420 }],
    devices: [
        { x: 760, device: 'hdInterno' },
        { x: 1110, device: 'hdInterno' },
        { x: 1650, device: 'cartao' },
    ],
    platforms: [{ x: 1300, y: 400, w: 200 }],
    springs: [{ x: 470 }],
    clouds: [{ x: 1300, y: 220, sway: 50 }],
}

export const SERRA: MapDef = {
    width: 2600,
    ground: [
        [[0, 460], [300, 460], [400, 540], [780, 540], [860, 550], [900, 550]],
        [[1000, 550], [1040, 550], [1120, 520], [1400, 520], [1530, 550], [1670, 550], [1900, 600], [2240, 600], [2400, 500], [2600, 500]],
    ],
    tunnels: [{ x0: 900, x1: 1000, exit: 1600 }],
    devices: [
        { x: 540, device: 'penDrive' },
        { x: 1250, device: 'hdExterno' },
        { x: 1990, device: 'hdInterno' },
    ],
    platforms: [{ x: 1700, y: 380, w: 180 }],
    springs: [{ x: 1500 }],
    clouds: [{ x: 900, y: 110, sway: 50 }],
}

export const DUNA: MapDef = {
    width: 2400,
    ground: [
        [[0, 460], [300, 460], [380, 540], [800, 540], [860, 500], [1100, 500]],
        [[1200, 500], [1240, 500], [1290, 520], [1520, 520], [1590, 470], [1730, 470], [1860, 500], [1900, 500]],
        [[2000, 500], [2400, 500]],
    ],
    tunnels: [
        { x0: 1100, x1: 1200, exit: 1660 },
        { x0: 1900, x1: 2000, exit: 2210 },
    ],
    devices: [
        { x: 620, device: 'hdInterno' },
        { x: 980, device: 'penDrive' },
        { x: 1420, device: 'hdInterno' },
        { x: 2320, device: 'hdExterno' },
    ],
    platforms: [{ x: 1800, y: 320, w: 160 }],
    springs: [{ x: 760 }],
    clouds: [{ x: 1500, y: 100, sway: 50 }],
}

export const PIER: MapDef = {
    width: 2600,
    ground: [
        [[0, 460], [300, 460], [380, 540], [760, 540]],
        [[860, 540], [900, 540], [960, 500], [1700, 500], [1760, 540], [1960, 540], [2010, 500], [2150, 500], [2200, 480], [2600, 480]],
    ],
    tunnels: [{ x0: 760, x1: 860, exit: 2080 }],
    devices: [
        { x: 580, device: 'cartao' },
        { x: 1030, device: 'hdInterno' },
        { x: 1550, device: 'penDrive' },
        { x: 2500, device: 'hdExterno' },
    ],
    platforms: [{ x: 1250, y: 400, w: 200 }],
    springs: [{ x: 2300 }],
    clouds: [
        { x: 1250, y: 230, sway: 50 },
        { x: 2420, y: 170, sway: 20 },
    ],
}

export const FAROL: MapDef = {
    width: 2800,
    ground: [
        [[0, 460], [300, 460], [380, 540], [800, 540], [860, 500], [1200, 500]],
        [[1300, 500], [1340, 500], [1400, 540], [1740, 540], [1810, 490], [2100, 490]],
        [[2200, 490], [2240, 490], [2300, 520], [2800, 520]],
    ],
    tunnels: [
        { x0: 1200, x1: 1300, exit: 1880 },
        { x0: 2100, x1: 2200, exit: 2420 },
    ],
    devices: [
        { x: 620, device: 'hdInterno' },
        { x: 1050, device: 'cartao' },
        { x: 1600, device: 'hdInterno' },
        { x: 2550, device: 'penDrive' },
    ],
    platforms: [{ x: 2400, y: 360, w: 160 }],
    springs: [{ x: 1420 }],
    clouds: [{ x: 1900, y: 100, sway: 50 }],
}

export const RECIFE: MapDef = {
    width: 3000,
    ground: [
        [[0, 460], [300, 460], [380, 540], [800, 540]],
        [[900, 540], [940, 540], [1000, 500], [1200, 500], [1260, 540], [1700, 540], [1760, 500], [2100, 500], [2280, 520], [2380, 550], [2520, 550], [2680, 600], [2860, 600], [3000, 520]],
    ],
    tunnels: [{ x0: 800, x1: 900, exit: 2450 }],
    devices: [
        { x: 620, device: 'penDrive' },
        { x: 1080, device: 'hdExterno' },
        { x: 1530, device: 'cartao' },
        { x: 2770, device: 'hdInterno' },
    ],
    platforms: [{ x: 2550, y: 400, w: 180 }],
    springs: [{ x: 1850 }],
    clouds: [
        { x: 900, y: 110, sway: 40 },
        { x: 2300, y: 100, sway: 40 },
    ],
}

export const PICO: MapDef = {
    width: 2600,
    ground: [
        [[0, 460], [300, 460], [380, 540], [800, 540], [860, 500], [1200, 500]],
        [[1300, 500], [1340, 500], [1400, 540], [1760, 540], [1820, 480], [2600, 480]],
    ],
    tunnels: [{ x0: 1200, x1: 1300, exit: 1520 }],
    devices: [
        { x: 620, device: 'hdInterno' },
        { x: 1050, device: 'penDrive' },
        { x: 1980, device: 'cartao' },
    ],
    platforms: [{ x: 1500, y: 330, w: 160 }],
    springs: [{ x: 1720 }],
    clouds: [{ x: 1800, y: 180, sway: 40 }],
}

export const GRUTA: MapDef = {
    width: 2800,
    ground: [
        [[0, 460], [300, 460], [380, 540], [800, 540]],
        [[900, 540], [940, 540], [1000, 520], [1460, 520], [1520, 540], [1880, 540], [1960, 480], [2800, 480]],
    ],
    tunnels: [{ x0: 800, x1: 900, exit: 2420 }],
    devices: [
        { x: 620, device: 'hdInterno' },
        { x: 1050, device: 'hdExterno', on: 0 },
        { x: 1680, device: 'hdInterno' },
        { x: 2600, device: 'penDrive' },
    ],
    platforms: [{ x: 1050, y: 380, w: 200 }],
    springs: [{ x: 1240 }],
    clouds: [{ x: 1900, y: 100, sway: 50 }],
}

export const TRILHA: MapDef = {
    width: 2800,
    ground: [
        [[0, 460], [300, 460], [380, 540], [800, 540], [860, 500], [1200, 500]],
        [[1300, 500], [1340, 500], [1400, 520], [1510, 550], [1650, 550], [1820, 600], [2000, 600], [2100, 520], [2200, 520]],
        [[2300, 520], [2340, 520], [2400, 480], [2800, 480]],
    ],
    tunnels: [
        { x0: 1200, x1: 1300, exit: 1580 },
        { x0: 2200, x1: 2300, exit: 2520 },
    ],
    devices: [
        { x: 620, device: 'cartao' },
        { x: 1050, device: 'penDrive' },
        { x: 1910, device: 'hdInterno' },
        { x: 2660, device: 'hdExterno' },
    ],
    platforms: [{ x: 1700, y: 400, w: 180 }],
    springs: [{ x: 2150 }],
    clouds: [{ x: 1400, y: 100, sway: 50 }],
}

export const CUME: MapDef = {
    width: 3000,
    ground: [
        [[0, 460], [300, 460], [380, 540], [800, 540], [860, 500], [1200, 500]],
        [[1300, 500], [1340, 500], [1400, 540], [1880, 540], [1960, 480], [2300, 480]],
        [[2400, 480], [2440, 480], [2500, 520], [3000, 520]],
    ],
    tunnels: [
        { x0: 1200, x1: 1300, exit: 2100 },
        { x0: 2300, x1: 2400, exit: 2620 },
    ],
    devices: [
        { x: 620, device: 'hdInterno' },
        { x: 1700, device: 'cartao' },
        { x: 2760, device: 'hdInterno' },
    ],
    platforms: [{ x: 1500, y: 360, w: 180 }],
    springs: [{ x: 2150 }],
    clouds: [
        { x: 1000, y: 100, sway: 40 },
        { x: 2250, y: 110, sway: 40 },
    ],
}
