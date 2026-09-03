export const C = {
    ink: 0x1f2a37,
    inkSoft: 0x51637a,
    cream: 0xfff7e8,
    creamDeep: 0xffe9c2,
    creamEdge: 0xd9bd94,
    white: 0xffffff,

    ok: 0x4ecb63,
    okDark: 0x2b8a44,
    bad: 0xf2685c,
    badDark: 0xbf3a2f,
    warn: 0xffc42e,
    warnDark: 0xd39400,

    board: 0xbfe3f5,
    boardDeep: 0x93cbe6,

    sky: 0x63b8f5,
    skyDeep: 0x2f8ad4,
    road: 0x8b96a5,
    roadDeep: 0x5c6675,
    water: 0x38c6d9,
    waterDeep: 0x1b8ea3,
    rail: 0xb08155,
    railDeep: 0x7d5836,
    garage: 0x8fd67f,
    garageDeep: 0x4f9e46,
    plain: 0xc3cbd6,
    plainDeep: 0x8e99a8,

    dust: 0xefe3c8,
    dustDeep: 0xcfbe99,
}

export const CSS = {
    ink: '#1f2a37',
    inkSoft: '#51637a',
    cream: '#fff7e8',
    white: '#ffffff',
    ok: '#2b8a44',
    bad: '#bf3a2f',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const ZONE_COLOR: Record<string, { main: number; dark: number }> = {
    air: { main: C.sky, dark: C.skyDeep },
    land: { main: C.road, dark: C.roadDeep },
    water: { main: C.water, dark: C.waterDeep },
    rail: { main: C.rail, dark: C.railDeep },
    'motor-true': { main: C.warn, dark: C.warnDark },
    'motor-false': { main: C.garage, dark: C.garageDeep },
    'wheels-true': { main: C.warn, dark: C.warnDark },
    'wheels-false': { main: C.garage, dark: C.garageDeep },
    none: { main: C.plain, dark: C.plainDeep },
}
