import type { Rect, Slot, Tool } from '../types'
import { PILOT_CELL, SHIP_CELL } from './files'

export const W = 1280
export const H = 720

export const DEPTH = {
    ground: 0,
    scenery: 2,
    clouds: 4,
    reach: 8,
    things: 10,
    ship: 20,
    fx: 30,
    controls: 40,
    pilot: 60,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 196,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

export const FLIGHT = { left: 380, right: 900 } as const
export const RIVER = { x: 95, swing: 30, half: 50 } as const

export const SIDES = {
    left: { from: RIVER.x + RIVER.swing + RIVER.half + 35, to: FLIGHT.left - 30 },
    right: { from: FLIGHT.right + 40, to: 1250 },
} as const

export const SLOTS = [450, 545, 640, 735, 830] as const
export const slotX = (slot: Slot) => SLOTS[slot]

export const SHIP_VIEW = {
    x: 640,
    y: 585,
    scale: 0.4,
    speed: 460,
    bob: 4,
    minX: 340,
    maxX: 940,
    minY: 330,
    maxY: 615,
} as const

export const NOSE = (SHIP_CELL.cy - SHIP_CELL.noseY) * SHIP_VIEW.scale
export const TAIL = (SHIP_CELL.tailY - SHIP_CELL.cy) * SHIP_VIEW.scale

export const REACH = {
    len: 230,
    near: 38,
    far: 72,
    hitX: 62,
    lockAhead: 240,
} as const

export const THING_VIEW = {
    scale: 0.5,
    half: 72,
    spawnY: -140,
    exitY: 880,
} as const

export const JOYSTICK = {
    x: 150,
    y: 580,
    r: 92,
    knob: 46,
    grab: 170,
    dead: 0.15,
} as const

export const TOOL_BUTTONS = {
    x: 1180,
    y: { blower: 390, water: 520, pull: 650 } as Record<Tool, number>,
    r: 56,
    hit: 122,
    icon: 0.34,
} as const

export const JOYSTICK_RECT: Rect = { x: JOYSTICK.x, y: JOYSTICK.y, w: JOYSTICK.r * 2 + 40, h: JOYSTICK.r * 2 + 40 }

export const toolRect = (tool: Tool): Rect => ({ x: TOOL_BUTTONS.x, y: TOOL_BUTTONS.y[tool], w: TOOL_BUTTONS.hit + 8, h: TOOL_BUTTONS.hit + 8 })

export const TOOLS_RECT: Rect = {
    x: TOOL_BUTTONS.x,
    y: (TOOL_BUTTONS.y.blower + TOOL_BUTTONS.y.pull) / 2,
    w: TOOL_BUTTONS.hit + 20,
    h: TOOL_BUTTONS.y.pull - TOOL_BUTTONS.y.blower + TOOL_BUTTONS.hit + 20,
}

export const reachRect = (x: number, y: number): Rect => {
    const nose = y - NOSE
    return { x, y: nose - REACH.len / 2, w: REACH.far * 2 + 30, h: REACH.len + 40 }
}

export const thingRect = (x: number, y: number): Rect => ({ x, y, w: 210, h: 210 })

export const PILOT_VIEW = {
    x: 250,
    y: 470,
    scale: 0.8,
} as const

export const pilotRect = (): Rect => {
    const top = PILOT_VIEW.y + (PILOT_CELL.top - PILOT_CELL.h / 2) * PILOT_VIEW.scale
    const bottom = PILOT_VIEW.y + (PILOT_CELL.bottom - PILOT_CELL.h / 2) * PILOT_VIEW.scale
    return { x: PILOT_VIEW.x + 10, y: (top + bottom) / 2, w: PILOT_CELL.width * PILOT_VIEW.scale + 20, h: bottom - top + 20 }
}

export const SIGN = {
    x: 14,
    y: 100,
    w: 282,
    row: 76,
    pad: 12,
    countX: 44,
    iconX: 108,
    icon: 74,
    toolR: 27,
    nameX: 146,
    big: 1.15,
    bigX: W / 2,
    bigY: 282,
} as const

export const PARADE_X = 1010
export const DEMO_Y = 120
