export interface Feel {
    gravity: number
    jump: number
    accel: number
    brake: number
}

export const PHYS = {
    run: 520,
    maxFall: 1500,
} as const

export const EARTH: Feel = { gravity: 1900, jump: 240, accel: 3400, brake: 3000 }

export const SPACE: Feel = { gravity: 820, jump: 300, accel: 2300, brake: 1700 }

export const SPACE_BAND = { from: 1.6, to: 1.74 } as const

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function spaceAmount(alt: number) {
    const t = Math.min(1, Math.max(0, (alt - SPACE_BAND.from) / (SPACE_BAND.to - SPACE_BAND.from)))
    return t * t * (3 - 2 * t)
}

export function feelAt(alt: number): Feel {
    const t = spaceAmount(alt)
    return {
        gravity: lerp(EARTH.gravity, SPACE.gravity, t),
        jump: lerp(EARTH.jump, SPACE.jump, t),
        accel: lerp(EARTH.accel, SPACE.accel, t),
        brake: lerp(EARTH.brake, SPACE.brake, t),
    }
}

export const speedFor = (feel: Feel) => Math.sqrt(2 * feel.gravity * feel.jump)

export const PHONE = {
    w: 72,
    h: 110,
    foot: 30,
    display: 150,
} as const

export const CHECK = { w: 250 } as const

export const SUMMIT = { w: 460 } as const
