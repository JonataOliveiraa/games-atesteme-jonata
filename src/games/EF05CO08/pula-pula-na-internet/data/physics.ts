export const PHYS = {
    gravity: 1900,
    jump: 240,
    boost: 640,
    run: 520,
    accel: 3400,
    brake: 3000,
    maxFall: 1500,
} as const

export const PHONE = {
    w: 72,
    h: 110,
    foot: 30,
    display: 140,
} as const

export const CLOUD = {
    gap: 300,
    thick: 140,
    above: 70,
} as const

export const SUMMIT = { w: 460 } as const

export const CHECK = { w: 420 } as const

export const speedFor = (height: number) => Math.sqrt(2 * PHYS.gravity * height)
