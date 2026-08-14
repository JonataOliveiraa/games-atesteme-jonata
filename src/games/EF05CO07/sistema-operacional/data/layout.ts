export const W = 1280
export const H = 720

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface Point {
    x: number
    y: number
}

export const cx = (rect: Rect): number => rect.x + rect.w / 2
export const cy = (rect: Rect): number => rect.y + rect.h / 2

export const SPACE = {
    unit: 8,
    outer: 32,
    region: 16,
} as const

export const MIN_TOUCH_SIZE = 64

export const HUD: Rect = { x: 24, y: 14, w: 1232, h: 72 }
export const MAIN_PANEL: Rect = { x: 24, y: 100, w: 1232, h: 602 }
export const QUEUE: Rect = { x: 40, y: 116, w: 320, h: 570 }
export const DECISION: Rect = { x: 392, y: 116, w: 848, h: 570 }
export const DIVIDER: Rect = { x: 376, y: 124, w: 2, h: 554 }

export const QUEUE_VIEWPORT: Rect = { x: 56, y: 174, w: 288, h: 430 }
export const QUEUE_CARD_HEIGHT = 126
export const QUEUE_CARD_GAP = 16

export const QUEUE_FOOTER: Rect = { x: 56, y: 626, w: 288, h: 36 }

export const CURRENT_REQUEST: Rect = { x: 416, y: 158, w: 800, h: 116 }

const RESOURCE_CARD_W = 252
const RESOURCE_CARD_H = 122
const RESOURCE_GAP_X = 22
const RESOURCE_GAP_Y = 16
const RESOURCE_X = 416
const RESOURCE_Y = 332

export const RESOURCE_CARD_RECTS: Rect[] = Array.from({ length: 6 }, (_, index) => ({
    x: RESOURCE_X + (index % 3) * (RESOURCE_CARD_W + RESOURCE_GAP_X),
    y: RESOURCE_Y + Math.floor(index / 3) * (RESOURCE_CARD_H + RESOURCE_GAP_Y),
    w: RESOURCE_CARD_W,
    h: RESOURCE_CARD_H,
}))

export const DENY_BUTTON: Rect = { x: 946, y: 612, w: 270, h: 66 }
export const FEEDBACK_BAR: Rect = { x: 416, y: 604, w: 506, h: 68 }

export const MEMORY_BAR: Rect = { x: 416, y: 308, w: 800, h: 78 }
export const RUNNING_PROGRAMS: Rect = { x: 416, y: 426, w: 800, h: 158 }
export const MEMORY_ACTION: Rect = { x: 906, y: 610, w: 310, h: 68 }

export const CONFLICT_RULE: Rect = { x: 416, y: 146, w: 800, h: 84 }
export const CONFLICT_RESOURCE: Rect = { x: 416, y: 248, w: 800, h: 110 }
export const CONFLICT_ORDER: Rect = { x: 416, y: 378, w: 800, h: 206 }
export const UNDO_BUTTON: Rect = { x: 416, y: 612, w: 208, h: 66 }
export const CONFIRM_ORDER_BUTTON: Rect = { x: 914, y: 612, w: 302, h: 66 }

export const SYSTEM_QUESTION: Rect = { x: 416, y: 146, w: 800, h: 96 }

const SYSTEM_OPTION_W = 250
const SYSTEM_OPTION_GAP = 25

export const SYSTEM_OPTION_RECTS: Rect[] = Array.from({ length: 3 }, (_, index) => ({
    x: 416 + index * (SYSTEM_OPTION_W + SYSTEM_OPTION_GAP),
    y: 266,
    w: SYSTEM_OPTION_W,
    h: 318,
}))

export const TUTORIAL_RECTS = {
    queue: { x: 40, y: 116, w: 320, h: 570 },
    currentRequest: { x: 416, y: 158, w: 800, h: 116 },
    resources: { x: 416, y: 316, w: 800, h: 268 },
    stability: { x: 868, y: 14, w: 210, h: 72 },
    memory: { x: 416, y: 308, w: 800, h: 78 },
    runningPrograms: { x: 416, y: 426, w: 800, h: 158 },
    conflictRule: { x: 416, y: 146, w: 800, h: 84 },
    conflictOrder: { x: 416, y: 378, w: 800, h: 206 },
} satisfies Record<string, Rect>
