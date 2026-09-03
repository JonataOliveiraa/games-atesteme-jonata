import type { Point } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    field: 0,
    paint: 4,
    spot: 8,
    box: 14,
    line: 18,
    person: 24,
    board: 60,
    hud: 70,
    ball: 90,
    proof: 130,
    fx: 150,
    edge: 170,
    demo: 300,
    overlay: 400,
}

export const BOARD = { x: 12, y: 8, w: 1256, h: 138, r: 26 }

export const LEVEL_PILL = { x: 30, y: 26, w: 204, h: 40, r: 20 }

export const PHASES = { cx: 132, cy: 100, r: 13, gap: 40 }

export const NOTE = { x: 460, y: 77, art: 84 }

export const FLOW = { x: 762, y: 77 }

export const TO = { x: 1000, y: 77, size: 104 }

export const HELP = { x: 1212, y: 77, r: 32 }

export const COURT = { top: 156, bottom: 716 }

export const PERSON = { h: 210, ratio: 400 / 500 }

export const HOOK = { dx: 118, dy: -150 }

export const GOAL_HOOK = { dx: -98, dy: -122 }

export const BOX = { dx: -98, dy: -64, w: 138, h: 138 }

export const TOUCH = { w: 240, h: 250, dx: 0, dy: -105 }

export const TOUCH_GOAL = { w: 284, h: 250, dx: -42, dy: -105 }

export const MATES: Point[] = [
    { x: 250, y: 380 },
    { x: 250, y: 660 },
    { x: 610, y: 380 },
    { x: 610, y: 660 },
]

export const GOALS: Point[] = [
    { x: 1090, y: 400 },
    { x: 1090, y: 668 },
]

export const BALL = 86

export const hookOf = (foot: Point): Point => ({ x: foot.x + HOOK.dx, y: foot.y + HOOK.dy })

export const goalHookOf = (foot: Point): Point =>
    ({ x: foot.x + GOAL_HOOK.dx, y: foot.y + GOAL_HOOK.dy })

export const boxOf = (foot: Point): Point => ({ x: foot.x + BOX.dx, y: foot.y + BOX.dy })
