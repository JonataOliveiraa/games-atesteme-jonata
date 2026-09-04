export const C = {
    ink: 0x1f2a37,
    inkSoft: 0x4a5a70,
    white: 0xffffff,

    cream: 0xfff6e4,
    creamDeep: 0xffe7bd,
    creamEdge: 0xd9b884,

    wood: 0xa9663b,
    woodDark: 0x71401f,
    woodLight: 0xc78551,

    sweeper: 0x35d07f,
    sweeperDark: 0x1f8e56,
    drone: 0x4da3ff,
    droneDark: 0x2a6fc4,
    oven: 0xf59e0b,
    ovenDark: 0xb46b00,
    ovenLight: 0xfacc15,

    sand: 0xf2dda6,
    sandDark: 0xd9be82,
    stone: 0xdedbd2,
    stoneDark: 0xb6b2a6,
    grass: 0x8bc6b0,
    roofRed: 0xf06a6a,
    roofDark: 0xc94f4f,

    leafA: 0xe2903a,
    leafB: 0xd4643a,
    leafC: 0xc9a227,

    doughRaw: 0xf1e2bf,
    doughBaked: 0xd08b3f,

    cmdSweep: 0x2dd4bf,
    cmdTurn: 0xa78bfa,
    cmdFly: 0x60a5fa,
    cmdDrop: 0x38bdf8,
    cmdBake: 0xf97316,
    cmdBeep: 0xfacc15,

    ok: 0x4ecb63,
    okDark: 0x2b8a44,
    bad: 0xf2685c,
    badDark: 0xc03b30,

    grey: 0xa8b0bd,
    greyDark: 0x6f7b8c,

    shadow: 0x000000,
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const SIZE = {
    level: '26px',
    askLabel: '40px',
    toast: '30px',
    catalogName: '26px',
}

export const hex = (value: number) => '#' + value.toString(16).padStart(6, '0')

export const CSS = {
    ink: hex(C.ink),
    inkSoft: hex(C.inkSoft),
    white: hex(C.white),
    cream: hex(C.cream),
}
