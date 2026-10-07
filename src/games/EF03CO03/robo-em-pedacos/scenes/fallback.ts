import Phaser from 'phaser'
import { BG, MOD_CELL, MODULES, NINA, NINA_CELL, POINT_CELL, POINTS } from '../data/files'
import { H, LIFT, W } from '../data/layout'
import { C } from '../data/theme'
import type { PointType } from '../types'

export type G = Phaser.GameObjects.Graphics

export function bake(scene: Phaser.Scene, key: string, w: number, h: number, cell: { w: number; h: number } | null, paint: (g: G, i: number) => void) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    const cols = cell ? Math.floor(w / cell.w) : 1
    const rows = cell ? Math.floor(h / cell.h) : 1
    for (let i = 0; i < cols * rows; i++) {
        g.save()
        if (cell) g.translateCanvas((i % cols) * cell.w, Math.floor(i / cols) * cell.h)
        paint(g, i)
        g.restore()
    }
    g.generateTexture(key, w, h)
    g.destroy()
    const texture = scene.textures.get(key)
    if (cell) for (let i = 0; i < cols * rows; i++) texture.add(i, 0, (i % cols) * cell.w, Math.floor(i / cols) * cell.h, cell.w, cell.h)
    ;(texture.customData as { fallback?: boolean }).fallback = true
}

export function ensureArt(scene: Phaser.Scene) {
    if (!scene.textures.exists(BG)) bake(scene, BG, W, H, null, workshop)
    if (!scene.textures.exists(MODULES)) bake(scene, MODULES, MOD_CELL * 4, MOD_CELL * 3, { w: MOD_CELL, h: MOD_CELL }, (g, i) => MODULE_PAINT[i]?.(g))
    if (!scene.textures.exists(POINTS)) bake(scene, POINTS, POINT_CELL * 4, POINT_CELL * 4, { w: POINT_CELL, h: POINT_CELL }, (g, i) => paintPoint(g, i))
    if (!scene.textures.exists(NINA)) bake(scene, NINA, NINA_CELL.w * 4, NINA_CELL.h, { w: NINA_CELL.w, h: NINA_CELL.h }, (g, i) => paintNina(g, i))
}

const box = (g: G, x: number, y: number, w: number, h: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

const dot = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillCircle(x, y, r)
}

const capsule = (g: G, x1: number, y1: number, x2: number, y2: number, width: number, color: number) => {
    g.lineStyle(width, color, 1)
    g.lineBetween(x1, y1, x2, y2)
    dot(g, x1, y1, width / 2, color)
    dot(g, x2, y2, width / 2, color)
}

const turn = (g: G, x: number, y: number, angle: number, paint: () => void) => {
    g.save()
    g.translateCanvas(x, y)
    g.rotateCanvas(angle)
    g.translateCanvas(-x, -y)
    paint()
    g.restore()
}

function workshop(g: G) {
    const floor = 590
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, W, floor)
    box(g, 40, 60, W - 80, 470, 48, C.panel)
    box(g, 70, 96, 440, 170, 24, C.wood)
    for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) dot(g, 96 + c * 32, 118 + r * 36, 4, C.woodDark)
    capsule(g, 120, 140, 120, 230, 14, C.greyDark)
    dot(g, 120, 136, 18, C.greyDark)
    capsule(g, 190, 130, 190, 230, 10, C.greyDark)
    box(g, 178, 196, 24, 44, 8, C.red)
    capsule(g, 260, 150, 300, 230, 12, C.greyDark)
    capsule(g, 300, 150, 260, 230, 12, C.greyDark)
    capsule(g, 370, 128, 370, 236, 16, C.greyDark)
    box(g, 350, 120, 40, 30, 10, C.greyDark)
    dot(g, 450, 180, 34, C.yellow, 0.8)
    dot(g, 450, 180, 12, C.wall)
    box(g, 760, 150, 470, 18, 9, C.woodDark)
    box(g, 790, 98, 80, 52, 14, C.orange, 0.85)
    box(g, 890, 114, 64, 36, 12, C.blue, 0.75)
    box(g, 980, 86, 100, 64, 16, C.purple, 0.75)
    dot(g, 1150, 124, 26, C.yellow, 0.8)
    dot(g, 1150, 124, 9, C.wall)
    g.fillStyle(C.floor, 1)
    g.fillRect(0, floor, W, H - floor)
    g.fillStyle(C.floorDark, 1)
    g.fillRect(0, floor, W, 8)
    box(g, LIFT.left + 40, LIFT.top + 30, 40, 70, 10, C.piston)
    box(g, LIFT.right - 80, LIFT.top + 30, 40, 70, 10, C.piston)
    box(g, LIFT.left, LIFT.top, LIFT.right - LIFT.left, 46, 18, C.lift)
    box(g, LIFT.left + 20, LIFT.top + 18, LIFT.right - LIFT.left - 40, 20, 10, C.liftDark)
}

interface Tone {
    plate: number
    dark: number
    accent: number
    joint: number
    screen: number
    on: boolean
}

const tone = (on: boolean): Tone =>
    on
        ? { plate: C.blue, dark: C.blueDark, accent: C.yellow, joint: C.grey, screen: C.graphite, on }
        : { plate: C.off, dark: C.offDark, accent: C.offDark, joint: C.offDark, screen: C.offScreen, on }

function legs(g: G, t: Tone) {
    box(g, 128, 186, 40, 118, 20, t.plate)
    box(g, 216, 186, 40, 118, 20, t.plate)
    box(g, 148, 186, 20, 118, 10, t.dark)
    box(g, 236, 186, 20, 118, 10, t.dark)
    box(g, 112, 168, 160, 30, 15, t.joint)
    dot(g, 148, 252, 22, t.joint)
    dot(g, 236, 252, 22, t.joint)
    box(g, 110, 312, 76, 22, 11, C.graphite)
    box(g, 198, 312, 76, 22, 11, C.graphite)
}

function body(g: G, t: Tone) {
    box(g, 132, 298, 120, 34, 16, t.joint)
    box(g, 162, 128, 60, 26, 12, t.joint)
    box(g, 102, 146, 180, 160, 40, t.plate)
    box(g, 216, 160, 52, 132, 26, t.dark)
    dot(g, 102, 180, 18, t.joint)
    dot(g, 282, 180, 18, t.joint)
    box(g, 140, 172, 70, 40, 14, t.dark)
    dot(g, 192, 250, 22, t.accent)
}

function head(g: G, t: Tone) {
    box(g, 168, 296, 48, 36, 14, t.joint)
    capsule(g, 192, 116, 192, 156, 12, t.joint)
    dot(g, 192, 108, 14, t.accent)
    box(g, 92, 150, 200, 156, 44, t.plate)
    box(g, 230, 160, 52, 136, 26, t.dark)
    box(g, 116, 176, 152, 106, 28, t.screen)
    if (t.on) {
        ;[158, 226].forEach(x => {
            box(g, x - 17, 202, 34, 38, 12, C.white)
            dot(g, x + 2, 224, 11, 0x111111)
            dot(g, x - 2, 218, 3, C.white)
        })
        capsule(g, 176, 262, 208, 262, 8, C.white)
    }
    dot(g, 262, 196, 14, t.accent)
}

function arms(g: G, t: Tone) {
    box(g, 60, 140, 264, 26, 13, t.joint)
    box(g, 52, 150, 40, 92, 20, t.plate)
    box(g, 292, 150, 40, 92, 20, t.plate)
    dot(g, 72, 266, 20, t.plate)
    dot(g, 312, 266, 20, t.plate)
    box(g, 84, 252, 14, 18, 7, t.plate)
    box(g, 286, 252, 14, 18, 7, t.plate)
}

function shoes(g: G, t: Tone) {
    box(g, 66, 214, 118, 80, 30, t.plate)
    box(g, 200, 214, 118, 80, 30, t.plate)
    box(g, 100, 200, 50, 20, 10, t.joint)
    box(g, 234, 200, 50, 20, 10, t.joint)
    dot(g, 66, 262, 16, t.dark)
    dot(g, 200, 262, 16, t.dark)
    if (t.on) {
        box(g, 18, 254, 38, 16, 8, C.orange)
        box(g, 152, 254, 38, 16, 8, C.orange)
    }
}

function plug(g: G, on: boolean) {
    box(g, 117, 102, 150, 180, 26, C.grey)
    box(g, 130, 114, 124, 156, 20, C.greyDark)
    dot(g, 192, 196, 48, on ? C.yellow : C.offDark)
    dot(g, 192, 196, 30, on ? C.yellowDark : C.offScreen)
    dot(g, 238, 132, 9, on ? C.mint : C.graphite)
}

const MODULE_PAINT: Record<number, (g: G) => void> = {
    0: g => head(g, tone(false)),
    1: g => body(g, tone(false)),
    2: g => arms(g, tone(false)),
    3: g => legs(g, tone(false)),
    4: g => head(g, tone(true)),
    5: g => body(g, tone(true)),
    6: g => arms(g, tone(true)),
    7: g => legs(g, tone(true)),
    8: g => shoes(g, tone(false)),
    9: g => shoes(g, tone(true)),
    10: g => plug(g, false),
    11: g => plug(g, true),
}

const POINT_TYPES: PointType[] = ['screw', 'wire', 'spring', 'gear', 'antenna', 'bulb', 'button', 'eye']

function paintPoint(g: G, i: number) {
    const type = POINT_TYPES[Math.floor(i / 2)]
    const loose = i % 2 === 0
    if (type) POINT_PAINT[type](g, loose)
}

const POINT_PAINT: Record<PointType, (g: G, loose: boolean) => void> = {
    screw(g, loose) {
        dot(g, 96, 118, 26, C.graphite)
        if (!loose) {
            dot(g, 96, 118, 30, C.grey)
            capsule(g, 80, 118, 112, 118, 8, C.greyDark)
            return
        }
        turn(g, 96, 118, 0.55, () => {
            box(g, 86, 52, 20, 66, 6, C.greyDark)
            for (let k = 0; k < 4; k++) box(g, 84, 60 + k * 14, 24, 5, 2, C.grey)
            dot(g, 96, 48, 30, C.grey)
            capsule(g, 80, 48, 112, 48, 8, C.greyDark)
        })
    },
    wire(g, loose) {
        box(g, 66, 120, 60, 40, 12, C.graphite)
        if (!loose) {
            capsule(g, 96, 20, 96, 104, 18, C.blue)
            box(g, 76, 100, 40, 34, 10, C.grey)
            return
        }
        g.lineStyle(18, C.blue, 1)
        g.beginPath()
        g.moveTo(96, 14)
        g.lineTo(104, 60)
        g.lineTo(130, 100)
        g.strokePath()
        dot(g, 96, 14, 9, C.blue)
        turn(g, 140, 128, -0.7, () => box(g, 120, 110, 40, 34, 10, C.grey))
    },
    spring(g, loose) {
        box(g, 52, 146, 88, 24, 12, C.graphite)
        const coil = () => {
            for (let k = 0; k < 6; k++) capsule(g, 74, 140 - k * 16, 118, 132 - k * 16, 9, C.yellow)
        }
        if (!loose) {
            coil()
            return
        }
        turn(g, 96, 150, 0.7, () => {
            g.save()
            g.translateCanvas(0, -30)
            coil()
            g.restore()
        })
    },
    gear(g, loose) {
        const gear = (x: number, y: number) => {
            for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2
                turn(g, x, y, a, () => box(g, x - 9, y - 50, 18, 20, 4, C.yellow))
            }
            dot(g, x, y, 38, C.yellow)
            dot(g, x, y, 13, C.yellowDark)
        }
        if (!loose) {
            gear(96, 100)
            dot(g, 96, 100, 9, C.graphite)
            return
        }
        dot(g, 96, 112, 10, C.graphite)
        turn(g, 122, 78, 0.4, () => gear(122, 78))
    },
    antenna(g, loose) {
        box(g, 72, 150, 48, 24, 10, C.graphite)
        const stick = () => {
            capsule(g, 96, 64, 96, 150, 12, C.grey)
            dot(g, 96, 52, 16, C.yellow)
        }
        if (!loose) stick()
        else turn(g, 96, 150, 1.1, stick)
    },
    bulb(g, loose) {
        box(g, 70, 136, 52, 36, 10, C.grey)
        const bulb = () => {
            box(g, 82, 112, 28, 28, 6, C.greyDark)
            dot(g, 96, 90, 30, C.yellow)
            dot(g, 86, 82, 8, C.white, 0.7)
        }
        if (!loose) bulb()
        else
            turn(g, 96, 136, 0.6, () => {
                g.save()
                g.translateCanvas(0, -26)
                bulb()
                g.restore()
            })
    },
    button(g, loose) {
        box(g, 46, 46, 100, 100, 22, C.greyDark)
        if (!loose) {
            dot(g, 96, 96, 30, C.yellow)
            return
        }
        turn(g, 96, 96, 0.5, () => {
            box(g, 74, 50, 44, 40, 12, C.yellowDark)
            dot(g, 108, 54, 30, C.yellow)
        })
    },
    eye(g, loose) {
        dot(g, 96, 100, 36, C.graphite)
        if (!loose) {
            dot(g, 96, 100, 42, C.grey)
            dot(g, 128, 100, 8, C.greyDark)
            return
        }
        turn(g, 54, 100, -0.9, () => {
            g.fillStyle(C.grey, 1)
            g.fillEllipse(80, 100, 52, 84)
            dot(g, 98, 100, 7, C.greyDark)
        })
    },
}

function paintNina(g: G, pose: number) {
    const cx = 180
    const foot = 490
    const skin = C.skin
    box(g, cx - 66, foot - 18, 52, 22, 11, C.yellow)
    box(g, cx + 14, foot - 18, 52, 22, 11, C.yellow)
    box(g, cx - 46, foot - 150, 34, 120, 17, C.orange)
    box(g, cx + 12, foot - 150, 34, 120, 17, C.orange)
    box(g, cx - 70, foot - 300, 140, 170, 34, C.orange)
    box(g, cx - 40, foot - 300, 80, 46, 14, C.grey)
    box(g, cx + 20, foot - 250, 40, 110, 18, C.orangeDark)
    const hand = (x: number, y: number) => dot(g, x, y, 20, skin)
    const arm = (x1: number, y1: number, x2: number, y2: number) => capsule(g, x1, y1, x2, y2, 30, C.grey)
    const wrench = (x: number, y: number, a: number) =>
        turn(g, x, y, a, () => {
            box(g, x - 8, y - 80, 16, 80, 8, C.greyDark)
            dot(g, x, y - 88, 20, C.greyDark)
            dot(g, x, y - 100, 10, C.wall)
        })
    const headY = foot - 352
    dot(g, cx - 4, headY - 72, 34, C.hair)
    box(g, cx - 30, headY - 64, 52, 16, 8, C.purple)
    box(g, cx - 50, headY - 52, 104, 104, 34, skin)
    box(g, cx - 54, headY - 56, 110, 34, 17, C.hair)
    const eye = (x: number, wide: boolean) => {
        box(g, x - 13, headY - 12, 26, wide ? 34 : 28, 10, C.white)
        dot(g, x + 3, headY + 4, 9, 0x111111)
        dot(g, x, headY - 1, 3, C.white)
    }
    const scared = pose === 2
    eye(cx + 4, scared)
    eye(cx + 36, scared)
    if (pose === 0 || pose === 1) {
        box(g, cx + 6, headY + 28, 30, 18, 9, C.maroon)
    } else if (pose === 2) {
        dot(g, cx + 20, headY + 36, 8, C.maroon)
    } else {
        capsule(g, cx + 8, headY + 34, cx + 32, headY + 34, 7, C.maroon)
    }
    const sy = foot - 280
    if (pose === 0) {
        arm(cx - 60, sy, cx - 78, sy + 90)
        hand(cx - 80, sy + 120)
        arm(cx + 60, sy, cx + 140, sy - 30)
        hand(cx + 170, sy - 40)
    } else if (pose === 1) {
        arm(cx - 60, sy, cx - 100, sy + 70)
        hand(cx - 108, sy + 100)
        arm(cx + 60, sy, cx + 100, sy - 110)
        hand(cx + 106, sy - 140)
        wrench(cx + 106, sy - 150, 0.3)
        capsule(g, cx - 140, foot - 40, cx - 120, foot - 40, 8, C.ink)
        capsule(g, cx - 150, foot - 70, cx - 130, foot - 70, 8, C.ink)
    } else if (pose === 2) {
        arm(cx - 60, sy, cx - 56, headY + 70)
        hand(cx - 50, headY + 30)
        arm(cx + 60, sy, cx + 76, headY + 70)
        hand(cx + 74, headY + 30)
    } else {
        arm(cx - 60, sy, cx - 84, sy + 90)
        hand(cx - 74, sy + 116)
        arm(cx + 60, sy, cx + 84, sy - 40)
        hand(cx + 74, sy - 66)
        wrench(cx + 74, sy - 70, -0.5)
    }
}

